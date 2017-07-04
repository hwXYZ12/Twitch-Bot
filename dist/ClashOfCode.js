"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const request = require("request-promise");

const BASE_URL = "https://www.codingame.com";

const login = (() => {
	var _ref = _asyncToGenerator(function* (username, password) {
		const options = {
			method: "POST",
			baseUrl: BASE_URL,
			url: "/services/CodingamerRemoteService/loginSiteV2",
			body: [username, password, true],
			jar: true,
			json: true
		};
		const body = yield request(options);
		if (!body.success) throw new Error("Unsuccessful login: " + body.error.message);

		return {
			userId: body.success.userId
		};
	});

	return function login(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

exports.default = (() => {
	var _ref2 = _asyncToGenerator(function* (username, password) {
		const loginInfo = yield login(username, password);
		const options = {
			method: "POST",
			baseUrl: BASE_URL,
			url: "/services/ClashOfCodeRemoteService/createPrivateClash",
			body: [loginInfo.userId, { SHORT: true }],
			jar: true,
			json: true
		};
		const body = yield request(options);
		if (!body.success) throw new Error("Unsuccessful creation: " + body.error.message);

		return `https://www.codingame.com/clashofcode/clash/${body.success.publicHandle}`;
	});

	return function (_x3, _x4) {
		return _ref2.apply(this, arguments);
	};
})();

/* Use like:
createPrivateClash("will@will.com", "will")
	.then(clashUrl => console.log(clashUrl))
	.catch(err => console.error(err));
*/