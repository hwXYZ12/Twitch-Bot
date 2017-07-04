const request = require("request-promise");

const BASE_URL = "https://www.codingame.com";

const login = async (username, password) => {
	const options = {
		method: "POST",
		baseUrl: BASE_URL,
		url: "/services/CodingamerRemoteService/loginSiteV2",
		body: [username, password, true],
		jar: true,
		json: true
	};
	const body = await request(options);
	if (!body.success) throw new Error("Unsuccessful login: " + body.error.message);

	return {
		userId: body.success.userId
	};
};

export default async (username, password) => {
	const loginInfo = await login(username, password);
	const options = {
		method: "POST",
		baseUrl: BASE_URL,
		url: "/services/ClashOfCodeRemoteService/createPrivateClash",
		body: [loginInfo.userId, {SHORT: true}],
		jar: true,
		json: true
	};
	const body = await request(options);
	if (!body.success) throw new Error("Unsuccessful creation: " + body.error.message);

	return `https://www.codingame.com/clashofcode/clash/${body.success.publicHandle}`;
};

/* Use like:
createPrivateClash("will@will.com", "will")
	.then(clashUrl => console.log(clashUrl))
	.catch(err => console.error(err));
*/