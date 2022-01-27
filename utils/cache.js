let cache = global.redisCache;
/**
 * A helper function which is used to get data from Redis Store.
 * @param {string} key - name of key in which data is stored.
 * @returns {any} data - Return value stored in key in Redis Store.
 */
const getData = async (key) => {
  return new Promise((resolve, reject) => {
    cache.get(key, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * A helper function which is used to set value in Redis Store.
 * @param {string} key  - name of key in which data is stored.
 * @param {any} data - Value of key.
 * @param {number} ttl - data time to live in Redis Store.
 */

const setData = async (key, data, ttl) => {
  if (!ttl) {
    return new Promise((resolve, reject) => {
      cache.set(key, data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      cache.set(key, data, (err) => {
        if (err) {
          return reject(err);
        }
        cache.expire(key, ttl, (err, done) => {
          if (err) {
            console.log("err 2", err);
            return reject(err);
          }
          resolve(done);
        });
      });
    });
  }
};

/**
 * A helper function which is used to delete key from redis cache.
 * @param {string} key  - name of key in which data is stored.
 */
const deleteData = async (key) => {
  return new Promise((resolve, reject) => {
    cache.del(key, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
};

module.exports = {
  getData,
  setData,
  deleteData,
};
