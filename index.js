// NOTE: non-working, waiting on https://github.com/gitterHQ/gitter/issues/533
// Basic OAuth Gitter authentication script: https://developer.gitter.im/docs/authentication

(function() {

	'use strict';


	// bling.js: https://gist.github.com/MadLittleMods/8dd8443de3923f4a1d0c
	let $ = document.querySelectorAll.bind(document);

	Node.prototype.on = window.on = function(names, fn) {
		names.split(/\s/).forEach(function(name) {
			this.addEventListener(name, fn);
		}.bind(this));

		// Keep the chaining going
		return this;
	};

	HTMLCollection.prototype.__proto__ = Array.prototype;
	NodeList.prototype.__proto__ = Array.prototype;

	NodeList.prototype.on = NodeList.prototype.addEventListener = function(name, fn) {
		this.forEach(function(elem) {
			elem.on(name, fn);
		});

		// Keep the chaining going
		return this;
	};





	// Utility function to read from the URL query string
	// via: http://stackoverflow.com/a/901144/796832
	let getQsParam = function(name, url) {
	    url = url || window.location.href;
	    name = name.replace(/[\[\]]/g, '\\$&');
	    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
	    let results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g,  ' '));
	};





	// Makes string key to DOM selector
	let inputLookupMap = {
		clientId: '.js-client-id',
		clientSecret: '.js-client-secret',
		redirectUri: '.js-redirect-uri'
	};

	let persistInputData = function() {
		Object.keys(inputLookupMap).forEach(function(key) {
			let selector = inputLookupMap[key];
			let value = $(selector)[0].value;
			if(value !== undefined) {
				window.localStorage[key] = value;
			}
		});
	};
	let restoreInputData = function() {
		Object.keys(inputLookupMap).forEach(function(key) {
			let selector = inputLookupMap[key];
			let value = window.localStorage[key];
			if(value !== undefined) {
				$(selector).forEach(function(element) {
					element.value = value;
				});
			}
		});
	};

	let getInputData = function() {
		let data = {};
		Object.keys(inputLookupMap).forEach(function(key) {
			let selector = inputLookupMap[key];
			data[key] = $(selector)[0].value;
		});

		return data;
	};





	// Restore any data to pre-fill the inputs
	restoreInputData();





	$('.start-authorization').on('click', function() {
		console.log('click');
		// Save anything before moving away
		persistInputData();

		let inputData = getInputData();
		window.location = `https://gitter.im/login/oauth/authorize?client_id=${inputData.clientId}&redirect_uri=${inputData.redirectUri}&response_type=code`;
	});







	let exchangeCodeForToken = function(code) {
		let inputData = getInputData();

		let reqBodyData = {
			client_id: inputData.clientId,
			client_secret: inputData.clientSecret,
			redirect_uri: inputData.redirectUri,
			grant_type: 'authorization_code',
			code: code
		};

		// TODO:
		// This call currently doesn't work because the lack of `Access-Control-Allow-Origin` header
		// on the response makes the browser not allow us to see the response
		// Wait for https://github.com/gitterHQ/gitter/issues/533
		return fetch('https://gitter.im/login/oauth/token', {
			method: 'post',
			//mode: 'no-cors',
			body: JSON.stringify(reqBodyData)
		})
		.then(function(response) {
			console.log(response);
		});
	};




	// Once they have authorized our app, they will be redirected back here
	// with the `code` parameter in the query string.
	// Now we can go get their personal access token
	let oauthCode = getQsParam('code');
	if(oauthCode) {
		exchangeCodeForToken(oauthCode)
			.catch(function(err) {
				console.log(err, err.stack);
			});
	}



})();














