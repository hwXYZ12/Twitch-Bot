export default class Queue {
	/*
	* If the bot is not a channel moderator, it may not immediately respond. If it tries to, it'll get limited by Twitch.
	* `DEFAULT_TIMEOUT` acts as the default timeout when handling pending messages in the queue.
	* If your bot is a mod, it'll automatically be set to `0` at runtime. Don't change it.
	*/
	static DEFAULT_TIMEOUT = 1500;
	timeout = this.constructor.DEFAULT_TIMEOUT;
	buffer = [];
	constructor(client) {
		this.client = client;
		this.instructionsReady=true;
		const QUEUE_INSTRUCTIONS_COOLDOWN = 120000;
		setInterval(() => {
			if (this.buffer.length) {
				const {
					text,
					channel,
					isWhisper,
					isInstructions
				} = this.dequeue();
				if (isWhisper){
					client.raw(text);				
				} else if(isInstructions){
					if(this.instructionsReady){
						this.instructionsReady=false;
 						this.client.say(channel, text);

						// after a cooldown allow the message to be used again
						setInterval(()=>{this.instructionsReady = true}, QUEUE_INSTRUCTIONS_COOLDOWN);
					}
					
				} else {
 					this.client.say(channel, text);
				}
			}
		}, this.timeout);
	}
	enqueue(message) {
		this.buffer.push(message);
	}
	dequeue() {
		return this.buffer.shift();
	}
}