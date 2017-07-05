import Logic from "./Logic";
import { client as Client } from "tmi.js";
const TWITCH_OAUTH_KEY = process.env.TWITCH_OAUTH_KEY;
// This is the admin account that the bot should listen to
const admin = "11111011101";
const client = new Client({
	options: {
		debug: true
	},
	connection: {
		reconnect: true
	},
	identity: {
		// Account information for the bot. The password is an OAuth key read from an environment variable named `TWITCH_OAUTH_KEY`. 
		username: "binarybot2013",
		password: TWITCH_OAUTH_KEY
	},
	// Here, you should enter a list of channels the bot should enter once started up.
	channels: [`#${admin}`]
});
const botLogic = new Logic(client, admin);
botLogic.run();

// use electron to setup a browser window upon initiation of the bot
const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
	
	const WINDOW_WIDTH = 900;
	const WINDOW_HEIGHT = 300;
	const WINDOW_INITIAL_X = 0;//-900;
	const WINDOW_INITIAL_Y = 0;//10;
	
  // Create the browser window.
  win = new BrowserWindow({width: WINDOW_WIDTH,
							height: WINDOW_HEIGHT,
							frame: true,
							x: WINDOW_INITIAL_X,
							y: WINDOW_INITIAL_Y});

  // and load the index.html of the app.
  win.loadURL(url.format({
	pathname: path.join(__dirname, 'index.html'),
	protocol: 'file:',
	slashes: true
  }))

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
	// Dereference the window object, usually you would store windows
	// in an array if your app supports multi windows, this is the time
	// when you should delete the corresponding element.
	win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
	app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
	createWindow()
  }
})