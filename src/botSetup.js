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