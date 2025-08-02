// Update schedule information from configuration
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const blockedDays = CONFIG.schedule.days.map(day => dayNames[day]).join(', ');
const startTime = CONFIG.schedule.startHour + ':00 ' + (CONFIG.schedule.startHour < 12 ? 'AM' : 'PM');
const endTime = CONFIG.schedule.endHour + ':00 ' + (CONFIG.schedule.endHour < 12 ? 'AM' : 'PM');

document.getElementById('scheduleInfo').innerHTML = `
    <p><strong>Days:</strong> ${blockedDays}</p>
    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
`; 