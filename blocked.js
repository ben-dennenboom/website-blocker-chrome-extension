// Function to format hour to 12-hour format with AM/PM
function formatTime(hour) {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return hour + ':00 AM';
  return (hour - 12) + ':00 PM';
}

// Update schedule information from configuration
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const blockedDays = CONFIG.schedule.days.map(day => dayNames[day]).join(', ');
const startTime = formatTime(CONFIG.schedule.startHour);
const endTime = formatTime(CONFIG.schedule.endHour);

document.getElementById('scheduleInfo').innerHTML = `
    <p><strong>Days:</strong> ${blockedDays}</p>
    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
`; 