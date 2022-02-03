const serverless = require("serverless-http");
const express = require("express");

const { paymentRoutes, webhookRoutes } = require("./routes");

const app = express();

app.use(express.json());

const handler = serverless(app);

app.use("/payment", paymentRoutes);

module.exports.app = async (event, context) => {
  return await handler(event, context);
};
