const axios = require("axios");

module.exports.callApiRB = async (url, method, data = {}) => {
  const config = {
    url: process.env.RAILSBANK_URL + url,
    method,
    data: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.RAILSBANK_API_KEY,
    },
  };

  const response = await axios(config);
  return response.data;
};
