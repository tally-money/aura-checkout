const { setData, getData } = require("../utils/cache");
const { proxy } = require("../utils/proxy");
const sleep = require("../utils/sleep");
const {
  paymentRequestValidation,
} = require("../validations/payment.validation");

const Router = require("express").Router();

Router.post("/reqestPayment", paymentRequestValidation, async (req, res) => {
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
        reference: "ORD-5023-4E89",
        merchant_initiated: false,
        description: "Set of 3 masks",
        capture: true,
        "3ds": {
          enabled: true,
        },
        metadata: {
          "tally-userId": "dsvdsvdsvdsvsd",
        },
      },
      "POST",
      {
        Authorization: process.env.CHECKOUT_SECRET_KEY,
      }
    );
    // await setData(data.id, false);
    // console.log(await getData(data.id));
    // while ((await getData(data.id)) == "false") {
    //   await sleep(5000);
    //   console.log("dvsdvsd");
    // }
    res.send(data);
  } catch (error) {
    return res.status(422).end();
  }
});

module.exports = Router;
