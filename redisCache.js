const redis = require("redis");
const client = redis.createClient({
  host: process.env.REDIS_ENDPOINT,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});
global.redisCache = client;
module.exports = client;
