var SFAuthenticationSession = require('SafariServices/SFAuthenticationSession');
var NSURL = require('Foundation/NSURL');
var cb;

module.exports = exports = function AuthenticationSession(_cb) {
	cb = _cb;

	var session = SFAuthenticationSession.alloc().initWithURLCallbackURLSchemeCompletionHandler(
		NSURL.alloc().initWithString('https://github.com/login/oauth/authorize?scope=repo&client_id=91bdc40b5a4d4d77d6a3'), 
		'appcgithub://', 
		function(url, error) {
			if (error != null) {
				Ti.API.error('Error performing OAuth: ' + error.localizedDescription);
				cb({ success: false, error: 'Error performing OAuth: ' + error.localizedDescription });
				return;
			}
			
			cb({ success: true, url: url.absoluteString });
	});
	
	this.start = function() {
		session.start();
	};
};
