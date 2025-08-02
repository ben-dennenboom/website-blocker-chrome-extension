// Import configuration
importScripts('config.js');

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

// Rule IDs for blocking
const RULE_IDS = [1, 2, 3, 4, 5];

// Function to create blocking rules
function createBlockingRules() {
  return CONFIG.blockedSites.map((site, index) => ({
    id: RULE_IDS[index],
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        url: chrome.runtime.getURL('blocked.html')
      }
    },
    condition: {
      urlFilter: `||${site}/*`,
      resourceTypes: ["main_frame"]
    }
  }));
}

// Function to update blocking rules based on current time
function updateBlockingRules() {
  if (isBlockingTime()) {
    // Enable blocking rules
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: RULE_IDS,
      addRules: createBlockingRules()
    });
    console.log('Blocking rules enabled at', new Date().toLocaleString());
  } else {
    // Disable blocking rules
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: RULE_IDS
    });
    console.log('Blocking rules disabled at', new Date().toLocaleString());
  }
}

// Update badge text to show blocking status
function updateBadge() {
  if (isBlockingTime()) {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
  } else {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#00FF00" });
  }
}

// Update badge and blocking rules every minute
setInterval(() => {
  updateBadge();
  updateBlockingRules();
}, 60000);

// Initial update
updateBadge();
updateBlockingRules();

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Website Blocker extension installed');
  updateBadge();
  updateBlockingRules();
}); 