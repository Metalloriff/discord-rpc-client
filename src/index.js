const { app, BrowserWindow, Tray, Menu } = require("electron");
const fs = require("fs");
const path = require("path");

let tray;
function initTray() {
	tray = new Tray(path.join(__dirname, "img", "icon.png"));

	const contextMenu = Menu.buildFromTemplate([
		{ label: "Show", click: () => mainWindow.show() },
		{ label: "Quit", click: () => app.exit(1) }
	]);

	tray.setToolTip("Discord RPC Client");
	tray.setContextMenu(contextMenu);

	tray.on("click", () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show());
}

let mainWindow;
async function init() {
	// Create the main window
	if (mainWindow) return;
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
			webviewTag: true
		}
	});

	// Prevent the app from quitting when the window is closed
	// Instead, hide the window
	mainWindow.on("close", e => (e.preventDefault(), mainWindow.hide()));

	if (process.argv.includes("--dev")) {
		await mainWindow.loadURL("http://localhost:3000/");
	}
	else {
		await mainWindow.loadFile(path.join(__dirname, "frontend", "dist", "index.html"));
	}
}

// Disable hardware acceleration because hardware acceleration is a useless sack of garbage that just slows apps down and causes them to crash randomly for no reason
app.disableHardwareAcceleration();
// And then initialize when ready :)
app.whenReady().then(() => (init(), initTray()));
// When all windows are closed, die
app.on("window-all-closed", app.exit.bind(app, 1));