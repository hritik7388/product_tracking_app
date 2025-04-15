import Mongoose, {
    Schema
} from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enum/status.js"; 
import userType from "../enum/userType.js";

import bcrypt from "bcryptjs";
import config from "config";
const axios = require('axios');
const options = {
    collection: "user",
    timestamps: true,
};

const userModel = new Schema({
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,

        },
        password: {
            type: String,
            required: true
        },
        confirmPassword: {
            type: String,
            
        },
        email: {
            type: String,
            required: true,
            default: "",
        },
        mobileNumber: {
            type: String,
            required: true,
            default: "",
        },
        dateOfBirth: {
            type: String,
            required: true,
            default: "",

        },
        gender: {
            type: String,
            required: true,

        },
        location: {
            type: {
                type: String,
                default: 'Point',
                required: true,
            },
            coordinates: {
                type: [Number],
                index: '2dsphere',
            },
        },
        OTP: {
            type: Number,
            default: null
        },
        OTPVerification: {
            type: Boolean,
            required: true,
            default: false
        },
        otpExpTime: {
            type: Number,
            default: null
        },
        userType: {
            type: String,
            enum: [
                userType.ADMIN,
                userType.USER, 
            ], 
            default: userType.USER,
             
        },
        status: {
            type: String,
            enum: [
                status.ACTIVE,
                status.DELETED,
                status.INACTIVE,
                status.BLOCKED,
            ],
            default: status.ACTIVE,
        },
        address: {
            type: String,   
            required: true,
        },
        twoFaStatus: {
            type: Boolean,
            required: true,
            default: false
        },
        secretKey: {
            type: String,
            default: null
        },
        permissionGrant: {
            type: Boolean,
            required: false
        },
        permissionsGranted: [{
            type: Mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }],

    },
    options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user", userModel); 

(async () => {
    try {
        const result = await Mongoose.model("user", userModel).find({
            userType: userType.ADMIN,
        });
        if (result.length != 0) {
            console.log("Default Admin 😀 .");
        } else {
            const createdRes = await Mongoose.model("user", userModel).create({
                userType: "ADMIN",
                userName: "Rustic7388",
                firstName: "Hritik",
                lastName: "Bhadauria",
                fullName: "Hritik Bhadauria",
                countryCode: "+91",
                mobileNumber: "7388503329",
                email: "choreohritik52@mailinator.com",
                dateOfBirth: "20/08/2001",
                gender: "Male",
                password: bcrypt.hashSync("Mobiloitte@1"), 
                OTPVerification: "true",
                address: "Okhala, Delhi, India",
                location: {
                    type: "Point",
                    coordinates: [77.38769273361113, 28.609128929286324] // Example: longitude and latitude for Delhi
                }

            });
            if (createdRes) {
                console.log("DEFAULT ADMIN Created 😀 ", createdRes);
            }
        }
    } catch (error) {
        console.log("Admin error===>>", error);
    }
}).call();