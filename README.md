# Website Blocker Chrome Extension

A Chrome extension that blocks specific websites during certain time periods to help you stay focused and productive during work hours.

## 🎯 What It Does

This extension automatically blocks access to distracting websites during your configured work hours. When you try to visit a blocked site during blocking hours, you'll see a "Get back to work!" message instead.

### Key Features

- ⏰ **Time-based blocking**: Automatically blocks sites during specific hours
- 📅 **Flexible scheduling**: Choose which days of the week to block sites
- 🎯 **Customizable sites**: Block any websites you find distracting
- 🔴 **Visual indicators**: Extension badge shows blocking status
- 🚫 **Blocking page**: Shows a motivational message when sites are blocked
- 🔄 **Automatic operation**: Works in the background without user intervention

## 📋 Requirements

- Google Chrome browser (version 88 or higher)
- Chrome extension developer mode enabled

## 🚀 Installation

### Step 1: Download the Extension
1. Clone or download this repository to your computer
2. Navigate to the downloaded folder

### Step 2: Configure the Extension
1. Copy `config.example.js` to `config.js`
2. Edit `config.js` with your preferred blocking schedule and sites (see Configuration section below)

### Step 3: Install in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the extension folder
4. The extension will appear in your extensions list

## ⚙️ Configuration

The extension is configured through the `config.js` file. Here's how to customize it:

### Blocking Schedule

```javascript
schedule: {
  days: [1, 2, 4, 5], // Monday, Tuesday, Thursday, Friday
  startHour: 5,        // 5 AM
  endHour: 12          // 12 PM (noon)
}
```

- **`days`**: Array of days to block (0=Sunday, 1=Monday, 2=Tuesday, etc.)
- **`startHour`**: Start time in 24-hour format (0-23)
- **`endHour`**: End time in 24-hour format (0-23)

### Blocked Websites

```javascript
blockedSites: [
  'reddit.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'youtube.com'
]
```

- Add domain names only (without `http://` or `www.`)
- The extension will block all pages on these domains

### Example Configurations

**Weekday Work Hours (9 AM - 5 PM)**
```javascript
schedule: {
  days: [1, 2, 3, 4, 5], // Monday through Friday
  startHour: 9,
  endHour: 17
}
```

**Weekend Only (All Day)**
```javascript
schedule: {
  days: [0, 6], // Saturday and Sunday
  startHour: 0,
  endHour: 23
}
```

## 🎮 How to Use

### Basic Usage
1. **Install and configure** the extension (see Installation above)
2. **The extension works automatically** - no manual intervention needed
3. **Check the badge** on the extension icon to see blocking status:
   - 🔴 **Red "ON"** = Blocking is active
   - 🟢 **Green "OFF"** = Blocking is inactive

### Extension Popup
- Click the extension icon in the toolbar to see:
  - Current blocking status
  - Your configured schedule
  - List of blocked sites

### When Sites Are Blocked
- During blocking hours, attempting to visit a blocked site will show a blocking page
- The page displays your schedule and a motivational message
- Sites are accessible outside of blocking hours

## 📁 File Structure

```
chrome-blocker/
├── manifest.json          # Extension manifest
├── config.example.js      # Example configuration file
├── config.js             # Your configuration (not in git)
├── background.js         # Main blocking logic
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── blocked.html         # Blocking page
├── blocked.js           # Blocking page JavaScript
├── icon16.png           # Extension icon (16x16)
├── icon48.png           # Extension icon (48x48)
├── icon128.png          # Extension icon (128x128)
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## 🔧 Troubleshooting

### Extension Not Blocking Sites
1. **Check the badge**: Ensure it shows "ON" during blocking hours
2. **Verify configuration**: Check your `config.js` file
3. **Reload extension**: Go to `chrome://extensions/` and click the reload button
4. **Check console**: Open Developer Tools (F12) and look for error messages

### Sites Still Accessible
1. **Clear browser cache**: Sometimes cached pages bypass blocking
2. **Check domain format**: Ensure sites are listed without `http://` or `www.`
3. **Verify time settings**: Make sure your computer's time is correct

### Extension Won't Load
1. **Check manifest**: Ensure `manifest.json` is valid
2. **Developer mode**: Make sure Developer mode is enabled
3. **File permissions**: Ensure all files are readable

## 🛠️ Development

### Making Changes
1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the reload button on the extension
4. Test your changes

### Adding New Features
- **Background logic**: Edit `background.js`
- **Popup interface**: Edit `popup.html` and `popup.js`
- **Blocking page**: Edit `blocked.html` and `blocked.js`
- **Configuration**: Edit `config.js`

## 📝 Notes

- **Time-based**: Blocking is based on your computer's local time
- **Manifest V3**: Uses modern Chrome extension APIs
- **Privacy**: No data is collected or transmitted
- **Performance**: Minimal impact on browser performance
- **Updates**: Extension automatically checks for schedule changes every minute

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter issues or have questions:
1. Check the troubleshooting section above
2. Review the configuration examples
3. Open an issue on GitHub with details about your problem

---

**Happy productivity! 🚀** 