import Express from "express";
import controller from "./controller"; 

export default Express.Router()



    .post("/addToCart", controller.addToCart)
    // .get("/getCart", controller.getCart)
    // .post("/removeFromCart", controller.removeFromCart)
    // .post("/updateCart", controller.updateCart)
    // .post("/clearCart", controller.clearCart)
    // .post("/checkout", controller.checkout);


