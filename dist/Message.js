"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
class Message {
	constructor({
		channel,
		text,
		isWhisper,
		isInstructions = false
	} = {}) {
		this.channel = channel;
		this.text = text;
		this.isWhisper = isWhisper;
		this.isInstructions = isInstructions;
	}
}
exports.default = Message;