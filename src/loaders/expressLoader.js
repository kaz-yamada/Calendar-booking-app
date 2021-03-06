import bodyParser from "body-parser";
import cors from "cors";

import routes from "../routes";

export default app => {
  app.use(cors());
  // Health check
  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  // Middleware
  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    res.json({ test: "test" });
  });

  app.use("/api", routes);
};
