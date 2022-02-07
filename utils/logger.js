const winston = require("winston");
const S3StreamLogger = require("s3-streamlogger").S3StreamLogger;
const _ = require("lodash");
const moment = require("moment");

const ignoreMap = {
  user: ["password", "token"],
  account: ["bookBalance", "availableBalance"],
  transaction: [],
  PostingEngine: ["zeBags", "legs"],
  //  user: ['password'],
};

const s3_stream_INFO = new S3StreamLogger({
  //ROCKBLOC: Going to hell in a bucket, atleast I'm enjoyiong the ride...Dead
  bucket: `aura-${process.env.APP_ENV}-logs`,
  name_format: `%Y-%m-%d-%H-%M-%S-%L-I-Aura-1.log`,
  access_key_id: process.env.S3_KEY_ID,
  folder: "info/",
  secret_access_key: process.env.S3_SECRET_KEY,
  //max_file_size: 2000000,
});

const s3_stream_ERROR = new S3StreamLogger({
  bucket: `aura-${process.env.APP_ENV}-logs`,
  name_format: `%Y-%m-%d-%H-%M-%S-%L-E-Aura-1.log`,
  access_key_id: process.env.S3_KEY_ID,
  folder: "error/",
  secret_access_key: process.env.S3_SECRET_KEY,
  //max_file_size: 2000000,
});

const logger = winston.createLogger({
  // level: winston.config.syslog.levels,
  format: winston.format.json(),
  transports: [
    new winston.transports.Stream({
      stream: s3_stream_INFO,
      level: "info",
    }),
    new winston.transports.Stream({
      stream: s3_stream_ERROR,
      level: "error",
    }),
  ],
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
  };

  //Event emitter
  // emitEvent(msg)

  if (process.env.APP_ENV === "production") {
    if (lvl === "error") {
      logger.error(msg);
    } else if (lvl === "info") {
      logger.info(msg);
    } else {
      logger.debug(msg);
    }
  } else {
    console.log(msg);
  }
};
