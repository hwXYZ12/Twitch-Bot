import Message from "./Message";
import Queue from "./Queue";
import createPrivateClash from "./ClashOfCode";
const TRANSITION_TIME = 500;
const ANIMATIONS_CHECK_RATE = 2000;
const SUBS_CHECK_RATE = 10000;
const STALL_TIME = 8500;
const CHEER_MESSAGE_1 = " cheered with ";
const CHEER_MESSAGE_2 = " bits!";
const CHEER_MESSAGE_3 = " bit!";
const CHEER_SOUND_PATH = "sounds\\bits.ogg";
const CHEER_GIF_PATH = ["bitGifs\\gray.gif",
						"bitGifs\\purple.gif",
						"bitGifs\\green.gif",
						"bitGifs\\blue.gif",
						"bitGifs\\red.gif",
						"bitGifs\\gold.gif"];
const COC_MESSAGE = `To use the queue, turn on your whispers and initiate the conversation with the bot by typing: /w binarybot2013 hello!`;
const KEYS_FILE_PATH = 'C:\\Users\\Will\\Desktop\\more stuff\\even more stuff\\alertKeys.json';
const CHANNEL = "11111011101";
const MAX_SUB_CHECK = 100;
const fs = require('fs');

// get a reference to the twitch api
const twitchApi = require('twitch-api-v5');

export default class Logic {
	
	// pop a single cheer alert from the stack and display it
	handleAnimations(){

		if (this.cheerStack.length && this.notAnimating) {

			// lock animation resources
			this.notAnimating = false;

			// set the  alert name
			let theCheer = this.cheerStack.pop();
			let theName = theCheer.name;
			let theText = document.getElementById('cheerText');
			let theAmount = theCheer.bits;
			if(theAmount==1)
				theText.textContent = theName + CHEER_MESSAGE_1 + theAmount + CHEER_MESSAGE_3;	
			else
				theText.textContent = theName + CHEER_MESSAGE_1 + theAmount + CHEER_MESSAGE_2;	
			

			// pick the correct alert animation
			let which = 0;
			if(theAmount>=1 && theAmount < 100){
				which = 0;
			} else if(theAmount>=100 && theAmount < 1000){
				which = 1;
			} else if(theAmount>=1000 && theAmount < 5000){
				which = 2;
			} else if(theAmount>=5000 && theAmount < 10000){
				which = 3;
			} else if(theAmount>=10000 && theAmount < 100000){
				which = 4;
			} else if(theAmount>=100000){
				which = 5;
			}

			// set the alert animation
			let theAnimation = document.getElementById('cheerAnimation');
			theAnimation.src=CHEER_GIF_PATH[which];

			// transition the cheer alert into view
			let cheerAlert = document.getElementById('cheerAlert');
			cheerAlert.classList.add('isVisible');

			// play the current alert sound
			this.cheerSound.setTime = 0.00;
			this.cheerSound.play();

			// transition the cheer alert out of view
			setTimeout(()=>{

				// begin animation to remove the cheer alert
				cheerAlert.classList.remove('isVisible');

				// unlock animation resources										
				setTimeout(() => {
					this.notAnimating = true;
				}, TRANSITION_TIME);

			}, TRANSITION_TIME + STALL_TIME);
		}
		
	}
	
	// call to the twitch api every few seconds in order to maintain a local
	// list of subs such that whispers to the bot don't require an API to check
	// sub status
	checkSubs(){
		
		// Keys should be grabbed only once but this probably won't matter
		// too much since we'll be calling it with a slow poll rate
		// get client id and client secret from local file	
		let keys = JSON.parse(fs.readFileSync(KEYS_FILE_PATH, 'utf-8'));	
			
		// get keys from the file
		let clientId = keys['clientId'];
		let clientSecret = keys['clientSecret'];	
		let channelId = keys['channelId'];		
		let authToken = keys['authToken'];
		
		// set api client id
		twitchApi.clientID = clientId;

		// try to call the twitch api for the sub list
		try{

			twitchApi.channels.subs({auth: authToken, channelID: channelId, limit: MAX_SUB_CHECK}, (errors, ret) => {			

				if(ret == null){
					console.log(errors);
					return;
				}

				let setOfSubs = new Set();
				let newList = ret.subscriptions;
				for (let i=0; i < newList.length ; i++) {
					
					// push only the ids of subs to keep track of internally
					setOfSubs.add(newList[i].user._id);
				}

				// pass the reference to the new sub list to the logic class
				// to be used when someone whispers to the bot
				this.currentSubIds = setOfSubs;

			});

		} catch(e){
			console.log("ERROR - Error processing sub API call.");
		}
		
	}

	constructor(client, admin) {
		this.client = client;
		this.admin = admin;
		this.cheerStack = [];
		this.notAnimating = true;
		this.currentSubIds = new Set();
			
		// cheer alert sound	
		this.cheerSound = new Audio();
		this.cheerSound.src = CHEER_SOUND_PATH;
		
		let boundAnimations=this.handleAnimations.bind(this);
		setInterval(boundAnimations, ANIMATIONS_CHECK_RATE);
		
		let boundSubCheck=this.checkSubs.bind(this);
		setInterval(boundSubCheck, SUBS_CHECK_RATE);			
	}
	async run() {
	
		const { client, admin, cheerStack } = this;
		const https = require('https');
		const queue = new Queue(client);
		const subCocQueue = [];
		const nonSubCocQueue = [];
		let cocLink = "";
		let instructionsReady = true;
		const QUEUE_INSTRUCTIONS_COOLDOWN = 60000;
									
		// get client id and client secret from local file	
		let keys = JSON.parse(fs.readFileSync(KEYS_FILE_PATH, 'utf-8'));	
			
		// get keys from the file
		let clientId = keys['clientId'];
		let clientSecret = keys['clientSecret'];	
		let channelId = keys['channelId'];		
		let authToken = keys['authToken'];

		try {
			await client.connect();
			client.on("chat", (channel, user) => {
				if (user.username === client.opts.identity.username) {
					/* If this is our bot… */
					if (user.mod) {
						/* And we're a mod, we don't need a timeout */
						Queue.timeout = 500;
					}
					else {
						Queue.timeout = Queue.DEFAULT_TIMEOUT;
					}
				}
			});
			client.on("cheer", (channel, userstate, message) => {
				let cheer = {};
				cheer.bits=userstate.bits;
				cheer.name=userstate.username;
				cheerStack.push(cheer);
			});
			client.on("message", (channel, user, message) => {

				if (user.username === client.opts.identity.username) {
					// Don't take the bot's own messages into consideration
					// and ignore whispers (there is already an event that handles the whispers)
					return;
				}
				try {
					if (message === "!thibaud") {
						return queue.enqueue(new Message({
							channel,
							text: `@${user.username} Thibaud is an alright guy.`,
							isWhisper: false
						}));
					}
					if (message === "!m4ttrix") {
						return queue.enqueue(new Message({
							channel,
							text: `,,|,,__(o0)__,,|,,`,
							isWhisper: false
						}));
					}					
					if (message === "!willbot") {
						return queue.enqueue(new Message({
							channel,
							text: `@${user.username} Hello hello, welcome welcome, hope your day is going well :)`,
							isWhisper: false
						}));
					}				
					if (message === "!wilkins") {
						return queue.enqueue(new Message({
							channel,
							text: `@${user.username} have a warm one fellar  FeelsBadMan  :beers:  KKona`,
							isWhisper: false
						}));
					}
					if (message.toLowerCase() === "!q"
						|| message.toLowerCase() === "!queue") {

						// anyone trying to get into the queue will add
						// this message to the queue
						let message = COC_MESSAGE;
						queue.enqueue(new Message({
							channel,
							text: message,
							isWhisper: false,
							isInstructions: true
						}));
						
						// push user onto back of CoC queue user may only appear once in the queue
						if (!subCocQueue.includes(user.username)
							&&!nonSubCocQueue.includes(user.username)){

							let place;
							let body;
							let isSubscriber = this.currentSubIds.has(user['user-id'])||user.subscriber;
							if(isSubscriber){
								subCocQueue.push(`${user.username}`);
								place = subCocQueue.length;
								body = `You've been placed at spot ${place} in the Subscriber CoC Queue.`;
							} else {
								nonSubCocQueue.push(`${user.username}`);
								place = nonSubCocQueue.length;
								body = `You've been placed at spot ${place} in the Non-Subscriber CoC Queue.`;
							}
							let whisper = `PRIVMSG #jtv :/w ${user.username} ${body}`;
							queue.enqueue(new Message({
								channel,
								text: whisper,
								isWhisper: true
							}));
						}

						return;						
					}
					if (message.toLowerCase() === "!qlength") {
						
						let place1 = subCocQueue.length;
						let place2 = nonSubCocQueue.length;
						let body = `The Sub CoC Queue is of length ${place1} and
									the Non Sub CoC Queue is of length ${place2}.`;
						let whisper = `PRIVMSG #jtv :/w ${user.username} ${body}`;
						return queue.enqueue(new Message({
							channel,
							text: whisper,
							isWhisper: true
						}));
					}
					if (message === "!kdex") {
						return queue.enqueue(new Message({
							channel,
							text: `@${user.username} Oh @kdex__? He's an alright guy - 
							he helped setup this bot and he helped build the donation page background.
							Give him a follow!`,
							isWhisper: false
						}));
					}
					if (message === "!stashiocat") {
						return queue.enqueue(new Message({
							channel,
							text: `@${user.username} Oh @stashiocat? "I'm only still here because the stockholm syndrome has taken over"`,
							isWhisper: false
						}));
					}
					if (message === "!redpillme") {
						return queue.enqueue(new Message({
							channel,
							text: `@${user.username} Your mind is at war with reality and I could talk about it for hours!`,
							isWhisper: false
						}));
					}
				} catch (e) {
					console.log(e);
				}
			});
			client.on("whisper", async function (from, userstate, message, self) {
				
				// Don't listen to my own messages...
				if (self) return;

				try {
					if (from === '#'+admin && message === "!coc") {

						const keys = require(`C:/Users/Will/Desktop/more stuff/even more stuff/cocKeys.json`)
						cocLink = await createPrivateClash(keys.email, keys.password);

						// whisper to self
						let gibLink = `CoC Link: ${cocLink}`;
						let whisper2 = `PRIVMSG #jtv :/w ${admin} ${gibLink}`;
						queue.enqueue(new Message({
							channel: "",
							text: whisper2,
							isWhisper: true
						}));

						//  shift at most 11 users from the front of the CoC queue
						//  and send each user a link to the match
						for(let i = 0; i < 11; ++i){
							let a = nonSubCocQueue.length;
							let b = subCocQueue.length;
							if(a!=0 || b!=0){
								let subProbability =1-a/(a+1.5*b);
								let targetUser;
								if(Math.random() <= subProbability){
									targetUser = subCocQueue.shift();
								} else {
									targetUser = nonSubCocQueue.shift();
								}
								let body = `CoC Link: ${cocLink}`;
								let whisper = `PRIVMSG #jtv :/w ${targetUser} ${body}`;
								queue.enqueue(new Message({
									channel: "",
									text: whisper,
									isWhisper: true
								}));							
							}
						}
						return
						
					}
				}
				catch (e) {
					console.log(e);
				}				
			});
		}
		catch (e) {
			console.log(e);
			console.log("Failed to connect. Sorry about that.");
		}
	}

}