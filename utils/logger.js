const winston = require("winston");
const LogzioWinstonTransport = require("winston-logzio");

const logzioWinstonTransport = new LogzioWinstonTransport({
  level: "info",
  name: "aura_bridge",
  token: process.env.LOGZIO_API_KEY,
  host: "listener.logz.io",
});

module.exports.logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [logzioWinstonTransport],
});
