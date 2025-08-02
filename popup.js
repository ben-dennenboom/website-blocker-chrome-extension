// Function to check if current time is within blocking period
function isBlockingTime() {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const currentHour = now.getHours();
  
  // Check if current day is in blocking days
  if (!CONFIG.schedule.days.includes(currentDay)) {
    return false;
  }
  
  // Check if current hour is within blocking time range
  return currentHour >= CONFIG.schedule.startHour && currentHour < CONFIG.schedule.endHour;
}

// Function to get current time string
function getCurrentTimeString() {
  const now = new Date();
  return now.toLocaleTimeString();
}

// Function to get current day name
function getCurrentDayName() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  return days[now.getDay()];
}

// Function to update the status display
function updateStatus() {
  const statusElement = document.getElementById('status');
  const isBlocking = isBlockingTime();
  
  if (isBlocking) {
    statusElement.textContent = `BLOCKING ACTIVE - ${getCurrentTimeString()}`;
    statusElement.className = 'status active';
  } else {
    statusElement.textContent = `BLOCKING INACTIVE - ${getCurrentTimeString()}`;
    statusElement.className = 'status inactive';
  }
}

// Function to populate blocked sites list
function populateBlockedSites() {
  const sitesList = document.getElementById('blockedSitesList');
  if (sitesList) {
    sitesList.innerHTML = CONFIG.blockedSites.map(site => `<li>${site}</li>`).join('');
  }
}

// Function to update schedule display
function updateScheduleDisplay() {
  const scheduleElement = document.querySelector('.schedule ul');
  if (scheduleElement) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const blockedDays = CONFIG.schedule.days.map(day => dayNames[day]).join(', ');
    
    scheduleElement.innerHTML = `
      <li><strong>Days:</strong> ${blockedDays}</li>
      <li><strong>Time:</strong> ${CONFIG.schedule.startHour}:00 ${CONFIG.schedule.startHour < 12 ? 'AM' : 'PM'} - ${CONFIG.schedule.endHour}:00 ${CONFIG.schedule.endHour < 12 ? 'AM' : 'PM'}</li>
    `;
  }
}

// Initialize popup
populateBlockedSites();
updateScheduleDisplay();
updateStatus();

// Update status every second while popup is open
setInterval(updateStatus, 1000); 