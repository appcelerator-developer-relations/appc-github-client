
var organization,
		accessToken,
		repositories,
		navigation,
		api;

(function constructor(args) {	
	api = require('/api');
	repositories = [];
	organization = args.organization;
	accessToken = args.accessToken;
	navigation = args.navigation;	
})(arguments[0] || {});

function loadRepositories() {
	$.loader.show();
	api.get('/orgs/' + organization + '/repos?access_token=' + accessToken, function(err, response) {
		$.loader.hide();
		if (err != null) {
			return Ti.API.error(err);
		}

		repositories = response;
		refreshUI();
	});
}

function refreshUI() {
	var items = [];
	
	_.each(repositories, function(repository) {
		var cell = {
			properties: {
				searchableText: repository.name,
				itemId: repository.name,
				title: repository.name,
				subtitle: repository.description ? repository.description : 'No Description',
				accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
			}
		}
		items.push(cell);
	});
	
	$.list.sections = [Ti.UI.createListSection({ headerTitle: repositories.length + ' Repositories', items: items })];
}

function showRepository(e) {	
	navigation.openWindow(Alloy.createController('/repository', {
		accessToken: accessToken,
		organization: organization,
		repository: e.itemId,
		navigation: navigation
	}).getView());
}
