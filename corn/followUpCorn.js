// crons/followup.cron.js
import cron from 'node-cron';
import { sendFollowupEmail } from '../utils/emailSend.js';
import followupModel from '../models/followup.model.js';
import userModel from '../models/user.model.js';
import emailModel from '../models/email.model.js';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentHour = now.getHours();

  const currentDay = now.getDay(); // 0 = Sunday
  const currentDate = now.getDate();

  console.log(
    `[${new Date().toLocaleTimeString()}] 🔄 Follow-up cron job running`
  );

  const followUps = await followupModel.find({ approved: true, enabled: true });

  for (const followUp of followUps) {
    const user = await userModel.findById(followUp.user);
    const emails = await emailModel.find({
      link: followUp.link,
      followUpSent: { $ne: true },
    });
   
    if (followUp.followUpType === 'casual') {
      for (const emailEntry of emails) {
        const timePassedInMinutes =
          (now - new Date(emailEntry.visitedAt)) / 60000;
        if (
          (followUp.delayInMinutes === 0 ||
            timePassedInMinutes >= followUp.delayInMinutes) &&
          !emailEntry.followUpSent
        ) {
          await sendFollowupEmail(
            user.username,
            emailEntry.email,
            followUp.subject,
            followUp.message,
            followUp.img,
            followUp.destinationUrl
          );
          emailEntry.followUpSent = true;
          emailEntry.followUpSentAt = new Date();
          await emailEntry.save();
          console.log(`✅ Casual follow-up sent to ${emailEntry.email}`);
        }
      }
    }

    if (followUp.followUpType === 'scheduled') {
      const isScheduledTime =
        followUp.sendHour === currentHour &&
        (followUp.scheduleType === 'daily' ||
          (followUp.scheduleType === 'weekly' && currentDay === 0) || // Sunday
          (followUp.scheduleType === 'monthly' && currentDate === 1)); // 1st of month


      if (!isScheduledTime) continue;

      for (const emailEntry of emails) {
        const visitedAt = new Date(emailEntry.visitedAt);
        // const lastSentDate = emailEntry.followUpSentAt || null;

        // Skip if already sent
        if (emailEntry.followUpSent) continue;

        // Logic to decide if it should be sent today
        const shouldSend =
          followUp.scheduleType === 'daily' ||
          (followUp.scheduleType === 'weekly' &&
            visitedAt < now.setDate(now.getDate() - 7)) ||
          (followUp.scheduleType === 'monthly' &&
            visitedAt.getMonth() < now.getMonth());

        if (shouldSend) {
          await sendFollowupEmail(
            user.username,
            emailEntry.email,
            followUp.subject,
            followUp.message,
            followUp.img,
            followUp.destinationUrl
          );
          emailEntry.followUpSent = true;
          emailEntry.followUpSentAt = new Date();
          await emailEntry.save();
          console.log(`📧 Scheduled follow-up sent to ${emailEntry.email}`);
        }
      }
    }
  }
});
