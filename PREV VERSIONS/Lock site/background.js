chrome.action.onClicked.addListener(function(tab) {
	chrome.runtime.openOptionsPage();
})

var STORAGE = {
	sites: [],
	redirect_url: '',
	subdomainOption: '1',
	enabled: '1',
	days_config:  [0,1,2,3,4,5,6],
	blockKeyList: [],
	lastUpdate: 0,
	pass: '',
	hour_option: '',
	hour_config_extra: [],
	iframeOption: '1',
	close_option: '',
	whiteList: '',
	read: []
}

var SITE_LIST_LENGTH_PREV = 0;

var activeTabs = {};
var tabBlockStatus = {};
const CONTEXT_MENU_ID = "Site_blocker_3";
var ACTIVE_TAB_ID = null;


chrome.storage.sync.get(null, function (items) {
	var data = items && items.storage ? JSON.parse(items.storage) : {};
	console.log('storage items: ', data)
	STORAGE = { ...STORAGE, ...data }
});


chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason === 'install') {
		STORAGE.subdomainOption = '1';
		STORAGE.enabled = '1';
		STORAGE.days_config = [0,1,2,3,4,5,6];
		saveObjToStorage();
	}
  
  });


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.method === 'getStorage') {
		sendResponse({ storage: STORAGE })
	}
	 else if (request.method === 'save_data') {
		const { sites = [] } = request || {};

		SITE_LIST_LENGTH_PREV = STORAGE.sites.length;
		STORAGE.sites = sites;
		saveObjToStorage();
		sendResponse({ status: 1 });

	}
	else if(request.method === 'update_redirect_url'){
		const { redirect_url = '' } = request || {};
		STORAGE.redirect_url = redirect_url;
		saveObjToStorage(true);
        sendResponse({ status: 1 });
	} 
	else if (request.method === 'updateObjKeys') {		
		const { obj = {} } = request || {};
		if (obj.sites) {
			SITE_LIST_LENGTH_PREV = obj.sites.length;
		}
		STORAGE = {
			...STORAGE,
			...obj
		}
		saveObjToStorage(request.skipRulesUpdate);
        sendResponse({ status: 1 });
	} 
	else if (request.method === 'site') {
		var isWorking = isEnabled('enabled');
		if (!isWorking) {
			chrome.contextMenus.removeAll();
			sendResponse({ needToBlock: '', type: type });
			return;
		}
	
		
		var currentSite = request.value;
		var fullsite = decodeURIComponent(request.site);
		fullsite = fullsite.replace('www.','').replace('http://','').replace('https://','');

		var isSiteInList = STORAGE.sites.includes(currentSite);
		var isWhiteListMode = isEnabled('whiteList');
		var isWhiteHourTime = isEnabled('hour_option');
		var blockSubdomains = isEnabled('subdomainOption');
		var allow_with_config = isWhiteHourTime ? isInExtraRange() : false;
		var isBlockedByTag = false;

		var needToBlock = false;

		if (allow_with_config) {
			needToBlock = false;
		} else {

			var isSiteBlockedByList = isSiteInList;
			var isBlockedByDomain = blockSubdomains && isSubdomainInList(STORAGE.sites, currentSite);
			isBlockedByTag = isBlockedByKey(currentSite,fullsite);

			needToBlock = (isSiteBlockedByList || isBlockedByDomain || isBlockedByTag);
			if (isWhiteListMode) {
				needToBlock = !needToBlock;
			}

			if (needToBlock) {
				var redirect_url = STORAGE.redirect_url;
				if(redirect_url && !redirect_url.includes(currentSite) && !currentSite.includes(redirect_url)){
					chrome.tabs.update(sender.tab.id, {url: redirect_url});
					return;
				}
				var close_tab = isEnabled('close_option');
				if (close_tab) {
					chrome.tabs.query({}, function(activeTabs) {
						var tabsCount = activeTabs.length;
						if (tabsCount === 1) {
							chrome.tabs.create({ url: 'chrome://newtab'})
						}
						chrome.tabs.remove(sender.tab.id);
					});

				}

			}

		}
		var text = 'Block this site';
		var type = '';
		if (isWhiteListMode) {
			if (isSiteInList || isBlockedByDomain) {
				text = 'Remove from white list';
			} else {
				text = 'Add to white list';
			}
		} else {
			if (isSiteInList || isBlockedByDomain) {
				text = 'Unblock this site';
			}
		}

		options = {
			id: CONTEXT_MENU_ID,
			title: text,
			contexts: ["all", "page"]
		}

		if (sender.tab && sender.tab.id) {
			tabBlockStatus[sender.tab.id] = text;
		}		
		if(request.firstCall && ACTIVE_TAB_ID === sender.tab.id) {
			chrome.contextMenus.removeAll(() => {
				chrome.contextMenus.create(options)
			});
		}

		if (isBlockedByTag) {
			type = 'Blocked by key config';
		} else if(isWhiteListMode && needToBlock){
			type = 'White list mode';
		}
		sendResponse({ needToBlock, type });
	
	}
	else {
		sendResponse({});
	}	
	return true;	
});



function saveObjToStorage(skipRulesUpdate = false){
	var storObj = {
		storage: JSON.stringify(STORAGE)
	}
	chrome.storage.sync.set(storObj, function() {});
	if (!skipRulesUpdate) {
		initWebRequestBlocking();
	}
	
}



try {
	chrome.contextMenus.removeAll(() => {
		chrome.contextMenus.create({
			id: CONTEXT_MENU_ID,
			title: "Block this site",
			contexts: ["all", "page"]		
		})
	});
} catch {}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == CONTEXT_MENU_ID) {
        onClickHandler(info, tab);
    }
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	activeTabs[tab.id] = tab;
	if(changeInfo.status === 'loading' && tab.url.startsWith('chrome')) {

		try {
			chrome.contextMenus.update(CONTEXT_MENU_ID, { visible: false });
		} catch(e) {
			console.log(e);
		}
	}
});

chrome.tabs.onRemoved.addListener(function (tabId) {
		delete activeTabs[tabId];
		delete tabBlockStatus[tabId];
	});

chrome.tabs.query({}, function(results) {	
    results.forEach(function(tab) {
        activeTabs[tab.id] = tab;
    });
});


function isEnabled(key){
	return +STORAGE[key] === 1;
}
function isInRange(hour_config) {
	if (!hour_config) {
		return false;
	}
    var from = +(hour_config.start.replace(/:/, ''));
    var to = +(hour_config.end.replace(/:/, ''));
	var date = new Date();
	
	var newHour = date.getHours();
	var newMinutes = date.getMinutes();
	if (newMinutes < 10) {
		newMinutes = '0'+newMinutes;
	}
    var newCurrent = +(newHour + '' + newMinutes);
    var dayChanged = to < from;
    if (!dayChanged) {
        return (from < newCurrent) && (newCurrent < to);
    } else {
        return newCurrent > from || newCurrent < to;
    }
}

function isInExtraRange() {
	var days =  STORAGE.days_config || [];
	var currentDayOfWeek = (new Date()).getDay();
	if (!days.includes(currentDayOfWeek)) {
		return false;
	}
    var hour_config_extra = STORAGE.hour_config_extra || [];
    for(var i = 0; i < hour_config_extra.length; i++){
    	if(isInRange(hour_config_extra[i])){
    		return true;
		}
	}
	return false;
}


function isSubdomainInList(data, site, getSite) {
	data = data || [];

	for (var i = 0; i < data.length; i++) {
		var current = '.' + data[i];
		if (site.endsWith(current)) {
			return getSite ? data[i] : true;
		}
	}
	return false;
}

function isBlockedByKey(site, fullSite) {
	var blockedKeys = STORAGE.blockKeyList || [];
	for (var i = 0; i < blockedKeys.length; i++) {
		if(site.includes(blockedKeys[i]) || fullSite.includes(blockedKeys[i])) {
			return true;
		}

	}
	return false;
}


function getLocation(href) {
	if(!href) {
		return {};
	}
	if(!href.startsWith('http')){
		href = `http://${href}`;
	}
	var url = new URL(href)
	return url
}



function onClickHandler(info, tab) {
	var currentSite = getLocation(info.pageUrl);
	currentSite = (currentSite.host || "").replace('www.', '');
	currentSiteHost = false;
	if (currentSite.startsWith('chrome-extension')) {
		return;
	}

	var action_type = '';
	var blockSubdomains = isEnabled('subdomainOption');
	if (blockSubdomains) {
		currentSiteHost = isSubdomainInList(STORAGE.sites, currentSite, true);
	}
	
	if (STORAGE.sites.includes(currentSite) || currentSiteHost) {
		if (currentSiteHost) {
			currentSite = currentSiteHost;
		}
		if (STORAGE.pass) {
			var sb_redirect = chrome.runtime.getURL('options/index.html') + '#' + currentSite;
			chrome.tabs.update(tab.id, { url: sb_redirect });
			return;
		}
		else {
			SITE_LIST_LENGTH_PREV = STORAGE.sites.length;
			STORAGE.sites = STORAGE.sites.filter(item => item != currentSite);
			saveObjToStorage();
			action_type = 'unblock';
		}

	}
	else {
		SITE_LIST_LENGTH_PREV = STORAGE.sites.length;
		STORAGE.sites.push(currentSite);
		saveObjToStorage();
		action_type = 'block';
	}


	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: action_type }, function () {});
	});

}
chrome.tabs.onActivated.addListener( function(tab) {
	if(!tab) {
		return
	}
	var id = tab.tabId;
	console.log('tabBlockStatus', tabBlockStatus);
	var text = tabBlockStatus[id];
	var currentTab = activeTabs[id];
	ACTIVE_TAB_ID = id;

	var disabled =  (currentTab && (currentTab.url.startsWith('chrome') || currentTab.url.startsWith('file:/') )); 
	var obj = { visible: !disabled};
	if (text) {
		obj.title = text
	}
	try {
		chrome.contextMenus.update(CONTEXT_MENU_ID, obj);
	} catch(e) {
		console.log('Err: ', e)
	}
	
})

function initWebRequestBlocking(){

	var isWorking = isEnabled('enabled');
	var isIframeOption = isEnabled('iframeOption');
    var isWhiteHourTime = isEnabled('hour_option');
    var allowed_with_time = isWhiteHourTime ? isInExtraRange() : false;
	var sitesCount = Math.max(SITE_LIST_LENGTH_PREV, STORAGE.sites.length);
	var removeRuleIds = (new Array(sitesCount + 10).fill(0)).map((i, index) => 1 + index);

	if (!isWorking || !isIframeOption ||  allowed_with_time) {
		console.log('rules removed');
		chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
		return;
	}

	if(STORAGE.sites.length > 0) {
		chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });

		STORAGE.sites.forEach((site, index) => {
			chrome.declarativeNetRequest.updateDynamicRules({
				addRules: [
					{
						id: index + 1,
						condition: {
							regexFilter: `^(((http(s?))\:\/\/)?(www.)?${site})`,
							resourceTypes: ['sub_frame'],
						},
						action: {
							type: 'block',
						},
					}
				],
			})

		})

	}

}
