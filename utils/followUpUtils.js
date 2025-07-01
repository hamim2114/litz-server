/**
 * Calculate the next scheduled follow-up date based on frequency and time
 * @param {string} scheduledTime - Time in HH:MM format (e.g., "20:00")
 * @param {string} frequency - "daily" or "weekly"
 * @param {number} dayOfWeek - Day of week (0-6, where 0 is Sunday) - only for weekly
 * @param {Date} fromDate - Starting date (defaults to current date)
 * @returns {Date} The next scheduled follow-up date
 */
export const calculateNextScheduledDate = (scheduledTime, frequency, dayOfWeek = 0, fromDate = new Date()) => {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const nextDate = new Date(fromDate);
  
  // Set the time
  nextDate.setHours(hours, minutes, 0, 0);
  
  if (frequency === 'daily') {
    // If the time has already passed today, set it to tomorrow
    if (nextDate <= fromDate) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
  } else if (frequency === 'weekly') {
    // Calculate days until the next occurrence of the specified day
    const currentDay = fromDate.getDay();
    let daysToAdd = dayOfWeek - currentDay;
    
    // If the day has passed this week or it's today but time has passed
    if (daysToAdd <= 0 && nextDate <= fromDate) {
      daysToAdd += 7; // Move to next week
    }
    
    nextDate.setDate(nextDate.getDate() + daysToAdd);
  }
  
  return nextDate;
};

/**
 * Check if it's time to send a scheduled follow-up
 * @param {string} scheduledTime - Time in HH:MM format
 * @param {string} frequency - "daily" or "weekly"
 * @param {number} dayOfWeek - Day of week (0-6) - only for weekly
 * @param {Date} currentDate - Current date (defaults to now)
 * @returns {boolean} True if it's time to send the follow-up
 */
export const isTimeToSendScheduledFollowUp = (scheduledTime, frequency, dayOfWeek = 0, currentDate = new Date()) => {
  const currentTime = currentDate.toTimeString().slice(0, 5);
  
  if (currentTime !== scheduledTime) {
    return false;
  }
  
  if (frequency === 'daily') {
    return true;
  } else if (frequency === 'weekly') {
    return currentDate.getDay() === dayOfWeek;
  }
  
  return false;
}; 