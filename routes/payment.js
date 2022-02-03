const { authGuard } = require("../middleware");
const { proxy, CHECKOUT_STATUS } = require("../utils/proxy");
const {
  paymentRequestValidation,
} = require("../validations/payment.validation");

const sleep = require("../utils/sleep");
const Router = require("express").Router();

Router.post(
  "/reqestPayment",
  paymentRequestValidation,
  authGuard,
  async (req, res) => {
    try {
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
      const response = {};
      response["data"] = data;
      response["status"] = 200;
      response["success"] = true;
      res.json(response).status(200).end();
    } catch (error) {
      return res.status(422).end();
    }
  }
);

Router.get("/paymentDetail/:sid", authGuard, async (req, res) => {
  try {
    let data = await proxy("payments/" + req.params.sid, {}, "GET", {
      Authorization: process.env.CHECKOUT_SECRET_KEY,
    });
    let tries = 1;
    while (
      CHECKOUT_STATUS.includes(data.status) &&
      tries <= process.env.RETRY_TIME
    ) {
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
    res.json(response).status(200).end();
  } catch (error) {
    return res.status(422).end();
  }
});

module.exports = Router;
