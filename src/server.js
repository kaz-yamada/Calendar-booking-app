import express from "express";

import loaders from "./loaders";
import googleAuth from "./config/googleAuth";

export default () => {
  const app = express();
  loaders(app);
  googleAuth(auth => {});

  return app;
};
