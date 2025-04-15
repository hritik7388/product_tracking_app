import Express from "express";
import controller from "./controller"; 

export default Express.Router()

    .post("/placeOrder", controller.placeOrder) 
    .post("/webHook", controller.webHook)


    