const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// "Following" feed: chronological, posts only from accounts you follow, no suggestions.
const START_URL = 'https://www.instagram.com/?variant=following';

function isInstagramHost(hostname) {
  return hostname === 'www.instagram.com' || hostname === 'instagram.com';
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    title: 'Monkeygram',
    autoHideMenuBar: true,
    webPreferences: {
      partition: 'persist:instagram',
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Strip "Electron/x.y.z" from the UA so Instagram treats us like a normal Chrome.
  const ua = win.webContents.getUserAgent().replace(/\s?Electron\/\S+/, '');
  win.webContents.setUserAgent(ua);

  // Links shared in DMs (YouTube, news articles, etc.) → open in default browser.
  // Anything that tries to open a new Instagram window is denied silently.
  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const u = new URL(url);
      if (!isInstagramHost(u.hostname)) shell.openExternal(url);
    } catch {}
    return { action: 'deny' };
  });

  const injectCss = fs.readFileSync(path.join(__dirname, 'inject.css'), 'utf8');
  const injectJs  = fs.readFileSync(path.join(__dirname, 'inject.js'),  'utf8');
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(injectCss);
    win.webContents.executeJavaScript(injectJs);
  });

  win.loadURL(START_URL);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
