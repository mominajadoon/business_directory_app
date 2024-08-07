const sendGridMail = require("@sendgrid/mail");
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOTPEmail(email, otp) {
  const body = `Votre code Abirin est: ${otp}`;

  const messageData = {
    to: email,
    from: "Info@abirin.com",
    subject: "Votre code Abirin est",
    text: body,
    html: `<strong>${body}</strong>`,
  };

  try {
    await sendGridMail.send(messageData);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
}

module.exports = { sendOTPEmail };
