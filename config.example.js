// Website Blocker Configuration Example
// Copy this file to config.js and modify the settings for your needs

const CONFIG = {
  // Blocking schedule
  schedule: {
    // Days to block (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)
    days: [1, 2, 3, 4, 5], // Monday, Tuesday, Wednesday, Thursday, Friday
    
    // Time range for blocking (24-hour format)
    startHour: 1,  // 1 AM
    endHour: 15    // 3 PM (noon)
  },
  
  // Websites to block (domain names only)
  blockedSites: [
    'reddit.com',
    'linkedin.com',
    'instagram.com'
  ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} 