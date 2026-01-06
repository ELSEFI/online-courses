const axios = require("axios");

async function getAuthToken() {
  const res = await axios.post(`${process.env.PAYMOB_API_URL}/auth/tokens`, {
    api_key: process.env.PAYMOB_API_KEY,
  });
  return res.data.token;
}

module.exports = getAuthToken;
