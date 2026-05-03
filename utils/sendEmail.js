const axios = require("axios");

const sendEmail = async (to, subject, html) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.EMAIL_FROM,
          name: "CommunityPulse",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error.response) {
      // API ne response diya (401, 403, 400 etc)
      console.error("Brevo API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request bheji gayi par response nahi mila (Network Issue)
      console.error("Network Error: No response received from Brevo");
    } else {
      console.error("Error Message:", error.message);
    }
    throw error;
  }
};

module.exports = sendEmail;