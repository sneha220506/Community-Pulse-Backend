const welcomeEmailTemplate = (name) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #4CAF50; color: white; text-align: center; padding: 20px;">
        <h1 style="margin: 0;">HopeVerse</h1>
        <p style="margin: 5px 0 0;">Welcome 🎉</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; text-align: center;">
        
        <h2 style="color: #333;">Welcome, ${name} 👋</h2>

        <p style="color: #555;">
          Your email has been successfully verified. You are now part of the HopeVerse network.
        </p>

        <p style="color: #555;">
          You can now explore, connect, and contribute to meaningful causes.
        </p>

        <!-- CTA -->
        <a href="http://localhost:3000/dashboard" style="
          display: inline-block;
          margin: 20px 0;
          padding: 12px 25px;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">
          Go to Dashboard
        </a>

      </div>

      <!-- Footer -->
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} HopeVerse. All rights reserved.
      </div>

    </div>
  </div>
  `;
};

module.exports = welcomeEmailTemplate;