const Bravo = require("@getbrevo/brevo");
const apiInstance = new Bravo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Bravo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

exports.sendResetPasswordEmail = async (toEmail, resetURL) => {
  try {
    const sendSmtpEmail = {
      sender: {
        name: "Courses",
        email: "mohamedelsefi11@gmail.com",
      },
      to: [{ email: toEmail }],
      subject: "Reset Your Password",
      htmlContent: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}" 
           style="display:inline-block; padding:10px 15px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
           Reset Password
        </a>
        <br><br>
        <p>This link will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, simply ignore this email.</p>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.log("Error sending reset password email:", error);
  }
};
