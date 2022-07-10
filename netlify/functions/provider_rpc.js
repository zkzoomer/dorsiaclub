const axios = require("axios");

exports.handler = async function (event, context) {
  try {
    const response = await axios.get(`${process.env.PROVIDER_RPC}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ title: response.data.title }),
    };
  } catch (err) {
    return {
      statusCode: 404,
      body: err.toString(),
    };
  }
};