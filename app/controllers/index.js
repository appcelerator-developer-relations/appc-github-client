var accessToken,
		isAuthorized,
		TiIdentity,
		keychainItem,
		organizations,
		api;

(function constructor() {	
	
	TiIdentity = require('ti.identity');
	api = require('/api');
	organizations = [];
	
	keychainItem = TiIdentity.createKeychainItem({
		identifier: 'githubAccessToken',
		accessGroup: Alloy.CFG.iOS.teamID + '.' + Ti.App.getId()
	});
	
	keychainItem.read();
	
	keychainItem.addEventListener('read', function(e) {		
		if (e.success) {			
			accessToken = e.value;
			fetchOrganizations();
		}

		isAuthorized = e.success;
		toggleAuthButton();
	});
	
	keychainItem.addEventListener('save', function(e) {		
		isAuthorized = e.success;
		toggleAuthButton();
		keychainItem.read();
	});
	
	keychainItem.addEventListener('reset', function(e) {
		isAuthorized = false;
		$.list.sections = [];
		toggleAuthButton();
	});	
		
	$.index.open();
})();

function authorize() {
	if (!isAuthorized) {
		logIn();
	} else {
		logOut();
	}
}

function toggleAuthButton() {
	
	$.list.setVisible(isAuthorized);
	$.landing.setVisible(!isAuthorized);
	
	$.authButon.setTitle(isAuthorized ? 'Log-Out' : 'Log-In');
}

function logIn() {
	if (OS_IOS) {
		var AuthenticationSession = require('titanium-authentication-session');
		var session = new AuthenticationSession(function(e) {
			if (!e.success) {
				return;
			}
			
			var code = e.url.componentsSeparatedByString('=');
			code = String(code.objectAtIndex(1));
			
			Ti.API.info('Getting access-token with code: ' + code);

			var httpClient = Ti.Network.createHTTPClient({
				onload: function(e) {
					var _accessToken = this.responseText.split('access_token=')[1].split('&')[0];
					
					saveAccessTokenToKeychain(_accessToken);
				},
				onerror: function(e) {
					Ti.API.error(e.error);
				}
			});
			
			httpClient.open('GET', 'https://github.com/login/oauth/access_token?client_id=' + Alloy.CFG.Github.clientID + '&client_secret=' + Alloy.CFG.Github.secretID + '&code=' + code);
			httpClient.send();
		});
		session.start();
	} else {
		// TODO: Add Android OAuth
	}
}

function fetchOrganizations() {
	$.loader.show();
	
	api.get('/user/orgs?access_token=' + accessToken, function(err, response) {
		$.loader.hide();
		if (err != null) {
			logOut();
			showAuthError();
			return Ti.API.error(err);
		}
		
		organizations = response;
		refreshUI();
	});
}

function saveAccessTokenToKeychain(accessToken) {
	keychainItem.fetchExistence(function(e) {
		if (!e.exists) {
			keychainItem.save(accessToken);
		} else {
			keychainItem.update(accessToken);
		}
	});
}

function refreshUI() {
	var items = [];
	
	_.each(organizations, function(organization) {
		var cell = {
			properties: {
				itemId: organization.login,
				title: organization.login,
				subtitle: organization.description ? organization.description : 'No Description',
				accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
			}
		}
		items.push(cell);
	});
	
	$.list.sections = [Ti.UI.createListSection({ headerTitle: organizations.length + ' Organizations', items: items })];
}

function showOrganizationRepositories(e) {
	$.index.openWindow(Alloy.createController('/repositories', {
		accessToken: accessToken,
		organization: e.itemId,
		navigation: $.index
	}).getView());
}

function showAuthError() {
	var alert = Ti.UI.createAlertDialog({
		title: 'Cannot get organizations',
		message: 'Your Github access-token probably expired. Do you want to log-in again?',
		buttonNames: ['No, thanks', 'Log-In now'],
		preferred: 1,
		cancel: 0
	});
	alert.addEventListener('click', function(e) {
		if (e.index === 1) {
			logIn();
		}
	})
	alert.show();
}

function logOut() {
	keychainItem.reset(); // Will trigger the "reset" event and toggle the UI
}
