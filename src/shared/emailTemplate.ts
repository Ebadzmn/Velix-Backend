export const createResetPasswordEmailTemplate = (name: string, otp: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { text-align: center; color: #333333; }
        .otp-box { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2; background: #eef5fc; padding: 15px 25px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px dashed #4A90E2; }
        .footer { font-size: 12px; color: #888888; text-align: center; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 class="header">Password Reset Request</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
        <div class="otp-box">${otp}</div>
        <p style="color: #666666; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Express API. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
