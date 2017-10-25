
var organization,
		accessToken,
		repositoryIdentifier,
		repositoryDetails,
		navigation,
		api;

(function constructor(args) {	
	api = require('/api');
	organization = args.organization,
	accessToken = args.accessToken;
	navigation = args.navigation;
	repositoryIdentifier = args.repository;
	repositoryDetails = {};
	
	$.repository.setTitle(repositoryIdentifier);
})(arguments[0] || {});

function loadRepositoryDetails() {
	$.loader.show();
	
	api.get('/repos/' + organization + '/' + repositoryIdentifier + '?access_token=' + accessToken, function(err, response) {
		$.loader.hide();
		if (err != null) {
			return Ti.API.error(err);
		}

		repositoryDetails = response;
		refreshUI();
	});
}

function refreshUI() {
		console.log(repositoryDetails);
		$.debug.setValue(repositoryDetails);
}
