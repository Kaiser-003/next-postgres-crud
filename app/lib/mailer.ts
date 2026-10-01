import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendResetCode(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Password Reset Code",
    text: `Your password reset code is ${code}. This code will expire in 10 minutes.`,
    html: `
      <h2>Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1>${code}</h1>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `,
  });
}