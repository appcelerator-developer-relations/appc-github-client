exports.get = function(path, cb) {
	var httpClient = Ti.Network.createHTTPClient({
		onload: function(e) {
			if (e.error) {
				cb(e.error, null);
				return;
			}
						
			cb(null, JSON.parse(this.responseText));
		},
		onerror: function(e) {
			cb(e.error, null);
		}
	});
	
	httpClient.open('GET', Alloy.CFG.Github.apiBase + path);
	httpClient.send();
};
