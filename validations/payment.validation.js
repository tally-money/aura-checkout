const Joi = require("joi");
module.exports.paymentRequestValidation = (req, res, next) => {
  const PaymentRequestSchema = Joi.object().keys({
    amount: Joi.number().required(),
  });

  const { error } = PaymentRequestSchema.validate(req.body);
  if (error) {
    res.status(400).send(error).end();
  } else {
    next();
  }
};
