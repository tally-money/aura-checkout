const axios = require("axios");

module.exports.proxy = async (url, data, method = "GET", headers = {}) => {
  var config = {
    method: method,
    url: process.env.CHECKOUT_ENDPOINT + url,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    data: JSON.stringify(data),
  };

  const response = await axios(config);
  return response.data;
};

module.exports.CHECKOUT_STATUS = ["Pending", "Authorized", "Card Verified"];
