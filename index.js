const serverless = require("serverless-http");
const express = require("express");
const RedisClient = require("./redisCache");

RedisClient.on("connect", () => {
  console.log("Connected to cache");
});

RedisClient.on("error", () => {
  console.log("Error in connection");
});
const { paymentRoutes, webhookRoutes } = require("./routes");

const app = express();

app.use(express.json());

const handler = serverless(app);

app.use("/payment", paymentRoutes);
app.use("/webhook", webhookRoutes);

module.exports.app = async (event, context) => {
  return await handler(event, context);
};
