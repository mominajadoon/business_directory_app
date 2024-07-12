const axios = require("axios");
const dotenv = require("dotenv");
const User = require("../Models/User");
dotenv.config();

const apiClient = axios.create({
  baseURL: process.env.NIMBA_BASE_URL,
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${process.env.NIMBA_SERVICE_ID}:${process.env.NIMBA_SECRET_TOKEN}`
    ).toString("base64")}`,
    "Content-Type": "application/json",
  },
});

const sendOtpToUser = async (phoneNumber) => {
  try {
    const response = await apiClient.post("/v1/verifications", {
      to: phoneNumber,
      sender_name: "Kankira",
      message: "Votre code de confirmation: <1234>",
      expiry_time: 5,
      attempts: 3,
      code_length: 4,
    });

    await User.findOneAndUpdate(
      { phone: phoneNumber },
      { $set: { otp: response.data.code } },
      { new: true }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log("Error sending OTP:", error.message);

    if (error.response) {
      console.log("Response data:", error.response.data);
      console.log("Response status:", error.response.status);
    }

    throw new Error("OTP sending failed");
  }
};

module.exports = { sendOtpToUser, apiClient };
