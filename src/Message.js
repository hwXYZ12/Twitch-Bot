export default class Message {
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