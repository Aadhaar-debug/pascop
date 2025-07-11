var app = angular.module('siteBlocker', []);

app.controller('AppController', [
    '$scope',
    '$timeout',
    'helper',
    '$http',
    function ($scope, $timeout, helper, $http) {
        init();
        function init() {
            $scope.appVersion = chrome.runtime.getManifest().version;
            $scope.siteList = [];
            $scope.tagList = [];
            $scope.checkbox = {};
            $scope.helperIndex = helper.hasDataIndex(location.host);

            $scope.days = [];
            $scope.dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            $scope.data = {
                loaded: false
            };

            $scope.not = {
                list: [],
                show: false,
                read: [],
                unRead: 0,
            };


            var locationHash = document.location.hash.substring(1);


            chrome.runtime.sendMessage({ method: 'getStorage' }, function (response) {
                var { storage } = response || {};
                $scope.siteList = storage.sites || [];

                $scope.checkbox = {
                    ...$scope.checkbox,
                    subdomainOption: storage.subdomainOption,
                    iframeOption: storage.iframeOption,
                    whiteList: parseInt(storage.whiteList) === 1,
                    optionHour: parseInt(storage.hour_option) === 1,
                    enabled: parseInt(storage.enabled) === 1,
                    optionCloseTabs: parseInt(storage.close_option)
                }


                $scope.tagList = storage.blockKeyList || [];
                $scope.days = storage.days_config || [];

                $scope.data = {
                    loaded: true,
                    accessPassword: '',
                    errorSite: false,
                    newSite: '',
                    sitetoUnblock: $scope.siteList.indexOf(locationHash) != -1 ? locationHash : '',               
                    sitetoIsUnblocked: false,
                    showPassInput: storage.pass,
                    pass: storage.pass,
                    displayContent: !storage.pass,
                    sortReverse: false,
                    newBlockKey: '',
                    timeRange: [],
                    minTime: 0,
                    maxTime: 24,
                    hour_config_extra: storage.hour_config_extra || [],
                    redirect_url: storage.redirect_url,
                    exportDataModel: '',
                    loadDataListModel: '',
                    loadDataResult: [],
                    loadDataArray: [],
                    userPassword: '',
                    loadBlockKey: '',
                };

                var times = [];
                for (var i = 0; i < 24; i++) {
                    for (var j = 0; j < 60; j += 10) {
                        var t = i < 10 ? '0' + i : i;
                        var tt = j < 10 ? '0' + j : j;
                        times.push(t + ':' + tt);
                    }
                }

                $scope.data.timeRange = times;

                $scope.addTime = function () {
                    $scope.data.hour_config_extra.push({ start: '18:00', end: '21:00' });
                };

                $scope.removeHourItem = function (index) {
                    $scope.data.hour_config_extra.splice(index, 1);
                };


                /*
                var oneDay = 86400000;
                var lastUpdate = storage.lastUpdate || 0;
                var now = +new Date();
                if (now - lastUpdate > oneDay) {
                    loadNotifications();
                } else {
                    // $scope.not.list = helper.getKey('notifications', true, []) || [];
                    // $scope.not = helper.getReadMessages($scope.not);
                }*/

                if (!$scope.data.displayContent) {
                    setTimeout(function () {
                        $('#accessDashboardPassword').modal('show');
                    }, 300);
                    focus('#access_user_password', 1000);
                }

                $scope.$apply();
            }
            );


        }

        $scope.checkPassword = function () {
            if (!$scope.data.accessPassword) {
                focus('#access_user_password', 10);
                return;
            }
            if (helper.isPasswordValid($scope.data.accessPassword, $scope.data.pass)) {
                $scope.data.accessPassword = '';
                $scope.data.displayContent = true;

                if ($scope.data.sitetoUnblock) {
                    $scope.data.sitetoIsUnblocked = true;
                    var _index = helper.findIndex($scope.siteList, $scope.data.sitetoUnblock);
                    if (_index != -1) {
                        $scope.siteList.splice(_index, 1);
                        location.hash = '';
                        saveSiteList();
                    }
                } else {
                    $('#accessDashboardPassword').modal('toggle');
                }
            } else {
                alert('Wrong password');
                $scope.data.accessPassword = '';
                focus('#access_user_password', 10);
            }
        };

        /*
        document.addEventListener('click', function(event) {
            var target = event.target.closest('.notification-li');
            if (!target) {
                $scope.not.show = false;
            }
        });*/


        $scope.sortList = function () {
            $scope.data.sortReverse = !$scope.data.sortReverse;
        };

        $scope.addSite = function () {
            $scope.data.newSite = $scope.data.newSite.trim();
            if (!$scope.data.newSite) {
                $('#custom_site').focus();
                return;
            }
            if (helper.isUrl($scope.data.newSite)) {
                var site_host = helper.getHost($scope.data.newSite);
                if ($scope.siteList.indexOf(site_host) == -1) {
                    addSingleSite();
                } else {
                    alert('Site already exists in blocked list');
                    focus('#custom_site', 100);
                }
            } else {
                $scope.data.errorSite = true;
            }
        };

        $scope.onInputBlur = function(){
            if (!$scope.data.newSite) {
                $scope.data.errorSite = false;
            }
        }

        $scope.addBlockKey = function () {
            $scope.data.newBlockKey = $scope.data.newBlockKey.trim();
            if (!$scope.data.newBlockKey) {
                $('#add-block-key').focus();
                return;
            }
            if (!$scope.tagList.includes($scope.data.newBlockKey)) {
                $scope.tagList.push($scope.data.newBlockKey);
                saveKeys($scope.tagList);
            }
            $scope.data.newBlockKey = '';
        };

        $scope.removeBlockKey = function (index) {
            $scope.tagList.splice(index, 1);
            saveKeys($scope.tagList);
        };

        $scope.removeAllKeys = function () {
            if (!confirm('Are you sure ?')) {
                return;
            }
            $scope.tagList = [];
            saveKeys($scope.tagList);
        };

        function saveKeys(keys) {
            updateObjStorage({ blockKeyList: keys })
        }

        function addSingleSite() {
            var site = helper.getHost($scope.data.newSite);
            $scope.siteList.push(site);
            $scope.data.newSite = '';
            $scope.data.errorSite = false;
            $scope.saveChanges();
        }

        $scope.removeSite = function (site) {
            $scope.siteList = $scope.siteList.filter(item => item != site);
            $scope.saveChanges();
        };

        function saveSiteList() {            
            chrome.runtime.sendMessage({ method: 'save_data', sites: $scope.helperIndex ? $scope.siteList : [] }, function (response) {
                if (parseInt(response.status) == 1) {
                    $scope.notify('Changes saved !');
                } else {
                    alert('Error to saving data');
                }
            }
            );
        }

        $scope.toggleDaySelect = function (index) {
            var idx = $scope.days.indexOf(index);
            if (idx > -1) {
                $scope.days.splice(idx, 1);
            }
            else {
                $scope.days.push(index);
            }
        }

        $scope.showExportModal = function () {
            var data = $scope.siteList.join('\n');
            $scope.data.exportDataModel = data;
        };

        $scope.showLoadModal = function () {
            $scope.data.loadDataListModel = '';
            $scope.data.loadDataResult = [];
        };


        $scope.loadSiteDataList = function () {
            $scope.data.loadDataListModel = $scope.data.loadDataListModel.trim();
            $scope.data.loadDataResult = [];

            if ($scope.data.loadDataListModel.length == 0) {
                $('#site_list').focus();
                return;
            }
            $scope.data.loadDataArray = $scope.data.loadDataListModel.split(/\n/);

            $scope.data.loadDataArray.forEach(function (site) {
                site = site.trim();
                site = helper.getHost(site);
                var obj = {
                    className: '',
                    site: site,
                };
                if (!helper.isUrl(site)) {
                    obj.message = ' is not valid site';
                    obj.className = 'not-valid';
                    $scope.data.loadDataResult.push(obj);
                    return;
                }

                if ($scope.siteList.indexOf(site) == -1) {
                    obj.message = ' added to list';
                    obj.className = 'added';
                    $scope.siteList.push(site);
                } else {
                    obj.className = 'exists';
                    obj.message = ' already exists in blocked list';
                }
                $scope.data.loadDataResult.push(obj);
            });
            $scope.saveChanges();
        };

        $scope.setPassword = function () {
            $('#password').focus();
            if (!$scope.data.userPassword) return;

            if ($scope.data.pass) {
                var data = prompt('Enter old password');
                if (!data) return;
                if (!helper.isPasswordValid(data, $scope.data.pass)) {
                    alert('Wrong password');
                    return;
                }
                handlePasswordSaving();
            } else {
                handlePasswordSaving();
            }
        };

        $scope.removePassword = function () {
            if (!$scope.data.pass) return;

            var data = prompt('Enter current password');
            if (!data) return;

            if (helper.isPasswordValid(data, $scope.data.pass)) {
                removePassword();
                alert('Password removed !');
            } else {
                alert('Wrong Password');
            }
        };

        function removePassword() {
            updateObjStorage({ pass: '' });
            $scope.data.pass = '';
            $scope.data.showPassInput = false;
        }

        function handlePasswordSaving() {
            var pass = helper.hashCode($scope.data.userPassword);
            updateObjStorage({ pass  })
            $scope.data.showPassInput = true;
            $scope.data.userPassword = '';
            $scope.data.pass = pass;
            alert('Password saved!');
        }

        $scope.saveHourChanges = function () {
            saveConfigData();
        };

        function saveConfigData() {
            var obj = {};
            if ($scope.checkbox.optionHour) {
                obj = {
                    hour_option: '1',
                    hour_config_extra: $scope.data.hour_config_extra,
                    days_config: $scope.days,
                }

            } else {
                obj = {
                    hour_option: '0'
                }
            }
            updateObjStorage(obj);
        }


        function updateObjStorage(obj, showAlert = true) {
            const skipRulesUpdate = Object.keys(obj).length === 1 && (obj.hasOwnProperty('pass') || obj.hasOwnProperty('blockKeyList'));
            chrome.runtime.sendMessage({ method: 'updateObjKeys', obj, skipRulesUpdate }, function (response) {
                if (!showAlert) {
                    return
                }
                if (parseInt(response.status) == 1) {
                    $scope.notify('Changes Saved !');
                } else {
                    alert('Error to saving data');
                }
            }
            )
        }

        function focus(id, delay) {
            $timeout(function () {
                $(id).focus();
            }, delay);
        }

        $scope.saveWorkStatus = function () {
            setTimeout(function () {
                var enabled = $scope.checkbox.enabled ? 1 : 0;
                var text = enabled ? 'Site Blocker is enabled!' : 'Site Blocker is disabled';
                var className = enabled ? 'info' : 'error';
                updateObjStorage({ enabled: enabled }, false)
                $.notify(text, { globalPosition: 'bottom center', className: className });
            }, 100);
        };

        $scope.saveExtraConfig = function ($event) {
            setTimeout(function () {
                var subdomainOption = $scope.checkbox.subdomainOption ? 1 : 0;
                var iframeOption = $scope.checkbox.iframeOption ? 1 : 0;
                var optionCloseTabs = $scope.checkbox.optionCloseTabs ? 1 : 0;
                var whiteList = $scope.checkbox.whiteList ? 1 : 0;
                var enabled = $scope.checkbox.enabled ? 1 : 0;

                var obj = {
                    blockKeyList: $scope.tagList,
                    subdomainOption: subdomainOption,
                    iframeOption: iframeOption,
                    close_option: optionCloseTabs,
                    whiteList: whiteList,
                    enabled: enabled
                }
                updateObjStorage(obj)

            }, 100);
        };

        function loadNotifications() {
            return;
            var url = 'https://chess-master.info/site/notifications?app=extension';
            $http.get(url).then(function (response) {
                if (response.data) {
                    $scope.not.list = response.data || [];
                    localStorage.setItem('notifications', JSON.stringify($scope.not.list));
                    localStorage.setItem('lastUpdate', +new Date());
                    $scope.not = helper.getReadMessages($scope.not);
                }
            });

        }

        $scope.showSetPasswordModal = function () {
            $scope.data.userPassword = '';
            setTimeout(function () {
                $('#password').focus();
            }, 50)
        };

        $scope.clearList = function () {
            if (confirm('Clear blockes list ?')) {
                $scope.siteList = [];
                $scope.saveChanges();
            }
        };

        $scope.saveChanges = function () {
            saveSiteList();
        };

        $scope.saveRedirectUrl = function () {
            if (helper.isUrl($scope.data.redirect_url) || !$scope.data.redirect_url) {
                if ($scope.data.redirect_url && !$scope.data.redirect_url.includes('://')) {
                    $scope.data.redirect_url = 'http://' + $scope.data.redirect_url;
                }

                chrome.runtime.sendMessage(
                    {
                        method: 'update_redirect_url',
                        redirect_url: $scope.data.redirect_url,
                    },
                    function (response) {
                        if (parseInt(response.status) == 1) {
                            $scope.notify('Changes Saved !');
                        } else {
                            alert('Error to saving data');
                        }
                    }
                );
            } else {
                alert('Invalid Url');
                focus('#redirect_url', 100);
            }
        };

        $scope.removeRedirectUrl = function () {
            $scope.data.redirect_url = '';
            $scope.saveRedirectUrl();
        };

        $scope.loadBlockList = function () {
            $scope.data.loadBlockKey = '';
        }

        $scope.loadKeyDataList = function () {
            $scope.data.loadBlockKey = $scope.data.loadBlockKey.trim();
            if ($scope.data.loadBlockKey.length == 0) {
                $('#block_list').focus();
                return;
            }
            var data = $scope.data.loadBlockKey.split(/\n/);
            var i = 0;
            data.forEach(function (item) {
                if (!$scope.tagList.includes(item)) {
                    i++;
                    $scope.tagList.push(item);

                }
            })

            updateObjStorage({ blockKeyList: $scope.tagList }, false)
            $scope.notify('Loaded: ' + i + ' items');
            $scope.data.loadBlockKey = '';

        }

        $scope.exportBlockKeys = function () {
            $scope.data.exportDataModel = $scope.tagList.join('\n');

        }

        $scope.copyText = function () {
            var copyText = document.getElementById('exportTxt');
            copyText.select();
            document.execCommand('copy');
            $('#copyText').text('Copied !');
            setTimeout(function () {
                $('#copyText').text('Copy');
            }, 800);
        };

        $scope.setRead = function (id) {
            if (!$scope.not.read.includes(id)) {
                $scope.not.read.push(id);
                // Update notifications
                // localStorage.setItem('read', JSON.stringify($scope.not.read));
                $scope.not = helper.getReadMessages($scope.not);
            }
        };

        $scope.notify = debounce(function (str) {
            $.notify(str, { globalPosition: 'bottom center', className: 'info' });
        }, 400)

    }
]);

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
}