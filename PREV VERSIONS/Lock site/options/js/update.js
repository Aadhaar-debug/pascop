var data = ['blockKeyList', 'close_option', 'days_config', 'enabled', 'hour_config_extra', 'hour_option', 'iframeOption', 'pass', 'sites', 'subdomainOption', 'whiteList', 'redirect_url'];
var arr = ['blockKeyList', 'days_config', 'hour_config_extra', 'sites'];

var storage = {};

data.forEach(key => {
    var val = localStorage.getItem(key);
    if (val) {
        storage[key] = arr.includes(key) ? JSON.parse(val) : val
    }
})

localStorage.clear();

if (Object.keys(storage).length > 0) {
    chrome.runtime.sendMessage({ method: 'updateObjKeys', obj:  storage}, function (response) {
        if (parseInt(response.status) == 1) {
           console.log('updated')
        } else {
           console.log('error');
        }
    }
    )
}
