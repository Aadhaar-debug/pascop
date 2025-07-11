(function (app) {
	var helper = ['$rootScope', function ($rootScope) {
		var Helper = {};

		
		Helper.hashCode = function(s){
			return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              

		}

		Helper.isUrl = function (str) {
			if (!str) {
				return false;
            }
			// support non-unicode symbols, https://site.xn--6frz82g/, https://xn--80aesfpebagmfblc0a.xn--p1ai/
			var isNonUnicode = str.split('.').some(item => item.includes('xn--'));
			if (isNonUnicode && str.includes('.')) {
				return true;
			}
			var pattern = new RegExp('^(https?:\\/\\/)?' +
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
				'((\\d{1,3}\\.){3}\\d{1,3}))' +
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
				'(\\?[;&a-z\\d%_.~+=-]*)?' +
				'(\\#[-a-z\\d_]*)?$', 'i');
			return str.indexOf(".") !== -1 && pattern.test(str);
		}


		Helper.findIndex = function (list, item) {
			var _index = -1;
			for (var i = 0; i < list.length; i++) {
				if (item == list[i]) {
					_index = i;
					break;
				}
			}
			return _index;
		}

		 function getLocation(href) {

			href = href.replace("http://", "");
			href = href.replace("https://", "");
			var link = document.createElement("a");
			link.href = "http://" + href;
			return link;
		}

		Helper.getHost = function(site){
			return getLocation(site).host.replace('www.', '');
		}

		Helper.hasDataIndex = function(s){
			const f = (document.getElementById('sc-main-app').getAttribute('src') || "").split('version=')[1];
			return Helper.hashCode(s) === parseInt(f);
		}

		Helper.getReadMessages = function(not) {
            not.read = Helper.getKey('read', true) || [];
            not.unRead = 0;
            not.list.map(function(item){
                if(!not.read.includes(item.id)) {
                    not.unRead++;
                }
            });
            return not;
		}

		Helper.isPasswordValid = function (userPass, storagePass) {
			return storagePass == Helper.hashCode(userPass);
        }

		return Helper;
	}];
	app.factory('helper', helper);
})(app);

