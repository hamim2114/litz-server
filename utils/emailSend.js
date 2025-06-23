/* eslint-disable no-undef */
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// send verification email
export const sendVerificationEmail = async (email, token) => {
  const templatePath = path.join(
    __dirname,
    '../emailTemplate/registrationTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  htmlContent = htmlContent.replace('{{token}}', token);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Verify your email',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// send admin user create email
export const sendAdminUserCreateEmail = async (
  email,
  verificationToken,
  password
) => {

  const templatePath = path.join(
    __dirname,
    '../emailTemplate/adminUserCreateTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  htmlContent = htmlContent.replace('{{verificationUrl}}', verificationUrl);
  htmlContent = htmlContent.replace('{{password}}', password);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to Our Platform - Verify Your Email',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// send password reset email
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const templatePath = path.join(
    __dirname,
    '../emailTemplate/passwordResetTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  htmlContent = htmlContent.replace('{{resetUrl}}', resetUrl);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset Request',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// send password reset confirmation email
export const sendPasswordResetConfirmationEmail = async (email) => {
  const templatePath = path.join(
    __dirname,
    '../emailTemplate/passwordResetConfirmationTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset Successful',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};


