"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
class Message {
	constructor({
		channel,
		text,
		isWhisper
	} = {}) {
		this.channel = channel;
		this.text = text;
		this.isWhisper = isWhisper;
	}
}
exports.default = Message;