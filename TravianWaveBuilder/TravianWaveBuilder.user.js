// ==UserScript==
// @name           Travian wave builder
// @namespace      https://github.com/adipiciu/Travian-scripts
// @description    Wave builder for Travian Legends and Travian Shores of War
// @author         adipiciu (based on Travian wave builder 0.5 by Serj_LV)
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=56E2JM7DNDHGQ&item_name=Travian+wave+builder+script&currency_code=EUR
// @match          https://*.travian.com/build.php*

// @version        2.11
// ==/UserScript==

function allInOneOpera () {

var version = '2.11';
var scriptURL = 'https://github.com/adipiciu/Travian-scripts';
var defInterval = 200;
var sLang = detectLanguage();
var langStrings = ["Add attack", "Remove attack", "Move attack up", "Move attack down", "Add multiple attacks (1-12 attacks)", "Interval between attacks, in milliseconds. Minimum interval is 100 ms.", "Attack type", "Interval", "ms"];

/*********************** localization ****************************/

switch(sLang) {
	case "ar-ae": //Arabic (U.A.E)
	case "ar-eg": //Arabic (Egypt)
	case "ar-sa": //Arabic (Saudi Arabia)
	case "ar-sy": //Arabic (Syria)
		langStrings = ["إضافة هجوم","إزالة الهجوم","تحريك الهجوم لأعلى","تحريك الهجوم لأسفل","إضافة هجمات متعددة (الهجمات من 1 إلى 12)","الفاصل الزمني بين الهجمات بالمللي ثانية. الحد الأدنى للفاصل الزمني هو 100 مللي ثانية.","نوع الهجوم","الفاصل الزمني","ملي ثانية"];
		break;
	case "fr-fr": //French
		langStrings = ["Ajouter une attaque", "Supprimer l'attaque", "Déplacer l'attaque vers le haut", "Déplacer l'attaque vers le bas", "Ajoutez plusieurs attaques (1-12 attaques).", "Intervalle entre les attaques, en millisecondes. L'intervalle minimum est de 100 ms.", "Type d'attaque", "Intervalle", "ms"];
		break;
	case "hu-hu": //Hungarian
		langStrings = ["Támadás hozzáadása", "Támadás törlése", "Támadás mozgatása fel", "Támadás mozgatása le", "Támadások hozzáadása (1-12 támadások)", "Támadások közötti intervallum (ms). Minimum intervallum 100 ms.", "Támadás típusa", "Intervallum", "ms"];
		break;
	case "it-it": //Italian
		langStrings = ["Aggiungi attacco", "Rimuovi l'attacco", "Sposta l'attacco in alto", "Sposta l'attacco in basso", "Aggiungi più attacchi (1-12 attacchi).", "Intervallo tra attacchi, in millisecondi. L'intervallo minimo è 100 ms.", "Tipo di attacco", "Intervallo", "ms"];
		break;
	case "pt-pt": //Portuguese
	case "pt-br": //Brazilian Portuguese
		langStrings = ["Adicionar ataque", "Remover ataque", "Mover ataque para cima", "Mover ataque para baixo", "Adicionar multiplos ataques (1-12 ataques)", "Intervalo entre ataques, em milisegundos. Intervalo mínimo de 100 ms.", "Tipo de ataque", "Intervalo", "ms"];
		break;
	case "ro-ro": //Romanian
		langStrings = ["Adaugă atac", "Șterge atacul", "Mută atacul în sus", "Mută atacul în jos", "Adaugă mai multe atacuri (1-12 atacuri)", "Intervalul dintre atacuri în milisecunde. Intervalul minim este de 100 ms.", "Tipul atacului", "Interval", "ms"];
		break;
	case "ru-ru": //Russian
		langStrings = ["Добавить атаку", "Удалите атаку", "Переместить атаки вверх", "Переместить атаку вниз", "Добавьте несколько атак (1-12 атаки)", "Интервал между атаками, в миллисекундах. Минимальный интервал составляет 100 мс.", "Тип атаки", "Интервал", "мс"];
		break;
	case "tr-tr": //Turkish
		langStrings = ["Saldırı ekle", "Saldırı çıkar", "saldırıyı yukarı kaydır", "saldırıyı asagı kaydır", "Çoklu saldırı ekle (1-12x saldırı)", "Saldırılar arasındaki aralık, milisaniye. en az aralık 100 ms'dir.", "Saldırı tipi", "aralık", "ms"];
		break;
	case "zh-cn": //Chinese
		langStrings = ["添加攻击","移除攻击","上移攻击","下移攻击","添加多个攻击 (1-12 次攻击)","攻击间隔 以毫秒为单位。最小间隔为 100 毫秒。","攻击类型","间隔","毫秒"];
		break;
	default: //English
}

/*********************** common library ****************************/

function RB_addStyle(css) {
	var head = document.getElementsByTagName('head')[0];
	if (head) {
	  var style = document.createElement("style");
	  style.appendChild($t(css));
	  head.appendChild(style);
	}
}

function ajaxRequest(url, aMethod, param, onSuccess, onFailure) {
	var aR = new XMLHttpRequest();
	param = encodeURI(param);
	aR.onreadystatechange = function() {
		if( aR.readyState == 4 && (aR.status == 200 || aR.status == 304)) { onSuccess(aR); }
		else if (aR.readyState == 4 && aR.status != 200) { onFailure(aR); }
	};
	aR.open(aMethod, url, true);
	if (aMethod == 'POST') aR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	aR.send(param);
}

Number.prototype.NaN0 = function(){return isNaN(this)?0:this;};
function $g(aID,m) {return (typeof m == 'undefined' ? document:m).getElementById(aID);}
function $gn(aID) {return (aID != '' ? document.getElementsByName(aID) : null);}
function $gt(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByTagName(str); }
function $gc(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByClassName(str); }
function $at(aElem, att) {if (att !== undefined) {for (var xi = 0; xi < att.length; xi++) {aElem.setAttribute(att[xi][0], att[xi][1]); if (att[xi][0].toUpperCase() == 'TITLE') aElem.setAttribute('alt', att[xi][1]);}}}
function $t(iHTML) {return document.createTextNode(iHTML);}
function $e(nElem, att) {var Elem = document.createElement(nElem); $at(Elem, att); return Elem;}
function $ee(nElem, oElem, att) {var Elem = $e(nElem, att); if (oElem !== undefined) if( typeof(oElem) == 'object' ) Elem.appendChild(oElem); else Elem.innerHTML = oElem; return Elem;}
function $c(iHTML, att) { return $ee('TD',iHTML,att); }
function $a(iHTML, att) { return $ee('A',iHTML,att); }
function $am(Elem, mElem) { if (mElem !== undefined) for(var i = 0; i < mElem.length; i++) { if( typeof(mElem[i]) == 'object' ) Elem.appendChild(mElem[i]); else Elem.appendChild($t(mElem[i])); } return Elem;}
function $em(nElem, mElem, att) {var Elem = $e(nElem, att); return $am(Elem, mElem);}
function dummy() {return;}
var jsNone = 'return false;';

function trImg ( cl, et ) {
	var ecl = [['class', cl],['src', 'img/x.gif']];
	if( typeof et != 'undefined' ) ecl.push(['title',et]);
	return $e('IMG',ecl);
}

function getRandom ( x ) {
	x = Math.round(x*0.8);
	return x+Math.round(Math.random()*x*0.5);
}

function detectLanguage() {
	var lang = "en-us";
	try { 
		lang = $gn("content-language")[0].getAttribute("content").toLowerCase(); 
	} catch(e) { }
	try {
		lang = $g("mainLayout").getAttribute("lang").toLowerCase();
	} catch(e) { }
	return lang;
}

/********** begin of main code block ************/

function ok () {
	tFormFL = true;
	plus.textContent = '+';
	$g('twb_multi').disabled = false;
	wNr += 1;
	( wNr < $g('twb_multi').value && wNr < 12 ) ? addWave() : wNr = 0;
}

function addWave () {
	if( tFormFL ) {
		tFormFL = false;
		plus.textContent = 'x';
		$g('twb_multi').disabled = true;
	} else return;

	var tInputs = $gt('INPUT',tForm);
	var sParams = '';
	var cDescr = '';

	for( var i=0; i<tInputs.length; i++ ) {
		var t = tInputs[i].name;
		if( /redeployHero/.test(t) ) {
			if( tInputs[i].checked ) {
				sParams += "redeployHero=1&";
			}
		} else if ( t == "eventType" ) {
			if( tInputs[i].checked ) {
				sParams += "eventType=" + tInputs[i].value + "&";
				cDescr = tInputs[i].parentNode.textContent.trim();
			}
		} else if ( /^t\d/.test(t) || /x|y/.test(t) ) {
			sParams += t + "=" + $gn(t)[0].value + "&";
		} else {
			sParams += t + "=" + tInputs[i].value + "&";
		}
	}
	var okBtn = $g('ok');
	sParams += okBtn.name + "=" + okBtn.value;

	ajaxRequest(fullName + a2bURL, "POST", sParams, function(ajaxResp) {
		var parser = new DOMParser();
		var rpPage = parser.parseFromString(ajaxResp.responseText, "text/html");
		var bld = $g('build',rpPage);
		var err = $gc('error',bld);
		if( err.length > 0 && err[0].textContent.length > 1 ) {
			ok();
			alert( err[0].textContent );
			return;
		}
		err = $gc('alert',bld);
		if( err.length > 0 ) {
			for( i=0; i<err.length; i++ ) {
				if (err[i].hasAttribute("id") && err[i].getAttribute("id")=="l4") {
				} else {
					if( ! confirm(err[i].textContent) ) {
						ok();
						return;
					}
				}
			}
		}
		tInputs = $gt('INPUT',bld);
		var sParams = '';
		var tc = new Array(12);
		for( i=0; i<tInputs.length; i++ ) {
			var t = tInputs[i].name;
			if( /\[t\d/.test(t) ) {
				tc[t.match(/\[t(\d+)/)[1]] = tInputs[i].value;
			} if (tInputs[i].className == "radio") continue;
			if ( /useShip/.test(t) ) continue;
			sParams += t + "=" + tInputs[i].value + "&";
		}

		var okBtn = $gc('rallyPointConfirm',rpPage);
		var sOnclick = okBtn[0].getAttribute('onclick');
		var checkSum = sOnclick.split(';')[1].split('value = \'')[1].split('\'')[0];
		sParams += "checksum=" + checkSum;

		var remBtn = $a('-',[['href','#'],['title',langStrings[1]],['onclick',jsNone]]);
		remBtn.addEventListener('click',remWave,false);

		var moveUpBtn = $a('&uarr;',[['href','#'],['title',langStrings[2]],['onclick',jsNone],['style','margin:0 15px;']]);
		moveUpBtn.addEventListener('click',moveWaveUp,false);

		var moveDownBtn = $a('&darr;',[['href','#'],['title',langStrings[3]],['onclick',jsNone]]);
		moveDownBtn.addEventListener('click',moveWaveDown,false);

		var firstCol = $c(remBtn,[['rowspan',2],['style','text-align:center;user-select:none;']]);
		firstCol.appendChild(moveUpBtn);
		firstCol.appendChild(moveDownBtn);
		firstCol.appendChild($e('INPUT',[['type','hidden'],['value',sParams]]));

		var nrow = $ee('TR',firstCol);
		for( i=1; i<12; i++ ) {
			nrow.appendChild($c(tc[i]));
		}
		nrow.appendChild($c(cDescr,[['title',cDescr]]));
		var nbody = $ee('TBODY',nrow);
		tInputs = $gt('SELECT',bld);
		var tSpy = $gc('radio',bld);
		var ships = $gc('useShip',bld);
		nrow = $e('TR');
		if (tInputs.length>0) {
			nrow.appendChild($c(tInputs[0],[['colspan',6]]));
		} else if (tSpy.length>0) {
			tSpy[0].name = tSpy[0].name+"twb"+tbl.tBodies.length;
			if (tSpy.length>1) tSpy[1].name = tSpy[1].name+"twb"+tbl.tBodies.length;
			tSpy[0].parentNode.parentNode.colSpan = 6;
			nrow.appendChild(tSpy[0].parentNode.parentNode);
		} else {
			nrow.appendChild($c('-',[['colspan',6]]));
		}
		nrow.appendChild($c(tInputs.length>0 ? tInputs[0]: '-',[['colspan',5]]));
		if (ships.length>0) {
			var shipsRow = $gc('shipAvailability',bld)[0].cloneNode(true);
			var shipsDiv = ships[0].cloneNode(true);
			shipsDiv.style.margin = "0px";
			var shipsInp = $gt('input',shipsDiv);
			shipsInp[0].name = shipsInp[0].name+"twb"+tbl.tBodies.length;
			shipsInp[0].removeAttribute("onchange");
			shipsRow.appendChild(shipsDiv.cloneNode(true));
			nrow.appendChild($c(shipsRow,[['style','text-align:right;']]));
		} else {
			nrow.appendChild($e('TD'));
		}
		nbody.appendChild(nrow);
		tbl.appendChild(nbody);
		setTimeout(ok, getRandom(1200));
		}, function() {setTimeout(ok, getRandom(1200));} 
	);
}

function remWave () {
	var tb = this.parentNode.parentNode.parentNode;
	tb.parentNode.removeChild(tb);
}

function moveWaveUp () {
	var wave = this.parentNode.parentNode.parentNode;
    var previousElem = wave.previousElementSibling;
    if (previousElem && previousElem.tagName!='TFOOT') {
        wave.parentNode.insertBefore(wave, previousElem);
    }
}

function moveWaveDown () {
	var wave = this.parentNode.parentNode.parentNode;
    var nextElem = wave.nextElementSibling;
    if (nextElem && nextElem.tagName!='TFOOT') {
        wave.parentNode.insertBefore(wave, nextElem.nextElementSibling);
    }
}

function sendTroops (x) {
	var wBody = tbl.tBodies[x];
	var sParams = $gt('INPUT',wBody)[0].value;
	var	tInputs = $gt('SELECT',wBody);
	sParams += tInputs.length>0 ? "&" + tInputs[0].name + "=" + tInputs[0].value : '';
	sParams += tInputs.length>1 ? "&" + tInputs[1].name + "=" + tInputs[1].value : '';
	var tSpy = $gc('radio',wBody);
	sParams += tSpy.length>0 ? "&" + tSpy[0].name.substring(0, tSpy[0].name.indexOf('twb')) + "=" + (tSpy[0].checked ? '1' : '2') : '';
	var ShipsInp = $gc('useShips',wBody);
	sParams += (ShipsInp.length>0 && ShipsInp[0].checked) ? "&" + ShipsInp[0].name.substring(0, ShipsInp[0].name.indexOf('twb')) + "=1" : '';

	function logWaves (a,b) {
		wlog += "<span style='color:"+(b?'green':'red')+"'> "+a+" </span>";
		cLog.innerHTML = wlog;
	}

	if( x == wCount-1 ) {
		setTimeout(function(){ document.location.href = fullName +'build.php?gid=16&tt=1'; }, getRandom(2000));
	}
	ajaxRequest(fullName + a2bURL, "POST", sParams, function() { return function(x) { return logWaves(x,1); }(x+1); }, 
		function() { return function(x) { return logWaves(x,0); }(x+1); } );
}

function sendWaves () {
	cLog = $c(wlog,[['colspan',13],['style','background-color: transparent;']]);
	tbl.tFoot.appendChild($ee('TR',cLog));
	wCount = tbl.tBodies.length;
	var nextWave = 10;
	var intWave = parseInt(interval.value).NaN0();
	if( intWave < 100 ) intWave = defInterval;
	for( var i=0; i<wCount; i++ ) {
		setTimeout(function(x){return function(){ sendTroops(x); };}(i), nextWave);
		nextWave += getRandom(intWave);
	}
}

twb_css = "table#twbtable { background-color: transparent; border-collapse: collapse; } " +
"table#twbtable thead td, table#twbtable tbody td, table#twbtable tfoot td { border: 1px solid silver; } "

var build = $g('build');
if( ! build ) return;
if( build.getAttribute('class').indexOf('gid16') == -1 ) return;

var snd = $gc('a2b');
if( $gc('a2b').length != 1 ) return;

if( ! $g('troops') ) return;

var nation = Math.floor(parseInt($gc('unit')[0].getAttribute('class').match(/\d+/)[0])/10);
if( nation < 0 ) return;

RB_addStyle(twb_css);

var a2bURL = "build.php?gid=16&tt=2";
var wCount = 0;
var wNr = 0;
var wlog = '';
var cLog;
var tForm = snd[0];
var tFormFL = true;
var fullName = window.location.origin + "/";

// build table header
var tbl = $e('TABLE',[['id','twbtable']]);
var plus = $a('+',[['href','#'],['onclick',jsNone],['title',langStrings[0]]]);
plus.addEventListener('click',addWave,false);
var multi = $e('INPUT',[['id','twb_multi'],['type','number'],['value',1],['title',langStrings[4]],['min',1],['max',12],['style','width:40px;margin:0 8px;']]);
var hrow = $ee('TR',$am($e('TD',[['style','white-space:nowrap;']]),[multi,plus]));
for( var i=1; i<11; i++ ) {
	hrow.appendChild($c(trImg('unit u'+(nation*10+i))));
}
$am(hrow,[$c(trImg('unit uhero')),$c(langStrings[6])]);
tbl.appendChild($ee('THEAD',hrow));

var sendBtn = $g('ok').cloneNode(true);
sendBtn.removeAttribute('name');
sendBtn.removeAttribute('id');
sendBtn.addEventListener('click',sendWaves,false);

var interval = $e('INPUT',[['type','text'],['value',defInterval],['title',langStrings[5]],['size',4],['maxlength',4],['style','text-align:right']]);
var intervaltxt = $ee('SPAN',langStrings[7],[['style','display:inline-block;padding:0 5px;']]);
var unitTimetxt = $ee('SPAN',langStrings[8],[['style','display:inline-block;padding:0 5px;']]);
tbl.appendChild($ee('TFOOT',$ee('TR',$em('TD',[intervaltxt,interval,unitTimetxt,sendBtn,
	$a(' (v'+version+') ',[['href',scriptURL],['target','_blank']])],
	[['colspan',13],['style','background-color: transparent;text-align:center !important;padding:3px;']]))));

build.appendChild(tbl);

/********** end of main code block ************/
}

allInOneOpera();
