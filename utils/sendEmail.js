const sendEmail = async (to, subject, html) => {
  console.log("--- Brevo Debug Start ---");
  console.log("Recipient:", to);
  console.log("Sender Email (from env):", process.env.EMAIL_FROM);
  console.log("API Key Length:", process.env.BREVO_API_KEY?.length || 0);

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.EMAIL_FROM, name: "CommunityPulse" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        }
      }
    );
    console.log("--- Brevo Success! Response ID:", response.data.messageId);
  } catch (error) {
    console.error("--- Brevo Failed! ---");
    console.error("Status Code:", error.response?.status);
    console.error("Error Detail:", JSON.stringify(error.response?.data));
    throw error;
  }
};