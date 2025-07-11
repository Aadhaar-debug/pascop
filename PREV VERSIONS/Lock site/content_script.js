var isSiteBlocked = false;
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    sendResponse({});
    if (msg.action ) location.reload();
});

var windowUrl = window.location.host.replace('www.', '');

chrome.runtime.sendMessage({ method: 'site', value: windowUrl, site: location.href, firstCall: true }, function (response) {
    isSiteBlocked = !!response.needToBlock;
    if (isSiteBlocked) {
        block_site(response.type);
    }
});


var delay = Math.floor(2500 * Math.random());
setInterval(function () {
    chrome.runtime.sendMessage({ method: 'site', value: windowUrl, site: location.href }, function (response) {
        if (response.needToBlock === true) {
            if (!isSiteBlocked) {
                block_site(response.type);
                isSiteBlocked = true;
            }
        } else {
            if (isSiteBlocked) {
                location.reload();
            }
        }
    });
}, delay + 5000);


function block_site(blockByKey){
	window.stop();
    var html = "<style>";
    html += ".h1{ text-align: center; margin: auto; color: #000; padding: 0 0 12px 0; border-bottom: 1px solid #e3e5ea }";
    html += `h1,h2{text-align:center;}#blockByKey{display: ${blockByKey ? 'block' : 'none'};text-align: center; font-size: 16px;  color: #717171; padding: 8px; margin: auto;}`;
    html += "body{background-color: #FFF} img{width:100px} .container{box-shadow: 0px 3px 5px 4px rgb(34 60 80 / 20%);width:600px;margin:auto;margin-top:80px;padding:20px 0; background-color: #f0f2f6; border-radius: 6px}";
    html += "</style>";
    html += "<div class='container'><h1 class='h1'> This site is blocked </h1>";
    html += "<p align='center' style='margin-top:30px; margin-bottom: 25px'><img src='"+chrome.runtime.getURL('128.png')+"'></p>";
    html += `<p id='blockByKey'>${blockByKey}</p>`;

    var head = document.querySelector('head');
    var list = head.querySelectorAll('*');
    for(var i=0; i<list.length; i++){
        list[i].remove();
    }

    if(document.getElementsByTagName('html')[0]){
        document.getElementsByTagName('html')[0].removeAttribute('style');
        Promise.all([ createTag('head'), createTag('body')]).then(res => {
            console.log('res', res);
            createTitle();
            document.getElementsByTagName('body')[0].innerHTML = html;
        })

    } 
}

function createTag(tagName) {
    return new Promise(resolve => {
        var el = document.getElementsByTagName(tagName)[0];
        if (!el) {
            document.getElementsByTagName('html')[0].appendChild(document.createElement(tagName));
            resolve('create_new');
        } else {
            el.removeAttribute('style');
            el.removeAttribute('class');
            resolve('exists');
        }
    })
    
}

function createTitle(){
    var title = document.createElement('title');
    title.innerHTML = 'Site is blocked';
    if (document.getElementsByTagName('head')[0]) {
        document.getElementsByTagName('head')[0].appendChild(title);
	} else {
        document.title = 'Site is blocked';
    }

}