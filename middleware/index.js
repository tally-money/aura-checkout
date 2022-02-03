module.exports.authGuard = (req, res, next) => {
  try {
    const token = req.headers["accessToken"];
    if (token != process.env.TALLY_RANDOM_SALT) {
      res
        .status(401)
        .send({ message: "UNAUTHORIZED_USER", data: {}, status: 401 });
    } else {
      next();
    }
  } catch (err) {
    res
      .status(401)
      .send({ message: "UNAUTHORIZED_USER", data: {}, status: 401 });
  }
};
