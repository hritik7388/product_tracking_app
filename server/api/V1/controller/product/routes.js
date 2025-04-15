import Express from "express";
import controller from "./controller.js"; 

export default Express.Router()
   
.post("/addProduct",controller.addProduct)