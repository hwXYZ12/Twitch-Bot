import Message from "./Message";
import Queue from "./Queue";
import createPrivateClash from "./ClashOfCode";
export default class Logic {
	constructor(client, admin) {
		this.client = client;
		this.admin = admin;
	}
	async run() {
		const { client, admin } = this;
		const https = require('https');
		const queue = new Queue(client);
		const cocQueue = [];
		let cocLink = "";
		let rotateQueue = false;
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
			client.on("message", (channel, user, message) => {
				if (user.username === client.opts.identity.username) {
					/* Don't take the bot's own messages into consideration */
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
					if (message.toLowerCase() === "!q") {

						// push user onto back of CoC queue user may only appear once in the queue
						if (!cocQueue.includes(user.username)){
							cocQueue.push(`${user.username}`);
							let place = cocQueue.length+1;
							let body = `You've been placed at spot ${place} in the CoC Queue.`;
							let whisper = `PRIVMSG #jtv :/w ${user.username} ${body}`;
							return queue.enqueue(new Message({
								channel,
								text: whisper,
								isWhisper: true
							}));
						}
					}
					if (message.toLowerCase() === "!qlength") {
						
						let place = cocQueue.length;
						let body = `The CoC Queue is of length ${place}.`;
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
				
				// Don't listen to my own messages..
				if (self) return;

				try {
					if (from === '#'+admin && message === "!coc") {

						const keys = require(`C:/Users/Will/Desktop/more stuff/even more stuff/cocKeys.json`)
						cocLink = await createPrivateClash(keys.email, keys.password);
						
						console.log(cocLink);

						// not even 7 people in the queue

						// whisper to self
						let gibLink = `CoC Link: ${cocLink}`;
						let whisper2 = `PRIVMSG #jtv :/w ${admin} ${gibLink}`;
						queue.enqueue(new Message({
							channel: "",
							text: whisper2,
							isWhisper: true
						}));
						

						//  shift at most 7 users from the front of the CoC queue
						//  and send each user a link to the match
						for(let i = 0; i < 7; ++i){
							if(cocQueue.length > 0){
								let targetUser = cocQueue.shift();
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