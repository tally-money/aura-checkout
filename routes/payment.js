const { authGuard } = require("../middleware");
const { proxy, CHECKOUT_STATUS } = require("../utils/proxy");
const {
  paymentRequestValidation,
} = require("../validations/payment.validation");

const sleep = require("../utils/sleep");
const { log } = require("../utils/logger");
const Router = require("express").Router();

Router.post(
  "/reqestPayment",
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
      const body = req.body;
      const data = await proxy(
        "payments",
        {
          source: {
            type: "token",
            token: body.token,
          },
          amount: body.amount,
          currency: "GBP",
          payment_type: "Regular",
          reference: body.reference,
          merchant_initiated: false,
          customer: {
            email: body.email,
            name: body.customerName,
          },
          description: body.description,
          capture: true,
          "3ds": {
            enabled: true,
            attempt_n3d: true,
          },
          metadata: body.metadata,
          success_url: process.env.CHECKOUT_SUCCESS_URL,
          failure_url: process.env.CHECKOUT_FAILURE_URL,
        },
        "POST",
        {
          Authorization: process.env.CHECKOUT_SECRET_KEY,
        }
      );
      log(
        "payment request completed!",
        { ...req.body, paymentId: data.id },
        "info",
        "_payment",
        req.apiGateway.context.awsRequestId
      );
      const response = {};
      response["data"] = data;
      response["status"] = 200;
      response["success"] = true;
      res.json(response).status(200).end();
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

Router.get("/paymentDetail/:sid", authGuard, async (req, res) => {
  log(
    "get payment detail",
    { paymentId: req.params.sid },
    "info",
    "_payment",
    req.apiGateway.context.awsRequestId
  );
  try {
    let data = await proxy("payments/" + req.params.sid, {}, "GET", {
      Authorization: process.env.CHECKOUT_SECRET_KEY,
    });
    let tries = 1;
    log(
      "get payment detail called",
      { paymentId: req.params.sid, status: data.status },
      "info",
      "_payment",
      req.apiGateway.context.awsRequestId
    );
    while (
      CHECKOUT_STATUS.includes(data.status) &&
      tries <= process.env.RETRY_TIME
    ) {
      log(
        "get payment detail sleeping for 200 ms with retry no." + tries,
        { paymentId: req.params.sid, status: data.status },
        "info",
        "_payment",
        req.apiGateway.context.awsRequestId
      );
      await sleep(process.env.RETRY_DELAY);
      data = await proxy("payments/" + req.params.sid, {}, "GET", {
        Authorization: process.env.CHECKOUT_SECRET_KEY,
      });
      tries = tries + 1;
    }
    const response = {};
    response["data"] = data;
    response["status"] = 200;
    response["success"] = true;
    log(
      "get payment detail complete",
      { paymentId: req.params.sid, status: data.status },
      "info",
      "_payment",
      req.apiGateway.context.awsRequestId
    );
    res.json(response).status(200).end();
  } catch (error) {
    log(
      "get payment detail failed!",
      { paymentId: req.params.sid },
      "error",
      "_payment",
      req.apiGateway.context.awsRequestId
    );
    return res.status(422).end();
  }
});

module.exports = Router;
