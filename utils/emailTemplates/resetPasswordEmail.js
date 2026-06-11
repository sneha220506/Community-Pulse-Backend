const resetPasswordEmailTemplate = (resetUrl) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #ff9800; color: white; text-align: center; padding: 20px;">
        <h1 style="margin: 0;">HopeVerse</h1>
        <p style="margin: 5px 0 0;">Password Reset</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; text-align: center;">
        
        <h2 style="color: #333;">Reset Your Password</h2>
        
        <p style="color: #555;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>

        <!-- Button -->
        <a href="${resetUrl}" style="
          display: inline-block;
          margin: 20px 0;
          padding: 12px 25px;
          background: #ff9800;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">
          Reset Password
        </a>

        <!-- Fallback -->
        <p style="color: #888; font-size: 12px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; font-size: 12px; color: #555;">
          ${resetUrl}
        </p>

        <p style="color: #888; font-size: 14px;">
          ⏳ This link will expire in <strong>15 minutes</strong>.
        </p>

        <p style="color: #555; font-size: 14px;">
          If you didn’t request this, you can ignore this email.
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

module.exports = resetPasswordEmailTemplate;