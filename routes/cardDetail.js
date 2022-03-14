const { logger } = require("../utils/logger");
const { callApiRB } = require("../utils/railsbank_api");
const Router = require("express").Router();
const { getPan } = require("../utils/meapay");
const forge = require("node-forge");
const CryptoJS = require("crypto-js");
const { authGuard } = require("../middleware");

Router.get("/token/:cardId", authGuard, async (req, res) => {
  try {
    const key = forge.random.getBytesSync(32);
    const keyHex = forge.util.bytesToHex(key);
    let publicKey =
      "-----BEGIN PUBLIC KEY-----" +
      CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Hex.parse(process.env.MEAPAY_ENCRYPTION_KEY)
      ) +
      "-----END PUBLIC KEY-----";
    let publicKeyDecoded = forge.pki.publicKeyFromPem(publicKey);
    const encryptedKey = forge.util.bytesToHex(
      publicKeyDecoded.encrypt(key, "RSA-OAEP", {
        md: forge.md.sha512.create(),
        mgf1: {
          md: forge.md.sha512.create(),
        },
      })
    );
    const rbResponse = await callApiRB("totp/" + req.params.cardId);
    const data = await getPan({
      cardId: req.params.cardId,
      secret: rbResponse.secret,
      encryptedKey,
    });
    let encIv = CryptoJS.enc.Hex.parse(data.iv);
    let cryptText = CryptoJS.enc.Hex.parse(data.encryptedData);
    let cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: cryptText,
    });
    let HexkeyNew = CryptoJS.enc.Hex.parse(keyHex);
    const encodedData = JSON.parse(
      CryptoJS.AES.decrypt(cipherParams, HexkeyNew, {
        iv: encIv,
      }).toString(CryptoJS.enc.Utf8)
    );

    return res.json(encodedData).end();
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = Router;
