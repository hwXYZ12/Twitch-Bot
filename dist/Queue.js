"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
class Queue {
	constructor(client) {
		this.timeout = this.constructor.DEFAULT_TIMEOUT;
		this.buffer = [];

		this.client = client;
		setInterval(() => {
			if (this.buffer.length) {
				const {
					text,
					channel,
					isWhisper
				} = this.dequeue();
				if (isWhisper) {
					client.raw(text);
				} else {
					this.client.say(channel, text);
				}
			}
		}, this.timeout);
	}
	/*
 * If the bot is not a channel moderator, it may not immediately respond. If it tries to, it'll get limited by Twitch.
 * `DEFAULT_TIMEOUT` acts as the default timeout when handling pending messages in the queue.
 * If your bot is a mod, it'll automatically be set to `0` at runtime. Don't change it.
 */

	enqueue(message) {
		this.buffer.push(message);
	}
	dequeue() {
		return this.buffer.shift();
	}
}
exports.default = Queue;
Queue.DEFAULT_TIMEOUT = 1500;