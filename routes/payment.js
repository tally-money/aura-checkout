const { authGuard } = require("../middleware");
const { proxy, CHECKOUT_STATUS } = require("../utils/proxy");
const {
  paymentRequestValidation,
} = require("../validations/payment.validation");

const sleep = require("../utils/sleep");
const { logger } = require("../utils/logger");
const Router = require("express").Router();

Router.post(
  "/reqestPayment",
  paymentRequestValidation,
  authGuard,
  async (req, res) => {
    try {
      logger.log("info", {
        message: "Initialize payment request",
        data: req.body,
        requestId: req.apiGateway.context.awsRequestId,
      });
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
      logger.log("info", {
        message: "payment request completed!",
        ...req.body,
        paymentId: data.id,
        requestId: req.apiGateway.context.awsRequestId,
      });
      const response = {};
      response["data"] = data;
      response["status"] = 200;
      response["success"] = true;
      res.json(response).status(200).end();
    } catch (error) {
      logger.log("error", {
        message: "payment request failed!",
        data: req.body,
      });
      return res.status(422).end();
    }
  }
);

Router.get("/paymentDetail/:sid", authGuard, async (req, res) => {
  logger.log("info", {
    message: "get payment detail",
    paymentId: req.params.sid,
    requestId: req.apiGateway.context.awsRequestId,
  });
  try {
    let data = await proxy("payments/" + req.params.sid, {}, "GET", {
      Authorization: process.env.CHECKOUT_SECRET_KEY,
    });
    let tries = 1;
    logger.log("info", {
      message: "get payment detail called",
      paymentId: req.params.sid,
      status: data.status,
      requestId: req.apiGateway.context.awsRequestId,
    });
    while (
      CHECKOUT_STATUS.includes(data.status) &&
      tries <= process.env.NO_OF_RETRIES
    ) {
      logger.log("info", {
        message:
          "get payment detail sleeping for 200 ms with retry no. " + tries,
        paymentId: req.params.sid,
        status: data.status,
        requestId: req.apiGateway.context.awsRequestId,
      });
      await sleep(process.env.RETRY_DELAY_TIME);
      data = await proxy("payments/" + req.params.sid, {}, "GET", {
        Authorization: process.env.CHECKOUT_SECRET_KEY,
      });
      tries = tries + 1;
    }
    const response = {};
    response["data"] = data;
    response["status"] = 200;
    response["success"] = true;
    logger.log("info", {
      message: "get payment detail complete",
      paymentId: req.params.sid,
      status: data.status,
      requestId: req.apiGateway.context.awsRequestId,
    });
    res.json(response).status(200).end();
  } catch (error) {
    logger.log("error", {
      message: "get payment detail failed!",
      paymentId: req.params.sid,
      requestId: req.apiGateway.context.awsRequestId,
    });
    return res.status(422).end();
  }
});

module.exports = Router;
