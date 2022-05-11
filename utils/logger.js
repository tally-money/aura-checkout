const _ = require("lodash");
const moment = require("moment");

const ignoreMap = {
  user: ["password", "token"],
  account: ["bookBalance", "availableBalance"],
  transaction: [],
  PostingEngine: ["zeBags", "legs"],
  //  user: ['password'],
};

var logger = require("logzio-nodejs").createLogger({
  token: process.env.LOGZIO_API_KEY,
  protocol: "https",
  host: process.env.LOGZIO_HOST,
  port: process.env.LOGZIO_PORT,
  type: "T2-Stripe",
  bufferSize: +process.env.MAX_BUFFER_SIZE_FOR_LOGZIO,
});

module.exports.log = async (message, data, lvl, type, requestId) => {
  //If the data is PII then map it to type, else print it
  let val = data[type] ? data[type] : data;
  data = _.omit(val, ignoreMap[type]);
  //TODO: Get the userID, Reference ID, Msg ID etc...ThreadContext?
  const msg = {
    timestamp: moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    //Set in boot.ts (context)
    requestId,
    message,
    data,
    channel: "T2-Stripe",
  };
  logger.log(msg);
};
