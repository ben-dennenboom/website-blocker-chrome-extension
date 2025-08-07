// Function to check if current time is within scheduled blocking period
function isScheduledBlockingTime() {
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

// Global status object to store current state
let currentStatus = {
  isScheduledBlocking: false,
  isManualFocus: false,
  manualFocusEndTime: null,
  shouldBlock: false
};

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

// Function to get status from background script
async function getBackgroundStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting status:', chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

// Function to update the status display
async function updateStatus() {
  const statusElement = document.getElementById('status');
  
  try {
    // Get status from background script
    const status = await getBackgroundStatus();
    if (status) {
      currentStatus = status;
    }
    
    const isBlocking = currentStatus.shouldBlock;
    const isManual = currentStatus.isManualFocus;
    
    // Check if rules are actually active
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const activeRules = rules.length;
    
    if (isBlocking) {
      if (isManual) {
        const endTime = new Date(currentStatus.manualFocusEndTime);
        const timeLeft = Math.ceil((endTime.getTime() - Date.now()) / (1000 * 60)); // minutes left
        statusElement.textContent = `🎯 FOCUS MODE (${timeLeft}m left) - ${getCurrentTimeString()}`;
        statusElement.className = 'status active';
      } else {
        statusElement.textContent = `BLOCKING ACTIVE - ${getCurrentTimeString()}`;
        statusElement.className = 'status active';
      }
      
      // Add debug info if rules don't match expected state
      if (activeRules === 0) {
        statusElement.textContent += ' ⚠️ (No active rules)';
      }
    } else {
      statusElement.textContent = `BLOCKING INACTIVE - ${getCurrentTimeString()}`;
      statusElement.className = 'status inactive';
      
      // Add debug info if rules are still active when they shouldn't be
      if (activeRules > 0) {
        statusElement.textContent += ` ⚠️ (${activeRules} rules still active)`;
      }
    }
    
    // Update focus button visibility
    updateFocusButtonVisibility();
    
  } catch (error) {
    statusElement.textContent = `ERROR - ${getCurrentTimeString()}`;
    statusElement.className = 'status active';
    console.error('Failed to get rule status:', error);
  }
}

// Function to populate blocked sites list
function populateBlockedSites() {
  const sitesList = document.getElementById('blockedSitesList');
  if (sitesList) {
    sitesList.innerHTML = CONFIG.blockedSites.map(site => `<li>${site}</li>`).join('');
  }
}

// Function to format hour to 12-hour format with AM/PM
function formatTime(hour) {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return hour + ':00 AM';
  return (hour - 12) + ':00 PM';
}

// Function to update schedule display
function updateScheduleDisplay() {
  const scheduleElement = document.getElementById('scheduleList');
  if (scheduleElement) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const blockedDays = CONFIG.schedule.days.map(day => dayNames[day]).join(', ');
    
    scheduleElement.innerHTML = `
      <li><strong>Days:</strong> ${blockedDays}</li>
      <li><strong>Time:</strong> ${formatTime(CONFIG.schedule.startHour)} - ${formatTime(CONFIG.schedule.endHour)}</li>
    `;
  }
}

// Function to update focus button visibility
function updateFocusButtonVisibility() {
  const focusSection = document.getElementById('focusSection');
  const focusButton = document.getElementById('focusButton');
  
  if (!focusSection || !focusButton) return;
  
  // Show button only if not blocking at all (no scheduled, no manual focus)
  if (!currentStatus.shouldBlock && !currentStatus.isManualFocus) {
    focusSection.style.display = 'block';
    focusButton.disabled = false;
    focusButton.textContent = '🎯 Let\'s focus for 1 hour';
  } else {
    // Hide button completely when any blocking is active
    // This enforces commitment - no way to stop focus mode once started
    focusSection.style.display = 'none';
  }
}

// Function to handle focus button click (start focus mode only)
async function handleFocusButtonClick() {
  const focusButton = document.getElementById('focusButton');
  
  try {
    focusButton.disabled = true;
    focusButton.textContent = '⏳ Starting focus mode...';
    
    // Start focus mode - once started, it cannot be stopped
    chrome.runtime.sendMessage({ action: 'startFocus' }, (response) => {
      if (response && response.success) {
        console.log('🎯 Focus mode started until:', new Date(response.endTime).toLocaleString());
        console.log('💪 Stay strong! No way to stop it now - you got this!');
      } else {
        console.error('❌ Failed to start focus mode:', response?.error);
        focusButton.disabled = false;
        focusButton.textContent = '🎯 Let\'s focus for 1 hour';
      }
      
      // Button will be hidden by updateFocusButtonVisibility() on next status update
    });
  } catch (error) {
    console.error('Error handling focus button:', error);
    focusButton.disabled = false;
    focusButton.textContent = '🎯 Let\'s focus for 1 hour';
  }
}

// Function to update debug information
async function updateDebugInfo() {
  const debugElement = document.getElementById('debugInfo');
  if (!debugElement) return;
  
  try {
    const now = new Date();
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const storage = await chrome.storage.local.get(['blockingActive', 'manualFocusEndTime']);
    
    debugElement.innerHTML = `
      <div style="color: #6c757d;">
        <strong>Current Time:</strong> ${now.toLocaleString()}<br>
        <strong>Day:</strong> ${now.getDay()} (${getCurrentDayName()})<br>
        <strong>Hour:</strong> ${now.getHours()}<br>
        <strong>Active Rules:</strong> ${rules.length}<br>
        <strong>Storage State:</strong> ${storage.blockingActive ? 'Active' : 'Inactive'}<br>
        <strong>Scheduled Block:</strong> ${currentStatus.isScheduledBlocking ? 'Yes' : 'No'}<br>
        <strong>Manual Focus:</strong> ${currentStatus.isManualFocus ? 'Yes' : 'No'}<br>
        <strong>Should Block:</strong> ${currentStatus.shouldBlock ? 'Yes' : 'No'}
        ${currentStatus.manualFocusEndTime ? `<br><strong>Focus Ends:</strong> ${new Date(currentStatus.manualFocusEndTime).toLocaleString()}` : ''}
      </div>
    `;
  } catch (error) {
    debugElement.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
  }
}

// Generic function to toggle collapsible sections
function toggleSection(toggleId, containerId, onOpenCallback = null) {
  const toggle = document.getElementById(toggleId);
  const container = document.getElementById(containerId);
  
  if (!toggle || !container) return;
  
  const isExpanded = container.classList.contains('expanded');
  
  if (isExpanded) {
    container.classList.remove('expanded');
    toggle.classList.remove('expanded');
  } else {
    container.classList.add('expanded');
    toggle.classList.add('expanded');
    // Call callback when opening (e.g., to populate data)
    if (onOpenCallback) onOpenCallback();
  }
}

// Specific toggle functions
function toggleDebugSection() {
  toggleSection('debugToggle', 'debugContainer', updateDebugInfo);
}

function toggleScheduleSection() {
  toggleSection('scheduleToggle', 'scheduleContainer');
}

function toggleSitesSection() {
  toggleSection('sitesToggle', 'sitesContainer');
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  const focusButton = document.getElementById('focusButton');
  const debugToggle = document.getElementById('debugToggle');
  const scheduleToggle = document.getElementById('scheduleToggle');
  const sitesToggle = document.getElementById('sitesToggle');
  
  if (focusButton) {
    focusButton.addEventListener('click', handleFocusButtonClick);
  }
  
  if (debugToggle) {
    debugToggle.addEventListener('click', toggleDebugSection);
  }
  
  if (scheduleToggle) {
    scheduleToggle.addEventListener('click', toggleScheduleSection);
  }
  
  if (sitesToggle) {
    sitesToggle.addEventListener('click', toggleSitesSection);
  }
});

// Initialize popup
populateBlockedSites();
updateScheduleDisplay();
updateStatus();
updateDebugInfo();

// Update status and debug info every second while popup is open
setInterval(() => {
  updateStatus();
  
  // Only update debug info if debug section is expanded
  const debugContainer = document.getElementById('debugContainer');
  if (debugContainer && debugContainer.classList.contains('expanded')) {
    updateDebugInfo();
  }
}, 1000); 