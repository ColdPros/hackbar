/**
When we receive the message, execute the given script in the given
tab.
*/
'use strict';
var namespace = chrome;
var referer;
var user_agent;
var cookie;
var method;
var postDataCurrent;

function getPostData(e) {
	if ( e.method == "POST" && e.requestBody ) {
		let rawData = e.requestBody.formData;
		var post_data_array = [];
		for (let key in rawData) {
			if (rawData.hasOwnProperty(key)) {
				var item = key + "=" + rawData[key];
				post_data_array.push(item);
			}
		}
		postDataCurrent = post_data_array.join("&")
	}
}

namespace.webRequest.onBeforeRequest.addListener(
	getPostData,
	{urls: ["<all_urls>"]},
	["requestBody"]
);

function rewriteHeaders(e) {
	var index_referer, index_user_agent, index_cookie;
	index_cookie = index_referer = index_user_agent = -1;
	for(var i=0; i< e.requestHeaders.length; i++){
		var v = e.requestHeaders[i];
		switch(v.name.toLowerCase()){
			case 'referer':
				index_referer = i;
				break;
			case 'user-agent':
				index_user_agent = i;
				break;
			case 'cookie':
				index_cookie = i;
				break;
		}
	}
	//add referer
	if(referer){
		if(index_referer != -1){
			e.requestHeaders[index_referer].value = referer;
		}else{
			e.requestHeaders.push({
				name: "Referer",
				value: referer
			});
		}
	}
	//modify user agent
	if(user_agent){
		if(index_user_agent != -1){
			e.requestHeaders[index_user_agent].value = user_agent;
		}else{
			e.requestHeaders.push({
				name: "User-Agent",
				value: user_agent
			});
		}
	}
	//modify cookie
	if(cookie){
		if(index_cookie != -1){
			e.requestHeaders[index_cookie].value = cookie;
		}else{
			e.requestHeaders.push({
				name: "Cookie",
				value: cookie
			});
		}
	}
	return {requestHeaders: e.requestHeaders};
}

function handleMessage(request, sender, sendResponse) {
	if (sender.url !== namespace.runtime.getURL("/theme/hackbar-panel.html")) {
		return;
	}

	var tabId = request.tabId;
	var action = request.action;
	switch(action){
		case 'send_requests':
			var Data = request.data;
			var url = Data.url;
			method = Data.method;
			referer = Data.referer;
			user_agent = Data.user_agent;
			cookie = Data.cookie;
			if(method == 'GET'){
				namespace.tabs.update(tabId, {url: url});
			}else{
				var post_data = JSON.stringify(Data.post_data);
				namespace.tabs.executeScript(tabId, {code: 'var post_data = "'+encodeURIComponent(post_data)+'"; var url = "'+ encodeURIComponent(url) +'"'}, function(){
					namespace.tabs.executeScript(tabId, {file: 'theme/js/post_form.js'});
				});
			}
			namespace.webRequest.onBeforeSendHeaders.addListener(
				rewriteHeaders,
				{urls: ["<all_urls>"], tabId: tabId},
				["blocking", "requestHeaders"]
			);
			sendResponse({status: true});
			break;
		case 'load_url':
			namespace.tabs.get(tabId, function (tab){
				sendResponse({url: tab.url, data: postDataCurrent});
			});

			break;
		case 'selected_text':
			var code = 'var user_input; user_input = prompt("Please enter some text")';
			namespace.tabs.executeScript(tabId, {code: code}, function(user_input){
				sendResponse({user_input: user_input[0]});
			});
			break;
	}
	return true;
}

/**
Listen for messages from our devtools panel.
*/
namespace.runtime.onMessage.addListener(handleMessage);
