// utils/emailTemplates/verificationEmail.js

const verificationEmailTemplate = (otp) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #4CAF50; color: white; text-align: center; padding: 20px;">
        <h1 style="margin: 0;">HopeVerse</h1>
        <p style="margin: 5px 0 0;">Email Verification</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; text-align: center;">
        
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="color: #555;">
          Thank you for signing up! Use the verification code below to complete your registration.
        </p>

        <!-- OTP -->
        <div style="
          margin: 20px auto;
          padding: 15px;
          background: #f1f1f1;
          border-radius: 8px;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 5px;
        ">
          ${otp}
        </div>

        <p style="color: #888; font-size: 14px;">
          ⏳ This code will expire in <strong>10 minutes</strong>.
        </p>

        <p style="color: #555; font-size: 14px;">
          If you did not create an account, you can safely ignore this email.
        </p>

      </div>

      <!-- Footer -->
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} HopeVerse. All rights reserved.
      </div>

    </div>
  </div>
  `;
};

module.exports = verificationEmailTemplate;