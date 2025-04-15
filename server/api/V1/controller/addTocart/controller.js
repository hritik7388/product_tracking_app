import Joi from "joi";
import bcrypt from "bcryptjs";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import status from "../../../../enum/status.js"

import userServices from "../../services/userServices.js";
import userModel from "../../../../models/user.js";
const {
    findUser,
    createUser,
    updateUser
} = userServices;
import commonFunction from "../../../../helper/util.js";
import userType from "../../../../enum/userType.js";
import productModel from "../../../../models/productModel.js";
import cartModel from "../../../../models/cartSchema.js";

export class cartController {


/**
 * @swagger
 * /cart/addToCart:
 *   post:
 *     tags:
 *       - CART
 *     summary: Add a product to cart
 *     description: User adds a specific product and quantity to their cart.
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
 *         description: Product and quantity to add to the cart
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - productId
 *             - quantity
 *           properties:
 *             productId:
 *               type: string
 *               example: 60d0fe4f5311236168a109ca
 *             quantity:
 *               type: number
 *               example: 2
 *     responses:
 *       200:
 *         description: Product added to cart successfully.
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: Product added to cart successfully
 *             data:
 *               type: object
 *               properties:
 *                 cartId:
 *                   type: string
 *                   example: 60d1ef4d2f9f462a5b7f93c3
 *                 userId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109cb
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         example: 60d0fe4f5311236168a109ca
 *                       quantity:
 *                         type: number
 *                         example: 2
 *       400:
 *         description: Validation failed or bad request.
 *       401:
 *         description: Unauthorized or user not found.
 *       404:
 *         description: Product or User not found.
 *       500:
 *         description: Internal server error.
 */



    async addToCart(req, res) {
        const validationSchema = Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().required()
        });
        try {
            const validatedBody = await validationSchema.validateAsync(req.body);
            const { productId, quantity } = validatedBody;
            const userData = await userModel.findOne({
                userType: userType.USER,
                status: {
                    $ne: status.DELETED
                },
            })
            if (!userData) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const productData = await productModel.findOne({
                _id: productId,
                status: {
                    $ne: status.DELETED
                }
            })
            if (!productData) {
                throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
            }
            const cartData = await cartModel.findOne({
                userId: userData._id
            });
            if (cartData) {
                const productIndex = cartData.products.findIndex(
                    (product) => product.productId.toString() === productId
                );
                if (productIndex > -1) {
                    cartData.products[productIndex].quantity += quantity;
                } else {
                    cartData.products.push({ productId, quantity });
                }
                await cartData.save();
            } else {
                const newCart = new cartModel({
                    userId: userData._id,
                    products: [{ productId, quantity }]
                });
                await newCart.save();
            }
            return res.status(200).json({
                responseCode: 200,
                responseMessage: responseMessage.PRODUCT_ADDED_TO_CART_SUCCESSFULLY,
                data: cartData
            });



        } catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                error: error.message
            });
        }
    }
}
export default new cartController();