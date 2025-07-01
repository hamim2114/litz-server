/* eslint-disable no-undef */
import cron from 'node-cron';
import followupModel from '../models/followup.model.js';
import userModel from '../models/user.model.js';
import emailModel from '../models/email.model.js';
import { sendFollowupEmail } from '../utils/emailSend.js';
import { isTimeToSendScheduledFollowUp } from '../utils/followUpUtils.js';

// Run every minute for both casual and scheduled follow-ups
cron.schedule('* * * * *', async () => {
  const now = new Date();
  // console.log('Running follow-up cron...');

  // Get all active follow-ups
  const followUps = await followupModel.find({ 
    approved: true, 
    enabled: true 
  });

  for (const followUp of followUps) {
    const user = await userModel.findById(followUp.user);
    
    if (followUp.followUpType === 'casual') {
      // Handle casual follow-ups
      const emails = await emailModel.find({ link: followUp.link });

      for (const emailEntry of emails) {
        const timePassedInMinutes = (now - new Date(emailEntry.visitedAt)) / 60000; // minutes

        if (
          (followUp.delayInMinutes === 0 || timePassedInMinutes >= followUp.delayInMinutes) &&
          !emailEntry.followUpSent
        ) {
          await sendFollowupEmail(user.username, emailEntry.email, followUp.subject, followUp.message, followUp.img, followUp.destinationUrl);

          emailEntry.followUpSent = true;
          await emailEntry.save();
          console.log(`Sent casual follow-up to ${emailEntry.email}`);
        }
      }
    } 
    else if (followUp.followUpType === 'scheduled') {
      // Handle scheduled follow-ups
      if (isTimeToSendScheduledFollowUp(followUp.scheduledTime, followUp.scheduledFrequency, followUp.scheduledDayOfWeek, now)) {
        const emails = await emailModel.find({ 
          link: followUp.link,
          scheduledFollowUpSent: { $ne: true }
        });

        for (const emailEntry of emails) {
          await sendFollowupEmail(user.username, emailEntry.email, followUp.subject, followUp.message, followUp.img, followUp.destinationUrl);
          
          emailEntry.scheduledFollowUpSent = true;
          emailEntry.scheduledFollowUpDate = now;
          await emailEntry.save();
          console.log(`Sent scheduled follow-up to ${emailEntry.email}`);
        }
      }
    }
  }
});
