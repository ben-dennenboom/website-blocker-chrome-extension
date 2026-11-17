// Import configuration
importScripts('config.js');

// Function to check if manual focus mode is active
async function isManualFocusActive() {
  try {
    const { manualFocusEndTime } = await chrome.storage.local.get(['manualFocusEndTime']);
    if (!manualFocusEndTime) return false;
    
    const now = Date.now();
    if (now < manualFocusEndTime) {
      return true;
    } else {
      // Manual focus has expired, clean up
      await chrome.storage.local.remove(['manualFocusEndTime']);
      return false;
    }
  } catch (error) {
    console.error('Error checking manual focus:', error);
    return false;
  }
}

// Function to check if current time is within blocking period
function isScheduledBlockingTime() {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const currentHour = now.getHours();
  
  const dayMatch = CONFIG.schedule.days.includes(currentDay);
  const timeMatch = currentHour >= CONFIG.schedule.startHour && currentHour < CONFIG.schedule.endHour;
  const shouldBlock = dayMatch && timeMatch;
  
  console.log(`🕐 Scheduled Time Check: Day ${currentDay} (${dayMatch ? 'matches' : 'no match'}), Hour ${currentHour} (${timeMatch ? 'in range' : 'out of range'}) → ${shouldBlock ? 'BLOCK' : 'ALLOW'}`);
  
  return shouldBlock;
}

// Combined function to check if we should be blocking (scheduled OR manual focus)
async function shouldBlockNow() {
  const scheduledBlocking = isScheduledBlockingTime();
  const manualFocus = await isManualFocusActive();
  
  console.log(`🔍 Combined Check: Scheduled=${scheduledBlocking}, Manual=${manualFocus} → ${scheduledBlocking || manualFocus ? 'BLOCK' : 'ALLOW'}`);
  
  return scheduledBlocking || manualFocus;
}

// Function to generate rule IDs dynamically based on number of blocked sites
function generateRuleIds() {
  const numRules = CONFIG.blockedSites.length * 2; // Double for www and non-www versions
  return Array.from({ length: numRules }, (_, i) => i + 1);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to create blocking rules
function createBlockingRules() {
  const rules = [];
  const ruleIds = generateRuleIds();
  const blockedPageUrl = `${chrome.runtime.getURL('blocked.html')}#\\0`;

  CONFIG.blockedSites.forEach((site, index) => {
    const escapedSite = escapeRegex(site);

    // Create rules for both www and non-www versions
    rules.push({
      id: ruleIds[index * 2],
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: blockedPageUrl
        }
      },
      condition: {
        regexFilter: `^https?://${escapedSite}(/.*)?$`,
        resourceTypes: ["main_frame"]
      }
    });
    rules.push({
      id: ruleIds[index * 2 + 1],
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: blockedPageUrl
        }
      },
      condition: {
        regexFilter: `^https?://www\\.${escapedSite}(/.*)?$`,
        resourceTypes: ["main_frame"]
      }
    });
  });
  return rules;
}

// Function to update blocking rules based on current time
async function updateBlockingRules() {
  try {
    if (await shouldBlockNow()) {
      // Enable blocking rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: generateRuleIds(),
        addRules: createBlockingRules()
      });
      console.log('✅ Blocking rules enabled at', new Date().toLocaleString());
      
      // Store blocking state for persistence
      await chrome.storage.local.set({ blockingActive: true });
    } else {
      // Disable blocking rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: generateRuleIds()
      });
      console.log('✅ Blocking rules disabled at', new Date().toLocaleString());
      
      // Store blocking state for persistence
      await chrome.storage.local.set({ blockingActive: false });
    }
  } catch (error) {
    console.error('❌ Failed to update blocking rules:', error);
    
    // Try to recover by clearing all rules and retrying
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: generateRuleIds()
      });
      console.log('🔄 Cleared rules for recovery, will retry on next update');
    } catch (recoveryError) {
      console.error('❌ Recovery also failed:', recoveryError);
    }
  }
}

// Update badge text to show blocking status
async function updateBadge() {
  const isBlocking = await shouldBlockNow();
  const isManual = await isManualFocusActive();
  
  if (isBlocking) {
    if (isManual) {
      chrome.action.setBadgeText({ text: "🎯" });
      chrome.action.setBadgeBackgroundColor({ color: "#764ba2" });
    } else {
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    }
  } else {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#00FF00" });
  }
}

// Function to start manual focus mode for 1 hour
async function startFocusMode() {
  try {
    const endTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
    await chrome.storage.local.set({ manualFocusEndTime: endTime });
    
    console.log('🎯 Manual focus mode started for 1 hour until', new Date(endTime).toLocaleString());
    
    // Immediately update rules and badge
    await updateBlockingRules();
    await updateBadge();
    
    return { success: true, endTime };
  } catch (error) {
    console.error('❌ Failed to start focus mode:', error);
    return { success: false, error: error.message };
  }
}

// Note: Focus mode cannot be stopped once started - this enforces commitment

// Function to restore blocking state on startup
async function restoreBlockingState() {
  try {
    // Check if we should be blocking based on current state (scheduled + manual)
    if (await shouldBlockNow()) {
      await updateBlockingRules();
      console.log('🔄 Restored blocking state on startup');
    } else {
      // Make sure rules are cleared if not blocking
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: generateRuleIds()
      });
      await chrome.storage.local.set({ blockingActive: false });
      console.log('🔄 Cleared blocking state on startup');
    }
  } catch (error) {
    console.error('❌ Failed to restore blocking state:', error);
  }
}

// Create persistent alarm for checking blocking rules
chrome.alarms.create('updateBlocking', { periodInMinutes: 1 });

// Handle alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'updateBlocking') {
    console.log('⏰ Alarm triggered: updating blocking rules and badge');
    await updateBadge();
    await updateBlockingRules();
  }
});

// Message handler for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.action === 'startFocus') {
        const result = await startFocusMode();
        sendResponse(result);
      } else if (request.action === 'getStatus') {
        const isScheduled = isScheduledBlockingTime();
        const isManual = await isManualFocusActive();
        const manualFocusData = await chrome.storage.local.get(['manualFocusEndTime']);
        
        sendResponse({
          isScheduledBlocking: isScheduled,
          isManualFocus: isManual,
          manualFocusEndTime: manualFocusData.manualFocusEndTime,
          shouldBlock: await shouldBlockNow()
        });
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep message channel open for async response
});

// Service worker startup handler
chrome.runtime.onStartup.addListener(async () => {
  console.log('🚀 Service worker started');
  await restoreBlockingState();
  await updateBadge();
});

// Extension installation/update handler
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('📦 Website Blocker extension installed/updated:', details.reason);
  
  // Clear any existing rules first
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: generateRuleIds()
    });
  } catch (error) {
    console.warn('⚠️ Could not clear existing rules on install:', error);
  }
  
  // Create the persistent alarm
  chrome.alarms.create('updateBlocking', { periodInMinutes: 1 });
  
  // Set up initial state
  await updateBlockingRules();
  await updateBadge();
});

// Handle service worker waking up
chrome.runtime.onSuspend.addListener(() => {
  console.log('💤 Service worker suspending');
});

// Initial setup when script loads
(async () => {
  console.log('🔧 Background script loaded');
  
  // Ensure alarm exists (in case service worker restarted)
  chrome.alarms.create('updateBlocking', { periodInMinutes: 1 });
  
  await restoreBlockingState();
  await updateBadge();
})(); 