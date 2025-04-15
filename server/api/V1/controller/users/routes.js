import Express from "express";
import controller from "./controller.js"; 

export default Express.Router()
  

    .post("/signUp", controller.signUp)
    .post("/verifyOtp", controller.verifyOtp)
    .post("/login", controller.login)
    .get("/getUser", controller.getUserDetails)