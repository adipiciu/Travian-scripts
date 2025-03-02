// ==UserScript==
// @name        Travian Task Queue for Travian 4
// @namespace   https://github.com/adipiciu/Travian-scripts
// @author      adipiciu (based on TTQ by Risi and further edited by Nevam and then Pimp Trizkit and Serj_LV)
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @description Schedule delayed constructions, upgrades and attacks.
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=56E2JM7DNDHGQ&item_name=TTQ4+script&currency_code=EUR
// @include     *://*.travian.*
// @include     *://*/*.travian.*
// @exclude     *://support.travian.*
// @exclude     *://blog.travian.*
// @exclude     *.css
// @exclude     *.js

// @version     2.0.22
// ==/UserScript==

(function () {

function allInOneTTQ () {
notRunYet = false;
var sCurrentVersion = "2.0.22";

//find out if Server errors
var strTitle = document.title;
if ( (strTitle.indexOf("500 ") > -1 ) || (strTitle.indexOf("502 ") > -1 ) || (strTitle.indexOf("503 ") > -1 ) ) {
	window.setTimeout ( function() { window.location.reload(true); }, ttqRandomNumber()*100 );
}

// *** Begin Initialization and Globals ***
/*********************
 *		Settings
 *********************/
var LOG_LEVEL = -1; // 0 - quiet, 1 - nearly quite, 2 - verbose, 3 - detailed

// How often do we check for tasks to trigger in seconds. Default is 10 secs.
// Low value = high accuracy in triggering tasks. To make your browser unresponsive, set this to some ridiculously small number.
// You probably do not want to tamper with this setting. As many things in TTQ-T4 are assuming its set to 10 seconds.
var CHECK_TASKS_EVERY = 10;

// Set this to the server's url to override automatic server detection (i.e. s1.travian.net)
// Don't set it if you're playing on multiple servers simultaneously!
var CURRENT_SERVER = "";

var MIN_REFRESH_MINUTES = 8;  // TTQ will refresh every 5 to 10 minutes
var MAX_REFRESH_MINUTES = 16;
var MAX_PLACE_NAMES = 100; // The number of non-player village names it keeps stored. It destroys the oldest when making space.
// RACE and HISTORY LENGTH are set with user accessible menus through the GreaseMonkey icon. As well as a way to fully reset TTQ.
/*********************
 *	End of Settings
 *********************/
//-- DO NOT TAMPER WITH THE BELOW
var starttime = Date.now();
var myPlayerID;

// Your local computer time MUST still be correct (both time and date!).
var bUseServerTime = false; //getOption("USE_SERVER_TIME", false, "boolean"); //IMPORTANT!!! If true, you must be using 24-hour format on your server, otherwise there WILL be errors.
var bLocked = false; // for locking the TTQ_TASKS variables
var ttqBusyTask = 0; // for detecting if TTQ is still busy processing a task
var oIntervalReference = null;
var oAnimateTimerIR = null;
var isTTQLoaded = false;
var isTroopsLoaded = false;
var iSiteId = -6;
var theListeners = [];

/*********************** common library ****************************/

//-- для начала должны быть перечислены все "библиотечные" функции. Чтобы небыло неопределенности привызове.

function $id(id) { return document.getElementById(id); } // getElementById Helper (shortcut) Function
function $gc(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByClassName(str); }
Number.prototype.NaN0=function() { return isNaN(this) ? 0 : this; }
String.prototype.onlyText = function(){return this.replace(/([\u2000-\u20ff])/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[\s\S]+?>/g,'').replace(/(\u2212)/g,'-');}
function $gn(aID) {return (aID != '' ? document.getElementsByName(aID) : null);}
function $gt(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByTagName(str); }
function $at(aElem, att) {if (att !== undefined) {for (var xi = 0; xi < att.length; xi++) {aElem.setAttribute(att[xi][0], att[xi][1]); if (att[xi][0].toUpperCase() == 'TITLE') aElem.setAttribute('alt', att[xi][1]);};};}//Acr111-addAttributes
//function $c(iHTML, att) { return $ee('TD',iHTML,att); }
//function $a(iHTML, att) { return $ee('A',iHTML,att); }
function $e(nElem, att) {var Elem = document.createElement(nElem); $at(Elem, att); return Elem;}
function $ee(nElem, oElem, att) {var Elem = $e(nElem,att); if (oElem !== undefined) if( typeof(oElem) == 'object' ) Elem.appendChild(oElem); else Elem.innerHTML = oElem; return Elem;}
function ajaxNDIV(aR) {var ad = $ee('div',aR.responseText,[['style','display:none;']]); return ad;}
//function $em(nElem, mElem, att) {var Elem = document.createElement(nElem); if (mElem !== undefined) for(var i = 0; i < mElem.length; i++) { if( typeof(mElem[i]) == 'object' ) Elem.appendChild(mElem[i]); else Elem.appendChild($t(mElem[i])); } $at(Elem, att); return Elem;}
//function $t(iHTML) {return document.createTextNode(iHTML);}

var linkVSwitch = [];
var villages_id = [];
var currentActiveVillage = -5;
var villages_count = 0;
var RB = new Object();
	RB.vList = [];
var crtPath = window.location.href;
var fullName = window.location.origin + "/";
var urlParams = window.location.search;

// Custom log function
function _log(level, msg) {
	if (level <= LOG_LEVEL) {
		var nL = $id('_LOG');
		if( ! nL ) {
			nL = $e('DIV',[['id','_LOG']]);
			document.body.appendChild( nL );
		}
		nL.innerHTML += msg + "<br>";
	}
}

function sortArray(arr1,arr2) { return arr1[0] - arr2[0]; }

function xpath(query, object, qt, adoc) { // Searches object (or document) for string/regex, returning a list of nodes that satisfy the string/regex
	if( !object ) object = document;
	if( !adoc ) adoc = document;
	var type = qt ? XPathResult.FIRST_ORDERED_NODE_TYPE: XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE;
	var ret = adoc.evaluate(query, object, null, type, null);
	return (qt ? ret.singleNodeValue : ret);
}

/**************************************************************************
 * @param options: [aTask, iCurrentActiveVillage] (optional)  OR sNewdid in case of finding the code for construction.
 ***************************************************************************/
function get(url, callback, options) {
	var httpRequest = new XMLHttpRequest();
	if(callback) {
		httpRequest.onreadystatechange = function() {
			if( httpRequest.readyState == 4 && (httpRequest.status == 200 || httpRequest.status == 304))
				callback(httpRequest, options);
		};
	}
	httpRequest.open("GET", url, true);
	httpRequest.send(null);
}

function post(url, data, callback, options) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("POST", url, true);
	httpRequest.onreadystatechange = function() {
		callback(httpRequest, options)
	};
	if (url.includes("api/v1/farm-list")){
		httpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	}
	else if (url.includes("api/v1/building/demolish")){
		httpRequest.setRequestHeader('Content-Type', 'application/json;');
	}
	else if (url.includes("api/v1/")){
		httpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		httpRequest.setRequestHeader('X-Nonce', nonceValue);
	} else {
		data = encodeURI(data);
		httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	}
	httpRequest.send(data);
}

function put(url, data, callback, options) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("PUT", url, true);
	httpRequest.onreadystatechange = function() {
		callback(httpRequest, options)
	};
	if (url.includes("api/v1/farm-list")){
		httpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	}
	else if (url.includes("api/v1/")){
		httpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	} else {
		data = encodeURI(data);
		httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	}
	httpRequest.send(data);
}

/**************************************************************************
 * Detects the server so we can figure out the language used
 * @returns the servers location
 **************************************************************************/
function detectLanguage() {
	var lang = TTQ_getValue(CURRENT_SERVER+"lang","0");
	if( lang != 0 ) return lang;
	try { 
		lang = document.getElementsByName("content-language")[0].getAttribute("content").toLowerCase(); lang = lang.substring(3,5); 
	} catch(e) { lang = "en"; }
	try {
		lang = $id("mainLayout").getAttribute("lang").toLowerCase(); lang = lang.substring(3,5); 
	} catch(e) { lang = "en"; }
	return lang;
}

function detectMapSize () {
	var mapSize = getOption("MAP_SIZE", 0, "integer");
	if( mapSize !== 0 ) return mapSize;
	var aText = xpath('//script[contains(@src, "/Variables.js")]',document, true);
	if (aText) {
		get(aText.src, function(ajaxResp) {
			var ad = ajaxNDIV(ajaxResp);
			T4_Variables = JSON.parse(ad.textContent.match(/Travian.Variables\s*=\s*(.*});/)[1]);
			ad = null;
			mapSize = T4_Variables.Map.Size.width;
			setOption("MAP_SIZE", mapSize);
		}, null);
		return 0;
	}
}

function processSortedTaskList(element) { $id("ttq_tasklist").appendChild(element[1]); }
function processSortedHistory(element) { $id("ttq_history").appendChild(element[1]); }
// *** trim functions
function trim(str) {
	var	str = str.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}

// Coordinate Conversion Helper Functions
function coordsXYToZ(x, y) {
	return (1 + (parseInt(x) + mapRadius) + (MapSize * Math.abs(parseInt(y) - mapRadius)));
}

function coordZToXY(z) {
	z = parseInt(z);
	var x = ((z - 1) % MapSize) - mapRadius;
	var y = mapRadius - (parseInt(((z - 1) / MapSize)));
	return [x,y];
}

function getVidFromCoords ( txt ) {
	var xy = new Array;
	if( /coordinateX/.test(txt) ) {
		txt = txt.replace(/([\u2000-\u20ff])/g,'');
		txt = txt.replace(/(\u2212)/g,'-');
		xy[1] = txt.match(/coordinateX.+?(-?\d{1,3})/)[1];
		xy[2] = txt.match(/coordinateY.+?(-?\d{1,3})/)[1];
	} else
		xy = txt.match(/\((-?\d{1,3})\D+?(-?\d{1,3})\)/);
	return xy ? coordsXYToZ(xy[1],xy[2]): -1;
}

// ** Begin Date/Time Block ***
/**************************************************************************
 * @param {int}
 * @return {str} Formatted date.
 ***************************************************************************/
function formatDate(yyyy, mm, dd, hh, min, sec) {
	if(dd < 10) {dd = "0" + dd;}
	if(mm < 10) {mm = "0" + mm;}
	if(min < 10) {min = "0" + min;}
	if(sec < 10) {sec = "0" + sec;}
	return yyyy+"/"+mm+"/"+dd+" "+hh+":"+min+":"+sec;
}
// *** End Date/Time Block ***

/**************************************************************************
 *  This only trims the value read from variables. Variable itself is trimmed when new event is entered into history.
 *  It trimms the value down to maxlength. And returns the array, you can join it if ya need.
 ***************************************************************************/
function ttqTrimData(data, maxlength, asString, token) {
	if ( data.length < 1 || maxlength < 1 || data == '' ) {
		if ( asString ) return "";
		else return new Array();
	}
	if ( typeof(token) == "undefined"  || !token ) var token = "|";
	data = data.split(token+"");
	var excessTasks = data.length - maxlength;
	if(excessTasks >  0) data.splice(0, excessTasks);
	if ( asString ) return data.join(token+"");
	else return data;
}

function TTQ_addStyle(css) {
	var head = document.getElementsByTagName('head')[0];
	if (head) {
		var style = $e("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));
		head.appendChild(style);
	}
}

function TTQ_getValue ( key, defaultValue ) {
	var value = window.localStorage.getItem(key);
	if( value == null ) value = defaultValue;
	return value;
}
function TTQ_setValue( key, value ) {
	window.localStorage.setItem( key, value );
}
function TTQ_deleteValue( key ) {
	window.localStorage.removeItem( key );
}

// *** Begin Storage Block ***
/**************************************************************************
 * Retrieves the value corresponding do the given variable name and the current Travian server
 * Use greasemonkey's built-in system instead of variables to permantenly store and read settings
 * @param name The name of the variable
 * @param defaultValue  default value if name is not found
 ***************************************************************************/
function getVariable(name, defaultValue) {
    if(!defaultValue) { var defaultValue = ''; }
    name = CURRENT_SERVER + myPlayerID + "_" + name;
    var data = TTQ_getValue(name, defaultValue);
    return data;
}

/**************************************************************************
 * Sets the value for the given variable name and the current Travian server
 * Use greasemonkey's built-in system instead of variables to permantenly store and read settings
 * @param name  The name of the variable
 * @param value The value to be assigned
 ***************************************************************************/
function setVariable(name, value) {
    name = CURRENT_SERVER + myPlayerID + "_" + name;
	TTQ_setValue(name, value);
    return true;
}

function setOption(key, value) {
    var options = getVariable('TTQ_OPTIONS', '');
	if(options != '') options = options.split(",");
	else options = [];
    var myOption = options.indexOf(key);
	if(myOption < 0) {
		options.push(key);
		options.push(value);
	} else options[myOption + 1] = value;
    setVariable('TTQ_OPTIONS', options.join(","));
}

/**************************************************************************
 * @param key: name of the parameter in the TTQ_OPTIONS variable
 * @param defaultValue: this is returned if the parameter is not found
 * @param type: if set, type conversion occurs. Values {string, integer, boolean} The conversion occurs only if it is not the defaultValue being returned.
 ***************************************************************************/
function getOption(key, defaultValue, type) {
    var options = getVariable('TTQ_OPTIONS', '');
	options = options.split(",");
	var myOption = options.indexOf(key);
	if(myOption < 0) {return defaultValue;}
	switch(type) {
		case "boolean":
			var myOption = ( options[myOption + 1] == "true") ? true:false;
			break;
		case "integer":
			var myOption = parseInt(options[myOption + 1]);
			break;
		case "string":
		default:
			var myOption = options[myOption + 1];
			break;
	}
    return myOption;
}

function getAllOptions() { //Uses recycled variables
    tA = getVariable('TTQ_OPTIONS', '');
	tA = tA.split(",");
	vName = new Object();
	for ( tX = 0, tY = tA.length ; tX < tY ; tX += 2 ) vName[tA[tX]] = tA[tX+1];
	return vName;
}
// *** End Storage Block ***

function saveODCookie ( nameCoockie, contentCookie ) {
	var newCookie = '';
	for( var i = 0; i < linkVSwitch.length; i++ ) {
		var nd = parseInt(linkVSwitch[i].match(/newdid=(\d+)/)[1]);
		if( contentCookie[nd] !== undefined )
			newCookie += nd + '@_' + contentCookie[nd] + '@#_';
	}
	setVariable(nameCoockie, newCookie);
}

function loadOVCookie ( nameCoockie, contentCookie ) {
	var RCookie = getVariable(nameCoockie,'');
	var oneCookie = [];
	var cCount = 0;
	var Rej = new RegExp("(\\d+)@_(.*?)@#_", 'g');
	while ((oneCookie = Rej.exec(RCookie)) != null) { RB[contentCookie][oneCookie[1]] = oneCookie[2]; cCount++; }
	return cCount;
}

//-- проверка, страничка ли это травы, и если да, то инициализация.
function initialize() {
	if (CURRENT_SERVER != "") return true;
	CURRENT_SERVER = location.hostname + "_";
	_log(1, "Init> Using settings for server '" + CURRENT_SERVER + "'");
	try {
		var uName = $gc('playerName',$id('sidebarBoxActiveVillage'))[0].textContent.trim();
	} catch(e) { return false }
	var uidcookie = TTQ_getValue(CURRENT_SERVER + 'TTQ-UID', "");
	var uIDs = uidcookie.split("@@_");
	for( var i = 0; i < uIDs.length; i++ ) {
		var uID = uIDs[i].split("\/@_");
		if (uID[0] == uName) { myPlayerID = uID[1]; return true; }
		if (uID[1] == uName) { myPlayerID = uID[2]; return true; }				
	}
	get(fullName+'statistics/player', getuId, '');
	function getuId(httpRequest) {
		if (httpRequest.readyState == 4) {
			if (httpRequest.status == 200 && httpRequest.responseText) {
				var holder = document.createElement('div');
				holder.innerHTML = httpRequest.responseText;
				var aV = xpath('//td[contains(@class,"pla")]/a[contains(@href,"profile") and text() = "' + uName + '"]', holder, true);
				if (aV) { 
					var uId = aV.href.match(/profile\/(\d+)/)[1];
					uidcookie += uName +"\/@_"+ uId +"@@_";
					TTQ_setValue(CURRENT_SERVER + 'TTQ-UID', uidcookie);
					myPlayerID = uId;
					return true;
				} else { myPlayerID == null; return false; }
			}
		}
	}
	if (myPlayerID == null) {
		_log(1,"Init> Unknown page. TTQ is not running. Possible Login screen. Attempting Auto-Login in a few seconds...");
		return false;
	}
}

var init = initialize();
/*********************
 *		GLOBALS
 *********************/
if (init) {
	var allLangs = ["en","ae","ar","ba","bg","br","cl","cn","cz","de","dk","ee","eg","es","fi","fr","gr","he","il","hk","hr","hu","id","ir","it",
		"jp","kr","lt","lv","mx","my","nl","no","pt","pl","ro","ru","se","rs","sa","si","sk","sy","th","tr","tw","ua","vn"];
    var aLangBuildings = 0;
    var aLangTasks = 0;
    var aLangStrings = 0;
    var aLangMenuOptions = 0;
    var sLang = detectLanguage();

	// Default is English. This is also the array that will be used to replace the zeros (missing words) in the below translations. The Buildings are only used for catapult targeting for now. I hope to get rid of it entirely.
	var nLangBuildings = ["", "Woodcutter", "Clay Pit", "Iron Mine", "Cropland", "Sawmill", "Brickyard", "Iron Foundry", "Grain Mill", "Bakery", "Warehouse", "Granary", "<No Building>", "Smithy", "Tournament Square", "Main Building", "Rally Point", "Marketplace", "Embassy", "Barracks", "Stable", "Workshop", "Academy", "Cranny", "Town Hall", "Residence", "Palace", "Treasury", "Trade Office", "Great Barracks", "Great Stable", "City Wall", "Earth Wall", "Palisade", "Stonemason's Lodge", "Brewery", "Trapper", "Hero's Mansion", "Great Warehouse", "Great Granary", "Wonder Of The World", "Horse Drinking Trough", "Stone Wall", "Makeshift Wall", "Command Center", "Waterworks", "Hospital"];
	var nLangTasks = ["Build", "Upgrade", "Attack", "Research", "Train", "Party", "Demolish", "Send Merchants", "Send Back/Withdraw"];
	var nLangStrings = ["Build later", "Upgrade later", "Unknown Town", "Research later", "Schedule this Task for Later", "We started building ", "<center>HALT!</center><br>Please wait, TTQ is processing this task!<br>Step", "Traps", " build request sent. However, it appears that the building is not building.", "was attempted but the server redirected us.", "The task was scheduled.", "Redirected", "We can't schedule this task right now.", "Error", "Scheduled Tasks", "Delete", "Send later", "No troops were selected.", "Your troops were sent to", "Your troops could not be sent to", "Reinforcement", "Attack", "Raid", "Catapults will aim at", "random", "at", "or after", "seconds", "minutes", "hours", "days", "Spy for resources and troops", "Spy for troops and defenses", "away", "The attack cannot be scheduled because no destination was specified.", "at site no.", "Sort by:", "type ", "time ", "target ", "options ", "village ", "Task History", "Flush History", "We started researching ", " cannot be researched.", "Page Failed", "Spy", "train later", "troops.", "... May have not happened!", "We started training ", " cannot be trained.", "Party Later", " but not today.", "We started to ", "Close", "Add/Edit Task Schedule", "Edit and Close", "Add and Close", "Add", "Are you sure you want to [s1] [s2]?", "Demolish Later", "Demolishing", "Cannot demolish", "Invalid coordinates or no resources selected.", "Using Local Time", "Using Server Time", " was attempted but we could not find the link.", " was attempted but failed. Reason: ", "No Link", " was attempted but the building was not found.", "No Building", " was attempted but the server returned an error.", "Server:", "Confirmation Failed", "Sorry, I <b>may</b> have built the building in the wrong town.", "Misbuild:", "Sent Back/Withdrew troops.<br>Troops are going home to:", "Sent Back/Withdrew troops Failed (I think).<br>Troops were supposed to go home to: ", "Click to make this your Active Village." , "Click to see this Village Details screen.", "Timeout or TTQ Crash"];
	var nLangMenuOptions = ["TTQ: ", "Use server time", "Use local time", "Set your tribe", "Task History", "Reset", "\nHow many past tasks do we keep in history?\n(Type 0 to disable task history.) \nCurrently: ", " What is your tribe on this server?\nType 0 for Romans, 1 for Teutons, 2 for Gauls, 5 for Egyptians, 6 for Huns, 7 for Spartans, 8 for Vikings. Or a negative number to enable autodetect (ie: -1)\nCurrently: ", "Are you sure you want to reset all TTQ variables?", "Debug", "Enable debug log on screen. Debug level values:\n0 - quiet, 1 - nearly quite, 2 - verbose, 3 - detailed"];
	// The english troop names are not really needed. But they are provided here in the situation that the the troop name autodetect (rip) does not work. (ie. no rally point)
	var nLangTroops = new Array();
	nLangTroops.push( ["Legionnaire", "Praetorian", "Imperian", "Equites Legati", "Equites Imperatoris", "Equites Caesaris", "Battering Ram", "Fire Catapult", "Senator", "Settler", "Hero", nLangStrings[7]] );
	nLangTroops.push( ["Clubswinger", "Spearman", "Axeman", "Scout", "Paladin", "Teutonic Knight", "Ram", "Catapult", "Chief", "Settler", "Hero", nLangStrings[7]] );
	nLangTroops.push( ["Phalanx", "Swordsman", "Pathfinder", "Theutates Thunder", "Druidrider", "Haeduan", "Ram", "Trebuchet", "Chieftain", "Settler", "Hero", nLangStrings[7]] );
	nLangTroops.push( ["Rat", "Spider", "Snake", "Bat", "Wild Boar", "Wolf", "Bear", "Crocodile", "Tiger", "Elephant"] );
	nLangTroops.push( ["Pikeman", "Thorned Warrior", "Guardsman", "Birds Of Prey", "Axerider", "Natarian Knight", "War Elephant", "Ballista", "Natarian Emperor", "Settler"] );
	nLangTroops.push( ["Slave Militia", "Ash Warden", "Khopesh Warrior", "Sopdu Explorer", "Anhur Guard", "Resheph Chariot", "Ram", "Stone Catapult", "Nomarch", "Settler", "Hero"] );
	nLangTroops.push( ["Mercenary", "Bowman", "Spotter", "Steppe Rider", "Marksman", "Marauder", "Ram", "Catapult", "Logades", "Settler", "Hero"] );
	nLangTroops.push( ["Hoplite", "Sentinel", "Shieldsman", "Twinsteel Therion", "Elpida Rider", "Corinthian Crusher", "Ram", "Ballista", "Ephor", "Settler", "Hero"] );
	nLangTroops.push( ["Thrall", "Shield Maiden", "Berserker", "Heimdall's Eye", "Huskarl Rider", "Valkyrie's Blessing", "Ram", "Catapult", "Jarl", "Settler", "Hero"] );

	// The english resource names are also not really needed. But provided in the case that the resource autodetect should fail.
	var aLangResources = ["Lumber","Clay","Iron","Crop"];


	/***************************************************************************
    *								Translations
	*                            --------------------
	*  There are four translation arrays: aLangBuildings, aLangTasks, aLangStrings and aLangMenuOptions
	*  aLangTroops is ripped from rally point upon first load. aLangResources is ripped each load.
	*  If an array does not appear for your language, TTQ will use the english version instead.
	*  Words that are removed, and appear as the number zero (0), currently have no translation and the english version is used.
 	***************************************************************************/
	switch(sLang) {
	case "ae": //Arabic (U.A.E) by Fahad (updated by Pimp Trizkit)
	case "eg": //Arabic (Egypt)
	case "sa": //Arabic (Saudi Arabia)
	case "sy": //Arabic (Syria)
		aLangTasks = ["بناء", "تطوير", "هجوم", "فتح قسم", "تدريب", "احتفل", "دمر", "ارسال التجار"];
		aLangStrings = ["البناء لاحقا", "تطوير لاحقا", 0, "فتح القسم لاحقا", "جدولة هذا العمل لاحقا", "لقد بداءالبناء ", 0, 0, " لا يمكن ان يبناء.", 0, "هذا العمل مجدول", 0, "لا يمكن ادراج هذه العملية لان.", 0,"المهام المجدولة", "حذف", "ارسال لاحقا", "لم يتم اختيار الجنود.", "الجنود متوجهين الى","جيوشك لا يمكن ارسالها الى", "مساندة", "هجوم", "نهب", "تصويب المقلاع نحو", "عشوائي", "عند", "او بعد", "ثانية", "دقيقة", "ساعة", "يوم", "التجسس على الجيوش والموارد","التجسس على الجيوش والتحصينات", "بعيد","لا يمكن جدولة هذا الهجوم لان الهدف غير محدد ", "الموقع غير موجود", "فرز بواسطة:","النوع ", "الوقت ", "الهدف ", "الخيارات ", "القرية ", "مهام محفوظه", "محفوظات حالية","بداية عملية البحث ", " لا تستطيع اعادة البحث" , 0 , "تجسس" , "تدريب لاحقا" , "جنود" , 0 , "تم بدء التدريب" , "لا تستطيع التدريب"];
		break;

	case "ba": //Bosnian by bhcrow (updated by Pimp Trizkit)
		aLangTasks = ["Izgradi", "Unaprijedi", "Napad", "Istraživati", "Trenirati", "Zabava", "Rušiti", "Pošalji trgovci"];
		aLangStrings = ["Gradi poslije", "Unaprijedi poslije", 0, "Istraživati poslije", "Isplaniraj ovaj zadatak za poslije.", "Počela je gradnja ", 0, 0, " ne može graditi.", 0, "Isplaniran je zadatak.", 0, "Ne možemo zakazati ovaj zadatak upravo sada.", 0, "Planirani zadaci", "Izbrisati", "Pošalji Kasnije", "Trupe nisu odabrane.", "Vaša trupe su poslane", "Vaše postrojbe nisu mogle biti poslane u", "Podrška", "Napad", "Pljačka", "Katapulti će cilj", "slučajan", "u", "ili nakon", "sekundi", "minuta", "sahati", "dana", "špijun za resurse i trupe", "špijun za trupe i obrana", "od", "Napad ne može se planirati jer odredište nije naveden.", "na stranici br."];
		break;

	case "bg": //Bulgarian by penko & pe (updated by Pimp Trizkit)
		aLangTasks = ["Построяване на", "Надстройка на", "Атака към", "Откриване на", "Трениране на", "Партия", "Сривам", "Изпрати Търговци"];
		aLangStrings = ["Постройте по-късно", "Надстройте по-късно", 0, "Открийте по-късно", "Запишете тази задача за по-късно.", "Започна строеж ", 0, 0, " не може да бъде построено.", 0, "Задачата е планирана.", 0, "Тази задача не може да бъде планирана сега.", 0, "Планирани задачи", "Изтриване", "Изпрати по-късно", "Атаката не може да бъде планирана, защото не са избрани войници.", "Вашите войници са изпратени към", "Вашите войници не могат да бъдат изпратени към", "Подкрепление към", "Атака към", "Набег към", "Катапултите се целят в", "случайно", "в", "или след", "секунди", "минути", "часа", "дена", "Шпиониране за ресурси и войска", "Шпиониране за войска и защита", "липсва", "Атаката не може да бъде планирана, тъй като не е избрана цел.", 0, "Сортиране по:", "тип ", "време ", "цел ", "опции ", "град ", "История на задачите", "изчистване на историята", "Започна изучаването", " не може да бъде изучен.", 0, "Шпионаж", "Тренирай по-късно", "войски.", 0, "Започна тренирането ", " не може да бъде трениран."];
		break;

	case "br": //Brazilian Portuguese by getuliojr (updated by Pimp Trizkit)
		aLangTasks = ["Construir", "Melhorar", "Atacar", "Desenvolver", "Treinar", "Festa", "Demolir", "Enviar comerciantes"];
		aLangStrings = ["Construir Mais Tarde", "Melhorar Mais Tarde", 0, "Desenvolver Mais Tarde", "Programar esta tarefa para mais tarde.", "Começamos a construir ", 0, 0, " não pode ser construído.", 0, "A tarefa foi programada.", 0, "Não conseguimos programar esta tarefa agora.", 0, "Tarefas Programadas", "Apagar", "Enviar Mais Tarde", "Não foram selecionadas tropas.", "As suas tropas foram enviadas para", "Não foi possível enviar as suas tropas para", "Reforços", "Ataque:normal", "Ataque:assalto", "As catapultas irão mirar em", "Aleatório", "em", "ou depois","segundos", "minutos", "horas", "dias","Espiar recursos e tropas", "Espiar defesas e tropas", "Ausente", "O ataque não pode ser programado pois nenhum destino foi escolhido.", "na localização no.", "Ordenar por:", "tipo ", "hora ", "alvo ", "opções ", "aldeia ","Histórico das Tarefas", "apagar histórico", "Começamos a pesquisar ", " não pode ser pesquisado.", 0, "Espiar", "Treinar mais tarde", "tropas.", 0, "Começamos a treinar ", " não pode ser treinado."];
		break;

	case "cl": //Spanish Chilean by Benjamin F. (updated by Pimp Trizkit)
		aLangTasks = ["Construir", "Mejorar", "Atacar", "Investigar", "Entrenar", "Fiesta", "Demoler", "Enviar Comerciantes"];
		aLangStrings = ["Construir más tarde", "Actualización más tarde", 0, "Investigar más tarde", "Programar esta tarea para más tarde", "Hemos empezado a construir el edificio ", 0, 0, " no puede ser construido.", 0, "La tarea ha quedado programada.", 0, "No se puede programar esa tarea ahora.", 0, "Tareas programadas", "Eliminar", "Enviar más tarde", "No se selecionaron tropas.", "Tus tropas se enviaron a", "Tus tropas NO han podido ser enviadas", "Refuerzos", "Ataque: normal", "Ataque: asalto", "Catapultas atacar...", "aleatorio", "a", "o después", "segundos", "minutos", "horas", "días", "Espiar recursos y tropas ", "Espiar defensas y tropas", "fuera(away)", "El ataque no se ha programado porque no se fijo el objetivo.", "al cuadrante ns", 0, 0, 0, 0, 0, 0, "Historial de la Tarea", "Borrar la Historia", "Comenzamos la investigación de ", " no puede ser investigado.", 0, "Espiar", "Entrenar más Tarde", "las tropas.", 0, "Hemos comenzado a entrenar a ", " no pueden ser entrenados.", "Fiesta más Tarde", " pero no hoy.", "Empezamos a ", "Cerrar", "Agregar / Editar Lista de Tareas", "Editar y Cerrar", "Agregar y Cerrar", "Agregar", "¿Estás seguro de que desea [s1] [s2]?", "Demoler más Tarde", "Demolición", "No se puede demoler"];
		break;

	case "cn": //Chinese (PRC) by Jacky-Q (updated by Pimp Trzikit)
		aLangTasks = ["建筑", "升级", "攻击", "研发", "训练", "党的", "拆除", "发送招商"];
		aLangStrings = ["预定建筑", "预定升级", 0, "预定研发", "将此事预定稍后进行.", "建筑开始了", 0, 0, " 不能建筑.", 0, "此事项已预定稍后执行.", 0, "我们暂时不能预定稍后执行.", 0, "已预订稍后执行项目", "删除", "稍后送出", "攻击不能预定执行因为没有选择军队.","你的军队已送出", "你的军队不能送出", "支援", "攻击", "抢夺", "投石车会瞄准", "随机", "于", "或之后", "秒", "分", "时", "日", "侦察物资及军队", "侦察物资及防御","不在", "攻击无法预定执行,因为没有指定目的地.", 0, "分类以:", "类型", "时间", "目标 ", "选项", "村庄", "工作记录", "刷新历史", "我们开始研究", "不能研究", 0, "间谍", "培训后", "部队。", 0, "我们开始训练", "不能训练。"];
		break;

	case "cz": //Czech (updated by Pimp Trizkit)
		aLangTasks = ["Postavit", "Rozšířit", "Zaútočit na", "Vyzkoumat", "Trénovat", "Večírek", "Zbourat", "Poslat Obchodníci"];
		aLangStrings = ["Postavit později", "Rozšířit později", 0, "Vyzkoumat později", "Naplánujte tuto akci na později.", "Začali jsme stavět ", 0, 0, " se nedá postavit.", 0, "Úloha byla naplánována.", 0, "Tuto akci momentálně není možné naplánovat.", 0, "Naplánované akce", "Smazat", "Vyslat později", "Útok není možné naplánovat, protože nebyly vybrány žádné jednotky.", "Jednotky jsou na cestě do", "Nepodařilo se vyslat jednotky do", "Podpořit", "Zaútočit na", "Oloupit", "Katapulty zamířit na", "náhodně", "o", "anebo za", "sekund", "minut", "hodin", "dní", "Prozkoumat jednotky a suroviny", "Prozkoumat jednotky a obranné objekty", "pryč", "Útok není možné naplánovat, protože chybí cíl.", "na místě č.", "Třídit podle:", "druhu ", "času ", "cíle ", "možnosti ", "vesnice ", "Historie", "smazat historii", "Začli jsme vyvíjet ", " se nedá vynajít.", 0, "Vyšpehovat", "Vycvičit později", "jednotky.", 0, "Začli jsme cvičit ", " se nedá vycvičit."];
		break;

	case "de": //German by Metador (updated by Pimp Trizkit)
        aLangTasks = ["Gebäude bauen", "Ausbau von", "Angriff", "Unterstützung", "verbessern", "Partei", "Abreißen", "Händler senden"];
        aLangStrings = ["Später bauen", "Später ausbauen", 0, "Später unterstützen", "Führe den Auftrag später aus.", "Gebäudebau gestartet von ", 0, "Fallen", " kann nicht gebaut werden.", 0, "Der Auftrag wurde hinzugefügt.", 0, "Dieser Auftrag kann jetzt nicht Aufgegeben werden.", 0, "Aufträge:", "Löschen", "Später senden", "Keine Truppen ausgewählt worden.", "Deine Truppen wurden geschickt zu", "Deine Truppen konnten nicht geschickt werden zu", "Unterstützung", "Angriff: Normal", "Angriff: Raubzug", "Die Katapulte zielen auf", "Zufall", "um", "oder nach", "Sekunden", "Minuten", "Stunden", "Tage", "Rohstoffe und Truppen ausspähen", "Verteidigungsanlagen und Truppen ausspähen", "weg", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Ungültige Koordinaten oder keine Ressourcen ausgewählt"];
        break;

	case "dk": //Danish by Polle1 (updated by PT)
		aLangTasks = ["Byg", "Viderebyg", "Angrib", "Udforsk", "Uddan", "Hold fest", "Nedriv", "Send Handelsmænd"];
		aLangStrings = ["Byg senere", "Viderebyg senere", 0, "Udforsk senere", "Planlæg denne opgave til senere.", "Vi har startet byggeriet", 0, 0, " kan ikke bygges.", 0, "Opgaven blev planlagt til senere.", 0, "Vi kan ikke planlægge denne opgave lige nu.", 0, "Planlagte opgaver", "Slet", "Send senere", "Der er ikke nok tropper tilgængelig.", "Dine tropper blev sendt til", "Dine tropper kunne ikke sendes til", "Opbakning", "Angrib", "Plyndringstogt", "Katapulterne skyder mod", "tilfældigt", "mod", "eller om", "sekunder", "minutter", "timer", "dage", "Efterforsk råstoffer og tropper", "Efterforsk forsvarsanlæg og tropper", "væk", "Angrebet kan ikke planlægges pga. mangel på mål.", "på plads nr.", "Sorter efter:", 0, "tid ", "mål", "valg ", "landsby ", "Opgave-historik", "slet historik", "vi startede udforskning ", " kan ikke udforskes.", 0, "Spion", "Uddan senere", "tropper.", 0, "vi startede uddannelse", " kan ikke uddannes.", "Hold fest senere", " men ikke i dag.", "Vi startede ", "Luk", "Tilføj/Edit Task Schedule", "Edit og luk", "Tilføj og luk", "Tilføj", "Er du sikker på at du ønsker at [s1] [s2]?", "Nedriv sener", "Nedriver", "Kan ikke nedrive", "Forkerte koordinater el. ingen råstoffer valgt."];
		aLangMenuOptions = [0, "Brug server tid", "brug pc tid", "Indstil dit folkeslag", "Opgave historie", 0, "\nHvor mange opgaver skal vi vise i opgavehistorie?\n(Tast 0 hvis du ikke ønske opgavehistorie.) \nNuværende: ", "\nHvilket folkeslag er du på denne server?\n(Tast 0 for Romer, 1 for Germaner, 2 for Galler.) \nNuværende: ", 0];
		break;

	case "ee": //Estonian by hit^
		aLangTasks = ["Ehita", "Täiusta", "Ründa", "Arenda", "Treeni"];
		aLangStrings = ["Ehita hiljem", "Täiusta hiljem", 0, "Arenda hiljem", "Täida ülesanne hiljem.", "Alustasime ehitamist: ", 0, 0, " ei saa ehitada.", 0, "Ülesanne seatud.", 0, "Ülesannet ei saa hetkel ajastada.", 0, "Ajastatud ülesanded", "Kustuta", "Saada hiljem", "Ühtegi sõdurit pole valitud.", "Sõdurid saadeti külasse", "Sõdureid ei saa saata külasse", "Tugi", "Ründa", "Rüüsta", "Katapultide sihtmärk", "juhuslik", "kell", "või peale", "sekundit", "minutit", "tundi", "päeva", "Luura ressursse ja sõdureid", "Luura sõdureid ja kaitset", "eemal", "Sihtpunkt pole määratud.", 0, "Sorteeri:", "tüüp ", "aeg ", "sihtmärk ", "valikud ", "küla ", "Alalugu", "puhasta ajalugu", "Alustasime arendamist ", " ei saa arendada.", 0, "Luura", "Treeni hiljem", "sõjavägi.", 0, "Alustasime treenimist: ", " ei saa treenida."];
		break;

	case "ar": //Spanish Argentinian
	case "es": //Spanish by Carlos R (fixed by Mr.Kurt & Voltron).
		aLangTasks = ["Construir", "Mejorar", "Atacar", "Investigar", "Entrenar"];
		aLangStrings = ["Construir más tarde", "Mejorar más tarde", 0, "Investigar más tarde", "Programar esta tarea para más tarde", "Hemos empezado a construir el edificio ", 0, 0, " no puede ser construido.", 0, "La tarea ha quedado programada.", 0, "No se puede programar esa tarea ahora.", 0, "Tareas programadas", "Eliminar", "Enviar más tarde", "No se selecionaron tropas.", "Tus tropas se enviaron a", "Tus tropas NO han podido ser enviadas", "Refuerzo", "Atacar", "Saquear", "Catapultas atacarán...", "aleatorio", "a", "o después", "segundos", "minutos", "horas", "días", "Espiar recursos y tropas ", "Espiar defensas y tropas", "fuera(away)", "El ataque no se ha programado porque no se fijo el objetivo.", "al cuadrante nş", "Ordenar por:", "tipo ", "hora ", "objetivo ", "opciones ", "aldea ", "Historial de tareas", "Borrar Historial", "Se ha empezado a investigar ", " no puede ser investigado.", 0, "Espiar", "Entrenar más tarde", "tropas.", 0, "Se ha empezado a entrenar ", " no se puede entrenar."];
		break;

	case "fi": //Finish Ei vielä valmis, auttakaas !
		aLangTasks = ["Rakenna", "Päivitä", "Hyökkää", "Tiedustele", "Kouluta"];
		aLangStrings = ["Rakenna myöhemmin", "Päivitä myöhemmin", 0, "Tiedustele myöhemmin", "Lisää rakennusjonoon", "Rakenna ", 0, 0, " ei voida rakentaa.", 0, "Tehtävä lisätty rakennusjonoon.", 0, "Ei voida lisätä rakennusjonoon juuri nyt.", 0, "Tehtävät rakennusjonossa", "Poista", "Lähetä myöhemmin", "Hyökkäystä ei voitu lisätä jonoon, koska yhtään joukkoja ei ole valittu.", "Joukkosi on lähetetty ", "Joukkojasi ei voida lähettää ", "Ylläpito", "Hyökkäys: Normaali", "Hyökkäys: Ryöstö", "Katapulttien kohde", "satunnainen", "nyt", "tai myöhemmin", "sekuntit", "minuutit", "tunnit", "päivät", "Tiedustele resursseja ja joukkoja", "Tiedustele joukkoja ja puollustuksia","poissa", 0, 0, "Järjestä:", "tyyppi ", "aika ", "kohde ", "asetukset ", "kylä "];
		aLangMenuOptions = [0, "Käytä palvelimen aikaa", "Käytä paikallista aikaa", "Aseta heimo", "Tehtävähistoria", 0, 0, "\nMinkä heimon valitsit tälle serverille?\n(Vastaa 0 Roomalaiset, 1 Teutonit, 2 Gallialaiset.) \nNykyinen: ", 0];
		break;

	case "fr": //French
		aLangTasks = ["Construire le bâtiment", "Augmenter au"];
		aLangStrings = ["Construire plus tard", "Améliorer plus tard", 0, "Rechercher plus tard", "Programmer cette tâche pour plus tard.", "Construction commencée ", 0, 0, " ne peut être construit.", 0, "La tâche a été programmée.", 0, "Cette tâche ne peut être programmée actuellement.", 0, "Tâches programmées", "Supprimer", "Envoyer plus tard", "L'attaque ne peut pas être programmée car aucune troupe n'a été sélectionnée.", "Vos troupes ont été envoyées à ", "Vos troupes n'ont pas pu être envoyées à ", "Assistance", "Attaque: Normal", "Attaque: pillage", "Les catapultes ont pour cible", "aléatoire", "sur", "ou après", "secondes", "minutes", "heures", "jours", "Espionner troupes et ressources", "Espionner troupes et défenses", "ailleurs", "L'attaque ne peut être programmée car aucune destination n'a été spécifiée.", "au site no.", "Trier par:", "type ", "durée ", "cible "];
		break;

	case "gr": //Greek by askgdb (fixed by tsekouri_gr)
		aLangTasks = ["Κατασκευή", "Αναβάθμιση", "Επίθεση", "Έρευνα", "Εκπαίδευση","Αποστολή Πρώτων Υλών"];
		aLangStrings = ["Κατασκευή Αργότερα", "Αναβάθμιση Αργότερα", 0, "Έρευνα Αργότερα", "Πραγραμματισμός Εργασίας Για Αργότερα.", "Ξεκίνησε Κατασκευή", 0, 0, " Δεν Μπορεί Να Κατασκευαστεί.", 0,  "Η Εργασία Πραγραμματίστηκε .", 0, "Δεν Μπορεί Να Πραγραμματισθεί Αυτή Η Εργασία Τώρα.", 0, "Πραγραμματισμένες Εργασίες", "Διαγραφή", "Αποστολή Αργότερα", "Η Επίθεση Δεν Μπορεί Να Προγραμματισθεί Επειδή Δεν Επιλέχθηκαν Στρατιώτες.", "Οι Στρατιώτες Στάλθηκαν", "Οι Στρατιώτες Δεν Μπόρεσαν Να Σταλούν", "Ενίσχυσεις", "Επίθεση", "Εισβολή Αρπαγής", "Οι Καταπέλτες Θα Στοχέυσουν Σε", "Τυχαία", "Σε", "ή Μετά", "Δευτερόλεπτα", "Λεπτά",   "Ώρες",  "Μέρες", "Ανίχνευση Πρώτων Υλών Και Στρατευμάτων", "Ανίχνευση Οχύρωσης Και Στρατευμάτων", "Μακριά", "Η Επίθεση Δεν Μπορεί Να Προγραμματισθεί Επειδή Δεν Ορίστικαν Συντεταγμένες ή Όνομα Χωριού.", "Σε Θέση.", "Ταξινόμηση Κατά:", "Τύπο ", "Χρόνο ", "Στόχο ", "Επιλογές ", "Χωριό ", "Ιστορικό Εργασιών", "Καθαρισμός Ιστορικού", "Ξεκίνησε η έρευνα ", " δεν μπορεί να ερευνηθεί.", 0, "Ανίχνευσε", "Εκπαίδευσε αργότερα", "μονάδες.", 0, "Ξεκίνησε η εκπαίδευση ", " δεν μπορεί να εκπαιδευτεί.",  "Αργότερα Κόμμα", 0, 0, "Κλείνω", "Προσθήκη / Επεξεργασία ομάδας Πρόγραμμα", "Επεξεργασία και Κλείσιμο", "Προσθήκη και Κλείσιμο", "Προσθέτω", "Είστε σίγουροι ότι θέλετε να [s1] [s2]?", "Αργότερα κατεδάφιση", "Κατεδάφιση", "Δεν είναι δυνατή η κατεδάφιση", "Άκυρα συντεταγμένες ή δεν πόρων επιλέγονται."];
		break;

	case "he": //Hebrew
	case "il": //Israel by DMaster
		aLangTasks = ["בנה", "שדרג", "התקף", "חקור", "אמן", "שלח משאבים"];
		aLangStrings = ["בנה בעתיד", "שדרג בעתיד", 0, "חקור בעתיד", "הכנס משימה זו ללוח הזמנים בעתיד.", "התחלנו לבנות ", 0, 0, " לא יכול להבנות.", 0, "המשימה נכנסה ללוח הזמנים.", 0, "אנחנו לא יכולים להכניס משימה זו ללוח הזמנים כרגע.", 0, "משימות בלוח הזמנים", "מחק", "שלח בעתיד", "לא נבחרו כוחות.", "הכוחות שלך נשלחו ל", "הכוחות שלך לא יכלו להשלח ל", "עזרה", "התקפה: רגילה", "התקפה: בזיזה", "בליסטראות ישאף ב", "אקראית", "ב", "או לאחר", "שניות", "דקות", "שעות", "ימים", "ברר אחר משאבים וכוחות", "ברר לגבי הגנות וכוחות", "רחוק", "ההתקפה לא נכנסה ללוח הזמנים משום שהיעד אינו צויין.", "מבנה מספר ", "מיין לפי:", "מיקום, ", "שעות, ", "מטרה, ", "אפשוריות ", "כפר, ", "היסטוריה", "רוקן היסטוריה", "התחלנו לבנות ", " לא יכולנו לבנות.", 0, "רגל", "אמן בעתיד", "כוחות.", 0, "התחלנו לאמן ", " לא יכולנו לאמן.", "צד אחר", " אבל לא היום.", "התחלנו ", "סגור", "הוספה / עריכה של המשימות לוח", "עריכת סגור", "הוסף וסגור", "להוסיף", "האם אתה בטוח שאתה רוצה [s1] [s2]?", "להרוס מאוחר", "להריסת", "לא יכול להרוס", "הקואורדינטות לא חוקית או ללא משאבים נבחרים."];
		break;

	case "hk": //Chinese (Hong Kong)
		aLangTasks = ["建築", "升級", "攻擊", "研發", "訓練", "舉行派對", "拆毀"];
		aLangStrings = ["排程建造", "排程升級", 0, "排程研發", "將此事項排程稍後執行。", "已經開始建造", 0, 0, "建造失敗。", 0, "工作已編入排程。", 0, "暫時不能排程稍後執行.", 0, "已排定的工作", "删除", "排程派遣軍隊", "你沒有選擇軍隊。","你的軍隊已派遣至", "你的軍隊不能派遣至", "增援", "攻擊", "搶奪", "投石車會瞄準", "隨機目標", "於", "或之後", "秒", "分鐘", "小時", "天", "偵察物資及軍隊", "偵察軍隊及防禦","不在", "攻擊無法排程執行，因為沒有指定目的地。", "位於地點編號", "排序︰", "類型", "時間", "目標", "選項", "村莊", "工作記錄", "清除記錄", "已經開始研發", "研發失敗。", 0, "偵察", "排程訓練", "部隊。", 0, "已經開始訓練", "訓練失敗。", "排程舉行派對", "失敗", "已經開始", "關閉", "新增/編輯工作排程", "編輯及關閉", "新增及關閉", "新增", "你確定要[s1][s2]嗎？", "排程拆毀", "正在拆毀", "無法拆毀"];
		aLangMenuOptions = [0, "使用伺服器的時間", "使用本地時間", "設定你的種族", "工作記錄", 0, "\n要保留多少項工作記錄？\n(要停用工作記錄請輸入 0 ) \n現在的設定值︰", "\n你在這個伺服器是甚麼種族？\n(0 是羅馬, 1 是條頓, 2 是高盧)\n現在的設定值︰", 0];
		break;

	case "hr": //Croatian by Damir B.
		aLangTasks = ["Izgradi", "Nadogradi", "Napad", "Istraži", "Treniraj"];
		aLangStrings = ["Gradi poslije", "Nadogradi poslije", 0, "Istraži poslije", "Isplaniraj ovaj zadatak za poslije.", "Počela je gradnja ", 0, 0, " ne može biti izgrađeno.", 0, "Isplaniran je zadatak.", 0, "Ne može se isplanirati ovaj zadatak sada.", 0, "Planirani zadaci", "izbriši", "Pošalji poslije", "Trupe nisu odabrane.", "Vaša vojska je poslana na", "Vaša vojska ne može biti poslana na", "Podrška", "Napad", "Pljačka", "Katapulti će rušiti", "slučajno", "u", "ili nakon", "sekundi", "minuta", "sati", "dana", "Špijuniraj resourse i trupe", "Špijuniraj trupe i odbranu", "odsutan", "Napad ne može biti isplaniran jer destinacija nije određena.", "na stranici br.", "Sortiraj po:", "tip ", "vrijeme ", "meta ", "opcije ", "selo "];
		break;

	case "hu": //Hungarian by [TAJM]Kobra
		aLangTasks = ["Építés", "Szintemelés", "Támadás", "Fejlesztés", "Kiképzés"];
		aLangStrings = ["Építés később", "Szintemelés később", 0, " Fejlesztés később", "A művelet időzítve későbbre.", "Az építés elkezdődött ", 0, 0, " nem épülhet meg.", 0, "Időzítésre került feladat:", 0, "Jelenleg nem időzíthető", 0, "Időzített feladatok:", "Törlés", "Küldés később", "A támadás nem időzíthető! Nem lettek egységek kiválasztva.", "Az egységeid elküldve","Az egységek elküldése nem sikerült, ide:", "Támogatás", "Normál támadás", "Rablótámadás", "A katapult(ok) célpontja", "véletlenszerű", "Ekkor:", "vagy késleltetve", "másodperccel", "perccel", "órával", "nappal", "Nyersanyagok és egységek kikémlelése", "Egységek és épületek kikémlelése", "távol", "A támadás nem időzíthető! Nem lett végcél kiválasztva.", "a következő azonisítóval rendelkező helyen:", "Rendezés:", "típus ", "idő ", "célpont ", "beállítások ", "falu ", "Feladat története", "előzmények törlése"];
		break;

	case "id": //Indonesian by iwean
		aLangBuildings = ["", "Penebang Kayu", "Galian Tanah Liat", "Tambang Besi", "Ladang", "Pemotong Kayu", "Pabrik Bata", "Pelebur Besi", "Gilingan Gandum", "Toko Roti", "Gudang", "Lumbung", "<Tanah Kosong>", "Pandai Besi", "Titik Temu", "Balai Desa", "Pusat Kebugaran", "Pasar", "Kedutaan", "Barak", "Kandang", "Bengkel", "Akademi", "Celah", "Balai Kota", "Kastil", "Istana", "Gudang Ilmu", "Kantor Dagang", "Barak Besar", "Kandang Besar", "Tembok Kota", "Tembok Tanah", "Pagar Kayu", "Tukang Batu", "Pabrik Bir", "Ahli Perangkap", "Padepokan", "Gudang Besar", "Lumbung Besar", "Keajaiban Dunia", "Palung Kuda", "Pagar Batu", "Pagar Darurat", "Pusat Komando", "Menara Air","Rumah Sakit"];
		aLangTasks = ["Bangun", "Tingkatkan", "Serang", "Penelitian", "Latih", "Pesta", "Hancurkan", "Kirim Pedagang", "Kirim Balik/Tarik"];
		aLangStrings = ["Bangun nanti", "Tingkatkan nanti", "Kampung Entah", "Teliti nanti", "Atur Tugas Nanti", "Kita mulai membangun", "<center>TAHAN!</center><br>Mohon bersabar, TTQ sedang memproses tugas!<br>Langkah", "Perangkap", " permintaan bangunan terkirim. Namun, tampaknya itu bukan bangunan.", " dicoba tetapi server mengalihkan kita.", "Tugas dijadwalkan.", "Dialihkan", "Tidak dapat menjadwalkannya sekarang.", "Galat", "Tugas Terjadwal", "Hapus", "Kirim nanti", "Tak ada pasukan dipilih.", "Pasukan berangkat ke", "Pasukan tak bisa berangkat ke", "Bantuan", "Serangan", "Begal", "Katapul membidik ke", "acak", "pada", "atau sesudah", "detik", "menit", "jam", "hari", "Pengintau sumberdaya dan pasukan", "Pengintai pasukan dan pertahanan", "pergi", "Serangan tak bisa dijadwalkan karena tidak ada tujuan.", "halaman.", "Urutan:", "tipe ", "waktu ", "target ", "pilihan ", "desa ", "Catatan Tugas", "Tutup Catatan", "Kami mulai meneliti ", " tidak dapat diteliti.", "Halaman Gagal", "Pengintai", "latih nanti", "pasukan.", "... Mungkin belum terjadi!", "Kita mulai latihan ", " tak dapat dilatih.", "Pesta nanti", " tapi tak sekarang.", "Kita mulai ", "Tutup", "Tambah/Sunting Jadwal Tugas", "Sunting dan Tutup", "Tambah dan Tutup", "Tambah", "Anda yakin mau [s1] [s2]?", "Hancurkan nanti", "Menghancurkan", "Tak dapat dihancurkan", "Koordinat salah atau tak ada sumber daya dipilih.", "Waktu Setempat", "Waktu Server", " dicoba tapi gagal menemukan tautan.", " dicoba tapi gagal. Alasan: ", "Tak ada Tautan", " dicoba tapi gagal menemukan bangunan.", "Tak ada Bangunan", " dicoba tapi server error.", "Server:", "Konfirmasi Gagal", "Maaf, <b>mungkin</b> membangun di desa yang salah.", "Salah bangun:", "Kirim Balik/Tarik pasukan.<br>Pasukan pulang ke:", "Kirim Balik/Tarik pasukan Gagal (mungkin).<br>Pasukan seharusnya pulang ke: ", "Klik untuk jadikan ini Desa aktif.", "Klik untuk melihat layar Detail Desa ini.", "Timeout atau Hang"];
		break;

	case "ir": //Persian (Iran) by nekooee
		aLangTasks = ["بنا کردن", "ارتقاء دادن", "حمله کردن", "تحقیق کردن", "تربیت کردن"];
		aLangStrings = ["بعدا بنا کن", "بعدا ارتقاء بده", 0, "بعدا تحقیق کن", "زمان بندی وظیفه برای بعدا", "شروع کردیم به ساختن ", 0, 0, " نمی توان بنا کرد.", 0, "وظیفه زمان بندی شد.", 0, "نمی توانیم این وظیفه را به درستی زمانبندی کنیم همکنون.", 0, "وظایف زمانبندی شده", "حذف کردن", "بعدا بفرست", "لشکر انتخاب نشده.", "لشکر شما فرستاده شد به", "لشکر شما را نمی توان فرستاد به", "پشتیبانی", "حمله عادی", "غارت", "منجنیقها هدف گرفتند", "تصادفی", "به سوی", "یا بعد از", "ثانیه", "دقیقه", "ساعت", "روز", "شناسایی منابع و لشکریان", "شناسایی عوامل مدافع و لشکریان", "در راه", "حمله نمی تواند زمان بندی شود زیرا مقصد مشخص نشده است.", "زیر ساخت آماده نیست.", "دسته بندی با:", "مدل ", "زمان ", "هدف ", "تنظیمات ", "دهکده ", "تاریخچه وظایف", "پاک کردن تاریخچه", "تحقیق را آغاز کردیم ", " نمی توان تحقیق را آغاز کرد.", 0, "جاسوسی", "بعدا تربیت کن", "لشکریان.", 0, "تربیت کردن را آغاز کردیم ", " نمی توان تربیت کرد."];
        aLangMenuOptions = ["در صف قرار دادن وظایف در تراوین: ", "از ساعت سرور استفاده کند", "از ساعت محلی استفاده کند", "نژاد خود را مشخص کنید", "تاریخچه وظیفه", 0, "\nچه تعداد وظیفه را در تاریخچه نگه دارد؟\n(اگر می خواهید تاریخچه غیر فعال باشد صفر را انتخاب کنید.) \nفعلی: ", "\nنژاد شما در این سرور چیست؟\n(برای رومن 0 برای توتن 1 و برای گول 2 را وارد کنید.) \nفعلی: ", 0];
		break;

	case "it": //Italian by BLM (Updated by PT)
		aLangTasks = ["Costruisci", "Amplia", "Attacca", "Ricerca", "Addestra", 0, 0, "Invia Risorse"];
		aLangStrings = ["Costruisci piu' tardi", "Amplia piu' tardi", 0, "Ricerca piu' tardi", "Programma questa attivita'.", "E' iniziata la costruzione di ", 0, 0, " non puo' essere costruito.", 0, "L'attivita' e' stata programmata.", 0, "Non e' possibile programmare questa attivita' adesso.", 0, "Attivita' Programmate", "Cancella", "Invia piu' tardi", "L'attacco non puo' essere programmato in quanto non sono state selezionate truppe.", "Truppe sono state inviate a", "Non e' stato possibile inviare le truppe a", "Rinforzo", "Attacco", "Raid", "Obbiettivo catapulte", "a caso", "all'orario", "oppure dopo", "secondi", "minuti", "ore", "giorni", "Spiare truppe e risorse", "Spiare difese e truppe", "assente", "L'attacco non puo' essere programmato in quanto non e' stato specificato l'obbiettivo.", "alla posizione n.", "Ordina per:", "tipo ", "orario ", "obbiettivo ", "opzioni ", "villaggio", "Archivio Attivita'", "svuota archivio", "La ricerca è iniziata", " non può essere ricercato", 0, "Spia", "Addestra più tardi", "truppe.", 0, "L'Addestramamento è iniziato ", " non può essere addestrato."];
		break;

	case "jp": //Japanese - By stchu (Updated by PT)
		aLangTasks = ["建築", "レベル上げ", "攻撃", "研究", "訓練"];
		aLangStrings = ["あとで建築する", "あとでレベルを上げる", 0, "あとで研究する", "このタスクをスケジュールする", "建築を始めました： ", 0, 0, " は建てられません。", 0, "タスクに追加されました。", 0, "このタスクは現在スケジュールできません。", 0, "タスク一覧", "削除", "あとで送る", "兵士が選択されていません。", "兵士が送られました： ", "兵士は送られませんでした： ", "援兵", "攻撃", "奇襲", "カタパルトの狙い： ", "ランダム", "時刻指定：", "もしくは時間指定：", "秒", "分", "時", "日", "資源と兵力を偵察", "資源と防衛力を偵察", 0, "目的地が特定できなかったので、攻撃はスケジュールできませんでした。", "サイトNo.", "ソート:", "タイプ ", "時間 ", "ターゲット ", 0, "村 ", "タスク履歴", "履歴をクリア", "研究を開始しました： ", " は研究できません。", 0, "偵察", "あとで訓練", "兵士", 0, "訓練を開始しました： ", " は訓練できません。"];
		aLangMenuOptions = [0, "サーバ時間を使用する。：日本ならば、GMT標準時刻＋9時間を設定してください。(「9」と入力)", "PCの時計を使用する。", "種族の設定", "タスク履歴", 0, "\nタスク履歴はいくつまでリストに残しますか?\n(0に設定すると、タスク履歴は使用しません。) \n現在の設定値: ", "\nあなたの種族は?\n(ローマ：0, チュートン：1, ガウル：2) \n現在の設定値: ", 0];
		break;

	case "kr": //Korean by Kimmo
		aLangTasks = ["것물 짓기", "업그레이드", "공격", "연구", "훈련"];
		aLangStrings = ["건설 예약", "업그레이드 예약", 0, "연구 예약", "작업을 나중으로 예약.", "건설을 시작: ", 0, 0, "을(를) 건설할수 없음.", 0, "작업이 예약되었습니다.", 0, "이 작업을 지금 시작 할 수 없습니다.", 0, "예정된 작업", "삭제", "보내기 예약", "선택된 병사가 없습니다.", "병력을 보냄: ", "병력을 보낼수 없음: ", "지원", "공격", "약탈", "투석기가 겨냥중: ", "임 의", "시각", "혹은 다음에", "초", "분", "시", "일", "병력과 자원을 염탐", "병력과 방어를 염탐", "송 환", "이 공격은 목적지가 지정되지 않아 불가능 합니다.", "지역 번호.", "정렬:", "유형 ", "시간 ", "대상 ", "설정 ", "마을 ", "작업 대기열", "기록 지우기", "연구를 시작: ", "은(는) 연구되지 않았습니다."];
		break;

	case "lt": //Lithuanian by NotStyle & ( GodZero, negadink daugiau skripto)
		aLangTasks = ["Statyti", "Patobulinti", "Siųsti karius", "Tyrinėti", "Treniruoti"];
		aLangStrings = ["Statyti vėliau", "Patobulinti vėliau", 0, "Tyrinėti vėliau", "Užplanuoti užduotį.", "Mes pradėjome statyti ", 0, 0, " neimanoma pastatyti.", 0, "Užduotis užplanuota.", 0, "Mes negalime užplanuoti dabar sitą užduoti.", 0, "Užplanuotos užduotys", "Ištrinti", "Siųsti vėliau", "Ataka negali būti užplanuota nes kariai nepasirinkti.", "Jūsų kariai nusiųsti į", "Jūsų kariai negali būti nusiųsti į", "Parama", "Ataka", "Reidas", "Katapultos bus nutaikyti į", "atsitiktinis", "į", "arba vėliau", "sekundės", "minutės", "valandos", "dienos", "Resursų bei pajėgų žvalgyba", "Gynybinių fortifikacijų bei pajėgų žvalgyba", "nėra", "Negalima užplanuoti atakos, nes taikinys nerastas.", "puslapyje Nr.", "Rūšiuoti pagal:", "[tipą] ", "[laiką] ", "[taikinį] ", "pasirinktys ", "[gyvenvietę] ", "Užduočių Praeitis", "[išvalyti praeitį]", "Mes pradėjome tyrinėjimą ", " negali būti tyrinėjamas."];
		break;

	case "lv": //Latvian by sultāns
		aLangTasks = ["Būvēt", "Paplašināt", "Uzbrukt", "Izpētīt", "Apmācīt"];
		aLangStrings = ["Būvēt vēlāk", "Uzlabot vēlāk", 0, "Izpētīt vēlāk", "Izveidot uzdevumu.", "Tika uzsākta būvniecība ", 0, 0, " nevar uzbūvēt.", 0, "Uzdevums ir ieplānots.", 0, "Mēs nevaram šobrīd to ieplānot.", 0, "Ieplānotie uzdevumi", "Dzēst", "Sūtīt vēlāk", "Uzbrukums nevar notikt, jo nav atzīmēti kareivji.", "Jūsu kareivji tika nosūtīti uz", "Jūsu kareivji nevar tikt nosūtīti", "Papildspēki", "Uzbrukums", "Iebrukums", "Ar katapultām bombardēt", "nejaušs", "kad", "vai pēc", "sekundes", "minūtes", "stundas", "dienas", "Izlūkot resursus un kareivjus", "Izlūkot aizsardzību un kareivjus", "Prom", "Uzbrukums nevar tikt izpildīts, jo nav norādīts mērķis.", "koordinātes kartē.", "Šķirot pēc:", "tipa ", "laika ", "mērķa ", "veida ", "ciema ", "Uzdevumu vēsture", "nodzēst vēsturi", "tika uzsākta izpēte", " nevar tikt izpētīts.", 0, "Izlūkot", "Apmācīt vēlāk", "kareivji.", 0, "Tika uzsākta uzlabošana", "nevar tikt uzlaboti."];
		break;

	case "mx": //Mexican Spanish by fidelmty
		aLangTasks = [ "Construir", "Mejorar", "Atacar", "Investigar", "Entrenar"];
		aLangStrings = ["Construir más tarde", "Mejorar más tarde", 0, "Investigar más tarde", "Programar esta tarea para más tarde", "Hemos empezado a construir el edificio ", 0, 0, " no puede ser construido.", 0, "La tarea ha quedado programada.", 0, "No se puede programar esa tarea ahora.", 0, "Tareas programadas", "Eliminar", "Enviar más tarde", "El ataque no ha sido programado porque no se selecionaron tropas.", "Tus tropas se enviaron a", "Tus tropas NO han podido ser enviadas", "Refuerzo", "Atacar", "Saquear", "Catapultas atacarán...", "aleatorio", "a", "o después", "segundos", "minutos", "horas", "días", "Espiar recursos y tropas ", "Espiar defensas y tropas", "fuera(away)", "El ataque no se ha programado porque no se fijo el objetivo.", "al cuadrante ns"];
		break;

	case "my": //Malay by ocellatus (Updated by PT)
		aLangTasks = ["Bina", "Tingkatkan Tahap", "Serang", "Selidik", "Latih", "Adakan", "Musnah", "Hantar Pedagang"];
		aLangStrings = ["Bina Kemudian", "Tingkatkan Kemudian", 0, "Selidik Kemudian", "Jadualkan Tugasan Ini Kemudian", "Memulakan Pembinaan ", 0, 0, " Tidak Dapat Dibina.", 0, "Tugasan Telah Dijadualkan.", 0, "Tidak Dapat Dijadualkan Sekarang.", 0, "Tugasan Telah Dijadualkan", "Buang", "Hantarkan Kemudian", "Tiada Askar Dipilih.", "Askar-askar Anda Dihantar Ke", "Askar-askar Anda Tidak Dapat Dihantar Ke", "Bantuan", "Serang", "Serbuan", "Tarbil Akan Disasarkan Ke", "Tidak Ditetapkan", "Pada", "Atau Selepas", "Saat", "Minit", "Jam", "Hari", "Tinjauan Sumber Dan Askar", "Tinjauan Askar dan Pertahanan", "Pergi", "Serangan Tidak Dapat Dijadualkan Kerana Tiada Destinasi Ditetapkan.", "Di Tapak No.", 0, 0, 0, 0, 0, 0, 0, 0, 0, " Tidak Boleh Diselidik.","Tingkatkan Kemudian", "Tinjau", "Latih Kemudian", "Askar.", "Latih", "Memulakan Latihan ", " Tidak Boleh Dilatih.","Perayaan", " Tetapi Tidak Pada Hari Ini.", "Memulakan Untuk", 0, 0, 0, 0, 0, "Adakah Anda Pasti Untuk [s1] [s2]?", "Musnah Kemudian", "Sedang Dimusnahkan", "Tidak Boleh Dimusnahkan", "Koordinat Tidak Wujud Atau Tiada Sumber Dipilih."];
		break;

	case "nl": //Dutch by Roshaoar & Kris Fripont
		aLangTasks = ["Gebouw Bouwen", "Verbeter", "Val Aan", "Ontwikkel"];
		aLangStrings = ["Bouw later", "Verbeter later", 0, "Ontwikkel later", "Plan deze taak voor later.", "Bouw is begonnen ", 0, 0, " kan niet worden gebouwd.", 0, "deze taak was gepland.", 0, "We kunnen deze taak nu niet plannen.", 0, "Geplande taken", "Verwijder", "Stuur later", "De aanval kan niet worden gepland omdat er geen troepen zijn geselecteerd.", "Jou troepen zijn gestuurd naar", "Jou troepen konden niet worden gestuurd naar", "Versterk", "Val aan", "Roof", "De katapulten zullen mikken op", "willekeurig", "op", "of na", "seconden", "minuten", "uren", "dagen", "spioneer naar voorraden en troepen", "spioneer naar troepen en verdediging", "weg", "Het aanval kan niet worden gepland omdat geen destinatie gezet was.", "op bouwplaats nummer ", "Sorteer via:", "soort ", "tijd ", "doel ", "keuzen ", "dorp "];
		break;

	//case "no": //Norwegian

	case "pt": //Portuguese by Guinness, NomadeWolf, getuliojr (updated by Pimp Trizkit)
		aLangTasks = ["Construir", "Melhorar", "Atacar", "Desenvolver", "Treinar", "Festa", "Demolir", "Enviar comerciantes"];
		aLangStrings = ["Construir Mais Tarde", "Melhorar Mais Tarde", 0, "Desenvolver Mais Tarde", "Programar esta tarefa para mais tarde.", "Começamos a construir ", 0, 0, " não pode ser construído.", 0, "A tarefa foi programada.", 0, "Não conseguimos programar esta tarefa agora.", 0, "Tarefas Programadas", "Apagar", "Enviar Mais Tarde", "Não foram selecionadas tropas.", "As suas tropas foram enviadas para", "Não foi possível enviar as suas tropas para", "Reforços", "Ataque:normal", "Ataque:assalto", "As catapultas irão mirar em", "Aleatório", "em", "ou depois","segundos", "minutos", "horas", "dias","Espiar recursos e tropas", "Espiar defesas e tropas", "Ausente", "O ataque não pode ser programado pois nenhum destino foi escolhido.", "na localização no.", "Ordenar por:", "tipo ", "hora ", "alvo ", "opções ", "aldeia ","Histórico das Tarefas", "apagar histórico", "Começamos a pesquisar ", " não pode ser pesquisado.", 0, "Espiar", "Treinar mais tarde", "tropas.", 0, "Começamos a treinar ", " não pode ser treinado."];
		break;

	case "pl": //Polish by Oskar (corrected by CamboX)
		aLangTasks = ["Buduj", "Rozbuduj", "Atak", "Zbadać", "Szkolić"];
		aLangStrings = ["Buduj później", "Rozbuduj później", 0, "Zbadaj później", "Zaplanuj zadanie na później.", "Rozpoczęto budowę ", 0, 0, " nie może byc zbudowany.", 0, "Zadanie zostało zaplanowane.", 0, "Nie mozna teraz zaplanowac tego zadania.", 0, "Zaplanowane zadania", "Usuń", "Wyślij później", "Nie wybrano żadnych jednostek.", "Twoje jednoski zostały wysłane", "Twoje jednostki nie mogą zostać wysłane", "Pomoc", "Atak", "Grabież", "Katapulty celują w", "losowy", "o", "lub za", "sekundy", "minuty", "godziny", "dni", "Obserwuj surowce i jednostki", "Obserwuj fortyfikacje i jednostki", "nieobecny", "Atak nie może zostać zaplanowany, ponieważ nie wybrano celu.", "Na pozycji nr.", "Sortowanie:", "typ ", "czas ", "cel ", "opcje ", "osada ", 0, 0, 0, 0, 0, 0, "Szkolic później"];
		break;

	case "ro": //Romanian by Atomic (edited by fulga, Pimp Trizkit, adipiciu)
		aLangTasks = ["Clădire", "Upgrade", "Atacă", "Cercetează", "Instruiește", "Petrecere", "Demolează", "Trimite negustori", "Trimite înapoi/retrage"];
		aLangStrings = ["Construiește mai târziu", "Upgrade mai târziu", "Sat necunoscut", "Cercetează ulterior", "Programează această acțiune pentru mai târziu", "Construcția a fost pornită ", "<center>STOP!</center><br>Te rugăm să aștepți, TTQ procesează comanda!<br>Step", "Celule", " cererea de construcție a fost trimisă. Cu toate acestea, se pare că nu a pornit construcția.", "s-a încercat, dar server-ul a redirecționat cererea.", "Acțiunea a fost programată", "Redirecționat", "Programarea acțiunii nu e posibilă momentan", "Eroare", "Acțiuni Programate", "Șterge", "Trimite mai târziu", "Nici o unitate nu a fost selectată.", "Trupele tale au fost trimise la:", "Trupele tale nu au putut fi trimise la:", "Intăriri", "Atac normal", "Atac rapid (Raid)", "Catapultele vor ținti", "Aleator", "la", "sau după", "secunde", "minute", "ore", "zile", "Spionează resurse și trupe", "Spionează fortificații și trupe", "plecate", "Atacul nu poate fi programat! Destinația nu a fost selectată.", "pe locul (ID) nr.", "Sortează după:", "«tip» ", "«timp» ", "«țintă» ", "«opțiuni» ", "«sate» " ,"Acțiuni derulate", "închide", "Cercetarea a fost pornită ", " Cercetarea nu este posibilă", 0, "Spionaj", "Antrenează mai târziu", "trupe.", 0, "Antrenamentul pornit "," Antrenamentul nu este posibil", " mai târziu", 0, "Am început să ", "Închide lista", "Adaugă/Editează", "Editează şi închide", "Adaugă şi închide", "Adaugă", "Ești sigur că dorești să [s1] [s2 ]?", "Demolează mai târziu", "Se demolează", "Nu s-a putut demola", "Nu au fost selectate resurse sau Coordonate invalide.", "Folosind ora locală", "Folosind ora server-ului", " was attempted but we could not find the link.", " was attempted but failed. Reason: ", "No Link", " was attempted but the building was not found.", "No Building", " was attempted but the server returned an error.", "Server:", "Confirmation Failed", "Sorry, I <b>may</b> have built the building in the wrong town.", "Misbuild:", "Sent Back/Withdrew troops.<br>Troops are going home to:", "Sent Back/Withdrew troops Failed (I think).<br>Troops were supposed to go home to: ", "Click to make this your Active Village." , "Click to see this Village Details screen.", "Timeout or TTQ Crash"];
		aLangMenuOptions = [0, "Folosește ora server-ului", "Folosește ora locală", "Setează tribul", "Istoric acțiuni", "Resetează", "\nCâte acțiuni vrei să păstrezi în istoric?\n(Introdu 0 pentru a dezactiva istoricul acțiunilor.) \nAcum: ", " Care este tribul tău?\nIntrodu 0 pentru Romani, 1 pentru Barbari, 2 pentru Daci. Sau introdu un număr negativ pentru detectarea automată a tribului (ie: -1)\nAcum: ", "Ești sigur că vrei să resetezi toate variabilele script-ului TTQ?"];
		break;

	case "ru": //Russian by Hosstor (edited by v_kir)
		aLangTasks = ["Построить", "Развить", "Атаковать", "Изучить", "Обучить"];
		aLangStrings = ["Построить позже", "Развить позже", 0, "Обучить позже", "Запланировать задачу.", "Мы начали строительство ", 0, 0, " не может быть построено.", 0, "Задача запланирована.", 0, "Мы не можем планировать этого сейчас.", "Ошибка", "Запланированные задачи", "Удалить", "Отправить позже", "Атака не может быть запланирована, поскольку войска не выбраны.", "Ваши войска были отправленны", "Ваши войска не могут быть отправлены", "Поддержка", "Атака", "Набег", "Какапульты нацелены на", "Случайно", "в", "или по истечении", "секунд", "минут", "часов", "дней", "Разведка ресурсов и войск", "Разведка войск и оборонительных сооружений", "Отсутствует", "Атака не может быть запланирована, не были заданы координаты.", "на поле номер.", "Сортивовка по:", "типу ", "времени ", "цели ", "настройкам ", "деревне ", "История задач", "очистить историю", "Мы начали исследования", " не могут быть исследованы.", 0, "Шпион", "тренировать позже", "войска.", 0 , "Мы начали тренировку", " не может тренироваться", "Отправить позже", " но не сегодня.", "Мы начали ", "Закрыть", "Добавить/Изменить Расписание задачи", "Изменить и закрыть", "Добавить и закрыть", "Добавить", "Вы уверены, что хотите [S1] [S2]?", "Разрушить позже", "Разрушено", "Не может быть разрушено"];
		break;

	case "se": //Swedish by Storgran
		aLangTasks = ["Konstruera", "Uppgradera", 0, "Förbättra", "Träna"];
		aLangStrings = ["Konstruera senare", "Uppgradera senare", 0, "Förbättra senare", "Schemalägg uppgiften tills senare.", "Byggnationen påbörjad ", 0, 0, " kan inte byggas.", 0, "Uppgiften är schemalagd.", 0, "Det går inte att schemalägga denna uppgift just nu.", 0, "Schemalägg uppgift", "Ta bort", "Skicka senare", "Attacken kunde inte bli schemalagd då inga trupper valdes.", "Dina trupper skickades till", "Dina trupper kunde inte skickas till", "Förstärkning", 0, "Plundring", "Katapulterna ska sikta på", 0, "vid", "eller efter", "sekunder", "minuter", "timmar", "dagar", "Spionera på trupper och resurser", "Spionera på trupper och försvarsbyggnader", "borta", "Attacken misslyckades, var vänlig och välj en destination.", "ingen destination.", "Sortera efter:", "typ ", "tid ", "mal ", "alternativ ", "by ", "Tidigare"];
		break;

	case "rs": //Serbian by isidora
		aLangTasks = ["Изградња зграда", "Надоградњна на", "Напад", "Побољшати", "Започни обуку"];
		aLangStrings = ["Гради после", "Побољшај после", 0, "Истражи после", "Испланирај овај задатак за после.", "Почела је градња ", 0, 0, " не може бити изграђено.", 0, "испланиран је задатак.", 0, "Не може се испланирати овај задатак сада.", 0, "Планирани задаци", "избриши", "Пошаљи после", "Трупе нису одабране.", "Ваша војска је послана на", "Ваша војска не може бити послана на", "Појачање", "Напад", "Пљачка", "Катапулти ће рушити", "случајно", "у", "или након", "секунди", "минута", "сати", "дана", "Извиђање сировина и војске", "Извиђање одбране и војске", 0, "Напад не може бити испланиран јер дестинација није одређена.", "на страници бр.", "Сортирај по:", 0, 0, 0, "опције ", "село "];
		break;

	case "si": //Slovenian by SpEkTr and matej505
		aLangTasks = ["Postavi nov objekt", "Nadgradi", "Napad na ", "Razišči", "Izuri"];
		aLangStrings = ["Postavi nov objekt kasneje", "Nadgradi kasneje", 0, "Izuri kasneje", "Nastavi to nalogo za kasneje", "Z gradnjo začnem ", 0, 0, " ne morem zgraditi.", 0, "Naloga je nastavljena.", 0, "Te naloge trenutno ni možno nastaviti.", 0, "Nastavljene naloge:", "Zbriši", "Pošlji kasneje", "Nisi označil nobenih enot.", "Tvoje enote so bile poslane,", "Tvoje enote ne morejo biti poslane,", "Okrepitev", "Napad", "Roparski pohod", "Cilj katapultov je", "naključno", "ob", "ali kasneje", "sekund", "minut", "ur", "dni", "Poizvej o trenutnih surovinah in enotah", "Poizvej o obrambnih zmogljivostih in enotah", "proč", "Napad ne more biti nastavljen, ker ni bila izbrana nobena destinacija.", "na strani št.", "Sortiraj po:", "tipu ", "času ", "tarči ", "možnosti ", "vasi "];
		break;

	case "sk": //Slovak
		aLangTasks = ["Postaviť", "Rozšíriť", "Zaútočiť na", "Vynájsť", "Trénovať"];
		aLangStrings = ["Postaviť neskôr", "Rozšíriť neskôr", 0, "Vynájsť neskôr", "Naplánujte túto akciu na neskôr.", "Začali sme stavať ", 0, 0, " sa nedá postaviť.", 0, "Úloha je naplánovaná.", 0, "Túto úlohu momentálne nie je možné naplánovať.", 0, "Naplánované úlohy", "Zmazať", "Vyslať neskôr", "Neboli vybraté žiadne jednotky.", "Jednotky mašírujú do", "Nepodarilo sa vyslať jednotky do", "Podporiť", "Zaútočiť na", "Olúpiť", "Katapulty zacieliť na", "náhodne", "o", "alebo za", "sekúnd", "minút", "hodín", "dní", "Preskúmať jednotky a suroviny", "Preskúmať jednotky a obranné objekty", "preč", "Útok nemožno naplánovať, pretože nie je známy cieľ.", "na mieste č.", "Zoradiť podľa:", "typu ", "času ", "cieľa ", "iné ", "dediny ", "História akcií", "zmazať históriu", "Začali sme vyvíjať ", " sa nedá vynájsť.", "Vylepšiť neskôr", "Vyšpehovať", "Trénovať neskôr", "jednotky.", "Vytrénovať", "Začali sme trénovať ", " sa nedá vytrénovať." ];
		break;

	case "th": //Thai
		aLangTasks = ["สร้าง", "อัพเกรด", "โจมตี", "วิจัย", "ฝึก", 0, 0,"ส่งทรัพยากร"];
		aLangStrings = ["สร้างภายหลัง", "อัพเกรดภายหลัง", 0, "วิจัยภายหลัง", "กำหนดเวลาทำงานนี้ภายหลัง", "เริ่มสร้าง ", 0, 0, " ไม่สามารถสร้างได้", 0, "กำหนดเวลาทำงานเป็นที่เรียบร้อย", 0, "ยังไม่สามารถกำหนดเวลาทำงานได้ในขณะนี้", 0, "เพิ่มงาน", "ลบ", "ส่งในภายหลัง", "ยังไม่ได้เลือกทหาร", "กองกำลังของคุณถูกส่งไปที่ ", "ไม่สามารถส่งกองกำลังของคุณไปยัง", "ส่งกำลังสนับสนุน", "โจมตี", "ปล้น", "เครื่องยิงเล็งไปยัง ", "สุ่ม", "ที่", "หรือหลังจาก", "วินาที", "นาที", "ชั่วโมง", "วัน", "สอดแนมกองกำลังและทรัพยากร", "สอดแนมกองกำลังและการป้องกัน", 0, "ไม่สามารถโจมตีได้เนื่องจากไม่มีหมู่บ้านที่ตำแหน่งนั้น", "ที่จุดสร้างหมายเลข", "เรียงลำดับตาม:", "ชนิด ", "เวลา ", "เป้าหมาย ", "ตัวเลือก ", "หมู่บ้าน ", "ประวัติงานที่ได้ทำไป", "เคลียร์ประวัติงาน", "เริ่มทำการวิจัย ", " ไม่สามารถวิจัยได้", 0, "สายลับ", "ฝึกในภายหลัง", "กำลังทหาร", 0, "เริ่มการฝึก", "ไม่สามารถฝึกได้"];
		aLangMenuOptions = ["ทราเวียน ", "ใช้เวลาของเซิร์ฟเวอร์", "ใช้เวลาของท้องถิ่น", "ตั้งค่าคู่แข่ง", "หน้าต่างงาน", 0, "\nคุณจะให้เราเก็บข้อมูลการเพิ่มงานไว้ในหน้าต่างงานเท่าไรดีล่ะ?\n(ใส่ 0 ถ้าไม่ต้องการให้แสดงหน้าต่างงาน) \nปัจจุบัน: ", "\nคู่แข่งของคุณในเซิร์ฟเวอร์คือเผ่าอะไร?\n(ใส่ 0 สำหรับโรมันส์, 1 สำหรับทูทั่นส์, 2 สำหรับกอลส์.) \nปัจจุบัน: ", 0];
		break;

	case "tr": //Turkish by sanalbaykus
		aLangTasks = ["Kurulacak bina", "Geliştirilecek Bina", "Asker gönder", "geliştir", "Yetiştir"];
		aLangStrings = ["Daha sonra KUR", "Daha Sonra GELİŞTİR", 0, "Sonra araştır", "Bu işlemi sonra planla.", "Yapım başladı. ", 0, 0, " İnşa edilemedi.", 0, "İşlem sıraya alındı.", 0, "İşlemi şu an planlayamıyoruz.", 0, "Sıradaki İşlemler", "Sil", "Daha sonra yolla", "Önce asker seçmelisiniz..", "Askerlerin gönderildiği yer ", "Askerler yollanamadı", "Destek olarak", "Normal Saldırı olarak", "Yağmala olarak", "Mancınık hedefi", "Rastgele", "Şu an", "Yada bu zaman sonra", "saniye sonra", "dakika sonra", "saat sonra", "gün sonra", "Hammadde ve askerleri izle", "Asker ve defansı izle", "uzakta","Saldırı planı için adres girmediniz.","adres", "Sıralama Kriteri:", ".Tip.", " .Süre.", ".Hedef. ", "Ayarlar", ".Köy. ","Tamamlanan işlemler", "Geçmişi sil", "Araştırılıyor.", " Araştırılamadı.", 0, "Casus", "Sonra yetiştir", "Askerler.", 0, "Yetiştirme Başladı ", " Yetiştirme Başlamadı."];
		aLangMenuOptions = [0, "Server saatini kullan", "Yerel saati kullan", "Hakını seç", "Görev geçmişi", 0, "\nGörev geçmişinde kaç adet görev görüntülensin?\n(0 yazarsanız görev geçmişi devre dışı kalır.) \nŞu anda: ", "\nBu server'daki halkınız hangisi?\n(Romalılar için 0, Cermenler için 1, Galyalılar için 2.) \nŞu anda: ", 0];
		break;

	case "tw": //Chinese (Taiwan) by syrade
		aLangTasks = ["建築", "升級", "攻擊", "研發", "訓練"];
		aLangStrings = ["預定建築", "預定升級", 0, "預定研發", "將此事項預定稍後執行.", "建築開始了 ", 0, 0, " 不能建築.", 0, "此事項已預定稍後執行.", 0, "我們暫時不能預定稍後執行.", 0, "已預定稍後執行項目", "删除", "稍後送出", "攻擊不能預定執行因為沒有選擇軍隊.","你的軍隊已送去", "你的軍隊不能送去", "支援", "攻擊", "搶奪", "投石車會瞄準", "隨機", "於", "或之後", "秒", "分", "時", "日", "偵察物資及軍隊", "偵察物資及防禦","不在", "攻擊無法預定執行,因為沒有指定目的地.", 0, "分類以:", "類型", "時間", "目標 ", "選項", "村莊", "任務紀錄", "清除紀錄", "開始研發", "無法研發", 0, "偵查", "預定訓練", "軍隊", 0, "開始訓練", "無法訓練"];
		aLangMenuOptions = [0, "使用伺服器時間", "使用電腦時間", "設定種族", "任務紀錄", 0, "\n任務紀錄最多要保持幾項？\n(0 代表取消任務紀錄) \n目前設定: ", "\n你所使用的種族是？\n(0 代表羅馬人, 1 代表 條頓人, 2 代表 高盧人) \n目前設定: ",0];
		break;

	case "ua": //Ukrainian by Rustle rs11[@]ukr.net
		aLangTasks = ["Побудувати", "Розвиток", "Атакувати", "Дослідити", "тренувати"];
		aLangStrings = ["Побудувати пізніше", "Розвити пізніше", 0, "Тренувати пізніше", "Запланувати задачу.", "Ми почали будівництво ", 0, 0, " неможливо побудувати.", 0, "Задача запланована.", 0, "Ми не можемо планувати це зараз.", "Помилка", "Заплановані задачі", "Видалити", "Відправити пізніше", "Атака не може бути запланована, оскільки війська не вибрані.", "Ваші війська були відправлені", "Ваші війська не можуть бути відправлені", "Підкріплення", "Атакувати", "Розбійницький набіг", "Какапульти націлені на", "Випадково", "в", "чи через", "секунд", "хвилин", "годин", "днів", "Розвідати ресурси та військо супротивника", "Розвідати оборонні споруди та військо супротивника", "Відсутнє", "Атака неможе бути запланована бо немає цілі.", "Поле №.", "Сортувати:", "тип ", "час ", "ціль ", "настройки ", "селище "];
		break;

 	case "vn": //Vietnamese by botayhix (Updated by PT)
		aLangTasks = ["Xây dựng công trình", "Nâng cấp", "Tấn Công", "Nghiên cứu", "Cướp Bóc"];
		aLangStrings = ["Xây Dựng Sau", "Nâng cấp sau", 0, "Nghiên cứu sau", "Kế hoạch", "Bắt đầu xây dựng ", 0, 0, " Không thể xây dựng.", 0, "Nhiệm vụ trong kế hoạch.", 0, "Chúng ta không thể thực hiện kế hoạch bây giờ.", 0, "Kế hoạch nhiệm vụ", "Xoá", "Gửi Sau", "Không có quân nào được chọn.", "Quân của bạn được gửi đến", "Quân của bạn không được gửi đi", "Tiếp viện", "Tấn Công", "Cướp bóc", "Máy bắn đá tấn công vào", "Ngẫu nhiên", "Tại", "Hoặc sau đó", "Giây", "Phút", "Giờ", "Ngày", "Do thám tài nguyên và quân đội", "Do thám quân đội và phòng thủ", "Khoảng cách", "Cuộc tấn công không thể thực hiện do đích đến không đúng.", "Vị trí.", 0, "Kiểu_ ", "thời gian ", "Mục tiêu: ", "Lựa chọn ", "Làng_ ", 0, "Xoá history", "Bắt đầu thực hiện ", " Không thể thực hiện."];
		break;

	default:
	}

function vlist_addButtonsT4 () {
	var vlist = $id("sidebarBoxVillagelist");
	if( ! vlist ) { vlist = $id("sidebarBoxVillageList") }
	var villages = $gc("listEntry village",vlist);
	for ( var vn = 0; vn < villages.length; vn++ ) {
		var linkEl = $gt("a",villages[vn])[0];
		linkVSwitch[vn] = linkEl.getAttribute('href');
		var coords = $gc("coordinatesGrid",villages[vn])[0];
		var did = getVidFromCoords(coords.innerHTML);
		var nd = parseInt(linkVSwitch[vn].match(/newdid=(\d+)/)[1]);
		villages_id[vn] = did;

		if( linkEl.hasAttribute('class') && linkEl.getAttribute('class').indexOf("active") != -1 ) {
			currentActiveVillage = nd;
		}
	}
}

var TTQ_registeredMenu = $e('UL',[['style','font-size:12px;']]);
var TTQ_registeredMenuFL = true;
function TTQ_registerMenuCommand(t,f) {
	var newLI = $ee('LI',t);
	ttqAddEventListener(newLI,'click',f,false);
	TTQ_registeredMenu.appendChild(newLI);
}
function TTQ_showMenuCommand() {
	if( TTQ_registeredMenuFL ) {
		$id('ttqPanel').appendChild(TTQ_registeredMenu);
		TTQ_registeredMenuFL = false;
	} else {
		$id('ttqPanel').removeChild(TTQ_registeredMenu);
		TTQ_registeredMenuFL = true;
	}
}

	var tX, tY, vName, tA = null;  //Recyclable Global Variables... scary, I know.. but, hey, it speeds things up, and saves memory usage.
	//Display the TTQ box
	var docDir = ['left', 'right'];
	var ltr = true;
	if (document.defaultView.getComputedStyle(document.body, null).getPropertyValue("direction") == 'rtl') { docDir = ['right', 'left']; ltr = false; }

	tA = document.createElement("div");
	tA.setAttribute("id", "ttqPanel");
	tA.setAttribute("style", "position:absolute;top:"+(parseInt(getPosition($id("background")).y)+32)+"px;"+docDir[0]+":"+(parseInt(getPosition($id("outOfGame")).x))+"px;background-color:#AAAAAA;padding:0px 3px 0px 3px;white-space:nowrap;color:black;font-family:'Lucida Sans Unicode','Comic Sans MS';font-size:10px;border-radius:6px;border:2px solid black;z-index:501;cursor:pointer;");
	tA.innerHTML = "<span id='ttqPanelSpan'><b>TTQ</b>-T4 v" + sCurrentVersion + " - <span id='ttqLoad' style='font-weight: bold' >0</span> ms - <span id='ttqReloadTimer'>0</span></span>";
	ttqAddEventListener(tA, "click", TTQ_showMenuCommand, false);
	document.body.appendChild(tA);
	// Fix language arrays, replace zeros with english
	if ( aLangBuildings == 0 ) aLangBuildings = nLangBuildings;
	if ( aLangTasks == 0 ) aLangTasks = nLangTasks;
	else for ( tX = 0 ; tX < nLangTasks.length; ++tX ) if ( typeof(aLangTasks[tX]) == "undefined" || !aLangTasks[tX] ) aLangTasks[tX] = nLangTasks[tX];
	if ( aLangStrings == 0 ) aLangStrings = nLangStrings;
	else for ( tX = 0, tY = nLangStrings.length; tX < tY ; ++tX ) if ( typeof(aLangStrings[tX]) == "undefined" || !aLangStrings[tX] ) aLangStrings[tX] = nLangStrings[tX];
	if ( aLangMenuOptions == 0 ) aLangMenuOptions = nLangMenuOptions;
	else for ( tX = 0 ; tX < nLangMenuOptions.length; ++tX ) if ( typeof(aLangMenuOptions[tX]) == "undefined" || !aLangMenuOptions[tX] ) aLangMenuOptions[tX] = nLangMenuOptions[tX];
	var myID = myPlayerID; // Save off into Recycled Variable for later use
	//Get Player ID  (uid)
	//myPlayerID = myID.src.match(/uid=(\d+)/)[1];
	//Get MapSize
	var MapSize = detectMapSize();
	var mapRadius = (MapSize - 1) / 2;
	vlist_addButtonsT4();
	var myPlaceNames = new Object();
	// Put Coords next to village names and make them clickable to view that village's details screen, and move the villages names over to the left some, and save them all for getVillageName() and getVillageNameXY()
	var vlist = $id("sidebarBoxVillagelist");
	if( ! vlist ) { vlist = $id("sidebarBoxVillageList") }
	var iMyRace = $gt('li',vlist); //Recycled variable
	if ( iMyRace.length ==0 ) {
		iMyRace = $gc('listEntry village',vlist);
	}
	var l8, m8, n8, nFL=true;  //Sorry for the names, i was just being funny.
	for ( n8 = 0, m8 = 0, l8 = iMyRace.length ; m8 < l8 ; ++m8 ) {
	//Determine the coordinates of the active building and create a SPAN with clickable links to the village.
		tA = iMyRace[m8];
		tA = $gt("a",tA)[0];
		if ( nFL ) {
			iSiteId = tA.href.split("&id=");
			if ( iSiteId.length > 1 ) iSiteId = parseInt(iSiteId[1]);
			nFL = false;
		}
		var xy = coordZToXY(villages_id[n8]);
		tX = xy[0];
		tY = xy[1];
		vName = $gc('name',tA)[0].textContent;
		vName = '<span class ="ttq_village_name" onclick="window.location = \''+tA.href+'\';return false;" title="'+aLangStrings[80]+'">' + vName + '</span>&nbsp;<span class ="ttq_village_name ttq_village_coords" title="'+aLangStrings[81]+'" onclick="window.location = \'' + window.location.origin + '/position_details.php?x='+tX+'&y='+tY+'\';return false;" >(' + tX + '|' + tY + ')</span>';
		myPlaceNames[parseInt(tA.href.split("=")[1])] = vName;  // village id
		myPlaceNames[tX+" "+tY] = vName;
		n8++;
	}
	// Grab Building site id while we are here... if its there.
	if ( isNaN(iSiteId) || iSiteId < 0 ) iSiteId = getSiteId();
	//Grab any other place (village) names I can see here and save them
	var otherPlaceNames = ttqTrimData(getVariable("OTHER_PLACE_NAMES", ""),MAX_PLACE_NAMES,false,"↨⌂₧☻");
	if ( window.location.href.indexOf("position_details") != -1 ) {
		tA = $gc("coordText");
		tX = $gc("coordinateX");
		tY = $gc("coordinateY");
		if ( tA.length > 0 && tX.length > 0 && tY.length > 0 ) {
			tX = parseInt(tX[0].innerHTML.onlyText().replace("(",""));
			tY = parseInt(tY[0].innerHTML.onlyText().replace(")",""));
			if ( typeof ( myPlaceNames[tX+" "+tY] ) == "undefined" ) {
				for ( m8 = 0, l8 = otherPlaceNames.length ; m8 < l8 ; ++m8 ) {
					vName = otherPlaceNames[m8].split("|");
					if ( parseInt(vName[0]) == tX && parseInt(vName[1]) == tY ) {
						otherPlaceNames.splice(m8,1);
						break;
					}
				}
				otherPlaceNames.push(tX+"|"+tY+"|"+tA[0].innerHTML.onlyText());
			}
		}
	}
	if ( otherPlaceNames.length > 0 ) setVariable("OTHER_PLACE_NAMES", otherPlaceNames.join("↨⌂₧☻"));
	var tOpts = getAllOptions();
	var isMinimized = tOpts["LIST_MINIMIZED"] == "true" ? true : false;
	var isHistoryMinimized = tOpts["LIST_HISTORY_MINIMIZED"] == "true" ? true : false;
	// GetRace
	detectTribe();
	//Set History length
	var iHistoryLength = parseInt(tOpts["HISTORY_LENGTH"]);
	if (isNaN (iHistoryLength) || iHistoryLength < 0 ) iHistoryLength = 50;
	// Set Tab ID
	myID = Math.round(Math.random()*1000000000);
	setVariable("TTQ_TABID", myID);
	// Grab Resource Names
	var stockBar = $id('send_select');
	if (stockBar) {
		tA = $gc("nam",stockBar);
		if (tA.length == 4) {
			for (var i=0; i<4; i++) {
				aLangResources[i] = tA[i].textContent.onlyText().trim();
			}
		}
	}
	// Grab Troop Names
	var aLangTroops = nLangTroops[iMyRace];
	tA = getVariable("TROOP_NAMES", "");
	if ( tA == "" ) getTroopNames();
	else {
		aLangTroops = tA.split("|");
		isTroopsLoaded = true;
	}
	// Images
    var sCloseBtn = "data:image/png;base64,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";
    var sDeleteBtn = "data:image/gif;base64,R0lGODlhEAAMAIABAP8AAP///yH5BAEKAAEALAAAAAAQAAwAAAIfTICmu5j8lAONMuOwvTLzun3HJI5WBKGotrYrlpZBAQA7";
    var sTitleBarLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAASCAAAAAGjf1fmAAAAAnRSTlMA/1uRIrUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAARJSURBVHicfVNbUFpXFN1cDgqoF0FBQAUEEfGF1QSxRJNYk9pEzaSpbZpxknamM23/O/npd2c6nU6+k49+2E6jM7GdamyStoltjRot8RF8IAEUEBV5ySOAF3n0gpqmr6yZe84++669zzr77INSNhDDeE3+UjUKioc9JQJD82MdwqEboEgGVwClNoUAe4gCyDjYGinY6oIhpPgU0hg9h1LgnupK2ztsctDx7VpAu3Q9rY+7dBaTb00Sl456bDoRyRttS1FISmS1mP2wxSIDQKBrA4qPA+ClsxdbYgLyL/JWXuPn8+z1M439QZ+hx7AQLkK0VN1TFRnR+DXx3ceuiLsgIScFtrdDNRlxmfxKvvwkHZsCWJUCjON1cIBnuQBzFCk+2wALO80WmixNAzAojTxfo90LmJ1v1oKTbxPf5RfjA28nFur1nnhpgL5HRYs13HuakdbAGj3gzbcyowx9SP5Ft3+8QoKNdIJiivPVxY2HvagGCjugF6DjcM/TAFf3Le6tHuNRZi3wqjLaiLmUCnaKD3lg3KgrJPUa2HwImMWFsK8tka0BA1HwnGVVKAgdAyxKgLts7tYhjWITh2RZpB3LytBcbNajExnre3XJo2bYp4VpeOKmpCwvhuNLORwcnOp1a7MpawNkAxfdC5xQMsCJhdDKZvx0lOePBSNBD3tF43FT+aWDFG7ebBNZYS53DCYx7WQFqnBp4dr5Fa/dXy80BbeyS+jTzPj2j6pYzFMLcNvnEK5N5WYjUysMdVa5t5tWHZZKvtKZTeOGGpwdcYokGWHqO0d2CxDRwEcKgHMAxwEqMlr5ANKDE2ODZ5RPuuDgCP+Py2t9Hx6Y6fKSCLro1IDPTLBc4hx17r8CHFQa4XOb85OuSkYLwARHgZFe3xM7IWhcreIc0vb3fOYkhQmgmHwd/wVfHgugOFVUiqdXexNaGjlNeltzeql3jNV58LdkhD88tHecO8qtPXT/rmb8lSsUcLjR2cTwyUyuyOP0PW4Ov8taKqeaq6I8eCEZ4ZgXNpS8AvBgbWxeANMXZqto1tZxbLmnT64RQmh1WVtWRjZRv3rRu6ciKq/X/9RONc18BFAdCJSPm5IOiTEVVm0WrwHSy2T2Iy57M0yY8PdvntC/8/OZxUjbYNfEpfuvG7H4agWzRqRnyGEgqDu2q7Aqb2cV5lIjf7yVVsLaHk3VGeFGS6jcTlxv0iBGEtS6iJz4Bgm7f7swJ+5/b9nZeuPKWPkPry1WMimQlNt+TWo3vn0VOzLnMW9bZf6oEnZF2enqzIsx0VPpg89vSTdEo59ZcSQP2OLCoIfywbQQUpYoOho9dj9XM0eZOu/gqciO2QqDyD+jvOpzrSSkrHCjQUu+Dk7pnXoswWtKoPUce4WeH8QcVZYahIDF2q9eE8BJcqpON54w7eBm3IKD4nLefE4jIZH8sqBZh8gb2Iu3/rJ2fClOnTLign/4/gQqw6wmWh5IVAAAAABJRU5ErkJggg%3D%3D";
    var sTimerFormBackground = "data:image/png;base64,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%3D";

    //Styles
    var cssStyle = "";
cssStyle += "#ttq_tasklist, #ttq_history {position:absolute; background-color: #ffffff; max-width: 800px; color:#000000; border:1px solid #C0C0C0;padding:5px 0 2px 0; z-index:501; border-radius:10px;}";
cssStyle += "#ttq_flush_history {text-align:center;color:#71D000;cursor:pointer;font-weight:bold;font-size:14px;font-family:'Lucida Sans Unicode','Arial';} #ttq_flush_history:hover {color:#00BF00}";
cssStyle += ".ttq_tasklist_row {padding:1px 10px;}";
cssStyle += ".ttq_history_row {padding:1px 5px 1px 10px;border-style:dashed;border-color:grey;border-width:0px 0px 1px 0px;}";
cssStyle += ".ttq_village_name {font-weight:bold;cursor:pointer;font-size:11px;font-family:'Lucida Sans Unicode','Arial'} .ttq_village_name:hover {color:#00BF00}";
cssStyle += ".ttq_village_coords { } .ttq_village_coords:hover {color:#00BF00}";
cssStyle += ".ttq_draghandle { font-weight:bold; color:black; border-bottom:1px solid #C0C0C0; height:20px; padding-left:11px;}";
cssStyle += ".ttq_time_village_wrapper {font-weight:bold; font-size:80%;} .ttq_time_village_wrapper:hover {color:#00BF00}";
cssStyle += ".ttq_close_btn {float:"+docDir[1]+"; margin-"+docDir[1]+":-10px; cursor:pointer}";
cssStyle +=	"#timerForm {padding:0px 20px 10px 20px; }";
cssStyle += "#timerform_wrapper {position:absolute; width:550px !important; margin:0; background:url(" + sTimerFormBackground + ") no-repeat center center; background-color: #FFFFFF; color: black; border: 1px #59D72F solid; z-index: 502; border-radius:8px;}";
cssStyle += "#timerform_wrapper p { margin:5px; }";
cssStyle +=	"#ttq_message {position:absolute; z-index:503; border:1px solid #71D000; padding:10px 20px; color:black; width:335px; border-radius:10px;}";
cssStyle += ".handle {cursor: move;}";
cssStyle += "#ttq_tasklist_sortlinks {border-bottom:1px solid #C0C0C0; margin-bottom: 5px; padding:0;}";
cssStyle += ".ttq_tasklist_sortlinks_header {padding-"+docDir[0]+": 10px; background-color: #e0e0e0;}";
cssStyle += ".ttq_tasklist_sortlinks_child {border-left: 1px solid #C0C0C0; text-align: center; background-color: #e0e0e0; cursor: pointer;}";
cssStyle += ".ttq_tasklist_sortlinks_child:hover {background-color: #efefef;}";
cssStyle += ".ttq_tasklist_sortlinks_child_active {border-left: 1px solid #C0C0C0; text-align: center; background-color: #ffffff; cursor: pointer;}";
cssStyle += ".ttq_sort_header {font-style:italic;font-weight:bold;color:red;}";
cssStyle += ".ttq_research_later {display:block;}";
cssStyle += "#sortLinkWrapper{border-bottom:1px dashed #000000;}";

TTQ_addStyle(cssStyle);
}
// *** End of Initialization and Globals ***

// *** Begin TTQ Core Functions ***
/**************************************************************************
 * Performs some initial checkings on conditions that have to be met to run the script
 * @return true if initialization was successfull, false otherwise
***************************************************************************/

function checkSetTasks() {
	_log(1, "CheckSetTasks> Begin. (tab ID = " + myID + ")");
	var aThisTask, aTasks = getVariable("TTQ_TASKS");
	var oDate = Math.floor(((new Date()).getTime())/1000); // local time
	ttqUpdatePanel(aTasks, oDate);

	if(bLocked) {
		_log(1, "CheckSetTasks> The TTQ_TASKS variables is locked. We are not able to write it. Canceling checkSetTasks...");
		return false;
	}
	bLocked = true;
	var data = getVariable("TTQ_TABID",0);
	if ( data == 0 ) {
		_log(1,"CheckSetTasks> TabID is zero. Taking control. Checking set tasks...");
		setVariable("TTQ_TABID", myID);
	} else if ( data == myID ) {
		_log(1,"CheckSetTasks> TabID is ME. Checking set tasks...");
	} else {
		_log(1,"CheckSetTasks> TabID is someone else. Canceling check set tasks. End.");
		bLocked = false;
		return false;
	}

	if ( ttqBusyTask != 0 ) {
		printMsg(getVillageName(parseInt(ttqBusyTask[4]))+ "<br>" + getTaskDetails(ttqBusyTask) + " " + aLangStrings[50] + " " + aLangStrings[69] + " ("+aLangStrings[82] +")", true); // Your task may have not been built, it appeared to timeout or crash.
		addToHistory(ttqBusyTask, false, aLangStrings[82]);
		ttqBusyTask = 0;
	}
//-- было закоментировано { Должно останавливать таймер, если нет активных задач
	if(aTasks == '') {  // no tasks are set
		_log(2, "CheckSetTasks> No tasks are set. ");
		// stop checking, it would be pointless. Checking will be restarted when new tasks are set.
		if(oIntervalReference) {
			_log(1, "CheckSetTasks> No Tasks are set. Clearing Interval.");
			window.clearInterval(oIntervalReference);
			oIntervalReference = null;
			setVariable("TTQ_TABID", 0);
			$id("ttqPanel").style.backgroundColor ="#C0C0FF";
			var ttqTimer = $id("ttqReloadTimer");
			if ( ttqTimer ) ttqTimer.innerHTML = '';
		}
		_log(1,"CheckSetTasks> End.");
		bLocked = false;
		return false;
	}
//-- }
	if ( aTasks != "" ) {
		aTasks = aTasks.split("|");
		for( tX = 0, tY = aTasks.length ; tX < tY ; ++tX) {
			aThisTask = aTasks[tX].split(",");

		// The stored time (Unix GMT time) should be compared against the GMT time, not local!
			if(aThisTask[1] <= oDate) {
				_log(1, "CheckSetTasks> Triggering task: " + aTasks[tX]);
				aTasks.splice(tX, 1);  //delete this task
				refreshTaskList(aTasks);
				aTasks = aTasks.join("|");
				setVariable("TTQ_TASKS", aTasks);
				bLocked = false;
				triggerTask(aThisTask);
				return true;
			}
		}
	}
	bLocked = false;

	tA = getOption("RELOAD_AT", 0, "integer");
	if ( tA > 0 ) {
		if( tA <= oDate ) {
			window.location.reload();
			return;
		}
	} else setOption('RELOAD_AT', Math.floor((oDate*1000 + Math.round(ttqRandomNumber()*60000))/1000));

	_log(1, "CheckSetTasks> Some task is set, but it is not the time yet. End CheckSetTasks.");
}

function refreshTaskList(aTasks) {
	_log(3,"Begin 	()");
	// Remove old task list
	var oOldTaskList = $id("ttq_tasklist");
	if(oOldTaskList) {document.body.removeChild(oOldTaskList)};

	//if there are no tasks set, return
	if(!aTasks || aTasks.length < 1) return;
	var sTime = "";
	//Create new tasklist
	var oTaskList = document.createElement('div');
	oTaskList.id = "ttq_tasklist";
	oTaskList.innerHTML = "<div id='ttq_draghandle' class='handle ttq_draghandle' onmousedown='return false;'>"+aLangStrings[14]+"<img src='"+sTitleBarLogo+"' style='float: right; margin: 1px 5px;' onmousedown='return false;'></div>";
	ttqAddEventListener(oTaskList, "dblclick", doMinimize, false);
	//Sort links
	var currentSort = getOption("TASKLIST_SORT", 1, "integer");
	var sortLinkWrapper = document.createElement("div");

	sortLinkWrapper.id = "ttq_tasklist_sortlinks";

	// Use table
	var sortLinkTable = document.createElement("table");
	sortLinkTable.style.margin = "0";
	sortLinkTable.style.border = "0";
	sortLinkTable.style.borderCollapse = "collapse";
	sortLinkTable.style.backgroundColor = "#ffffff";
	var sortLinkTableTr = document.createElement("tr");
	var sortLinkChild = document.createElement("td");
	sortLinkChild.className = "ttq_tasklist_sortlinks_header";
	sortLinkChild.innerHTML += "<span class='ttq_sort_header'>" +aLangStrings[36]+ "</span>";
	sortLinkTableTr.appendChild(sortLinkChild);
	sortLinkChild = null;

	var sortKeys = [37, 38, 39, 40, 41];  //order is important
	sortKeys.forEach(function(el) {
			var sortLinkChild = document.createElement("td");
			sortLinkChild.className = (currentSort == el) ? "ttq_tasklist_sortlinks_child_active" : "ttq_tasklist_sortlinks_child";
			sortLinkChild.textContent = aLangStrings[el];
			ttqAddEventListener(sortLinkChild, "click", function(ev) {
				orderList(el, "ttq_task_row");
				setOption("TASKLIST_SORT", el);
				var siblings = ev.target.parentNode.childNodes;
				for(var j = 0; j < siblings.length; ++j)
					if (siblings[j].className != "ttq_tasklist_sortlinks_header" && siblings[j].nodeName == "TD") siblings[j].className = "ttq_tasklist_sortlinks_child";
				ev.target.className = "ttq_tasklist_sortlinks_child_active";
			}, false);
			sortLinkTableTr.appendChild(sortLinkChild);
			sortLinkChild = null;
		}
	);

	sortLinkTable.appendChild(sortLinkTableTr);
	sortLinkWrapper.appendChild(sortLinkTable);
	oTaskList.appendChild(sortLinkWrapper);
	//position the list
	var tM = getOption("LIST_POSITION", "70px_687px").split("_");
	oTaskList.style.top = tM[0];
	oTaskList.style.left = tM[1];
	tM = getOption("LIST_MINIMIZED", false, "boolean");
	if ( tM ) {
		oTaskList.style.height = "16px";
		oTaskList.style.width = "150px";
		oTaskList.style.overflow = "hidden";
	}
	document.body.appendChild(oTaskList);

	makeDraggable($id('ttq_draghandle'));

	//get the server time offset once
	if(bUseServerTime) {
		var iServerTimeOffset = getServerTimeOffset();
		if ( iServerTimeOffset == -999 ) iServerTimeOffset = 0;
	}
	var timeOffsetString = '';
	for(var i = 0; i < aTasks.length; ++i) {
		var aThisTask = aTasks[i].split(",");
		//format the task time properly
		if(bUseServerTime) {
			//create timestamp for the tasktime offset to server time
			var iTaskServerTimestamp = ( parseInt(aThisTask[1]) + (iServerTimeOffset * 3600) ) * 1000;
			//create Date obj with this timestamp
			var oDate = new Date(iTaskServerTimestamp);
			//display the date without any further offsets
			//[TODO] custom date format
			var sTime = oDate.toGMTString();
			sTime = sTime.substring(0, sTime.length - 4);
			//[TODO] Isolate and internationalize descriptions
			sTime = "<span style='cursor:pointer;' id='ttq_tasktime_" +i+ "' title='This is the server time. Click to add/edit new task.' ttq_taskid='" +i+ "' >" + sTime + "</span>";
			oDate = oDate.toString().split(" GMT");
			if ( timeOffsetString == '' ) timeOffsetString = "(" + aLangStrings[67] + ": gmt "+iServerTimeOffset+")";
		} else {  //local time
			var oDate = new Date( parseInt(aThisTask[1]) * 1000 );
			oDate = oDate.toString().split(" GMT");
			var sTime = "<span style='cursor:pointer;float:left;margin:0px 2px 0px 0px;' id='ttq_tasktime_" +i+ "' title='This is your local time. Click to add/edit new task.' ttq_taskid='" +i+ "' >" + oDate[0] + "</span>";
			if ( timeOffsetString == '' ) timeOffsetString = "(" + aLangStrings[66] + ": gmt "+oDate[1].split(" ")[0]+")";
		}

		var oDeleteLink = document.createElement('a');
		var oDeleteImg = document.createElement('img');
		oDeleteImg.src = sDeleteBtn;
		oDeleteImg.alt = 'X';
		oDeleteImg.style.verticalAlign = 'middle';
		oDeleteImg.style.display = 'inline-block';
		oDeleteLink.appendChild(oDeleteImg);
		oDeleteLink.title = aLangStrings[15];
		oDeleteLink.setAttribute("itaskindex", i);
		oDeleteLink.setAttribute("istask", "true");
		ttqAddEventListener(oDeleteLink, 'click', deleteTask, false);

		var oTaskRow = document.createElement("div");
		oTaskRow.id = "ttq_task_row_" +i;
		oTaskRow.className = "ttq_tasklist_row";
		oTaskRow.setAttribute("tasktype", aThisTask[0]);
		oTaskRow.setAttribute("timestamp", aThisTask[1]);
		oTaskRow.setAttribute("tasktarget", aThisTask[2]);
		oTaskRow.setAttribute("taskoptions", aThisTask[3]);
		oTaskRow.setAttribute("villagedid", aThisTask[5]);

		var sTaskSubject = "";
		var sTask = "";
		var sTaskMoreInfo = "";
		switch(aThisTask[0]) {
			case "0":  //build
			case "1":  //upgrade
				sTaskSubject = "- "+aThisTask[3].split("_")[1];
				sTask = aLangTasks[aThisTask[0]];
				sTaskMoreInfo = aLangStrings[35] + " " +aThisTask[2];
				break;
			case "2":  //attack
				sTaskSubject = '>> <span id="ttq_placename_' +aThisTask[2]+ '">' +getVillageNameZ(aThisTask[2])+ '</span>';
				var aTroops = aThisTask[3].split("_");
				var iIndex = parseInt(aTroops[0]);
				var langStringNo = iIndex == 5 ? 20 : iIndex == 3 ? 21 : 22;
				if ( (iIndex == 3 || iIndex == 4) && onlySpies(aTroops) ) {
					sTask = aLangStrings[47];
					sTaskSubject = " "+aTroops[14]+" "+sTaskSubject;
				} else { sTask = aLangStrings[langStringNo]; }
				sTaskMoreInfo = getTroopsInfo(aTroops);
				break;
			case "3":  //research
				var aOptions = aThisTask[3].split("_");
				sTaskSubject = "- "+aOptions[2];
				sTask = aLangTasks[aOptions[1]];
				sTaskMoreInfo = sTask + " " + sTaskSubject;
				break;
			case "4":  //train
				var aTroops = aThisTask[3].split("_");
				sTaskSubject = getTroopsInfo(aTroops);
				sTaskMoreInfo = sTaskSubject;
				sTask = aLangTasks[4];
				break;
			case "5":  //party
				sTaskSubject = aLangStrings[53];
				sTask = aLangTasks[5];
				sTaskMoreInfo = "Drink a Beer! This one is for the BrownStaine!"
				break;
			case "6":  //Demolish
				var tO = aThisTask[3].split("_");
				sTaskSubject = "A Building";
				var tT = parseInt(aThisTask[2]);
				for ( var j = 0,k = tO.length ; j < k ; ++j ) {
					if ( parseInt(tO[j].replace(/\[/g,"")) == tT ) {
						sTaskSubject = "- "+tO[j];
						break;
					}
				}
				sTask = aLangTasks[6];
				//sTaskSubject = aThisTask[3];
				sTaskMoreInfo = aLangStrings[35] + " " +aThisTask[2];
				break;
			case "7": //Send Merchants
				sTask = aLangTasks[7];
				tM = aThisTask[3].split("_");
				sTaskSubject = ">> " + getVillageNameXY(tM[0],tM[1]);
				sTaskMoreInfo = getMerchantInfo(tM);
				break;
			case "8": //Send Back/Withdraw
				sTask = aLangTasks[8];
				sTaskSubject = ">> " + aThisTask[2];
				sTaskMoreInfo = getTroopsInfo(aThisTask[3].split("_"));
				break;
			case "9": // Send troops through Gold-Club
				sTask = getOption('FARMLIST','');
				sTaskSubject = " >> " + aThisTask[2] + " ";
				break;
			default:
				break;
		}

		oTaskRow.innerHTML = "<span class='ttq_time_village_wrapper' >" +sTime + "</span><span style='float:"+docDir[0]+"'>&nbsp;&mdash;&nbsp;</span>"+ getVillageName(aThisTask[5])+" : <span title='" +sTaskMoreInfo+ "' style='cursor:help;' >" +sTask+ " " +sTaskSubject+ " </span></span>";

		oTaskRow.appendChild(oDeleteLink);
		oTaskList.appendChild(oTaskRow);
		//add listener for editing times in the task list
		var oTaskTimeSpan = $id("ttq_tasktime_"+i);
		ttqAddEventListener(oTaskTimeSpan, "click", editTime, false);
		oDeleteLink = null;
		oTaskRow = null;
		oDate = null;
	}
	$id('ttq_draghandle').innerHTML += " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <font size=1>" + timeOffsetString + "</font>";
	orderList(currentSort, "ttq_task_row");
	_log(3, "End refreshTaskList()");
}

/**************************************************************************
 * @param iORderBy: 0 - tasktype, 1 - timestamp, 2 - target, 3 - options, 4 - villagedid
 ***************************************************************************/
function orderList (iOrderBy, sRowId) {
	var rows = xpath('//div[contains(@id, "' +sRowId+ '")]');
	if(rows.snapshotLength > 0) {
		switch(iOrderBy) {
			case 37:
				var sortKey = "tasktype";
				break;
			case 39:
				var sortKey = "target";
				break;
			case 40:
				var sortKey = "options";
				break;
			case 41:
				var sortKey = "villagedid";
				break;
			case 38:
			default:
				var sortKey = "timestamp";
				break;
		}
		var keyValue = "";
		var aRows = [];
		for(var i = 0; i < rows.snapshotLength; ++i) {
			keyValue = rows.snapshotItem(i).getAttribute(sortKey);
			aRows.push([keyValue, rows.snapshotItem(i)]);
		}
		aRows.sort(sortArray);
		switch(sRowId) {
			case "ttq_history_row":
				aRows.forEach(processSortedHistory);
				break;
			case "ttq_task_row":
			default:
				aRows.forEach(processSortedTaskList);
				break;
		}
		return false;
	} else return;
}

function editTime(ev) {
	var oTaskRow = ev.target.parentNode.parentNode;
	var type = parseInt(oTaskRow.getAttribute("tasktype"));
	var timestamp = oTaskRow.getAttribute("timestamp");
	var target = oTaskRow.getAttribute("tasktarget");
	var options = oTaskRow.getAttribute("taskoptions").split("_");
	var villagedid = oTaskRow.getAttribute("villagedid");  //(should be fixed)not supported yet. The new task will have did of currently active village.
	// Try to get the task index and pass to the form
	if (oTaskRow.getElementsByTagName("a")[0])
    var taskindex = oTaskRow.getElementsByTagName("a")[0].getAttribute("itaskindex");
	displayTimerForm(type, target, options, timestamp, taskindex, villagedid);
}

function deleteTask(e) {
	_log(3,"Begin deleteTask()");
	var iTaskIndex = e.target.parentNode;
	var isTask = iTaskIndex.getAttribute("istask") == "true" ? true : false;
	iTaskIndex = iTaskIndex.getAttribute("itaskindex");
	_log(2, "Deleting task "+iTaskIndex);
	if(bLocked) {
		_log(3, "The TTQ_TASKS variables is locked. We are not able to write it.");
		printMsg("Delete Failed! TTQ_TASKS is locked!", true);
		return false;
	}
	bLocked = true;
	if ( isTask ) var data = getVariable("TTQ_TASKS");
	else var data = getVariable("TTQ_HISTORY");
	if(data == '') {
		_log(2, "No tasks are set. ");
		bLocked = false;
		return false;  // no tasks are set
	}
	var aTasks = data.split("|");
	aTasks.splice(iTaskIndex, 1);  //delete this task
	data = aTasks.join("|");
	if ( isTask ) {
		setVariable("TTQ_TASKS", data);
		ttqUpdatePanel(data);
	} else setVariable("TTQ_HISTORY", data);
	bLocked = false;
	if ( isTask ) refreshTaskList(aTasks);
	else refreshHistory(aTasks);
	return false;  // we return false to override default action on the link
	_log(3, "End deleteTask()");
}

/**************************************************************************
 * Performs the supplied task. Prints the report.
 * @param aTask: [task, when, target, options]
 ***************************************************************************/
function triggerTask(aTask) {
	_log(3,"Begin triggerTask("+aTask+")");
	ttqBusyTask = aTask;
	switch(aTask[0]) {
		case "0": //build new building
		case "1": //upgrade building
			upgradebuild(aTask);
			break;
		case "2": //send attack
			attack(aTask);
			break;
		case "3": //research
			research(aTask);
			break;
		case "4": //train troops
			train(aTask);
			break;
		case "5": //throw party
			party(aTask);
			break;
		case "6": //demolish building[ALPHA]
			demolish(aTask);
			break;
		case "7": //send merchants
			merchant(aTask);
			break;
		case "8": //send Back/Withdraw
			sendbackwithdraw(aTask);
			break;
		case "9": //send troops through Gold-Club
			sendGoldClub(aTask);
			break;
		default: //do nothing
			_log(1, "Can't trigger an unknown task.");
			break;
	}
	_log(3, "End triggerTask("+aTask+")");
}
// *** End TTQ Core Functions ***

// *** Begin History Functions ***
/**************************************************************************
 *  Adds task to the log DIV.
 *  @param bSuccess: true if the task was successfully performed.
 ***************************************************************************/
function addToHistory(aTask, bSuccess, tMsg) {
	_log(3, "Begin Adding to history...");
	if(iHistoryLength < 1) { return; }
	var oldValue = ttqTrimData(getVariable("TTQ_HISTORY", ""), iHistoryLength-1, true);
	if ( oldValue != "" ) oldValue += "|";
	var newValue = aTask[0] + ',' + aTask[1] + ',' + aTask[2] + ',' + aTask[3] + ',' + aTask[4];
	if(aTask[5]) newValue += ',' + aTask[5];
	else newValue += ',' + 'null';
	newValue += ',' + bSuccess;
	if(!bSuccess && tMsg) newValue += ',' + tMsg;
	else newValue += ',' + 'null';
	newValue = oldValue + '' + newValue;
	_log(2, "Writing var TTQ_HISTORY: "+newValue);
	if(!setVariable("TTQ_HISTORY", newValue)) _log(1, "Failed logging to history.")
	aTasks = newValue.split("|");
	refreshHistory(aTasks);
	ttqUpdatePanel();
	ttqBusyTask = 0;
	return;
}

function flushHistory() {
	setVariable("TTQ_HISTORY", "");
	refreshHistory();
}

function refreshHistory(aTasks) {
	_log(3, "Begin refreshHistory()");
	// Remove old history
	var oOldHistory = $id("ttq_history");
	if(oOldHistory) document.body.removeChild(oOldHistory);

	//if there are no tasks in the history, return
	if(!aTasks || aTasks.length < 1) return;
	var sTime = "";

	//Create new tasklist
	var oHistory = document.createElement('div');
	oHistory.id = "ttq_history";
	oHistory.innerHTML = "<div id='ttq_history_draghandle' class='handle ttq_draghandle' onmousedown='return false;'>"+aLangStrings[42]+"<img src='"+sTitleBarLogo+"' style='float: right; margin: 1px 5px;' onmousedown='return false;'></div>";
	ttqAddEventListener(oHistory, "dblclick", doMinimize, false);

	//position the list
	var listCoords = getOption("HISTORY_POSITION", "200px_687px");
	listCoords = listCoords.split("_");
	oHistory.style.top = listCoords[0];
	oHistory.style.left = listCoords[1];

	if ( getOption("LIST_HISTORY_MINIMIZED", false, "boolean") ) {
		oHistory.style.height = "16px";
		oHistory.style.width = "150px";
		oHistory.style.overflow = "hidden";
	}

	document.body.appendChild(oHistory);

	makeDraggable($id('ttq_history_draghandle'));

	for(var i = 0; i < aTasks.length; ++i) {
		var aThisTask = aTasks[i].split(",");
		oHistory.appendChild( makeHistoryRow(aThisTask, i/*, iServerTimeOffset*/) );
		var oTaskTimeSpan = $id("ttq_history_tasktime_" +i);
		if(oTaskTimeSpan) { ttqAddEventListener(oTaskTimeSpan, "click", editTime, false); }
	}

	orderList(38, "ttq_history_row");

	//flush link
	var oFlushLink = document.createElement('div');
	oFlushLink.id = 'ttq_flush_history';
	oFlushLink.innerHTML = "&ndash; "+aLangStrings[43]+" &ndash;";
//	oFlushLink.href = '#';
	oHistory.appendChild(oFlushLink);
	ttqAddEventListener(oFlushLink, 'click', flushHistory, false);
}

function makeHistoryRow(aTask, index/*, iServerTimeOffset*/) {
		_log(3,"Begin makeHistoryRow()");
		var oDate = new Date( parseInt(aTask[1]) * 1000 );
		var sTime = "<span style=' cursor:pointer;' id='ttq_history_tasktime_" +index+ "' title='This is your local time. Click to add new task.' ttq_taskid='" +index+ "' >" + oDate.toLocaleString() + "</span>";

		var oHistoryRow = document.createElement("div");
		oHistoryRow.id = "ttq_history_row_" +index;
		oHistoryRow.className = "ttq_history_row";
		oHistoryRow.setAttribute("tasktype", aTask[0]);
		oHistoryRow.setAttribute("timestamp", aTask[1]);
		oHistoryRow.setAttribute("tasktarget", aTask[2]);
		oHistoryRow.setAttribute("taskoptions", aTask[3]);
		oHistoryRow.setAttribute("villagedid", aTask[5]);
		oHistoryRow.setAttribute("taskmessage", aTask[7]);
		var sTaskSubject = "";
		var sTask = "";
		var sTaskMoreInfo = "";
		var isError = aTask[6] == "true" ? false : true;

		switch(aTask[0]) {
			case "0":  //build
			case "1":  //upgrade
				sTaskSubject = "- "+aTask[3].split("_")[1];
				sTask = aLangTasks[aTask[0]];
				sTaskMoreInfo = aLangStrings[35] + " " +aTask[2];
				break;
			case "2":  //attack
				sTaskSubject = ' >> <span id="ttq_placename_history_' +aTask[2]+ '">' +getVillageNameZ(aTask[2])+ '</span>';
				var aTroops = aTask[3].split("_");
				var iIndex = parseInt(aTroops[0]);
				var langStringNo = iIndex == 5 ? 20 : iIndex == 3 ? 21 : 22;
				if((iIndex == 3 || iIndex == 4) && onlySpies(aTroops) ) {
					sTaskSubject = " "+aTroops[14]+" "+sTaskSubject;
					sTask = aLangStrings[47];
				} else { sTask = aLangStrings[langStringNo]; }
				sTaskMoreInfo = getTroopsInfo(aTroops);
				break;
			case "3":  //research
				var aOptions = aTask[3].split("_");
				sTaskSubject = "- "+aOptions[2];
				sTask = aLangTasks[aOptions[1]];
				break;
			case "4":
				sTaskSubject = getTroopsInfo(aTask[3].split("_"));
				sTask = aLangTasks[4];
				break;
			case "5":
				sTaskSubject = aLangStrings[53];
				sTask = aLangTasks[5];
				break;
			case "6":  //Demolish
				sTask = aLangTasks[6];
				var tO = aTask[3].split("_");
				sTaskSubject = "A Building";
				var tT = parseInt(aTask[2]);
				for ( var i = 0,k = tO.length ; i < k ; ++i ) {
					if ( parseInt(tO[i].replace(/\[/g,"")) == tT ) {
						sTaskSubject = "- "+tO[i];
						break;
					}
				}
				sTaskMoreInfo = aLangStrings[35] + " " +aTask[2];
				break;
			case "7": //Send Merchants
				sTask = aLangTasks[7];
				sTaskSubject = " >> " + getVillageNameZ(aTask[2]) + "<br>" + getMerchantInfo(aTask[3]);
				sTaskMoreInfo = "Werd to your mudder!";
				break;
			case "8": //Send Back/Withdraw
				sTask = aLangTasks[8];
				sTaskSubject = " >> " + aTask[2] + "<br>" + getTroopsInfo(aTask[3].split("_"));
				sTaskMoreInfo = "So long and thanks for all the fish.";
				break;
			case "9": // Send troops through Gold-Club
				sTask = getOption('FARMLIST','');
				sTaskSubject = " >> " + aTask[2] + " ";
				break;
			default:
				break;
		}
		if ( isError && aTask && aTask[7] != "null" ) sTaskSubject += " (" + aTask[7] + ")";

		var sBgColor = isError ? "#FFB89F": "#90FF8F";
		oHistoryRow.style.backgroundColor = sBgColor;

		oHistoryRow.innerHTML = getVillageName(aTask[5])+": <span title='" +sTaskMoreInfo+ "' style='cursor:help;' >" +sTask+ " " +sTaskSubject+ " </span><br><span class='ttq_time_village_wrapper' >" +sTime+"</span>";
		oDate = null;

		var oDeleteLink = document.createElement('a');
		var oDeleteImg = document.createElement('img');
		oDeleteImg.src = sDeleteBtn;
		oDeleteImg.alt = 'X';
		oDeleteImg.style.verticalAlign = 'middle';
		oDeleteImg.style.display = 'inline-block';
		oDeleteLink.appendChild(oDeleteImg);
		oDeleteLink.title = aLangStrings[15];
		oDeleteLink.setAttribute("itaskindex", index);
		oDeleteLink.setAttribute("istask", "false");
		ttqAddEventListener(oDeleteLink, 'click', deleteTask, false);
		oHistoryRow.appendChild(oDeleteLink);
		return oHistoryRow;
}
// *** End History Functions

// ****** BEGIN TTQ TASK FUNCTIONS ******
// *** Begin Build/Upgrade Functions ***
function createBuildLinks() {
	_log(3,"Begin createBuildLinks()");
	var iTask = 0;  //the default action is build new building on empty site
	var xpContract = xpath("//div[contains(@id,'contract')]");
	if ( xpContract.snapshotLength < 1 ) { //Unknown site
		_log(1, "createBuildLinks> Unknown Building site or the building is at its maximum level. Not creating build link. End createBuildLinks()");
		return false;
	}
	iTask = 1; //Upgrade existing building

	var xpBuildDesc = xpath("//div[contains(@class,'build_desc') or contains(@class,'stickyImage') or contains(@class,'upgradeHeader')]");
	for ( var i = 0, j = xpBuildDesc.snapshotLength ; i < j ; ++i ) {
		var bBuildDesc = xpBuildDesc.snapshotItem(i);
		var bIMG = bBuildDesc.getElementsByTagName("img");
		if(bIMG.length<1) continue;
		var bName = "["+bIMG[0].alt+"]";
		var bID = parseInt(bIMG[0].className.split(" g")[1]);
		var oLink = document.createElement("a");
		oLink.id = "buildLater" + i;
		oLink.innerHTML = "&ndash; " + aLangStrings[iTask] + " &ndash;";
		oLink.title = aLangStrings[4];
		oLink.href = "#";
		oLink.setAttribute("itask", iTask);
		oLink.setAttribute("starget", iSiteId);
		oLink.style.display = "block";
		//oLink.style.textAlign = ltr ? "right" : "left";
		var eParam = window.location.search.replace(/[&?](newdid|gid|id|z|d|x|y)=\d+/g,'').replace("?","&");
		oLink.setAttribute("soptions", bID + "_" + bName + (eParam.length > 1 ? "_" + eParam: "") );
		ttqAddEventListener(oLink, 'click', displayTimerForm, false);
		bBuildDesc.after(oLink);
	}
	_log(3, "End createBuildLinks()");
}

function upgradebuild(aTask) {
	// UpgradeBuild> Begin. aTask = (1,1303246876,36,5_Sawmill,151972)
	_log(3,"UpgradeBuild> Begin. aTask = ("+JSON.stringify(aTask)+")");
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));

	var buildingID = parseInt(aTask[3]);
	var buildingName = aTask[3].split("_")[1];
	var eParam = aTask[3].split("_")[2];
	var oldVID = parseInt(aTask[5]);
	if ( isNaN(oldVID) ) oldVID = -2;

	var Tab = "";
	if (buildingID==16) { Tab = "&tt=0" } //Rally point
	if (buildingID==17) { Tab = "&t=0" } //Market
	if (buildingID==25 || buildingID==26 || buildingID==44) { Tab = "&s=0" } //Residence, Palace or Command Center

	var httpRequest = new XMLHttpRequest();
		_log(3,"UpgradeBuild> Posting Build/Upgrade request... "+"build.php?" + ((oldVID != 'null')?("newdid=" + oldVID):("")) + Tab + "&id=" + aTask[2] + (eParam ? eParam: ""));
		httpRequest.open("GET", fullName+"build.php?" + ((oldVID != 'null')?("newdid=" + oldVID):("")) + Tab + "&id=" + aTask[2] + (eParam ? eParam: ""), true);
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == 4) { //complete
				printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
				if (httpRequest.status == 200 && httpRequest.responseText) { // ok
					var holder = document.createElement('div');
					holder.innerHTML = httpRequest.responseText;
					var myContracts = holder.getElementsByClassName("buildingWrapper");
					if ( myContracts.length <= 0 ) {
						myContracts = holder.getElementsByClassName("showBuildCosts normal");
						if ( myContracts.length <= 0 ) {
							myContracts = holder.getElementsByClassName("upgradeButtonsContainer");
							if ( myContracts.length <= 0 ) return;
						}
					}
					var myBuilds = holder.getElementsByClassName("roundedCornersBox");
					if (myBuilds.length <=0 ) myBuilds = holder.getElementsByClassName("upgradeHeader");
					if (myBuilds.length <=0 ) myBuilds = holder.getElementsByClassName("build_desc");

					var reqVID = getActiveVillage(holder);

					if ( myBuilds.length > 0 && myContracts.length > 0 && oldVID == reqVID ) {
						var ii,j,tmp;
						for ( ii = 0 , j = myBuilds.length; ii < j ; ++ii ) {
							tmp = myBuilds[ii].getElementsByTagName('img');
							if ( tmp.length < 1 ) continue;
							tmp = parseInt(tmp[0].className.split(" g")[1]);
							if ( isNaN(tmp) || tmp != buildingID ) continue;
							tmp = myContracts[ii].getElementsByTagName("button");
							if ( tmp.length > 0 ) {
								if (tmp[0].getAttribute('class')) if (tmp[0].getAttribute('class').indexOf("gold builder") > -1)
								{
									_log(1, "UpgradeBuild> Found the button but it would use gold (Master Builder).");
									printMsg(getVillageName(oldVID)+ "<br>" + buildingName + " Found the button but it would use gold (Master Builder).", true);
									addToHistory(aTask, false, "Master Builder");
									return;
								}
								if (tmp[0].getAttribute('class')) if (tmp[0].getAttribute('class').indexOf("disabled") > -1)
								{
									_log(1, "UpgradeBuild> Found the button but its disabled because there are not enough resources.");
									printMsg(getVillageName(oldVID)+ "<br>" + buildingName + " Found the button but its disabled because there are not enough resources", true);
									addToHistory(aTask, false, "Not enough resources");
									return;
								}
								if (tmp[0].getAttribute('class')) if (tmp[0].getAttribute('class').indexOf("gold") > -1)
								{
									_log(1, "UpgradeBuild> Found the button but its disabled because there are not enough resources.");
									printMsg(getVillageName(oldVID)+ "<br>" + buildingName + " Found the button but its disabled because there are not enough resources", true);
									addToHistory(aTask, false, "Not enough resources");
									return;
								}
								tmp = tmp[0].getAttribute("onclick").split("'")[1];
								if ( tmp ) {
									if ( tmp.startsWith("/") ) { tmp = tmp.substring(1); }
									_log(2, "UpgradeBuild> Posting Build/Upgrade request...\nhref> " + tmp + "\nmyOptions> " + aTask);
									get(fullName+tmp, handleRequestBuild, aTask);
									return;
								}
								if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
								_log(1, "UpgradeBuild> Found the button but could not find the link for Build/Upgrade! (No Link 1)");
								printMsg(getVillageName(oldVID)+ "<br>" + buildingName + " " + aLangStrings[68]+" ("+aLangStrings[70]+" 1)", true); // Your building can't be built. because we cant find the link
								addToHistory(aTask, false, aLangStrings[70] + " 1");
								return;
							}
							if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
							tmp = myContracts[ii].getElementsByClassName("contractLink");
							if ( tmp.length > 0 ) tmp = tmp[0].innerHTML;
							else tmp = myContracts[ii].innerHTML;
							tmp = "["+tmp+"]";
							_log(1, "UpgradeBuild> Did not find the button. Reason: " + tmp);
							printMsg(getVillageName(oldVID)+ "<br>" + buildingName + " " + aLangStrings[68] + " (" + aLangStrings[70] + " 2: " + tmp +")", true); // Your building can't be built. Because there was no button and a reason provided.
							addToHistory(aTask, false, aLangStrings[70] + " 2: " +tmp);
							return;
						}
						if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
						_log(1, "UpgradeBuild> Could not find the building (gid="+buildingID+") in the list of building descriptions.");
						printMsg(getVillageName(oldVID)+ "<br>" + buildingName + " "+aLangStrings[71] +" (" + aLangStrings[72]+")", true); // Your building can't be built. Because there was no building description. Building not found.
						addToHistory(aTask, false, aLangStrings[72]);
						return;
					}
					if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
					_log(1, "UpgradeBuild> Could not find the building (gid="+buildingID+") it appears we got redirected. (Server: Redirect 1)");
					printMsg(getVillageName(oldVID)+ "<br>" + buildingName + ' (' + aLangStrings[74] +" "+aLangStrings[11]+" 1)", true); // Your building can't be built. Because there was no building description. Building not found.
					addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11]+" 1");
					return;
				}
				switchActiveVillage(currentActiveVillage);
				_log(1, "UpgradeBuild> Could not build the building (gid="+buildingID+"). The server returned a non-200 code (or the request was empty) upon trying to load the send troops page.  ("+aLangStrings[74] +" "+ aLangStrings[46]+" 1)");
				printMsg(getVillageName(oldVID)+ "<br>" + buildingName + ' ' + aLangStrings[73] + " ("+aLangStrings[74] +" "+ aLangStrings[46]+" 1)", true); // Your building can't be built. Because there was a bad response from the server.
				addToHistory(aTask, false, aLangStrings[74] +" "+ aLangStrings[46]+" 1");
			}
		}
		httpRequest.send(null);
	_log(3, "UpgradeBuild> End. aTask = ("+aTask+")");
}

function handleRequestBuild(httpRequest, aTask) {
//	_log(1,"Begin handleRequestBuild("+httpRequest+", "+aTask+")");
	if (httpRequest.readyState == 4) {
		var buildingName = aTask[3].split("_")[1];
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;

		if (httpRequest.status == 200 && httpRequest.responseText) { // ok
			var holder = document.createElement('div');
			holder.innerHTML = httpRequest.responseText;
			var thisNewdid = getActiveVillage(holder);
			if ( thisNewdid != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			var re = new RegExp(buildingName, 'i');
			var bL = $gc('buildingList',holder);

			if( bL.length < 1 ) {
				printMsg(getVillageName(oldVID)+ "<br>" + buildingName + ' ' + aLangStrings[8] + " ("+aLangStrings[75]+")", true); // Your building can't be built.
				addToHistory(aTask, false, aLangStrings[75]);
				return;
			}

			if ( thisNewdid == oldVID ) {
				if ( bL[0].innerHTML.match(re) ) {
					printMsg(getVillageName(oldVID)+ "<br>" + aLangStrings[5] +' '+ buildingName);  //Your building is being built.
					addToHistory(aTask, true);
				} else {
					printMsg(getVillageName(oldVID)+ "<br>" + buildingName + ' ' + aLangStrings[8] + " ("+aLangStrings[75]+")", true); // Your building can't be built.
					addToHistory(aTask, false, aLangStrings[75]);
				}
			} else {
				if ( bL[0].innerHTML.match(re) ) {
					printMsg(getVillageName(oldVID)+ "<br>" + buildingName + ' ' + aLangStrings[76] +" ("+aLangStrings[77]+" "+getVillageName(thisNewdid)+")", true); // Your building was probably misbuilt
					addToHistory(aTask, false, aLangStrings[77]+" "+getVillageName(thisNewdid));
				} else {
					_log(1, "handleRequestBuild> Could not find the building (gid="+buildingID+") it appears we got redirected. (Server: Redirect 2)");
					printMsg(getVillageName(oldVID)+ "<br>" + buildingName + ' (' + aLangStrings[74] +" "+aLangStrings[11]+" 2)", true); // Your building can't be built. Because there was no building description. Building not found.
					addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11]+" 2");
				}
			}
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "handleRequestBuild> Request to build was sent, however, I could not confirm the building (gid="+buildingID+") was built. The server returned a non-200 code (or the request was empty) while loading the page to confirm on.  ("+aLangStrings[74] +" "+ aLangStrings[46]+" 2)");
		printMsg(getVillageName(oldVID)+ "<br>" + buildingName + ' ' + aLangStrings[73] + " ("+aLangStrings[74] +" "+ aLangStrings[46]+" 2)", true); // Your building can't be built. Because there was a bad response from the server.
		addToHistory(aTask, false, aLangStrings[74] +" "+ aLangStrings[46]+" 2");
	}
	_log(3, "End handleRequestBuild("+httpRequest+", "+aTask+")");
}
// *** End Build/Upgrade Functions ***

// *** Begin Research Functions ***
function createResearchLinks(buildingID) {
	_log(3,"Begin createResearchLinks()");
	//is this Academy or Smithy?
	switch ( buildingID ) {
		case 13: // Smithy
					var linkTxt = aLangStrings[1];
					var type = 1;
					break;
		case 22: // Academy
					var linkTxt = aLangStrings[3];
					var type = 3;
					break;
		default:	_log(1,"createResearchLinks> This is not the Academy or Smithy. End createResearchLinks()");
					return;
	}
	_log(2, "Adding research later links...");

	var tContract = document.getElementsByClassName("build_details");
	if ( tContract.length < 1 ) return;
	tContract = tContract[0];
	if ( buildingID == 13 ) var tLevels = tContract.getElementsByClassName("level");
	var tImg = tContract.getElementsByClassName("unit");
	tContract = tContract.getElementsByClassName("research");

	var iTroopId, oLink, oLvl, sTroopLvlText, sTroopLvl;
	for ( var i = 0, j = tContract.length ; i < j ; ++i ) {
		if ( buildingID == 13 ) {
			sTroopLvlText = tLevels[i].textContent;
			if ((oLvl = sTroopLvlText.match(/\d+/g)) != null) {
				sTroopLvl = parseInt(oLvl[0]) + (oLvl.length > 1 ? parseInt(oLvl[1]) : 0);
				if ( sTroopLvl > 19 ) continue; // Skip if level is maxed out
			}
		}
		iTroopId = parseInt(tImg[i].className.split(" u")[1])%10;
		if ( iTroopId == 0 ) iTroopId = 10;
		oLink = document.createElement("a");
		oLink.id = "ttq_research_later" + i;
		oLink.className = "ttq_research_later";
		oLink.innerHTML = " &ndash; " + linkTxt + " &ndash; ";
		oLink.title = linkTxt;
		oLink.href = "#";
		oLink.setAttribute("itask", 3);
		oLink.setAttribute("starget", iSiteId);
		oLink.setAttribute("soptions", iTroopId + "_" + type + "_["+tImg[i].alt+"]");
		oLink.setAttribute("style","float:right;");
		ttqAddEventListener(oLink, 'click',	displayTimerForm, false);
		tContract[i].appendChild(oLink);
	}
	_log(3, "End createResearchLinks()");
}

function research(aTask) {
	_log(1,"Begin research("+aTask+")");
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));
	if(aTask[5] != 'null') var sNewDid = "&newdid=" +aTask[5];
	else var sNewDid = "";
	var sUrl = "build.php?id=" + aTask[2] + sNewDid;
	get(fullName+sUrl, handleRequestResearch, aTask);
	_log(1, "End research("+aTask+")");
}

function handleRequestResearch(httpRequest, aTask) {
//	_log(1,"Begin handleRequestResearch("+httpRequest+", "+aTask+")");
	if (httpRequest.readyState == 4 ) {
		printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;
		var iTroop = parseInt(aTask[3].split("_")[0]);

		if (httpRequest.status == 200 && httpRequest.responseText) {
			var holder = document.createElement('div');
			holder.innerHTML = httpRequest.responseText;
			var tConract = holder.getElementsByClassName("contracting");
			var divResearch = holder.getElementsByClassName("research");

			var reqVID = getActiveVillage(holder);

			if ( reqVID == oldVID && (holder.getElementsByClassName("gid22").length == 1 || holder.getElementsByClassName("gid13").length == 1) ) {
				var oReason, tReason, iTroopClassNr;
				if ( divResearch.length > 0 ) {
					for ( var i = 0; i < divResearch.length ; ++i ) {
						iTroopClassNr = iMyRace*10+iTroop;
						var tImg = divResearch[i].getElementsByClassName("u"+iTroopClassNr);
						if ( tImg.length > 0 ) {
							oReason = divResearch[i].getElementsByClassName("none");
							if (oReason.length > 0) {
								tReason = oReason[0].textContent;
							} else {
								tReason = "Unknown error.";
							}
							break;
						}
					}
				}
				if ( tConract.length > 0) {
					var sURL, i, j;
					for ( i = 0, j = tConract.length; i < j ; ++i ) {
						sURL = tConract[i].getAttribute("onclick").split("'")[1];
						if ( sURL.startsWith("/") ) { sURL = sURL.substring(1); }
						if ( sURL.indexOf("t=t" + iTroop) != -1 ) {
							get(fullName+sURL,handleRequestResearchConfirmation, aTask);
							return;
						}
					}
				}
				else {
					if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
					//var tReason = "["+holder.getElementsByClassName("none")[0].innerHTML+"]";
					_log(1, "handleRequestResearch> Request to research was not sent. It appears we are already researching something (No Link 1)");
					printMsg(getVillageName(oldVID)+ "<br> ["+aTask[3].split("_")[2]+"] " + aLangStrings[69] +" ("+aLangStrings[70]+" 1: "+tReason+")", true);
					addToHistory(aTask, false, aLangStrings[70]+" 1: "+tReason);
					return;
				}
				if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
				_log(1, "handleRequestResearch> Request to research was not sent. I do not see the research links. (No Link 2)");
				printMsg(getVillageName(oldVID)+ "<br> ["+aTask[3].split("_")[2]+"] " + aLangStrings[68] +" ("+aLangStrings[70]+" 2)", true);
				addToHistory(aTask, false, aLangStrings[70]+" 2");
				return;
			}
			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			_log(1, "handleRequestResearch> Request to research was not sent. It appears we got redirected. (Server: Redirect 1)");
			printMsg(getVillageName(oldVID)+ "<br> ["+aTask[3].split("_")[2]+"] " + aLangStrings[73] +" ("+aLangStrings[74]+" "+aLangStrings[11]+" 1)", true);
			addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11]+" 1");
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "handleRequestResearch> Request to research was not sent. The server returned a non-200 code (or the request was empty) while loading the final page to build the last request from.  ("+aLangStrings[74] +" "+ aLangStrings[46]+" 1)");
		printMsg(getVillageName(oldVID)+ "<br> ["+aTask[3].split("_")[2]+"] " + aLangStrings[73] + " ("+aLangStrings[74] +" "+ aLangStrings[46]+" 1)", true); // Your research did not confirm.
		addToHistory(aTask, false, aLangStrings[74] +" "+ aLangStrings[46]+" 1");
	}
}

function handleRequestResearchConfirmation(httpRequest, aTask) {
	_log(1,"Begin handleRequestResearchConfirmation("+httpRequest+", "+aTask+")");
	if (httpRequest.readyState == 4) {
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;
		var iTroop = parseInt(aTask[3].split("_")[0]);
		if (httpRequest.status == 200 && httpRequest.responseText) {
			var iTroopClassNr;
			var holder = document.createElement('div');
			holder.innerHTML = httpRequest.responseText;

			var reqVID = getActiveVillage(holder);
			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			if ( reqVID == oldVID && (holder.getElementsByClassName("gid22").length == 1 || holder.getElementsByClassName("gid13").length == 1) ) {
				var ti = holder.getElementsByClassName("under_progress");
				if ( ti.length > 0 ) {
					iTroopClassNr = iMyRace*10+iTroop;
					ti = ti[0].getElementsByClassName("u"+iTroopClassNr);
					if (ti.length > 0) {
						printMsg(getVillageName(oldVID)+ "<br>" + aLangStrings[44] + " "+aTask[3].split("_")[2]);
						addToHistory(aTask, true);
						return;
					}
				}
				printMsg(getVillageName(oldVID)+ '<br> [' + aTask[3].split("_")[2]+"] " + aLangStrings[45] + " (" + aLangStrings[75] + ")", true);
				addToHistory(aTask, false, aLangStrings[75]);
				return;
			}
			_log(1, "handleRequestResearch> Request to research was sent. It appears we got redirected. (Confirmation Failed, Server: Redirect 2)");
			printMsg(getVillageName(oldVID)+ '<br> [' + aTask[3].split("_")[2]+"] " + aLangStrings[73]+" "+aLangStrings[50]+" ("+aLangStrings[75] +", "+aLangStrings[74]+" "+aLangStrings[11]+" 2)", true); // Your building can't be built. Because there was no building description. Building not found.
			addToHistory(aTask, false, aLangStrings[75] +", "+aLangStrings[74]+" "+aLangStrings[11]+" 2");
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "HTTP request status: " + httpRequest.status); // failed
		printMsg(getVillageName(oldVID)+ '<br> [' + aTask[3].split("_")[2]+"] " + aLangStrings[73]+" "+aLangStrings[50] + " (" + aLangStrings[75] +", "+ aLangStrings[74] +" "+ aLangStrings[46] +" 2)", true);
		addToHistory(aTask, false, aLangStrings[75] +", "+ aLangStrings[74] +" "+ aLangStrings[46] +" 2");
	}
	_log(2, "End handleRequestResearchConfirmation("+httpRequest+", "+aTask+")");
}
// *** End Research Functions ***

// *** Begin Party Functions ***
function createPartyLinks(/*sBuildingId*/) {
	_log(3,"Begin createPartyLinks()");

	//var xpathBuildingNames = xpath("//h1");
	//var re = new RegExp("(.*)\\s(?:<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>)?" + aLangStrings[7] + "\\s[0-9]{1,3}(?:<\/\\2>)?$", "i");
	//var re2 = new RegExp("[0-9]{1,3}\\.\\s(.*)$", "i");
	//var xpathResult = xpath("id('content')/div[@class='gid24']");

	//if(xpathResult.snapshotLength > 0) {
//		var xpathStart = document.getElementsByClassName("act");
		var xpathStart = document.getElementsByClassName("information");
		_log(3, "Time to party. Found " + xpathStart.length + " type of parties.");
		var linkTxt = aLangStrings[53];
		for(var i = 0; i < xpathStart.length ; ++i ) {
			if ( i == 2 ) continue;
//			var sBuildingName = xpathBuildingNames.snapshotItem(0).innerHTML;
//			var aMatches = sBuildingName.match(re);
//			sBuildingName = aMatches[1];
//			sBuildingName = rtrim(sBuildingName);
//			var sBuildingId = aLangBuildings.indexOf(sBuildingName);
			var thisStart = xpathStart[i];
			var pLink = document.createElement("a");
			pLink.id = "ttq_research_later" + i;
			pLink.className = "ttq_research_later";
			pLink.innerHTML = " " + linkTxt;
			pLink.title = linkTxt;
			pLink.href = "#";
			pLink.setAttribute("itask", 5);
			pLink.setAttribute("starget", iSiteId);
			pLink.setAttribute("soptions", /*sBuildingId*/i+1);
			ttqAddEventListener(pLink, 'click', displayTimerForm, false);
			thisStart.appendChild(pLink);
		}
	//}
	_log(3,"End createPartyLinks()");
}

function party(aTask) {
	_log(1,"Begin party("+aTask+")");
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));
	if(aTask[5] != 'null') var sNewDid = "&newdid=" +aTask[5];
	else var sNewDid = "";
	var sUrl = "build.php?id=" + aTask[2] + "&gid=24&action=celebration&do=" + aTask[3] + "&t=1" + sNewDid;
	var myOptions = [aTask, currentActiveVillage];
	get(fullName+sUrl, handleRequestParty, myOptions);
	_log(1, "End party("+aTask+")");
}

function handleRequestParty(httpRequest, options) {
	_log(3,"Begin handleRequestParty("+httpRequest+", "+options+")");
	var aTask = options[0];
	var activateVillageDid = parseInt(options[1]);
	if (httpRequest.readyState == 4) {
		switchActiveVillage(activateVillageDid);
		if (httpRequest.status == 200) {
			var sResponse = httpRequest.responseText;
			if( getActiveVillage($ee('DIV',sResponse)) != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			if(!sResponse) { // error retrieving the response
				printMsg( aLangTasks[aTask[0]] + ' ' + aTask[3] + ' ' + aLangStrings[5], true );
				addToHistory(aTask, false);
				return;
			}
			var re = new RegExp('under_progress', 'i');
			if(sResponse.match(re)) {
				printMsg(getVillageName(aTask[5])+ "<br>" + aLangStrings[55] + aLangStrings[53]);
				addToHistory(aTask, true);
			} else {
				printMsg(getVillageName(aTask[5])+ "<br>" + aLangStrings[53] +''+ aLangStrings[54], true);
				addToHistory(aTask, false);
			}
			return;
		}
		printMsg(getVillageName(aTask[5])+ "<br>" + aLangStrings[53] +''+ aLangStrings[54], true);
		addToHistory(aTask, false);
	}
	_log(3, "End handleRequestParty("+httpRequest+", "+options+")");
}
// *** End Party Functions ***

// *** Begin Send Troops Functions ***
function createAttackLinks() {
	_log(3,"Begin createAttackLinks()");
	var xpathResult = xpath("id('content')//input[@type='text']");
	if(xpathResult.snapshotLength < 1) {
		_log(3, "We are not creating the 'Send later' button here.");
		return false;
	}
	if ($id("combatSimulator")) {
		_log(3, "Combat simulator page. We are not creating the 'Send later' button here.");
		return false;
	}

	// create the button //Add the new button after the original
	if ( /[&?]from=\d+/.test(location.search)) { //At Send Troops Back screen
		var SndLtrBtn = generateButton(aLangStrings[16], scheduleSendBack);
		var oOkBtn = $id('checksum');
		oOkBtn.after(SndLtrBtn);
	} else {
		//create textbox for hero if it's not present
		var heroBox = document.getElementsByClassName("line-last column-last");
		if( ( heroBox.length > 0 ) && heroBox[0].firstElementChild == null ) { //no hero textbox - make one
			heroBox[0].innerHTML = '<img class="unit uhero" src="/img/x.gif" title="'+aLangTroops[10]+'" alt="'+aLangTroops[10]+'" />'
				+ '<input type="text" inputmode="numeric" class="text" name="troop[t11]" value="" />'
				+ '&nbsp;/&nbsp;<a href="#" onclick="jQuery(\'table#troops\').find(\'input[name=\\\'troop[t11]\\\']\').val(1); return false">1 ('+aLangStrings[33]+')</a>';
		}
		var SndLtrBtn = generateButton(aLangStrings[16], scheduleAttack);
		var oOkBtn = $id('ok');
		if (oOkBtn) { oOkBtn.after(SndLtrBtn); } else { _log(3, "No Send button found."); }
	}
	_log(3, "End createAttackLinks()");
}

function scheduleSendBack(e) {
	_log(2,"ScheduleSendBack> Begin.");
	var aTroops = new Array();
	aTroops[0] = urlParams;
	var xpathRes = xpath("//table//td/input[@type='text']");
	var bNoTroops = true;
	var c = 0;
	var aThisInput, iTroopId;
	if(xpathRes.snapshotLength > 0) {
		for (var i = 1; i < 12; ++i) {
			aThisInput = xpathRes.snapshotItem(c);
			if ( aThisInput != null ) iTroopId = parseInt(aThisInput.name.split("[t")[1].split("]")[0]);
			else iTroopId = 0;
			if ( iTroopId == i ) {
				aTroops[i] = (aThisInput.value != '') ? aThisInput.value : 0;
				++c;
			} else aTroops[i] = 0;
			if(aThisInput != null && aThisInput.value) {bNoTroops = false;}  //at least 1 troop has to be sent
		}
	} else {
		_log(1, "No info about troops found. Unable to schedule the send back/withdraw.");
		printMsg(aLangStrings[17] , true);
		return false;
	}
	if(bNoTroops) {
		_log(1, "No troops were selected. Unable to schedule the send back/withdraw.");
		printMsg(aLangStrings[17] , true);
		return false;
	}

	displayTimerForm(8, document.getElementsByClassName("role")[0].firstChild.innerHTML.onlyText() , aTroops);
	_log(3,"ScheduleSendBack> End.");
}

function sendbackwithdraw (aTask) {
	_log(2,"sendbackwithdraw> Begin. aTask = " + aTask);
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));
	var aTroops = aTask[3].split("_");
	get(fullName+"build.php" + aTroops[0], sendbackwithdraw2, aTask);
	_log(3,"sendbackwithdraw> End.");
}

function sendbackwithdraw2 (httpRequest,aTask) {
	_log(2,"sendbackwithdraw2> Begin. aTask = " + aTask);
	printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
	
	if (httpRequest.status == 200 && httpRequest.responseText) {
		var parser = new DOMParser();
		var holder = parser.parseFromString(httpRequest.responseText, "text/html");
		var err = holder.getElementsByClassName("error");
		if ( err.length > 0 ) {
			err = "["+err[0].innerHTML+"]";
			_log(1, "attack2> I could not send the troops. Reason: " + err);
			printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[69] + " (" + aLangStrings[13] + ": "+err+")", true);
			addToHistory(aTask, false, aLangStrings[13] + ": "+err);
			return false;
		}
		var aTroops = aTask[3].split("_");
		var sParams = "action=troopsSend";
		for ( var i = 1 ; i < 12 ; ++i ) if ( parseInt(aTroops[i]) > 0 ) sParams += "&troop[t"+i+"]="+aTroops[i];
		var okBtn = holder.getElementsByName('checksum');
		var checkSum = okBtn[0].value;
		sParams += "&checksum=" + checkSum;
		post(fullName+"build.php" + aTroops[0], sParams, handleSendBackRequestConfirmation, aTask);
	}
	_log(3,"sendbackwithdraw2> End.");
}

function handleSendBackRequestConfirmation (httpRequest, options) {
	if (httpRequest.readyState == 4 ){
		printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(options));
		if ( httpRequest.status == 200 && httpRequest.responseText ) {
			var holder = document.createElement('div');
			holder.innerHTML = httpRequest.responseText;
			if ( holder.getElementsByClassName('gid16').length > 0 ) {  //if its the rally point, it should have been successful.
				_log(1, "I think those troops were sent back/withdrawn.");
				printMsg(aLangStrings[78]+" "+options[2]);
				addToHistory(options, true);
			} else {
				_log(1, "I'm not so sure those troops were sent back/withdrawn.");
				printMsg(aLangStrings[79]+" "+options[2]+" ("+aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[11]+")",true);
				addToHistory(options, false, aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[11]);
			}
			if( getActiveVillage(holder) != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			return;
		}
		_log(1, "Request to Send Back/Withdraw was sent, however, I could not confirm it. Bad response from server when confirming. (Confirmation Failed, Server: Page Failed)");
		printMsg(aLangStrings[79]+" "+options[2] + " ("+aLangStrings[75] + ", " + aLangStrings[74] + " " + aLangStrings[46], true);
		addToHistory(aTask, false, aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[46]);
	}
}

function scheduleAttack(e) {
	_log(3,"scheduleAttack> Begin.");

	var iVillageId = crtPath.match(/[&?]z=(\d+)/);  // target village
	if(iVillageId != null) {
		iVillageId = iVillageId[1];
	} else { //try to get the coordinates
		var sX = document.getElementsByName('x');
		var sY = document.getElementsByName('y');
		iX = sX[0].value;
		iY = sY[0].value;
		if(iX != '' && iY != '') iVillageId = coordsXYToZ(iX, iY);
	}
	if(iVillageId == null) {
		_log(2, "Target village ID not found.");
		printMsg(aLangStrings[34], true);
		return false;
	}//            0		1	2	3	4	5	6	7	8	9	10		11		12		13		14		15		16
			//     type, 	t1,	t2,	t3,	t4,	t5,	t6,	t7,	t8,	t9,	t10,	t11(h),	traps,	gid,	spy,	kata1,	kata2
	var aTroops = [0,		0,	0,	0,	0,	0,	0,	0,	0,	0,	0,		0,		0,		-1,		-1,		-1,		-1,];
	var iAttackType = null;
	var xpathRes = xpath("id('content')//input[@type='radio']");
	for (var i = 0; i < xpathRes.snapshotLength; ++i) if (xpathRes.snapshotItem(i).checked) iAttackType = xpathRes.snapshotItem(i).value;
	if(iAttackType != null) {aTroops[0] = iAttackType;}
	else {
		_log(2, "The type of attack was not determined again. Unable to schedule the attack.");
		printMsg("Attack type not determined",true);
		return false;
	}

	xpathRes = xpath("//*[@id='troops']//td/input");
	var bNoTroops = true;
	if(xpathRes.snapshotLength > 10) {
		for (var i = 0; i < 11 ; ++i) {
			var aThisInput = xpathRes.snapshotItem(i);
			if (aThisInput.name.indexOf('troop[t') !== -1) {
				var iTroopId = parseInt(aThisInput.name.match(/troop\[t(\d+)\]/)[1]);
			}
			if ( isNaN(iTroopId) || iTroopId < 1 || iTroopId > 11 ) continue;
			var tV = parseInt(aThisInput.value);
			if ( isNaN(tV) || tV < 1 ) {
				aTroops[iTroopId] = 0;
			} else {
				aTroops[iTroopId] = tV;
				bNoTroops = false;  //at least 1 troop has to be sent
			}
		}
	} else {
		_log(2, "No info about troops found. Unable to schedule the attack.");
		printMsg("No info about troops found. Unable to schedule the attack.",true);
		return false;
	}

	if(bNoTroops) {
		_log(2, "No troops were selected. Unable to schedule the attack.");
		printMsg(aLangStrings[17] , true);
		return false;
	}

	var xpathRes = $gn("redeployHero");
	aTroops[17] = xpathRes.length > 0 && xpathRes[0].checked == true ? 1: 0;

	// Good, we have at least 1 troop. Display the form
	displayTimerForm(2, iVillageId, aTroops);
	_log(3, "End scheduleAttack()");
}

function attack(aTask) {
	_log(1,"Begin attack("+aTask+")");
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));
	if(aTask[5] != 'null') {  //multiple villages
		//we need to switch village (while at the same time, setting the target destination)
		get(fullName+"build.php?gid=16&tt=2&newdid=" + aTask[5] + "&targetMapId=" + aTask[2], attack2, aTask);
	} else {  //only 1 village. Perform attack immediately
		post(fullName+"build.php?gid=16&tt=2", "targetMapId=" + aTask[2], attack2, aTask);
		_log(2, "The attack was requested.");
	}
	_log(1, "End attack("+aTask+")");
}

function attack2(httpRequest,aTask) {
	if (httpRequest.readyState == 4) {
		printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;
		var sPlaceName = '<span id="ttq_placename_'+aTask[2]+'">'+getVillageNameZ(aTask[2])+'</span><br>' + getTroopsInfo(aTask[3].split("_"));
		var sFromName = '<span class="ttq_village_name" style="display:block;" id="ttq_placename_'+oldVID+'">'+getVillageName(oldVID)+':</span><br>';
		if (httpRequest.status == 200 && httpRequest.responseText) {
			var parser = new DOMParser();
			var holder = parser.parseFromString(httpRequest.responseText, "text/html");
			var bld = holder.getElementById('build');
			var aTroops = holder.getElementsByClassName("error");
			if ( aTroops.length > 0 ) {
				aTroops = "["+aTroops[0].innerHTML+"]";
				_log(1, "attack2> I could not send the troops. Reason: " + aTroops);
				printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[69] + " (" + aLangStrings[13] + ": "+aTroops+")", true); // Your building can't be built. Because there was no button and a reason provided.
				addToHistory(aTask, false, aLangStrings[13] + ": "+aTroops);
				return false;
			}

			var reqVID = getActiveVillage(holder,holder);

			aTroops = new Array();  //extract troops numbers and attack type
			var needC = true;
			aTroops = aTask[3].split("_");
			var tInputs = bld.getElementsByTagName('input');
			var sParams = '';
			var t,k = tInputs.length;
			if ( oldVID == reqVID && bld.getElementsByClassName("a2b").length == 1 && k > 15 ) {
				for (var q = 0 ; q < k ; ++q ) {
					t = tInputs[q].name;
					if (t.indexOf('troop[t') !== -1) {
						if (tInputs[q].disabled == true) continue;
						var troopsNr = aTroops[parseInt(t.match(/troop\[t(\d+)\]/)[1])];
						if (troopsNr == 0 ) {
							sParams += t + "=&";
						} else {
							sParams += t + "=" + troopsNr + "&";
						}
					} else if ( t == "eventType" ) {
						if ( needC ) {
							sParams += "eventType=" + aTroops[0] + "&";
							needC = false;
						}
					} else if ( t == "redeployHero" ) {
						if( aTroops[17] == 1 ) sParams += "&redeployHero=" + tInputs[q].value + "&";
					} else {
						sParams += t + "=" + tInputs[q].value + "&";
					}
				}
				sParams += "ok=ok";
				post(fullName+'build.php?gid=16&tt=2', sParams, attack3, aTask);
				return;
			}
			if ( reqVID != currentActiveVillage ) switchActiveVillage ( currentActiveVillage );
			_log(1, "Your attack could not be sent. It seems I am at the wrong screen. (Server: Redirected 1)");
			printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[9] + " (" +aLangStrings[74]+" "+aLangStrings[11]+" 1)", true);
			addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11]+" 1");
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "Your attack could not be sent. Bad response from server when sending request. (Server: Page Failed 1)");
		printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[73] + " ("+aLangStrings[74] + " " + aLangStrings[46]+" 1)", true);
		addToHistory(aTask, false, aLangStrings[74] + " " + aLangStrings[46]+" 1");
	}
}

function attack3(httpRequest,aTask){
	if (httpRequest.readyState == 4) {
		printMsg(aLangStrings[6] + " > 1 > 2 > 3<br><br>" + getTaskDetails(aTask));
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;
		var sPlaceName = '<span id="ttq_placename_'+aTask[2]+'">'+getVillageNameZ(aTask[2])+'</span><br>' + getTroopsInfo(aTask[3].split("_"));
		var sFromName = '<span class="ttq_village_name" style="display:block;" id="ttq_placename_'+oldVID+'">'+getVillageName(oldVID)+':</span><br>';
		if (httpRequest.status == 200 && httpRequest.responseText) { // ok
			var parser = new DOMParser();
			var holder = parser.parseFromString(httpRequest.responseText, "text/html");
			var bld = holder.getElementById('build');
			var reqVID = getActiveVillage(holder,holder);

			var q = bld.getElementsByClassName("error");
			if ( q.length > 0 ) {
				if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
				q = "["+q[0].innerHTML+"]";
				_log(1, "attack3> I could not send the troops. Reason: " + q);
				printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[69] + " (" + aLangStrings[13] + ": "+q+")", true); // Your building can't be built. Because there was no button and a reason provided.
				addToHistory(aTask, false, aLangStrings[13] + ": "+q);
				return false;
			}

			var tInputs = bld.getElementsByTagName('input');
			var k = tInputs.length;
			if ( reqVID == oldVID && bld.getElementsByClassName("a2b").length == 1 && k > 15 ) {
				var aTroops = new Array();  //extract troops numbers and attack type
				aTroops = aTask[3].split("_");
				var sParams = '';
				var tSelect = bld.getElementsByTagName('select');
				var okBtn = holder.getElementsByClassName('rallyPointConfirm');
				var sOnclick = okBtn[0].getAttribute('onclick');
	       		var checkSum = sOnclick.split(';')[1].split('value = \'')[1].split('\'')[0];
				for (q = 0 ; q < tSelect.length ; ++q) {
					t = tSelect[q].name;
					if ( /kata\W/.test(t) ) {
						if ( aTroops[15] > -1 ) sParams += t + "=" + aTroops[15] + "&";
						else sParams += t + "=" + tSelect[q].value + "&"; //default, dont change anything... random?
					} else if ( /kata2/.test(t) ) {
						if ( aTroops[16] > -1 ) sParams += t + "=" + aTroops[16] + "&";
						else sParams += t + "=" + tSelect[q].value + "&";  //default, dont change anything... random?
					}
				}
				for (q = 0 ; q < k ; ++q) {
					t = tInputs[q].name;
					if ( /spy/.test(t) ){
						if ( aTroops[14] > -1 ) sParams += t + "=" + aTroops[14] + "&";
						else sParams += "spy=1&";  //"Spy troops  and resources" by default
						++q;
					} else if (t=='checksum') sParams += "checksum=" + checkSum + "&";
					else sParams += t + "=" + tInputs[q].value + "&";
				}
				if (sParams.charAt(sParams.length - 1) == '&') { sParams = sParams.slice(0, -1); }
				post(fullName+'build.php?gid=16&tt=2', sParams, handleRequestAttack, aTask);
				return;
			}
			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			_log(1, "Your attack could not be sent. It seems I am at the wrong screen. (Server: Redirected 2)");
			printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[9] + " (" +aLangStrings[74]+" "+aLangStrings[11]+" 2)", true);
			addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11]+" 2");
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "Your attack could not be sent. Bad response from server when sending request. (Server: Page Failed 2)");
		printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[73] + " ("+aLangStrings[74] + " " + aLangStrings[46]+" 2)", true);
		addToHistory(aTask, false, aLangStrings[74] + " " + aLangStrings[46]+" 2");
	}
}

function handleRequestAttack(httpRequest, aTask) {
	if (httpRequest.readyState == 4) {
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;

		var sPlaceName = '<span id="ttq_placename_'+aTask[2]+'">'+getVillageNameZ(aTask[2])+'</span><br>' + getTroopsInfo(aTask[3].split("_"));
		var sFromName = '<span class="ttq_village_name" style="display:block;" id="ttq_placename_'+oldVID+'">'+getVillageName(oldVID)+':</span><br>';
		if (httpRequest.status == 200 && httpRequest.responseText) { // ok
			var holder = document.createElement('div');
			holder.innerHTML = httpRequest.responseText;
			var re = holder.getElementsByClassName("error");
			if ( re.length > 0 ) {
				re = "["+re[0].innerHTML+"]";
				_log(1, "handleRequestAttack> I could not send the troops. Reason: " + re);
				printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[69] + " (" + aLangStrings[13] + ": "+re+")", true); // Your building can't be built. Because there was no button and a reason provided.
				addToHistory(aTask, false, aLangStrings[13] + ": "+re);
				return false;
			}

			var reqVID = getActiveVillage(holder);
			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			if ( oldVID == reqVID && holder.getElementsByClassName("gid16").length == 1 ) {
				re = new RegExp('karte\\.php\\?d=' + aTask[2], 'i');
				if(re.test(httpRequest.responseText)) {
					_log(1, "It seems your attack was successfully sent.");
					printMsg(sFromName + aLangStrings[18] + " >> " + sPlaceName );
					addToHistory(aTask, true);
				} else {
					_log(1, "Your attack could not be sent. Confirmation failed.");
					printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName+ " (" + aLangStrings[75]+")", true);
					addToHistory(aTask, false, aLangStrings[75]);
				}
			} else {
				_log(1, "Attack request was sent, however, I could not confirm. It seems we have been redirected. (Confirmation Failed, Server: Redirected 3)");
				printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[73] + " " + aLangStrings[50] + " ("+aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[11]+" 3)", true);
				addToHistory(aTask, false, aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[11]+" 3");
			}
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "Attack request was sent, however, I could not confirm. Bad response from server when trying to confirm. (Confirmation Failed, Server: Page Failed 3)");
		printMsg(sFromName + aLangStrings[19] + " >> " +sPlaceName + " " + aLangStrings[73] + " " + aLangStrings[50] + " ("+aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[46]+" 3)", true);
		addToHistory(aTask, false, aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[46]+" 3");
	}
	_log(3, "End handleRequestAttack("+httpRequest+", "+aTask+")");
}
// *** End Send Troops Functions ***
// farm from gold-club
// writed by Serj_LV
function createGoldClubBtn () {
	_log(3,"Begin createGoldClubBtn()");
	var arrList = $gc('farmListWrapper');
	for (var i = 0; i < arrList.length; i++) {
		var SndLtrBtn = generateButton(aLangStrings[16], scheduleSendClub);
		arrList[i].parentNode.insertBefore(SndLtrBtn, arrList[i].parentNode.firstChild);
	}
	_log(3, "End createGoldClubBtn()");
}

function createGoldClubBtnAll () {
	_log(3,"Begin createGoldClubBtnAll()");
	var arrList = $gc('startAllFarmLists');
	if (arrList.length > 0) {
		arrList[0].parentNode.parentNode.style.marginTop = "130px";
		var SndLtrBtn = generateButton(aLangStrings[16], scheduleSendClubAll);
		arrList[0].parentNode.appendChild(document.createElement("div"));
		arrList[0].parentNode.appendChild(SndLtrBtn);
	}
	_log(3, "End createGoldClubBtnAll()");
}

function scheduleSendClub () {
	_log(3,"Begin scheduleSendClub()");
	var list = this.parentNode;
	listNameClass = list.querySelectorAll('[data-list]');
	if (listNameClass.length > 0) {
		var listName = $gc("farmListName",list)[0].textContent.replace('|','&#124;').replace(',','&#44;').trim();
		var listID = listNameClass[0].getAttribute('data-list');
	}
	displayTimerForm(9,listName,listID);
	_log(3, "End scheduleSendClub()");
}

function scheduleSendClubAll () {
	_log(3,"Begin scheduleSendClubAll()");
	var lists = $id('rallyPointFarmList');
	listNameClass = lists.querySelectorAll('[data-list]');
	var listIDs = '';
	for (var i = 0; i < listNameClass.length; i++) {
		var listName = $gc("startAllFarmLists")[0].textContent.replace('|','&#124;').replace(',','&#44;').trim();
		listIDs += listNameClass[i].getAttribute('data-list') + ";";
	}
	displayTimerForm(9,listName,listIDs);
	_log(3, "End scheduleSendClubAll()");
}

function sendGoldClub (aTask) {
	_log(1,"Begin attack from gold-club ("+aTask+")");
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));
	//post(fullName+'api/v1/raid-list/slots', sParams, sendGoldClub1, aTask);
	get(fullName+"build.php?id=39&gid=16&tt=99", sendGoldClub2, aTask);
	_log(2, "The attack was requested.");
	_log(1, "End attack from gold-club ("+aTask+")");
}
function getActiveVillage (el,adoc) {
	var reqVID = xpath('//div[@id="sidebarBoxVillagelist"]//a[@class="active"] | //div[@id="sidebarBoxVillageList"]//a[@class="active"]',el,true,adoc);
	if ( reqVID ) {
		reqVID = parseInt(reqVID.href.split("=")[1]);
		if ( isNaN(reqVID) ) reqVID = -1;
	} else { reqVID = -1; }
	return reqVID;
}
function sendGoldClub2(httpRequest,aTask) {
	if (httpRequest.readyState == 4) {
		printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
		if (httpRequest.status == 200 && httpRequest.responseText) {
			_log(3,"Preparing sending farm list...");
			var parser = new DOMParser();
			var holder = parser.parseFromString(httpRequest.responseText, "text/html");
			var build = holder.getElementsByClassName('gid16');
			var scripts = build[0].getElementsByTagName('script');
			_log(3,"Script content: "+scripts[0].textContent);
			var data = JSON.parse(scripts[0].textContent.match(/viewData:.*}} /)[0].replace('viewData','{ "viewData"').replace(new RegExp('}} $'), '}}}'));
			var farmLists = data.viewData.ownPlayer.farmLists;
			var sParams;
			aTask[3] = aTask[3].replace(/;$/, "");
			var listIDs = aTask[3].split(';');
			for (var k=0; k<listIDs.length; k++) {
				for (var i=0; i<farmLists.length; i++) {
					if (farmLists[i].id == listIDs[k]) {
						var targets = [];
						for (var j=0; j<farmLists[i].slotStates.length; j++) {
							var village = farmLists[i].slotStates[j];
							if (village.isActive == true) { //farmlists with casualties are automatically inactivated
								targets.push(village.id);
							}
						}
						if (listIDs.length == 1) {
							sParams = '{"action":"farmList","lists":[{"id":'+listIDs[k]+',"targets":'+JSON.stringify(targets)+'}]}';
						} else{
							if (k==0) {
								sParams = '{"action":"farmList","lists":[{"id":'+listIDs[k]+',"targets":'+JSON.stringify(targets)+'}], "startedAll": true}';
							} else {
								sParams = '{"action":"farmList","lists":[{"id":'+listIDs[k]+',"targets":'+JSON.stringify(targets)+'}], "triggeredBySendAll": true}';
							}
						}
						_log(3,"parameters: "+sParams);
						post(fullName+'api/v1/farm-list/send', sParams, sendGoldClubConfirmation, aTask);
						break;
					}
				}
			}
			return;
		}
		_log(1, "Your attack could not be sent. Bad response from server when sending request. (Server: Page Failed 1)");
		printMsg(aTask, false, aLangStrings[74] + " " + aLangStrings[46]+" 1", true);
		addToHistory(aTask, false, aLangStrings[74] + " " + aLangStrings[46]+" 1");
	}
}
function sendGoldClubConfirmation (httpRequest, aTask) {
		if (httpRequest.readyState == 4 ){
		printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
		if ( httpRequest.status == 200 && httpRequest.responseText ) {
			var data = JSON.parse(httpRequest.responseText);
			if ( !data.lists[0].error ) {
				_log(1, "I think those troops were sent.");
				printMsg(aLangStrings[18]+", "+aTask[2]);
				addToHistory(aTask, true);
			} else {
				_log(1, "I'm not so sure those troops were sent. Confirmation failed. " + data.lists[0].error);
				printMsg(aLangStrings[19] + " >> " +aTask[2]+ " (" + aLangStrings[75]+")" + data.lists[0].error, true);
				addToHistory(aTask, false, aLangStrings[75]);
			}
			return;
		}
		_log(1, "Farm request was sent, however, I could not confirm. Bad response from server when trying to confirm. (Confirmation Failed, Server: Page Failed 3)");
		printMsg(aLangStrings[19]+" "+aTask[2] + " ("+aLangStrings[75] + ", " + aLangStrings[74] + " " + aLangStrings[46], true);
		addToHistory(aTask, false, aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[46]);
	}
}
// *** End Send Troops from gold-club ***

// *** Begin Troop/Trap Training Functions ***
function createTrainLinks(buildingID) {
	_log(3,"Begin createTrainLinks()");
	switch(buildingID) {
		case 19: //Barracks
		case 20: //Stable
		case 21: //Workshop
		case 29: //Great barracks
		case 30: //Great stables
		case 36: //Trapper
		case 46: //Hospital
		case 48: //Asclepeion
		case 49: //Harbor
			break;
		case 25: //Residence
		case 26: //Palace
		case 44: //Command center
			break;
		default:
			_log(2, "No train links needed.");
			return;
	}
	var linkTxt = aLangStrings[48];
	_log(2, "Adding train later links for barracks/stables/workshop/trapper...");
	var trainBtn = xpath("//form/button[@id='s1']");
	if(trainBtn.snapshotLength < 1) {
		_log(1, "The Train button was not found. Exiting function...");
		return false;
	}
	var oBtn = generateButton(linkTxt, scheduleTraining);
	trainBtn.snapshotItem(0).parentNode.appendChild(oBtn);
	_log(3, "End createTrainLinks()");
}

function scheduleTraining(e) {
	var Inputs = xpath("id('content')//input[@type='text']");
	if(Inputs.snapshotLength < 1 ) {
		_log(3, "ScheduleTraining> No textboxes with troop numbers found.");
		return false;
	}//            0		1	2	3	4	5	6	7	8	9	10		11		12		13		14		15		16
			//     type, 	t1,	t2,	t3,	t4,	t5,	t6,	t7,	t8,	t9,	t10,	t11(h),	traps,	gid,	spy,	kata1,	kata2
	var aTroops = [0,		0,	0,	0,	0,	0,	0,	0,	0,	0,	0,		0,		0,		-1,		-1,		-1,		-1,];
	var bNoTroops = true;
	var tmp;
	for(var i = 0; i < Inputs.snapshotLength; ++i) {
		tmp = Inputs.snapshotItem(i);
		var thisTroopType = parseInt(tmp.name.substring(1));
		if (thisTroopType == 99) thisTroopType = 12;
		aTroops[thisTroopType] = tmp.value == '' ? 0 : parseInt(tmp.value);
		if(aTroops[thisTroopType] > 0) bNoTroops = false;
	}

	if(bNoTroops) {
		_log(2, "ScheduleTraining> No troops were selected. Unable to schedule training.");
		printMsg(aLangStrings[17] , true);
		return false;
	}

	//get the checksum
	var iCode = xpath("//form//input[@name='checksum']");
	if(iCode.snapshotLength > 0) { aTroops[0] = iCode.snapshotItem(0).value; }
	else {
		_log(3, "ScheduleTraining> No code available. Exiting.");
		return false;
	}

	//currently, only 1 kind of troop can be trained at once - null all elements except for the oth one (code) and the first non-zero value
	var somethingFound = -1;
	for ( var i = 1 ; i < 13 ; ++i ) {
		if ( somethingFound > -1 ) aTroops[i] = 0;
		else if ( aTroops[i] > 0 ) somethingFound = i;
	}
	// Good, we have at least 1 troop. We can display the form
	// Grab this building's ID and Troop name for further use
	aTroops[13] = parseInt($id("build").className.replace("gid",""));
	_log(2,"ScheduleTraining> aTroops = " + aTroops);
	buildingID = parseInt($id('build').getAttribute('class').match(/\d+/)[0]);
	displayTimerForm(4, iSiteId, aTroops, undefined, undefined, undefined, buildingID);
}

function train(aTask) {
	var oldVID = parseInt(aTask[5]);
	if ( isNaN(oldVID) ) oldVID = -2;
	_log(3, "Train> Switching to village:" +oldVID);
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));
	var aTroops = aTask[3].split("_");
	var residenceTab = "";
	if (aTroops[10]==1 || aTroops[9]==1) { residenceTab = "&s=1"; } //settler or general
	var troopsInfo = getTroopsInfo(aTroops);
	var oldGid = parseInt(aTroops[13]);
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", fullName+"build.php" + (oldVID>0 ? "?newdid=" + oldVID : "") + (oldVID>0 ? "&id=" + aTask[2] : "?id=" + aTask[2]) + "&gid=" + aTask[4] + residenceTab , true);
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4) { //complete
			printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
			if (httpRequest.status == 200 && httpRequest.responseText ) { // ok
				var holder = document.createElement('div');
				holder.innerHTML = httpRequest.responseText;
				var theZ = holder.getElementsByTagName("input");
				var k = theZ.length;
				var reqVID = getActiveVillage(holder);
				if ( reqVID == oldVID && holder.getElementsByClassName("gid"+oldGid).length == 1 ) {
					if ( k > (oldGid==36?2:3) ) {
						var i = (oldGid==36 ? 2 : 3);
						var tmp;
						var tI;
						var theMaxs = [0,0,0,0,0,0,0,0,0,0,0,0,0];
						for (  ; i < k ; ++i ) {
							tmp = theZ[i].parentNode.getElementsByTagName("a");
							tI = parseInt(theZ[i].name.replace("t",""));
							if ( tI == 99 ) tI = 12;
							if ( tmp.length == 1 ) {
								tmp = parseInt(tmp[0].textContent);
								if ( isNaN(tmp) || tmp < 0 ) tmp = 0;
								theMaxs[tI] = tmp;
							}
						}
						var sParams = "&s1=ok";
						for ( i=0; i<k; i++) {
							if (theZ[i].type == "hidden") { sParams += "&" + theZ[i].name + "=" + theZ[i].value; }
						}
						if(aTroops.length > 1) {
							for( var j = 1; j < 13; ++j) if ( j != 11 && aTroops[j] > 0) {
								if ( aTroops[j] > theMaxs[j] ) aTroops[j] = theMaxs[j];
								sParams += "&t" + ((j==12)?99:j) + "=" + aTroops[j];
							}
							aTask.splice(3,1,aTroops.join("_"));
						} else {
							if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
							_log(2, "Train> Improbability Error Number 1. Please report of its existance. (No troops specified. Exiting function.)");
							printMsg("Train> Improbability Error Number 1. Please report of its existance. (No troops specified. Exiting function.)");
							addToHistory(aTask, false, "Improbability Error Number 1. Please report of its existance. (No troops specified. Exiting function.)");
							return;
						}
						_log(2, "Train>posting>sParams>" + sParams + "<");
						post(fullName+"build.php"+"?id=" +aTask[2] + "&gid=" + aTask[4], sParams, handleRequestTrain, aTask);
						return;
					}
					if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
					_log(1, "Train Troops request was not sent. It seems there are no troops to train. (No Link)");
					printMsg(getVillageName(oldVID)+"<br>"+troopsInfo+" "+aLangStrings[52]+" "+aLangStrings[68]+ " ("+aLangStrings[70]+")", true);
					addToHistory(aTask, false, aLangStrings[70]);
					return;
				}
				if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
				_log(1, "Train Troops request was not sent. It seems I was redirected before I could post the training. (Server: Redirected 1)");
				printMsg(getVillageName(oldVID)+"<br>"+troopsInfo+" "+aLangStrings[52]+" "+aLangStrings[9]+ " ("+aLangStrings[74] + " " + aLangStrings[11]+" 1)", true);
				addToHistory(aTask, false, aLangStrings[74] + " " + aLangStrings[11]+" 1");
				return;
			}
			switchActiveVillage(currentActiveVillage);
			_log(1, "Train Troops request was not sent. Bad response from server when trying to switch village/building. (Server: Page Failed 1)");
			printMsg(getVillageName(oldVID)+"<br>"+troopsInfo+" "+aLangStrings[52]+" "+aLangStrings[73]+ " ("+aLangStrings[74] + " " + aLangStrings[46]+" 1)", true);
			addToHistory(aTask, false, aLangStrings[74] + " " + aLangStrings[46]+" 1");
		}
	};
	httpRequest.send(null);
	_log(1, "Train> ** End ** aTask = ("+aTask+")");
}

function handleRequestTrain(httpRequest, aTask) {
	if (httpRequest.readyState == 4) {
		var options = aTask[3].split("_");
		var troopsInfo = getTroopsInfo(options);
		var oldGid = parseInt(options[13]);
		var oldVID = parseInt(aTask[5]);

		if (httpRequest.status == 200 && httpRequest.responseText) {
			var holder = document.createElement('div');
			holder.innerHTML = httpRequest.responseText;
			var ti = holder.getElementsByClassName("unit");
			var k = ti.length;
			var reqVID = getActiveVillage(holder);
			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			if ( reqVID == oldVID && holder.getElementsByClassName("gid"+oldGid).length == 1 && k > 0) {
				var tie = ti[k-1];
				if ( tie.nextSibling ) {
					var buildAmount = parseInt(tie.nextSibling.nodeValue);
					for ( k = 1 ; k < 13 && ( (troopsInfoN = parseInt(options[k])) < 1 ) ; ++k ) ;
					if ( k == 12 ) k = 99;
					else k += iMyRace*10;
					if ( k == parseInt(tie.className.replace("unit u","")) && tie.parentNode.className == "desc" && buildAmount == troopsInfoN ) {
						printMsg(getVillageName(oldVID)+ "<br>" + aLangStrings[51] + troopsInfo);
						addToHistory(aTask, true);
					} else {
						printMsg(getVillageName(oldVID)+ "<br>" + troopsInfo + ' ' + aLangStrings[52] + " ("+aLangStrings[75]+" 1)", true);
						addToHistory(aTask, false,aLangStrings[75]+" 1");
					}
				} else {
					printMsg(getVillageName(oldVID)+ "<br>" + troopsInfo + ' ' + aLangStrings[52] + " ("+aLangStrings[75]+" 2)", true);
					addToHistory(aTask, false,aLangStrings[75]+" 2");
				}
				return;
			}
			_log(1, "Train Troops request was sent, however I could not confirm it. It seems I was redirected when trying to confirm it. (Confirmation Failed, Server: Redirected 2)");
			printMsg(getVillageName(oldVID)+"<br>"+troopsInfo+" "+aLangStrings[52]+" "+aLangStrings[50]+" "+aLangStrings[9]+ " ("+aLangStrings[75] + ", " + aLangStrings[74] + " " + aLangStrings[11]+" 2)", true);
			addToHistory(aTask, false, aLangStrings[75]+", "+aLangStrings[74]+" "+aLangStrings[11]+" 2");
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "Train Troops request was sent, however I could not confirm it. Bad response from server when recieving the page to confirm on. (Confirmation Failed, Server: Page Failed 2)");
		printMsg(getVillageName(oldVID)+"<br>"+troopsInfo+" "+aLangStrings[52]+" "+aLangStrings[50]+" "+aLangStrings[73]+ " ("+aLangStrings[75] + ", " + aLangStrings[74] + " " + aLangStrings[46]+" 2)", true);
		addToHistory(aTask, false, aLangStrings[75] + ", " +aLangStrings[74] + " " + aLangStrings[46]+" 2");
	}
	_log(1, "handleRequestTrain> End.httpRequest = ("+httpRequest+"), aTask = ("+aTask+")");
}
// *** End Troop/Trap Training Functions ***

// *** Begin Demolish Functions
function createDemolishBtn() {
	_log(3,"Begin createDemolishBtn()");
	var xpathRes = xpath("//form[contains(@action,'build.php')]/select[@name='abriss']");
	if(xpathRes.snapshotLength > 0) {
		var oBtnWrapper = generateButton(aLangStrings[62],scheduleDemolish);
		xpathRes = xpathRes.snapshotItem(0).parentNode;
		xpathRes.insertBefore(oBtnWrapper,xpathRes.getElementsByClassName("clear")[0]);
	} else {
		xpathRes = $id("demolish");
		if ( xpathRes ) {
			var oBtnWrapper = generateButton(aLangStrings[62],scheduleDemolish);
			xpathRes.appendChild(oBtnWrapper);
			return;
		}
		_log(1, "The form cannot be found. Unable to add button. End createDemolishBtn().");
		return false;
	}
	_log(3,"End createDemolishBtn()");
}

function scheduleDemolish(e) {
	_log(3, "Start scheduleDemolish()");
	var BuildingId = xpath("//form//select[@name='abriss']"); //get the code
	if(BuildingId.snapshotLength > 0) {
		BuildingId = BuildingId.snapshotItem(0);
		var target = BuildingId.value;
		var w = BuildingId.selectedIndex;
		var data = document.getElementsByTagName("option");
		var BuildingName = "";
		for ( var i = 0,j = data.length ; i < j ; ++i ) BuildingName += "["+data[i].innerHTML + "]_";
	} else {
		var target = 19;
		var BuildingName = "";
		for ( var i = 19,j = 41 ; i < j ; ++i ) BuildingName += i+". "+aLangStrings[35]+" "+i+"_";
	}
	BuildingName = BuildingName.slice(0,-1);
	displayTimerForm(6,target,BuildingName);
	_log(3, "End scheduleDemolish()");
}

function demolish(aTask) {
	_log(3,"Begin demolish("+aTask+")");
	var aTaskDetails = getTaskDetails(aTask);
	printMsg(aLangStrings[6] + " > 1<br><br>" + aTaskDetails);

	//If need to change village, the link should like: build.php?newdid=144307&gid=15&id=26
	var oldVID = parseInt(aTask[5]);
	if (isNaN(oldVID)) oldVID = -2;
	if(oldVID > 0) var sNewDid = "newdid=" +oldVID+"&";
	else var sNewDid = "";
	//Loading the page once first, changing the active village at the same time
	var httpRequest = new XMLHttpRequest();
	var httpRequestString = fullName+"build.php?" + sNewDid + "gid=15";
	httpRequest.open("GET", httpRequestString, true);
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4) { //complete
			printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + aTaskDetails);
			if (httpRequest.status == 200 && httpRequest.responseText) { // ok
				var parser = new DOMParser();
				var holder = parser.parseFromString(httpRequest.responseText, "text/html");

				var reqVID = getActiveVillage(holder);

				if ( reqVID == oldVID && holder.getElementsByClassName("gid15").length == 1 ) {
					var tmp = holder.getElementById("demolish");
					var tmp2;
					if ( tmp && (tmp.tagName=='TABLE') ) {
						if(reqVID != currentActiveVillage) switchActiveVillage(currentActiveVillage);
						tmp2 = "["+trim(tmp.getElementsByTagName("td")[1].innerHTML)+"]";
						_log(1, "Demolish Building request was not sent. It appears we were already busy destroying a building. (No Link 1: "+tmp2+")");
						printMsg(aTaskDetails+" "+aLangStrings[68]+" "+aLangStrings[64]+" ("+aLangStrings[70]+" 1: It appears we were already busy destroying a building: "+tmp2+")", true); // Your building can't be demolished. No Link - Something is already being destroyed
						addToHistory(aTask, false, aLangStrings[70]+" 1: Already busy demolishing "+tmp2);
						return;
					}
					var sParams = {};
					sParams["villageId"] = reqVID;
					sParams["slotId"] = parseInt(aTask[2]);
					sParams["action"] = "demolishBuilding";
					post(fullName+"api/v1/building/demolish", JSON.stringify(sParams), handleRequestDemolish, aTask);
					return;
				}
				if ( reqVID != currentActiveVillage ) switchActiveVillage ( currentActiveVillage );
				_log(1, "Demolish Building request was not sent. It appears we were redirected when trying to load the Main Building page (Server: Redirected 1)");
				printMsg(aTaskDetails + ' ' + aLangStrings[9]+" "+aLangStrings[64]+" ("+aLangStrings[74]+" "+aLangStrings[11]+" 1)", true); // Your building can't be demolished.
				addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11]+" 1");
				return;
			}
			switchActiveVillage ( currentActiveVillage );
			_log(1, "Demolish Building request was not sent. Bad response from server when attempting to load the Main Building page (Server: Page Failed 1)");
			printMsg(aTaskDetails + ' ' + aLangStrings[64]+" ("+aLangStrings[74]+" "+aLangStrings[46]+" 1)", true); // Your building can't be demolished.
			addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[46]+" 1");
		}
	};
	httpRequest.send(null);
	_log(3,"End demolish("+aTask+")");
}

function handleRequestDemolish(httpRequest, aTask) {
	_log(3,"Begin handleRequestDemolish("+httpRequest+", "+aTask+")");
	if (httpRequest.readyState == 4) {
		var oldVID = parseInt(aTask[5]);
		if (isNaN(oldVID)) oldVID = -2;
		var aTaskDetails = getTaskDetails(aTask);
		if (httpRequest.status == 204) { // ok, no response from server
			printMsg(aTaskDetails + ' ' + aLangStrings[63]); // Your building is being demolished.
			addToHistory(aTask, true);
			return;
		}
		switchActiveVillage(currentActiveVillage);
		_log(1, "Demolish Building request was sent. Bad response from server when attempting to load the Main Building page for confirmation (Confirmation Failed, Server: Page Failed 2)");
		printMsg(aTaskDetails + ' ' + aLangStrings[64]+" ("+aLangStrings[75]+", "+aLangStrings[74]+" "+aLangStrings[46]+" 2)", true); // Your building can't be demolished.
		addToHistory(aTask, false, aLangStrings[75]+", "+aLangStrings[74]+" "+aLangStrings[46]+" 2");
	}
}
// *** End Demolish Functions ***

// *** Begin Send Merchants Functions ***
function createMarketLinks() {
	_log(2,"CreateMarketLinks> Begin.");
	var tOK = xpath("//form//button[contains(@class,'send')]", $id("content"));
	if( tOK.snapshotLength != 1 ) {
		_log(1,"CreateMarketLinks> This is not the marketplace.");
		return false;
	}
	tOK = tOK.snapshotItem(0);
	var oBtn = generateButton(aLangStrings[16], scheduleMerchant);
	tOK.parentNode.appendChild(oBtn);
	_log(2,"CreateMarketLinks> End.");
}

function scheduleMerchant(e) {
	_log(1,"scheduleMarket> Begin.");
	var basee = $id('marketplaceSendResources');
	var tXX = parseInt($gt('input',$gc('coordinateX',basee)[0])[0].getAttribute("value"));
	var tYY = parseInt($gt('input',$gc('coordinateY',basee)[0])[0].getAttribute("value"));
	var tData = [tXX,tYY,0,0,0,0,iSiteId];

	var tmp,tmp2,isEmpty = true;
	var resnames = ["lumber","clay","iron","crop"];
	for ( var i = 0 ; i < 4 ; ++i ) {
		tmp = $gn(resnames[i],basee)[0];
		tmp2 = parseInt(tmp.value);
		if ( isNaN(tmp2) || tmp2 < 1 ) continue;
		tData[i+2] = tmp2;
		isEmpty = false;
	}
	if ( isNaN(tXX) || Math.abs(tXX) > mapRadius || isNaN(tYY) || Math.abs(tYY) > mapRadius || isEmpty ){
		printMsg(aLangStrings[65], true);
		_log(1, "scheduleMarket> Improper data or building ID not found. End.");
		return false;
	}
	displayTimerForm(7, coordsXYToZ(tXX,tYY), tData);
	_log(2,"scheduleMarket> End.");
}

function merchant(aTask) {
	_log(1,"SendMerchant> Begin. aTask = " + aTask);
	printMsg(aLangStrings[6] + " > 1<br><br>" + getTaskDetails(aTask));
	var opts = aTask[3].split("_");
	var nid = parseInt(aTask[5]);
	var target = parseInt(aTask[2]);
	var sUrl = "build.php?"+(isNaN(nid)?"":("newdid="+nid+"&")) + "t=5&gid=17" + ( (isNaN(target) || target < 1 || target > 641601) ? "" : "&z="+target );
	get(fullName+sUrl, handleMerchantRequest1, aTask);
	_log(2,"SendMerchant> End.");
}

function handleMerchantRequest1(httpRequest, aTask) {
	_log(3,"handleMerchantRequest1> Begin.");
	if (httpRequest.readyState == 4) {
		printMsg(aLangStrings[6] + " > 1 > 2<br><br>" + getTaskDetails(aTask));
		var oldCoords = aTask[3].split("_");
		oldCoords = "(" + oldCoords[0] + "|" + oldCoords[1] + ")";
		var oldName = getVillageNameZ(parseInt(aTask[2]));
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;
		if (httpRequest.status == 200 && httpRequest.responseText ) { // ok
			var sParams = {};
			//var parser = new DOMParser();
			//var holder = parser.parseFromString(httpRequest.responseText, "text/html");
			//var marketForm = holder.getElementById('marketplaceSendResources');
			//var tInputs = marketForm.getElementsByTagName('input');
			//var reqVID = getActiveVillage(holder);
			var opts = aTask[3].split("_");
			sParams = '{"action":"marketPlace","resources":{"lumber":'+opts[2]+',"clay":'+opts[3]+',"iron":'+opts[4]+',"crop":'+opts[5]+'},"destination":{"x":'+opts[0]+',"y":'+opts[1]+'},"runs":1,"useTradeShips":false}';
			/*
			if ( tInputs.length > 3 && holder.getElementsByClassName("gid17").length == 1 && reqVID == oldVID ) {
				var maxM = 20;
				var maxC = 500;
				var resNow = [Infinity,Infinity,Infinity,Infinity];
				tX = [500,1000,750,0,0,500,750,500];
				tY = getOption("RACE", -1, "integer");
				if( tY > -1 ) maxC = tX[tY];
				tX = $gc('merchantsAvailable',holder)[0];
				if( tX ) maxM = parseInt(tX.innerHTML.onlyText());
				tX = $gc('max',holder)[0];
				if( tX ) maxC = parseInt(tX.innerHTML.match(/>\(?(\d+)\)?</)[1]);
				maxC *= maxM;
				_log(3,"Merchants available:"+maxM+", total capacity:"+maxC);
				for( var i = 0; i < 4; i++ ) {
					tX = xpath('.//span[@id="l'+(1+i)+'"]',holder,true);
					if( tX ) {
						tX = tX.innerHTML.split("/");
						tY = parseInt(tX[0]);
						if( !isNaN(tY) ) resNow[i] = tY;
					}
				}
				_log(3,"Resources available:"+resNow.join(','));
				var opts = aTask[3].split("_");
				var tX = 0;
				sParams["x2"] = 1;
				for (var q = 0 ; q < tInputs.length ; ++q) {
					switch ( tInputs[q].id ) {
						case "r1":		if ( parseInt(opts[2]) ) {
											tY = parseInt(opts[2]);
											if( tY > resNow[0] ) tY = resNow[0];
											if( tY + tX > maxC ) tY = maxC - tX;
											tX += tY; opts[2] = tY;
											sParams["r1"] = tY.toString();
										} else {
											sParams["r1"] = "";
										}
										break;
						case "r2":		if ( parseInt(opts[3]) ) {
											tY = parseInt(opts[3]);
											if( tY > resNow[1] ) tY = resNow[1];
											if( tY + tX > maxC ) tY = maxC - tX;
											tX += tY; opts[3] = tY;
											sParams["r2"] = tY.toString();
										} else {
											sParams["r2"] = "";
										}
										break;
						case "r3":		if ( parseInt(opts[4]) ) {
											tY = parseInt(opts[4]);
											if( tY > resNow[2] ) tY = resNow[2];
											if( tY + tX > maxC ) tY = maxC - tX;
											tX += tY; opts[4] = tY;
											sParams["r3"] = tY.toString();
										} else {
											sParams["r3"] = "";
										}
										break;
						case "r4":		if ( parseInt(opts[5]) ) {
											tY = parseInt(opts[5]);
											if( tY > resNow[3] ) tY = resNow[3] - 10;
											if( tY < 0 ) tY = 0;
											if( tY + tX > maxC ) tY = maxC - tX;
											tX += tY; opts[5] = tY;
											sParams["r4"] = tY.toString();
										} else {
											sParams["r4"] = "";
										}
										break;
						default:		if (tInputs[q].name != "action") sParams[tInputs[q].name] = tInputs[q].value;
										break;
					}
				}
				var tSelect = marketForm.getElementsByTagName('select');
				for (var q = 0 ; q < tSelect.length ; q++) {
					sParams[tSelect[q].name] = tSelect[q].options[tSelect[q].selectedIndex].value;
				}
				aTask[3] = opts.join("_");
				aTask[5] = reqVID;
				_log(3,"sParams:"+sParams);
				post(fullName+'api/v1/marketplace/prepare', JSON.stringify(sParams), handleMerchantRequest2, aTask);
				return;
			}
			*/
			_log(3,"sParams:"+sParams);
			put(fullName+'api/v1/marketplace/resources/send', sParams, handleMerchantRequest2, aTask);
			return;

			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br>"+ aLangStrings[73] + " (" + aLangStrings[74]+" "+aLangStrings[11]+ " 1)",true); //Your merchants didnt send. (Server: Redirected)
			_log(1,"Your merchants were not sent. I was redirected before I could send the first request to send the merchant. Server: Redirected 1. From: " + getVillageName(oldVID) + "   To: " +oldName + " " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
			addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11] + " 1");
			return;
		}
		switchActiveVillage(currentActiveVillage);
		printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br>"+ aLangStrings[73] + " (" + aLangStrings[74]+" "+aLangStrings[46] + " 1)",true); //Your merchants didnt send. (Server: Page Failed)
		_log(1,"Your merchants were not sent. The server returned a non-200 code (or the request was empty) upon trying to load the marketplace page.  Server: Page Failed 1. From: " + getVillageName(oldVID) + "   To: " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
		addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[46]+" 1");
	}
}

function handleMerchantRequest2(httpRequest, aTask) {
	if (httpRequest.readyState == 4) {
		printMsg(aLangStrings[6] + " > 1 > 2 > 3<br><br>" + getTaskDetails(aTask));
		var options = new Array();
		options.push(aTask);
		var oldCoords = aTask[3].split("_");
		oldCoords = "(" + oldCoords[0] + "|" + oldCoords[1] + ")";
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;
		var oldName = getVillageNameZ(parseInt(aTask[2]));

		if (httpRequest.status == 200 && httpRequest.responseText) { // ok
			nonceValue = httpRequest.getResponseHeader('X-Nonce');
			var opts = aTask[3].split("_");
			sParams = '{"action":"marketPlace","resources":{"lumber":'+opts[2]+',"clay":'+opts[3]+',"iron":'+opts[4]+',"crop":'+opts[5]+'},"destination":{"x":'+opts[0]+',"y":'+opts[1]+'},"runs":1,"useTradeShips":false}';
			_log(3,"sParams:"+sParams);
			
			post(fullName+'api/v1/marketplace/resources/send', sParams, handleMerchantRequestConfirmation, aTask);
			return;
			var sParams = {};
			var holder = document.createElement('div');
			var marketData = JSON.parse(httpRequest.responseText);

			var reqVID = aTask[5];
			var tTime = marketData["errorMessage"];
			if ( tTime.length > 0 ) {
				if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
				_log(1, "handleMerchantRequest2> I could not send the Merchants. Reason: " + tTime);
				printMsg(getVillageName(aTask[5])+ "<br>" + aLangTasks[7] + " >> " + getVillageNameZ(parseInt(aTask[2])) + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br> " + aLangStrings[69] + " (" + tTime +")",true); //Your merchants didnt send. (Server: Redirected)
				addToHistory(aTask, false, tTime);
				return;
			}

			holder.innerHTML = marketData["formular"];
			tTime = holder.getElementsByClassName("res_target");
			sParams["checksum"] = marketData["checksum"];
			var tInputs = holder.getElementsByTagName('input');
			if ( tTime.length > 0 && tInputs.length > 4 && reqVID == oldVID) {
				tTime = tTime[0].getElementsByTagName("td");
				options.push(parseInt(tTime[2].innerHTML.replace(/:/g,""),10));
				options.push(tTime[0].getElementsByClassName("coordinates coordinatesWrapper")[0].innerHTML);
				for (var q = 0 ; q < tInputs.length ; ++q) {
					if( tInputs[q].name == "dname" ) continue;
					if( tInputs[q].name == "checksum" ) continue;
					if( tInputs[q].name == "action" ) { sParams["action"] = "traderoute"; continue; }
					if( tInputs[q].name == "x2" ) {
						if (tInputs[q].checked) {
							sParams["x2"] = "2";
						} else {
							sParams["x2"] = "1";
						}
						continue;
					}
					sParams[tInputs[q].name] = tInputs[q].value;
				}
				var opts = aTask[3].split("_");
				sParams["r1"] = parseInt(opts[2]) ? opts[2] : ""; sParams["r2"] = parseInt(opts[3]) ? opts[3] : ""; sParams["r3"] = parseInt(opts[4]) ? opts[4] : ""; sParams["r4"] = parseInt(opts[5]) ? opts[5] : "";
				_log(3,"sParams:"+sParams);
				post(fullName+'api/v1/marketplace/prepare', JSON.stringify(sParams), handleMerchantRequestConfirmation, options);
				return;
			}
			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + options[2] + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br>"+ aLangStrings[73] + " (" + aLangStrings[74]+" "+aLangStrings[11] + " 2)",true); //Your merchants didnt send. (Server: Redirected)
			_log(1,"Your merchants were not sent. I was redirected before I could send the final request to send the merchant. Server: Redirected 2. From: " + getVillageName(oldVID) + "   To: " +options[2] + " " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
			addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[11]+" 2");
			return;
		}
		switchActiveVillage(currentActiveVillage);
		printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName +" "+ oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br>"+ aLangStrings[73] + " (" + aLangStrings[74]+" "+aLangStrings[46] + " 2)",true); //Your merchants didnt send. (Server: Page Failed)
		_log(1,"Your merchants were not sent. The server returned a non-200 code (or the request was empty) before I could send the final request to send the merchant.  Server: Page Failed 2. From: " + getVillageName(oldVID) + "   To: " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
		addToHistory(aTask, false, aLangStrings[74]+" "+aLangStrings[46]+" 2");
	}
}

function handleMerchantRequestConfirmation(httpRequest, options) {
	_log(2,"handleMerchantRequestConfirmation> Begin. options = " + options);
	if (httpRequest.readyState == 4) {
		var aTask = options;
		var oldName = getVillageNameZ(parseInt(options[2]));
		var oldCoords = aTask[3].split("_");
		oldCoords = "(" + oldCoords[0] + "|" + oldCoords[1] + ")";
		var oldVID = parseInt(aTask[5]);
		if ( isNaN(oldVID) ) oldVID = -2;
		if ( httpRequest.status == 200 || httpRequest.status == 204 ) { // ok
			printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) ); //Your merchants were sent.
			_log(1,"Your merchants were sent. From: " + getVillageName(oldVID) + "   To: " +oldName + " " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
			addToHistory(aTask, true);
			return
			var holder = document.createElement('div');
			var marketData = JSON.parse(httpRequest.responseText);
			
			holder.innerHTML = marketData["formular"];
			var reqVID = aTask[5];
			if ( reqVID != currentActiveVillage ) switchActiveVillage(currentActiveVillage);
			if ( marketData["notice"].length > 0 ) {
				if(	marketData["errorMessage"].length == 0 ) {
					printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) ); //Your merchants were sent.
					_log(1,"Your merchants were sent. From: " + getVillageName(oldVID) + "   To: " +oldName + " " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
					addToHistory(aTask, true);
				} else {
					printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br>"+aLangStrings[50]+" ("+aLangStrings[75]+")",true); //Your merchants didnt send. Confirmation failed
					_log(1,"Your merchants were NOT sent. Didnt see it on marketplace, could have actually been successfull if there was a long delay. Confirmation Failed.From: " + getVillageName(oldVID) + "   To: " +oldName + " " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
					addToHistory(aTask, false, aLangStrings[75]);
				}
			} else {
				printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br>"+ aLangStrings[73] + " (" +aLangStrings[75]+", "+ aLangStrings[74]+" "+aLangStrings[11] + " 3)",true); //Your merchants didnt send. (Server: Redirected)
				_log(1,"Request sent, however, I am unable to confirm it. My confirmation page was redirected. Confirmation Failed, Server: Redirected 3. From: " + getVillageName(oldVID) + "   To: " +oldName + " " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
				addToHistory(aTask, false, aLangStrings[75] + ", " +aLangStrings[74]+" "+aLangStrings[11] + " 3");
			}
			return;
		}
		switchActiveVillage(currentActiveVillage);
		printMsg(getVillageName(oldVID)+ "<br>" + aLangTasks[7] + " >> " + oldName + " " + oldCoords + "<br>" + getMerchantInfo(aTask[3]) + "<br>"+ aLangStrings[50] +" " + aLangStrings[73] + " (" + aLangStrings[75] + ", " + aLangStrings[74]+" "+aLangStrings[46] + " 3)",true); //Your merchants didnt send. (Server: Page Failed)
		_log(1,"Request sent, however, I am unable to confirm it. The server returned a non-200 code (or the request was empty) after I sent the request. Confirmation Failed, Server: Page Failed 3. From: " + getVillageName(oldVID) + "   To: " +oldName + " " + oldCoords + " carrying " + getMerchantInfo(aTask[3]) );
		addToHistory(aTask, false, aLangStrings[75] + ", " + aLangStrings[74]+" "+aLangStrings[46]+" 3");
	}
}
// *** End Send Merchant Functions ***
// ****** END TTQ TASK FUNCTIONS ******

//  *** BEGIN Timer Form Code ***
/**************************************************************************
 * @param iTask: 0 - build, 1 - upgrade, 2 - attack,raid,support, 3 - research, 4 - train troops, 6 - demolish, 7 - Send Merchants, 8 - Send Troops Back
 * @param target: sitedId for iTask = 0 or 1; iVillageId for siteId = 2
 * @param options: buildingId for iTask = 0; troops for attacks.
 * @param timestamp: if it is passed, suggest the time calculated from this (Caution! It is in seconds).
 * @param taskindex: (optional) task index for editing tasks
 * @param villagedid: (optional) the original task's corresponding village (default: current village)
 * This function functions both as a Listener for Build later and Upgrade later links,
 * and as regular function when arguments are supplied (in case of scheduling attacks and editing existing tasks).
 * @param buildingGID: building gid
 ***************************************************************************/
function displayTimerForm(iTask, target, options, timestamp, taskindex, villagedid, buildingGID) {
	_log(3,"Begin displayTimerForm("+iTask+", "+target+", "+options+", "+timestamp+", "+taskindex+", "+villagedid+")");
	var iVillageId = typeof(villagedid) != 'undefined' ? villagedid : currentActiveVillage;
	// For build and upgrade, we need to extract arguments from the event object
	if((typeof(iTask) == 'object' || iTask < 2) && target == null) {  //if params are supplied, we do not extract them from the event object target (link)
		var el = iTask.target;  // iTask really is the Event object!
		var iTask = parseInt(el.getAttribute("itask"));
		var target = el.getAttribute("starget");
		var options = el.getAttribute("soptions");
		if(iTask == undefined || target == undefined || options == undefined) {
			_log(2, "Missing arguments:\niTask="+iTask+"\ntarget="+target+"\noptions="+options);
			return false;
		}
	}
	_log(2, "Arguments:\niTask="+iTask+"\ntarget="+target+"\noptions="+options);
	var sTask = '';
	var sWhat = '';
	var sMoreInfo = '';
	var sWho = '<span id="ttq_placename_' +iVillageId+ '">'+getVillageName(iVillageId)+':</span>';
	if (typeof(options) != 'object') options = options.split("_");
	switch(iTask) {
		case 0:  //build
		case 1:  //upgrade
			sWhat = "- "+options[1];
			sTask = aLangTasks[iTask];
			sMoreInfo = aLangStrings[35] + " " +target;
			break;
		case 2:  //Attack, Raid, Support
			var iAttackType = parseInt(options[0]);
			var langStringNo = iAttackType == 5 ? 20 : iAttackType == 3 ? 21 : 22;
			var bLetsSpy = (iAttackType < 5 && onlySpies(options));
			sWhat = ( bLetsSpy ? aLangStrings[47] : aLangStrings[langStringNo] )+' >> <span id="ttq_placename_' +target+ '">' +getVillageNameZ(target)+ '</span>';
			var bCatapultPresent = (options[8] > 0) ? true : false;
			if(options[11] == undefined) options[11] = 0;  //if no heros are specified, set them to zero
			sMoreInfo = getTroopsInfo(options);
			break;
		case 3:  //Research
			sWhat = "- "+options[2];
			sTask = aLangTasks[options[1]];
			break;
		case 4:  //Training
			sWhat = "" + (options[12] > 0 ? aLangTroops[11] : aLangStrings[49]);
			sTask = aLangTasks[4];
			sMoreInfo = getTroopsInfo(options);
			break;
		case 5:  //Party
			sWhat = aLangStrings[53];
			sTask = aLangTasks[5];
			break;
		case 6:  //Demolish
			sWhat = '<select name="abriss" onchange="var t = document.getElementsByName(\'timerTarget\'); if ( t.length > 0 ) t[0].value = this.value; t = document.getElementById(\'timerMoreInfo\'); if ( t ) { var k = t.innerHTML.split(\' \'); k.pop(); k.push(this.value); t.innerHTML = k.join(\' \'); }">';
			target = parseInt(target);
			if (isNaN(target)) target = -1;
			for ( tX = 0, tY = options.length ; tX < tY ; ++tX ) {
				tA = parseInt(options[tX].replace("[",""));
				sWhat += '<option value="' +tA+ '" '+( tA == target ? 'selected' : '' )+'>'+options[tX]+'</option>';
			}
			sWhat = "- " + sWhat + "</select>";
			sTask = aLangTasks[6] + ": ";
			sMoreInfo = aLangStrings[35] + " " +target;
			break;
		case 7:  //Send Merchants
			sTask = aLangTasks[7];
			sWhat = " >> " + getVillageNameZ(target);
			sMoreInfo = getMerchantInfo(options);
			break;
		case 8: // Send Back Troops
			sTask = aLangTasks[8];
			sWhat = " >> " + target;
			sMoreInfo = getTroopsInfo(options);
			break;
		case 9: // Send troops through Gold-Club
			var sTask = getOption('FARMLIST','');
			if( sTask == '' ) {
				sTask = $gc('tabItem',$gc('favorKey99')[0])[0].textContent;
				setOption('FARMLIST',sTask);
			}
			sWhat = " >> " + target;
			var tA = $gc('iReport1');
			//if( tA.length > 0 ) {
			//	tA = tA[0].getAttribute('alt');
			//	sWhat += ' >> <img class="iReport iReport1" src="img/x.gif" title="' + tA +
			//	'" alt="' + tA + '"><input type="checkbox" "checked">';
			//}
			/* добавлять код надо ниже, там, где каты. Это будут 6й,7й,8й элемент. Обязательно дать name для 6го.
			 * затем в функции ниже парсить. Перевод надо добавить. Лучше не ловить с сервера.
			 */
			break;
	}

	var oTimerForm = document.createElement("form");
	oTimerForm.setAttribute('name','myForm');
	//Suggest the current time. Can be local or server time.
		var sTimeType = "This is your local time.";

		if(timestamp) var date = new Date(timestamp * 1000);
		else var date = new Date();
		var dd = date.getDate();
		var mm = date.getMonth() + 1;
		var yyyy = date.getFullYear();
		var hh = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();

		//Convert small numbers to conventional format
		var sTime = formatDate(yyyy, mm, dd, hh, min, sec);
	// Allow target selection for catapults if this is Normal Attack and at least 1 cata is sent
	var sCataTargets = '';
	if(iTask == 2 && iAttackType == 3 && bCatapultPresent) {
		var sCataOptions = "";
		for(var j=1; j < aLangBuildings.length; ++j) {
			if (j==12 || j==23 || j==31 || j==32 || j==33 || j==34 || j==36 || j==42 || j==43) continue; //skip walls and untargetable buildings
			sCataOptions += '<option value="' +j+ '">' +aLangBuildings[j]+ '</option>';
		}
		sCataTargets = '<select name="kata"><option value="99">' +aLangStrings[24]+ '</option>' + sCataOptions + '</select>';
		if ( options[8] >= 20 ) sCataTargets += '<select name="kata2"><option value="0"></option><option value="99">' +aLangStrings[24]+ '</option>' + sCataOptions + '</select>';
	}
	//Allow specifying the spying mode (only if there is nothing but spies being sent and if this is not a support)
	var sSpyMode = '';
	if(iTask == 2 && bLetsSpy) sSpyMode = '<input type="radio" name="spy" value="1" checked>' +aLangStrings[31]+ ' <input type="radio" name="spy" value="2">' +aLangStrings[32];
	oTimerForm.id = "timerForm";
	oTimerForm.setAttribute("onsubmit", "return false;");
	//Use img tag directly
	var sLinkClose = "<img src='" +sCloseBtn+ "' alt='["+aLangStrings[56]+"]' title='"+aLangStrings[56]+"' id='ttq_close_btn' class='ttq_close_btn' onclick='document.body.removeChild(document.getElementById(\"timerform_wrapper\"));' />";
	if (typeof(options) == "object") options = options.join("_");
	oTimerForm.innerHTML =
	/* 0 */ '<input type="hidden" name="timerTask" value="' +iTask+ '" />' +
	/* 1 */	'<input type="hidden" name="timerTarget" value="' +target+ '" />' +
	/* 2 */	'<input type="hidden" name="timerOptions" value="'+options+'" />'+sWho+'<br /><br />' +sTask+ ' ' +sWhat+ '<br /><br /><span style="display:inline-block;">' + aLangStrings[25] + '</span>' +
	/* 3 */ ' <input name="TTQat" type="text" id="TTQat" style="width:145px;" value="' +sTime+ '" onmousedown="dragObject = null;" onfocus="document.getElementById(\'TTQafter\').value = \'\'; this.value=\'' +sTime+ '\'" title="' +sTimeType+ '" /><span>' + aLangStrings[26] + '</span>' +
	/* 4 */ ' <input name="TTQafter" type="text" id="TTQafter" style="width:145px;" onmousedown="dragObject = null;" onmousemove="dragObject = null;" onmouseup="dragObject = null;" onfocus="document.getElementById(\'TTQat\').value = \'\';" />' +
	/* 5 */	'<select name="timeUnit"><option value="1">' + aLangStrings[27]
	+ '</option><option value="60" selected="selected">' + aLangStrings[28]
	+ '</option><option value="3600">' + aLangStrings[29]
	+ '</option><option value="86400">' + aLangStrings[30]
	+ '</option></select><span id="timerMoreInfo" style="font-size:85%;color:red; cursor:default;display:block;">' +sMoreInfo+ '</span>';

	/* 6,7*/if(sCataTargets != '') oTimerForm.innerHTML += '<p>' + aLangStrings[23] + ': ' +sCataTargets+ ' </p>';
	/* 6,7*/if(sSpyMode != '') oTimerForm.innerHTML += '<p>' +sSpyMode+ '</p>';

	// if taskindex is set, we are editing a task
	if (typeof(taskindex) != 'undefined') sSubmitButtonLabel = aLangStrings[58];
	else sSubmitButtonLabel = "OK";
	var oSubmitBtn = $e("input",[['name',"submitBtn"],['id',"submitBtn"],['type',"submit"],['style','border:1px solid darkgray;background-color:#ccc;margin-top:2px;']]);
	oSubmitBtn.value = sSubmitButtonLabel;
	ttqAddEventListener(oSubmitBtn, 'click', function() {handleTimerForm(this.form, 1, taskindex, iVillageId, buildingGID)}, true);
	/* 8 */oTimerForm.appendChild(oSubmitBtn);

	// Add buttons if editing
	if (typeof(taskindex) != 'undefined') {
		var oAddCloseBtn = $e("input",[['name',"AddCloseBtn"],['value',aLangStrings[59]],['type',"button"]]);
		ttqAddEventListener(oAddCloseBtn, 'click', function() {handleTimerForm(this.form, 2, taskindex, iVillageId, buildingGID)}, true);
		oTimerForm.appendChild(oAddCloseBtn);

		var oAddBtn = $e("input",[['name',"AddBtn"],['value',aLangStrings[60]],['type',"button"]]);
		ttqAddEventListener(oAddBtn, 'click', function() {handleTimerForm(this.form, 3, taskindex, iVillageId, buildingGID)}, true);
		oTimerForm.appendChild(oAddBtn);
	}

	var oTitle = document.createElement("div");
	oTitle.id="timerform_title";
	oTitle.innerHTML = sLinkClose + "<span style='font-weight: bold;'>" + aLangStrings[57] + "<span>";
	oTitle.style.margin="10px 20px";
	oTitle.setAttribute("class", "handle");
	//oTitle.setAttribute("onmousedown", "return false;");

	var oWrapper = $e("div",[['id',"timerform_wrapper"]]);
	oWrapper.appendChild(oTitle);
	oWrapper.appendChild(oTimerForm);

	//position
	var formCoords = getOption("FORM_POSITION", "215px_215px");
	formCoords = formCoords.split("_");
	oWrapper.style.top = formCoords[0];
	oWrapper.style.left = formCoords[1];

	document.body.appendChild(oWrapper);
	makeDraggable($id("timerform_title"));
	_log(3, "End displayTimerForm()");
	return false;
}
/**************************************************************************
* 0 = timerTask, 1 = timerTarget, 2 = timerOptions, 3 = at, 4 = after
* 5 = timeUnit, 6 = OK - true - 1, 7 = undefined - false - 2, 8 = undefined - OK
/**************************************************************************/
function handleTimerForm(oForm, iAction, taskindex, villagedid, buildingGID) {
	_log(3,"Begin handleTimerForm()");
	var iTaskTime = [];
	var at = oForm.elements["TTQat"].value;
	if(at == '') { // When you type in, say, 13 minutes
		var after = oForm.elements["TTQafter"].value;
		var timeUnit = oForm.elements["timeUnit"].value;
		var oDate = new Date();  // current GMT date. TODO: server time

		if (after.indexOf(",") > -1) {
			var arrafter = after.split(",");
			for (var i=0; i<arrafter.length; i++) {
				iTaskTime[i] = Math.floor(oDate.getTime()/1000 + arrafter[i]*timeUnit + ttqRandomNumber());
			}
		} else {
			iTaskTime[0] = Math.floor(oDate.getTime()/1000 + after*timeUnit);
		}
	} else {// when you use the specific time
		// convert formatted date to milliseconds
		var re = new RegExp("^(2[0-9]{3})/([0-9]{1,2})/([0-9]{1,2}) ([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})$", "i");
		var aMatch = at.match(re);
		if(!aMatch) {
			_log(1, "You entered an invalid date format!");
			return;
		}
		for(var i = 2; i < aMatch.length; ++i) {
			// convert strings to integers
			if(aMatch[i].match(/0[0-9]{1}/i)) {aMatch[i] = aMatch[i].substring(1);}
			aMatch[i] = parseInt(aMatch[i]);
		}

		// Time zone conversions
		if(bUseServerTime) { //server time
			var iServerTimeOffset = getServerTimeOffset();
			if(iServerTimeOffset == -999) {  //problem. do nothing.
				_log(2, "We could not schedule this task, because we were unable to determine server's timezone.");
				printMsg("We could not schedule this task, because we were unable to determine server's timezone.", true);
				return false;
			}

			var oTaskDate = new Date(aMatch[1],aMatch[2]-1,aMatch[3],aMatch[4],aMatch[5],aMatch[6]);  //server time in local offset
			var newtimestamp = oTaskDate.getTime() - (oTaskDate.getTimezoneOffset() * 60000);  //server time in server's timezone
			newtimestamp = newtimestamp - (iServerTimeOffset * 3600000);  //get the UTC server time for this task
			iTaskTime[0] = Math.floor( newtimestamp/1000 );  //convert to seconds
		} else {  //local time
			var oDate = new Date(aMatch[1],aMatch[2]-1,aMatch[3],aMatch[4],aMatch[5],aMatch[6]);
			iTaskTime[0] = Math.floor(oDate.getTime()/1000);
		}
	}
	//Remove the form unless "add" is clicked
	if (iAction === 1 || iAction === 2) document.body.removeChild($id('timerform_wrapper'));
	_log(2, "Task will be scheduled for " +iTaskTime);  // The stored time is the absolute Unix GMT time.
	n = oForm.elements["timerOptions"].value.split("_");
	if ( typeof(oForm.elements["spy"]) != "undefined" ) { //We spy
		if ( oForm.elements["spy"].value == 1 ) n[14] = 1;
		else n[14] = 2;
	} else if ( typeof(oForm.elements["kata"]) != "undefined" ) { //We kata
		if ( oForm.elements["kata"].value > 0 ) n[15] = oForm.elements["kata"].value; //store catapults targets
		if(typeof(oForm.elements["kata2"]) != "undefined" && oForm.elements["kata2"].value > 0) n[16] = oForm.elements["kata2"].value;//store catapults targets
	} else if ( typeof(oForm.elements["abriss"]) != "undefined" ) { //We Demo
		n = new Array();
		var tO = oForm.elements["abriss"].getElementsByTagName("option");
		for ( var i = 0, j = tO.length ; i < j ; ++i ) n.push(tO[i].innerHTML);
	}
	oForm.elements["timerOptions"].value = n.join("_");

	// Added taskindex and villagedid, unset taskindex if adding new task
	//Also disabling the "edit" button when clicking the add button
	if (iAction === 2 || iAction === 3) {
		taskindex = undefined;
		at = $id('submitBtn');
		if ( at != null ) at.disabled=true;
	}
	for (var i=0; i<iTaskTime.length; i++) {
		if ( iTaskTime[i] ) setTask(oForm.elements["timerTask"].value, iTaskTime[i], oForm.elements["timerTarget"].value, oForm.elements["timerOptions"].value, taskindex, villagedid, i==iTaskTime.length-1 ? true : false, buildingGID );
	}

	_log(3, "End handleTimerForm()");
}
/**************************************************************************
  * Schedules the specified task. The task is stored in a variable.
  * @param iTask: name of the task (0-build, 1-upgrade, 2-attack, 3-research, 4-train)
  * @param iWhen: date when the task is to be triggered
  * @param target: iBuildingId, or iVillageId
  * @param options: what to build, what units to send attacking (first member specifies the type of attack: 0-support, 1-normal attack, 2-raid).
  ***************************************************************************/
function setTask(iTask, iWhen, target, options, taskindex, villagedid, refreshTask, buildingGID) {
	var iVillageId = typeof(villagedid) != 'undefined' ? villagedid : currentActiveVillage;
	if(bLocked) {
		_log(3, "The TTQ_TASKS variables is locked. We are not able to write it. The Task could not be scheduled.");
		printMsg(getVillageName(iVillageId)+ "<br>" +aLangStrings[12], true);
		return false;
	}

	bLocked = true;
	var data = getVariable("TTQ_TASKS");
	var aTasks = data.split("|");
	var iTaskIndex = typeof(taskindex) != 'undefined' ? taskindex : aTasks.length;
	var newValue = iTask + ',' + iWhen + ',' + target.replace('|','&#124;').replace(',','&#44;') + ',' + options + ',' + buildingGID;
	if ( iVillageId > 0 ) newValue += ',' + iVillageId;
	else newValue += ',' + 'null';
	if (data=="") {
		data = newValue;
		aTasks = data.split("|");
	} else {
		aTasks.splice(iTaskIndex, (typeof(taskindex) != 'undefined' ? 1 : 0), newValue);  //replace/add the task
		data = aTasks.join("|");
	}
	_log(1, "Writing task list: "+data);
	setVariable("TTQ_TASKS", data);
	bLocked = false;
	if (refreshTask) refreshTaskList(aTasks);
	// Generate message
	var sTaskSubject = "";
	var sTask = "";
	switch(iTask) {
		case "0":  //build
		case "1":  //upgrade
			sTaskSubject = "- "+options.split("_")[1];
			sTask = aLangTasks[iTask];
			break;
		case "2":  //attack
			sTaskSubject = ' >> <span id="ttq_placename_' +target+ '">' +getVillageNameZ(target)+ '</span>';
			var aTroops = options.split("_");
			var iIndex = parseInt(aTroops[0]);
			var langStringNo = iIndex == 5 ? 20 : iIndex == 3 ? 21 : 22;
			if((iIndex == 3 || iIndex == 4) && onlySpies(aTroops) ) {
				sTask = aLangStrings[47];
				sTaskSubject = " "+aTroops[14]+" "+sTaskSubject;
			} else { sTask = aLangStrings[langStringNo]; }
			break;
		case "3":  //research
			var aOptions = options.split("_");
			sTaskSubject = "- "+aOptions[2];
			sTask = aLangTasks[aOptions[1]];
			break;
		case "4":  //training
			var aTroops = options.split("_");
			sTaskSubject = ' ' + getTroopsInfo(aTroops);
			sTask = aLangTasks[4];
			break;
		case "5":  //party
			sTaskSubject = ' ' + aLangStrings[53];
			sTask = aLangTasks[5];
			break;
		case "6":  //Demolish [ALPHA]
			var tO = options.split("_");
			sTaskSubject = "A building";
			target = parseInt(target);
			for ( var i = 0,k = tO.length ; i < k ; ++i ) {
				if ( parseInt(tO[i].replace(/\[/g,"")) == target ) {
					sTaskSubject = "- "+tO[i];
					i = k;
				}
			}
			sTask = aLangTasks[6];
			break;
		case "7": //Send Merchants
			sTask = aLangTasks[7];
			var opts = options.split("_");
			sTaskSubject = ": " + getVillageName(iVillageId) + " >> " + getVillageNameXY(opts[0],opts[1]) + "<br>" + getMerchantInfo(opts);
			break;
		case "8": //Send Back/Withdraw
			sTask = aLangTasks[8];
			var opts = options.split("_");
			sTaskSubject = " >> " + target + "<br>" + getTroopsInfo(opts) ;
			break;
		case "9": // Send troops through Gold-Club
			sTask = getOption('FARMLIST','');
			var opts = options.split("_");
			sTaskSubject = " >> " + target + " ";
			break;
		default:
			break;
	}

	printMsg(getVillageName(iVillageId,true) + '<br/>' + aLangStrings[10] + '<br/>' +sTask+ ' ' +sTaskSubject);
	if(!oIntervalReference) {
		oIntervalReference = window.setInterval(checkSetTasks, CHECK_TASKS_EVERY*1000);  //start checking if there is any task to trigger
		_log(2, "Started checking for the set tasks...");
	}
	ttqUpdatePanel(data);

	_log(3, "End setTask()");
}
// *** End Timer Form Code ***

// *** Begin Drag n Drop (move TTQ windows) Block ***
var mouseOffset = null;
var iMouseDown  = false;
var lMouseState = false;
var dragObject  = null;
var curTarget   = null;

function mouseCoords(ev){
	return {x:ev.pageX, y:ev.pageY};
}

function getMouseOffset(target, ev){
	var docPos    = getPosition(target);
	var mousePos  = mouseCoords(ev);
	return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}

function getPosition(e){
	var left = 0;
	var top  = 0;
	while (e.offsetParent){
		left += e.offsetLeft + (e.currentStyle?(parseInt(e.currentStyle.borderLeftWidth)).NaN0():0);
		top  += e.offsetTop  + (e.currentStyle?(parseInt(e.currentStyle.borderTopWidth)).NaN0():0);
		e     = e.offsetParent;
	}
	left += e.offsetLeft + (e.currentStyle?(parseInt(e.currentStyle.borderLeftWidth)).NaN0():0);
	top  += e.offsetTop  + (e.currentStyle?(parseInt(e.currentStyle.borderTopWidth)).NaN0():0);
	return {x:left, y:top};
}

function mouseMove(ev){
	var target   = ev.target;
	var mousePos = mouseCoords(ev);

	if(dragObject){
		dragObject.style.position = 'absolute';
		dragObject.style.top      = (mousePos.y - mouseOffset.y) +"px";
		dragObject.style.left     = (mousePos.x - mouseOffset.x) +"px";
	}
	lMouseState = iMouseDown;
	return false;
}

function mouseUp(ev){
	if(dragObject) {
		switch(dragObject.id) {
			case "ttq_message":
				var key = "MSG_POSITION";
				break;
			case "timerform_wrapper":
				var key = "FORM_POSITION";
				break;
			case "ttq_history":
				var key = "HISTORY_POSITION";
				break;
			case "ttq_tasklist":
			default:
				var key = "LIST_POSITION";
				break;
		}
		setOption(key, dragObject.style.top +"_"+ dragObject.style.left);
	}
	dragObject = null;
	iMouseDown = false;
}

function mouseDown(ev){
  var mousePos = mouseCoords(ev);
	var target = ev.target;
	if (target.id == 'ttq_close_btn') {dragObject = null; return false;}
	iMouseDown = true;
	if(target.getAttribute('DragObj')) return false;
}

function makeDraggable(item, noParent){
	if(!item) return;
	ttqAddEventListener(item, "mousedown",function(ev){
		ev.preventDefault();
		dragObject  = (noParent?this:this.parentNode);
		mouseOffset = getMouseOffset((noParent?this:this.parentNode), ev);
		return false;
	}, false);
}
// *** End Drag n Drop (move TTQ windows) Block ***

// *** Begin TTQ "get" Functions  Block ***
function getSiteId() {
	_log(3,"Begin getSiteId()");
	//Check if the page is showing the village instead
	var xpathVillage = xpath("//div[@class='village2'] | //div[@class='village1'] ");
	var href = window.location.href;
	if ( xpathVillage.snapshotLength > 0 || href.indexOf("messages") > -1 || href.indexOf("berichte") > -1 || href.indexOf("hero") > -1 || href.indexOf("details") > -1 || href.indexOf("karte") > -1 || href.indexOf("statistiken") > -1 || href.indexOf("profile") > -1 || href.indexOf("report") > -1 ) {
		_log(2, "getSiteId>This is not a screen that has a building. End getSiteId()");
		return -6;
	}
	_log(3,"getSiteId> Trying from URL...");
	var re = /.*build\.php\?([a-z=0-9&]*&)?g?id=([0-9]{1,2})/i;
	var tSiteId = window.location.href.match(re);
	if(tSiteId != null) {
		tSiteId = parseInt(tSiteId[2]);
		_log(3, "getSiteId> Building site ID is " + tSiteId + ". End getSiteId().");
		return tSiteId;
	}
	_log(2, "getSiteId> Building site ID not found.... anywhere. End getSiteId();");
	return -6;
}

/**************************************************************************
 * @return name of one of your one villages.
 ***************************************************************************/
function getVillageName(iVillageDid) {
	iVillageDid = parseInt(iVillageDid);
	if ( isNaN(iVillageDid) ) return aLangStrings[2];
	if ( typeof(myPlaceNames[iVillageDid]) != "undefined" ) return myPlaceNames[iVillageDid];
	if ( iVillageDid > 0 ) return "(" + iVillageDid + ")";
	return aLangStrings[2];
}

function getVillageNameZ(iVillageZid) {
	var xy = coordZToXY(iVillageZid);
	return getVillageNameXY(xy[0],xy[1]);
}

function getVillageNameXY(iVillageX, iVillageY){
	iVillageX = parseInt(iVillageX);
	iVillageY = parseInt(iVillageY);
	if ( isNaN(iVillageX) || Math.abs(iVillageX) > mapRadius || isNaN(iVillageY) ||  Math.abs(iVillageY) > mapRadius ) return aLangStrings[2];
	if ( typeof(myPlaceNames[iVillageX+" "+iVillageY]) != "undefined" ) return myPlaceNames[iVillageX+" "+iVillageY];
	var nV, tStr1 = '<span class ="ttq_village_name" title="'+aLangStrings[81]+'" onclick="window.location = \'' + window.location.origin + '/position_details.php?x='+iVillageX+'&y='+iVillageY+'\';return false;">';
	var tStr2 = "("+iVillageX+"|"+iVillageY+")</span>";
	for ( var i = 0, k = otherPlaceNames.length ; i < k ; ++i ) {
		nV = otherPlaceNames[i].split("|");
		if ( parseInt(nV[0]) == iVillageX && parseInt(nV[1]) == iVillageY ) {
			nV.splice(0,2);//Just in case some village names have | in thier name
			return tStr1+nV.join("|")+" "+tStr2;
		}
	}
	return tStr1+tStr2;
}

function getTroopsInfo(aTroops) {
	var sTroopsInfo = "";
	var isEmpty = true;
	var k = -1;
	for(var i = 1; i < aTroops.length && i < 13; ++i) {
		if ( aTroops[i] > 0 && ((isEmpty && i > 11) || (i < 12)) ) {
			isEmpty = false;
			sTroopsInfo += aLangTroops[i-1] + ": " +aTroops[i]+ ", ";
		}
	}
	//trim last two characters
	sTroopsInfo = sTroopsInfo.substring(0, sTroopsInfo.length - 2);
	return sTroopsInfo;
}

function getMerchantInfo(aMerchants, isLong){
	var	sMerchantInfo = "";
	if ( typeof(aMerchants) == 'string'	) aMerchants = aMerchants.split("_");
	if ( isLong ) { sMerchantInfo = aLangResources[0] + ":" + aMerchants[2] + ", " + aLangResources[1] + ":" + aMerchants[3] + ", " + aLangResources[2] + ":" + aMerchants[4] + ", " + aLangResources[3] + ":" + aMerchants[5];
	} else {
		sMerchantInfo = "" + ((aMerchants[2]>0)?(aLangResources[0]+": "+aMerchants[2]+", "):"") + ((aMerchants[3]>0)?(aLangResources[1]+": "+aMerchants[3]+", "):"") + ((aMerchants[4]>0)?(aLangResources[2]+": "+aMerchants[4]+", "):"") + ((aMerchants[5]>0)?(aLangResources[3]+": "+aMerchants[5]+", "):"");
		sMerchantInfo = sMerchantInfo.slice(0,-2);
	}
	return sMerchantInfo;
}

function getTaskDetails(aTask) {
	_log(2,"Begin getTaskDetails("+aTask+")");
	switch(aTask[0]) {
		case "0": //build new building
			return getVillageName(aTask[5]) + " : " + aLangTasks[0] + " " + aTask[3].split("_")[1] + "<br>(" + aLangStrings[35] + " " + aTask[2] + ")";
		case "1": //upgrade building
			return getVillageName(aTask[5]) + " : " + aLangTasks[1] + " " + aTask[3].split("_")[1] + "<br>(" + aLangStrings[35] + " " + aTask[2] + ")";
		case "2": //send attack
			var aTroops = aTask[3].split("_");
			var iIndex = parseInt(aTroops[0]);
			var langStringNo = iIndex == 5 ? 20 : iIndex == 3 ? 21 : 22;
			if ( (iIndex == 3 || iIndex == 4) && onlySpies(aTroops) ) var sTask = aLangStrings[47]+" "+aTroops[14]+" ";
			else var sTask = aLangStrings[langStringNo];
			return getVillageName(aTask[5]) + " : " + sTask + " >> " + getVillageNameZ(aTask[2]) + "<br>(" + getTroopsInfo(aTroops) + ")";
		case "3": //research
			var aOptions = aTask[3].split("_");
			return getVillageName(aTask[5])+" : "+aLangTasks[aOptions[1]]+" - "+aOptions[2];
		case "4": //train troops
			var aTroops = aTask[3].split("_");
			return getVillageName(aTask[5]) + " : " + aLangTasks[4] + "<br>(" + getTroopsInfo(aTroops) + ")";
		case "5": //throw party
			return getVillageName(aTask[5]) + " : " + aLangTasks[5] + " " + aLangStrings[53];
		case "6": //demolish building
			var tmp = "A Building";
			var tmp2 = aTask[3].split("_");
			var siteId = parseInt(aTask[2]);
			for ( var i = 0, k = tmp2.length ; i < k ; ++i ) {
				if ( parseInt(tmp2[i].replace(/\[/g,"")) == siteId ) {
					tmp = tmp2[i];
					break;
				}
			}
			return getVillageName(aTask[5]) + " : " + aLangTasks[6] + " " + tmp + "<br>(" + aLangStrings[35] + " " + siteId + ")";
		case "7": //Send Merchants
			var tM = aTask[3].split("_");
			return getVillageName(aTask[5]) + " : " + aLangTasks[7] + " >> " + getVillageNameXY(tM[0],tM[1]) + "<br>(" + getMerchantInfo(tM) + ")";
		case "8": //Send Back/Withdraw
			return getVillageName(aTask[5]) + " : " + aLangTasks[8] + " >> " + aTask[2] + "<br>(" + getTroopsInfo(aTask[3].split("_")) + ")";
		case "9": // Send troops through Gold-Club
			return getVillageName(aTask[5]) + " : " + getOption('FARMLIST','') + " >> " + aTask[2] + " ";
		default: //do nothing
			_log(3, "Unknown task, cant find details.");
			return "Unknown Task";
	}
	_log(3, "End getTaskDetails("+aTask+")");
}

function getTroopNames() {
	var httpRequest = new XMLHttpRequest();
	var httpRequestString = fullName+"build.php?id=39&gid=16&tt=1";
	httpRequest.open("GET", httpRequestString, true);
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4) { //complete
			var tTroops = new Array();
			if (httpRequest.status == 200 && httpRequest.responseText) { // ok
				var holder = document.createElement('div');
				holder.innerHTML = httpRequest.responseText;
				if ( holder.getElementsByClassName("gid16").length == 1 ) {
					var tUnits = holder.getElementsByClassName("troop_details");
					if ( tUnits.length > 0 ) {
						var i;
						tUnits = tUnits[tUnits.length-1].getElementsByClassName("unit");
						if ( tUnits.length > 10 ) for ( i = 0 ; i < 11 ; ++i ) tTroops.push("["+tUnits[i].alt+"]");
					} else {
						return; //no Rally Point
					}
				}
			}
			tTroops.push(aLangStrings[7]);
			if ( tTroops.length > 10 ) {
				aLangTroops = tTroops;
				setVariable("TROOP_NAMES",tTroops.join("|"));
				isTroopsLoaded = true;
				ttqUpdatePanel();
			}
		}
	};
	httpRequest.send(null);
}

function detectTribe() {
	iMyRace = parseInt(tOpts["RACE"]);  // 0-Romans, 1-Teutons, 2-Gauls, 5-Egyptians, 6-Huns, 7-Spartans, 8-Vikings. Set via dialogue. (or -1 for autodetect)
	if ( isNaN(iMyRace) || iMyRace < 0 ) {
		setVariable("TROOP_NAMES", "");
		var httpRequest = new XMLHttpRequest();
		var httpRequestString = fullName+"build.php?id=39&gid=16&tt=2";
		httpRequest.open("GET", httpRequestString, true);
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == 4) { //complete
				if (httpRequest.status == 200 && httpRequest.responseText) { // ok
					var parser = new DOMParser();
					var holder = parser.parseFromString(httpRequest.responseText, "text/html");
					var troopImg = xpath('.//img[contains(@class,"unit u")]',holder,true,holder);
					if( troopImg ) {
						iMyRace = Math.floor(parseInt(troopImg.getAttribute('class').match(/\d+/)[0])/10);
						if ( isNaN(iMyRace) || iMyRace < 0 || iMyRace > 8 ) iMyRace = 0;
						else setOption("RACE", iMyRace);
					}
				}
			}
		};
		httpRequest.send(null);
	}
}

// *** End TTQ "get" Functions ***

// *** Begin Helper Functions ***

function onlySpies(aTroops) { // @return true if there are only spies, false if there is anything else or no spies.
	_log(3,"Begin onlySpies()");
	var iScoutUnit = (iMyRace == 7) ? 2 : ((iMyRace == 2 || iMyRace == 6) ? 3 : 4);
	if(aTroops[iScoutUnit] < 1) { //no spies
		_log(3, "No spies.");
		return false;
	}
	for(var i=1; i <= 11; ++i) {
		if(i != iScoutUnit && parseInt(aTroops[i]) > 0) { //at least one other troop
			_log(3, "Troops other than spies are present.");
			return false;
		}
	}
	_log(3, "This is a spying mission.");
	return true;
}

function switchActiveVillage(did) {
	_log(2, "Switching your village back to " +did);
	if ( Number.isInteger(did) && did > 0 ) get(fullName+"dorf1.php?newdid="+did, null, null);
}

// *** Display Helper Functions
function generateButton(title, callback){
	_log(3, "Begin generateButton()");
	var oBtn = document.createElement("span");
	oBtn.style.border="1px solid #71D000";
	oBtn.style.backgroundImage = "linear-gradient(to top,#ccd5cc,#ffffff)";
	oBtn.style.verticalAlign="middle";
	oBtn.style.margin="5px 5px";
	oBtn.style.borderRadius = "5px";
	oBtn.style.cursor="pointer";
	oBtn.style.padding="4px";
	oBtn.style.display="inline-block";
	oBtn.style.lineHeight="initial";
	oBtn.setAttribute("onMouseOver", "this.style.border='1px solid #808080';");
	oBtn.setAttribute("onMouseOut", "this.style.border='1px solid #71D000';");
	oBtn.setAttribute("onclick", "window.scroll(0, 0);");
	oBtn.innerHTML = "<span style='font-size: 8pt; margin: 5px; color: #808080'>"+title+"</span>";
	ttqAddEventListener(oBtn,"click", callback, false);
	_log(3, "End generateButton()");
	return oBtn;
}

function printMsg(sMsg,bError) {
	_log(3,"Begin printMsg()");
	var oDate = new Date();
	var sWhen = oDate.toLocaleString() + "\n";
	_log(1, sWhen + sMsg);
	var oOldMessage = $id("ttq_message");
	if(oOldMessage) {
		_log(3, "Removing the old message." +oOldMessage);
		oOldMessage.parentNode.removeChild(oOldMessage); 	// delete old message
	}
	// here we generate a link which closes the message //Use img tag directly
	var sLinkClose = "<img src='" +sCloseBtn+ "' alt='["+aLangStrings[56]+"]' title='"+aLangStrings[56]+"' id='ttq_close_btn' class='ttq_close_btn' onclick='document.body.removeChild(document.getElementById(\"ttq_message\"));' />";
	var sBgColor = (bError) ? "#FFB89F" : "#90FF8F";
	var oMsgBox = document.createElement("div");
	oMsgBox.innerHTML = "<div id='ttq_draghandle_msg' class='handle'>" + sLinkClose + sMsg + "</div>";
	oMsgBox.style.backgroundColor = sBgColor;
	var msgCoords = getOption("MSG_POSITION", "215px_215px");
	msgCoords = msgCoords.split("_");
	oMsgBox.style.top = msgCoords[0];
	oMsgBox.style.left = msgCoords[1];
	oMsgBox.id = "ttq_message";
	document.body.appendChild(oMsgBox);
	makeDraggable($id('ttq_draghandle_msg'));
	_log(3, "End printMsg()");
}

function ttqRandomNumber() {
	var aleat = Math.random() * (MAX_REFRESH_MINUTES-MIN_REFRESH_MINUTES);
	aleat = Math.round(aleat);
	return parseInt(MIN_REFRESH_MINUTES) + aleat;
}

function ttqAddEventListener (obj, str, handler, boole) {
	if ( obj && str && handler ) {
		theListeners.push([obj, str, handler, boole]);
		obj.addEventListener(str, handler, boole);
	}
}

function ttqAniShadePanelYellowToRed(tNode) {  //This all assumes that CHECK_TASKS_EVERY is set to the default 10 seconds.
	var tGreen = 255;
	var tBlue = 255;
	return function () {
		if ( tBlue > 135 ) tBlue -= 24;
		else tGreen -= 24;
		tNode.style.backgroundColor = "rgb(255,"+tGreen+","+tBlue+")";
	}
}

function ttqAniShadePanelGreen(tNode) {  //This all assumes that CHECK_TASKS_EVERY is set to the default 10 seconds.
	var tRed = 255;
	var tBlue = 255;
	var tStyle = tNode.style;
	return function () {
		tBlue -= 5;
		tRed -= 5;
		tStyle.backgroundColor = "rgb("+tRed+",255,"+tBlue+")";
	}
}

function ttqUpdatePanel(aTasks,tTime){
	if ( oAnimateTimerIR  ) {
		window.clearInterval(oAnimateTimerIR);
		oAnimateTimerIR = null;
	}
	var ttqTimer = $id("ttqReloadTimer");
	if ( ttqTimer ) {
		tA = Math.floor(Date.now()/1000);
		vName = getOption('RELOAD_AT', 0, "integer") - tA; //Recycled Variables
		vName = Math.floor(vName/60)+"m"+vName%60 + "s";
		ttqTimer.innerHTML = vName;
		if ( !isTroopsLoaded || !isTTQLoaded ) return; // Its grey while something (getTroopNames) is running, so we let it stay grey
		ttqTimer = ttqTimer.parentNode.parentNode;
		if ( !aTasks ) aTasks = getVariable("TTQ_TASKS", "");
		if ( !tTime ) tTime = tA;
		tX = 0;
		tY = 0;
		if ( aTasks != "" ) {
			tA = aTasks.split("|");
			for ( tY = tA.length ; tX < tY ; ++tX ) {
				vName = parseInt(tA[tX].split(",")[1]);
				if ( vName <= tTime+60 ) {
					if ( vName <= tTime+CHECK_TASKS_EVERY) {
						if ( vName <= tTime ) {
							ttqTimer.style.backgroundColor ="#EE8787";
						} else {
							ttqTimer.style.backgroundColor ="#FFFF00";
							oAnimateTimerIR = window.setInterval(ttqAniShadePanelYellowToRed(ttqTimer), CHECK_TASKS_EVERY*99);
						}
					} else {
						ttqTimer.style.backgroundColor ="#BBFFBB";
						oAnimateTimerIR = window.setInterval(ttqAniShadePanelGreen(ttqTimer), CHECK_TASKS_EVERY*99);
					}
					tX = tY;
				}
			}
		}
		if ( tX != tY+1 ) ttqTimer.style.backgroundColor ="#FFFFFF";
	}
}

// *** End Helper Functions ***

// *** Begin GreaseMonkey Menu Block ***
function promptRace() {
	iMyRace = 'x';
	while ( isNaN(iMyRace) ) {
		iMyRace = prompt(aLangMenuOptions[0] + aLangMenuOptions[7] + getOption("RACE", -1, "integer"));
		if ( iMyRace == null || iMyRace == '' ) break;
		iMyRace = parseInt(iMyRace);
		if ( !isNaN(iMyRace) ) {
			if ( iMyRace < 7 ) {
				if ( iMyRace < -1 || iMyRace == 3 || iMyRace == 4 || iMyRace > 8 ) iMyRace = -1;
				setOption("RACE", iMyRace);
				window.location.reload();
				break;
			} else iMyRace = 'x';
		}
	}
}

function promptHistory() {
	var tHistLen = 'x';
	while ( isNaN(tHistLen) ) {
		tHistLen = prompt(aLangMenuOptions[0] + aLangMenuOptions[6] + iHistoryLength);
		if ( tHistLen == null || tHistLen == '' ) break;
		tHistLen = parseInt(tHistLen);
		if( !isNaN(tHistLen) ) {
			if(tHistLen > -1) {
				setOption("HISTORY_LENGTH", tHistLen);
				window.location.reload();
				break;
			} else tHistLen = 'x';
		}
	}
}

function promptReset() {
	if ( confirm(aLangMenuOptions[0] + "\n" + aLangMenuOptions[8]) ) {
		// rewritten by Serj_LV
		unLoad();
		var allkey = ['OTHER_PLACE_NAMES','TROOP_NAMES','TTQ_HISTORY','TTQ_OPTIONS','TTQ_TABID','TTQ_TASKS','vlist'];
		for (var i=0; i<allkey.length; i++) allkey[i] = CURRENT_SERVER + myPlayerID + "_" + allkey[i];
		allkey.push(CURRENT_SERVER+'login',CURRENT_SERVER+'lang',CURRENT_SERVER+'TTQ-UID');
		for (i=0; i<allkey.length; i++) TTQ_deleteValue(allkey[i]);
		var ttqPanel = $id("ttqPanel");
		if( ttqPanel ) {
			ttqPanel.style.backgroundColor ="#C0C0FF";
			ttqPanel.innerHTML = 'TTQ - goodbye';
		}
		allkey = ["ttq_message","timerform_wrapper","ttq_history","ttq_tasklist"];
		for (i=0; i<allkey.length; i++) {
			tA = $id(allkey[i]);
			if( tA ) tA.parentNode.removeChild(tA);
		}
	}
}

function promptLang() {
// writed by Serj_LV
	var aLangPrompt = "0 - auto, or one of these: ";
	var t=1;
	allLangs.sort();
	for( var i=0; i<allLangs.length; i++ ) {
		if(aLangPrompt.length > t*50 ) {
			aLangPrompt += '\n';
			t++;
		}
		aLangPrompt += allLangs[i] + ", ";
	}
	while( true ) {
		var aLang = prompt(aLangPrompt, TTQ_getValue(CURRENT_SERVER+"lang","0"));
		if( !aLang ) return;
		if( aLang == 0 ) {
			TTQ_deleteValue(CURRENT_SERVER+"lang");
			break;
		} else {
			if( (","+allLangs.join(',')+",").indexOf(","+aLang+",") != -1 ) {
				TTQ_setValue(CURRENT_SERVER+"lang",aLang);
				break;
			}
		}
	}
	window.location.reload();
}

function promptDebug() {
	var aDebugVal = prompt(aLangMenuOptions[10], getOption("DEBUG", 0, "integer"));
	switch ( aDebugVal ) {
		case "0": case "1":	case "2":	case "3":
			setOption("DEBUG", parseInt(aDebugVal));
			window.location.reload();
			break;
	}
}

// *** End GreaseMonkey Menu Block ***

// *** Begin document listener Block ***
function onLoad() {
	var starttime2 = Date.now();

	_log(1,"Begin onLoad()");

	TTQ_registerMenuCommand(aLangMenuOptions[3], promptRace);
	TTQ_registerMenuCommand(aLangMenuOptions[4], promptHistory);
	TTQ_registerMenuCommand("Language", promptLang);
	TTQ_registerMenuCommand(aLangMenuOptions[5], promptReset);
	TTQ_registerMenuCommand(aLangMenuOptions[9], promptDebug);

	LOG_LEVEL = getOption("DEBUG", 0, "integer");

    tA = /.*build\.php.*/i;

	if (iSiteId > -1 && tA.test(window.location.href)) {
		createBuildLinks();

		var build = $id('build');
		if( !(build) ) {
//		tX = xpath("//div[@class='build_desc']/a/img");
//		if (xpath("//div[@id='build'][@class='gid0']").snapshotLength > 0 || tX.snapshotLength != 1 ) {
			_log(2, "This is an empty building site or I can not find build description image. More more links to create.");
		} else {
			tY = parseInt(build.getAttribute('class').match(/\d+/)[0]);
			_log(3, "This building (gid="+tY+").");
//			tY = parseInt(tX.snapshotItem(0).className.split(" g")[1]);  //Building ID
			switch ( tY ) {
				case 13:
				case 22:	createResearchLinks(tY);
							break;
				case 19:	case 20:	case 21:	case 36:
				case 25:	case 26:	case 29:	case 30:	
				case 44:	case 46:	case 48:	case 49:
							createTrainLinks(tY);
							break;
				case 24:	createPartyLinks();
							break;
				case 15:	createDemolishBtn();
							break;
				case 17:	setTimeout(createMarketLinks,700);
							break;
				case 16:	if( $gc('a2b').length > 0 && ($id('troops') || $gc('troop_details').length > 0) ) createAttackLinks();
							if( $id('rallyPointFarmList') ) { 
								setTimeout(createGoldClubBtn,700);
								setTimeout(createGoldClubBtnAll,700);
							}
							break;
				default:	_log(2, "This building (gid="+tY+") has no more links to create.");
			}
		}
	}

	vName = getVariable("TTQ_TASKS");
	if(vName != '') refreshTaskList(vName.split("|"));

	tA = getVariable("TTQ_HISTORY");
	if(iHistoryLength > 0 && tA != '') refreshHistory(ttqTrimData(tA, iHistoryLength, false));

	tA = $id("ttqLoad");
	tX = Date.now();
	if ( tA ) tA.innerHTML = (inittime + (tX - starttime2));

	isTTQLoaded = true;
	ttqUpdatePanel(vName,Math.floor(tX/1000));
	_log(1, "End onLoad()");
}

function unLoad () {
	setVariable("TTQ_TABID", 0);
	for ( tX = 0, tY = theListeners.length ; tX < tY ; ++tX ) {
		tA = theListeners[tX];
		if  ( tA && tA[0] ) tA[0].removeEventListener(tA[1],tA[2],tA[3]);
	}
	window.clearInterval(oAnimateTimerIR);
	window.clearInterval(oIntervalReference);
	oIntervalReference = null;
	oAnimateTimerIR = null;
}

function doMinimize(evt) {
	var isMin, tD = evt.target.parentNode;
	if ( tD != null ) {
		switch ( tD.id ) {
			case "ttq_tasklist":		isMinimized = !isMinimized;
										isMin = isMinimized;
										setOption ("LIST_MINIMIZED", isMinimized);
										break;
			case "ttq_history":			isHistoryMinimized = !isHistoryMinimized;
										isMin = isHistoryMinimized;
										setOption ("LIST_HISTORY_MINIMIZED", isHistoryMinimized);
										break;
			default:					return false;
		}

		if ( isMin ) {
			tD.style.height = "16px";
			tD.style.width = "150px";
			tD.style.overflow = "hidden";
		} else {
			tD.style.height = "";
			tD.style.width = "";
		}
	}
}

// *** End document listener Block ***
/**************************************************************************
 * --- Main Code Block ---
 ***************************************************************************/
if (init) {
	ttqAddEventListener ( document, "mousemove", mouseMove, false );
	ttqAddEventListener ( document, "mousedown", mouseDown, false );
	ttqAddEventListener ( document, "mouseup",   mouseUp,   false );
//	ttqAddEventListener ( window,   "load",      onLoad,    false );
	ttqAddEventListener ( window,   "unload",    unLoad,    false );
	var inittime = Date.now();
	_log(1, "TTQ starting...");
	var tmp = Math.round(ttqRandomNumber()*60000);
	setOption('RELOAD_AT', Math.floor((tmp + inittime)/1000));
	inittime -= starttime;
	_log(1, "CheckSetTasks> Begin. (tab ID = " + myID + " / "+getVariable("TTQ_TABID",0)+")");
//	checkSetTasks();
	if(!oIntervalReference) {
		_log(3, "setInterval()");
		oIntervalReference = window.setInterval(checkSetTasks, CHECK_TASKS_EVERY*1000);
	}
	onLoad();
} else {
    var oLogout = xpath("//div[@class='logout']");
	var oError = $gc('error');
	var errorFL = false;
	for( var i=0; i<oError.length; i++ ) {
		if( oError[i].innerHTML.replace(/\s/g,'').length > 0 ) {
			errorFL = true;
			break;
		}
	}
	if( oLogout.snapshotLength > 0 || errorFL ) TTQ_setValue(CURRENT_SERVER+'login','0');
    var oSysMsg = xpath("//div[@id='sysmsg']");
	var oLoginBtn = xpath("//div[@id='loginScene']//button[@type='submit']");
    if ( oLoginBtn.snapshotLength < 1 && (oLogout.snapshotLength > 0 || oSysMsg.snapshotLength > 0) ) {
        _log(1, "Error screen or something. Game is not loaded. Did not start TTQ.");
    } else if ( oLoginBtn.snapshotLength == 1 ) {  //Auto-Login, this assumes that FF has saved your username and password
		var loginFL = false;
		var oLogin = xpath("//input[@name='name'][@type='text']").snapshotItem(0);
		var oPassword = xpath("//input[@name='password'][@type='password']").snapshotItem(0);
		// writed by Serj_LV
		var logPas = TTQ_getValue(CURRENT_SERVER+'login','0');
		if( logPas != '0' ) {
			logPas = logPas.split('/');
			oLogin.value = logPas[0];
			oPassword.value = logPas[1];
			loginFL = true;
		} else {
			oLoginBtn.snapshotItem(0).addEventListener('click',function() {
				if ( oLogin.value.length > 0 && oPassword.value.length > 0 )
					TTQ_setValue(CURRENT_SERVER+'login',oLogin.value+'/'+oPassword.value);
			}, false);
		}
		if( loginFL ) setTimeout("document.getElementById('loginScene').getElementsByTagName('button')[0].click();",Math.round(ttqRandomNumber()*111)); // 333 - roughly 1.6 to 3.3 with default random min/max settings
		else _log(1,"Auto-Login failed. You must have Firefox/Chrome store the username and password. TTQ does not.");
	} else {
		_log(1, "Initialization failed, Auto-login failed. Travian Task Queue is not running");
	}
}

}

function backupStart () {
	if(notRunYet) {
		var l4 = document.getElementById('l4');
		if( l4 ) allInOneTTQ();
		else setTimeout(backupStart, 500);
	}
}

var notRunYet = true;
if( /Gecko/.test(navigator.userAgent) ) allInOneTTQ();
else if (window.addEventListener) window.addEventListener("load",function () { if(notRunYet) allInOneTTQ(); },false);
setTimeout(backupStart, 500);

})();
