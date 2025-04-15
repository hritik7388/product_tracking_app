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


export class productController {
    
    /**
     * @swagger
     * /product/addProduct:
     *   post:
     *     tags:
     *       - PRODUCT
     *     summary: Add a new product
     *     description: Admin adds a new product like chips, kurkure, chocolate, etc.
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
     *         description: Product details
     *         required: true
     *         schema:
     *           type: object
     *           required:
     *             - productName
     *             - productDescription
     *             - productPrice
     *             - productCategory
     *             - productImage
     *             - quantityAvailable
     *           properties:
     *             productName:
     *               type: string
     *               example: Lay's Classic Chips
     *             productDescription:
     *               type: string
     *               example: Crunchy and salty potato chips
     *             productPrice:
     *               type: number
     *               example: 30
     *             productCategory:
     *               type: string
     *               example: Snacks
     *             productImage:
     *               type: string
     *               example: https://example.com/images/lays.png
     *             quantityAvailable:
     *               type: number
     *               example: 100
     *     responses:
     *       200:
     *         description: Product added successfully.
     *         schema:
     *           type: object
     *           properties:
     *             success:
     *               type: boolean
     *               example: true
     *             message:
     *               type: string
     *               example: Product added successfully
     *             data:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   example: 60d0fe4f5311236168a109ca
     *                 name:
     *                   type: string
     *                   example: Lay's Classic Chips
     *                 category:
     *                   type: string
     *                   example: Snacks
     *                 price:
     *                   type: number
     *                   example: 30
     *                 imageUrl:
     *                   type: string
     *                   example: https://example.com/images/lays.png
     *                 description:
     *                   type: string
     *                   example: Crunchy and salty potato chips
     *                 quantityAvailable:
     *                   type: number
     *                   example: 100
     *       400:
     *         description: Validation failed or bad request.
     *       401:
     *         description: Unauthorized or user not found.
     *       500:
     *         description: Internal server error.
     */


    async addProduct(req, res, next) {
        const validationSchema = Joi.object({
            productName: Joi.string().required(),
            productDescription: Joi.string().required(),
            productPrice: Joi.number().required(),
            productCategory: Joi.string().required(),
            productImage: Joi.string().required(),
            quantityAvailable: Joi.number().required(),
        });
        try {
            const validatedBody = await validationSchema.validateAsync(req.body);
            const {
                productName,
                productDescription,
                productPrice,
                productCategory,
                productImage,
                quantityAvailable
            } = validatedBody;
            
            const userResult = await userModel.findOne({ 
                userType: userType.ADMIN,
                status: {
                    $ne: status.DELETED
                }
            })
            console.log("userResult==================>>>>>", userResult);

            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const productData = {
                productName,
                productDescription,
                productPrice,
                productCategory,
                productImage,
                quantityAvailable
            };
            const product = await productModel.create(productData);
           
            return res.json(new response(   
                true,
                responseMessage.PRODUCT_ADDED_SUCCESSFULLY,
                product
            ));

        } catch (error) {
            console.log("Error during sign-up:==================>>>>>", error);
            return next(error);

        }
    }



}
export default new productController();