 //v7 imports
import user from "../server/api/V1/controller/users/routes.js"; 
import product from "../server/api/V1/controller/product/routes.js";
import cart from "../server/api/V1/controller/addTocart/routes.js";  
import order from "../server/api/V1/controller/placeorder/routes.js";
import delivery from "../server/api/V1/controller/delivery/routes.js";

/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {

   app.use("/api/v1/user", user) 
    app.use("/api/v1/product", product)
    app.use("/api/v1/cart", cart)
    app.use("/api/v1/order", order)
    app.use("/api/v1/delivery", delivery)


  



  return app;
}
