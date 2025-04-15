import Config from "config";
import routes from "./routes.js";
import Server from "./common/server.js";
(async () => {
  const dbUrl = `mongodb://${Config.get("databaseHost")}:${Config.get(
    "databasePort"
  )}/${Config.get("databaseName")}`;

  const server = new Server()
    .router(routes)
    .configureSwagger(Config.get("swaggerDefinition"))
    .handleError();

  await server.configureDb(dbUrl); // Wait for DB connection

  server.listen(Config.get("port"));
})();
