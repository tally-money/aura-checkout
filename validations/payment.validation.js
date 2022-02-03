const Joi = require("joi");
module.exports.paymentRequestValidation = (req, res, next) => {
  const PaymentRequestSchema = Joi.object().keys({
    token: Joi.string().required(),
    amount: Joi.number().required(),
    reference: Joi.string().required(),
    description: Joi.string().required(),
    metadata: Joi.object().unknown(true).optional(),
    email: Joi.string().required(),
    customerName: Joi.string().required(),
  });

  const { error } = PaymentRequestSchema.validate(req.body);
  if (error) {
    res.status(400).send(error).end();
  } else {
    next();
  }
};
