import Joi from "joi";
import bcrypt from "bcryptjs";
import crypto from "crypto";
require('dotenv').config();

import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import status from "../../../../enum/status.js"

import userServices from "../../services/userServices.js";
import userModel from "../../../../models/user.js";
 
import commonFunction from "../../../../helper/util.js";
import userType from "../../../../enum/userType.js";
import productModel from "../../../../models/productModel.js";
import cartModel from "../../../../models/cartSchema.js";
import order from "../../../../models/orderModel.js";
// const Razorpay = require('razorpay');
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export class orderController {
/**
 * @swagger
 * /order/placeOrder:
 *   post:
 *     tags:
 *       - ORDER
 *     summary: Place a new order
 *     description: User places an order for products available in the cart.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: token
 *         description: Bearer token for authentication
 *         required: true
 *         type: string
 *       - in: body
 *         name: body
 *         description: Order details
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *             - flat
 *             - houseNumber
 *             - floor
 *             - area
 *             - sectorName
 *             - phoneNumber
 *             - productId
 *             - location
 *           properties:
 *             userId:
 *               type: string
 *               example: 653b7a12f5c3ab001f0a38c2
 *             flat:
 *               type: string
 *               example: A-501
 *             houseNumber:
 *               type: string
 *               example: 12B
 *             floor:
 *               type: string
 *               example: 5
 *             area:
 *               type: string
 *               example: Green Park
 *             sectorName:
 *               type: string
 *               example: Sector 45
 *             phoneNumber:
 *               type: string
 *               example: 9876543210
 *             productId:
 *               type: string
 *               example: 653b8f88a933bd001f0d8d8f
 *             location:
 *               type: object
 *               required:
 *                 - type
 *                 - coordinates
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [Point]
 *                   example: Point
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   minItems: 2
 *                   maxItems: 2
 *                   example: [77.5946, 12.9716]  # [longitude, latitude]
 *     responses:
 *       201:
 *         description: Order placed successfully. Proceed to payment.
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: Order placed. Proceed to payment.
 *             razorpay_order_id:
 *               type: string
 *               example: order_xyz123
 *             amount:
 *               type: number
 *               example: 120000
 *             currency:
 *               type: string
 *               example: INR
 *             key:
 *               type: string
 *               example: rzp_test_xyz
 *             orderId:
 *               type: string
 *               example: 654a12d0e52a22c8971e3f4f
 *             products:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: string
 *                     example: 653b8f88a933bd001f0d8d8f
 *                   name:
 *                     type: string
 *                     example: iPhone 14
 *                   quantity:
 *                     type: number
 *                     example: 1
 *                   price:
 *                     type: number
 *                     example: 80000
 *       400:
 *         description: Validation failed or bad request.
 *       401:
 *         description: Unauthorized or user not found.
 *       404:
 *         description: Cart not found or product not found.
 *       500:
 *         description: Internal server error.
 */
async placeOrder(req, res, next) {
  const orderSchema = Joi.object({
    userId: Joi.string().required(),
    flat: Joi.string().required(),
    houseNumber: Joi.string().required(),
    floor: Joi.string().required(),
    area: Joi.string().required(),
    sectorName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    productId: Joi.string().required(),
    location: Joi.object({
      type: Joi.string().valid("Point").required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    testingMode: Joi.boolean().optional()
  });

  try {
    const {
      userId, flat, houseNumber, floor, area, sectorName,
      phoneNumber, productId, location, testingMode = false
    } = await orderSchema.validateAsync(req.body);

    const userData = await userModel.findOne({
      _id: userId,
      userType: userType.USER,
      status: { $ne: status.DELETED }
    });

    if (!userData) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

    const product = await productModel.findById(productId);
    if (!product) throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);

    const quantity = 1;
    let totalAmount = product.productPrice * quantity;
    if (testingMode) totalAmount = 1; // Simulate ₹1.00

    const detailedProducts = [{
      productId: product._id,
      quantity,
      price: product.productPrice,
      itemTotal: product.productPrice * quantity
    }];

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: product.productName,
          },
          unit_amount: totalAmount * 100,
        },
        quantity,
      }],
      mode: 'payment',
      customer_email: userData.email,
      success_url: `https://yourdomain.com/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://yourdomain.com/payment/cancel`,
      metadata: {
        userId,
        productId: product._id.toString()
      }
    });
    console.log("Stripe session created:=================>>>>", session);

    const newOrder = new order({
      userId,
      address: { flat, houseNumber, floor, area, sector: sectorName },
      phoneNumber,
      products: detailedProducts,
      totalAmount,
      paymentStatus: 'pending',
      status: 'created',
      location,
      stripe_session_id: session.id
    });

    await newOrder.save();

    return res.status(201).send({
      success: true,
      message: 'Order placed successfully. Please complete payment.',
      payment_url: session.url,
      orderId: newOrder._id,
      stripe_session_id: session.id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: err.message || 'Something went wrong'
    });
  }
}
        

    

async webHook(req, res) {
  console.log(req.body);  
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log("Webhook secret:", endpointSecret);

  let event;

  try {
    const sig = req.headers['stripe-signature'];

    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      endpointSecret
    );
    console.log("=========================>>>",event);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        // ✅ Update order payment status
        await order.findOneAndUpdate(
          { stripe_session_id: session.id },
          { $set: { paymentStatus: 'paid' } }
        );
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        await order.findOneAndUpdate(
          { stripe_session_id: expiredSession.id },
          { $set: { paymentStatus: 'failed' } }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send({ received: true });

  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

}
export default new orderController();


//calm-crisp-dawn-serene