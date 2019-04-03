var namespace = chrome;
var urlField = $('#url_field');
var postDataField = $('#post_data_field');
var refererField = $('#referer_field');
var userAgentField = $('#user_agent_field');
var cookieField = $('#cookie_field');

var loadUrlBtn = $('#load_url');
var splitUrlBtn = $('#split_url');
var executeBtn = $('#execute');

var enablePostBtn = $('#enable_post_btn');
var enableRefererBtn = $('#enable_referer_btn');
var enableUserAgentBtn = $('#enable_user_agent_btn');
var enableCookieBtn = $('#enable_cookie_btn');

var menu_btn_array = ['md5', 'sha1', 'sha256', 'rot13',
'base64_encode', 'base64_decode', 'url_encode', 'url_decode', 'encode_btn', 'decode_btn', 
'sql_mysql_char', 'sql_basic_info_column', 'sql_convert_utf8', 'sql_convert_latin1', 'sql_mssql_char', 'sql_oracle_char', 'sql_union_statement', 'sql_spaces_to_inline_comments', 
'xss_string_from_charcode', 'xss_html_characters', 'xss_alert',
'jsonify', 'uppercase', 'lowercase',];

var currentTabId = namespace.devtools.inspectedWindow.tabId;
var currentFocusField = urlField;
function onFocusListener(){
	currentFocusField = $(this);
}
/* Other function */
function jsonValid(text){
	try{
		var result = JSON.parse(text);
		return result;
	}catch(e){
		return false;
	}
}

function getFieldFormData(dataString){
	var fields = Array();
	var f_split = dataString.trim().split('&');
	for (var i in f_split){
		var f = f_split[i].match(/(^.*?)=(.*)/);
		if(f.length == 3){
			var item = new Object();
			item['name'] = f[1];
			item['value'] = unescape(f[2]);
			fields.push(item);
		}
	}
	return fields;
}

function urlEncode(inputstr){
	return encodeURIComponent(inputstr).toLowerCase();
}

function jsonBeautify(inputstr){
	var jsonString = jsonValid(inputstr);
	if(jsonString){
		return JSON.stringify(jsonString, null, 4);
	}
	return false;
}

function upperCaseString(inputstr){
	return inputstr.toUpperCase();
}

function lowerCaseString(inputstr){
	return inputstr.toLowerCase();
}

// toggle element
function toggleElement(elementBtn, elementBlock){
	if(elementBtn.prop('checked')){
		elementBlock.show();
	}else{
		elementBlock.hide();
	}
}

function sendToBackground(action, data, response){
	namespace.runtime.sendMessage({
		tabId: currentTabId,
		action: action,
		data: data
	}, function(message){
		response(message) 
	});
}

function loadUrl() {
	sendToBackground('load_url', null, function(message){
		if ('url' in message && message.url){
			urlField.val(message.url);
		}
		if ('data' in message && message.data && postDataField.val() === "") {
			postDataField.val(message.data);
		}
	});
}

function splitUrl(){
	var uri = currentFocusField.val();
	uri = uri.replace(new RegExp(/&/g), "\n&");
	uri = uri.replace(new RegExp(/\?/g), "\n?");
	currentFocusField.val(uri);
	return true;
}

function execute(){
	var referer = null;
	var user_agent = null;
	var cookie = null;
	var post_data = null;
	var method = 'GET';

	if(enableRefererBtn.prop('checked')){
		referer = refererField.val();
	}
	if(enablePostBtn.prop('checked')){
		method = 'POST';
		post_data = getFieldFormData(postDataField.val());
	}
	if(enableUserAgentBtn.prop('checked')){
		user_agent = userAgentField.val();
	}
	if(enableCookieBtn.prop('checked')){
		cookie = cookieField.val();
	}

	var url = urlField.val();
	url = url.replace(new RegExp(/\n|\r/g), '').trim();
	if(!(new RegExp(/^(http:\/\/|https:\/\/|view-source:)/gi)).test(url)){
		url = 'http://' + url;
	}
	if (!url){
		return;
	}
	namespace.runtime.sendMessage({
		tabId: currentTabId,
		action: 'send_requests',
		data: {url: url, method: method, post_data: post_data, referer: referer, user_agent: user_agent, cookie: cookie}
	});
	
}

function getSelectedText(callbackFunction)
{
	var selectionStart = currentFocusField.prop('selectionStart');
	var selectionEnd = currentFocusField.prop('selectionEnd');
	if (selectionEnd - selectionStart < 1) {
		sendToBackground('selected_text', null, function(message){
			callbackFunction(message.user_input)
		});
	} else {
		callbackFunction(currentFocusField.val().substr(selectionStart, selectionEnd - selectionStart));
	}
}

function setSelectedText(str)
{
	var selectionStart = currentFocusField.prop('selectionStart');
	var selectionEnd = currentFocusField.prop('selectionEnd');
	var pre = currentFocusField.val().substr( 0, selectionStart);
	var post = currentFocusField.val().substr(selectionEnd, currentFocusField.val().length);
	currentFocusField.val(pre + str + post);
	currentFocusField[0].setSelectionRange(selectionStart, selectionEnd + str.length)
}

function onclickMenu(action){
	var txt = '';
	var newString = '';
	switch(action){
		case 'md5':
		getSelectedText(function(txt){
			if(txt){
				// setStorage(currentFocusField.attr('id'), currentFocusField.val());
				newString = Encrypt.md5(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'sha1':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.sha1(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'sha256':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.sha2(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'rot13':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.rot13(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'base64_encode':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.base64Encode(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'base64_decode':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.base64Decode(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'url_encode':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.urlEncode(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'url_decode':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.unescape(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'hex_encode':
		txt = getSelectedText();
		if(txt){
			newString = Encrypt.strToHex(txt);
			this.setSelectedText(newString);
		}
		break;
		case 'hex_decode':
		getSelectedText(function(txt){
			if(txt){
				newString = Encrypt.hexToStr(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'jsonify':
		getSelectedText(function(txt){
			if(txt){
				newString = jsonBeautify(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'uppercase':
		getSelectedText(function(txt){
			if(txt){
				newString = upperCaseString(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'lowercase':
		getSelectedText(function(txt){
			if(txt){
				newString = lowerCaseString(txt);
				this.setSelectedText(newString);
			}
		});
		break;
		case 'sql_mysql_char':
		getSelectedText(function(txt){
			if(txt){
				newString = SQL.selectionToSQLChar("mysql", txt);
				this.setSelectedText(newString);
			}
		});
		break;

		case 'sql_basic_info_column':
		var newString = 'CONCAT_WS(CHAR(32,58,32),user(),database(),version())';
		this.setSelectedText(newString);
		break;

		case 'sql_convert_utf8':
		getSelectedText(function(txt){
			if(txt){
				newString = "CONVERT("+txt+" USING utf8)";
				this.setSelectedText(newString);
			}
		});

		case 'sql_convert_latin1':
		getSelectedText(function(txt){
			if(txt){
				newString = "CONVERT("+txt+" USING latin1)";
				this.setSelectedText(newString);
			}
		});
		break;

		case 'sql_mssql_char':
		getSelectedText(function(txt){
			if(txt){
				newString = SQL.selectionToSQLChar("mssql", txt);
				this.setSelectedText(newString);
			}
		});
		break;

		case 'sql_oracle_char':
		getSelectedText(function(txt){
			if(txt){
				newString = SQL.selectionToSQLChar("oracle", txt);
				this.setSelectedText(newString);
			}
		});
		break;

		case 'sql_union_statement':
		getSelectedText(function(txt){
			if(txt){
				newString = SQL.selectionToUnionSelect(txt);
				this.setSelectedText(newString);
			}
		});
		break;

		case 'sql_spaces_to_inline_comments':
		getSelectedText(function(txt){
			if(txt){
				newString = SQL.selectionToInlineComments(txt);
				this.setSelectedText(newString);
			}
		});
		break;

		case 'xss_string_from_charcode':
		getSelectedText(function(txt){
			if(txt){
				newString = XSS.selectionToChar('stringFromCharCode', txt);
				this.setSelectedText(newString);
			}
		});
		break;

		case 'xss_html_characters':
		getSelectedText(function(txt){
			if(txt){
				newString = XSS.selectionToChar('htmlChar', txt);
				this.setSelectedText(newString);
			}
		});
		break;

		case 'xss_alert':
		newString = "<script>alert(1)</script>";
		this.setSelectedText(newString);
		break;
		
	}
	currentFocusField.focus();
}

//Events

loadUrlBtn.bind('click', loadUrl);
splitUrlBtn.bind('click', splitUrl);
executeBtn.bind('click', execute);

enablePostBtn.click(function(){ toggleElement($(this), postDataField.closest('.block'))});
enableRefererBtn.click(function(){ toggleElement($(this), refererField.closest('.block'))});
enableUserAgentBtn.click(function(){ toggleElement($(this), userAgentField.closest('.block'))});
enableCookieBtn.click(function(){ toggleElement($(this), cookieField.closest('.block'))});

//Add event listerner
menu_btn_array.forEach(function(elementID){
	$('#' + elementID).bind('click', () => onclickMenu(elementID));
});

//on fucus listenner field
urlField.bind('click', onFocusListener, false);
postDataField.bind('click', onFocusListener, false);
refererField.bind('click', onFocusListener, false);
userAgentField.bind('click', onFocusListener, false);
cookieField.bind('click', onFocusListener, false);

// Keyboard listener
$(document).keypress(function(event){
	if ('key' in event && event.altKey) {
		switch(event.charCode){
			case 97: // a
			loadUrl();
			break;
			case 120: // x
			execute();
			break;
			case 112: //p
			splitUrl()
			break;
			case 117: //u
			onclickMenu('url_encode');
			break;
			case 85: //U
			onclickMenu('url_decode');
			break;
			case 99: //c
			onclickMenu('base64_encode');
			break;
			case 67: //C
			onclickMenu('base64_decode');
			break;
		}
	}
	if('key' in event && event.ctrlKey){
		switch(event.charCode){
			case 0:
				execute();
			break
			case 122:
				undo();
			break;
		}
	}
});