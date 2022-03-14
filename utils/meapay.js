const axios = require("axios");
const CryptoJS = require("crypto-js");
const uuid = require("uuid-random");

axios.defaults.headers.common["Cache-Control"] = "no-cache";
axios.defaults.headers.common["Pragma"] = "no-cache";

axios.interceptors.request.use(
  (config) => {
    let meaTraceId = uuid().toLowerCase().trim();
    let meaApiKeyId = process.env.MEAPAY_API_KEY_ID;
    config.headers.common["Mea-Trace-id"] = meaTraceId;
    config.headers.common["Mea-Api-Key-Id"] = meaApiKeyId;
    config.headers.common["Mea-Secret"] = generateMeaSecret(
      meaTraceId,
      meaApiKeyId
    );
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

function generateMeaSecret(meaTraceId, meaApiKeyId) {
  const aesKey128Hex = process.env.MEAPAY_API_KEY;
  const key = CryptoJS.format.Hex.parse(aesKey128Hex).ciphertext;
  const inputForSecret = CryptoJS.enc.Utf8.parse(
    meaTraceId + "#" + meaApiKeyId
  );
  const iv = CryptoJS.enc.Hex.parse("0000000000000000");
  const ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(
    CryptoJS.algo.AES,
    inputForSecret,
    key,
    { iv: iv, format: CryptoJS.format.Hex }
  );
  return ciphertextParams.toString().toUpperCase();
}

module.exports = {
  getPan(cardData) {
    return axios({
      method: "post",
      url: "getPan",
      baseURL: process.env.MEAPAY_BASE_URL,
      data: {
        cardId: cardData.cardId,
        secret: cardData.secret,
        encryptionKey: cardData.encryptedKey,
        publicKeyFingerprint: process.env.MEAPAY_FINGERPRINT,
      },
    }).then((response) => {
      return response.data;
    });
  },
  getCardImage(cardData) {
    return axios({
      method: "post",
      url: "getCardImage",
      baseURL: process.env.MEAPAY_BASE_URL,
      data: {
        cardId: cardData.cardId,
        secret: cardData.secret,
        encryptionKey: cardData.encryptedKey,
        publicKeyFingerprint: cardData.publicKeyFingerprint,
      },
    }).then((response) => {
      return response.data;
    });
  },
};
