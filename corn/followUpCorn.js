/* eslint-disable no-undef */
import cron from 'node-cron';
import followupModel from '../models/followup.model.js';
import userModel from '../models/user.model.js';
import emailModel from '../models/email.model.js';
import nodemailer from 'nodemailer';

export const sendEmail = async ({username, to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({ from: `${username} <${process.env.EMAIL_USER}>`, to, subject, text });
};

//run every 10 minutes
// '*/10 * * * *'

cron.schedule('* * * * *', async () => {
  const now = new Date();
  // console.log('Running follow-up cron...');

  const followUps = await followupModel.find({ approved: true, enabled: true });

  for (const followUp of followUps) {
    const emails = await emailModel.find({ link: followUp.link });
    const user = await userModel.findById(followUp.user);

    for (const emailEntry of emails) {
      // const timePassedInHours = (now - new Date(emailEntry.visitedAt)) / 3600000; // hours
      const timePassedInMinutes = (now - new Date(emailEntry.visitedAt)) / 60000; // minutes

      if (
        (followUp.delayInMinutes === 0 || timePassedInMinutes >= followUp.delayInMinutes) &&
        !emailEntry.followUpSent
      ) {
        await sendEmail({
          username: user.username,
          to: emailEntry.email,
          subject: followUp.subject,
          text: followUp.message,
        });

        emailEntry.followUpSent = true;
        await emailEntry.save();
        // console.log(`Sent follow-up to ${emailEntry.email}`);
      }
    }
  }
});
