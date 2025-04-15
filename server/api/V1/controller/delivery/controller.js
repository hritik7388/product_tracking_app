import Joi from "joi";
import bcrypt from "bcryptjs";
import crypto from "crypto";
require('dotenv').config();

import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import status from "../../../../enum/status.js" 
import userModel from "../../../../models/user.js"; 
import userType from "../../../../enum/userType.js"; 
import order from "../../../../models/orderModel.js";
import deliveryModel from "../../../../models/deliveryModel.js";
import vehicleModel from "../../../../models/vehicleModel.js";


export class deliveryController {



/**
 * @swagger
 * /delivery/assignDeliveryPerson:
 *   post:
 *     tags:
 *       - DELIVERY
 *     summary: Assign a delivery person to an order
 *     description: Assign a delivery person and a vehicle to an order for delivery.
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
 *         description: Delivery assignment details
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - orderId
 *             - deliveryPersonId
 *             - vehicleId
 *           properties:
 *             orderId:
 *               type: string
 *               example: 653b7a12f5c3ab001f0a38c2
 *             deliveryPersonId:
 *               type: string
 *               example: 653b7a12f5c3ab001f0a38c2
 *             vehicleId:
 *               type: string
 *               example: 653b7a12f5c3ab001f0a38c2
 *     responses:
 *       200:
 *         description: Delivery person assigned successfully.
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: Delivery assigned successfully.
 *             delivery:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   example: 653b7a12f5c3ab001f0a38c2
 *                 userId:
 *                   type: string
 *                   example: 653b7a12f5c3ab001f0a38c2
 *                 deliveryPersonId:
 *                   type: string
 *                   example: 653b7a12f5c3ab001f0a38c2
 *                 vehicleId:
 *                   type: string
 *                   example: 653b7a12f5c3ab001f0a38c2
 *                 deliveryStatus:
 *                   type: string
 *                   example: assigned
 *                 userLocation:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: Point
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [77.5946, 12.9716]  # [longitude, latitude]
 *                 deliveryAddress:
 *                   type: object
 *                   properties:
 *                     flat:
 *                       type: string
 *                       example: A-501
 *                     houseNumber:
 *                       type: string
 *                       example: 12B
 *                     floor:
 *                       type: string
 *                       example: 5
 *                     area:
 *                       type: string
 *                       example: Green Park
 *                     sector:
 *                       type: string
 *                       example: Sector 45
 *                     phoneNumber:
 *                       type: string
 *                       example: 9876543210
 *                 currentLocation:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: Point
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [0, 0]  # [longitude, latitude]
 *                 estimatedArrivalTimeInMinutes:
 *                   type: number
 *                   example: 5
 *                 deliveryStartTime:
 *                   type: string
 *                   example: "2025-04-15T12:00:00Z"
 *       400:
 *         description: Validation failed or bad request.
 *       401:
 *         description: Unauthorized or user not found.
 *       404:
 *         description: Order, delivery person, or vehicle not found.
 *       500:
 *         description: Internal server error.
 */

    async assignDeliveryPerson(req, res) {
        const validationSchema = Joi.object({
            orderId: Joi.string().required(),
            deliveryPersonId: Joi.string().required(),
            vehicleId: Joi.string().required(),
        });
        try {
            const { orderId, deliveryPersonId, vehicleId } = await validationSchema.validateAsync(req.body,);
            const userData = await userModel.findOne({
                userType: userType.ADMIN,
                status: { $ne: status.DELETED }
            });
            if (!userData) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const user= await userModel.findOne({ 
                userType: userType.USER,
                status: { $ne: status.DELETED }
            });
            const orderData = await order.findOne({
                _id: orderId,
                status: { $ne: status.DELETED }
            }); 
            if (!orderData) {
                throw apiError.notFound(responseMessage.ORDER_NOT_FOUND);
            }
            const  deliveryPerson = await userModel.findOne({
                _id: deliveryPersonId,
                userType: userType.ADMIN,
                status: { $ne: status.DELETED }
            });
            if (!deliveryPerson) {
                throw apiError.notFound(responseMessage.DELIVERY_PERSON_NOT_FOUND);
            }
            const vehicleData = await vehicleModel.findOne({
                _id: vehicleId,
                status: { $ne: status.DELETED }
            });
            if (!vehicleData) {
                throw apiError.notFound(responseMessage.VEHICLE_NOT_FOUND);
            }
            
            
            const delivery = await deliveryModel.create({
                orderId,
                userId: orderData.userId,
                deliveryPersonId,
                vehicleId,
                deliveryStatus: 'assigned',
                userLocation: user.location, // from signup location
                deliveryAddress:orderData.address, // assuming your order has this field
                currentLocation: {
                  type: 'Point',
                  coordinates: [0, 0], // will be updated via socket/webhook
                },
                estimatedArrivalTimeInMinutes: 5,
                deliveryStartTime: new Date(), // assuming starts immediately
              });
              
        
              return res.json(new response(delivery, responseMessage.DELIVERY_ASSIGNED));


        } catch (err) {
            console.error(err);
            return res.status(500).send({
              success: false,
              message: err.message || 'Something went wrong'
            });
          }
        }}
export default new deliveryController();