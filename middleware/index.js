const { log } = require("../utils/logger");

module.exports.authGuard = (req, res, next) => {
  try {
    const token = req.headers["accesstoken"];
    if (token != process.env.TALLY_RANDOM_SALT) {
      log(
        "Unauthorized User access",
        {},
        "info",
        "_middleware",
        req.apiGateway.context.awsRequestId
      );
      res
        .status(401)
        .send({ message: "UNAUTHORIZED_USER_ACCESS", data: {}, status: 401 });
    } else {
      log(
        "Got Access for service",
        {},
        "info",
        "_middleware",
        req.apiGateway.context.awsRequestId
      );
      next();
    }
  } catch (err) {
    log(
      "Unauthorized User access",
      {},
      "error",
      "_middleware",
      req.apiGateway.context.awsRequestId
    );
    res
      .status(401)
      .send({ message: "UNAUTHORIZED_USER_ACCESS", data: {}, status: 401 });
  }
};
