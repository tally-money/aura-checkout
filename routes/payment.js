const { authGuard } = require("../middleware");
const {
  paymentRequestValidation,
} = require("../validations/payment.validation");

const { log } = require("../utils/logger");
const Router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

Router.post(
  "/create-payment-intent",
  paymentRequestValidation,
  authGuard,
  async (req, res) => {
    try {
      log(
        "Initialize payment request",
        req.body,
        "info",
        "_payment",
        req.apiGateway.context.awsRequestId
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "gbp",
        payment_method_types: ["card"],
      });
      log(
        "payment request completed!",
        { ...req.body, paymentId: paymentIntent.id },
        "info",
        "_payment",
        req.apiGateway.context.awsRequestId
      );

      res.json(paymentIntent).status(200).end();
    } catch (error) {
      log(
        "payment request failed!",
        req.body,
        "error",
        "_payment",
        req.apiGateway.context.awsRequestId
      );
      return res.status(422).end();
    }
  }
);

Router.get("/payment-intent-status/:pid", authGuard, async (req, res) => {
  log(
    "get payment detail",
    { paymentId: req.params.pid },
    "info",
    "_payment",
    req.apiGateway.context.awsRequestId
  );
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.pid);
    log(
      "get payment detail called",
      { paymentId: req.params.pid, status: paymentIntent.status },
      "info",
      "_payment",
      req.apiGateway.context.awsRequestId
    );

    res.json(paymentIntent).status(200).end();
  } catch (error) {
    log(
      "get payment detail failed!",
      { paymentId: req.params.pid },
      "error",
      "_payment",
      req.apiGateway.context.awsRequestId
    );
    return res.status(422).end();
  }
});

module.exports = Router;
