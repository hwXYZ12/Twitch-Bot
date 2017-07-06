"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Message = require("./Message");

var _Message2 = _interopRequireDefault(_Message);

var _Queue = require("./Queue");

var _Queue2 = _interopRequireDefault(_Queue);

var _ClashOfCode = require("./ClashOfCode");

var _ClashOfCode2 = _interopRequireDefault(_ClashOfCode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const TRANSITION_TIME = 500;
const ANIMATIONS_CHECK_RATE = 2000;
const STALL_TIME = 8500;
const CHEER_MESSAGE_1 = " cheered with ";
const CHEER_MESSAGE_2 = " bits!";
const CHEER_MESSAGE_3 = " bit!";
const CHEER_SOUND_PATH = "sounds\\bits.ogg";
const CHEER_GIF_PATH = ["bitGifs\\gray.gif", "bitGifs\\purple.gif", "bitGifs\\green.gif", "bitGifs\\blue.gif", "bitGifs\\red.gif", "bitGifs\\gold.gif"];
class Logic {

	// pop a single cheer alert from the stack and display it
	handleAnimations() {

		if (this.cheerStack.length && this.notAnimating) {

			// lock animation resources
			this.notAnimating = false;

			// set the  alert name
			let theCheer = this.cheerStack.pop();
			let theName = theCheer.name;
			let theText = document.getElementById('cheerText');
			let theAmount = theCheer.bits;
			if (theAmount == 1) theText.textContent = theName + CHEER_MESSAGE_1 + theAmount + CHEER_MESSAGE_3;else theText.textContent = theName + CHEER_MESSAGE_1 + theAmount + CHEER_MESSAGE_2;

			// pick the correct alert animation
			let which = 0;
			if (theAmount >= 1 && theAmount < 100) {
				which = 0;
			} else if (theAmount >= 100 && theAmount < 1000) {
				which = 1;
			} else if (theAmount >= 1000 && theAmount < 5000) {
				which = 2;
			} else if (theAmount >= 5000 && theAmount < 10000) {
				which = 3;
			} else if (theAmount >= 10000 && theAmount < 100000) {
				which = 4;
			} else if (theAmount >= 100000) {
				which = 5;
			}

			// set the alert animation
			let theAnimation = document.getElementById('cheerAnimation');
			theAnimation.src = CHEER_GIF_PATH[which];

			// transition the cheer alert into view
			let cheerAlert = document.getElementById('cheerAlert');
			cheerAlert.classList.add('isVisible');

			// play the current alert sound
			this.cheerSound.setTime = 0.00;
			this.cheerSound.play();

			// transition the cheer alert out of view
			setTimeout(() => {

				// begin animation to remove the cheer alert
				cheerAlert.classList.remove('isVisible');

				// unlock animation resources										
				setTimeout(() => {
					this.notAnimating = true;
				}, TRANSITION_TIME);
			}, TRANSITION_TIME + STALL_TIME);
		}
	}

	constructor(client, admin) {
		this.client = client;
		this.admin = admin;
		this.cheerStack = [];
		this.notAnimating = true;

		// cheer alert sound	
		this.cheerSound = new Audio();
		this.cheerSound.src = CHEER_SOUND_PATH;

		let boundAnimations = this.handleAnimations.bind(this);
		setInterval(boundAnimations, ANIMATIONS_CHECK_RATE);
	}
	run() {
		var _this = this;

		return _asyncToGenerator(function* () {

			const { client, admin, cheerStack } = _this;
			const https = require('https');
			const queue = new _Queue2.default(client);
			const cocQueue = [];
			let cocLink = "";
			let rotateQueue = false;
			let instructionsReady = true;
			const QUEUE_INSTRUCTIONS_COOLDOWN = 45000;
			try {
				yield client.connect();
				client.on("chat", function (channel, user) {
					if (user.username === client.opts.identity.username) {
						/* If this is our bot… */
						if (user.mod) {
							/* And we're a mod, we don't need a timeout */
							_Queue2.default.timeout = 500;
						} else {
							_Queue2.default.timeout = _Queue2.default.DEFAULT_TIMEOUT;
						}
					}
				});
				client.on("cheer", function (channel, userstate, message) {
					let cheer = {};
					cheer.bits = userstate.bits;
					cheer.name = userstate.username;
					cheerStack.push(cheer);
				});
				client.on("message", function (channel, user, message) {

					if (user.username === client.opts.identity.username) {
						/* Don't take the bot's own messages into consideration */
						return;
					}
					try {
						if (message === "!thibaud") {
							return queue.enqueue(new _Message2.default({
								channel,
								text: `@${user.username} Thibaud is an alright guy.`,
								isWhisper: false
							}));
						}
						if (message === "!m4ttrix") {
							return queue.enqueue(new _Message2.default({
								channel,
								text: `,,|,,__(o0)__,,|,,`,
								isWhisper: false
							}));
						}
						if (message === "!willbot") {
							return queue.enqueue(new _Message2.default({
								channel,
								text: `@${user.username} Hello hello, welcome welcome, hope your day is going well :)`,
								isWhisper: false
							}));
						}
						if (message.toLowerCase() === "!q" || message.toLowerCase() === "!queue") {

							// push user onto back of CoC queue user may only appear once in the queue
							if (!cocQueue.includes(user.username)) {
								cocQueue.push(`${user.username}`);
								let place = cocQueue.length + 1;
								let body = `You've been placed at spot ${place} in the CoC Queue.`;
								let whisper = `PRIVMSG #jtv :/w ${user.username} ${body}`;
								queue.enqueue(new _Message2.default({
									channel,
									text: whisper,
									isWhisper: true
								}));
							}

							// anyone trying to get into the queue may trigger
							// this message in chat which explains how to use the queue
							if (instructionsReady) {
								let message = `To use the queue turn on your whispers and initiate the
											conversation with the bot by typing: /w binarybot2013 hello!`;
								queue.enqueue(new _Message2.default({
									channel,
									text: message,
									isWhisper: false
								}));

								// after a cooldown allow the message to be used again
								instructionsReady = false;
								setInterval(function () {
									instructionsReady = true;
								}, QUEUE_INSTRUCTIONS_COOLDOWN);
							}

							return;
						}
						if (message.toLowerCase() === "!qlength") {

							let place = cocQueue.length + 1;
							let body = `The CoC Queue is of length ${place}.`;
							let whisper = `PRIVMSG #jtv :/w ${user.username} ${body}`;
							return queue.enqueue(new _Message2.default({
								channel,
								text: whisper,
								isWhisper: true
							}));
						}
						if (message === "!kdex") {
							return queue.enqueue(new _Message2.default({
								channel,
								text: `@${user.username} Oh @kdex__? He's an alright guy - 
							he helped setup this bot and he helped build the donation page background.
							Give him a follow!`,
								isWhisper: false
							}));
						}
						if (message === "!stashiocat") {
							return queue.enqueue(new _Message2.default({
								channel,
								text: `@${user.username} Oh @stashiocat? "I'm only still here because the stockholm syndrome has taken over"`,
								isWhisper: false
							}));
						}
						if (message === "!redpillme") {
							return queue.enqueue(new _Message2.default({
								channel,
								text: `@${user.username} Your mind is at war with reality and I could talk about it for hours!`,
								isWhisper: false
							}));
						}
					} catch (e) {
						console.log(e);
					}
				});
				client.on("whisper", (() => {
					var _ref = _asyncToGenerator(function* (from, userstate, message, self) {

						// Don't listen to my own messages..
						if (self) return;

						try {
							if (from === '#' + admin && message === "!coc") {

								const keys = require(`C:/Users/Will/Desktop/more stuff/even more stuff/cocKeys.json`);
								cocLink = yield (0, _ClashOfCode2.default)(keys.email, keys.password);

								console.log(cocLink);

								// not even 7 people in the queue

								// whisper to self
								let gibLink = `CoC Link: ${cocLink}`;
								let whisper2 = `PRIVMSG #jtv :/w ${admin} ${gibLink}`;
								queue.enqueue(new _Message2.default({
									channel: "",
									text: whisper2,
									isWhisper: true
								}));

								//  shift at most 7 users from the front of the CoC queue
								//  and send each user a link to the match
								for (let i = 0; i < 7; ++i) {
									if (cocQueue.length > 0) {
										let targetUser = cocQueue.shift();
										let body = `CoC Link: ${cocLink}`;
										let whisper = `PRIVMSG #jtv :/w ${targetUser} ${body}`;
										queue.enqueue(new _Message2.default({
											channel: "",
											text: whisper,
											isWhisper: true
										}));
									}
								}
								return;
							}
						} catch (e) {
							console.log(e);
						}
					});

					return function (_x, _x2, _x3, _x4) {
						return _ref.apply(this, arguments);
					};
				})());
			} catch (e) {
				console.log(e);
				console.log("Failed to connect. Sorry about that.");
			}
		})();
	}

}
exports.default = Logic;