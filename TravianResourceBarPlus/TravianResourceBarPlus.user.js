// ==UserScript==
// @name           Travian Resource bar plus
// @namespace      https://github.com/adipiciu/Travian-scripts
// @description    Shows travian resources (for Travian Legends and Travian Shores of War)
// @author         adipiciu (based on Travian Resource bar plus version 2.8.14 by Serj_LV)
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=56E2JM7DNDHGQ&item_name=T4.4+script&currency_code=EUR
// @include        *://*.travian.*
// @include        *://*/*.travian.*
// @exclude     *://*.travian*.*/hilfe.php*
// @exclude     *://*.travian*.*/log*.php*
// @exclude     *://*.travian*.*/index.php*
// @exclude     *://*.travian*.*/anleitung.php*
// @exclude     *://*.travian*.*/impressum.php*
// @exclude     *://*.travian*.*/anmelden.php*
// @exclude     *://*.travian*.*/gutscheine.php*
// @exclude     *://*.travian*.*/spielregeln.php*
// @exclude     *://*.travian*.*/links.php*
// @exclude     *://*.travian*.*/geschichte.php*
// @exclude     *://*.travian*.*/tutorial.php*
// @exclude     *://*.travian*.*/manual.php*
// @exclude     *://*.travian*.*/ajax.php*
// @exclude     *://*.travian*.*/ad/*
// @exclude     *://*.travian*.*/chat/*
// @exclude     *://forum.travian*.*
// @exclude     *://board.travian*.*
// @exclude     *://shop.travian*.*
// @exclude     *://*.travian*.*/activate.php*
// @exclude     *://*.travian*.*/support.php*
// @exclude     *://help.travian*.*
// @exclude     *://*.answers.travian*.*
// @exclude     *.css
// @exclude     *.js

// @version        2.23.22
// ==/UserScript==

(function () {
var RunTime = [Date.now()];

function allInOneOpera () {
var version = '2.23.22';

notRunYet = false;

var homepageurl = 'https://github.com/adipiciu/Travian-scripts';
var audiofile = 'https://soundsplanet.com/authors/1001/tracks/touch_tone1.mp3';
var bgcolor = ['#66ff66','yellow','red']; //resource bar colors
var vHColor = '#777777'; //hints (second name) color
var cnColors = ['#F8FFD8','#FFE85B','#FF8888','#F0B8FF','#A0F0A0']; //Center Number colors
var income = [];
var incomepersecond = [];
var iresNow = [];
var resNow = [];
var fullRes = [];
var wfl = false;
var rpFL = false;
var triFL = true;
var nextFL = true;
var stopRPFL = true;
var plusAccount = false;
var timerRB = [];
var timerP = [];
var lastTimerP = [0,0,0];
var lastTimerB = 0;
var timerB = [];
var timerB3 = [];
var timerOv = [];
var timerN = [];
var villages_id = [];
var village_aid = 0;
var village_aNum = 0;
var villages_count = 0;
var linkVSwitch = [];
var sumPPH = [0,0,0,0];
var merchInWork = 0;
var progressbar_time = 0;
var lastAlert = RunTime[0];
var aClockTimer = 0;
var loadServerTime = 0;
var langs = ['auto','English (en)','عربي (ar)','Български (bg)','Bosanski (bs)','Deutsch (de)','Ελληνικά (el)','Español (es)','فارسی (fa)','Français (fr)','Hrvatski (hr)','Magyar (hu)','Indonesian (id)','Italiano (it)','Nederlands (nl)','Polski (pl)','Português (pt)','Română (ro)','Русский (ru)','Српски (sr)','Svenska (sv)','Türkçe (tr)','Українська (ua)','Tiếng Việt (vi)','中文 (zh)'];
var allCookies = ['vPPH','mf','next','Dorf1','Dorf2','Dorf11','Dorf12','Dorf13','Dorf14','RBSetup','xy','VV','OV','Mem','Dict','DictFL','DictTR','DictRp','DictRpFL','ln','ln2','ln3','src','vHint','tropsI','tropsDic','vList','Att','trFL','AC','AS','bodyH','vBMn'];
var crtPath = window.location.href;
var lMap = '';
var crtName = window.location.hostname;
var fullName = window.location.origin + "/";
var relName = window.location.pathname;
var crtLang = crtName.split('.'); crtLang = crtLang[crtLang.length-1];
var srv = document.title.substring(8);
var flinks = new Object();
var windowID = []; // 0-Setup, 1-Overview, 2-distanceTips, 3-notes, 4-Reports, 5-links, 6-editLink, 7-editAnalyzers, 8-seveLog, 9-troopRes

var pageElem42 = [
	'side_info', // 0- include profile.
	'content', // 1- main block in center
	'sidebarAfterContent', // 2- right side. include village list, links, quest.
	'servertime' // 3- server time
	];

var pageElem = pageElem42.slice();

var docDir = ['left', 'right'];
var ltr = true;
if (document.body.className.includes('rtl')) { docDir = ['right', 'left']; ltr = false; }

var sK = 0;
var sM = 1;
var sC = [1.6,1000];

var RB = new Object();
	RB.village_dorf1 = [0];
	RB.village_dorf11 = [0];
	RB.village_dorf12 = [0];
	RB.village_dorf13 = [0];
	RB.village_dorf14 = [0];
	RB.village_Dorf2 = [0,0,0,0,0,0,0,0];
	RB.village_Var = [0,0,0];
	RB.village_PPH = [0,0,0,0,0,0,0,0,0,0,0,0,0];
	RB.overview = [-1,'0'];
	RB.wantsMem = [0,0,0,0,0,0,0,0,0,0];
//						1		2				3				4			5					6				7			8		9			10		11		12	  13, 14	15		16				17				18				19				20					21			22		23		24				25				26
	RB.dictionary = [0,'Ally','Merchants','Tournament Square','Duration','resource balance','Rally point','Marketplace','Barracks','Stable','Workshop','Buy','Attacks',0,'at ','Map','Reinforcement','Attack: Normal','Attack: Raid','Culture points','Crop consumption','capacity','farm-list','','Great Barracks','Great Stable','Hospital'];
	RB.dictFL = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	RB.dictTR = ['none',
		'Legionnaire','Praetorian','Imperian','Equites Legati','Equites Imperatoris','Equites Caesaris','Battering Ram','Fire Catapult','Senator','Settler',
		'Clubswinger','Spearman','Axeman','Scout','Paladin','Teutonic Knight','Ram','Catapult','Chief','Settler',
		'Phalanx','Swordsman','Pathfinder','Theutates Thunder','Druidrider','Haeduan','Ram','Trebuchet','Chieftain','Settler',
		'Rat','Spider','Snake','Bat','Wild Boar','Wolf','Bear','Crocodile','Tiger','Elephant',
		'Pikeman','Thorned Warrior','Guardsman','Birds Of Prey','Axerider','Natarian Knight','War Elephant','Ballista','Natarian Emperor','Settler',
		'Slave Militia','Ash Warden','Khopesh Warrior','Sopdu Explorer','Anhur Guard','Resheph Chariot','Ram','Stone Catapult','Nomarch','Settler',
		'Mercenary','Bowman','Spotter','Steppe Rider','Marksman','Marauder','Ram','Catapult','Logades','Settler',
		'Hoplite','Sentinel','Shieldsman','Twinsteel','Elpida Rider','Corinthian','Ram','Ballista','Ephor','Settler'];
	RB.dictRp = ["Won as attacker without losses.","Won as attacker with losses.","Lost as attacker.",
		"Won as defender without losses.","Won as defender with losses.","Lost as defender with losses.","Lost as defender without losses.",
		"Spying was successful and not detected.","Spying was successful, but detected.","Spying failed.","Spying was stopped successfully.","Spying could not be stopped."];
	var iReports = [1,2,3,4,5,6,7,15,16,17,18,19];
	RB.dictRpFL = Array(12);
	RB.market_fi = [0,0,0,0,0,0,0,0,0,0,0,0];
	RB.tropsI = new Array(800);
	RB.trFL = new Array(71);
	RB.XY = [
		200, 10, // 0-Setup
		700, 430, // 1-Resource bar
		200, 100, // 2-Overview
		5, 400, // 3-Links
		400, 50, // 4-Report&Messages
		400, 130, // 5-Notes
		100, 50, // 6-Alerts
		10, 30, // 7-vlist
		10, 250, // 8-BIGicons
		200, 100, // 9-LinkEdit
		10, 250, // 10-attackInfo
		200, 100 // 11-attackFilter
		];
	RB.vHint = [];
	RB.vList = [];
	RB.attackList = [RunTime[0]];
	RB.bodyH = [0,0,0]; // 0-resourcebar,1-vlist,2-links
	RB.ln3 = []; // links for village
	RB.vBMn = [];

DICT = {
	en: {
		// ingame messages
		ok : "Ok",
		cancel : "Cancel",
		close : "Close",
		save : "Save",
		reset : "Reset",
		overview : "villages overview",
		svers : "script version",
		settings : "settings",
		notes : "notes",
		res90 : "resources to % filling",
		refresh : "refresh",
		warehouse : "Warehouse",
		resources : "Resources",
		troops : "Troops",
		links : "Links",
		linkname : "link name",
		linkdel : "delete link",
		name2 : "second name",
		archive : "Archive",
		arena : "Tournament Square",
		addcur : "add current",
		del : "Delete",
		edit : "edit",
		unpin : "unpin",
		pin : "pin",
		total : "Total",
		noplace : "There is no place!",
		hunger : "hunger",
		duration : "duration",
		deficit : "deficit",
		aclock : "Alarm clock\nhh:mm:ss , hh:mm , mm (from now)",
		consnegat : "Crop consumption in this village is negative. How many minutes needed reserve?",
		bmove : "Move buildings",
		neighbors : "neighbors",
		// settings
		auctions: "Auctions",
		none : "None",
		auto : "auto",
		info : "Information",
		yourrace : "Your tribe",
		sspeed : "Server speed",
		sspeedh : "0 - auto, 1 (1x), 2 (2x), 3 (3x aka speed), ... etc.",
		smapsize : "Map size",
		smapsizeh : "Map size: 0 for autodetect, 401 for 200x200 map, 801 for 400x400 map",
		EgyptiansAndHuns : "Egyptians, Huns or Spartans server",
		EgyptiansAndHunso : ['update','true','false'],
		EgyptiansAndHunsh : "Server with Egyptians, Huns or Spartans tribes",
		servertype : "Travian Server Type",
		servertypeh : "Server types: Travian Legends, Travian Shores of War",
		servertypeo : ['update','Shores of War','Legends'],
		traveloveredge : "Travel over the map's edge",
		traveloveredgeo : ['update','Yes','No'],
		speedart : "Speed artefact",
		racelist : ['Romans','Teutons','Gauls','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "Yellow level of cranny (percent)",
		crannyh : 'normal 80, 70 for classic or artefact plunder',
		builtin : "Built-in tools",
		builtinh : 'red color - most needed resources, green - less needed resources',
		normalize : 'Normalize production',
		normal : "normal",
		banalyze : "Built-in battle analyzer",
		cropfind : "Built-in crop finder",
		adetect : "Attack detector",
		adetecto : ['off','w/o freeze','on'],
		adetecth : "makes hidden requests to the server, violating the rules. may result in punishment.",
		adetectt : "Period of attack detect",
		adetectth : "The first check is always after 5 minutes. Next checks will be after the configured time period.",
		buildhint : "Construction tips",
		onallp : "All pages",
		buildand : "Show building countdown and attack",
		buildandh : 'In the list of villages',
		buildands : ['off','on','wide'],
		sendres : "Show &laquo;send resource/troops&raquo; icons",
		sendmess : "Show &laquo;send message&raquo; icons",
		dorf12links : "Show &laquo;village inside and outside&raquo; icons",
		vtcoords : "Show village coordinates in village table",
		analyzer : "World analyzer",
		bigicon : "Show Rally Point icon",
		addvtable : "Show additional village table",
		addvtableo : ['off','on','stick'],
		opennote : "Automatically open Notes window",
		notesize : "Size of Notes window",
		openoview : "Automatically open villages overview",
		resbar : "Resource bar",
		showres : "Show resource bar in window",
		redbl : "red (in hours)",
		yellowbl: "yellow (in hours)",
		marketpl : "Marketplace",
		npcsum : "Summary for NPC",
		npcsumh : 'in marketplace and buildings',
		bidinc : "Auctions bid increment",
		bidinch : 'Put a value of 0 to disable the function',
		show3x : "Predict the flow of resources at sending with 2x and 3x",
		show3xh : 'may show incorrect data',
		rpandmp : "Rally Point and Marketplace",
		incomres : "Incoming resources info",
		incomreso : ['off','on','with summary','WW mode'],
		troopsI : "Information about troops",
		troopsIo : ['off','on','update'],
		defRP : "Default action for rally point",
		showls : "Show links",
		showAsSN : "Use links as second name",
		showlso : ['off','on','in window'],
		savedls : "Saved links",
		savedd : "Saved data",
		saveddh : 'including Links and Second name. If an Account deleted, or not your computer.',
		savedelall : "Delete all saved data",
		savedelallh : 'Are you sure you want to delete all data, including the links and the second name?',
		scrlang : "Script language",
		youlang : "Browser language",
		notifi : "Notification",
		notification : "notification after construction",
		method : "Method",
		audiourl : "URL of audio file",
		audiotest : "Audio test",
		colorCustomize : "Color options",
		colorHint : "leave empty for the default colors",
		color0 : "Upgrade available",
		color1 : "Upgrade via NPC",
		color2 : "Upgrade not possible <br/>(not enough resources)",
		color3 : "Upgrade not possible <br/>(not enough capacity of granaries/warehouses)",
		color4 : "Final level"
	},
	ru: {
		// ссобщения в игре
		cancel : "Отмена",
		close : "Закрыть",
		overview : "обзор деревень",
		svers : "версия скрипта",
		settings : "настройки",
		notes : "заметки",
		res90 : "к % заполнения склада",
		refresh : "обновить",
		warehouse : "Склады",
		resources : "Запасы",
		troops : "Войска",
		links : "Ссылки",
		linkname : "название ссылки",
		linkdel : "удалить ссылку",
		name2 : "второе имя",
		archive : "Архив",
		arena : "Арена",
		addcur : "добавить эту деревню",
		del : "удалить",
		edit : "изменить",
		unpin : "открепить",
		pin : "закрепить",
		total : "Всего",
		noplace : "Нет места!",
		hunger : "наступление голода",
		duration : "продолжительность",
		deficit : "дефицит",
		consnegat : "Потребление в этой деревне отрицательное. На сколько минут нужен запас?",
		bmove : "Перемещение зданий",
		neighbors : "соседи",
		// настройки
		auctions: "Аукцион",
		none : 'нет',
		auto : "авто.",
		info : "Общая информация",
		yourrace : "Ваш народ",
 		sspeed : "Скорость сервера",
		sspeedh : "0 - авто, 1 (1x), 2 (2x), 3 (3x или скоростной), ...",
		speedart : "Артефакт скорости",
		racelist : ['Римляне','Германцы','Галлы','Nature','Натары','Египтяне','Гунны','Spartans'],
		cranny : "желтый уровень занятости тайника (проценты)",
		crannyh : 'норма - 80, 70 для классического сервера или для артефакта грабителя',
		builtin : "Встроенные инструменты",
		builtinh : 'для нормального производства: красный цвет - самый необходимый ресурс, зелёный - лишнее производство',
		normalize : 'Нормальное производство',
		normal : "ресурсы",
		banalyze : "Встроенный анализатор боя",
		cropfind : "Встроенный поиск свободных хлебных клеток",
		adetect : "Обнаружение нападения",
		adetecto : ['выкл.','без заморозки','включено'],
		adetecth : "делает скрытые обращения к серверу, нарушая правила. может повлечь наказание.",
		adetectt : "период обнаружения",
		buildhint : "Подсказки возможности строительсва",
		onallp : "На всех страничках",
		buildand : "Показывать таймер построек и атаки",
		buildandh : 'отображается как часики в списке деревень',
		buildands : ['нет','да','широкий'],
		sendres : "Показывать иконки &laquo;отослать ресурсы/войска&raquo;",
		sendmess : "Показывать иконки &laquo;отослать сообщение&raquo;",
		analyzer : "Анализатор мира",
		bigicon : "Показывать Пункт сбора икон",
		addvtable : "Показывать дополнительную таблицу деревень",
		addvtableo : ['нет','да','приклеить'],
		opennote : "Автоматически открывать заметки",
		notesize : "Размер окна заметок",
		openoview : "Автоматически открывать обзор деревень",
		resbar : "Таблица ресурсов",
		showres : "Показывать таблицу ресурсов в окне",
		redbl : "красный (в часах)",
		yellowbl: "желтый (в часах)",
		marketpl : "Рынок",
		npcsum : "сумма ресурсов для NPC",
		npcsumh : 'на рынке и стройках',
		bidinc : "шаг ставки",
		bidinch : 'для аукционов травиан версии 4',
		show3x : "показывать возможно неверные данные",
		show3xh : 'попытка предсказать поступление ресурсов при 3x и 2x отправке',
		rpandmp : "Пункт сбора и рынок",
		incomres : "информация о поступающих ресурсах",
		incomreso : ['нет','есть','с итогами','Чудо режим'],
		troopsI : "Информация о войсках",
		troopsIo : ['нет','да','обновить'],
		defRP : "действие по умолчанию для пункта сбора",
		showls : "Показывать ссылки",
		showAsSN : "Использовать ссылки как второе имя",
		showlso : ['нет','да','в окне'],
		savedls : "сохранённые ссылки",
		savedd : "сохранённые данные",
		saveddh : 'включая Ссылки и Второе имя деревень. Если учетная запись удаляется или это не ваш компьютер.',
		savedelall : "удалить все данные",
		savedelallh : 'Вы уверены, что хотите удалить все данные, включая Ссылки и Второе имя деревень?',
		scrlang : "Язык скрипта",
		youlang : "Ваш язык",
		notifi : "напоминания",
		notification : "оповищение после строительства",
		method : "метод",
		audiourl : "URL звукового файла",
		audiotest : "проверить звук",
		colorCustomize : "Настройки цвета",
		colorHint : "оставьте пустым для цвета по умолчанию",
		color0 : "развитие возможно",
		color1 : "развитие возможно с NPC",
		color2 : "развитие невозможно <br/>(недостаточно ресурсов)",
		color3 : "развитие невозможно <br/>(недостаточная вместимость склада/амбара)",
		color4 : "максимальный уровень"
	},
	ua: { fb : "ru",
		cancel : "Скасувати",
		close : "Закрити",
		overview : "огляд поселень",
		svers : "версія скріпта",
		settings : "налаштування",
		notes : "нотатки",
		res90 : "к % заповнення складу",
		refresh : "Оновити",
		warehouse : "Склади",
		resources : "Запаси",
		troops : "Війська",
		links : "Посилання",
		linkname : "назва посилання",
		linkdel : "видалити посилання",
		name2 : "друге ім'я",
		archive : "Архів",
		addcur : "додати це поселення",
		del : "видалити",
		edit : "змінити",
		unpin : "відкріпити",
		pin : "закріпити",
		total : "Всього",
		noplace : "Нема місця!",
		hunger : "настає голод",
		duration : "тривалість",
		deficit : "дефіцит",
		consnegat : "Споживання у цьому поселенні від'ємне. На скількі хвилин потрібен запас?",
		bmove : "Переміщення будівель",
		neighbors : "сусіди",
		// настройки
		auctions: "Аукціон",
		none : 'нема',
		auto : "авто.",
		info : "Загальна інформація",
		yourrace : "Ваш народ",
 		sspeed : "Швидкість сервера",
		sspeedh : "0 - авто, 1 (1x), 2 (2x), 3 (3x або швидкісний), ...",
		speedart : "Артефакт швидкості",
		racelist : ['Римляни','Тевтонці','Галли','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "Жовтий рівень зайнятості схованки (проценти)",
		crannyh : 'норма - 80, 70 для класичного сервера або для артефакту злодія',
		builtin : "Вбудовані інструменти",
		builtinh : 'для нормального виробництва: червоний колір - самий необхідний ресурс, зелений - надлишкове виробництво',
		normalize : 'Нормальне виробництво',
		normal : "ресурси",
		banalyze : "Аналізатор боя",
		cropfind : "Пошук вільних хлібних клітин",
		adetect : "Виявлення нападу",
		adetecto : ['вимкнуте','без заморозки','увімкнено'],
		adetecth : "робить скриті звернення до серверу, порушуя правила. може викликати покарання.",
		adetectt : "Період виявлення",
		buildhint : "Підказки можливості будівництва",
		onallp : "На всіх сторінках",
		buildand : "Відображати таймер будівництва і атаки",
		buildandh : 'відображається як таймер у списку поселень',
		buildands : ['ні','так','широкий'],
		sendres : "Відображати іконки &laquo;відіслати ресурси/війска&raquo;",
		sendmess : "Відображати іконки &laquo;відіслати листа&raquo;",
		analyzer : "Аналізатор світу",
		bigicon : "Відображати Пункт сбора икон",
		addvtable : "Відображати додаткову таблицю поселень",
		addvtableo : ['ні','так','приклеїти'],
		opennote : "Автоматично відкривати нотатки",
		notesize : "Розмір вікна нотаток",
		openoview : "Автоматично відкривати огляд поселень",
		resbar : "Таблиця ресурсів",
		showres : "Відображати таблицю ресурсів в окні",
		redbl : "Червоний (в таймері)",
		yellowbl: "Жовтий (в таймері)",
		marketpl : "Ринок",
		npcsum : "сума ресурсів для NPC",
		npcsumh : 'На ринку та будівництвах',
		bidinc : "Крок ставки",
		bidinch : 'для аукціонів травіан версії 4',
		show3x : "Відображати можливо хибні відомості",
		show3xh : 'спроба передбачити надходженя ресурсів при 3x і 2x відсиланні',
		rpandmp : "Пункт сбору та ринок",
		incomres : "Інформація о надходжені ресурсів",
		incomreso : ['ні','так','з підсумками','Чудо режим'],
		troopsI : "Інформація по війсках",
		troopsIo : ['ні','так','оновити'],
		defRP : "Дія за замовченням для пункту сбору",
		showls : "Відображати посилання",
		showAsSN : "Використовувати посилання як друге ім’я",
		showlso : ['ні','так','в окні'],
		savedls : "збережені посилання",
		savedd : "Збережені данні",
		saveddh : 'включає Посилання і Друге ім’я поселення. Якщо обліковий запис відаляєтся або це не Ваш комп’ютер.',
		savedelall : "видалити всі данні",
		savedelallh : 'Ви впевнені, що бажаєте відалити всі данні, включаючи Посилання і Друге ім’я поселень?',
		scrlang : "Мова скрипта",
		youlang : "Ваша мова",
		notifi : "Нагадування",
		notification : "сповіщення після будівництва",
		method : "Метод",
		audiourl : "URL звукового файла",
		audiotest : "Перевірити звук",
		colorCustomize : "Налаштування кольору",
		colorHint : "залиште порожнім для кольору за замовченням",
		color0 : "Розвиток можливий",
		color1 : "Розвиток можливий с NPC",
		color2 : "Розвиток неможливий <br/>(недостатньо ресурсів)",
		color3 : "Розвиток неможливий <br/>(недостатня ємкість складу/комори)",
		color4 : "Максимальний рівень"
	},
	hu: { // Hungarian language. thx mrzed :)
		// ingame messages
		cancel : "Mégse",
		close : "Bezár",
		overview : "áttekintés",
		svers : "szkript verzó",
		settings : "beállítások",
		notes : "jegyzetek",
		res90 : "nyersanyagokat %-ig feltölteni",
		refresh : "frissít",
		warehouse : "Raktárépület",
		resources : "Nyersanyagok",
		troops : "Csapatok",
		links : "Linkek",
		linkname : "link név",
		linkdel : "link törlése",
		name2 : "második név",
		archive : "Archívum",
		arena : "Gyakorlótér",
		total : "Összesen",
		// settings
		auctions: "Árverések",
		none : "Nincs",
		info : "Információk",
		yourrace : "Nép",
		speedart : "Sebesség ereklye",
		racelist : ['Római','Germán','Gall','Nature','Natars','Egyptians','Huns','Spartans'],
		onallp : "Minden oldal",
		buildand : "Visszaszámlálók megjelenítése",
		buildandh : 'A faluk listájában (építkezések, csapatmozgások)',
		sendres : "Nyersanyag-/csapatküldés ikonok megjelenítése",
		sendmess : "Üzenetküldés ikonok megjelenítése",
		bigicon : "Gyülekezőtér ikon megjelenítése",
		opennote : "Jegyzetek automatikus megnyitása",
		resbar : "Nyersanyagkijelző",
		showres : "Nyersanyagkijelző külön ablakban",
		redbl : "piros (órában)",
		yellowbl: "sárga (órában)",
		marketpl : "Piactér",
		rpandmp : "Gyülekezőtér és piactér",
		incomres : "Információ az érkező nyersanyagokról",
		incomreso : ['ki','be','összefoglaló','WW mode'],
		troopsI : "Csapatinformációk",
		showls : "Linkek megjelenítése",
		showlso : ['ki','be','ablakban'],
		savedls : "Mentett linkek",
		scrlang : "Szkript nyelve",
		youlang : "Az Ön nyelve"
		//version = verzió
		//Rally point = Gyülekezőtér
	},
	fa: { // Persian, thx Reza Moghadam
		// ingame messages
		ok : "موافقم",
		cancel : "لغو",
		close : "بستن",
		overview : "مرور کلی",
		svers : "ورژن اسکریپت",
		settings : "تنظیمات",
		notes : "متن",
		res90 : "% منابع پر است",
		warehouse : "انبار",
		resources : "منابع",
		troops : "لشکریان",
		links : "لینک ها",
		archive : "آرشیو",
		arena : "میدان تمرین",
		// settings
		info : "اطلاعات",
		yourrace : "دسته ی شما",
		speedart : "سرعت مصنوعی",
		racelist : ['رومی ها','توتن ها','گل ها','Nature','Natars','Egyptians','Huns','Spartans'],
		onallp : "همه ی صفحات",
		buildand : "نمایش شمارش معکوس ساختمان و حمله",
		buildandh : 'در لیست روستا ها',
		sendres : "نمایش آیکون های ارسال منابع/سربازان",
		sendmess : "نمایش آیکون های ارسال پیام",
		bigicon : "نمایش آیکون اردوگاه",
		opennote : "بازشدن خودکار متن ها",
		resbar : "نوار منابع",
		showres : "نمایش نوار منابع در پنجره",
		redbl : "قرمز (در ساعت)",
		yellowbl: "زرد (در ساعت)",
		marketpl : "بازار",
		rpandmp : "اردوگاه و بازار",
		incomres : "دریافت اطلاعات منابع",
		incomreso : ['خاموش','روشن','خلاصه','WW mode'],
		showls : "نمایش لیننک ها",
		showlso : ['خاموش','روشن','در پنجره'],
		savedls : "ذخیره سازی لینک ها"
	},
 ar: { // Arabic, thx ww_start_t
		// ingame messages
		ok : "موافق",
		cancel : "إلغاء الأمر",
		close : "إغلاق",
		overview : "نظرة عامة على جميع القرى",
		svers : "أصدار السكربت",
		settings : "الأعدادات",
		notes : "دفتر الملاحظات",
		res90 : "الموارد حتى % للحد الأقصى",
		refresh : "تحديث",
		warehouse : "المخزن",
		resources : "الموارد",
		troops : "القوات",
		links : "الروابط",
		linkname : "أسم الرابط",
		linkdel : "حذف الرابط",
		name2 : "الأسم التالي",
		archive : "الأرشيف",
		arena : "ساحة البطولة",
		addcur : "أضافة",
		del : "أمسح",
		edit : "تعديل",
		unpin : "لم يتم أصلاحة",
		pin : "تم أصلاحة",
		total : "المجموع",
		noplace : "لايوجد سكن!",
		hunger : "جوع",
		duration : "المدة",
		deficit : "لايمكن",
		aclock : "المنبة\nhh:mm:ss , hh:mm , mm (من الوقت الحالي)",
		consnegat : "استهلاك القمح لهذه القرية سالب. كم دقيقة احتياطية تحتاج؟",
		bmove : "تحريك المباني",
		neighbors : "الجيران",
		// settings
		auctions: "مزادات",
		none : "لاشيء",
		auto : "آلي",
		info : "المعلومات",
		yourrace : "قبيلتك",
		speedart : "السرعة",
		racelist : ['الرومان','الجرمان','الأغريق','Nature','الناتار','الفراعنة','المغول','Spartans'],
		cranny : "النسبة للون الأصفر للمخبأ (النسبة)",
		crannyh : 'الأفتراضي 80, 70 للكلاسيك',
		builtin : "الأدوات-المبنية",
		builtinh : 'ألوان انتاج الموارد: اللون الأحمر - للأقل انتاج, اللون الأخضر - للأكثر انتاج',
		normalize : 'انتاج الموارد',
		normal : "الأفتراضي",
		banalyze : "مبني على - محاكي المعارك",
		cropfind : "مبني على - باحث عن القرى القمحية",
		adetect : "كاشف الهجمات(غير مستحسن)",
		adetecto : ['معطل','تعليق عند معجزة العالم','تفعيل'],
		adetecth : "يرسل طلبات مخفية الى السيرفر, يتم اختراق قوانين اللعبة. وقد يتم ايقاف حسابك.",
		adetectt : "فترة كاشف الهجوم",
		buildhint : "نصائح البناء",
		onallp : "الأدوات التي تعمل على جميع الصفحات",
		buildand : "اظهار وقت المباني والهجمات بجانب قائمة القرى ",
		buildandh : 'في قائمة القرى',
		sendres : "أظهار ايقونات ارسال موارد وقوات",
		sendmess : "عرض ايقونة ارسال رسالة بجانب كل لاعب",
		analyzer : "محلل السيرفر",
		bigicon : "أظهار قائمة نقطة التجمع",
		addvtable : "عرض جدول القرى",
		addvtableo : ['معطل','تشغيل','تعليق'],
		opennote : "فتح دفتر الملاحظات آلياً",
		notesize : "حجم دفتر الملاحظات",
		openoview : "فتح نافذه نظره عامه إلياً",
		resbar : "شريط الموارد",
		showres : "عرض شريط الموارد في نافذة متحركة",
		redbl : "اللون الأحمر (لكل ساعة)",
		yellowbl: "اللون الأصفر (لكل ساعة)",
		marketpl : "السوق",
		npcsum : "ملخص تاجر المبادلة",
		npcsumh : 'في السوق والمباني',
		bidinc : "المزايدة الحالية",
		bidinch : 'لترافيان النسخة4',
		show3x : "قد لايتم عرض البيانات بشكل صحيح",
		show3xh : 'محاول التنبؤ عند وجود كمية من الموارد عند ارسال موارد 3 مرات أو مرتين',
		rpandmp : "نقطة التجمع و السوق",
		incomres : "عرض معلومات عن الموارد القادمة",
		incomreso : ['معطل','تشغيل','مع المحلل','نمط معجزة العالم'],
		troopsI : "المعلومات حول القوات",
		troopsIo : ['معطل','تشغيل','مساعدة في البحث'],
		defRP : "الأجراء الأفتراضي لنقطة التجمع",
		showls : "عرض الروابط",
		showAsSN : "أستعمل الأسم التالي كـ الأسم الافتراضي",
		showlso : ['معطل','تشغيل','تشغيل في نافذة'],
		savedls : "الروابط المحفوظة",
		savedd : "البيانات المحفوظة",
		saveddh : 'بما في ذلك الروابط والأسم التالي. إذا حُذف الحساب, أو ليس الكمبيوتر الخاص بك.',
		savedelall : "مسح جميع البيانات المحفوظة",
		savedelallh : 'هل أنت متأكد من حذف جميع البيانات المحفوظة, بما في ذلك الروابط والأسم التالي؟',
		scrlang : "لغة السكربت",
		youlang : "لغتك",
		notifi : "الإبلاغ",
		notification : "إبلاغي عند أنتهاء المبنى من البناء",
		method : "الأسلوب",
		audiourl : "الرابط الخاص بالصوت",
		audiotest : "أختبار الصوت",
		colorCustomize : "إعدادات الألوان",
		colorHint : "أترك المربع فارغ لأختيار اللون الأساسي",
		color0 : "التطوير متاح",
		color1 : "يمكن التطوير عن طريق تاجر المبادله NPC",
		color2 : "لايمكن التطوير (لاتوجد موارد كافيه)",
		color3 : "لايمكن التطوير (يجب رفع مستوى مخزن الحبوب أو المخزن)",
		color4 : "اللون لـ أقصى مستوى للمبنى"
	},
	fr: { // French translation , thx azukae09
		// ingame messages
		ok : "Ok",
		cancel : "Annuler",
		close : "Fermer",
		overview : "Résumé",
		svers : "Version du script",
		settings : "configuration",
		notes : "notes",
		res90 : "Ressources à % de la capacité",
		refresh : "rafraichir",
		warehouse : "Entrepôt",
		resources : "Ressources",
		troops : "Troupes",
		links : "Liens",
		linkname : "nom du lien",
		linkdel : "supprimer lien",
		name2 : "deuxième nom",
		archive : "Archive",
		arena : "Place du tournoi",
		addcur : "ajouter celui présent",
		del : "supprimer",
		edit : "éditer",
		total : "Total",
		// settings
		auctions: "Enchères",
		none : 'Aucun',
		info : "Information",
		yourrace : "Votre peuple",
		speedart : "Artefact de vitesse",
		racelist : ['Romains','Germains','Gaulois','Nature','Natars','Égyptiens','Huns','Spartans'],
		onallp : "Toutes les pages",
		buildand : "Montrer le compte à rebours pour les constructions et les attaques",
		buildandh : 'Dans la liste des villages',
		sendres : "Afficher les icônes &laquo;envoyer ressources/troupes&raquo;",
		sendmess : "Afficher les icônes &laquo;envoyer message&raquo;",
		analyzer : "Outils et statistiques",
		bigicon : "Afficher le Place de rassemblement icône",
		opennote : "Ouvrir automatiquement les notes",
		resbar : "Barre des ressources",
		showres : "Montrer la barre des ressources dans une fenêtre",
		redbl : "Rouge (en heures)",
		yellowbl: "Jaune (en heures)",
		marketpl : "Place du marché",
		rpandmp : "Place du rassemblement et place du marché",
		incomres : "Info sur les ressources arrivant",
		incomreso : ['Non','Oui','Avec résumé','WW mode'],
		showls : "Afficher les liens",
		showlso : ['Non','Oui','Dans une fenêtre'],
		savedls : "Sauver les liens",
		scrlang : "Choix de la langue",
		youlang : "Langue du navigateur",
		noplace : "Plus de place!",
		hunger : "Faim",
		duration : "Durée",
		deficit : "Déficit",
		cranny : "Niveau jaune pour la cachette (pourcentage)",
		crannyh : 'Normal 80, 70 pour classique or artefact de pillage',
		builtin : "Outils integrés",
		builtinh : 'Pour normaliser la production; rouge ressource la plus demandée, vert, ressource la moins necessaire',
		normalize : 'Normalisation de la production',
		normal : "Normal",
		banalyze : "Analiseur intégré de bataille",
		cropfind : "Recherche intégrée de champs",
		adetect : "Detection des attaques",
		adetecto : ['off','sans freeze','on'],
		adetecth : "Fait des requetes masquées au serveur, ce qui viole les règles et peut ocasionner une sanction",
		adetectt : "Période de détection des attaques",
		addvtable : "afficher le tableau additionnel des villages",
		npcsum : "Résumé pour le marchand pnj",
		npcsumh : 'Dans les marchés et batiments',
		bidinc : "Incrément d'enchère",
		bidinch : 'Pour les enchères dans travian4',
		savedelallh : 'Etes vous sur d\'effacer les données sauvegardées (y compris les liens et le second nom)',
		notification : "Notification après construction",
		method : "Méthode",
		audiourl : "URL de fichier audio",
		audiotest : "test audio"
	},
	hr: { // Croatian translation, thx semiRocket
		// ingame messages
		ok : "U redu",
		cancel : "Odustani",
		close : "Zatvori",
		overview : "Pregled",
		svers : "Verzija skripte",
		settings : "Postavke",
		notes : "Zabilješke",
		res90 : "Resursi do % ispunjenja",
		refresh : "Osvježi",
		warehouse : "Skladište",
		resources : "Resursi",
		troops : "Vojska",
		links : "Poveznice",
		linkname : "Ime poveznice",
		linkdel : "Izbriši poveznicu",
		name2 : "Drugi naziv",
		archive : "Arhiva",
		arena : "Arena",
		addcur : "Dodaj trenutno",
		del : "Izbriši",
		edit : "Uredi",
		unpin : "Skini",
		pin : "Pričvrsti",
		total : "Ukupno",
		noplace : "Nema mjesta!",
		hunger : "glad",
		duration : "trajanje",
		deficit : "manjak",
		aclock : "Alarm \nhh:mm:ss , hh:mm , mm (unazad)",
		consnegat : "Potrošnja hrane u naselju je negativna. Koliko minuta želite pričuve?",
		bmove : "Premještanje građevina",
		neighbors : "susjedi",
		// settings
		auctions: "Aukcije",
		none : 'Ništa',
		auto : "automatsko",
		info : "Informacije",
		yourrace : "Tvoja jedinica",
		speedart : "Artefakt za brzinu",
		racelist : ['Rimljani','Teutonci','Gali','Nature','Natars','Egipćani','Huni','Spartans'],
		cranny : "Žuta razina žitnice (postotak)",
		crannyh : 'Normalno 80, 70 za klasične pljačke ili artefakt',
		builtin : "Ugrađeni alati",
		builtinh : 'Normalizacija produkcije: crveno najviše potrebni, a zeleno manje potrebni resursi',
		normalize : 'Normalizacija produkcije',
		normal : "Normalno",
		banalyze : "Ugrađeni analizator bitke",
		cropfind : "Ugrađena tražilica žitnih (crop) polja",
		adetect : "Detektiranje napada",
		adetecto : ['Isključeno','Bez zamrzavanja','Uključeno'],
		adetecth : "Radi skrivene zahtjeve prema poslužitelju kršeći pravila. Može dovesti do kazni.",
		adetectt : "Razdoblje detektiranja napada",
		buildhint : "Savjeti za gradnju",
		onallp : "Sve stranice",
		buildand : "Prikaži odbrojavanje izgradnje i napada",
		buildandh : 'Prikazuje se u listi naselja',
		buildands : ['Isključeno','Uključeno','Prostrano'],
		sendres : "Prikaži ikonice «šalji resurse/vojska»",
		sendmess : "Prikaži ikonicu «šalji poruku»",
		analyzer : "Analizator svijeta",
		bigicon : "Prikaži Okupljalište ikona",
		addvtable : "Prikaži dodatnu tablicu naselja",
		addvtableo : ['Isključeno','Uključeno','Zalijepljeno'],
		opennote : "Automatski otvori zabilješke",
		notesize : "Veličina prozora za zabilješke",
		openoview : "Automatski otvori pregled naselja",
		resbar : "Grafikon resursa",
		showres : "Prikaži grafikon u zasebnom prozoru",
		redbl : "Crveno (u satima)",
		yellowbl: "Žuto (u satima)",
		marketpl : "Tržnica",
		npcsum : "Sažetak za NPC",
		npcsumh : 'Prikaz u tržnici i zgradama',
		bidinc : "Povećanje ponude",
		bidinch : 'Koristi se za aukcije (Travian 4)',
		show3x : "Predviđanje kretanja kod 2x i 3x",
		show3xh : 'Pokušava predvijeti kretanje resursa kod slanja 2x i 3x (Može prikazati neispravne podatke)',
		rpandmp : "Okupljalište i Tržnica",
		incomres : "Informacije o dolazećim resursima",
		incomreso : ['Isključeno','Uključeno','S kratkim pregledom','WW mod'],
		troopsI : "Informacije o trupama",
		troopsIo : ['Isključeno','Uključeno','Skeniraj upute'],
		defRP : "Predpostavljena akcija za slanje vojske",
		showls : "Prikaži poveznice",
		showAsSN : "Koristi naziv poveznice kao drugo ime lokacije",
		showlso : ['Isključeno','Uključeno','U zasebnom prozoru'],
		savedls : "Spremljene poveznice",
		savedd : "Pohranjeni podaci",
		saveddh : 'Uključuje linkove i druge nazive naselja. Korisno ako se račun briše ili ne koristi na Vašem računalu.',
		savedelall : "Izbriši sve pohranjene podatke",
		savedelallh : 'Jeste li sigurni da želite izbrisati sve pohranjene podatke, uključujući linkove i druge nazive naselja?',
		scrlang : "Jezik skripte",
		youlang : "Tvoj jezik",
		notifi : "Obavijest",
		notification : "obavijest nakon gradnje",
		method : "Metoda",
		audiourl : "URL audio datoteke",
		audiotest : "Testiraj audio",
		colorCustomize : "Opcije boja",
		colorHint : "Pustiti prazno za predpostavljenu boju",
		color0 : "Nadogradnja dostupna",
		color1 : "Nadogradnja dostupna putem NPC-a",
		color2 : "Nadogradnja nije dostupna <br/>(Manjak resursa)",
		color3 : "Nadogradnja nije dostupna <br/>(Nedovoljna razina Skladišta/Žitnica)",
		color4 : "Nadograđeno do kraja"
	},
	bs: { fb : "hr", // Bosnian
		arena : "Mejdan",
		marketpl : "Pijaca",
		npcsumh : 'Prikaz na pijaci i zgradama',
		rpandmp : "Mjesto okupljanja i Pijaca",
		color3 : "Nadogradnja nije dostupna (Nedovoljna razina Skladišta/Silosa)"
	},
	de: { // German language, thx proll007
		// ingame messages
		ok : "Ok",
		cancel : "Abbrechen",
		close : "Schliessen",
		overview : "Ueberblick",
		svers : "Script Version",
		settings : "Einstellungen",
		notes : "Notizen",
		res90 : "Ressourcen zu % gefuellt",
		refresh : "Refresh",
		warehouse : "Warenhaus",
		resources : "Ressourcen",
		troops : "Einheiten",
		links : "Links",
		linkname : "Linkname",
		linkdel : "Link loeschen",
		name2 : "Zweiter Name",
		archive : "Archiv",
		arena : "Arena",
		addcur : "aktuelle hinzufuegen",
		del : "loeschen",
		edit : "bearbeiten",
		total : "Total",
		// settings
		auctions: "Auktionen",
		info : "Information",
		yourrace : "Deine Rasse",
		speedart : "Geschwindigkeitsartefakt",
		racelist : ['Römer','Germanen','Gallier','Natur','Nataren','Ägypter','Hunnen','Spartans'],
		onallp : "Alle Seiten",
		buildand : "Zeige den Countdown fuer Gebaeude und Einheiten",
		buildandh : 'In der Liste der Doerfer',
		sendres : "Zeige &laquo;sende Ressourcen/Truppen&raquo; Icons",
		sendmess : "Zeige &laquo;sende Nachricht&raquo; Icons",
		analyzer : "World-Analyzer",
		bigicon : "Zeige Versammlungsplatz Icon",
		opennote : "Oeffne Notizen automatisch",
		resbar : "Ressourcenleiste",
		showres : "Zeige Ressourcenleiste im Fenster",
		redbl : "Rot (in Stunden)",
		yellowbl: "Gelb (in Stunden)",
		marketpl : "Marktplatz",
		rpandmp : "Versammlungsplatz und Marktplatz",
		incomres : "eingehende Ressourceninfo",
		incomreso : ['aus','an','mit Summe','WW mode'],
		showls : "Zeige Links",
		showlso : ['aus','an','im Fenster'],
		savedls : "Gespeicherte Links",
		scrlang : "Scriptsprache",
		youlang : "Deine Sprache",

		// add by Cyrusx
		none : 'Nichts',
		hunger : "Hunger",
		duration : "Dauer",
		deficit : "Mangel",

		troopsI : "Information über Truppen",
		troopsIo : ['aus','an','scan Hilfe'],
		notification : "Benachrichtigung wenn Bau komplett",
		method : "Methode",
		audiourl : "URL der Audiodatei",
		audiotest : "Audiotest",
		auto : "auto",

		builtin : "Eingebaute Tools",
		builtinh : 'zur Vereinheitlichung der Produktion: Rot - meist benötigte Ressource, Grün - am wenigsten benötigte Ressource',
		normalize : 'Vereinheitlichung der Produktion',
		normal : "Normal",
		banalyze : "Eingebaute Kampfanalyse",
		cropfind : "Eingebauter Getreidefinder",
		addvtable : "Zeige zusätzliche Dorfübersicht",
		npcsum : "NPC Übersicht",
		npcsumh : 'Im Marktplatz und Gebäuden',
		bidinc : "Gebotserhöhung",
		bidinch : 'Für Auktionen in Travian4',
		defRP : "Voreinstellung für Versammlungsplatz",
		savedd : "gespeichert",
		saveddh : 'gespeicherte Links sowie Name, falls Account gelöscht oder nicht Dein Computer',
		savedelall : "Lösche alle gespeicherten Dateien",
		savedelallh : 'Wirklich alles Löschen, inkl. Links und Name?',
		notifi : "Benachrichtigung"
	},
	pt: { // Portuguese language, thx Kendra
		//traduzido por Miguel & Sam - br7
		// mensagens no jogo
		ok : "Ok",
		cancel : "Cancelar",
		close : "Fechar",
		overview : "Resumo",
		svers : "Versão do Script",
		settings : "Definições",
		notes : "notas",
		res90 : "% de recursos para encher",
		refresh : "atualizar",
		warehouse : "Armazém",
		resources : "Recursos",
		troops : "Tropas",
		links : "Links",
		linkname : "nome do link",
		linkdel : "apagar link",
		name2 : "segundo nome",
		archive : "Arquivo",
		arena : "Praça de Torneios",
		addcur : "adicionar atual",
		del : "apagar",
		edit : "editar",
		unpin : "soltar",
		pin : "fixar",
		total : "Total",
		noplace : "Não tem mais espaço!",
		hunger : "fome",
		duration : "duração",
		deficit : "em falta",
		aclock : "Alarme\nhh:mm:ss , hh:mm , mm (a partir de agora)",
		consnegat : "O consumo na aldeia está negativo. Quantos minutos precisará de reserva?",
		bmove : "Mover Edificio",
		neighbors : "vizinhos",
		// definições
		auctions: "Leilões",
		none : "Nenhum",
		auto : "automático",
		info : "Informação",
		yourrace : "Sua raça",
		sspeed : "Servidor speed",
		sspeedh : "0 - automático, 1 (1x), 2 (2x), 3 (3x), ... etc.",
		speedart : "Velocidade do artefato",
		racelist : ['Romanos','Teutões','Gauleses','Natureza','Natares','Egípcios','Hunos','Spartans'],
		cranny : "Nível do cereal por celeiro (Porcentagem)",
		crannyh : 'Pré-definido com 80%, 70% para pilhagem normal ou artefato',
		builtin : "Ferramentas Internas",
		builtinh : 'Para equilibrar a produção: a cor Vermelha - recursos que mais precisam; Verde - recursos que menos precisam',
		normalize : 'Equilibrar a produção',
		normal : "normal",
		banalyze : "Analisador de Ataque",
		cropfind : "Localizador de Crop's",
		adetect : "Detectar ataques",
		adetecto : ['Desligado','Modo Congelado','Ligado'],
		adetecth : "Esta opção utiliza ações ocultas no servidor, violando as regras. Poderá levar a punição do jogo.",
		adetectt : "periodo de detectar ataques",
		buildhint : "Dicas de Construção",
		onallp : "Todas as páginas",
		buildand : "Mostrar construção em contagem regressiva e atacar",
		buildandh : 'Na lista das aldeias',
		buildands : ['Desligado','Ligado','Amplo'],
		sendres : "Mostrar &laquo;Enviar reforços/tropas&raquo; icons",
		sendmess : "Mostrar &laquo;Enviar mensagem&raquo; icons",
		analyzer : "Site de ferramenta de analise",
		bigicon : "Mostrar Ponto de encontro ícone",
		addvtable : "Mostrar tabela de aldeias",
		addvtableo : ['Desligado','Ligado','Bloqueado'],
		opennote : "Abrir notas automaticamente",
		notesize : "Tamanha da janela para notas",
		openoview : "Abrir visão detalhada das aldeias",
		resbar : "Barra de Recursos",
		showres : "Mostrar barra de recursos na janela",
		redbl : "vermelho (em horas)",
		yellowbl: "amarelo (em horas)",
		marketpl : "Mercado",
		npcsum : "Resumo para NPC",
		npcsumh : 'Apareçe nos mercado e nos edificios',
		bidinc : "Valor aumentado automaticamente no leilão",
		bidinch : 'Só disponivel para a versão Travian 4',
		show3x : "Fluxo de recursos",
		show3xh : 'Tentativa de prever o fluxo de recursos no envio de 2x e 3x (Pode mostrar dados incorretos)',
		rpandmp : "Ponto de encontro e Mercado",
		incomres : "informações de recursos recebidos",
		incomreso : ['desligado','ligado','com sumário','Modo WW'],
		troopsI : "Informações sobre as tropas",
		troopsIo : ['Desligado','Ligado','Actualizado'],
		defRP : "Ação pré-definida no envio de tropas",
		showls : "Mostrar links",
		showAsSN : "Usar links como segundo nome",
		showlso : ['desligado','ligado','na janela'],
		savedls : "Links salvos",
		savedd : "Salvar dados",
		saveddh : 'incluindo links e segundo nome. Se uma conta excluída, ou não o seu computador.',
		savedelall : "Apagar todos os dados salvos",
		savedelallh :  'Tem certeza que deseja apagar todos os dados, incluindo os links e o segundo nome?',
		scrlang : "Idioma do Script",
		youlang : "Seu idioma",
		notifi : "Notificações",
		notification : "notificação após a construção",
		method : "Método",
		audiourl : "Link do ficheiro de audio",
		audiotest : "Testar Audio",
		colorCustomize : "Opções de Cores",
		colorHint : "Deixe em branco para a cor padrão",
		color0 : "Pronto para evoluir",
		color1 : "Evoluir fazendo NPC",
		color2 : "Não é possível evoluir <br/>(Falta de recursos)",
		color3 : "Não é possível evoluir <br/>(Não tem armazem e/ou celeiro suficiente)",
		color4 : "Completamente Evoluido"
	},
	bg: { // Bulgarian language, thx Dushevadeca
		// ingame messages 
		ok : "Потвърди",
		cancel : "Отмени",
		close : "Затвори",
		overview : "преглед на селата",
		svers : "версия на скрипта",
		settings : "настройки",
		notes : "бележки",
		res90 : "ресурси за %-но запълване на склада",
		refresh : "опресни",
		warehouse : "Склад",
		resources : "Ресурси",
		troops : "Войски",
		links : "Бързи отметки",
		linkname : "име на отметката",
		linkdel : "изтрий отметката",
		name2 : "допълнително име",
		archive : "Архив",
		arena : "Арена",
		addcur : "добави текущата",
		del : "изтрий",
		edit : "редакция",
		unpin : "възстанови поправката",
		pin : "поправи",
		total : "Общо",
		noplace : "Там няма място!",
		hunger : "гладуване",
		duration : "продължителност",
		deficit : "дефицит",
		aclock : "Аларма в\nhh:mm:ss , hh:mm , mm (от сега)",
		consnegat : "Консумацията на жито е негативна. От колко минути запас има нужда?",
		bmove : "Премести сградите",
		neighbors : "съседи",
		// settings
		auctions: "Търгове",
		none : "Няма",
		auto : "автоматично",
		info : "Информация",
		yourrace : "Вашето племе",
		speedart : "Скоростен артефакт",
		racelist : ['Рим','Тевтонци','Гали','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "предупредително(жълто) ниво на запълване на скривалището (в проценти)",
		crannyh : 'нормално- 80, 70- за класически светове или с грабителски артефакт',
		builtin : "Вградени инструменти",
		builtinh : 'за оптимизиране на производството: червено - най-необходимите ресурси, зелено - най-малко нужни',
		normalize : 'Оптимизиране на производството',
		normal : "за ресурси",
		banalyze : "Вграден анализатор на битката",
		cropfind : "Вградена търсачка за житни села",
		adetect : "Откриване на атака",
		adetecto : ['изкл.','без замръзване','вкл.'],
		adetecth : "отправя скрити заявки към сървъра, в нарушение на правилата - МОЖЕ да доведе до наказание!",
		adetectt : "интервал за проверка за атака",
		buildhint : "Подсказки за строителство",
		onallp : "Всички страници",
		buildand : "Показвай обратно броене за сгради и атаки",
		buildandh : 'В списъка на селата',
		sendres : "Показвай иконки «изпрати ресурс/войски»",
		sendmess : "Показвай иконки «изпрати съобщение»",
		analyzer : "Анализатор на игровия свят",
		bigicon : "Показвай Сборен пункт икон",
		addvtable : "Показвай допълнителна таблица със селата",
		addvtableo : ['изкл','вкл','залепи'],
		opennote : "Автоматично отваряне на бележките",
		notesize : "Размер на прозореца с бележките",
		openoview : "Автоматично отваряне на изгледа на селата",
		resbar : "Ресурсна лента",
		showres : "Показвай ресурсната лента в прозорец",
		redbl : "червено (в часове)",
		yellowbl: "жълто (в часове)",
		marketpl : "Пазар",
		npcsum : "общо ресурси за NPC",
		npcsumh : 'на пазара и при строене',
		bidinc : "стъпково увеличение на ставките с",
		bidinch : 'за аукционите в travian4',
		show3x : "да показва ли възможно неточни данни",
		show3xh : 'ще опитва да предузнае постъплението на ресурси при 3-но и 2-но изпращане',
		rpandmp : "Сборен пункт и пазар",
		incomres : "информация за постъпленията на ресурси",
		incomreso : ['изкл','вкл','с равносметки','Чудо-режим'],
		troopsI : "Информация за войски",
		troopsIo : ['изкл','вкл','обновяване'],
		defRP : "действие по подразбиране за сб. пункт",
		showls : "Покажи отметки",
		showAsSN : "Използвай отметки като второ име",
		showlso : ['изкл','вкл','в прозорец'],
		savedls : "съхранени отметки",
		savedd : "съхранени данни",
		saveddh : 'вкл. отметките и допълнителните имена на селата. В случай, че изтриете акаунта или това не е ваш компютър.',
		savedelall : "изтриване на съхранената информация и настройки",
		savedelallh : 'Сигурни сте, че искате да изтриете данните, вкл. отметки и допълнителните имена на села?',
		scrlang : "Език на скрипта",
		youlang : "вашият език",
		notifi : "известяване",
		notification : "известяване след приключване на строеж",
		method : "метод",
		audiourl : "URL на звуков файл",
		audiotest : "изпробвай звука",
		colorCustomize : "Цветови настройки",
		colorHint : "оставете празно за цвят по подразбиране",
		color0 : "възможно надграждане",
		color1 : "надграждане с NPC-търговец",
		color2 : "невъзможно надграждане(недостатъчно ресурси)",
		color3 : "невъзможно надграждане(недостатъчен капацитет на склад/хамбар)",
		color4 : "последно ниво"
	},
	ro: { // Romanian language, thx bubulu
		// ingame messages
		ok : "Ok",
		cancel : "Anulează",
		close : "Închide",
		overview : "privire generală",
		svers : "versiune script",
		settings : "setări",
		notes : "note",
		res90 : "resurse pâna la %",
		refresh : "reîmprospatare",
		warehouse : "Hambar",
		resources : "Resurse",
		troops : "Trupe",
		links : "Link-uri",
		linkname : "nume link",
		linkdel : "șterge link",
		name2 : "al doilea nume",
		archive : "Arhivă",
		arena : "Nivel arenă",
		addcur : "adaugă curent",
		del : "Șterge",
		edit : "editează",
		unpin : "anulează fixarea",
		pin : "fixează",
		total : "Total",
		noplace : "nu este loc!",
		hunger : "foame",
		duration : "durată",
		deficit : "deficit",
		aclock : "Alarmă ceas\nhh:mm:ss , hh:mm , mm (din acest moment)",
		consnegat : "Consumul de hrană în acest sat este negativ. Pentru câte minute este nevoie de rezervă de hrană?",
		bmove : "Mută clădirile",
		neighbors : "vecini",
		// settings
		auctions: "Licitații",
		none : 'None',
		auto : "auto",
		info : "Informații",
		yourrace : "Tribul dvs.",
		sspeed : "Viteza server-ului",
		sspeedh : "0 - auto, 1 (1x), 2 (2x), 3 (3x aka speed), ... etc.",
		servertype : "Tipul serverului de Travian",
		servertypeh : "Tipuri de servere: Travian Legends, Travian Shores of War",
		servertypeo : ['update','Shores of War','Legends'],
		speedart : "Artefact de viteză",
		racelist : ['Romani','Barbari','Daci','Natura','Natari','Egipteni','Huni','Spartans'],
		cranny : "Culoarea galbenă la beci (în procente)",
		crannyh : 'normal 80%, 70% pentru server clasic',
		builtin : "Unelte incluse",
		builtinh : 'pentru normalizarea producției: culoarea roșie - cea mai mare nevoie de resurse, verde - cea mai mică nevoie de resurse',
		normalize : 'Normalizarea producției',
		normal : "normal",
		banalyze : "Analizor de luptă integrat",
		cropfind : "Căutător de c15 integrat",
		adetect : "Detector de atacuri",
		adetecto : ['off','fără blocare','on'],
		adetecth : "face cereri ascunse la server, care încalcă regulile. poate duce la penalizare.",
		adetectt : "Perioada de detectare a atacurilor",
		buildhint : "Sfaturi pentru construcții (culori)",
		onallp : "Toate paginile",
		buildand : "Arată numărătoarea inversă pentru construcții și atacuri",
		buildandh : 'în lista satelor',
		buildands : ['off','on','detaliat'],
		sendres : "Arată icoana &laquo;trimite resurse/trupe&raquo;",
		sendmess : "Arată icoana &laquo;trimite mesaj&raquo;",
		analyzer : "Analizor server",
		bigicon : "Arată icoana pentru Adunare",
		addvtable : "Arată lista suplimentară cu sate",
		addvtableo : ['off','on','fix'],
		opennote : "Deschide fereastra de notițe automat",
		notesize : "Dimensiunea ferestrei de notițe",
		openoview : "Deschide fereastra cu privirea generală automat",
		resbar : "Bara de resurse",
		showres : "Afișează bara de resurse în fereastră",
		redbl : "roșu (în ore)",
		yellowbl: "galben (în ore)",
		marketpl : "Târg",
		npcsum : "Sumar pentru NPC",
		npcsumh : 'la târg și la clădiri',
		bidinc : "Mărește oferta licitațiilor cu (în arginți)",
		bidinch : 'Introdu 0 pentru a dezactiva funcția',
		show3x : "Prezice fluxul de resurse la trimiterea cu 3x și 2x",
		show3xh : 'poate afișa informații imprecise',
		rpandmp : "Adunare și Târg",
		incomres : "Informații resurse ce sosesc",
		incomreso : ['off','on','cu sumar','mod WW'],
		troopsI : "Informații despre trupe",
		troopsIo : ['off','on','scan help'],
		defRP : "Acțiune implicită la adunare",
		showls : "Arată link-uri",
		showAsSN : "Folosiți link-urile cu numele secundar",
		showlso : ['off','on','în fereastră'],
		savedls : "link-uri salvate",
		savedd : "Date salvate",
		saveddh : 'inclusiv link-urile și numele secundare ale satelor. If an Account deleted, or not your computer.',
		savedelall : "Șterge toate datele",
		savedelallh : 'Ești sigur că vrei să ștergi toate datele, inclusiv link-urile și numele secundare ale satelor?',
		scrlang : "Limbă script",
		youlang : "Limba browser-ului",
		notifi : "Notificări",
		notification : "notificare după construcție",
		method : "Metoda",
		audiourl : "URL of audio file",
		audiotest : "Test audio",
		colorCustomize : "Opțiuni culori",
		colorHint : "lasă gol pentru culorile implicite",
		color0 : "Upgrade disponibil",
		color1 : "Upgrade via NPC",
		color2 : "Upgrade-ul nu este posibil <br/>(nu sunt suficiente resurse)",
		color3 : "Upgrade-ul nu este posibil <br/>(grânarele / hambarele nu au capacitatea suficientă)",
		color4 : "Nivel final"
	},
	sr: { // Serbian language, thx jokusaet
		// ingame messages
		ok : "Ok",
		cancel : "Откажи",
		close : "Затвори",
		overview : "Преглед",
		svers : "Верзија скрипте",
		settings : "Подешавања",
		notes : "Белешке",
		res90 : "Ресурси до % попуњености",
		refresh : "Освежи",
		warehouse : "Складиште",
		resources : "Ресурси",
		troops : "Јединице",
		links : "Линкови",
		linkname : "Име линка",
		linkdel : "Обриши линк",
		name2 : "Друго име",
		archive : "Архива",
		arena : "Витешка арена",
		addcur : "Додај тренутну страну",
		del : "Обриши",
		edit : "Измени",
		total : "Укупно",
		noplace : "Нема довољно места!",
		hunger : "Глад",
		duration : "Трајање",
		deficit : "Дефицит",
		// settings
		auctions: "Аукције",
		none : "Ништа",
		auto : "Ауто",
		info : "Инфо",
		yourrace : "Твоја раса",
		speedart : "Артефакт брзих",
		racelist : ['Римљани','Тевтонци','Гали','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "Жути ниво силоса (проценат)",
		crannyh : 'нормално 80, 70 ѕа класично и артефакт',
		builtin : "Уграђени алати",
		builtinh : 'за нормализацију производње: црвена боја - најпотребнији ресурси, зелена - мање потребни ресурси',
		normalize : 'нормализација производње',
		normal : "нормално",
		banalyze : "уграђен анализатор битке",
		cropfind : "уграђени претраживач житница",
		onallp : "све стране",
		buildand : "покажи одбројавање грађевина и напад",
		buildandh : 'У листи села',
		sendres : "Прикажи &laquo;пошаљи ресурсе/јединице&raquo; иконе",
		sendmess : "Прикажи &laquo;пошаљи поруку&raquo; иконе",
		analyzer : "World analyzer",
		bigicon : "Прикажи Место окупљања иконе",
		addvtable : "Прикажи додатну табелу са листом села",
		opennote : "Аутоматски отвори белешке",
		resbar : "Табела са ресурсима",
		showres : "Прикажи табелу са ресурсима у прозору",
		redbl : "црвено (у сатима)",
		yellowbl: "жуто (у сатима)",
		marketpl : "Пијаца",
		npcsum : "сума за НПЦ",
		npcsumh : 'у пијаци и зградама',
		bidinc : "повећање понуде на берзи",
		bidinch : 'за аукције на Т4',
		rpandmp : "Место окупљања и Пијаца",
		incomres : "инфо о долазећим ресурсима",
		incomreso : ['искључен','укључен','са сумом','WW мод'],
		troopsI : "Информације о јединицама",
		troopsIo : ['искључено','укључено','помоћ при скенирању'],
		defRP : "подразумевана акција у месту окупљања",
		showls : "Прикажи линкове",
		showlso : ['искључено','укључено','у прозору'],
		savedls : "сачувани линкови",
		savedd : "сачувани подаци",
		saveddh : 'укључујући линкове и друго име. Уколико је налог обрисан, или није твој компјутер.',
		savedelall : "обриши све сачуване податке",
		savedelallh : 'Да ли си сигуран да желиш да обришеш све сачуване податке, укључујући и линкове и друго име?',
		scrlang : "Језик скрите",
		youlang : "твој језик",
		notifi : "нотификација",
		notification : "нотификација за изградњу",
		method : "метода",
		audiourl : "УРЛ аудио фајла",
		audiotest : "тестирај аудио",
		// thx Stevan
		neighbors : "суседи",
		colorCustomize : "Опције боја",
		colorHint : "остави празно за предефинисане боје",
		color0 : "надоградња могућа",
		color1 : "надоградња кроз НПЦ",
		color2 : "надоградња није могућа<br/>(нема довољно ресурса)",
		color3 : "надоградња није могућа<br/>(недовољан капацитет силоса/складишта)",
		color4 : "последњи ниво"
	},
	pl: { // Polish translation, thx aren
		// ingame messages
		ok : "Ok",
		cancel : "Anuluj",
		close : "Zamknij",
		overview : "Przegląd",
		svers : "wersja skryptu",
		settings : "ustawienia",
		notes : "notatki",
		res90 : "środków na % napełniania",
		refresh : "odśwież",
		warehouse : "Magazyn",
		resources : "Surowce",
		troops : "Jednostki",
		links : "Linki",
		linkname : "nazwa linka",
		linkdel : "usuń link",
		name2 : "druga nazwa",
		archive : "Archiwum",
		arena : "Plac Turniejowy",
		addcur : "dodaj bieżący",
		del : "usuń",
		edit : "edytuj",
		total : "Razem",
		noplace : "Nie ma miejsca!",
		hunger : "głód",
		duration : "czas trwania",
		deficit : "deficyt",
		// settings
		auctions: "Aukcje",
		none : "Brak",
		auto : "auto",
		info : "Informacja",
		yourrace : "Twoja rasa",
		speedart : "Prędkość artefaktu",
		racelist : ['Rzymianie','Germanie','Galowie','Dzikie zwierzęta','Natarzy','Egipcjanie','Hunowie','Spartans'],
		cranny : "żółty poziom kryjówki (procent)",
		crannyh : 'normalny 80, 70 do grabieży na klasycznym lub artefakcie',
		builtin : "Wbudowane narzędzia",
		builtinh : 'dla normalizacji produkcji: kolor czerwony - najwięcej środków potrzeba, zielony - potrzeba mniej zasobów',
		normalize : 'normalizacja produkcji',
		normal : "normalny",
		banalyze : "Wbudowany analizator bitwy",
		cropfind : "Wbudowany poszukiwacz cropów",
		onallp : "Wszystkie strony",
		buildand : "Pokaz odliczanie budynku i ataku",
		buildandh : 'Na liście osad',
		sendres : "Pokaz &laquo;wyślij surowce/jednostki&raquo; ikony",
		sendmess : "Pokaz &laquo;wyślij wiadomość&raquo; ikony",
		analyzer : "World analyzer",
		bigicon : "Pokaz Miejsce zbiórki ikona",
		addvtable : "Pokaz dodatkowa tablice osad",
		opennote : "Automatycznie otwórz notatnik",
		resbar : "Tabela surowców",
		showres : "Pokaz tabele surowców w oknie",
		redbl : "czerwony (w godzinach)",
		yellowbl: "żółty (w godzinach)",
		marketpl : "Rynek",
		npcsum : "podsumowanie dla NPC",
		npcsumh : 'na rynku i budynkach',
		bidinc : "przebicie oferty",
		bidinch : 'na aukcji travian4',
		rpandmp : "Miejsce zbiórki i Rynek",
		incomres : "informacja o przychodzących surowcach",
		incomreso : ['off','on','z podsumowaniem','WW mode'],
		troopsI : "Informacja o jednostkach",
		troopsIo : ['off','on','scan help'],
		defRP : "domyślna akcja dla Miejsca zbiórki",
		showls : "Pokaz linki",
		showlso : ['off','on','w oknie'],
		savedls : "zapisane linki",
		savedd : "zapisane dane",
		saveddh : 'w tym Linki i Druga nazwa. Jeśli konto usunięte, albo nie twój komputer.',
		savedelall : "usunąć wszystkie zapisane dane",
		savedelallh : 'Czy na pewno chcesz usunąć wszystkie dane, w tym linki i druga nazwe?',
		scrlang : "Język skryptu",
		youlang : "twój język",
		notifi : "powiadomienie",
		notification : "powiadomienia po zakończeniu budowy",
		method : "metoda",
		audiourl : "Adres URL pliku audio",
		audiotest : "test audio"
	},
	sv:{ // Swedish translation, thx Dragon from the future
		// Meddelande,
		ok : "Ok",
		cansel : "Avbryt",
		close : "Stäng",
		Overview : "överblick",
		svers : "script version",
		setting : "inställningar",
		notes : "Anteckningar",
		res90 : "Resurser över 90 %",
		refresh : "Uppdatera",
		warehouse : "Magasin",
		resources : "Råvaror",
		troops : "Soldater",
		links : "Länkar",
		linkname : "Länknamn",
		linkdel : "Radera länk",
		name2 : "Andra namn",
		archive : "Arkiv",
		arena : "Torneplats",
		addcur : "Lägg till nuvarande",
		del : "radera",
		edit : "ändra",
		total : "Totalt",
		noplace : "Det finns ingen plats",
		hunger : "Svält",
		duration : "Varaktighet",
		deficit : "Underskott",
		// inställningar
		auctions: "Auktion(er)",
		none : "Inga",
		auto : "auto",
		info : "Information",
		yourrace : "Din stam",
		speedart : "Titanskor",
		racelist : ['Romare','Germaner','Galler','Natur','Natarer','Egyptierna','Hunnerna','Spartans'],
		cranny : "Gul nivå på grotta (procent)",
		crannyh : "Normal 80, 70 för klssisk eller artefakt-plundrare",
		builtin : "Inbyggda hjälpmedel",
		builtinh : "För att återställa produktionen: röd färg - Behövs mest resurser, green - behövs mindre resurser",
		normalize : "Återställ produktionen",
		normal : "normal",
		banalyze : "inbyggd analysator för slag",
		cropfins : "inbyggd veteby-finnare",
		onallp : "Alla sidor",
		buildand : "Visa byggnings och attack nedräkning",
		buildandh : "I bylistan",
		sendres : "Visa &laquo;sänd råvaror/trupper&raquo; ikoner",
		sendmess : "Visa Skicka meddelande ikoner",
		analyzer : "Världsanalysator",
		bigicon : "Visa samlingsplats ikoner",
		addvtable : "Visa extra bylista",
		opennote : "Öppnar automatisk anteckningar",
		resbar : "Råvaror-fält",
		showres : "Visa råvaror-fältet i ett eget fönster",
		redbl : "röd (i timmar)",
		yellowbl : "yellow (i timmar)",
		marketpl : "Marknadsplats",
		npcsum : "summering för NPC",
		npcsumh : "I marknadsplats och och byggnader",
		incomres : "ikommande råvaro-info",
		incomreso : ['av','på','med sammanfattning','Världsunder'],
		troppsl : "Information om soldaterna",
		troopslo : ['av','på','i fönster'],
		defRP : "Förvald attacktyp på samlingsplats",
		showls : "Visa länkar",
		showlso : ['av','på','i fönster'],
		savedls : "sparade länkar",
		savedd : "sparad data",
		saveddh : 'Inkluderar länkar och andra-namn. Är ett konto raderat, eller inte din dator.',
		savedelall : "Radera all sparad data",
		savedelallh : 'Är du säker på att du vill radera all data, länkar och andra namnpå byar?',
		scrlang : "Script språk",
		youlang : "ditt språk",
		notifi : "notifikation",
		notification : "Notifikation efter byggande",
		method : "metod",
		audiourl : "URL för ljudfil",
		audiotest : "ljudtest"
	},
	it: { // Italian translation , Dragonflame
		// ingame messages
		ok : "Ok",
		cancel : "Cancella",
		close : "Chiudi",
		overview : "Mostra",
		svers : "Versione dello script",
		settings : "Configurazione",
		notes : "Blocco note",
		res90 : "Risorse a % della capacità",
		refresh : "Aggiorna",
		warehouse : "Magazzino",
		resources : "Risorse",
		troops : "Truppe",
		links : "Links",
		linkname : "Nome del link",
		linkdel : "Cancella link",
		name2 : "Secondo Nome",
		archive : "Archivio",
		arena : "Arena",
		addcur : "Aggiungi corrente",
		del : "Cancella",
		edit : "Modifica",
		total : "Totale",
		noplace : "Non c'è posto!",
		hunger : "Fame",
		duration : "Durata",
		deficit : "Deficit",
		// settings
		auctions: "Aste",
		none : 'Nessuno',
		auto : "auto",
		info : "Informazioni",
		yourrace : "La tua Tribù:",
		speedart : "Artefatto velocità",
		racelist : ['Romani','Teutoni','Galli','Belve','Nataren','Egiziani','Unni','Spartans'],
		cranny : "Livello giallo della capacità del deposito segreto (%)",
		crannyh : 'Normalmente 80; Per il server classico o per artefatto del Ladro 70;',
		builtin : "Strumenti Integrati",
		builtinh : 'Per la produzione ottimizzata: Rosso = Servono più risorse; Verde = servono meno risorse;',
		normalize : 'Produzione ottimizzata',
		normal : "Risorse",
		banalyze : "Analizzatore di Battaglia integrato",
		cropfind : "Trova Canarini integrato",
		adetect : "Rilevatore d'attacchi",
		adetecto : ['Spento','Senza Blocco','Acceso'],
		adetecth : "Fa richieste al server di nascosto, violando le regole. Punibile.",
		adetectt : "Periodo di rilevamento attacco",
		onallp : "Su tutte le pagine",
		buildand : "Mostra il conto alla rovescia per gli edifici e gli attacchi",
		buildandh : 'Nella lista dei villaggi',
		sendres : "Mostra le icone «invia risorse / truppe»",
		sendmess : "Mostra icone «invia messaggio»",
		analyzer : "World analyzer",
		bigicon : "Mostra icone di Base Militare",
		addvtable : "Mostra una tabella villaggi aggiuntiva ",
		opennote : "Aprire il blocco note automaticamente",
		resbar : "Tabella delle Risorse",
		showres : "Mostra la tabella delle risorse in una finestra",
		redbl : "Rosso (in ore)",
		yellowbl: "Giallo (in ore)",
		marketpl : "Mercato",
		npcsum : "Riepilogo per NPC",
		npcsumh : 'Nel mercato e negli edifici',
		bidinc : "Incremento dell'offerta",
		bidinch : 'Per le aste travian4',
		rpandmp : "Base Militare e Mercato",
		incomres : "Info sulle risorse in arrivo",
		incomreso : ['No','Si','Con risultati','Modalità Meraviglia'],
		troopsI : "Informazioni sulle truppe",
		troopsIo : ['Spento','Acceso','Scansione di aiuto'],
		defRP : "Azione predefinita per «Invia truppe»",
		showls : "Mostra link",
		showlso : ['No','Si','In una finestra'],
		savedls : "Salva link",
		savedd : "Salva Dati",
		saveddh : 'Incluso Links e Secondo nome. Se un Account viene cancellato, o non è il tuo computer.',
		savedelall : "Cancella tutti i dati",
		savedelallh : 'Sei sicuro di voler cancellare tutti dati, incluso i links ed i Secondi nomi?',
		scrlang : "Scelta della lingua",
		youlang : "Lingua del browser",
		notifi : "Notifiche",
		notification : "Notifica dopo il completamento della construzione",
		method : "Metodo",
		audiourl : "URL del file audio",
		audiotest : "test audio"
	},
	es: {// Spanish translation. neonsp
		// ingame messages
		ok : "Ok",
		cancel : "Cancelar",
		close : "Cerrar",
		overview : "Vista previa aldeas",
		svers : "Versión Script",
		settings : "Ajustes",
		notes : "notass",
		res90 : "recursos hasta % llenado",
		refresh : "actualizar",
		warehouse : "Almacen",
		resources : "Recursos",
		troops : "Tropas",
		links : "Enlaces",
		linkname : "Nombre enlace",
		linkdel : "Borrar enlace",
		name2 : "Segundo nombre",
		archive : "Archivo",
		arena : "Plaza de torneos",
		addcur : "añadir actual",
		del : "borrar",
		edit : "editar",
		unpin : "unfix",
		pin : "fix",
		total : "Total",
		noplace : "No hay sitio!",
		hunger : "Hambre",
		duration : "duración",
		deficit : "Deficit",
		aclock : "Alarma Reloj\nhh:mm:ss , hh:mm , mm (desde ahora)",
		consnegat : "El consumo en esta aldea es negativoive. Cuantos minutos necesita de reserva?",
		bmove : "Mover edificios",
		neighbors : "vecinos",
		// settings
		auctions: "Subasta",
		none : "Ninguno",
		auto : "auto",
		info : "Información",
		yourrace : "Raza",
		speedart : "Artefacto de velocidad",
		racelist : ['Romanos','Germanos','Galos','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "Nivel amarillo para el granero ( porcentaje )",
		crannyh : 'normal 80, 70 para clásico o artefacto de saqueo',
		builtin : "Herramientas adjuntas",
		builtinh : 'Para normalizar la producción: Rojo - Más recursos necesarios, Verde - menos recursos necesarios',
		normalize : 'Normalizado de la producción',
		normal : "normal",
		banalyze : "Analizador de batallas",
		cropfind : "Buscador de cerealeras",
		adetect : "Detectar ataques",
		adetecto : ['No','Sin pausa','Si'],
		adetecth : "realiza peticiones en segundo plano al servidor, violando las normas. Puedes ser sancionado por ello.",
		adetectt : "Frecuencia de detección de ataques",
		buildhint : "Consejos de construcción",
		onallp : "Todas las páginas",
		buildand : "Mostrar cuenta atrás de construcciones y ataques",
		buildandh : 'En la lista de aldeas',
		buildands : ['Si','No','Ancho'],
		sendres : "Mostrar iconos de &laquo;enviar recursos/tropas&raquo; ",
		sendmess : "Mostrar iconos de &laquo;enviar mensaje&raquo; ",
		analyzer : "Analizador del Mapa",
		bigicon : "Mostrar Plaza de reuniones icono",
		addvtable : "Mostrar tabla adicional de aldea",
		addvtableo : ['Si','No','Fijado'],
		opennote : "Abrir automáticamente las notas",
		notesize : "Tamaño de la ventana de notas",
		openoview : "Abrir automáticamente visión general de aldeas",
		resbar : "Barra de recursos",
		showres : "Mostrar recursos en la ventana",
		redbl : "Rojo (en horas)",
		yellowbl: "Amarillo (en horas)",
		marketpl : "Mercado",
		npcsum : "Resumen para NPC",
		npcsumh : 'en mercado y edificios',
		bidinc : "Aumento de puja",
		bidinch : 'Para subastas de Travian4',
		show3x : "Intentar predecir el flujo de recrusos con doble y triple envio",
		show3xh : 'Puede ser incorrecto',
		rpandmp : "Plaza de reuniones y mercado",
		incomres : "Información de recursos entrantes",
		incomreso : ['Si','No','Con resumen','Modo maravilla'],
		troopsI : "Information about the troops",
		troopsIo : ['Si','No','Ayuda de escaneo'],
		defRP : "Acción por defecto en plaza reuniones",
		showls : "Mostrar enlaces",
		showAsSN : "Usar enlaces con el segundo nombre",
		showlso : ['Si','No','en ventana'],
		savedls : "Enlaces guardados",
		savedd : "Datos guardados",
		saveddh : 'Incluyendo enlaces y segundo nombre. If an Account deleted, or not your computer.',
		savedelall : "Borrar todos los datos almacenados",
		savedelallh : '¿Realmente deseas borrar todo los datos, incluyendo los enlaces y segundos nombres?',
		scrlang : "Idioma del Script",
		youlang : "Tu idioma",
		notifi : "notificación",
		notification : "Notificación al finalizar construción",
		method : "Método",
		audiourl : "URL del archivo de audio",
		audiotest : "prueba del audio",
		colorCustomize : "Opciones de colores",
		colorHint : "dejar en blanco para el color por defecto",
		color0 : "mejora disponible",
		color1 : "mejorar mediante NPC",
		color2 : "Mejora imposible <br/>(Recursos insuficientes)",
		color3 : "Mejora imposible <br/>(Capacidad de granero o almacenes insuficiente)",
		color4 : "Máximo nivel"
	},
	zh: {// Chinese (Taiwan) (tw and cn and hk) translation. atg008782
		// 遊戲訊息(ingame messages)
		ok : "確定",
		cancel : "取消",
		close : "關閉",
		overview : "村莊預覽",
		svers : "腳本版本",
		settings : "設定",
		notes : "筆記",
		res90 : "資源 % 上限",
		refresh : "刷新",
		warehouse : "倉庫",
		resources : "資源",
		troops : "部隊",
		links : "連結",
		linkname : "名稱連結",
		linkdel : "刪除連結",
		name2 : "第二名稱",
		archive : "存檔",
		arena : "競技場",
		addcur : "添加",
		del : "刪除",
		edit : "編輯",
		unpin : "未修復",
		pin : "修復",
		total : "總數",
		noplace : "沒有空位!",
		hunger : "飢餓",
		duration : "時間",
		deficit : "紅字",
		aclock : "警報時間\nhh:mm:ss , hh:mm , mm (從現在起)",
		consnegat : "在這個村莊的儲存量是負的. 剩下儲存量多少分鐘?",
		bmove : "移動建築",
		// 設定(settings)
		auctions: "拍賣",
		none : "無",
		auto : "自動",
		info : "訊息",
		yourrace : "你的種族",
		speedart : "伺服器倍速",
		racelist : ['羅馬','條頓','高盧','Nature','Natars','埃及人','匈奴','Spartans'],
		cranny : "黃色警戒線 (百分比)",
		crannyh : '一般 80, 70 經典或藝術品加成',
		builtin : "置入工具",
		builtinh : '產量欄顯示：紅色-為缺乏的資源，綠色-為不缺乏的資源',
		normalize : '標準生產',
		normal : "一般",
		banalyze : "置入戰鬥分析器",
		cropfind : "置入搜田器",
		adetect : "攻擊檢測",
		adetecto : ['關閉','w/o停止','開啟'],
		adetecth : "使用隱藏功能違反遊戲規則可能會導致懲罰.",
		adetectt : "檢測攻擊時間",
		buildhint : "建設提示",
		onallp : "全部頁面",
		buildand : "顯示建設和攻擊倒數計時",
		buildandh : '村內列表',
		sendres : "顯示 資源/部隊 傳輸圖示",
		sendmess : "顯示傳送訊息圖示 ",
		analyzer : "世界分析",
		bigicon : "顯示集結點示",
		addvtable : "額外顯示村莊列表",
		addvtableo : ['關閉','開啟','固定'],
		opennote : "自動開啟筆記",
		notesize : "筆記視窗尺寸",
		openoview : "自動開啟村莊預覽",
		resbar : "資源欄",
		showres : "顯示資源欄視窗",
		redbl : "紅(每小時)",
		yellowbl: "黃(每小時)",
		marketpl : "市場",
		npcsum : "電腦商人交易(NPC)",
		npcsumh : '在市場與建築',
		bidinc : "拍賣加價",
		bidinch : ' travian 4 拍賣',
		show3x : "可能顯示不正確的數據",
		show3xh : '嘗試預測在 3倍 和 2倍 的資源傳輸',
		rpandmp : "集結點 與 市場",
		incomres : "資源傳輸信息",
		incomreso : ['關閉','開啟','電腦交易','奇觀模式'],
		troopsI : "部隊訊息",
		troopsIo : ['關閉','開啟','掃描幫助'],
		defRP : "默認集結點",
		showls : "顯示鏈接",
		showAsSN : "使用第二名稱",
		showlso : ['關閉','開啟','視窗顯示'],
		savedls : "儲存鏈接",
		savedd : "儲存數據",
		saveddh : '電腦不是你的如果要刪除,刪除項目會包含鏈接和第二名稱',
		savedelall : "全部儲存數據刪除",
		savedelallh : '你確定要刪除所有數據，包括鏈接和第二名稱嗎？',
		scrlang : "腳本語言",
		youlang : "你的語言",
		notifi : "通報",
		notification : "建設完成通報",
		method : "方式",
		audiourl : "音樂網址",
		audiotest : "播放音樂"
	},
	tr: { // Turkish language. xpugur
		// ingame messages
		ok : "Tamam",
		cancel : "iptal",
		close : "Kapat",
		overview : "Köylerin genel görünümü",
		svers : "kod versiyonu",
		settings : "ayarlar",
		notes : "notlar",
		res90 : "kaynaklar doluyor % ",
		refresh : "yenile",
		warehouse : "Depo",
		resources : "Kaynaklar",
		troops : "Askerler",
		links : "Bağlantılar",
		linkname : "bağlantı adı",
		linkdel : "bağlantıyı sil",
		name2 : "ikinci ad",
		archive : "Arşiv",
		arena : "Turnuva alanı",
		addcur : "mevcutu ekle",
		del : "sil",
		edit : "ayarla",
		unpin : "düzeltme",
		pin : "düzelt",
		total : "Toplam",
		noplace : "Yer yok!",
		hunger : "açlık",
		duration : "süre",
		deficit : "eksiklik",
		aclock : "Alarm saati\nhh:mm:ss , hh:mm , mm (şuandan itibaren)",
		consnegat : "Bu köyde tüketim eksilerde. Kaç dakika gerekiyor rezervlerin dolması için?",
		bmove : "Binaları taşı",
		// settings
		auctions: "Açık Artırma",
		none : "Yok",
		auto : "otomatik",
		info : "Bilgi",
		yourrace : "Irkın",
		speedart : "Hız eseri",
		racelist : ['Romanlılar','Cermenler','Galyalılar','Nature','Natarlar','Mısırlılar','Hunlar','Spartans'],
		cranny : "sığınak sarı seviyesi (yüzde)",
		crannyh : 'normal 80, klasik veya eser yağması için 70 ',
		builtin : "Entegre araçlar",
		builtinh : 'Üretimi normalleştirmek için: kırmızı renk - en gerekli kaynak, yeşil - en az gerekli kaynak',
		normalize : 'Üretimi normalleştirmek için',
		normal : "normal",
		banalyze : "Dahili savaş analizcisi",
		cropfind : "Dahili tarla bulucu",
		adetect : "Saldırıları algıla",
		adetecto : ['kapa','w/o dondur','aç'],
		adetecth : "Server a gizli istekler gönderir, kural ihlalidir. Ceza gelebilir.",
		adetectt : "saldırı algılama zaman aralıkları",
		buildhint : "inşaat ipuçları",
		onallp : "Tüm sayfalar",
		buildand : "inşaat gerisayımını ve saldırıları göster",
		buildandh : 'Köy listelerinde',
		sendres : "işaretleri göster: ?send resource/troops? ",
		sendmess : "işaretleri göster: ?send message? ",
		analyzer : "Dünya analizcisi",
		bigicon : "Git-gel noktası simgesi göster",
		addvtable : "Ek köy tablosunu göster",
		addvtableo : ['kapa','aç','sabitle'],
		opennote : "Otomatik olarak notları aç",
		notesize : "Notlar için pencere boyutu",
		openoview : "Otomatik olarak köylerin genel görüşünü aç",
		resbar : "Kaynaklar çubuğu",
		showres : "Kaynaklar çubuğunu pencerede göster",
		redbl : "kırmızı (saat olarak)",
		yellowbl: "sarı (saat olarak)",
		marketpl : "Market",
		npcsum : "NPC için özet",
		npcsumh : 'binalarda ve markette',
		bidinc : "teklif arttır",
		bidinch : 'travian4 açık-arttırmaları için',
		show3x : "yanlış veri gösterebilir",
		show3xh : '3x ve 2x ile gönderilen kaynak akışını tahmin etmeye çalış',
		rpandmp : "Marketteki git-gel noktası",
		incomres : "gelen kaynak bilgisi",
		incomreso : ['kapa','aç','özetle','WW modu'],
		troopsI : "Askerler hakkında bilgi",
		troopsIo : ['kapa','aç','yardım ara'],
		defRP : "git-gel noktası için standart hareket",
		showls : "Bağlantıalrı göster",
		showAsSN : "Bağlantıları ikinci isim olarak kullan",
		showlso : ['kapa','aç','pencerede'],
		savedls : "kaydedilmiş bağlantılar",
		savedd : "kaydedilmiş veriler",
		saveddh : 'bağlantılar ve ikinci ismi içeren. Hesap silindiyse, yada kendi bilgisayarınız değilse.',
		savedelall : "kaydedilmiş tüm verileri sil",
		savedelallh : 'ikinci isim ve bağlantıları içeren, tüm verileri silmekte emin misiniz?',
		scrlang : "Kod dili",
		youlang : "Kendi diliniz",
		notifi : "bilgilendirmeler",
		notification : "inşaattan sonra bilgilendirmeler",
		method : "method",
		audiourl : "ses dosyasının URL si",
		audiotest : "test sesi"
	},
	vi: { // VietNamese translation by Nguyễn Duy Thanh
		// ingame messages
		ok : "Đồng ý",
		cancel : "Huỷ bỏ",
		close : "Đóng",
		overview : "tổng quan làng",
		svers : "Phiên bản scripts(translator thanhgola):",
		settings : "Cài đặt",
		notes : "ghi chú",
		res90 : "Tài nguyên cần để đầy %",
		refresh : "làm tươi",
		warehouse : "nhà kho",
		resources : "Tài nguyên",
		troops : "Lính",
		links : "Liên kết",
		linkname : "tên liên kết",
		linkdel : "xoá liên kết",
		name2 : "tên phụ",
		archive : "Lưu trữ",
		arena : "Võ đài",
		addcur : "thêm liên kết hiện tại",
		del : "xoá",
		edit : "sửa",
		unpin : "gỡ",
		pin : "sửa",
		total : "Tổng",
		noplace : "Không có chỗ!",
		hunger : "đói",
		duration : "Thời gian",
		deficit : "Thâm hụt",
		aclock : "Đồng hồ báo\nhh:mm:ss , hh:mm , mm ( tính từ bây giờ)",
		consnegat : "Mức tiêu thụ âm. Cần bao nhiêu phút để dự trữ?",
		bmove : "Dời công trình",
		// settings
		auctions: "Đấu giá",
		none : "Không",
		auto : "tự động",
		info : "Thông tin",
		yourrace : "Chủng tộc của bạn",
		speedart : "Cỗ xe của Helios",
		racelist : ['Romans','Teutons','Gauls','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "Báo màu vàng khi ống tài nguyên đạt (%)",
		crannyh : 'thông thường là 80, 70 cho làng bình thường hoặc làng có Bình rượu của Dionysus',
		builtin : "Công cụ công trình",
		builtinh : 'Chuẩn hoá sản lượng tài nguyên: màu đỏ -loại tài nguyên cần nhất, màu xanh - loại tài nguyên ít cần',
		normalize : 'Chuẩn hoá sản lượng tài nguyên',
		normal : "chuẩn",
		banalyze : "Chức năng - phân tích trận chiến",
		cropfind : "Chức năng - tìm làng nhiều ruộng lúa",
		adetect : "Phát hiện tấn công",
		adetecto : ['tắt','w/o mặc định','mở'],
		adetecth : "ẩn các hành vi có thể dẫn đến hình phát",
		adetectt : "Thời gian phát hiện tấn công",
		buildhint : "Mẹo xây dựng",
		onallp : "Tất cả trang",
		buildand : "Hiển thị thời gian xây dựng và tấn công",
		buildandh : 'Trong danh sách làng',
		sendres : "Hiện biểu tượng «Gửi tài nguyên/Gửi lính»",
		sendmess : "Hiện biểu tượng <<gửi>>",
		analyzer : "Phân tích thế giới",
		bigicon : "Hiện biểu tượng Binh trường",
		addvtable : "Hiển thị danh sách làng bổ sung",
		addvtableo : ['tắt','mở','dính'],
		opennote : "Tự động mở ghi chú",
		notesize : "Kích thước của sổ ghi chú",
		openoview : "Tự động mở tổng quát làng",
		resbar : "Thanh tài nguyên",
		showres : "Hiện thanh tài nguyên trên cửa sổ",
		redbl : "Đỏ (giờ)",
		yellowbl: "Vàng (giờ)",
		marketpl : "Khu chợ",
		npcsum : "Tóm tắt cho NPC",
		npcsumh : 'chợ và công trình',
		bidinc : "Tăng đấu giá",
		bidinch : 'đấu giá của travian4',
		show3x : "Có thể hiện thị dữ lệu không chính xác",
		show3xh : 'cố gắn dự đoán các luồn tài nguyên sever 2x và 3x đang gửi',
		rpandmp : "Binh trường và chợ",
		incomres : "Thông tin tài nguyên đang đến",
		incomreso : ['tắt','mở','với tóm tắt','chế độ WW'],
		troopsI : "Thông tin về quân đội",
		troopsIo : ['tắt','mở','tìm trợ giúp'],
		defRP : "Hành động mặt định khi gửi lính",
		showls : "Hiện liên kết",
		showAsSN : "Sử dụng liên kết như tên phụ",
		showlso : ['tắt','mở','trong cửa sổ'],
		savedls : "Lưu liên kết",
		savedd : "Liên kết đã lưu",
		saveddh : 'gồm liên kết và liên kết phụ. Nếu tài khoảng xoá hoặc đây không phải máy tính của bạn.',
		savedelall : "xoá tất cả dữ liệu đã lưu",
		savedelallh : 'bạn có chắc muốn xoá hết dữ liệu, bao gồm cả liên kết và tên phụ cuả nó?',
		scrlang : "Ngôn ngữ Script",
		youlang : "Ngôn ngữ của bạn",
		notifi : "Thông báo",
		notification : "thông báo sau khi xây dựng xong",
		method : "Phương pháp",
		audiourl : "URL của tệp nhạc",
		audiotest : "Thử nhạc",
		neighbors : "Tìm kiếm",
		colorCustomize : "Cài đặt màu sắc",
		colorHint : "Để trống để cho màu mặc định",
		color0 : " Sẵn sàn nân cấp ",
		color1 : "Nân cấp thông qua NPC",
		color2 : "Không thể nân cấp<br>(do không đủ tài nguyên)",
		color3 : "không thể nân cấp<br>(do nhà kho/ kho lúa không đủ sức chứa)",
		color4 : "Hoàn thành nân cấp"
	},
	el: {// Greek translation by Tasos el malo
		// ingame messages
		ok : "εντάξει",
		cancel : "ακύρωση",
		close : "κλείσε",
		overview : "επισκόπηση χωριών",
		svers : "έκδοση script",
		settings : "ρυθμίσεις",
		notes : "σημειώσεις",
		res90 : "πόροι για την πλήρωση %",
		refresh : "ανανέωση",
		warehouse : "αποθήκη",
		resources : "πόροι",
		troops : "στρατεύματα",
		links : "σύνδεσμοι",
		linkname : "όνομα συνδέσμου",
		linkdel : "διαγραφή συνδέσμου",
		name2 : "2ο όνομα",
		archive : "αρχείο",
		arena : "πλατεία αθλημάτων",
		addcur : "προσθήκη τρέχουσας",
		del : "διαγραφή",
		edit : "επεξεργασία",
		unpin : "unfix",
		pin : "fix",
		total : "σύνολο",
		noplace : "δεν υπάρχει χώρος!",
		hunger : "πείνα",
		duration : "διάρκεια",
		deficit : "έλλειμμα",
		aclock : "ρολόι συναγερμός\nhh:mm:ss , hh:mm , mm (από τώρα)",
		consnegat : "Η κατανάλωση στο χωριό είναι αρνητική. πόσα λεπτά χρειάζεται απόθεμα?",
		bmove : "μετακίνησε κτίρια",
		neighbors : "γείτονες",
		// settings
		auctions: "Δημοπρασία",
		none : "κανένα",
		auto : "αυτόματο",
		info : "πληροφορίες",
		yourrace : "η φυλή σου",
		speedart : "ταχύτητα αντικειμένου",
		racelist : ['Ρωμαίοι','Τεύτονες','Γαλάτες','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "κίτρινο επίπεδο κρυψώνας (ποσοστό)",
		crannyh : 'κανονικό 80, 70 για κλασικό ή αντικείμενο λεηλασίας',
		builtin : "Ενσωματωμένα εργαλεία",
		builtinh : 'για ομαλοποίηση παραγωγής: κόκκινο χρώμα - μεγαλύτερη ανάγκη πόρων, πράσινο - λιγότερη ανάγκη πόρων',
		normalize : 'ομαλοποίηση παραγωγής',
		normal : "κανονικό",
		banalyze : "ενσωματωμένος αναλυτής μάχης",
		cropfind : "ενσωματωμένη εύρεση πολυσιταρων",
		adetect : "εντοπισμός επίθεσης",
		adetecto : ['ανενεργό','χωρίς ακινητοποίηση','ενεργό'],
		adetecth : "κάνει κρυφά αιτήματα στον εξυπηρετητή, παραβιάζοντας τους κανόνες. μπορεί να οδηγήσει σε τιμωρία.",
		adetectt : "περίοδος εντοπισμού επίθεσης",
		buildhint : "συμβουλή κατασκευής",
		onallp : "όλες οι σελίδες",
		buildand : "εμφάνιση αντίστροφης μέτρησης κτιρίου και επίθεσης",
		buildandh : 'στην λίστα των χωριών',
		sendres : "εμφάνισε «στείλε ύλες/στρατεύματα» εικονίδια",
		sendmess : "εμφάνισε «στείλε μήνυμα» εικονίδιο",
		analyzer : "World analyzer",
		bigicon : "εμφάνισε πλατεία συγκέντρωσης ειδών",	
		addvtable : "Εμφάνιση επιπλέον πίνακα χωριών",
		addvtableo : ['ανενεργό','ενεργό','κολλημένο'],
		opennote : "άνοιξε αυτόματα σημειωματάριο",
		notesize : "μέγεθος παράθυρου σημειωματάριου",
		openoview : "άνοιξε αυτόματα την εμφάνιση χωριών",
		resbar : "μπάρα πόρων",
		showres : "εμφάνισε την μπάρα πόρων σε παράθυρο",
		redbl : "κόκκινο (σε ώρες)",
		yellowbl: "κίτρινο (σε ώρες)",
		marketpl : "Αγορά",
		npcsum : "σύνολο για NPC",
		npcsumh : 'στην αγορά και στα κτίρια',
		bidinc : "ανέβασε προσφορά",
		bidinch : 'για περιπέτειες travian4',
		show3x : "μπορεί να εμφανίζει λανθασμένα δεδομένα",
		show3xh : 'πρόβλεψη ροής των πόρων σε 3x και 2x αποστολή',
		rpandmp : "πλατεία συγκέντρωσης και αγορά",
		incomres : "πληροφορίες εισερχόμενων πόρων",
		incomreso : ['ανενεργό','ενεργό','με σύνολο','για θαύμα'],
		troopsI : "πληροφορίες για τα στρατεύματα",
		troopsIo : ['ανενεργό','ενεργό','βοήθεια σάρωσης'],
		defRP : "προεπιλεγμένη ενέργεια για την πλατεία συνέλευσης",
		showls : "εμφάνισε συνδέσμους",
		showAsSN : "χρησιμοποίησε συνδέσμους ως δεύτερο όνομα",
		showlso : ['ανενεργό','ενεργό','σε παράθυρο'],
		savedls : "αποθηκευμένοι σύνδεσμοι",
		savedd : "αποθηκευμένα δεδομένα",
		saveddh : 'συμπεριλαμβανομένων των συνδέσμων και του δεύτερου ονόματος. Αν ένας λογαριασμός διαγραφεί, ή όχι ο υπολογιστής σας.',
		savedelall : "διαγραφή όλων των αποθηκευμένων δεδομένων",
		savedelallh : 'Είστε σίγουρος ότι θέλετε να διαγράψετε όλα τα δεδομένα, συμπεριλαμβανομένων των συνδέσμων και το δεύτερο όνομα?',
		scrlang : "γλώσσα Script",
		youlang : "η γλώσσα σου",
		notifi : "ειδοποίηση",
		notification : "ειδοποίηση μετά την κατασκευή",
		method : "μέθοδος",
		audiourl : "URL για αρχείο ήχου",
		audiotest : "δοκιμή ήχου",
		colorCustomize : "επιλογές χρωμάτων",
		colorHint : "άφησε κενό για προεπιλεγμένο χρώμα",
		color0 : "διαθέσιμη αναβάθμιση",
		color1 : "αναβάθμιση μεσώ NPC",
		color2 : "αναβάθμιση δεν είναι δυνατή <br/>(όχι αρκετοί πόροι)",
		color3 : "αναβάθμιση δεν είναι δυνατή <br/>(όχι αρκετή χωρητικότητα αποθηκών/σιταποθηκών)",
		color4 : "ανώτατο επίπεδο"
	},
	nl: {
		// ingame messages
		ok : "Ok",
		cancel : "Annuleren",
		close : "Sluiten",
		overview : "dorpen overzicht",
		svers : "script versie",
		settings : "instellingen",
		notes : "notities",
		res90 : "grondstoffen voor tot % vullen",
		refresh : "herlaad",
		warehouse : "Warenhuis",
		resources : "Grondstoffen",
		troops : "Troepen",
		links : "Links",
		linkname : "link naam",
		linkdel : "verwijder link",
		name2 : "tweede naam",
		archive : "Archiveer",
		arena : "Toernooiveld",
		addcur : "Voeg huidige toe",
		del : "verwijder",
		edit : "wijzig",
		unpin : "losmaken",
		pin : "vastzetten",
		total : "Totaal",
		noplace : "Er is geen plaats!",
		hunger : "honger",
		duration : "duur",
		deficit : "tekort",
		aclock : "Alarmklok\nhh:mm:ss , hh:mm , mm (van nu)",
		consnegat : "Consumptie in dit dorp is negatief. Hoeveel minuten reserve nodig?",
		bmove : "Verplaats gebouwen",
		neighbors : "buren",
		// settings
		auctions: "Veilingen",
		none : "Geen",
		auto : "automatisch",
		info : "Informatie",
		yourrace : "Jouw ras",
		speedart : "Snelheids artefact",
		racelist : ['Romeinen','Germanen','Galliërs','Nature','Natars','Egyptians','Huns','Spartans'],
		cranny : "geel niveau van schuilplaats (procent)",
		crannyh : 'normaal 80, 70 voor klassieke servers of artefact plunderen',
		builtin : "Ingebouwde hulpmiddelen",
		builtinh : 'voor normalisatie van productie: rode kleur - meest benodigde grondstoffen, groen - minder benodigde grondstoffen',
		normalize : 'Normalisatie van productie',
		normal : "normaal",
		banalyze : "Ingebouwde gevechts analysator",
		cropfind : "Ingebouwde cropper zoeker",
		adetect : "Detecteer aanval",
		adetecto : ['uit','zonder stilzetten','aan'],
		adetecth : "maakt de verborgen verzoeken aan de server, overtreed de regels. kan in bestraffing resulteren.",
		adetectt : "periode van aanvals detectie",
		buildhint : "Tips voor constructie",
		onallp : "Alle pagina's",
		buildand : "Laat aftelling van gebouwen en aanvallen zien",
		buildandh : 'In de dorpen lijst',
		sendres : "Laat «stuur grondstoffen/troepen» iconen zien",
		sendmess : "Laat «stuur bericht» iconen zien",
		analyzer : "Wereld analysator",
		bigicon : "Laat verzamelplaats icoon zien",
		addvtable : "Laat extra dorpen tabel zien",
		addvtableo : ['uit','aan','vastzetten'],
		opennote : "Automatisch notities openen",
		notesize : "Grootte van scherm voor notities",
		openoview : "Automatisch dorpen overzicht weergeven",
		resbar : "Grondstoffen balk",
		showres : "Laat grondstoffen balk zien in een los scherm",
		redbl : "rood (in uren)",
		yellowbl: "geel (in uren)",
		marketpl : "Marktplaats",
		npcsum : "opsomming voor NPC",
		npcsumh : 'in marktplaats en gebouwen',
		bidinc : "bod toenemening",
		bidinch : 'voor travian4 veilingen',
		show3x : "kan incorrecte data weergeven",
		show3xh : 'probeer de grondstoffenstroom te voorspellen bij 3x en 2x versturen',
		rpandmp : "Verzamelnplaats en Marktplaats",
		incomres : "binnenkomende grondstoffen info",
		incomreso : ['uit','aan','met opsomming','WW modus'],
		troopsI : "Informatie over de troepen",
		troopsIo : ['uit','aan','scan hulp'],
		defRP : "standaard actie voor verzamelplaats",
		showls : "Laat links zien",
		showAsSN : "Gebruik links als tweede naam",
		showlso : ['uit','aan','in apart scherm'],
		savedls : "opgeslagen links",
		savedd : "opgeslagen data",
		saveddh : 'inclusief links en tweede naam. Voor als een account is verwijderd, of dit niet jouw pc is.',
		savedelall : "verwijder alle opgeslagen data",
		savedelallh : 'Weet je zeker dat je alle data wilt verwijderen, inclusief links en tweede naam?',
		scrlang : "Script taal",
		youlang : "jouw taal",
		notifi : "notificatie",
		notification : "notificatie na bouw",
		method : "methode",
		audiourl : "URL van geluidsbestand",
		audiotest : "test geluidsbestand",
		colorCustomize : "Kleuren opties",
		colorHint : "laat leeg voor standaard kleur",
		color0 : "verbetering beschikbaar",
		color1 : "verbetering via NPC",
		color2 : "verbetering niet beschikbaar <br/>(niet genoeg grondstoffen)",
		color3 : "verbetering niet beschikbaar <br/>(niet genoeg capaciteit van warenhuis of graansilo)",
		color4 : "laatste niveau"
	},
	id: {
		// ingame messages
		ok : "OK",
		cancel : "Batal",
		close : "Tutup",
		save : "Simpan",
		reset : "Kembalikan",
		overview : "Tinjauan desa",
		svers : "Versi skrip",
		settings : "Pengaturan",
		notes : "Catatan",
		res90 : "Kurang sda sekian %",
		refresh : "Segarkan",
		warehouse : "Gudang",
		resources : "Sumber daya",
		troops : "Pasukan",
		links : "Pranala",
		linkname : "Nama pranala",
		linkdel : "Hapus pranala",
		name2 : "Nama lain",
		archive : "Arsip",
		arena : "Pusat Kebugaran",
		addcur : "Tambah url saat ini",
		del : "Hapus",
		edit : "Sunting",
		unpin : "Batal semat",
		pin : "Semat",
		total : "Total",
		noplace : "Tidak ada tempat!",
		hunger : "lapar",
		duration : "durasi",
		deficit : "defisit",
		aclock : "Alarm\nhh:mm:ss , hh:mm , mm (dari sekarang)",
		consnegat : "Konsumsi gandum desa negatif. Berapa menit diperlukan cadangan?",
		bmove : "Pindahkan bangunan",
		neighbors : "tetangga",
		// settings
		auctions: "Lelang",
		none : "Tak ada",
		auto : "otomatis",
		info : "Informasi",
		yourrace : "Suku Anda",
		sspeed : "Kecepatan Server",
		sspeedh : "0 - otomatis, 1 (1x), 2 (2x), 3 (3x als speed), ... dll.",
		servertype : "Tipe Travian Server",
		servertypeh : "Tipe Server: Travian Legends, Travian Shores of War",
		servertypeo : ['pembaruan','Shores of War','Legends'],
		speedart : "Speed artefak",
		racelist : ['Romawi','Teuton','Galia','Alam','Natar','Mesir','Mongol','Spartans'],
		cranny : "Level kuning dari (persen)",
		crannyh : 'normal 80, 70 utk klasik atau penjarahan artefak',
		builtin : "Perkakas bawaan",
		builtinh : 'Merah - sangat perlu sumber daya, Hijau - agak perlu sumber daya',
		normalize : 'Normalkan untuk produksi:',
		normal : "normal",
		banalyze : "Analisa pertempuran bawaan",
		cropfind : "Pencari gandum bawaan",
		adetect : "Pendeteksi serangan",
		adetecto : ['mati','w/o henti','hidup'],
		adetecth : "Membuat permintaan tersembunyi ke server, melanggar aturan. Dapat menyebabkan hukuman.",
		adetectt : "Periode serangan terdeteksi",
		adetectth : "Pemeriksaan awal selalu setelah 5 menit. Pemeriksaan selanjutnya setelah dikonfigurasi.",
		buildhint : "Tip konstruksi",
		onallp : "Semua halaman",
		buildand : "Tampilkan tanda sedang dibangun dan serangan",
		buildandh : 'Dalam daftar desa',
		buildands : ['mati','hidup','lebar'],
		sendres : "Tampilkan ikon &laquo;kirim sumber daya/pasukan&raquo;",
		sendmess : "Tampilkan ikon &laquo;kirim pesan&raquo;",
		analyzer : "Penganalisa Wilayah",
		bigicon : "Tampilkan ikon Titik Temu",
		addvtable : "Tampilkan tabel desa tambahan",
		addvtableo : ['mati','hidup','centang'],
		opennote : "Otomatis membuka jendela Catatan",
		notesize : "Ukuran jendela Catatan",
		openoview : "Otomatis membuka tinjauan desa",
		resbar : "Bilah sumber daya",
		showres : "Tampilkan bilah sumber daya di jendela",
		redbl : "Merah (jam)",
		yellowbl: "Kuning  (jam)",
		marketpl : "Pasar",
		npcsum : "Ringkasan untuk NPC",
		npcsumh : 'Di pasar dan bangunan',
		bidinc : "Jumlah kenaikan tawaran lelang",
		bidinch : 'Masukkan nilai 0 untuk menonaktifkan fungsi',
		show3x : "Prediksi jumlah sumber daya saat dikirim bersama 2x dan 3x",
		show3xh : 'dapat menampilkan data yang salah',
		rpandmp : "Titik Temu dan Pasar",
		incomres : "Info sumber daya masuk",
		incomreso : ['mati','hidup','dengan ringkasan','mode WW'],
		troopsI : "Informasi tentang pasukan",
		troopsIo : ['mati','hidup','pembaruan'],
		defRP : "Tindakan baku utk Titik Temu",
		showls : "Tampilkan pranala",
		showAsSN : "Gunakan pranala sebagai nama lain",
		showlso : ['mati','hidup','di jendela'],
		savedls : "Simpan pranala",
		savedd : "Simpan data",
		saveddh : 'Termasuk Pranala dan Nama lain. Jika Akun dihapus, atau bukan komputer Anda.',
		savedelall : "Hapus semua data yang disimpan",
		savedelallh : 'Anda yakin ingin menghapus semua data, termasuk pranala  dan nama lain?',
		scrlang : "Bahasa skrip",
		youlang : "Bahasa peramban",
		notifi : "Pemberitahuan",
		notification : "Pemberitahuan setelah pembangunan",
		method : "Metode",
		audiourl : "URL file audio",
		audiotest : "Tes audio",
		colorCustomize : "Pilihan warna",
		colorHint : "Biarkan kosong utk warna baku",
		color0 : "Tersedia peningkatan",
		color1 : "Tingkatkan via NPC",
		color2 : "Tak dapat ditingkatkan<br/>(tak cukup sumber daya)",
		color3 : "Tak dapat ditingkatkan<br/>(tak cukup kapasitas lumbung/gudang)",
		color4 : "Level terakhir"
	}
};

var img_igm = "data:image/gif;base64,R0lGODlhCwAIAIABAH9/f////yH5BAEKAAEALAAAAAALAAgAAAIUDI5oEO3L2ItSmnYw1bdTO31JVgAAOw==";
var img_car = "data:image/gif;base64,R0lGODlhEgAMAIQWAKuZY+DUr8q6iol4RWJTKPLpzPz79fn05sC2l9bNs8vCqdTOvOzm1dzTutvQsLWphrmvkdvVwuTdyKeacPr37efk2v///////////////////////////////////////yH5BAEAAB8ALAAAAAASAAwAAAVW4Cd+DTAQAjOua2CigMPO7hAIpjm3LkEAuEFlJyoUfrbgYkcpBAa4mwkyMxhdN+lgEGEdnNmA1ITwgsXiIGHCMgjQN9zrMZMABfIXQbFLAP4mJwRlIiEAOw==";
var img_def = "data:image/gif;base64,R0lGODlhEgAMAOMMAHJWAIpQAIFhAIxyH5l6AMeLAL2fAJmusNWzANStcOjMANDh4////////////////yH5BAEKAA8ALAAAAAASAAwAAARP8MmzpLXrXLkI+OBHVBtAEIahKOkJbI+JqqzhwnK6th48nLraaQBDmIItAAJWEMx2NkEB9igAkAbAFJYICLCCQGLT7V53ALH4spaELF1JBAA7";
var img_att = "data:image/gif;base64,R0lGODlhEgAMAIQeALzO0P/SAIGXmeTLptStcPL390RSU5R4TdXEqMLU1ujw8dClY6a0tt7AXIaNjnqLjeTHXL/S1IVRAMGymeXSmbt+IK/CxGU+AJmusOO2AN7q672OAHGIitDh4////////yH5BAEKAB8ALAAAAAASAAwAAAVX4Cd+QDeeXwegqaCwimCyiXx2NisC3KxxK93IwtFoBBYhiiPgYJQiSubzw3A+GYqQsgl0rIbARiusbKYfcUVJkFzOmc1FsmYNKhdRAyKaD1gIB0ITCCIhADs=";
var img_pref = "data:image/gif;base64,R0lGODlhEAAMAOMJAAAzZjMzmTNmmWZmzGaZzJmZmZnMmczMmczMzP///////////////////////////yH5BAEKAA8ALAAAAAAQAAwAAARB8ElAgbyvFPwAQtZVIFo3JaBInlSChiUGuDQYc1WbclcQaLMdJ0Ag/HShXlFgPAmJBMEgIHtJoE2c9SHo8iaURwQAOw==";
var img_refr = "data:image/gif;base64,R0lGODlhEAAQAOMKACtVgCtVqiuAqlWAqlWA1ICAqoCqqoCq1Kqq1KrU1P///////////////////////yH5BAEKAA8ALAAAAAAQABAAAARW8MkHap14ghCGD4CmcV5xnFZIbVaHvMOhtuOBJMkMEEEGnIhZRgIYJG6q4SqlYyqJL8QgiZklUJnAYUo8ImRJwXQmfW2ZFwoIYDgUPpxkugIHVX0pTAQAOw==";
var img_view = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAMCAQAAADIBVVwAAAAAXNSR0IArs4c6QAAAPBJREFUGNNtkbEuBFEYhb+ZSHYjSgoFQaFbmSdQiWSbfYN5HYVWo9No9IqNeINtRYNssjRsITFEYu3/KWbGDNlTneLcc+/9DgCquZlL7zzl/he1yhgeh2pfxi4KV2ZyrRGqZmaqdt21Y31D1bfvV4QaGjdBkctboX56WEUpO47qOkNdn/N6Oi/9ZdWPajo9//OigcRLeTAe3JiqprQk8FjZFZ4Bki6xDJAC7K1OUEgYsUmf22B2wI53wJi1JthjyDcCJ8DQ+4+8M5qRFIYX9BqKNR49EzFTM7e8clB95ZdkDTzcbgHPG4rtbcoJMxfuwg8RxTrpF3oYEQAAAABJRU5ErkJggg==";
var img_del = "data:image/gif;base64,R0lGODlhEAAMAIABAP8AAP///yH5BAEKAAEALAAAAAAQAAwAAAIfTICmu5j8lAONMuOwvTLzun3HJI5WBKGotrYrlpZBAQA7";
var img_edit = "data:image/gif;base64,R0lGODlhEAAMAKEAAP///3HQAHV8bf///yH5BAEKAAMALAAAAAAQAAwAAAIinH+iyBnyGoIwREntE/hpilUe11QZWX5X+qEl5b6LNMVSAQA7";
var img_notes = "data:image/gif;base64,R0lGODlhEAAMAIQcAAAkkrYkANskAG1JAElJbf8kAJJJAABt29tJJJJtAG1tbW1tkrZtAACS/ySS222SkpKSkpKSttuSALa2tra227bb27bb///bSdvb2//b/9v/////2////////////////yH5BAEKAB8ALAAAAAAQAAwAAAVq4PdJIjmWoghFTMS6LcsJwfdwBofruX4UGcSNQOEQjcWDhVMI3HRQqFLjaD6jPgu1AfgsOJhwmDN1cEVfbEJrBkzQnIq8wklc2hyFSKHebC4AOnoffBSGdRsDA1CDBAqPChMDCRMTkAQiIQA7";
var img_save = "data:image/gif;base64,R0lGODlhLgAUAKUoAAAAABw5OTk5ORw5qjk5VTk5cTk5jjk5qhxVqjlVjlVVVTlVqlVVcTlVxlVVjlVVqlVVxlVxjlVxxnFxjnFxxnFx445xxo5x43GOjo6O446O/6qO46qO/3HGAKqqxqqq46qq/8aq/8bGxsbG48bG/8bj4+Pj4+P//////////////////////////////////////////////////////////////////////////////////////////////////yH5BAEKAD8ALAAAAAAuABQAAAb+wJ/w1ykaj8ikclkcDouoqHRKrVqv0aawg+16v53tN/opmzeZdMZCoYxRYe77Q9JYT5DH422CzkkZVScmDQR7Y31yY3SBU4MmCxeHX4lvKHQVjiYmJQsUk16VbxskblGPJSMDEqBYm35jGSQSp5upqhAOiKKxISAQwA0LCwMDwAm7sF8ZIM1qF23AD8iUvCfX2NnXFs4M3t4ReQsG2uXXr3Lm5RQgaQwAAiUlEcMH5OrYm5X6/P2bFBzcCZiwCcOBgwb8KTQhoshChRTSIAjgwYMIEQoOHijwsF9DIh35TWCl54GDBAkMqCzAMSTDMCBdypR58eOWDjVz6tzJs6cKTi1OmAgdusRJEAA7";
var img_underline = "data:image/gif;base64,R0lGODlhFwAQAIABAODg4AAAACH5BAEAAAEALAAAAAAXABAAQAIVjI+py+0Po5y02ouz3rxjAIbiSIIFADs=";
var img_stat = "data:image/gif;base64,R0lGODlhMQAxAKUtADdJkklJpFtbW0lbpFtbpFtbtm1tbW1tgFtttm1tklttyG1tpG1ttm1tyG2ApICAgG2AyICAkm2A24CApICAtoCA24CA7ZKSkpKSpICS7YCS/5KS25KS7ZKS/6SkpJKk7ZKk/6Sk7aSk/6S2tra2tra2yKS2/7a2/8jIyLbI/9vb29vb7e3t7f///////////////////////////////////////////////////////////////////////////yH5BAEAAD8ALAAAAAAxADEAAAb+wJ9wSCwKWy0WCkXyeC5O0pLVMlqv2F+Seel6v14pNUsutlQosHp9QamQ5axS/Xh06/i6GjWOG1UkawICXYOGg3ZgJG9+Q2dPbJGRHox+j5KYbJRVcSqQbAYGXaGkpaYGdptlnph6F3mwsYmqWYGZt5EkfVZpuL5rKJxGLLiho6fIpxcqVi29ma6y0rBtwkfEv9lrLGbP2t9tZrYXEwUDCaCiF8mliWskwkldEwQBEh0FEWvR03iSzEfSFLDXoWCGAfrAZQp2hMSAABkKSswQYB6FBuYCBAAAIMCAAQUaUIjQz101LSxASlzZQQLIAAUUSJCQISKIDhksSMAIc8H+gUOH1F2Ap4WCApYsXRa4txKE06cgRHSooGAAAwySPCBpUYBBAwRgETSgmUFDy48RC0J9KqJtWw4YKUzaCrKBXbthxY49GEDDWrZuRZgYzAHBVTZ0Q95dvHimx79RAw8efMIEhMNgtCIhoJixZ7sKCkAN3HayiROoT0CQmznx3Y8aN3os0Jn2B6ekTadGHYLABEVbOdulvVJDBglVNS4190Gy7t0nUlRgYDIYkgWxCSLt4LRlgwEACjQvPRl69BQfClQ/sqLEgQN9kf51m6ECecrmU6Q4EQCVF25DEGNAAPLN59xzqemnYH+JEEUECQ8AkJZaBh5o3nkKngCAfyf+EaHCBRJSuBZpgiGImoIohrBhIrsMgQIA90BGommn7YYiih8AgAhDf0iYQYVumRgdhik2oKMolZgBQAcW/AjYgTXaeKN+H9i1ooNGtACAWTlxN6OQU+5XgVgIbLiMNUS0EB9ONI13X5QJ3njCmHohEMADuqDpyFISGSeBBc0JSeQJG3zF2EAe8KHnERA0wFJNM1WQAQclpmbCBxtU8JVejHEmxqJarDDAhAbVVN9Mny3WKGN2evDpFUhsgABSptZaXwW4ziQBBKt2OgEJr8LKwkVmGWScrbdWoOuuvB7qALButGjGGRjwWaqtuCqrLK/c3oWAb9AqCuoRLazgQUxtFuCEbLa5ztQtRgRgAKwY0jbDAgsl0LMUsskqy+xXBfg2Qrgq1IvFvYBggF0BYkWaa6MIBBzAAhgMHO694wqLBhMYTLBARhx5lMACE3hgMcEGN/LDxkzM6/LLUixRcMoqD8HyEjjnLPO9AGYRBAA7";
var img_info = "data:image/gif;base64,R0lGODlhDAAKAIABAH9/f////yH5BAEAAAEALAAAAAAMAAoAAAIVjA1wi82eFJP0RIhD1Xn77mhKIhoFADs=";
var img_tinfo = "data:image/gif;base64,R0lGODlhDAAMAMIEAACAgICAgICA/4D//////////////////yH5BAEKAAcALAAAAAAMAAwAAAMkeBohwio2R4OkhNQzqX9dplVf9pUjiaWgZ26TOALXR0fcBCkJADs=";
var img_hide = "data:image/gif;base64,R0lGODlhDAAYAIABAExMTP///yH5BAEKAAEALAAAAAAMABgAAAIrjI8Hy20NQXIpxCmXlY/rXX1VNypcKZbqGlEtE55jGtfgDWr0FdOIvwoUAAA7";
var img_cp = "data:image/gif;base64,R0lGODlhCwAOAIABAAAAAP///yH5BAEKAAEALAAAAAALAA4AAAIbjA2nB7nsXmhxpSYdtuzFioTeZFEeBU5mlgYFADs=";
var img_clipIn = "data:image/gif;base64,R0lGODlhEAAMAKECAGZmZrq6AP///////yH5BAEKAAIALAAAAAAQAAwAAAIblI+pFrHZontS0tqWBMDCyHkfdpFl9CBZyh4FADs=";
var img_clipOut = "data:image/gif;base64,R0lGODlhEAAMAKECAGZmZrq6AP///////yH5BAEKAAIALAAAAAAQAAwAAAIelH+By6Hc3INGypasW1tP7lHVJRrAVgrAWK4Z5aYFADs=";
var img_up = "data:image/gif;base64,R0lGODlhDAAMAIABAHm94P///yH5BAEKAAEALAAAAAAMAAwAAAIXjA1we8mb3AtRvSohZjjq3nQeJTrlKRYAOw==";
var img_down = "data:image/gif;base64,R0lGODlhDAAMAIABAHm94P///yH5BAEKAAEALAAAAAAMAAwAAAIXhI+pF8vtQJhu0mUvyvrxzXWhZYyklBUAOw==";
var img_updown = "data:image/gif;base64,R0lGODlhDAAMAIABAHm94P///yH5BAEKAAEALAAAAAAMAAwAAAIajGGXB6jZ4gux0jUvdjlzuHxKJT1kCDUbahQAOw==";
var img_bmove = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAgCAMAAABkSNU7AAAAAXNSR0IArs4c6QAAAGNQTFRFaAAAAAAAAABVVQAAVQBVqgAAAFUAAFVVVVUAVVVVVVWqqlUAqlVVqlWq/1UA/1VVVaoAVapVVaqqqqoAqqpVqqqq/6oA/6pV/6qqVf8Aqv8Aqv9Vqv+qqv////9V//+q////3pvvvAAAAAF0Uk5TAEDm2GYAAANUSURBVEjHrZaLktMwDEXXmAYJGxpTqQm7aez//0qu5LTZB+xrUGfSSeoeXz2du7s3rD21u0+btn+bfgzV3mefgKmqcNmMWXD/IeQOEia3IiJXoJTBnxr4Hcgby/+UUqBWF5hKTofZfinS7MEixahSX0NuLFt5Ok3rNE0UZMmHzdL2rUsV8X0MetX5d9qlOAsG3JpCpMWkucFtiVkEcvHYeBWXQlfXX9YG3DydVxMGO08Sw6/AbXP4YCDuzsIDBwK5lFq46LMastsKGmRtOJcXiIL2gLmROA6BuAELNlQe5IlEp1siHSQbkCJc4ag3nJBrxVamUA2omQW8wKQ70BPH83rexcESqeU50lN5iu3W1fJvAVDsyNBC1CVeYyfcJKV1lZ2IIrOS4Ehll1dVVjcQouik8yysWsAl2WLozrYqhVPaFaYYKbMLpF2e9uTDmLgdZ51VhLksuLjL3VsEA2GSdK2WSc7E8ARMQ+7RE+8O7JMzATc7ULEWPDhuAjtPBXuc3EtPy4kMRrYKkarX6HGiq3E+ttSOLc9Zg23BxSPoPCxHxjQQpJGVIWoZ2uzDg/N6ch/M1UCyorhzmzOICUQeRxpc35UnBE4LQSVNkiNHEwY12HgYCnikXm3ASWBLiswtzU6bo4wP97/HzlPPhw5WuhyahiDTGeGwYgkBX0PQiiYwn0cDpS+czIu5HZqCly6HPIwPD1s+XCB+jvZf431pGtMJhWU4e2a90HNSwJsIPJlUZkltTqizljLd34+3AuxAxIpOYvpaNV0AAWcFmGSTt2ACJvghlARuZtb5Z5t+tpw57PW8DQMMvPN0zpq/o5VDrTee5Zd6141jGUeMaKUhzscWy3S8cDIePR4JfeCUYRhRxycBCvI2ntULqqt3//AVlVHtDBhJv+WoOSE71kLPTim/XZBKCj+yTqhBMDuv/EI/LZclJUHpqo09dF2xBbxgHGK/sryYgNvgRhiLhQ7mzkpFJ2Ci4tKnKgaquw6ozTjM6CJ/H/rb0ypWw94+5nRmI+V8Ax5ssPbh93jet9eOI2tun0jwz9R6dDKokHa5ACTPzqP29tlbtXQql6HYgbmdwv24fHxeto+8G9jIlP0EfnGet//4uvGxlyN9laT/6y3rLdAf9yuedFIpoQQAAAAASUVORK5CYII=";
var img_wounded = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAMAAAD+iNU2AAABX1BMVEUAAADYjgH9/Pzv7O3ejQDe2NS2nYPcn0rQiAHx7/CylnTktW6miWz1slC1iE3BdwH2ogDakADX0c7PxsLCtKq/saa+rqC4q6D+zYP2wneqkHfwvnO2lWbxxFzysVT7uFPZnFDQnU29ikruvEXTlkXqtz3YmzvMljvotDfcmDbLjjakdDbLiS69fiXtph30pgf7qgXzoAHumwDXiwDMhACnXwCdVADz8fLn5ebh3dzPyMfGwcO4rKawoJS5ppOrmIeejoe5oobzwn+eiHi6nHTqunChhHD/yW76wGzyy2jMoGjjsGalg2K/lWHuwGDhq2D5uF/rtl/nrF/+x13fp13GllqwjVr+0Fj4yli4klHdqFDrp0zFl0zlpUv3wkjptkTkoUHMkEDSkjvDkTq2iDr6yTStfjHgoy70wivmsSuxfCO2fRvwpxPjqwzbnAvepAblkwC5bgC0bQCxZwCOSQCLqCi3AAAAAXRSTlMAQObYZgAAAN9JREFUCB0FwYN2wwAAQNEXpylT27bndbZt2/r/s3tB9PpHALD4/BKI4ZnQuhuwROt1h4QvGJpf3FcYOm7KctNADVqtm1uOsYNWxxRad3gjkdW9bGnF6dRN02Ug2pZ2stWTi0LPqbteJBDXTqvW5c+jVE9+HQYQbdvPuVguk69IADBbeCrGiu+7CwAwEPpnhx+ZjXLJBjDxJn//3d5flms38TCMPn4J+m8/la9dJ8/jAdRGVxDkn6nKVVLTElEmG51uWxjHnbZrWsLA8uBq6wHAk7bbHQpI03MeABRVVfgHfTshGMizJmkAAAAASUVORK5CYII="
var img_out = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADvSURBVDhPzdK/i4FxAMfxByXK5A+4bFfqysLCX6AbzAZluMGsmJUSg0wWWU1kVjYrxQ23XlnUSZ0yiXh/nnvi6MEzeter5/l+6/nx/T6P8ZS58YYKRtjgGy28w4NTFwOrGNqIoo8mZkggB10zxg62BZGBzxyd04VJ/KChCbtS1vFeefwiZI6swuhBr/yoF3yiqIELEXTwijmmuE5zpb9Twws9aI20dnwLpZs5bW8dT2kJAzhdwgTmEq5zsokFLHGxif/TZ8zC7jOmsUJVE7eKQ3+elKG3+sAQenINAdxMu6w9qeMLByzQhW7mx9NkGEcQqinD/jxx2gAAAABJRU5ErkJggg=="
var img_in = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAD8SURBVDhPzdIxa8JAGMbx2IJ06CD9AOpcKLjUyU1wEAdnB7cOHToVdHQpiIs4uYjfQHBVcHNV0A5Cp46FiqDgqNT/czlsAglx9IFfLu+Fy+Xu4lxlbvCEJqbY4xs9lHCLc3yFTRZ9PGOILpbI4RUaM8MBgXlAFXem+o8GFvGLjjouSdm23rxji7SpIqIljJAylZskPlFXEdOFNJBxb31RnwZ8oYIF4tCLd+rTjisqgpKwrU7Cm6NtI6OZxng0lRt90RxmCVEp2NabGtYI3UTN8IagY9Q+bNBSR1jy0J8nH9BRvmACzaw/9B6h0S5rzW2s8IcfDKCX6fnVxHFOUcIpzaJ0h3UAAAAASUVORK5CYII="


/*********************** common library ****************************/

var useDOMs = typeof window.localStorage == 'undefined' ? false : true;

function RB_addStyle(css) {
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    var style = document.createElement("style");
    style.appendChild($t(css));
    head.appendChild(style);
  }
}
function RB_getValue ( key, defaultValue ) {
	if( useDOMs ) {
		var value = window.localStorage.getItem(key);
		if( value == null ) value = defaultValue;
		return value;
	}
}
function RB_setValue( key, value ) {
	if( useDOMs )
		window.localStorage.setItem( key, value );
}
function RB_deleteValue( key ) {
	if( useDOMs )
		window.localStorage.removeItem( key );
}
function $xf(xpath, xpt, startnode, aDoc) {
	var XPFirst = XPathResult.FIRST_ORDERED_NODE_TYPE;
	var XPList = XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE;
	var XPIterator = XPathResult.UNORDERED_NODE_ITERATOR_TYPE;
	var XPResult = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
	if (!aDoc) aDoc = document;
	if (!startnode) startnode = document;
	var xpres = XPFirst;
	switch (xpt) {
		case 'i': xpres = XPIterator; break;
		case 'l': xpres = XPList; break;
		case 'r': xpres = XPResult; break;
	}
	var ret = aDoc.evaluate(xpath, startnode, null, xpres, null);
	return (xpres == XPFirst ? ret.singleNodeValue : ret);
}
function ajaxRequest(url, aMethod, param, onSuccess, onFailure) {
	var aR = new XMLHttpRequest();
	aR.onreadystatechange = function() {
		if( aR.readyState == 4 && (aR.status == 200 || aR.status == 304))
			onSuccess(aR);
		else if (aR.readyState == 4 && aR.status != 200) onFailure(aR);
	};
	aR.open(aMethod, url, true);
	if (aMethod == 'POST') {
		if (url.includes("api/v1/")){
			aR.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
			//aR.setRequestHeader('Authorization', 'Bearer ' + getAjaxToken());
		} else {
			aR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
		}
	}
	aR.send(param);
}
Number.prototype.NaN0 = function(){return isNaN(this)?0:this;}
String.prototype.trim = function(){return this.replace(/&nbsp;/g,'').replace(/^\s+|\s+$/g,'');}
String.prototype.onlyText = function(){return this.replace(/([\u2000-\u20ff])/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[\s\S]+?>/g,'');}
String.prototype.firstText = function(){return this.replace(/&lt;/,'<').split('<')[0].trim();}
function $g(aID) {return (aID != '' ? document.getElementById(aID) : null);}
function $gn(aID) {return (aID != '' ? document.getElementsByName(aID) : null);}
function $gt(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByTagName(str); }
function $gc(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByClassName(str); }
function $at(aElem, att) {if (att !== undefined) {for (var xi = 0; xi < att.length; xi++) {aElem.setAttribute(att[xi][0], att[xi][1]); if (att[xi][0].toUpperCase() == 'TITLE') aElem.setAttribute('alt', att[xi][1])}}}//Acr111-addAttributes
function $t(iHTML) {return document.createTextNode(iHTML);}
function $e(nElem, att) {var Elem = document.createElement(nElem); $at(Elem, att); return Elem;}
function $ee(nElem, oElem, att) {var Elem = $e(nElem, att); if (oElem !== undefined) if( typeof(oElem) == 'object' ) Elem.appendChild(oElem); else Elem.innerHTML = oElem; return Elem;}
function $c(iHTML, att) { return $ee('TD',iHTML,att); }
function $a(iHTML, att) { return $ee('A',iHTML,att); }
function $am(Elem, mElem) { if (mElem !== undefined) for(var i = 0; i < mElem.length; i++) { if( typeof(mElem[i]) == 'object' ) Elem.appendChild(mElem[i]); else Elem.appendChild($t(mElem[i])); } return Elem;}
function $em(nElem, mElem, att) {var Elem = $e(nElem, att); return $am(Elem, mElem);}
function offsetPosition ( el ) {var oL=0,oT=0; do {oL+=el.offsetLeft;oT+=el.offsetTop;} while(el=el.offsetParent ); return [oL,oT];}
function toNumber(aValue) {return parseInt(aValue.replace(/\W/g, "").replace(/\s/g, ""));}
function isNumeric(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
function insertAfter(node, rN) {rN.parentNode.insertBefore(node, rN.nextSibling);}
function ajaxNDIV(aR) {var ad = $ee('div',aR.responseText,[['style','display:none;']]); return ad;}
function $ib(node, rN) {rN.parentNode.insertBefore(node, rN);}
function dummy() {return;}
jsVoid = 'javaScript:void(0)';
jsNone = 'return false;';
function esc(str) { return str.toString().replace(/@/g, "%40"); }
function unesc(str) { return str.replace(/%40/g, "@"); }
function newOption (node,text,value) { node.appendChild($ee('OPTION',text,[['value',value]])); }

function formatTime(secc, aFormat){
	//aFormat: 0 = h:mm:ss (h = 0->... can be more than 24); 1 = days, h:mm:ss; 2 = h:mm:ss (h = 0->23:59:59 = only time); 3 = h:mm (h = 0->... can be more than 24); 4 = days h:mm; 5 = h:mm
	if( isNaN(secc) || secc === Infinity ) return '--:--';
	var ht = secc < 0 ? "-" : "";
	var sec = Math.abs(secc);
	var h = Math.floor(sec/3600);
	var m = Math.floor(sec/60) % 60;
	var s = parseInt(sec % 60);
	switch (aFormat) {
		case 4:
		case 1: var d = Math.floor(h/24); h = h - d * 24; if( d > 0 ) ht += d + " "; break;
		case 2:
		case 5: h = h % 24; break;
	}
	ht += h + ":" + (m > 9 ? m: '0' + m);
	if( aFormat < 3 ) ht += ":" + (s > 9 ? s : '0' + s);
	h = null; m = null; s = null; d = null;
	return ht;
}

function toSeconds(hTime) {
	var p = hTime.match(/(\d+):(\d+):(\d+)/);
	return p ? (p[1] >= 0 ? 1:-1) * ( (Math.abs(p[1]) * 3600) + (p[2] * 60) + (p[3] * 1)): 0;
}

function getRandom ( x, y ) {
	return x+Math.round(Math.random()*y);
}

/********************* travian library *****************************/

function id2xy(vid) {
	var arrXY = new Array;
	var ivid = parseInt(vid);
	arrXY[0] = ((ivid-1) % mapWidth) - mapRadius;
	arrXY[1] = mapRadius - Math.floor((ivid-1) / mapWidth);
	return arrXY;
}

function xy2id(x, y) {
	return (1 + (parseInt(x) + mapRadius) + (mapWidth * Math.abs(parseInt(y) - mapRadius)));
}

function getVid ( hr ) {
	if (hr == null) return 0;
	var vIdH = hr.match(/[&\?][zd]=(\d+)/);
	if( vIdH ) vId = vIdH[1];
	else {
		vIdH = hr.match(/[&\?]x=(-?\d+)&y=(-?\d+)/);
		vId = vIdH ? xy2id(vIdH[1], vIdH[2]) : 0;
	}
	return vId;
}

function getVidFromCoords ( txt ) {
	var xy = new Array;
	txt = txt.replace(/([\u2000-\u20ff])/g,'');
	txt = txt.replace(/(\u2212)/g,'-');
	xy = txt.match(/\((-?\d{1,3})\D+?(-?\d{1,3})\)/);
	return xy ? xy2id(xy[1],xy[2]) : -1;
}

function printCoords ( vID ) {
	var xy = id2xy( vID );
	return '('+xy[0]+'|'+xy[1]+')';
}

function calcDistance ( id1, id2 ) {
	var myXY = id2xy( id1 );
	var dXY = id2xy( id2 );
	dX = (RB.Setup[50] == 2) ? Math.abs(dXY[0] - myXY[0]) : Math.min(Math.abs(dXY[0] - myXY[0]), Math.abs(mapWidth - Math.abs(dXY[0] - myXY[0])));
	dY = (RB.Setup[50] == 2) ? Math.abs(dXY[1] - myXY[1]) : Math.min(Math.abs(dXY[1] - myXY[1]), Math.abs(mapWidth - Math.abs(dXY[1] - myXY[1])));
	return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
}

function getTTime(dist, speed, arena, artefact, shoes, leftHand) {
	var artSp = [1,0.33,0.5,0.67,1.5,2,3];
	var shK = shoes ? shoes: 0;
	if ( leftHand ) { speed *= leftHand; }
	var abonus = 0.2; //Tournament Square bonus
	speed *= artSp[artefact];
	var aradius = 20;
	if( ( arena > 0 || shK > 0 ) && dist > aradius ) {
		return Math.round((dist-aradius)/(speed*(1+arena*abonus+shK))*3600+aradius/speed*3600);
	} else {
		return Math.round(dist/speed*3600);
	}
}

function getUserID() {
	try {
		var uName = $gc('playerName',$g('sidebarBoxActiveVillage'))[0].textContent.trim();
	} catch(e) { return null }
	var uidcookie = RB_getValue(crtName + '-TRBP-UID', "");
	var uIDs = uidcookie.split("@@_");
	for( var i = 0; i < uIDs.length; i++ ) {
		var uID = uIDs[i].split("\/@_");
		if (uID[0] == uName) { return uID[1] }
		if (uID[1] == uName) { return uID[2] } //workaround for old worldid that was removed
	}
	function getID() {
		ajaxRequest(fullName+'statistics/player', 'GET', null, function(ajaxResp) {
			var ad = ajaxNDIV(ajaxResp);
			var aV = $xf('//td[contains(@class,"pla")]/a[contains(@href,"profile") and text() = "' + uName + '"]', 'f', ad);
			ad = null;
			if (aV) { 
				var uId = aV.href.match(/profile\/(\d+)/)[1];
				uidcookie += uName +"\/@_"+ uId +"@@_";
				RB_setValue(crtName + '-TRBP-UID', uidcookie);
				return uId;
			} else { return null }
		}, dummy);
	}
	setTimeout(getID, getRandom(700,2000));
}

var initRes = true;
function getResources () {
	if( initRes ) {
		try {
			var aText = $xf('//script[contains(text(),"var resources")]').textContent;
			if ( /production:\s*({.*}),/.test(aText) ) {
				var production = JSON.parse(aText.match( /production:\s*({.*}),/)[1]);
			}
			if ( /maxStorage:\s*({.*})\s*/.test(aText) ) {
				var maxStorage = JSON.parse(aText.match( /maxStorage:\s*({.*})\s*/)[1]);
			}
		} catch(e) { loadVCookie('vPPH', 'village_PPH'); }
		for( var i = 0; i < 4; i++ ) {
			var wholeRes = $g("l" + (1+i));
			if( ! wholeRes ) return false;
			income[i] = production['l'+(1+i)];
			incomepersecond[i] = income[i] / 3600;
			iresNow[i] = parseInt(toNumber(wholeRes.textContent));
			fullRes[i] = maxStorage['l'+(1+i)];
		}
		resNow = iresNow.slice();
		initRes = false;
		saveVCookie('vPPH', income.concat(resNow).concat(fullRes).concat(Math.round(Date.now()/1000)));
	} else {
		var tnow = Date.now();
		for( var i = 0; i < 4; i++ ) {
			resNow[i] = Math.round(((tnow-RunTime[0])/1e3)*incomepersecond[i] + iresNow[i]);
			if( resNow[i] > fullRes[i] ) resNow[i] = fullRes[i];
			if( resNow[i] < 0 ) resNow[i] = 0;
		}
	}
	return true;
}

function getServerTime() {
	var srvTime = $xf('//*[@id="servertime"]/span','f',$g(pageElem[3]));
	srvTime.parentNode.style.width = "186px";
	if( loadServerTime == 0 ) loadServerTime = toSeconds(srvTime.innerHTML);
	return loadServerTime + Math.round((Date.now() - RunTime[0])/1e3);
}

function getTimeOffset () {
	return (new Date().getHours()) - parseInt($xf('//*[@id="servertime"]/span','f',$g(pageElem[3])).innerHTML.match(/\d+/)[0]);
}

function absTime( time , stime ) {
	var serverTime = stime || getServerTime();
	var tTime =  Math.abs(time) + serverTime;
	if( Math.abs(time) < 86400 ) if( tTime > 86400 ) tTime -= 86400;
	return tTime;
}

function $eT( tO, time, ft, att ) { // tO-type of Object, time - relative time, ft - time format, att - attributes
	var tTime = absTime(time);
	var dstr = tTime > 86400 ? (new Date((Math.abs(time)+getTimeOffset()*3600)*1e3+(Date.now()))).toDateString()+' ':'';
	var att2 = [['title',dstr + formatTime(tTime, 2)]];
	if( att !== undefined ) att2 = att.concat( att2 );
	return $ee(tO, formatTime(time,ft), att2);
}

function showRunTime() {
	var ltime = $g(pageElem[3]);
	if( ! (ltime) ) {
		ltime = $ee('DIV',$e('BR'),[['style','position:absolute; left:'+(ltr?10:document.body.clientWidth-100)+'px;top:'+(xyBody[1]+2)+'px;color:black;background-color:cyan;padding:1px 5px;border-radius: 2em;z-index:1000;']]);
		document.body.appendChild(ltime);
	}
	var fts = " RB:<b>" + (Date.now()-RunTime[0]) + "</b>ms";
	ltime.insertBefore($ee("span",fts), $gt('br',ltime)[0]);
}

/************* CSS & ID *****************/

var allIDs = [
	'mbuyf', // 0-mbuyf
	'resoursebar', // 1-resourcebar
	'progressbar', // 2-progressbar (class)
	'rb_tooltip', // 3-rb_tooltip
	'flDIV', // 4-flDIV (class)
	'newDd', // 5-newDd (class)
	'RBSetup', // 6-RBSetup
	'gnTable', // 7-gnTable (class)
	'rbOverview', // 8-rbOverview
	'rbLinks', // 9-rbLinks
	'pbOview', // 10-pbOview(123) (class)
	'rb_sum', // 11-rb_sum
	'rb_sum2', // 12-rb_sum2
	'redLine', // 13-redLine (class)
	'flDIV', // 14-flDIV(num)
	'buttons', // 15- buttons (class)
	'progressbar-completed', // 16-progressbar-completed
	'rbOtime', // 17-rbOtime
	'sf', // 18-sf
	'bordered', // 19-bordered
	'total', // 20-total
	'invisT', // 21-invisT
	'audio', // 22-audio alerts
	'attAlert', // 23-attack alert
	'FreezePaneOff', // 24-FreezePaneOff (class)
	'FreezePaneOn', // 25-FreezePaneOn (class)
	'InnerFreezePane', // 26-InnerFreezePane
	'FreezePane',  // 27-FreezePane
	'alarmClock', // 28-alarmClock
	'existT',	// 29-mark for links (class)
	'res_sum',	// 30-res_sum
	'ww_res_sum',	// 31-ww_res_sum
/* images */
	'hide',	// 32-img_hide (class)
	'car',	// 33- cargo
	'def',	// 34- defender
	'att',	// 35- attack
	'igm',	// 36- igm
	'info',	// 37- user info
	'edit',	// 38- edit
	'del',	// 39- delete
	'clipin',	// 40- clip in
	'clipout',	// 41- clip out
/* no images */
	'TMbuildingtags',	// 42- (class)
	'tm_uplevel',	// 43- (class) - now vacant!
	'marketWW',	// 44- template for merchant-tables (id)
	'mrgn', // 45- padding for image
	'selected', // 46- selected elements
	'tinfo', // 47- img_tinfo
	'vl',	// 48- village list icons
	'closeBtn'	//49- close button
	];

function randomizeIDs () {
	function replacer ( n ) {
		return rtStr[parseInt(n)];
	}
			//    0   1   2   3   4   5   6   7   8   9
	var rtStr = ['d','h','w','l','y','m','t','a','b','i'];
	var UUIDs = '';
	for( var i = 0; i < allIDs.length; i++ ) {
		do {
			var rID_num = (Math.round(Math.random()*Math.pow(10,Math.random()*3+5) + 1e3)).toString();
			var rID = rID_num.replace(/\d/g, replacer);
			var Rej = new RegExp(rID);
		} while( Rej.test(UUIDs) )
		UUIDs += rID + ',';
		allIDs[i] = rID;
	}
}
randomizeIDs();

acss = "table#"+allIDs[0]+" {width:100%; border-collapse:collapse; font-size:8pt; text-align:center; background-color:white; padding:2px; margin:1px;}" +
	"table#"+allIDs[0]+" td {background-color:transparent; border:1px solid silver; padding:2px;}" +
	"table#"+allIDs[0]+" td."+allIDs[18]+" {background-color:#FFE4B5;}" +
	"table#"+allIDs[1]+" {border-collapse:collapse; text-align:left; background-color:white; padding:0px; margin:0px;}" +
	"table#"+allIDs[1]+" tr {height:20px;border-collapse:collapse; text-align:left;}" +
	"table#"+allIDs[1]+" td {font-size:8pt;overflow:visible;white-space:nowrap;background-color:transparent; border:1px solid silver; padding:0px;}" +
	"table#"+allIDs[1]+" td."+allIDs[11]+" {font-size:8pt;background-color:#FFFFAF; text-align:right;}" +
	"table#"+allIDs[1]+" td."+allIDs[12]+" {background-color:#FFFFAF;height:18px; text-align:center; font-size:11px;}" +
	"table#"+allIDs[1]+" th {border:1px solid silver;height:18px;text-align:left;direction:ltr;white-space:nowrap;}" +
	"table#"+allIDs[1]+" th a {color:black; font-size:11px;}" +
	"."+allIDs[2]+" {width: 210px; }" +
	"div#"+allIDs[3]+" {position:absolute;z-index:10000;border:1px solid silver;text-align:center;background-color:#FFFFE0;}" +
	"."+allIDs[4]+" {position:absolute;border:1px solid silver;text-align:center;background-color:white;border-radius:5px;overflow:hidden;}" +
	"."+allIDs[5]+" {width:100%;height:7px;text-align:center;background-color: #D0D0FF;cursor:move;font-size:6pt;}"+
	"table#"+allIDs[6]+" {width:auto;border-collapse:collapse; text-align:left; background-color:#F0F0F0; margin:1px;}" +
	"table#"+allIDs[6]+" td {background-color:transparent; border:1px solid silver; padding:2px;}" +
	"table#"+allIDs[6]+" td input {width:150px;text-align:right}" +
	"."+allIDs[7]+" {width:auto;border-collapse:collapse; text-align:left; background-color:transparent; margin-bottom:1px;}" +
	"."+allIDs[7]+" td {background-color:transparent; border:1px solid silver; padding:0px 2px;text-align:right;}" +
	"."+allIDs[7]+" td img {margin:0px 3px;}" +
	"table#"+allIDs[8]+" {min-width:350px;width:auto;border-collapse:collapse; text-align:left; background-color:#F8F8F8; margin:1px;}" +
	"table#"+allIDs[8]+" tr {border-collapse:collapse; text-align:left;} table#"+allIDs[8]+" tbody tr:hover {background-color:#E5E5F0;}" +
	"table#"+allIDs[8]+" td {overflow:visible;white-space:nowrap;background-color:transparent;padding:0px 5px 1px;}" +
	"table#"+allIDs[8]+" td a {color:black;} table#"+allIDs[8]+" thead td {text-align:center;}" +
	"table#"+allIDs[8]+" td."+allIDs[17]+" {text-align:right;font-size:8pt;}" +
	"table#"+allIDs[8]+" td."+allIDs[10]+" {font-size:11px;width:54px;border:1px solid silver;background-color:transparent;padding:0px;}" +
	"table#"+allIDs[9]+" {width:auto;border-collapse:collapse; background-color:white; margin:0px;}" +
	"table#"+allIDs[9]+" tr {border-collapse:collapse;} table#"+allIDs[9]+" tbody tr:hover {background-color:#E5E5F0;}" +
	"table#"+allIDs[9]+" td {white-space:nowrap;text-align:left;background-color:transparent;padding:0px 5px 1px;}" +
	"table#"+allIDs[9]+" thead td {font-weight:bold;color:#3C3C3C;} table#"+allIDs[9]+" a {font-size:12px;color:#252525;font-weight:normal;}" +
	"."+allIDs[10]+"1 {width:100%;background-color:"+bgcolor[0]+";float:"+docDir[0]+";margin:0px; display:inline;padding:0px 2px;}" +
	"."+allIDs[10]+"2 {width:100%;background-color:"+bgcolor[1]+";float:"+docDir[0]+";margin:0px; display:inline;padding:0px 2px;}" +
	"."+allIDs[10]+"3 {width:100%;background-color:"+bgcolor[2]+";float:"+docDir[0]+";margin:0px; display:inline;padding:0px 2px;}" +
	/* "table#vlist {border-collapse:collapse;}" + */"table#vlist tbody td {background-color:transparent;} table#vlist tr:hover {background-color:#E5E5F0;}" +
	"."+allIDs[13]+" {width:100%; border-collapse:collapse; border:1px solid silver;margin-bottom:15px;} ."+allIDs[13]+" td{text-align:center; background-color:#FFC0C0; padding:1px; margin:1px;}" +
	"."+allIDs[19]+" {border:1px solid silver; text-align:right;}" +
	"tbody."+allIDs[20]+" {background-color:#F8FFEE;} tbody."+allIDs[20]+" td {background-color:transparent;text-align:center;} tbody."+allIDs[20]+" th {background-color:transparent;}" +
	"."+allIDs[21]+" {border-collapse:collapse;background-color:transparent;} ."+allIDs[21]+" td {background-color:transparent;}" +
	"button."+allIDs[15]+" {color:#fff;background-image:linear-gradient(to top,#5c8d0f,#82b433);padding:3px 12px !important;margin:3px 3px !important;border-radius:5px;height:25px;font-size:11px;font-weight:bold;line-height:15px;}" +
	"."+allIDs[24]+" { visibility:hidden; display:none; position:absolute; top:-100px; left:-100px; }" +
	"."+allIDs[25]+" { position:absolute; top:0px; left:0px; visibility:visible; display:block; width:100%; height:100%; background-color: black; z-index: 20000; opacity:0.7; padding-top: 20%; }" +
	"."+allIDs[26]+" { text-align:center; width:66%; background-color:#000015; color:white; font-size:large; border:dashed 2px #FF00AA; padding:9px; } ."+allIDs[26]+" button {color:white;}" +
	"span."+allIDs[29]+" { visibility:hidden; display:none; }" +
	"."+allIDs[42]+" { border: 1px solid rgba(0,0,0,.7); text-align: center; border-radius: 50%; width: 21px; height: 21px; line-height: 23px; position: absolute; }" +
	"table#"+allIDs[31]+" td a {color:black;font-weight:normal;}" +
 	"."+allIDs[32]+" { padding:0px 2px;cursor:pointer;height:11px;width:12px;background: url("+img_hide+") no-repeat 0px 0px; }" +
	"."+allIDs[33]+" { height:14px !important;width:18px !important;background: url("+img_car+") no-repeat 0px 0px !important; }" +
	"."+allIDs[34]+" { height:14px !important;width:18px !important;background: url("+img_def+") no-repeat 0px 0px !important; }" +
	"."+allIDs[35]+" { height:14px;width:18px;background: url("+img_att+") no-repeat 0px 0px !important; }" +
	"."+allIDs[36]+" { height:8px;width:11px;background: url("+img_igm+") no-repeat 0px 0px;margin:0px 3px; }" +
	"."+allIDs[37]+" { height:10px;width:12px;background: url("+img_info+") no-repeat 0px 0px;margin:0px 3px; }" +
	"."+allIDs[38]+" { height:12px;width:16px;background: url("+img_edit+") no-repeat 0px 0px;cursor:pointer; }" +
	"."+allIDs[39]+" { height:12px;width:16px;background: url("+img_del+") no-repeat 0px 0px;cursor:pointer; }" +
	"."+allIDs[47]+" { height:12px;width:12px;background: url("+img_tinfo+") no-repeat 0px 0px;margin:0px 5px; display: inline-block; }" +
	"img."+allIDs[45]+" {margin:0px 5px;} ."+allIDs[46]+" * {background-color:#ECECEC !important;} ";	

if( /karte|position/.test(crtPath) ) acss += "."+allIDs[40]+" { height:12px;width:16px;background: url("+img_clipIn+") no-repeat 0px 0px;cursor:pointer; }"+
	"."+allIDs[41]+" { height:12px;width:16px;background: url("+img_clipOut+") no-repeat 0px 0px;cursor:pointer; }";

acss += "table#vlist td{padding:0;line-height:16px;text-align:"+docDir[0]+";white-space:nowrap;}table#vlist thead td{background-color:#FFF;height:22px;text-align:center;padding:0px 3px;}" +
	"table#vlist td.dot{width:10px;padding:0 3px;}table#vlist td.link{padding-right:10px;}table#vlist thead td a{font-weight:bold;color:#3C3C3C;}" +
	"table#vlist tbody td{font-size:12px;padding:0 2px;}table#vlist td.hl{color:#FF8000;}table#vlist td.link{font-size:14px;}table#vlist {border-collapse:collapse;}" +
	"table#vlist td a{font-weight:normal;color:#252525;}table#vlist td a.active{font-weight:bold;color:#252525;}" + //#FF8000;
	"div#build.gid17 table.send_res td {padding:2px 3px;} div.alliance table#offs td.sub div {"+(ltr?"padding-left":"padding-right")+":44px;}" +
	"div.subjectWrapper {width:95% !important; margin-"+docDir[0]+";"+docDir[0]+":16px;} div.reports table#overview td.sub .iReport {position:relative;"+docDir[0]+":-4px;}" +
	"td.coords,th.coords a{white-space:normal !important;} #side_info .listing ul li:hover a {background-color:white;} #side_info .listing ul {padding-"+docDir[1]+":16px;}";

	acss += "span."+allIDs[48]+" {position:absolute;"+docDir[0]+":125px !important;width:36px !important; display: inline-flex; }"+
	"span."+allIDs[48]+" a {display:inline !important;margin:0px !important;padding:0px !important;width:18px !important;left:auto !important;position:relative;}"+
	"span."+allIDs[48]+" img {left:0 !important;top:0 !important;position:relative !important;display:inline !important;}"+
	"span."+allIDs[49]+" {position:absolute;"+docDir[0]+":85px !important;width:36px !important; display: inline-flex; }"+
	"span."+allIDs[49]+" img {left:0 !important;top:0 !important;position:relative !important;display:inline !important;}";

/*************tooltips elements*****************/
function makeTooltip( ttObj ) {
	var ttD = $g(allIDs[3]);
	if( ! ttD ) {
		ttD = $e('DIV', [['id', allIDs[3]]]);
		document.body.appendChild(ttD);
		document.addEventListener("mousemove", updateTooltip, false);
	}
	ttD.appendChild( ttObj );
	return ttD;
}
function removeTooltip() {
	var ttD = $g(allIDs[3]);
	if( ttD ) {
		document.removeEventListener("mousemove", updateTooltip, false);
		document.body.removeChild(ttD);
		timerP.length = lastTimerP[0];
		timerB.length = lastTimerB;
	}
}
function updateTooltip(e){
	updatePosition( allIDs[3], [e.pageX,e.pageY] );
}
function updatePosition( wn, xy, sh ){
	var ttD = $g(wn);
	if( ! ttD ) return;
	var dW = ttD.clientWidth;
	var dH = ttD.clientHeight;
	var y = xy[1] + 8;
	if( sh ) {
		var x = RB.XY[sh*2];
	} else {
		var x = xy[0] + 8;
		if (x + dW > window.innerWidth + window.scrollX) x = x > dH + 16 ? x - dW - 16: 0;
	}
	ttD.style.left = x + "px";
	if (y + dH > window.innerHeight + window.scrollY) y = y > dH + 16 ? y - dH - 16: 0;
	ttD.style.top = y + "px";
}
function addToolTip (newITT,nd) {
	if( newITT ) {
		tiImg = trImg(allIDs[47]);
		tiImg.addEventListener("mouseover", function () { makeTooltip(newITT); }, false);
		tiImg.addEventListener("mouseout", removeTooltip, false);
		nd.appendChild(tiImg);
	}
}
/*************drag elements*****************/
var dragMaster = (function() {
	var dragObject;
	var mouseOffset;
	var mouseDownAt;
	var touchFL;
	function getMouseOffset(target, e) {
		var docPos = offsetPosition(target);
		return {x:e.pageX - docPos[0], y:e.pageY - docPos[1]};
	}
	function mouseUp(){
		if (mouseDownAt) {
			mouseDownAt = null;
		} else {
			savePosition(dragObject);
			dragObject = null;
		}
		if(touchFL) {
			document.removeEventListener('touchmove', touchMove, true);
			document.removeEventListener('touchend', mouseUp, true);
			document.removeEventListener('touchcancel', mouseUp, true);
		} else {
			document.removeEventListener('mousemove', mouseMove, true);
			document.removeEventListener('mouseup', mouseUp, true);
		}
	}
	function mouseMove(e){
		var ev = touchFL?e.touches[0]:e; 
		if (mouseDownAt) if (Math.abs(mouseDownAt.x-ev.pageX)<10 && Math.abs(mouseDownAt.y-ev.pageY)<10) return;
		with(dragObject.style) {
			position = 'absolute';
			top = ev.pageY - mouseOffset.y + 'px';
			left = ev.pageX - mouseOffset.x + 'px';
		}
		mouseDownAt = null;
		if(touchFL) e.preventDefault();
		return false;
	}
	function dragStart(e,o,fl) {
		touchFL=fl;
		dragObject  = o.parentNode;
		var ev = touchFL?e.touches[0]:e;
		mouseOffset = getMouseOffset(o, ev);
		mouseDownAt = { x: ev.pageX, y: ev.pageY, dragObject: o };
		if(touchFL) {
			document.addEventListener('touchmove', mouseMove, true);
			document.addEventListener('touchend', mouseUp, true);
			document.addEventListener('touchcancel', mouseUp, true);
			e.preventDefault();
		} else {
			document.addEventListener('mousemove', mouseMove, true);
			document.addEventListener('mouseup', mouseUp, true);
		}
	}
	function mouseDown(e) {
		if (e.which!=1) return;
		dragStart(e,this,false);
		return false;
	}
	function touchStart(e) {
		dragStart(e,this,true);
		return false;
	}
	return {
		makeDraggable: function(element){
			element.addEventListener('mousedown', mouseDown, true);
			element.addEventListener('touchstart', touchStart, true);
		}
	}
}())
/**********end**drag elements*****************/

function savePosition(objName) {
	objNum = parseInt(objName.id.match(/\d+$/)[0]);
	if( objNum > 20 ) return;
	RB.XY[objNum*2] = objName.style.left.match(/^\d+/)[0];
	RB.XY[objNum*2+1] = objName.style.top.match(/^\d+/)[0];
	saveCookie('xy', 'XY');
}

var divSN = 100;
function makeFloat(flObj, ix, iy, sid) {
	flId = sid !== undefined ? sid : ++divSN;
	var zindex = 5999;
	switch (flId) {
		case 4:  zindex = 9999; break;
		case 21:  zindex = 10001; break;
	}
	bd = $e('div',[['id',allIDs[14] + flId],['class',allIDs[4]],['style','left:'+ ix +'px;top:'+ iy +'px;z-index:'+ zindex +';margin-right:-10000px;']]);
	bdr = $ee('div','',[['class',allIDs[5]],['onmousedown',jsNone]]);
	bd.appendChild(bdr);
	bd.appendChild(flObj);
	document.body.appendChild(bd);
	dragMaster.makeDraggable(bdr);
	return allIDs[14] + flId;
}

function makeFloatD(flObj, mNum) {
	var ix = RB.XY[mNum*2] < 1 ? 1: RB.XY[mNum*2];
	var iy = RB.XY[mNum*2+1] < xyBody[1] ? xyBody[1]: RB.XY[mNum*2+1];
	return makeFloat(flObj, ix, iy, mNum);
}

function closeWindowN ( num ) {
	if( windowID[num] == undefined ) return false;
	var wo = $g(windowID[num]);
	if( ! wo ) return false;
	wo.parentNode.removeChild(wo);
	windowID[num] = undefined;
	return true;
}

function bodyHide ( body ) {
	if( body[0].getAttribute('style',2) === null ) {
		body[0].setAttribute('style','display:none');
		RB.bodyH[body[1]] = 1;
		if( body[2] ) body[2].style.backgroundPosition = '0px -12px';
	} else {
		body[0].removeAttribute('style');
		RB.bodyH[body[1]] = 0;
		if( body[2] ) body[2].removeAttribute('style');
	}
	saveCookie('bodyH', 'bodyH');
}

/************************** build pages ****************************/

// begin Travian - add needed resources automatically under build/upgrade link
function needed_show( base ) {
	function saveWantsMem ( wantsResM ) {
		var noplace = '';
		var ofFL = false;
		for( var i = 0; i< 4; i++ ) if( wantsResM[i+5] > fullRes[i] ) ofFL = true;
		if( ofFL ) {
			noplace = gtext("noplace");
			if( wantsResM[4] != village_aid ) RB.wantsMem = [0,0,0,0,0,0,0,0,0,0];
		} else RB.wantsMem = wantsResM.slice();
		RB.wantsMem[4] = village_aid;
		saveCookie('Mem', 'wantsMem');
		alert( noplace +"\nSaved: "+ RB.wantsMem[0] +" | "+ RB.wantsMem[1] +" | "+ RB.wantsMem[2] +" | "+ RB.wantsMem[3] );
	}
	function showPlusTimer () {
		if (RB.Setup[10] > 2 && $g('merchantsOnTheWay')) return;
		var j=timerB.length;
		timerB[j] = new Object();
		timerB[j].time = Math.abs(Math.round(wantsRes/incomepersecond[e]));
		timerB[j].obj = $eT('SPAN', timerB[j].time, 0);
		return timerB[j].obj;
	}

	var neededRes = base.match(/>(\d+).+?>(\d+).+?>(\d+).+?>(\d+)/);
	wfl = false;
	var wantsResMem = [0,0,0,0,0,0,0,0,0,0];
	var wantsResMemP = RB.wantsMem.slice();

	var forNPC = [0,0];
	var beforeThis = $e('DIV');
	for (var e = 0; e < 4; e++) {
		wantsResMem[e+5] = parseInt(neededRes[e+1]);
		wantsResMemP[e+5] = parseInt(wantsResMemP[e+5]) + wantsResMem[e+5];
		var wantsRes = resNow[e] - wantsResMem[e+5];
		var wantsResP = resNow[e] - wantsResMemP[e+5];
		if (wantsResP < 0) wantsResMemP[e] = Math.abs(wantsResP);
		forNPC[0] += wantsRes;
		forNPC[1] += incomepersecond[e];
		beforeThis.appendChild($e('i',[['class','r'+(e+1)],['style','display:inline-block;']]));
		if (wantsRes >= 0) {
			if( income[e] < 0 )
				beforeThis.appendChild($em('SPAN',['+'+ wantsRes+ ' (',showPlusTimer(),') '],[['style','color:green;']]));
			else
				beforeThis.appendChild($ee('SPAN','+'+ wantsRes +' ',[['style','color:green;']]));
		} else {
			beforeThis.appendChild($em('SPAN',[wantsRes + ' (',(income[e] > 0 ? showPlusTimer(): '--:--'),') '],[['style','color:red;']]));
			wantsResMem[e] = Math.abs(wantsRes);
			wfl = true;
		}
	}
	if( RB.Setup[11] > 0 && forNPC[0] < 0 ) {
		var j=timerB.length;
		timerB[j] = new Object();
		timerB[j].time = Math.abs(Math.round(forNPC[0]/forNPC[1]));
		timerB[j].obj = $eT('SPAN', timerB[j].time, 0);
		beforeThis.appendChild($em('SPAN',['(',trImg('npc_inactive'),' ',timerB[j].obj,') ']));
	}
	var memP = $a('(M)',[['href',jsVoid],['dir','ltr']]);
	memP.addEventListener('click', function(x) { return function() { saveWantsMem(x); }}(wantsResMem), 0);
	beforeThis.appendChild(memP);
	if( RB.wantsMem[4] == village_aid ) {
		var memP = $a(' (M+)',[['href',jsVoid]]);
		memP.addEventListener('click', function(x) { return function() { saveWantsMem(x); }}(wantsResMemP), 0);
		beforeThis.appendChild(memP);
	}

	return beforeThis;
}

function neededResAdd () {	
	function addNPC( base ) {
		var gold = $gc('gold',base);
		if( gold.length > 0 ) {
			gold[0].addEventListener('click', function(x) { setTimeout(npcForTroops,500); }, 0);
		}
	}

	var baseWrap = $xf('.//div[contains(@class,"resourceWrapper")]','l',cont);
	for( var i = 0; i < baseWrap.snapshotLength; i++ ) {
		var base = baseWrap.snapshotItem(i);
		if ( ! />(\d+).+?>(\d+).+?>(\d+).+?>(\d+)/.test(base.innerHTML) ) break;
		var newD = needed_show( base.innerHTML );
		if (base.parentNode.classList.contains("contractWrapper") || base.parentNode.classList.contains("information") || base.parentNode.classList.contains("details") || (/hero/.test(crtPath))) {
			addNPC(base.parentNode);
			if ( !wfl && base.parentNode.getAttribute("class") == "information" ) continue;
			if ( !wfl && base.parentNode.getAttribute("class") == "details" ) continue;
			base.parentNode.insertBefore(newD, base.nextSibling);
			var tr = base.parentNode.parentNode.parentNode;
			if (wfl && tr.classList.contains("action")) {
				offsetHeight = tr.firstElementChild.offsetHeight;
				if (offsetHeight > 150 ) tr.style.height = offsetHeight + "px";
			}
		}
	}

	var clk = $gc('clock_medium',cont);
	for( var i = 0; i < clk.length; i++ ) {
		if ( ! />(\d+:\d+:\d+)/.test(clk[i].parentNode.innerHTML) ) continue;
		var needTime = (clk[i].parentNode.innerHTML).match(/>(\d+:\d+:\d+)/)[1];
		clk[i].parentNode.title=RB.dictionary[14]+formatTime(absTime(toSeconds(needTime)),4);
	}

	lastTimerB = timerB.length;
}
// end Travian - add needed resources automatically under build/upgrade link

/********************* messages & reports ***************************/

function convertCoordsInMessagesToLinks() {
	var cM = $xf("//div[@*='message']");
	if( cM ) {
		var arXY = [];
		var iHTML = cM.innerHTML.replace(/([\u202a-\u202f])/g,'');
		var iHTML2 = iHTML;

		var j = 0;
		var villageLink = [];
		var Rej = /<a.+?\/a>/gi; // new Travian IGM extended tags
		while ((arXY = Rej.exec(iHTML)) != null) {
			var mLink = arXY[0];
			villageLink[j] = "<span>" + mLink + "</span>";
			iHTML2 = iHTML2.replace(mLink, "<#!" + (j++) + "/>");
		}
		var Rej = /(https?:\/\/[^\s<>"$]+)/gi; // URLs
		while ((arXY = Rej.exec(iHTML)) != null) {
			var mLink = arXY[1].match(/(.*?)(?:\.|,|<|\))?$/)[1];
			villageLink[j] = "<span><a target='_blank' href='" + mLink + "'>" + mLink + "</a></span>";
			iHTML2 = iHTML2.replace(mLink, "<#!" + (j++) + "/>");
		}
		var Rej = /[\/:]?(-?\d+)(?:<.+?>)?\s*?([\|\/\\ ])?(?:<.+?>)?\s*?(-?\d+)(?![\$\/%\d:])/g;
		while ((arXY = Rej.exec(iHTML)) != null) {
			if( /^[\/:]/.test(arXY[0]) ) continue;
			if( ! ( arXY[2] != undefined || arXY[3] < 0 )) continue;
			if( Math.abs(arXY[1]) > mapRadius || Math.abs(arXY[3]) > mapRadius ) continue;
			villageLink[j] = "<span><a href='/karte.php?x="+arXY[1]+"&y="+arXY[3] +"'>"+ arXY[0] +"</a></span>";
			iHTML2 = iHTML2.replace(arXY[0], "<#!" + (j++) + "/>");
		}
		for( var i = 0; i < j ; i++ ) {
			iHTML2 = iHTML2.replace("<#!" + i + "/>", villageLink[i]);
		}
		villageLink.length = 0;
		cM.innerHTML = iHTML2;
		var mLinks = $xf('.//span/a','l',cM);
		for( var i = 0; i < mLinks.snapshotLength; i++ ) {
			distanceTooltip(mLinks.snapshotItem(i),0);
			sendResTropAdd(mLinks.snapshotItem(i), 1);
			linkHint(mLinks.snapshotItem(i));
		}
	}
}

/************************* Marketplace ****************************/

function marketBuy() {
	var market = $g("range");
	if( !(market) ) return;
	if( RB.village_Var[0] > 0 ) {
		market = market.tBodies[0].rows;
		for ( var mr = 0; mr < market.length; mr++ ) {
			if( market[mr].cells.length < 5 ) break;
			var btn = market[mr].cells[5].getElementsByTagName('BUTTON');
			if( btn.length == 0 ) continue;
			var wanted = parseInt(market[mr].cells[2].innerHTML.match(/>\s*?(\d+)/)[1]);
			var totMerchants = Math.ceil(wanted / RB.village_Var[0]);
			var crtExceed = wanted - totMerchants * RB.village_Var[0];
			var newTip = RB.dictionary[2]+': '+totMerchants;
			if( crtExceed < 0 ) newTip += ' ( '+ crtExceed + ' )';
			btn[0].setAttribute('title', newTip);
		}
	}
	if( RB.dictFL[4] == 0 ) {
		var TM = $g("range").tHead.rows[0].cells[4].innerHTML.onlyText();
		if( RB.dictionary[4] != TM ) {
			RB.dictionary[4] = TM;
			saveCookie( 'Dict', 'dictionary' );
			RB.dictFL[4] = 1;
			saveCookie( 'DictFL', 'dictFL' );
		}
	}
	if( RB.dictFL[11] == 0 ) {
		try {
			var tm = $gc('active',$gc('contentNavi',cont)[0])[0].innerHTML.onlyText().trim();
		} catch(err) {
			var tm = false;
		}
		if( tm ) {
			RB.dictionary[11] = tm;
			saveCookie( 'Dict', 'dictionary' );
			RB.dictFL[11] = 1;
			saveCookie( 'DictFL', 'dictFL' );
		}
	}
}

// market send page :)
function marketSend () {
	function updateInput (input, value) {
		if (input.disabled) return;
		input.focus();
		if (input.value) input.select();
		document.execCommand('insertText', false, value);
	}
	function setMerchantsCell(tM, tR, colM) {
		totalResources.textContent = tR;
		$at(totalResources, [['style', 'justify-self:start; color:' + colM + ';']]);
	}
	function getTotTransport() {
		var totT = 0;
		for (var i = 0; i < 4; i++) {
			var aR = parseInt(rxI[i].value);
			if (isFinite(aR)) totT += aR;
		}
		return totT;
	}
	function mhRowUpdate() {
		var totTransport = getTotTransport();
		var totMerchants = Math.ceil(totTransport / maxC);
		var mhColor = 'green';
		var crtWaste = maxC - (totTransport - (totMerchants-1) * maxC);
		var crtExceed = totTransport - maxTr;

		var tMText = mName + ": " + totMerchants + " / " + maxM;
		var tRText = "Σ = " + totTransport;
		if (totMerchants > maxM) {
			mhColor = "red";
			tRText += " ( +"+ crtExceed + " )";
		} else if ( crtWaste ) tRText += " ( -"+ crtWaste + " )";
		$at(totalResources, [['style', 'justify-self:start; color:' + mhColor + ';']]);
		setMerchantsCell(tMText, tRText, mhColor);
	}
	function getMaxRTr () {
		//var maxRRTr = parseInt(maxRC.value);
		var maxRRTr = parseInt(maxTr);
		//var maxRTr = isNaN(maxRRTr)? maxTr: maxRRTr;
		var maxRTr = isNaN(maxRRTr)? maxTr: maxRRTr;
		//var maxRMM = parseInt(maxRM.value);
		var maxRMM = parseInt(maxM);
		//var maxRTTr = isNaN(maxRMM)? maxTr: maxRMM * maxC;
		var maxRTTr = isNaN(maxRMM)? maxTr: maxRMM * maxC;
		return Math.min(maxRTr, maxRTTr);
	}
	function mhRowLinkR ( RC ) {
		var maxRTr = getMaxRTr();
		var totTransport = getTotTransport();
		var aR = parseInt(rxI[RC].value).NaN0();
		if( lastLinkR[0] != RC || lastLinkR[3] != aR ) {
			lastLinkR = [RC,0,aR];
			var totMerchants = Math.ceil(totTransport / maxC);
			var crtExceed = totTransport - maxRTr;
			if( crtExceed > 0 ) {
				rxI[RC].value = Math.ceil(crtExceed / maxC) > Math.ceil(aR / maxC) || aR < crtExceed ? 0: rxI[RC].value - crtExceed;
			} else {
				var crtWaste = maxC - (totTransport - (totMerchants-1) * maxC);
				var recomended = crtWaste != 0 ? aR + crtWaste : 0;
				var i = recomended < resNow[RC-1] ? recomended : resNow[RC-1];
				rxI[RC].value = crtExceed < 0 ? i : 0;
			}
		} else {
			var i = ( aR == 0 && lastLinkR[1] == 0 ) ? false : true;
			rxI[RC].value = lastLinkR[1] == 0 && i ? 0 : lastLinkR[2];
			if( ++lastLinkR[1] > 1 || ! i ) lastLinkR[0] = 0;
		}
		lastLinkR[3] = parseInt(rxI[RC].value);
		mhRowUpdate();
	}
	function mhRowLinkM ( RC ) {
		var aR = parseInt(rxI[RC].value);
		updateInput(rxI[RC],aR > maxC ? aR - maxC : 0);
		mhRowUpdate();
	}
	function mhRowLinkP ( RC ) {
		var aR = parseInt(rxI[RC].value);
		var i = isNaN(aR) ? maxC : aR + maxC;
		updateInput(rxI[RC],i < resNow[RC] ? i : resNow[RC]);
		mhRowUpdate();
	}
	function mhRowsLinkM () {
		for( var i = 0; i < 4; i++ )
			if( checkRes[i].checked ) mhRowLinkM ( i );
	}
	function mhRowsLinkP () {
		for( var i = 0; i < 4; i++ )
			if( checkRes[i].checked ) mhRowLinkP ( i );
	}
	var extNegat = 0;
	function mhRowLinkMem () {
		loadVCookie('vPPH', 'village_PPH', RB.wantsMem[4]);
		if( RB.wantsMem[4] == 0 ) return;
		var arXY = id2xy( RB.wantsMem[4] );
		var coordXInput = $gt('input',$gc('coordinateX',basee)[0])[0];
		var coordYInput = $gt('input',$gc('coordinateY',basee)[0])[0];
		var coordX = parseInt(coordXInput.getAttribute("value"));
		var coordY = parseInt(coordYInput.getAttribute("value"));
		if (arXY[0] != coordX) updateInput(coordXInput,arXY[0]);
		if (arXY[1] != coordY) updateInput(coordYInput,arXY[1]);
		var htR = getTTime( calcDistance(RB.wantsMem[4], village_aid), MTime[parseInt(RB.Setup[2])]*sM, 0, 0 );
		var ht = parseInt(RB.wantsMem[9]) < htR ? htR - parseInt(RB.wantsMem[9]): 0;
		for( var i = 0; i < 4; i++ ) { updateInput(rxI[i],0); } //reset values so they will not overflow
		for( var i = 0; i < 4; i++ ) {
			var wantRes = Math.ceil(parseInt(RB.wantsMem[i]) - RB.village_PPH[i]/3600 * ht);
			if( RB.village_PPH[i] < 0 && ht > 0 ) {
				var deltaTime = RB.village_PPH[12] > 0 ? Math.round((Date.now())/1000) - parseInt(RB.village_PPH[12]): 0;
				var leftResInV = Math.floor(RB.village_PPH[i]/3600 * (deltaTime + ht) + RB.village_PPH[i+4]);
				if( leftResInV < 0 ) {
					var nowResInV = Math.floor(RB.village_PPH[i]/3600 * deltaTime + RB.village_PPH[i+4]);
					if( nowResInV < 0 ) nowResInV = 0;
					wantRes = nowResInV + parseInt(RB.wantsMem[i]);
				}
				var minLeft = prompt(gtext("consnegat"), 10);
				if( minLeft == null ) minLeft = 0;
				if( minLeft == 0 ) wantRes = RB.wantsMem[i];
				else {
					extNegat = Math.ceil(RB.village_PPH[i]/3600 * parseInt(minLeft)*60);
					wantRes -= extNegat;
				}
			}
			if( wantRes < 0 ) wantRes = 0;
			if( checkRes[i].checked ) updateInput(rxI[i],wantRes < resNow[i] ? wantRes: resNow[i]);
		}
		mhRowUpdate();
		//sendResourses( RB.wantsMem[4] );
	}
	var mcFL = true;
	function rEL () {
		$g('button').removeEventListener('DOMNodeInserted',rEL);
		if( mcFL ) {
			($gc('merchantsAvailable')[0]).addEventListener('DOMNodeInserted',reloadMerchants,false);
			mcFL = false;
		}
		setTimeout(reloadSettings,100);
	}
	function removeACh () {
		//$g('button').addEventListener('DOMNodeInserted',rEL,false);
		//if( typeof checkRes == 'undefined' ) return;

		//for( var i = 1; i < 5; i++ )
		//	checkRes[i].checked = false;

		//if( $gn('x').length < 1 ) return;
		//var xx = parseInt($gn('x')[0].value);
		//var yy = parseInt($gn('y')[0].value);
		var xx = parseInt($gt('input',$gc('coordinateX',basee)[0])[0].value);
		var yy = parseInt($gt('input',$gc('coordinateY',basee)[0])[0].value);
		if( isNaN(xx) || isNaN(yy) ) return;
		if( xy2id(xx,yy) == RB.wantsMem[4] ) {
			RB.wantsMem[3] = parseInt(RB.wantsMem[3]) - extNegat;
			saveCookie('Mem', 'wantsMem');
		}
	}
	function mhRowsLinkPP () {
		var maxRTr = getMaxRTr();
		var aRc = 0;
		var aRn = 0;
		for( var i = 0; i < 4; i++ ) if( checkRes[i].checked ) { aRc++; aRn += resNow[i]; }
		if( aRc > 0 ) {
			for( var i = 0; i < 4; i++ ) { updateInput(rxI[i],0); } //reset values so they will not overflow
			for( var i = 0; i < 4; i++ ) {
				if( checkRes[i].checked ) {
					var toRes = Math.floor((resNow[i]/aRn) * maxRTr);
					updateInput(rxI[i],toRes < resNow[i] ? toRes : resNow[i]);
				}
			}
			mhRowUpdate();
		}
	}
	function mhRowsLinkEq () {
		var maxRTr = getMaxRTr();
		var aRF = [];
		for( var i = 0; i < 4; i++ ) if( checkRes[i].checked && resNow[i] > 0 ) aRF.push(resNow[i]);
		if( aRF.length > 0 ) {
			aRF.sort(function(a,b){return b-a;});
			var aRc = 0;
			var aRc2 = 0;
			for( i=aRF.length; i>0; i--) {
				aRc += aRc2;
				aRc2 = aRF[i-1];
				if( aRc+aRF[i-1]*i >  maxRTr ) break;
			}
			aRc = Math.floor((maxRTr-aRc)/i);
			for( var i = 0; i < 4; i++ ) { updateInput(rxI[i],0); } //reset values so they will not overflow
			for( var i = 0; i < 4; i++ ) {
				if( checkRes[i].checked ) updateInput(rxI[i],aRc > resNow[i] ? resNow[i]: aRc);
			}
			mhRowUpdate();
		}
	}
	function mhRowsLinkCl () {
		for( var i = 0; i < 4; i++ ) {
			if( checkRes[i].checked ) updateInput(rxI[i],0);
		}
		mhRowUpdate();
	}
	function mhRowLinkMPlus () {
		var xx = parseInt($gn('x')[0].value);
		var yy = parseInt($gn('y')[0].value);
		if( isNaN(xx) || isNaN(yy) ) return;
		RB.wantsMem = [0,0,0,0,0,0,0,0,0,0];
		for( var i=0; i<4; i++ )
			if( isFinite(parseInt(rxI[i+1].value)) ) RB.wantsMem[i] = parseInt(rxI[i+1].value);
 		RB.wantsMem[4] = xy2id(xx,yy);
		saveCookie('Mem', 'wantsMem');
		alert( "Saved: "+ RB.wantsMem[0] +" | "+ RB.wantsMem[1] +" | "+ RB.wantsMem[2] +" | "+ RB.wantsMem[3] );
	}
	function mhRowLinkAMem () {
		initRes = true; setTimeout(function() { getResources(); progressbar_ReInit(); }, 500);
		var xx = parseInt($gt('input',$gc('coordinateX',basee)[0])[0].value);
		var yy = parseInt($gt('input',$gc('coordinateY',basee)[0])[0].value);
		if( isNaN(xx) || isNaN(yy) ) return;
		if( xy2id(xx,yy) != RB.wantsMem[4] ) return;
		loadVCookie('vPPH', 'village_PPH', RB.wantsMem[4]);
		var htR = getTTime( calcDistance(RB.wantsMem[4], village_aid), MTime[parseInt(RB.Setup[2])]*sM, 0, 0 );
		var ht = parseInt(RB.wantsMem[9]) < htR ? htR - parseInt(RB.wantsMem[9]): 0;
		for( var i = 0; i < 4; i++ ) {
			var rxI = $gn(resnames[i])[0].value;
			if( isNaN(parseInt(rxI)) || parseInt(rxI) == 0 ) continue;
			RB.wantsMem[i] = parseInt(RB.wantsMem[i]) - parseInt(rxI) - Math.ceil(RB.village_PPH[i]/3600 * ht);
			if( RB.wantsMem[i] <= 0 ) RB.wantsMem[i] = 0;
		}
		if( parseInt(RB.wantsMem[0])+parseInt(RB.wantsMem[1])+parseInt(RB.wantsMem[2])+parseInt(RB.wantsMem[3]) > 0 ) {
			if( parseInt(RB.wantsMem[9]) < ht ) RB.wantsMem[9] = ht;
		} else RB.wantsMem = [0,0,0,0,0,0,0,0,0,0];
		saveCookie('Mem', 'wantsMem');
	}
	function reloadSettings () {
		addButtonsEvent( checkTargetValidate() );
		for( var i = 1; i < 5; i++ )
			checkRes[i].checked = true;
		reloadMerchants();
	}
	function addButtonsEvent ( fl ) {
		//var ss = $gt('button',$gn('snd')[0]);
		var ss = basee.querySelectorAll('button[type=submit]');
		//for( i=0; i<ss.length; i++ ) ss[i].addEventListener('click', removeACh, true);
		for( i=0; i<ss.length; i++ ) ss[i].addEventListener('click', mhRowLinkAMem, true);
		// travel time
		//if( ! fl && ss.length > 0 )
		//	addShowDistanceIn( ss[0].parentNode, -1 );
		if( fl ) $gn('dname')[0].value = '';
	}
	function checkTargetValidate () {
		if( basee ) {
			var ss = basee.querySelectorAll('button[type=submit]');
			//$gc("sendRessources",$gn('snd')[0])[0].addEventListener('click', mhRowLinkAMem, true);
			if (ss.length>0) {
				ss[0].addEventListener('click', mhRowLinkAMem, true);
			} else return false;
			//addSpeedAndRTSend(basee);
			return true;
		} else return false;
	}
	function reloadMerchants () {
		checkMerchants();
		maxRM.value = maxM;
		maxRC.value = maxM * maxC;
		mhRowUpdate();
	}
	function checkMerchants () {
		var merInfo = $gc('merchantsInformation')[0];
		if (merInfo.firstElementChild) {
			if (merInfo.firstElementChild.firstElementChild && merInfo.firstElementChild.nextElementSibling) {
				moC = merInfo.firstElementChild.firstElementChild;
			} else return false;
		} else return false;
		if (moC) {
			var moCC = moC.innerHTML.onlyText().match(/(\d+)[\/\\](\d+)/);
			mDiv = merInfo.firstElementChild;
			mName = mDiv.textContent.split(":")[0];
			if( mName != RB.dictionary[2] ) {
				RB.dictionary[2] = mName;
				saveCookie( 'Dict', 'dictionary' );
			}
			if (parseInt(moCC[2]) > parseInt(moCC[1])) {
				maxM = parseInt(moCC[1]);
				merchInWork = parseInt(moCC[2]) - maxM;
			} else {
				maxM = parseInt(moCC[2]);
				merchInWork = parseInt(moCC[1]) - maxM;
			}
			maxC = parseInt(merInfo.firstElementChild.nextElementSibling.firstElementChild.textContent.match(/(\d+)/)[1]);
			maxTr = maxM * maxC;
			if( maxC != RB.village_Var[0] ) {
				RB.village_Var[0] = maxC;
				saveVCookie( 'VV', RB.village_Var );
			}
			return false;
		} else return true;
	}

	//if( checkTargetValidate() ) return;

	//var basee = $g('send_select');
	var basee = $g('sendResourcesForm');
	if( ! basee ) basee = $gc('sendResourcesForm')[0];
	var resSelector = $gc("resourceSelector")[0];
	var imgs = $gt("i",resSelector);
	if( ! basee ) return;

	var moC = null;
	var maxC = 0;
	var rxI = new Array();
	var mName = "";
	var maxM = 0;
	var maxTr = 0;
	var lastLinkR = [0,0,0,0];
	var checkRes = [];
	var resnames = ["lumber","clay","iron","crop"];

	//if( checkMerchants() ) return;
	checkMerchants();

	//fillXY();

	for (var i = 0; i < 4; i++) {
		rxI[i] = $gn(resnames[i],basee)[0];
		//rxI[i].addEventListener('keyup', mhRowUpdate, false);
		//rxI[i].addEventListener('change', mhRowUpdate, false);
		/*
		var iRow = basee.rows[i];
		$gt('a',iRow.cells[0])[0].addEventListener('click', mhRowUpdate, false);
		$g('addRessourcesLink'+i,iRow).addEventListener('click', mhRowUpdate, false);
		var ref = $a('-',[['href',jsVoid]]);
		ref.addEventListener('click', function(x) { return function() { mhRowLinkM(x); }}( i ), false);
		iRow.appendChild($c(ref,[['width','5%']]));
		var ref = $a('R',[['href',jsVoid]]);
		ref.addEventListener('click', function(x) { return function() { mhRowLinkR(x); }}( i ), false);
		iRow.appendChild($c(ref,[['width','5%']]));
		var ref = $a('+',[['href',jsVoid]]);
		ref.addEventListener('click', function(x) { return function() { mhRowLinkP(x); }}( i ), false);
		iRow.appendChild($c(ref,[['width','5%']]));
		*/
		checkRes[i] = $e('INPUT',[['type','checkbox'],['checked','checked'],['name',allIDs[18]+i]]);
		//iRow.appendChild($c(checkRes[i],[['width','5%']]));
		imgs[i].appendChild(checkRes[i]);
	};

	//var maxRM = $e('INPUT',[['type', 'TEXT'],['size',2],['value',maxM],['style','font-size:80%;']]);
	//var maxRC = $e('INPUT',[['type', 'TEXT'],['size',5],['value',maxTr],['style','font-size:80%;']]);
	//moC.appendChild($em('SPAN',[maxRM,' Σ=',maxRC],[['style','margin:0px 5px;font-size:12px;']]));


	var summary = $gc("summary",basee)[0];
	var nominator = $gc("nominator",summary)[0];
	var totalResources = $e('div',[['style','justify-self:start;']]);
	summary.appendChild(totalResources);
	summary.childNodes[1].style.justifySelf = "end";
	/*
	var newTR = $e('tr');
	var cM = $c('',[['colspan','3']]);
	newTR.appendChild(cM);
	if( basee.rows.length > 4 ) {
		for( i=basee.rows.length-1; i>3; i-- ) {
			var nc = basee.rows[i].cells.length;
			basee.rows[i].cells[nc-1].setAttribute('colspan',9-nc);
		}
		insertAfter(newTR,basee.rows[3]);
	} else basee.appendChild(newTR);
	*/
	mhRowUpdate();

	//var ref = $a('(M)',[['href',jsVoid]]);
	//ref.addEventListener('click', mhRowLinkMPlus, false);
	//newTR.appendChild($c(ref));
	//var ref = $a('-',[['href',jsVoid]]);
	//ref.addEventListener('click', mhRowsLinkM, false);
	//newTR.appendChild($c(ref,[['width','5%']]));
	var memL = $a('M',[['href',jsVoid],['style','font-size:15px;']]);
	memL.addEventListener('click', mhRowLinkMem, false);
	//var ref = $a('+',[['href',jsVoid]]);
	//ref.addEventListener('click', mhRowsLinkP, false);
	//newTR.appendChild($c(ref,[['width','5%']]));
	var refEq = $a('=',[['href',jsVoid],['style','font-size:15px;']]);
	refEq.addEventListener('click', mhRowsLinkEq, false);
	var refP = $a('%',[['href',jsVoid],['style','font-size:15px;']]);
	refP.addEventListener('click', mhRowsLinkPP, false);
	var refCl = $a('C',[['href',jsVoid],['style','font-size:15px;']]);
	refCl.addEventListener('click', mhRowsLinkCl, false);
	var newAllRes = $e('i', [['class','resources_medium']]);
	var resSelector = $gc("resourceSelector",basee)[0];
	var pButt = $gc("buttonFramed plus rectangle",basee)[0].cloneNode(true);
	pButt.addEventListener('click', mhRowsLinkP, false);
	var mButt = $gc("buttonFramed minus rectangle",basee)[0].cloneNode(true);
	mButt.addEventListener('click', mhRowsLinkM, false);
	mButt.removeAttribute('disabled');
	var newDiv = $e('div',[['style','display:flex;justify-content:space-between;align-items:center;']]);
	newDiv.appendChild(mButt);
	newDiv.appendChild(memL);
	newDiv.appendChild(refEq);
	newDiv.appendChild(refP);
	newDiv.appendChild(refCl);
	newDiv.appendChild(pButt);
	resSelector.appendChild(newAllRes);
	resSelector.appendChild(newDiv);

	//if( /&r\d=/.test(crtPath) )
	//	for( i=1; i<5; i++ ) try{ rxI[i].value = crtPath.match(new RegExp('&r'+i+'=(\\d+)'))[1]; } catch(e){};

	addButtonsEvent();
	
	var target = $gc('merchantsInformation')[0];
	var MutationObserver = window.MutationObserver;
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'childList') {
				checkMerchants();
			}
		});
	});
	observer.observe(target, { childList: true, subtree: true });

	var observer1 = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'characterData') {
				mhRowUpdate();
			}
		});
	});
	observer1.observe(nominator, { childList: true, subtree: true, characterData: true });
}

// 'Repeat' offer possition
function marketReSel( x ) {
	var selTable = $g('sell_overview');
	var strow = selTable.tBodies[0].rows[x[0]];

	var offer = strow.cells[1];
	var wanted = strow.cells[3];
	var dur = toNumber( strow.cells[strow.cells.length-2].innerHTML );

	offer.value = parseInt( $gc('value',offer)[0].textContent );
	offer.type = $gt('i',offer)[0].getAttribute('class').substring(1);
	wanted.value = parseInt( $gc('value',wanted)[0].textContent );
	wanted.type = $gt('i',wanted)[0].getAttribute('class').substring(1);

	$xf('.//select[@name="rid1"]','f',x[1]).value = offer.type;
	$xf('.//input[@name="m1"]','f',x[1]).value = offer.value;

	$xf('.//select[@name="rid2"]','f',x[1]).value = wanted.type;
	$xf('.//input[@name="m2"]','f',x[1]).value = wanted.value;

	if( isFinite(dur) ) {
		$xf('.//input[@name="d1"]','f',x[1]).setAttribute('checked','checked');
		$xf('.//input[@name="d2"]','f',x[1]).value = dur;
	} else {
		$xf('.//input[@name="d1"]','f',x[1]).removeAttribute('checked');
	}
}

// automatically set min resourse as wanted & max resourse as offer
// add 'Repeat' key
function marketOffer() {
	function merUpd () {
		var aR = parseInt(m1.value);
		m3.innerHTML = isNaN(aR) ? '': '( '+RB.dictionary[2]+' '+ Math.ceil(aR/RB.village_Var[0]) + (aR % RB.village_Var[0] != 0 ? ' : -' + (RB.village_Var[0] - aR % RB.village_Var[0]):'') + ' )';
		var aR2 = parseInt(m2.value);
		if( ! isNaN(aR) && ! isNaN(aR2) && aR > 0 ) {
			var rt = Math.round(aR2/aR*100)/100;
			var rtColor = rt == 1 ? 'black': rt < 1 ? 'red' : 'green';
			m3.appendChild($ee('SPAN',rt,[['style','font-weight:bold;color:'+rtColor+';padding:0px 10px;']]));
		}
	}
	function mofLinkM () {
		var aR = parseInt(m1.value);
		m1.value = isNaN(aR) ? '': aR <= RB.village_Var[0] ? '': aR - RB.village_Var[0];
		merUpd();
	}
	function mofLinkP () {
		var aR = parseInt(m1.value);
		m1.value = isNaN(aR) ? RB.village_Var[0] : aR + RB.village_Var[0];
		merUpd();
	}

	var selTable = $xf('.//table[@id="sell"]','l',cont);
	switch(selTable.snapshotLength) {
		case 0: return;
		case 1: selTable = selTable.snapshotItem(0); break
		default: selTable = $xf('.//form[contains(@style,"inline")]//table[@id="sell"]','f',cont);
	}
	var maxR = 0;
	var minR = 0;
	for( var i = 1; i < 4; i++ ) {
		if( resNow[i] > resNow[maxR] ) maxR = i;
		if( resNow[i] < resNow[minR] ) minR = i;
	}
	$xf('.//select[@name="rid1"]','f',selTable).value = maxR + 1;
	$xf('.//select[@name="rid2"]','f',selTable).value = minR + 1;
	$xf('.//input[@name="d2"]','f',selTable).type = "number";
	$xf('.//input[@name="d2"]','f',selTable).style.width = "30px";

	$at(selTable.rows[0].cells[2],[['style','width:auto;']]);
	$at(selTable.rows[1].cells[2],[['style','width:auto;']]);

	var refP = $a('+',[['href',jsVoid]]);
	refP.addEventListener('click', mofLinkP, false);
	selTable.rows[0].insertBefore($c(refP),selTable.rows[0].cells[3]);
	var refM = $a('-',[['href',jsVoid]]);
	refM.addEventListener('click', mofLinkM, false);
	selTable.rows[1].insertBefore($c(refM),selTable.rows[1].cells[3]);

	var m1 = $xf('.//input[@name="m1"]','f',selTable); // cell for offering
	m1.addEventListener('keyup', merUpd, false);
	m1.addEventListener('change', merUpd, false);

	var m2 = $xf('.//input[@name="m2"]','f',selTable); // cell for searching
	m2.addEventListener('keyup', merUpd, false);
	m2.addEventListener('change', merUpd, false);

	var m3 = $e('SPAN',[['style','margin: 0px 10px;']]);
	selTable.parentNode.appendChild(m3);

	var reSelTable = $g('sell_overview');
	if ( ! reSelTable ) return;
	// add additional field
	var strows = reSelTable.tHead.rows;
	strows[0].appendChild($c('&nbsp;',[['style','width:5%;']]));
	// fill rows
	var strows = reSelTable.tBodies[0].rows;
	for (var mr = 0; mr < strows.length; mr++ )
	{
		var newTD = $c($a('R',[['href',jsVoid]]));
		newTD.addEventListener('click', function(x) { return function() { marketReSel(x); }}( [mr,selTable] ), false);
		strows[mr].appendChild(newTD);
	}
}

function marketTradeRoutes() {
	function RemoveTradeRoutesBtn () {
		if (routesTable.tBodies[0].rows.length < 2 ) return;
		var newR = $em('TR',[$c(''),$c(''),$c(''),$c(''),$c(''),$c(disableInp)]);
		routesTable.tBodies[0].appendChild(newR);
	}
	var routesTable = $g("trading_routes",cont);
	if (routesTable) RemoveTradeRoutesBtn();
	var routesDiv = $g("tradeRoutes",cont);
	if ( !routesDiv ) { return; }
	var buttons = $gt('button', routesDiv);
	for (var i = 0; i < buttons.length; i++ ) { 
		buttons[i].addEventListener('click', function(x) { setTimeout(tradeRoutes,500); }, 0);
	}
	function tradeRoutes () {
		var routesForm = $g("tradeRouteEditCreate",cont);
		if ( !routesForm ) { return; }
		function merUpd () {
			var aR = 0;
			for (var i = 1; i < 5; i++ ) { var val = $gn("r"+i,routesForm)[0].value; aR += isNumeric(val) ? parseInt(val) : 0; }
			m3.textContent = '( '+RB.dictionary[2]+' '+ Math.ceil(aR/RB.village_Var[0]) + (aR % RB.village_Var[0] != 0 ? ' : -' + (RB.village_Var[0] - aR % RB.village_Var[0]):'') + ' )';
		}
		function mofLinkU () {
			var inp = this.parentNode.previousSibling;
			var aR = parseInt(inp.value);
			if ( this.id == "rbplus" ) {
				inp.value = isNaN(aR) ? RB.village_Var[0] : aR + ( aR % RB.village_Var[0] != 0 ? RB.village_Var[0] - aR % RB.village_Var[0] : RB.village_Var[0] );
			} else {
				inp.value = isNaN(aR) ? 0 : aR <= RB.village_Var[0] ? 0 : aR - ( aR % RB.village_Var[0] != 0 ? aR % RB.village_Var[0] : RB.village_Var[0] );
			}
			var changeEvent = new Event("change", {"bubbles":true, "cancelable":false});
			inp.dispatchEvent(changeEvent);
			merUpd();
		}
		function mhRowLinkMem () {
			loadVCookie('vPPH', 'village_PPH', RB.wantsMem[4]);
			if( RB.wantsMem[4] == 0 ) return;
			var inp = $gt('input',this.parentNode.previousElementSibling);
			for( var i = 0; i < 4; i++ ) {
				var wantRes = parseInt(RB.wantsMem[i]);
				if( wantRes < 0 ) wantRes = 0;
				inp[i].value = wantRes;
			}
			merUpd();
		}
		for (var i = 1; i < 5; i++ ) { 
			var inp = $gn("r"+i,routesForm)[0];
			inp.addEventListener('input', merUpd, false); 
			var divC = $e('DIV',[['style','margin:2px auto;font-size:24px;pointer-events:auto;']]);
			var refM = $a(' - ',[["id","rbmin"],['href',jsVoid]]);
			refM.addEventListener('click', mofLinkU, false);
			var refP = $a(' + ',[["id","rbplus"],['href',jsVoid]]);
			refP.addEventListener('click', mofLinkU, false);
			divC.appendChild(refP);
			divC.appendChild(refM);
			inp.parentNode.insertBefore(divC,inp.nextSibling);
		}
		//var divTC = $e('DIV',[['style','width: 50px;margin: 0 auto 15px;']]);
		//var ref = $a(' M ',[["id","memory"],['href',jsVoid]]);
		//ref.addEventListener('click', mhRowLinkMem, false);
		//divTC.appendChild(ref);
		//routesForm.insertBefore(divTC, routesForm.children[2]);
		var m3 = $e('DIV',[['style','margin:8px 0px 5px;']]);
		$ib(m3, $gc("resourceError",routesForm)[0]);
	}
}

// calculate incomming resourses
var mSInit = true;
function marketSumm () {
	marketSummReal();
	mSInit = false;
	var merchantsOnTheWay = $g('marketplaceSendResources');
	if ( !merchantsOnTheWay ) return;
	var merchantInOut = $gc('deliveriesOverview', merchantsOnTheWay);
	if (merchantInOut.length == 0) return;
	var MutationObserver = window.MutationObserver;
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.removedNodes.length > 0) {
				//setTimeout(marketSummReal, 200);
			}
		});
	});
	//observer.observe(merchantInOut[0], {childList: true});
}
function marketSummReal () {
	if( RB.Setup[10] == 0 ) return;
	var merchantsOnTheWay = $g('marketplaceSendResources');
	if (!merchantsOnTheWay) return;
	var merchantInOut = $gc('group expanded', merchantsOnTheWay);
	if (merchantInOut.length == 0) return;
	if( ! mSInit ) {
		initRes = true; getResources(); progressbar_ReInit();
	}
	addSpeedAndRTSend(merchantsOnTheWay, true);
	if (merchantInOut.length > 1) {
		var ownMerchants = $gc('group expanded', merchantsOnTheWay)[1];
		var aTo = $gc('delivery',ownMerchants);
		var outgoingResArr = [];
		for (i = 0; i < aTo.length; i++) {
			var outgoingRes = $gc('value',aTo[i]);
			for( var j = 0; j < 4; j++ ) { outgoingResArr[j] = outgoingRes[j].textContent; }
			showMer(aTo[i], outgoingResArr);
		}
	}
	var incomingMerchants = merchantInOut[0];
	//var aT = $gc('traders',incomingMerchants[0]);
	var aT = $gc('delivery',incomingMerchants);
	if( aT.length == 0 ) return;
	var showAll = $gc('showAll',merchantsOnTheWay);
	if ( showAll.length>0 ) {
		for (i = 0; i < showAll.length; i++) {
			showAll[i].addEventListener('click', function() { setTimeout(marketSummReal,500); }, false);
		}
	}
	/*
	if( $gc(allIDs[29],aT[0]).length > 0 ) return;
	var cH4 = $gt('H4');
	if( cH4 ) var merchB = cH4.length;
	var i = cH4[0].innerHTML.onlyText().trim();
	if( merchInWork != 0 && merchB == 1 ) {
	} else {
		if( mSInit && RB.dictionary[23] != i ) {
			RB.dictionary[23] = i;
			saveCookie( 'Dict', 'dictionary' );
		}
	}
	*/
// add 2x 1x tables
	if (RB.Setup[10] < 3 && RB.Setup[33] > 0 && 0) {
		var extRT = new Array();
		for (i = 0; i < aT.length; i++) {
			// get count of retry
			var multFL = $gc('repeat',aT[i]);
			if( multFL.length > 0 ) {
				// get time to go
				var timeToGo = toSeconds(aT[i].rows[1].cells[1].innerHTML);
				var tdist = calcDistance(village_aid,getVid($gt('A',aT[i].rows[0].cells[1])[0].getAttribute('href')));
				var htR = getTTime( tdist, MTime[parseInt(RB.Setup[2])]*sM, 0, 0 );
				var cnt = parseInt(multFL[0].innerHTML.match(/\d/)[0]);
				for( var nc=cnt-1; nc>0; nc-- ) {
					var tmpNode = aT[i].cloneNode(true);
					$gc('repeat',tmpNode)[0].textContent=nc+'x';
					var newT = htR * (cnt-nc)*2 + timeToGo;
					$gc('at',tmpNode)[0].textContent = $gc('at',tmpNode)[0].innerHTML.replace(/\d+:\d+/,formatTime(absTime(newT),5));
					var j=timerB.length;
					timerB[j] = new Object();
					timerB[j].time = newT;
					timerB[j].obj = $gt('span',$gc('in',tmpNode)[0])[0];
					timerB[j].obj.removeAttribute("class");
					timerB[j].obj.removeAttribute('id');
					timerB[j].obj.textContent = formatTime(newT,0);
					tmpNode.rows[1].cells[1].setAttribute('style','background-color:#F8FFEE;');
					extRT.push([newT,tmpNode]);
				}
			}
		}
		if( extRT.length > 0 ) {
			lastTimerB = timerB.length;
			extRT.sort(function(a,b){return a[0]-b[0];});
			for (var i = 0; i < aT.length; i++) {
				// get time to go
				var timeToGo = toSeconds(aT[i].rows[1].cells[1].innerHTML);
				if( timeToGo > extRT[0][0] ) {
					aT[i].parentNode.insertBefore(extRT[0][1],aT[i]);
					extRT.shift();
					if( extRT.length == 0 ) { i++; break; }
				}
			}
			var nc = aT[--i].nextElementSibling;
			for (i = 0; i < extRT.length; i++) {
				if( nc )
					nc.parentNode.insertBefore(extRT[i][1],nc);
				else
					aT[i].parentNode.appendChild(extRT[i][1]);
			}
		}
	}
	resourceCalculatorInit();
	var incomingResArr = [];
	for (i = 0; i < aT.length; i++) {
		// get time to go
		//var timeToGo = toSeconds(aT[i].rows[1].cells[1].innerHTML);
		var timeToGo = parseInt($gc('timer',aT[i])[0].getAttribute("value"));
		// get incoming resources
		//var incomingRes = aT[i].rows[2].cells[1].innerHTML.match( />\s*?\d+.?/g );
		var incomingRes = $gc('value',aT[i]);
		for( var j = 0; j < 4; j++ ) { incomingResArr[j] = incomingRes[j].textContent; }
		resourceCalculator( aT[i], timeToGo, incomingResArr, 0 );
	}
	if( RB.Setup[10] > 1 ) resourceCalculatorSumm(incomingMerchants, timeToGo);
	if( RB.Setup[10] > 2 ) redLinesSumm(incomingMerchants);
}

function showMer (tObj, incomingRes) {
	var rSumm = 0;
	for( var j = 0; j < 4; j++ ) {
		incomingRes[j] = parseInt(toNumber(incomingRes[j]));
		rSumm += incomingRes[j];
	}
	var newDIV = $ee('DIV',$ee('span',RB.dictionary[2]+': '+Math.ceil(rSumm/RB.village_Var[0])+'x',[['style','justify-self:end;font-weight:700;']]),[['class',allIDs[20]],['style','display: grid; grid-template-columns: auto 25px; align-items: end; gap: 0 3px; margin-bottom: 5px;']]);
	newDIV.appendChild($e('i',[['class','merchantCap_small']]));
	tObj.parentNode.appendChild(newDIV);
}

var incomeToGo = [];
var summIncomingRes = [];
var serverTime = 0;
var lastTime = 0;
var rpCount = 0;
var redLines = [];
var redLineFL = true;
var timeToZero = 0;

function resourceCalculatorInit () {
	incomeToGo = resNow.slice();
	serverTime = getServerTime();
	lastTime = 0;
	summIncomingRes = [0,0,0,0];
	rpCount = 0;
	redLines.length = 0;
	redLineFL = true;
	timeToZero = 0;

	var existT = $gc(allIDs[13],cont);
	for( var i = 0; i < existT.length; i++ ) cont.removeChild(existT[i].parentNode);
}

function resourceCalculator ( tObj, timeToGo, incomingRes, tType ) { // tType 0-market 1-RP
	var textIncome = '';
	var redLine = '';
	var redTime = 0;
	var rLl = redLines.length-1;
	var retFL = false;
	var incomeToGoSumm = 0;
	while( /\/|x/.test(incomingRes[0]) ) incomingRes.shift();
	for( var j = 0; j < 4; j++ ) {
		incomingRes[j] = parseInt(toNumber(incomingRes[j]));
		var extraRes = 0;
		var mColor = 'black';
		summIncomingRes[j] += incomingRes[j];
		incomeToGo[j] = Math.round(incomepersecond[j] * (timeToGo - lastTime) + incomeToGo[j]);
		if( incomeToGo[j] < 0 ) {
			redTime = serverTime + timeToGo - Math.floor(incomeToGo[j]/incomepersecond[j]);
			redLine += '<i class=r'+(j+1)+'></i><span style="margin-'+docDir[1]+': auto;">' + formatTime(redTime,1) + '</span>';
			extraRes = incomeToGo[j];
			mColor = 'red';
			incomeToGo[j] = 0;
		}
		incomeToGo[j] += incomingRes[j];
		if( incomeToGo[j] > fullRes[j] ) {
			extraRes = incomeToGo[j] - fullRes[j];
			incomeToGo[j] = fullRes[j];
			mColor = 'red';
		}
		if( tType == 0 ) {
			textIncome += '<i class=r'+(j+1)+'></i>' + ' <span style="margin-'+docDir[1]+': auto; color: ' + mColor + ';">' + incomeToGo[j];
		} else {
			textIncome += '&nbsp;' + '<i class=r'+(j+1)+' style="vertical-align: middle;"></i>' + ' <span style="color: ' + mColor + ';">' + incomeToGo[j];
		}
		if( extraRes != 0 ) textIncome += ' (' + (extraRes > 0 ? '+' + extraRes: extraRes) + ') ';
		textIncome += '</span>';
		incomeToGoSumm += incomeToGo[j];
	}
	if( incomepersecond[3] < 0 ) {
		var rLlFL = rLl;
		var ntf = fullRes[3]-incomeToGo[3];
		timeToZero = timeToGo - Math.round(incomeToGo[3]/incomepersecond[3]);
		if( RB.Setup[10] > 2 ) textIncome += ' <b>/ '+ ntf +'</b>';
		else if( timeToZero < 86400 )
			textIncome += '<i class="r5"></i><span style="margin-'+docDir[1]+': auto;">' + formatTime(serverTime + timeToZero,2) + '</span>';
		if( redTime > 0 ) {
			if( redLineFL ) {
				redLines[++rLl] = [extraRes,redTime,0, ntf];
				redLineFL = false;
			}
			if( incomingRes[3] == 0 ) {
				redLines[rLl][0] += extraRes;
			} else {
				redLines[rLl][2] = serverTime + timeToGo;
				redLineFL = true;
			}
		} else {
			if( extraRes > 0 )
				redLines[++rLl] = [extraRes, serverTime+timeToGo, serverTime+timeToGo, ntf];
		}
		if( RB.Setup[10] > 2 && rLlFL < rLl ) {
			tObj.setAttribute("id", allIDs[44]+rLl);
			retFL = true;
		}
	}
	if( tType == 0 ) {
		if( RB.Setup[11] > 0 ) textIncome += '<img class="npc" src="/img/x.gif"/> <span style="margin-'+docDir[1]+': auto;">&#931;('+incomeToGoSumm+')</span>';
		var newFText = retFL ? $em('A',[trImg("clock"),' ',formatTime(absTime(timeToGo,serverTime), 1)],[['href','#'+allIDs[31]]]):
		$em('SPAN',[trImg("clock"),' ',formatTime(absTime(timeToGo,serverTime), 1)],[['style','margin-'+docDir[0]+': auto;']]); // 2 ??
	} else {
		if( RB.Setup[11] > 0 ) textIncome += ' (<img class="npc" style="margin:0 3px" src="/img/x.gif">'+incomeToGoSumm+')';
		var newFText = retFL ? $em('A',[trImg("clock"),' ',formatTime(absTime(timeToGo,serverTime), 1)],[['href','#'+allIDs[31]]]):
		$em('SPAN',[trImg("clock"),' ',formatTime(absTime(timeToGo,serverTime), 1)]); // 2 ??
	}

	if( tType == 0 ) {
		var newdiv = $e('div',[['class','res'],['style','display: flex; align-items: center; gap: 3px; margin-bottom: 5px;']]);
		newdiv.innerHTML = textIncome;
		newdiv.appendChild(newFText);
		tObj.parentNode.appendChild( newdiv );
	} else {
		var existT = $gc(allIDs[20],tObj);
		if( existT.length > 0 ) tObj.removeChild(existT[0].parentNode);
		var newTR = $ee('TR',$c(newFText),[['class',allIDs[20]]]);
		newTR.appendChild($c(textIncome,[['colspan','11'],['style','text-align:'+docDir[0]+';']]));
		tObj.appendChild($ee('TBODY',newTR,[['class','infos']]));
	}
	lastTime = timeToGo;

	if( tType == 0 ) {
		if( redLine.length > 0 ) tObj.parentNode.insertBefore($ee('table',$ee('tr',$c(redLine)),[['class',allIDs[13]]]),tObj);
	} else {
		if( redLine.length > 0 ) tObj.parentNode.insertBefore($ee('table',$ee('tr',$c(redLine)),[['class',allIDs[13]]]),tObj);
	}

	rpCount++;
}

function resourceCalculatorSumm ( tObj, timeToGo ) {
	if( rpCount == 0 ) return;

	function linkMMem () {
		for( var j = 0; j < 4; j++ ) {
			RB.wantsMem[j] -= summIncomingRes[j];
			if( RB.wantsMem[j] < 0 ) RB.wantsMem[j] = 0;
		}
		saveCookie('Mem', 'wantsMem');
		alert( "Corrected to: "+ RB.wantsMem[0] +" | "+ RB.wantsMem[1] +" | "+ RB.wantsMem[2] +" | "+ RB.wantsMem[3] );
	}

	var rSumm = 0;
	var newR1 = $ee('TR',$c(trImg('clock')));
	var newR2 = $ee('TR',$c(formatTime(serverTime + timeToGo, 1)));
	var newR3 = $ee('TR',$c('&nbsp;'));

	var t = timerB.length;
	for( var j = 0; j < 4; j++ ) {
		rSumm += summIncomingRes[j];
		newR1.appendChild($c($e('i',[['class','r'+(j+1)]])));
		newR2.appendChild($c(summIncomingRes[j]));
		timerB[t] = new Object();
		timerB[t].time = incomepersecond[j] > 0 ? Math.round((fullRes[j]-incomeToGo[j]) / incomepersecond[j])+lastTime : Math.round(incomeToGo[j] / incomepersecond[j])-lastTime;
		timerB[t].obj = $eT('TD', timerB[t].time, 0);
		newR3.appendChild(timerB[t++].obj);
	}
	lastTimerB = timerB.length;

	var existT = $g(allIDs[30]);
	if( existT ) existT.parentNode.removeChild(existT);

	newR1.appendChild($c('&#931;('+rpCount+')'));
	newR2.appendChild($c(rSumm));
	var MM = $a('(M-)',[['href',jsVoid]]);
	MM.addEventListener('click', linkMMem, false);
	newR3.appendChild($c(MM));
	var newT = $ee('TABLE',newR1,[['class',allIDs[7]],['style','background-color:#F8FFEE;width:100%;margin-bottom:15px;'],['id',allIDs[30]]]);
	newT.appendChild(newR2);
	newT.appendChild(newR3);

	tObj.parentNode.insertBefore(newT,tObj);
}

function redLinesSumm ( tObj ) {
	if( incomepersecond[3] >= 0 ) return;

	function td ( xx ) {
		return xx>86400?xx-86400:xx;
	}

	var existT = $g(allIDs[31]);
	if( existT ) existT.parentNode.removeChild(existT);

	var newR = $em('TR',[$c(gtext("hunger")),$c(gtext("duration")),$c(gtext("deficit")),$c(RB.dictionary[21])]);
	var newT = $ee('TABLE',newR,[['class',allIDs[7]],['style','background-color:#FFE8D8;width:100%;margin-bottom:15px;'],['id',allIDs[31]]]);

	for( var i=0; i<redLines.length; i++ ) {
		if( redLines[i][2] == 0 ) {
			newT.appendChild($em('TR',[$c($a(formatTime(td(redLines[i][1]),1),[['href','#'+allIDs[44]+i]])),$c('--:--'),$c('-'),$c(redLines[i][3])]));
		} else {
			var dur = redLines[i][2]-redLines[i][1];
			if( dur == 0 )
				newT.appendChild($em('TR',[$c($a(formatTime(td(redLines[i][1]),1),[['href','#'+allIDs[44]+i]])),$c('--:--'),$c('+'+redLines[i][0],[['style','color:red;background-color:white;']]),$c(redLines[i][3])]));
			else
				newT.appendChild($em('TR',[$c($a(formatTime(td(redLines[i][1]),1),[['href','#'+allIDs[44]+i]])),$c(formatTime(dur,0)),$c(redLines[i][0]),$c(redLines[i][3])]));
		}
	}
	if( redLineFL )
		newT.appendChild($em('TR',[$c(formatTime(absTime(timeToZero,serverTime),1)),$c('--:--'),$c('-'),$c('-')]));

	tObj.parentNode.insertBefore(newT,tObj);
}

/************************* cookie ****************************/

var cookieDelim = [
	[")\\.([-\\.\\d]+)",'.','/'],
	[")@_(.*?)@#_",'@_','@#_']];

function loadVCookie ( nameCoockie, contentCookie, vID, cType ) {
	var Rej;
	var cvID = vID || village_aid;
	var cvT = cType || 0;
	var RCookie = RB_getValue(GMcookieID + nameCoockie,'');
	if (nameCoockie == 'vPPH') {
		Rej = new RegExp("(^"+cvID+"|\\.\\/"+cvID + cookieDelim[cvT][0]);
	}
	else {
		Rej = new RegExp("(" + cvID + cookieDelim[cvT][0]);
	}
	var oneCookie = RCookie.match(Rej);
	if( cvT == 1 ) RB[contentCookie].length = 0;
	if( oneCookie != undefined ) {
		var cookieValue = oneCookie[2].split(cookieDelim[cvT][1]);
		var sI = cvT == 0 ? 0: 1;
		var contentLength = cvT == 0 ? RB[contentCookie].length: cookieValue[0].length == 0 ? 0: parseInt(cookieValue[0]);
		for( var j = 0; j < contentLength; j++ ) {
			RB[contentCookie][j] = cookieValue[j+sI] == undefined ? 0: cvT == 0 ? parseInt(cookieValue[j]): unesc(cookieValue[j+sI]);
		}
	} else for( var j = 0; j < RB[contentCookie].length; j++ ) RB[contentCookie][j] = 0;
}

function loadZVCookie ( nameCoockie, contentCookie, vID ) {
	var cvID = vID || village_aid;
	loadVCookie ( nameCoockie, contentCookie, vID, 1 );
	if( RB[contentCookie].length == 0 ) RB[contentCookie][0] = 0;
}

function saveVCookie ( nameCoockie, contentCookie, cType ) {
	var Rej;
	var newCookie = '';
	var cvT = cType || 0;
	var oldCookie = RB_getValue(GMcookieID + nameCoockie,'');
	for( var i = 0; i < villages_count; i++ ) {
		newCookie += villages_id[i] + cookieDelim[cvT][1];
		if( villages_id[i] == village_aid ) {
			if( cvT == 1 ) newCookie += contentCookie.length + cookieDelim[cvT][1];
			for( var j = 0; j < contentCookie.length; j++ ) {
				if( contentCookie[j] !== undefined ) newCookie += esc(contentCookie[j]) + cookieDelim[cvT][1];
			}
		} else {
			if (nameCoockie == 'vPPH') {
				Rej = new RegExp("(^"+villages_id[i]+"|\\.\\/" + villages_id[i] + cookieDelim[cvT][0]);
			}
			else {
				Rej = new RegExp("(" + villages_id[i] + cookieDelim[cvT][0]);
			}
			var oldOneCookie = oldCookie.match(Rej);
			if( oldOneCookie != undefined ) newCookie += oldOneCookie[2];
		}
		newCookie += cookieDelim[cvT][2];
	}
	RB_setValue(GMcookieID + nameCoockie, newCookie);
}

function saveCookie ( nameCoockie, contentCookie ) {
	var newCookie = '';
	for( var j = 0; j < RB[contentCookie].length; j++ ) newCookie += RB[contentCookie][j] + '@_';
	RB_setValue(GMcookieID + nameCoockie, newCookie);
}

function loadCookie ( nameCoockie, contentCookie ) {
	var RCookie = RB_getValue(GMcookieID + nameCoockie,'');
	if( RCookie != '' ) {
		var cookieValue = RCookie.split('@_');
		for( var j = 0; j < RB[contentCookie].length; j++ )
			if( cookieValue[j] !== undefined ) if( cookieValue[j].length > 0 ) RB[contentCookie][j] = cookieValue[j];
	}
}

function saveOVCookie ( nameCoockie, contentCookie ) {
	var newCookie = '';
	for( var i = 0; i < villages_id.length; i++ )
		if( contentCookie[villages_id[i]] !== undefined )
		if( contentCookie[villages_id[i]].length > 0 )
			newCookie += villages_id[i] + cookieDelim[1][1] + esc(contentCookie[villages_id[i]]) + cookieDelim[1][2];
	RB_setValue(GMcookieID + nameCoockie, newCookie);
}

function saveODCookie ( nameCoockie, contentCookie ) {
	var newCookie = '';
	for( var i = 0; i < linkVSwitch.length; i++ ) {
		var nd = parseInt(linkVSwitch[i].match(/newdid=(\d+)/)[1]);
		if( contentCookie[nd] !== undefined )
			newCookie += nd + cookieDelim[1][1] + contentCookie[nd] + cookieDelim[1][2];
	}
	RB_setValue(GMcookieID + nameCoockie, newCookie);
}

function loadOVCookie ( nameCoockie, contentCookie ) {
	var RCookie = RB_getValue(GMcookieID + nameCoockie,'');
	var oneCookie = [];
	var cCount = 0;
	var Rej = new RegExp("(\\d+" + cookieDelim[1][0], 'g');
	while ((oneCookie = Rej.exec(RCookie)) != null) { RB[contentCookie][oneCookie[1]] = unesc(oneCookie[2]); cCount++; }
	return cCount;
}

function loadAllCookie () {
	loadVCookie ( 'Dorf2', 'village_Dorf2' );
	loadVCookie ( 'VV', 'village_Var' );
	loadCookie ( 'OV', 'overview' );
	loadCookie ( 'Mem', 'wantsMem' );
	loadCookie ( 'DictTR', 'dictTR' );
	loadCookie ( 'AS', 'serversAN' );

	if( lMap != '' && lMap != RB.dictionary[15] ) { RB.dictionary[15] = lMap; saveCookie( 'Dict', 'dictionary' ); }
//	if( ! /^1\.6\./.test(RB.Setup[0]) ) RB.Setup = RB.dSetup.slice(); else RB.Setup[0] = version;
}

/************************* distance calculation ***************************/

var MTime = [16, 12, 24, 0, 0, 16, 20, 14];

function showAllTTime ( vType, tVil, arena, art, shoes, leftHand ) {
	var TTime = [];
	if (RB.Setup[47]==1) {
		TTime = [
		[19, [24,63]], // Theutates Thunder, Spotter
		[17, [23]], // Pathfinder
		[16, [4,25,54,64,75]], // Equites Legati, Druidrider, Sopdu Explorer, Steppe Rider, Elpida Rider
		[15, [55,65]], // Anhur Guard, Marksman
		[14, [5,66]], // Equites Imperatoris, Marauder
		[13, [26]], // Haeduan
		[10, [6,15,56]], // Equites Caesaris, Paladin, Resheph Chariot
		[9, [14,16,72,76]], // Scout, Teutonic Knight, Sentinel, Corinthian
		[8, [73]], // Shieldsman
		[7, [3,11,12,21,51,53]], // Imperian, Clubswinger, Spearman, Phalanx, Slave Militia, Khopesh Warrior
		[6, [1,13,22,52,61,62,71,74]], // Legionnaire, Axeman, Swordsman, Ash Warden, Mercenary, Bowman, Hoplite, Twinsteel
		[5, [2,10,20,29,30,60,69,70,80]], // Praetorian, Settler, Chieftain, Logades
		[4, [7,9,17,19,27,57,59,67,77,79]], // Battering Ram, Senator, Ram, Chief, Ram, Ram (Egyptians), Nomarch, Ram (Huns), Ram (Spartans), Ephor
		[3, [8,18,28,58,68,78]] // Fire Catapult, Catapult, Trebuchet, Stone Catapult, Ballista
		];
	} else {
		TTime = [
		[19, [24]], // Theutates Thunder
		[17, [23]], // Pathfinder
		[16, [4,25]], // Equites Legati, Druidrider
		[14, [5]], // Equites Imperatoris
		[13, [26]], // Haeduan
		[10, [6,15]], // Equites Caesaris, Paladin
		[9, [14,16]], // Scout, Teutonic Knight
		[7, [3,11,12,21]], // Imperian, Clubswinger, Spearman, Phalanx
		[6, [1,13,22]], // Legionnaire, Axeman, Swordsman
		[5, [2,10,20,29,30]], // Praetorian, Settler, Chieftain
		[4, [7,9,17,19,27]], // Battering Ram, Senator, Ram, Chief, Ram
		[3, [8,18,28]] // Fire Catapult, Catapult, Trebuchet
		];
	}

	function appendTTime ( htt ) {
		var htg = formatTime(htt, 0);
		newTR.appendChild($c(htg));
		return htt;
	}
	function appendTime () {
		htf = absTime( ht );
		timerP[t] = new Object();
		timerP[t].time = htf;
		timerP[t].obj = $c(formatTime(htf, 1));
		newTR.appendChild(timerP[t++].obj);
		newTABLE.appendChild(newTR);
	}

	var artefact = art || RB.Setup[3];
	var shK = shoes || 0;
	var lhK = leftHand || 0;
	var newTABLE = $e('TABLE',[['class',allIDs[7]]]);
	var serverTime = getServerTime();
	var tR = vType < 1 ? parseInt(RB.Setup[2]) + 1: 0; //troop race

	var t = lastTimerP[0];
	timerP.length = t;
	if( typeof(tVil) != 'object' ) {
		var distance = calcDistance(tVil, village_aid);
		var xy = id2xy(tVil);
		var nL = $a(printCoords(tVil),[['href','position_details.php?x='+xy[0]+'&y='+xy[1]],['style','color:#252525;']]);
		nL.appendChild($e('SPAN',[['class',allIDs[29]]]));
		var newTR = $ee('TR',$c(nL,[['style','font-weight:bold;']]));
	} else {
		var distance = calcDistance(tVil[0], tVil[1]);
		var newTR = $ee('TR',$c('----'));
	}
	newTR.appendChild($c(' &lt;-&gt; ' + parseFloat(distance.toFixed(2)),[['colspan',(tR > 0 ? 2: ((RB.Setup[47]==1) ? 7 : 4))]]));
	newTABLE.appendChild(newTR);

	if( distance > 0 ) {
		if( sK == 0 ) {
			sK = troopInfo(1,7) != 0 ? troopInfo(1,7)/6: 1;
		}
		if( vType < 2 ) {
			var newTR = $e('TR');
			var ht = appendTTime( getTTime( distance, MTime[parseInt(RB.Setup[2])]*sM, 0, 0) );
			var attr = vType < 1 ? undefined : [['colspan',(RB.Setup[47]==1) ? 6 : 3]];
			newTR.appendChild($c(trImg(allIDs[33],RB.dictionary[2]),attr));
			appendTime();
		}
		if( vType > -1 ) {
			var newTR = $e('TR');
			var ht = appendTTime( getTTime( distance, RB.dictFL[19], arena, parseInt(artefact), shK, lhK) );
			var attr = vType < 1 ? undefined : [['colspan',(RB.Setup[47]==1) ? 6 : 3]];
			newTR.appendChild($c(trImg('unit uhero'),attr));
			appendTime();
			for( var i = 0; i < TTime.length; i++ ) {
				var newTR = $e('TR');
				var ht = appendTTime( getTTime( distance, TTime[i][0]*sK, arena, parseInt(artefact), shK, lhK) );
				var j = 0;
				var fl = tR ? false: true;
				for( var k = 0; k < (RB.Setup[47]==1 ? 8 : 3); k++ ) {
					if (k==3 || k==4) continue;
					var fl2 = tR ? false: true;
					var newTD = $e('TD');
					while( TTime[i][1][j] < (11+10*k) ) {
						if( Math.ceil((TTime[i][1][j])/10) == tR ) { fl = true; fl2 = true; }
						newTD.appendChild(trImg('unit u' + TTime[i][1][j], RB.dictTR[TTime[i][1][j]]));
						j++;
					}
					if( fl2 ) newTR.appendChild(newTD);
				}
				if( fl ) {
					appendTime();
				}
			}
		}
	}
	lastTimerP[1] = t;
	return newTABLE;
}

function distanceTooltipGen(e) {
	makeTooltip(showAllTTime(0, getVid(this.getAttribute('href')), RB.village_Var[1]));
}
function distanceTooltipGen2(e) {
	makeTooltip(showAllTTime(1, getVid(this.getAttribute('href')), RB.village_Var[1]));
}
function distanceTooltip(target, tp) {
	if( ! /[&\?][zd]=\d+|[&\?]x=-?\d+&y=-?\d+/.test(target.getAttribute('href')) ) return;
	if( tp == 0 )
		target.addEventListener("mouseover", distanceTooltipGen, false);
	else
		target.addEventListener("mouseover", distanceTooltipGen2, false);
	target.addEventListener("mouseout", removeTooltip, false);
}

function addShowDistanceIn( ss, vt ) {
	var newP = $g(allIDs[0]);
	if( !(newP) ) newP = $e('DIV',[['style','float:'+docDir[1]+';'],['id',allIDs[0]]]);
	var clear = $e('DIV',[['style','clear:both;']]);
	ss.parentNode.insertBefore(newP, ss);
	ss.parentNode.appendChild(clear);
	$gn('x')[0].addEventListener('keyup', function() { showDistanceIn( vt ) }, false);
	$gn('y')[0].addEventListener('keyup', function() { showDistanceIn( vt ) }, false);
	lastTimerP[2] = lastTimerP[0];
	showDistanceIn( vt );
}

var distInVilage = new Object;
var distInVilageFL = true;
function showDistanceIn ( vt ) { // travel time
	var dd = $g(allIDs[0]);
	if( ! dd ) return;
	var dX = parseInt($gn('x')[0].value);
	var dY = parseInt($gn('y')[0].value);
	var ddd = dd.firstChild;
	if( ddd ) dd.removeChild(ddd);
	lastTimerP[0] = lastTimerP[2];
	var xy = $g(allIDs[29]);
	if( xy ) xy.parentNode.removeChild(xy);
	if( isNaN(dX) || isNaN(dY) ) return;
	xy = xy2id(dX, dY);
	dd.appendChild(showAllTTime(vt,xy,RB.village_Var[1]));
	lastTimerP[2] = lastTimerP[0];
	lastTimerP[0] = lastTimerP[1];
	RB_setValue(GMcookieID + 'next', xy);
	if( distInVilageFL ) {
		var vLinks = $xf(vLinksPat,'l');
		for ( var vn = 0; vn < vLinks.snapshotLength; vn++ )
			distInVilage[villages_id[vn]] = vLinks.snapshotItem(vn).innerHTML;
		distInVilageFL = false;
	}
	ddd = $gn('y')[0].parentNode.parentNode;
	if( typeof distInVilage[xy] != 'undefined' ) {
		ddd.appendChild($ee('SPAN',distInVilage[xy],[['style','margin:0px 5px;font-size:12px;'],['id',allIDs[29]]]));
	} else {
		var ht = getVTip(xy);
		if( ht != '' ) {
			ddd.appendChild($ee('SPAN',ht,[['style','color:'+vHColor+';margin:0px 5px;font-size:12px;'],['id',allIDs[29]]]));
		}
	}
}

/************************* other ****************************/

function incomeResourcesInRP () {
	all_moving = 0;
	incomeResourcesInRP34();
}

var all_moving = 0;
function incomeResourcesInRP34 () {
	var townTables = $xf('.//table[.//td[@class="role"]/a]','l',cont);
	resourceCalculatorInit();
	if( all_moving == townTables.snapshotLength ) return; else all_moving = townTables.snapshotLength;
	for ( var i=0 ; i < townTables.snapshotLength; i++ ){
		var ttable = townTables.snapshotItem(i);
		var vID = $xf('thead/tr/td[@class="role"]/a', 'f', ttable).getAttribute('href').match(/d=(\d+)/)[1];
		var mLinks = $xf('tbody/tr/td/div[@class="res"]', 'f', ttable);
		if( mLinks && RB.Setup[10] > 0 ) {
			var timeToGo = toSeconds($xf('tbody/tr/td/div/span[contains(@id, "timer") or contains(@class,"timer")]','f',ttable).innerHTML);
			var incomingRes = mLinks.innerHTML.match( />\s*?(\d+)/g );
			if( incomingRes ) resourceCalculator( ttable, timeToGo, incomingRes );
		}
	}
	if( RB.Setup[10] > 1 && rpCount > 0 ) resourceCalculatorSumm(townTables.snapshotItem(0), timeToGo);
	if( RB.Setup[10] > 2 && rpCount > 0 ) redLinesSumm(townTables.snapshotItem(0));
}

function addARLinks(myVid, aDirect) {
	var newLinks = $e('span');
	var armStyle = aDirect == 0 ? allIDs[34]: allIDs[35];
	var ref = $ee('a',trImg(armStyle),[['href','/build.php?gid=16&tt=2&targetMapId=' + myVid],['onclick','return false;']]);
	ref.addEventListener('click', function(x) { return function() { sendArmy(x); }}(myVid), false);
	newLinks.appendChild(ref);
	if( aDirect < 2 ) {
		var ref = $ee('a',trImg(allIDs[33]),[['href','/build.php?gid=17&z=' + myVid + '&t=5'],['onclick','return false;']]);
		ref.addEventListener('click', function(x) { return function() { sendResourses(x); }}(myVid), false);
		newLinks.appendChild(ref);
	}
	if (screen.width <= 1024) { newLinks.style.height = "24px"; }
	return newLinks;
}

function addDorf12Links(myVid) {
	var newLinks = $e('span');
	var dorf1 = $ee('a',$e('IMG',[['src',img_out],['style','padding:0px 2px;cursor:pointer;']]),[['href',fullName + 'dorf1.php' + myVid]]);
	var dorf2 = $ee('a',$e('IMG',[['src',img_in],['style','padding:0px 2px;cursor:pointer;']]),[['href',fullName + 'dorf2.php' + myVid]]);
	newLinks.appendChild(dorf1);
	newLinks.appendChild(dorf2);
	if (screen.width <= 1024) { newLinks.style.height = "26px"; }
	return newLinks;
}

function sendResTropAdd ( aLink, aType ) {
	if( RB.Setup[15] == 0 ) return;
	var vId = getVid(aLink.getAttribute('href'));
	if( vId == village_aid || vId == 0 ) return;
	insertAfter(addARLinks(vId, aType),aLink);
}

// begin Quick actions to my other villages

function vlist_addButtonsT4 () {
	var vlist = $g("sidebarBoxVillagelist");
	var villages = $gc("listEntry",vlist);
	if (villages.length > 0 ) {
		for ( var vn = 0; vn < villages.length; vn++ ) {
			var linkEl = $gt("a",villages[vn])[0];
			linkVSwitch[vn] = linkEl.getAttribute('href');
			var coords = $gc("coordinatesGrid",villages[vn])[0];
			var myVid = getVidFromCoords(coords.innerHTML);
			villages_id[vn] = myVid;

			if( linkEl.hasAttribute('class') && linkEl.getAttribute('class').match(/active/i) ) {
				village_aid = myVid; village_aNum = vn;
			}
			linkHint($gc('name',linkEl)[0], myVid);
			villages_count++;
			if( RB.Setup[21] != 2 && RB.Setup[15] > 0 ) {
				if( RB.Setup[39] != 0 ) {
					var f12Links = addDorf12Links(linkVSwitch[vn],0);
					f12Links.setAttribute('class',allIDs[49]);
					insertAfter(f12Links,$gc('name',linkEl)[0]);
				}
				var newAR = addARLinks(villages_id[vn],0);
				newAR.setAttribute('class',allIDs[48]);
				insertAfter(newAR,$gc('name',linkEl)[0]);
			}
		}
	} else {
		villages_count = 1;
		villages_id[0] = 0;
	}

	if( RB.Setup[21] > 0 ) {
		var vLink = [];
		var vilT = $e('TABLE',[['id','vlist'],['style','background-color:white']]);
		var vilB = $e('TBODY');
		if( RB.bodyH[1] == 1 ) $at(vilB,[['style','display:none']]);
		var hideP = imgHide(1);
		hideP.addEventListener('click', function (x) { return function() { bodyHide(x); }}([vilB,1,hideP]), false);
		vilT.appendChild($ee('THEAD',$em('TR',[$c(hideP),$c($gc('boxTitle',$g('sidebarBoxVillagelist'))[0].innerHTML.onlyText(),[['colspan',3],['style','font-weight:bold;']])])));
		for( var i=0; i<villages.length; i++) {
			vLink[i] = $a($gc("name",villages[i])[0].innerHTML,[['href',linkVSwitch[i]]]);
			var cl = villages_id[i]==village_aid?"dot hl":"dot";
			vilB.appendChild($em('TR',[$c('&#x25CF;',[['class',cl]]),$c($ee('DIV',vLink[i])),RB.Setup[38] != 0 ? $c($a(printCoords(villages_id[i]),[['href',linkVSwitch[i]]])) : '',$c(addDorf12Links(linkVSwitch[i],0),[['style','width:40px;']]),$c(addARLinks(villages_id[i],0))]));
		}
		vilT.appendChild(vilB);
		if( RB.Setup[21] == 1 ) makeFloatD(vilT,7);
		if( RB.Setup[21] == 2 ) {
			var xy = offsetPosition( $g("sidebarBoxVillagelist") );
			makeFloat(vilT,xy[0]+25,xy[1]+90);
		}
	}
}

// end Quick actions to my other villages

function calculationPPH () {
	var RCookie = RB_getValue(GMcookieID + 'vPPH','0.0.0.0.0./');
	var rows = RCookie.split('\.\/');
	for( var i=0; i < (rows.length-1); i++ ) {
		var cels = rows[i].split(".");
		for ( var j=1; j < 5; j++ ) {
			sumPPH[j-1] += isFinite(parseInt(cels[j])) ? parseInt(cels[j]) :0;
		}
	}
}

var lastColor = [4,4,4,4];

function newStyle(e, j, sp) {
	var color = ( j == 2 && sp ) ? "white" : "black";
	var addCss = "."+ allIDs[16] + e + " div {color: " + color + ";background-color:" + bgcolor[j] + ";float: right;width: 100%;height:20px;margin-top:0px; display:inline;}";
	lastColor[e] = j;
	return addCss;
}

function progressbar_updValues() {
	var ts = Math.round((Date.now() - RunTime[4])/1000);
	getResources();
	var addCss = '';
	for (var j = 0; j < 4; j++) {
		var spaceLeft = fullRes[j] - resNow[j];
		var percentUsed2 = resNow[j] / fullRes[j] * 100;
		var percentUsed = Math.round(percentUsed2);

		timerRB[j].pb.setAttribute("style", "width: " + Math.round(percentUsed2 * 2.1) + "px;");
		timerRB[j].pval.innerHTML = percentUsed + "%";
		if( Math.abs(timerRB[j].time) < ts ) timerRB[j].time = 0;
		if( incomepersecond[j] != 0 ) {
			if( timerRB[j].time != 0 ) {
				timerRB[j].time += incomepersecond[j] > 0 ? -ts: ts;
				timerRB[j].val.innerHTML = formatTime(timerRB[j].time, 0);
			}
		}

		var sp = incomepersecond[j] > 0 ? true:false;
		if( percentUsed < 60 ) sp = false;
		if( timerRB[j].time < parseFloat(RB.Setup[6])*3600 ) {
			if (lastColor[j] != 2) {
				addCss += newStyle(j, 2, sp);
			}
		} else if( timerRB[j].time < parseFloat(RB.Setup[5])*3600 ) {
			if (lastColor[j] != 1) {
				addCss += newStyle(j, 1, sp);
			}
		} else {
			if( lastColor[j] != 0 ) {
				addCss += newStyle(j, 0, sp);
			}
		}


//Start kram89 code heavily modified Serj_LV :)
if( RB.bodyH[0] == 1 ) {
	if( timerN.length < 4 ){
		var resource = Math.floor(incomepersecond[j]*3600);
		timerN[j] = new Object();
		var resoColor = resource < 0 ? 'red':'black';
		timerN[j].resotime = timerRB[j].val.cloneNode(true);
		timerN[j].perreso = $e('span');
		timerN[j].divme1 = $ee('div',$em('span',[timerN[j].resotime,' ',timerN[j].perreso],[['style',"white-space:nowrap;"]]),
			[['style','position:absolute;top:33px;left:'+rect[j]+'px;text-align:center;width:86px;background-color:#fef0ce;border-radius:5px;']]);
		$g('stockBar').appendChild(timerN[j].divme1);
	}

	timerN[j].resotime.textContent = formatTime(timerRB[j].time,0);
	timerN[j].perreso.textContent = percentUsed+'%';

	function changeColor (obj,color) {
		if( timerN[j][obj+'_color'] != color ) {
			timerN[j][obj+'_color'] != color;
			timerN[j][obj].setAttribute('style','color:'+color+';');
		}
	}

	if( percentUsed < 50 ){
		changeColor('perreso','blue');
	} else if( parseInt(percentUsed) < 70 ){
		changeColor('perreso','#FF6600');
	} else if( parseInt(percentUsed) >= 70 ){
		changeColor('perreso','red');
	}

	if( timerRB[j].time < parseFloat(RB.Setup[6])*3600 ){
		changeColor('resotime','red');
	} else if( timerRB[j].time < parseFloat(RB.Setup[5])*3600 ){
		changeColor('resotime','#9900CC');
	} else {
		changeColor('resotime','green');
	}

} else if( timerN.length != 0 ) {
	$g('stockBar').removeChild(timerN[j].divme1);
	if( j == 3 ) timerN.length = 0;
}
//end code


	}
	if( addCss != '' ) RB_addStyle(addCss);
	for( var i = 0; i < timerP.length; i++ ) {
		timerP[i].time += ts;
		timerP[i].obj.textContent = formatTime(timerP[i].time, 1);
	}
	for( var i = 0; i < timerB.length; i++ ) {
		if( Math.abs(timerB[i].time) < ts ) timerB[i].time = 0;
		if( timerB[i].time != 0 ) {
			timerB[i].time += timerB[i].time > 0 ? -ts : ts;
			timerB[i].obj.textContent = formatTime(timerB[i].time, (typeof timerB[i].ft == 'undefined')? 0: timerB[i].ft);
		}
	}
	for( var i = 0; i < timerB3.length; i++ ) {
		if( Math.abs(timerB3[i].time) < ts )
			timerB3[i].time = 0;
		else
			timerB3[i].time -= ts;
		if( timerB3[i].time >= 0 ) {
			timerB3[i].obj.textContent = formatTime(timerB3[i].time, 3);
			if( timerB3[i].time == 0 ) {
				timerB3[i].obj.style.color = 'red';
				timerB3[i].time--;
				show_alert();
			}
		}
	}
	for( var i = 0; i < timerOv.length; i++ ) {
		if( Math.abs(timerOv[i].time) < ts ) timerOv[i].time = -timerOv[i].dir;
		if( timerOv[i].time != 0 ) {
			timerOv[i].time += timerOv[i].dir*ts;
			timerOv[i].obj.textContent = formatTime(timerOv[i].time, 0);
		}
	}
	RunTime[4] = Date.now();
}

function progressbar_ReInit () {
	for (var j = 0; j < 4; j++)
		if( incomepersecond[j] != 0 ) {
			var spaceLeft = fullRes[j] - resNow[j];
			timerRB[j].time = incomepersecond[j] > 0 ? Math.round(spaceLeft / incomepersecond[j]) : Math.round(resNow[j] / incomepersecond[j]);
			var tTime = absTime(timerRB[j].time);
			var dstr = tTime > 86400 ? (new Date((Math.abs(timerRB[j].time)+getTimeOffset()*3600)*1e3+(Date.now()))).toDateString()+' ':'';
			timerRB[j].val.title = dstr + formatTime(tTime, 2);
		}
}

function progressbar_init() {
	calculationPPH();
	var mm = RB.Setup[22] > 0 ? normalProductionCalc( sumPPH ) : [0,0];
	var ssPPH = 0;

	var tblBody = $e("tbody");
	if( RB.bodyH[0] == 1 ) $at(tblBody,[['style','display:none']]);
	for (var j = 0; j < 4; j++) {
		// creates a table row
		var cellText = $e("div", [["class", allIDs[2]]]);

		timerRB[j] = new Object();
		timerRB[j].pb = $e('div', [['class', allIDs[16] + j]]);
		var fval = $e('DIV');
		fval.appendChild($e('i',[['class', 'r' + (j+1)],['style','margin:0 3px;margin-top:2px;vertical-align:text-bottom;'],['title',income[j]]]));
		timerRB[j].pval = $e('span',[['style','margin:0px 2px;line-height:20px;']]);
		fval.appendChild(timerRB[j].pval);

		if( incomepersecond[j] != 0 ) {
			var spaceLeft = fullRes[j] - resNow[j];
			timerRB[j].time = incomepersecond[j] > 0 ? Math.round(spaceLeft / incomepersecond[j]) : Math.round(resNow[j] / incomepersecond[j]);
			timerRB[j].val = $eT('span', timerRB[j].time, 0, [['style','margin:0px 2px;line-height:20px;']]);
		} else {
			timerRB[j].time = 0;
			timerRB[j].val = $ee('span', '--:--');
		}
		fval.appendChild(timerRB[j].val);

		timerRB[j].pb.appendChild(fval);
		cellText.appendChild(timerRB[j].pb);

		var row = $ee('TR', $c(cellText));

		ssPPH += sumPPH[j]; var sumAttr = [['class',allIDs[11]]];
		if( RB.Setup[22] > 0 ) {
			if( j == mm[0] ) sumAttr.push(['style','color:green;']);
			if( j == mm[1] ) sumAttr.push(['style','color:red;']);
		}
		row.appendChild($c(sumPPH[j],sumAttr));
		tblBody.appendChild(row);
	}

	var alink = $a('ResourceBar+',[['href', '#'],['onclick',jsNone],['title',gtext("overview")]]);
	alink.addEventListener('click', overviewAll, false);
	var alink2 = $a(' v' + version,[['style','font-size:9px;'],['target','_blank'],['title',gtext("svers")]]);
	alink2.addEventListener('click', displayWhatIsNew, false);

	var aImg = $e('IMG',[['src',img_pref],['title',gtext("settings")],['style','padding:0px 2px;cursor:pointer;vertical-align: middle;']]);
	aImg.addEventListener('click', rbSetup, false);

	var aImg2 = $e('IMG',[['src',img_notes],['title',gtext("notes")],['style','padding:0px 2px;cursor:pointer;vertical-align: middle;']]);
	aImg2.addEventListener('click', rbNotes, false);

    var alink3 = $a('[M+]', [['href', jsVoid],['style','font-weight:400;'],['title',gtext("res90")]]);
    alink3.addEventListener('click', saveSpaceLeftToMem, false);

	var hideP = imgHide(0);
	hideP.addEventListener('click', function (x) { return function() { bodyHide(x); }}([tblBody,0,hideP]), false);

	var cell = $em('TH',[hideP,alink,alink2,aImg2,aImg,alink3]);

	var pphSpan = $ee('SPAN','&#931;/h',[['title',ssPPH]]);
	pphSpan.addEventListener('click', function (x) { return function() { bodyHide(x); }}([tblBody,0]), false);
	var tblHead = $ee("thead",$em('TR',[cell,$c(pphSpan,[['class',allIDs[12]]])]));

	var tbl = $em('TABLE',[tblHead,tblBody],[['cellspacing', '1'],['cellpadding', '1'],['id', allIDs[1]]]);

	if( RB.Setup[4] == 0 ) {
		$g(pageElem[2]).appendChild($ee('P',tbl,[['style','pointer-events:auto;']]));
	} else {
		makeFloatD(tbl, 1);
	}

	progressbar_time = Date.now();
	RunTime[4] = progressbar_time;
	progressbar_updValues();
	progressbar_time = (Date.now()) - progressbar_time;
}

function saveSpaceLeftToMem () {
	if( closeWindowN(10) ) return;

	function resRecalc () {
		nK = parseInt(newPR.value).NaN0();
		for (var i = 0; i < 4; i++) {
			RB.wantsMem[i] = Math.round( fullRes[i]  * nK/100 - resNow[i] );
			if( RB.wantsMem[i] < 0 ) RB.wantsMem[i] = 0;
			ressA[i].innerHTML = RB.wantsMem[i];
		}
	}
	function svOK () {
		saveCookie('Mem', 'wantsMem');
		if( nK > 0 ) {
			RB.dictFL[21] = nK;
			saveCookie( 'DictFL', 'dictFL' );
		}
		closeWindowN(10);
	}

	var nK = RB.dictFL[21];
	if( nK < 1 ) nK = 90;
	var newT = $e('TABLE',[['class',allIDs[7]],['style','background-color:#FAFAFF;']]);
	var newPR = $e('INPUT',[['type', 'TEXT'],['size',2],['maxlength',2],['value',nK]]);
	newPR.addEventListener('keyup', resRecalc, false);
	var btnOK = $ee('BUTTON',gtext("ok"),[['class',allIDs[15]],['onclick',jsNone]]);
	btnOK.addEventListener('click', svOK, true);
	newT.appendChild($em('TR',[$em('TD',[newPR,'%']),$c(btnOK)]));
	var ressA = [];
	RB.wantsMem = [0,0,0,0,village_aid];
	for (var i = 0; i < 4; i++) {
		ressA[i] = $c(RB.wantsMem[i]);
		newT.appendChild($em('TR',[$c($e('i',[['class','r'+(i+1)]])),ressA[i]]));
	}
	resRecalc();
	var xy = offsetPosition(this.parentNode);
	windowID[10] = makeFloat(newT,xy[0]+120,xy[1]+25);
}

function distanceToMyVillages() {
	function updateDistTable () {
		pp.removeChild(attbl);
		lastTimerP[0] = lastTimerP[2];
		attbl = showAllTTime(1, curD, sel.value, sel3.value, shoesT[sel2.value], leftH[sel4.value]);
		lastTimerP[0] = lastTimerP[1];
		pp.appendChild(attbl);
	}

	var curD = getVid(crtPath);
	var shoesT = [0,0.25,0.5,0.75];
	var leftH = [0,1.15,1.20,1.25,0,1.30,1.40,1.50];

	var sel = $e('SELECT');
	for( var j = 0; j < 21; j++ ) newOption(sel, j, j);
	var al = RB.Setup[9] == 0 ? RB.village_Var[1] : parseInt(RB.Setup[9]) - 1;
	sel.selected = al; sel.value = al;
	attbl = showAllTTime(1, curD, al);
	lastTimerP[2] = lastTimerP[0];
	lastTimerP[0] = lastTimerP[1];

	var kirURL = $a('(kirilloid.ru)',[['href','http://travian.kirilloid.ru/distance.php#cc='+id2xy(village_aid).join()+','+id2xy(curD).join()+'&srv='+RB.Setup[45]+'.'+'4'+(RB.Setup[46]==1?31:4)],['target','_blank'],['style','font-size:10px;display:inline-block;']]);
	var sel2 = $e('SELECT');
	var sO2 = ['-','+25%','+50%','+75%'];
	for( var j = 0; j < sO2.length; j++ ) newOption(sel2, sO2[j], j);
	sel2.selected = 0; sel2.value = 0;
	var t4P = $em('SPAN',[' , ',trImg('itemCategory itemCategory_shoes'),' ',sel2]);

	var sel4 = $e('SELECT');
	var sO4 = ['-','+15%','+20%','+25%','--------','+30%','+40%','+50%'];
	for( var j = 0; j < sO4.length; j++ ) newOption(sel4, sO4[j], j);
	sel4.selected = 0; sel4.value = 0;
	var t4L = $em('SPAN',[' , ',trImg('itemCategory itemCategory_leftHand'),' ',sel4]);

	var sel3 = $e('SELECT');
	var sO3 = [gtext('none'),'x0.33','x0.5','x0.67','x1.5','x2','x3'];
	for( var j = 0; j < sO3.length; j++ ) newOption(sel3, sO3[j], j);
	sel3.selected = RB.Setup[3]; sel3.value = RB.Setup[3];
	var artSp = $ee('div',$em('div',[' , ',trImg('artefactIcon type4',gtext("speedart")),' ',sel3],[['class','artefacts'],['style','width:100%;padding:0px;']]),[['id','build'],['class','gid27'],['style','display:inline-block;']]);

	var pp = $em('P',[arena + ': ',sel,t4P,t4L,artSp,' ',kirURL, attbl],[['style','margin:20px 20px 0px;']]);
	cont.appendChild(pp);
	document.addEventListener("change", updateDistTable, false);

	var villages = $g('vlist');
	if ( ! villages ) return;
	villages = villages.tBodies[0].rows;
	for( var i = 0; i < villages_id.length; i++ ) {
		var distance = parseFloat(calcDistance( villages_id[i], curD ).toFixed(1));
		villages[i].cells[3].appendChild($t(" <-> " + distance));
	}
}

function distanceToTargetVillages() {
	var herofashion = false;
	var vtLink;
	var vtable = $g("villages");
	if ( ! vtable ) {
		herofashion = true;
		var target = $g('playerProfile');
		var MutationObserver = window.MutationObserver;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'childList') {
					vtable = $gc("villages");
					if ( vtable.length == 1 ) {
						vtable = vtable[0];
						fdistance();
						observer.disconnect();
					}
				}
			});
		});
		var config = { childList: true, subtree: true };
		observer.observe(target, config);
	} else fdistance();

	function fdistance() {
		var fl = false;
		// fill rows
		var vtrows = vtable.tBodies[0].rows;
		for (var mr = 0; mr < vtrows.length; mr++)
		{
			var vName = $gc('name',vtrows[mr]);
			if ( vName.length > 0 ) {
				vtLink = $gt('a',vName[0]);
			}
			if( vtLink.length > 0 ) {
				vtLink = vtLink[0];
				if (herofashion) {
					vtLink.parentNode.className = "";
					if (vtLink.nextElementSibling) vtLink.nextElementSibling.style.display = "block";
				}
				var vURL = vtLink.getAttribute("href");
				distanceTooltip(vtLink,0);
				sendResTropAdd(vtLink, 1);
				linkHint(vtLink);
				var Rej = /d=(\d+)/i;
				var vID = Rej.exec(vURL)[1];
				var distance = parseFloat(calcDistance( vID, village_aid ).toFixed(1));
				vtrows[mr].appendChild($c(distance));
				fl = true;
			}
		}
		if( fl ) {
			// add additional field
			var vtrows = vtable.tHead.rows;
			vtrows[0].appendChild($c('&lt;-&gt;',[['style','width:10%;']]));
		}
	}
}

function fillXY ( nXY ) {
	if( /[&?]z=\d/.test(crtPath) ) return;
	var myVid = nXY || RB_getValue(GMcookieID + 'next', -1);
	if( myVid > 0 ) {
		var arXY = id2xy( myVid );
		if( $gn('x').length < 1 ) return;
		$gn('x')[0].value = arXY[0];
		$gn('y')[0].value = arXY[1];
		nextFL = false;
	}
}

function fillXYMarket ( nXY ) {
	//if( /[&?]z=\d/.test(crtPath) ) return;
	var myVid = nXY || RB_getValue(GMcookieID + 'next', -1);
	if( myVid > 0 ) {
		var arXY = id2xy( myVid );
		if( $gc('coordinateX')[0].length < 1 ) return;
		var coordX = $gt('input',$gc('coordinateX')[0])[0];
		var coordY = $gt('input',$gc('coordinateY')[0])[0];
		coordX.value = arXY[0];
		coordY.value = arXY[1];
		nextFL = false;
	}
}

function fillXYtoRP() {
	fillXY();
	var tt = $g('troops');
	if( tt ) {
		var ss = $g('ok');
		if( ss ) {
			//*Start detect Tribe
			var troopImg = $xf('.//img[contains(@class,"unit u")]','f',tt);
			if( ! troopImg ) return;
			race = Math.floor(parseInt(troopImg.getAttribute('class').match(/\d+/)[0])/10);
			if( race != RB.Setup[2] ) {
				RB.Setup[2] = race;
				saveCookie( 'RBSetup', 'Setup' );
			}
			//*end detect Tribe
			addShowDistanceIn( ss, 0 );
			ss.parentNode.addEventListener('keyup', a2bInfo, false);
			ss.parentNode.addEventListener('click', a2bInfo, false);
		}
	}
}

function sendArmy( myVid ) {
	if( $gc('a2b').length > 0 ) {
		fillXY( myVid );
		showDistanceIn( 0 );
	} else {
		if( myVid != village_aid ) RB_setValue(GMcookieID + 'next', myVid);
		document.location.href = '/build.php?gid=16&tt=2';
	}
	return false;
}

function sendResourses( myVid ) {
	if( $g('sendResourcesForm1') ) {
		fillXYMarket( myVid );
		showDistanceIn( -1 );
	} else {
		if( myVid != village_aid ) RB_setValue(GMcookieID + 'next', myVid);
		document.location.href='/build.php?gid=17&z=' + myVid + '&t=5';
	}
	return false;
}

// 0-market, 1-barracks, 2-stable, 3-workshop, 4-Tournament Square, 5-Great Barracks, 6-Great Stable, 7-Hospital, 8-Asclepeion, 9-Harbor
function parseDorf2 () {
	var base = $g('villageContent');
	if( !(base) ) return;
	var fl = false;
	var buildsID = ['g17','g19','g20','g21','g14','g29','g30','g46','g48','g49'];
	var buildsNum = [0,0,0,0,0,0,0,0,0,0];

	var allIMG = $gt('IMG',base);
	for( var t=0; t<allIMG.length; t++ ) {
		for( var i = 0; i < buildsID.length; i++ ) {
			var Rej = new RegExp(buildsID[i]);
			if( Rej.test(allIMG[t].getAttribute('class')) ) {
				buildsNum[i] = allIMG[t].previousElementSibling.getAttribute('class').match(/aid(\d+)/)[1];
			}
		}
	}

	for( var i = 0; i < buildsID.length; i++ ) {
		if( buildsNum[i] != RB.village_Dorf2[i] ) {
			RB.village_Dorf2[i] = buildsNum[i];
			fl = true;
		}
	}
	if( buildsNum[4] > 0 ) { // search&save Tournament Square
		var tur = $xf('.//img[contains(@class,"g14")]','f',base).previousElementSibling.firstChild.textContent;
		if( tur != RB.village_Var[1] ) {
			RB.village_Var[1] = tur;
			saveVCookie( 'VV', RB.village_Var );
		}
	} else if( RB.village_Var[1] > 0 ) {
		RB.village_Var[1] = 0;
		saveVCookie( 'VV', RB.village_Var );
	}
	var dictsFL = [['g17',7],['g19',8],['g20',9],['g21',10],['g16',6],['g14',3],['g29',24],['g30',25],['g46',26],['g48',27],['g49',28]];
	function getBuildingName () {
		for( var i = 0 ; i < dictsFL.length; i++ ) {
			if( RB.dictFL[dictsFL[i][1]] == 0 ) {
				var turF = $gc('building '+dictsFL[i][0],base);
				if( turF.length > 0 ) {			
					var turD = turF[0].parentNode.getAttribute('data-name');
					RB.dictionary[dictsFL[i][1]] = turD;
					saveCookie( 'Dict', 'dictionary' );
					RB.dictFL[dictsFL[i][1]] = 1;
					saveCookie( 'DictFL', 'dictFL' );
				}
			}
		}
	}
	if (document.readyState === "complete") {
		getBuildingName();
	} else {
		document.onreadystatechange = function () {
			if (document.readyState === "complete") {
				getBuildingName();
			}
		}
	}
	if( fl ) saveVCookie( 'Dorf2', RB.village_Dorf2 );
}

/************************* Setup ***************************/

function okTD( funcOk, funcCancel, sp ) {
	var newBTO = $ee('BUTTON',gtext("ok"),[['class',allIDs[15]],['onclick',jsNone]]);
	newBTO.addEventListener('click', funcOk, true);
	var newBTX = $ee('BUTTON',gtext("cancel"),[['class',allIDs[15]],['onclick',jsNone]]);
	newBTX.addEventListener('click', funcCancel, true);
	var at = [['style','text-align:right']];
	if( parseInt(sp) != NaN ) at.push(['colspan',sp]);
	return $em('TD',[newBTO,newBTX],at);
}

function gtext ( txt ) {
	var ntxt = typeof DICT['en'][txt] == 'undefined' ? 'Error!': DICT['en'][txt];
	if( typeof DICT[LC] == 'undefined' ) return ntxt;
	if( typeof DICT[LC][txt] != 'undefined' ) ntxt = DICT[LC][txt];
	else if( typeof DICT[LC]["fb"] != 'undefined' )
		if( typeof DICT[DICT[LC]["fb"]] != 'undefined' )
			if( typeof DICT[DICT[LC]["fb"]][txt] != 'undefined' ) ntxt = DICT[DICT[LC]["fb"]][txt];
	return ntxt;
}

RB.dSetup = [//	0	1	2	3	4	5	6	7	8	9
	/* 0 */	version,0,	7,	0,	1,	7,	1,	1,	3,	0,
	/* 1 */		2,	1,	2,	0,	1,	1,	2,	0,	1,	3,
	/* 2 */		1,	1,	1,	10,	80,	1,	1,	0,	0,	audiofile,
	/* 3 */		0,	15,	1,	1,	0,	0,	1,	1,	1,	0,
	/* 4 */		'',	'',	'',	'',	'',	0,	0,  0,  0,  1,
	/* 5 */		0,	0,	0,	0,	0,	0,	0,  0,  0,  0
			];
RB.Setup = RB.dSetup.slice();

function rbSetup () {
	var normProd = [gtext('incomreso')[0],gtext("normal")];
	for( i = 2; i < normalizeProductionCount+2; i++ ) {
		normProd[i] = RB.dictTR[i+(10*RB.Setup[2])-1];
	}
	for( i = 0; i < 5; i++ )
		if( RB.Setup[40+i].length<2 ) RB.Setup[40+i] = cnColors[i];

	// 0-type(Info,CheckBox,Text,SELect,SPan,Button), 1-setupNum, 2-text, 3-ext
	var aRBS = [
		['I', 0, gtext("info")],
			['SEL', 1, gtext("scrlang")+(LC != 'en' ? ' / Language':''), langs],
			['SEL', 2, gtext("yourrace"), gtext("racelist")],
			['T', 45, gtext("sspeed"), gtext("sspeedh")],
			['T', 48, gtext("smapsize"), gtext("smapsizeh")],
			['SEL', 47, gtext("EgyptiansAndHuns"), gtext("EgyptiansAndHunso"), gtext("EgyptiansAndHunsh")],
			['SEL', 46, gtext("servertype"), gtext("servertypeo"), gtext("servertypeh")],
			['SEL', 50, gtext("traveloveredge"), gtext("traveloveredgeo")],
			['SEL', 3, gtext("speedart"), [gtext('none'),'x0.33','x0.5','x0.67','x1.5','x2','x3']],
			['SEL', 9, arena, [gtext("auto"),0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]],
			['T', 24, gtext("cranny"), gtext("crannyh")],
		['I', 0, gtext("builtin")],
			['SEL', 22, gtext("normalize"), normProd, gtext("builtinh")],
			['CB', 25, gtext("banalyze")],
			['CB', 26, gtext("cropfind")],
			['SEL', 30, gtext("adetect"), gtext("adetecto"), gtext("adetecth")],
			['T', 31, gtext("adetectt"), gtext("adetectth")],
			['CB', 32, gtext("buildhint")],
			['CB', 37, gtext("bmove")],
		['I', 0, gtext("onallp")],
			['SEL',14, gtext("buildand"), gtext('buildands'), gtext("buildandh")],
			['CB',15, gtext("sendres")],
			['CB',18, gtext("sendmess")],
			['CB',39, gtext("dorf12links")],
			['SEL',19, gtext("analyzer"), analyzers],
			['B', 0, gtext("analyzer"), [gtext('settings'),analyzerSetup]],
			['SEL',16, gtext("bigicon"), gtext('addvtableo')],
			['SEL',21, gtext("addvtable"), gtext('addvtableo')],
			['CB',38, gtext("vtcoords")],
			['CB',17, gtext("opennote")],
			['SEL',35, gtext("notesize"), ['40x15','55x20','70x30','60x45','40x8','30x34']],
			['CB',34, gtext("openoview")],
		['I', 0, gtext("resbar")],
			['CB', 4, gtext("showres")],
			['T', 6, gtext("redbl")],
			['T', 5, gtext("yellowbl")],
		['I', 0, gtext("auctions")],
			['T', 23, gtext("bidinc"), gtext("bidinch")],
		['I', 0, gtext("marketpl")],
			['CB', 11, gtext("npcsum"), gtext("npcsumh")],
			['CB', 33, gtext("show3x"), gtext("show3xh")],
		['I', 0, gtext("rpandmp")],
			['SEL', 10, gtext("incomres"), gtext("incomreso")],
			['SEL', 20, gtext("troopsI"), gtext("troopsIo")],
			['SEL', 27, gtext("defRP"), [RB.dictionary[16],RB.dictionary[17],RB.dictionary[18]]],
		['I', 0, gtext("links")],
			['SEL',12, gtext("showls"), gtext("showlso")],
			['CB', 36, gtext("showAsSN")],
			['T', 'ln2', gtext("savedls")],
			['T', 'ln', gtext("savedls")+' (2)'],
			['T', 'ln3', gtext("savedls")+' (3)'],
		['I', 0, gtext("notifi"), gtext("notification")],
			['SEL',28, gtext("method"), [gtext('none'),'Alert pop-up','HTML5 Audio']],
			['T', 29, gtext("audiourl"), 'https://... .mp3 .ogg .wav'],
			['B', 0, gtext("audiotest"), ['test',testAudio]],
		['I', 0, gtext("colorCustomize"), gtext("colorHint")],
			['T', 40, gtext("color0")],
			['T', 41, gtext("color1")],
			['T', 42, gtext("color2")],
			['T', 43, gtext("color3")],
			['T', 44, gtext("color4")],
		['I', 0, gtext("savedd"), gtext("saveddh")],
			['B', 0, gtext("savedelall"), [gtext("del"),allStorageDelete]],
		['I', 0, '']
	];

	if( closeWindowN(0) ) return;

	function setupSave() {
		var aS = $gt("SELECT",$g(allIDs[6]));
		for (var i = 0; i < aS.length; i++) RB.Setup[parseInt(aS[i].name)] = aS[i].value;
		var aS = $gt("INPUT",$g(allIDs[6]));
		for (var i = 0; i < aS.length; i++) {
			crtValue = aS[i].value;
			if( aS[i].type == 'checkbox') crtValue = (aS[i].checked == true ? '1' : '0');
			if( isNaN(aS[i].name) )
				RB_setValue(GMcookieID + aS[i].name, crtValue);
			else
				RB.Setup[parseInt(aS[i].name)] = crtValue;
		}
		if(RB.Setup[29].length < 2) RB.Setup[29] = audiofile;
		saveCookie( 'RBSetup', 'Setup' );
		destroySetup();
		location.reload();
	}
	function destroySetup() {
		closeWindowN(0);
	}

	setupD = $e('TABLE',[['id',allIDs[6]]]);
	var newTR = $ee('TR',$c(gtext("svers")+': ' + version));//RB.Setup[0]));
	newTR.appendChild(okTD(setupSave,destroySetup));
	setupD.appendChild(newTR);

	for( var i = 0; i < aRBS.length; i++ ) {
		if( aRBS[i][0] == 'I' ) {
			var newTt = $ee('SPAN',aRBS[i][2],[['style','font-weight:bold;']]);
			if( typeof aRBS[i][3] == 'string' && aRBS[i][3].length > 1 ) {
				$at(newTt,[['title',aRBS[i][3]]]);
				newTt.appendChild(trImg(allIDs[47]));
			}
			var newTR = $ee('TR',$c(newTt,[['colspan','2'],['style','text-align:center']]));
		} else {
			var vN = isNaN(aRBS[i][1]) ? RB_getValue(GMcookieID + aRBS[i][1], "") : RB.Setup[aRBS[i][1]];
			var newTt = $ee('SPAN',aRBS[i][2]);
			var hn = aRBS[i][0] == 'SEL' ? 4: 3;
			if( typeof aRBS[i][hn] == 'string' && aRBS[i][hn].length > 1 ) {
				$at(newTt,[['title',aRBS[i][hn]]]);
				newTt.appendChild(trImg(allIDs[47]));
			}
			var newTR = $ee('TR',$c(newTt));
			switch( aRBS[i][0] ) {
				case 'CB': var newO = $e('INPUT',[['type','CHECKBOX'],['style','width:14px;']]); if(vN == 1) $at(newO, [['checked', true]]); break;
				case 'T': var newO = $e('INPUT',[['type', 'TEXT'],['value',vN]]); break;
				case 'SEL': var newO = $e('SELECT');
					for( var j = 0; j < aRBS[i][3].length; j++ ) newOption(newO, aRBS[i][3][j], j);
					newO.selected = vN; newO.value = parseInt(vN); break;
				case 'SP': var newO = $ee('SPAN',vN); break;
				case 'B': var newO = $ee('BUTTON',aRBS[i][3][0],[['class',allIDs[15]],['type', 'BUTTON'],['onclick',jsNone]]);
					newO.addEventListener('click', aRBS[i][3][1], true);
					break;
			}
			$at(newO, [['name', aRBS[i][1]]]);
			newTR.appendChild($c( newO, [['style','text-align:center;']]));
		}
		setupD.appendChild(newTR);
	}

	var newTR = $ee('TR',$em('TD',[gtext("youlang")+': ',$ee('b',navigator.language)]));
	newTR.appendChild(okTD(setupSave,destroySetup));
	setupD.appendChild(newTR);

	windowID[0] = makeFloatD(setupD, 0);
}

function allStorageDelete () {
	if( ! confirm(gtext("savedelallh")) ) return;
	for( var i = 0; i< allCookies.length; i++ ) {
		RB_deleteValue( GMcookieID + allCookies[i] );
	}
	RB_deleteValue(crtName + '-TRBP-UID');
	document.location.href = fullName + 'logout';
}

function parseSpieler () {
	var uName = $gc('playerName',$g('sidebarBoxActiveVillage'))[0].textContent.trim();
	var playerName = $gc('titleInHeader',$g('content'))[0].textContent.trim();
	var villageTable = $gc("villages")
	if (uName == playerName && villageTable.length > 0) {
		try {
			var capitalS = $gc("additionalInfo");
			if ( capitalS.length > 0 ) {
				var capital = capitalS[0].parentNode.getElementsByTagName('A')[0].getAttribute('href').match(/d=(\d+)/)[1];
			}
		} catch(err) {
			var capital = 0;
		}
		var aID = $xf('.//a[contains(@href,"alliance/")]','f',$g('content'));
		var fl = false;
		if( aID ) {
			aID = aID.getAttribute('href').match(/alliance\/(\d+)/)[1];
			if( aID != RB.dictionary[13] ) {
				fl = true;
				RB.dictionary[13] = aID;
			}
		} else if( RB.dictionary[13] != 0 ) {
			RB.dictionary[13] = 0;
			aID = 0;
		}
		if( RB.dictionary[0] != capital || RB.dictFL[1] == 0 || fl ) {
			var ally = $xf('.//div["playerProfile"]//table//tr','l',cont).snapshotItem(2).innerHTML.match(/>(.+?):?</)[1];
			RB.dictionary[0] = capital;
			RB.dictionary[1] = ally;
			saveCookie( 'Dict', 'dictionary' );
			RB.dictFL[1] = 1;
			saveCookie( 'DictFL', 'dictFL' );
		}
	}
}

var vLinksPat = '//div[@id="sidebarBoxVillagelist"]//li/a/div[@class="name"] | //div[@id="sidebarBoxVillagelist"]//a/span/span[@class="name"]';

function overviewWarehouse () {
	function refreshOview () {
		if( (parseInt(RB.overview[1]) + 900) > nowTime ) return;
		RB.overview[0] = 0;
		RB.overview[1] = crtPath.split("?")[0] + clearAntibot( linkVSwitch[village_aNum] );
		saveCookie('OV', 'overview');
		document.location.href=fullName + 'dorf1.php';
	}

	var overviewD = $e('TABLE',[['id',allIDs[8]]]);
	var newTHead = $e('THEAD');

	var refreshImg = $e('IMG',[['src', img_refr],['title',gtext("refresh")],['style','cursor:pointer;']]);
	refreshImg.addEventListener('click', refreshOview, true);
	var newTR = $em('TR',[$c(refreshImg),$c($e('i',[['class','r1']])),$c($e('i',[['class','r2']])),$c($e('i',[['class','r3']])),
		$c(trImg('&nbsp;')),$c($e('i',[['class','r4']])),$c(trImg('&nbsp;')),$c($e('i',[['class','r5']])),$c('')]);
	newTHead.appendChild(newTR);
	overviewD.appendChild(newTHead);

	var newTBody = $e('TBODY');
	var t = 0;
	var nowTime = Math.round((Date.now())/1000);
	var vLinks = $xf(vLinksPat,'l');
	for ( var vn = 0; vn < vLinks.snapshotLength; vn++ ) {
		var vName = $a(vLinks.snapshotItem(vn).innerHTML,[['href',linkVSwitch[vn]]]);
		if( villages_id[vn] == village_aid ) $at(vName, [['style','color:#71D000;']]);
		var newTR = $ee('TR',$c(vName));
		loadVCookie('vPPH', 'village_PPH', villages_id[vn]);

		var minLeft = Number.POSITIVE_INFINITY;
		for( var i = 0; i < 4; i++ ) {
			var deltaTime = RB.village_PPH[12] > 0 ? nowTime - parseInt(RB.village_PPH[12]): 0;
			var nowResInV = Math.round(RB.village_PPH[i]/3600 * deltaTime + RB.village_PPH[i+4]);
			if( nowResInV > RB.village_PPH[i+8] ) nowResInV = RB.village_PPH[i+8];
			if( nowResInV < 0 ) nowResInV = 0;
			var secLeft = RB.village_PPH[i] > 0 ? Math.round((RB.village_PPH[i+8] - nowResInV) / (RB.village_PPH[i]/3600)) : Math.round( nowResInV / (RB.village_PPH[i]/3600));
			if( secLeft < minLeft ) minLeft = secLeft;
			var nowResInVP = Math.round(nowResInV / RB.village_PPH[i+8]*100);
			var clr;
			if( secLeft < parseFloat(RB.Setup[6])*3600) {
				clr = 3;
			} else if ( secLeft < parseFloat(RB.Setup[5])*3600) {
				clr = 2;
			} else {
				clr = 1;
			}
			var newPval = $ee('DIV',nowResInVP+'%',[['class',allIDs[10]+clr]]);
			newPval.setAttribute("style", "width: " + Math.round(nowResInVP/2) + "px;");
			newTR.appendChild($c(newPval,[['class',allIDs[10]]]));
			if( i > 1 ) {
				timerOv[t] = new Object();
				timerOv[t].time = minLeft;
				timerOv[t].obj = $eT('TD', minLeft, 0, [['class',allIDs[17]]]);
				timerOv[t].dir = RB.village_PPH[i] > 0 ? -1: 1;
				if( Math.abs(minLeft) < 600 ) setInterval(function(x){return function(){
					x.style.color = x.style.color=='red'?'black':'red';}
				}(timerOv[t].obj),1000);
				newTR.appendChild(timerOv[t++].obj);
				minLeft = Number.POSITIVE_INFINITY;
			}
		}
		newTR.appendChild($c(RB.village_PPH[3],[['style','text-align:right']]));
		newTR.appendChild($c(addARLinks(villages_id[vn],0)));
		newTBody.appendChild(newTR);
	}
	overviewD.appendChild(newTBody);
	return overviewD;
}

function trImg ( cl, et, imgTag ) {
	var ecl = [['class', cl],['src', '/img/x.gif'],['style','display: inline-block;vertical-align: middle;']];
	if( typeof et != 'undefined' ) ecl.push(['title',et]);
	var tag = imgTag ? imgTag : 'IMG';
	return $e(tag,ecl);
}

function humanRF ( num ) {
	return num.toLocaleString('en-US');
	var rnum = parseInt(num);
	var dnum = Math.abs(rnum);
	var sign = rnum < 0 ? '-': '';
	var ddnum = 0;
	var fnum = '';
	while( dnum > 1000 ) {
		ddnum = ('00'+(dnum % 1000)).substr(-3,3);
		dnum = Math.floor(dnum/1000);
		fnum = ddnum + ',' + fnum;
	}
	fnum = dnum + ',' + fnum;
	return sign+fnum.substr(0,fnum.length-1);
}

function overviewResources () {
	var overviewD = $e('TABLE',[['id',allIDs[8]]]);
	var newTHead = $ee('THEAD',$em('TR',[$c(' '),$c($e('i',[['class','r1']])),$c($e('i',[['class','r2']])),$c($e('i',[['class','r3']])),$c(' '),$c($e('i',[['class','r4']])),$c(' '),$c('&#931;'),$c(trImg('clock')),$c('')]));

	overviewD.appendChild(newTHead);

	var newTBody = $e('TBODY');
	var t = 0;
	var resSumm = [0,0,0,0,0];
	var nowTime = Math.round((Date.now())/1000);
	var vLinks = $xf(vLinksPat,'l');
	for ( var vn = 0; vn < vLinks.snapshotLength; vn++ ) {
		var vName = $a(vLinks.snapshotItem(vn).innerHTML,[['href',linkVSwitch[vn]]]);
		if( villages_id[vn] == village_aid ) $at(vName, [['style','color:#71D000;']]);
		var newTR = $ee('TR',$c(vName));
		loadVCookie('vPPH', 'village_PPH', villages_id[vn]);

		var allResInV = 0;
		for( var i = 0; i < 4; i++ ) {
			var deltaTime = RB.village_PPH[12] > 0 ? nowTime - parseInt(RB.village_PPH[12]): 0;
			var nowResInV = Math.round(RB.village_PPH[i]/3600 * deltaTime + RB.village_PPH[i+4]);
			if( nowResInV > RB.village_PPH[i+8] ) nowResInV = RB.village_PPH[i+8];
			if( nowResInV < 0 ) nowResInV = 0;
			resSumm[i] += nowResInV;
			allResInV += nowResInV;
			var attr = [['class',allIDs[19]]];
			if( RB.village_PPH[i] < 0 ) attr[1] = ['style','color:red;'];
			newTR.appendChild($c(humanRF(nowResInV),attr));
			if( i == 2 ) newTR.appendChild($c('/'+RB.village_PPH[8],[['style','font-size:8pt;']]));
		}
		resSumm[4] += allResInV;
		var newT = $e('TABLE',[['class',allIDs[7]]]);
		for( k=1; k<11; k++ ) {
			var trC = troopInfo(k+(parseInt(RB.Setup[2])*10), 8);
			if( trC > 1 ) {
				newT.appendChild($em('TR',[$c(trImg('unit u'+(k+parseInt(RB.Setup[2])*10))),$c(Math.ceil(allResInV/trC))]));
			}
		}
		var res1 = $c(humanRF(allResInV),[['style','font-weight:bold;text-align:right']]);
		res1.addEventListener("mouseover", function(x){return function(){ makeTooltip(x); };}(newT), false);
		res1.addEventListener("mouseout", removeTooltip, false);
		newTR.appendChild($c('/'+RB.village_PPH[11],[['style','font-size:8pt;']]));
		newTR.appendChild(res1);
		if( villages_id[vn] != village_aid )
			newTR.appendChild($c(formatTime(getTTime(calcDistance(villages_id[vn],village_aid),MTime[parseInt(RB.Setup[2])]*sM,0,0),0)));
		else
			newTR.appendChild($c('&lt;--'));
		newTR.appendChild($c(addARLinks(villages_id[vn],0)));
		newTBody.appendChild(newTR);
	}
	overviewD.appendChild(newTBody);
	var newTR = $ee('TR',$c('&nbsp;'));
	for( var i = 0; i < 5; i++ ) {
		newTR.appendChild($c(humanRF(resSumm[i]),[['style','font-weight:bold;text-align:right;']]));
		if( i > 1 ) newTR.appendChild($c(' '));
	}
	newTR.appendChild($c(' ',[['colspan',3]]));
	overviewD.appendChild($ee('TFOOT',newTR));
	return overviewD;
}

function overviewTroops () {
	var overviewD = $e('TABLE',[['id',allIDs[8]]]);

	var newTBody = $e('TBODY');
	var vLinks = $xf(vLinksPat,'l');
	for ( var vn = 0; vn < vLinks.snapshotLength; vn++ ) {
		var vName = $a(vLinks.snapshotItem(vn).innerHTML,[['href',linkVSwitch[vn]]]);
		if( villages_id[vn] == village_aid ) $at(vName, [['style','color:#71D000;']]);
		var newTR = $ee('TR',$c(vName));

		loadZVCookie('Dorf12','village_dorf12',villages_id[vn]);
		var t = 0;
		var hfl = false;
		if( RB.village_dorf12[0] > 0 ) {
			var tT = $e('TABLE',[['class',allIDs[7]],['style','width:100%;']]);
			if( RB.village_dorf12[1] == 'hero' ) hfl = true;
			t = hfl ? 3 : 1;
			var fl = false;
			var nR1 = $e('TR');
			var nR2 = $e('TR');
			for( t; t < RB.village_dorf12.length; t+2 ) {
				for( var i = 1; i < 81; i++ ) {
					nR1.appendChild($c(trImg('unit u'+i)));
					if( i == RB.village_dorf12[t] ) {
						nR2.appendChild($c(RB.village_dorf12[t+1]));
						fl = true;
						t += 2;
					} else nR2.appendChild($c(0));
					if( (i%10) == 0 ) {
						if( fl ) {
							tT.appendChild(nR1);
							tT.appendChild(nR2);
							fl = false;
						}
						var nR1 = $e('TR');
						var nR2 = $e('TR');
					}
				}
			}
			newTR.appendChild($c(tT));
		} else newTR.appendChild($c('&nbsp;'));
		if( hfl ) newTR.appendChild($em('TD',[$ee('DIV',trImg('unit uhero')),$ee('DIV',RB.village_dorf12[2])]));
		else newTR.appendChild($c(''));
		newTR.appendChild($c(addARLinks(villages_id[vn],0)));
		newTBody.appendChild(newTR);
	}
	overviewD.appendChild(newTBody);

	return overviewD;
}

function overviewAll () {
	if( closeWindowN(1) ) { timerOv.length = 0; return; }
	if( villages_count < 2 ) return;

	function ovWarehouse () {
		ovBuild(overviewWarehouse());
	}
	function ovResources () {
		ovBuild(overviewResources());
	}
	function ovTroops () {
		ovBuild(overviewTroops());
	}
	function ovBuild ( ovNew ) {
		ovDIV.removeChild(overviewD);
		overviewD = ovNew;
		ovDIV.appendChild(overviewD);
	}
	function overviewClose () {
		timerOv.length = 0;
		closeWindowN(1);
	}

	var ovDIV = $e('DIV');
	var linkOW = $a(gtext("warehouse"),[['href',jsVoid]]);
	linkOW.addEventListener('click', ovWarehouse, true);
	var linkOR = $a(gtext("resources"),[['href',jsVoid]]);
	linkOR.addEventListener('click', ovResources, true);
	var linkOT = $a(gtext("troops"),[['href',jsVoid]]);
	linkOT.addEventListener('click', ovTroops, true);
	var menuD = $em('TD',[linkOW,' | ',linkOR,' | ',linkOT],[['style','text-align:'+docDir[0]+';padding:5px;']]);

	var menuR = $ee('TR',menuD);

	var newBTX = $ee('BUTTON',gtext("close")+' (X)',[['class',allIDs[15]],['onclick',jsNone],['style','float:'+docDir[1]+';']]);
	newBTX.addEventListener('click', overviewClose, true);
	menuR.appendChild($c(newBTX));

	var menuT = $ee('TABLE',menuR,[['style','background-color:#F8F8F8;border-collapse:collapse;']]);
	ovDIV.appendChild(menuT);

	var overviewD = overviewWarehouse();

	ovDIV.appendChild(overviewD);
	windowID[1] = makeFloatD(ovDIV, 2);
}

function clearAntibot ( oldURL ) {
	var clearURL = oldURL.replace(/&c=[\w]{6,6}/,'');
	return clearURL;
}

function imgHide ( num ) {
	var o = [['src','/img/x.gif'],['class',allIDs[32]]];
	if( RB.bodyH[num] == 1 ) o.push(['style','background-position:0px -12px;']);
	return $e('IMG',o);
}

function saveLink ( lns ) {
	var newCL = '';
	for( var i = 0; i < lns.length; i++ )
		if( /d=\d+/i.test(lns[i]) ) newCL += lns[i] + '@@_';
	RB_setValue(GMcookieID + "ln", newCL);
	redrawLinks();
	convertLinks();
}
function saveLink3 () {
	saveVCookie('ln3', RB.ln3, 1);
	redrawLinks();
	convertLinks();
}
function sortLinks () {
	slt = slt ? false: true;
	redrawLinks();
}
function redrawLinks () {
	$g(windowID[5]).parentNode.removeChild($g(windowID[5]));
	showLinks();
}
var slt = true;
function showLinks () {
	function intShowLinks (fl) {
		var maxLinks = fl ? alinks.length: RB.ln3.length;
		for( var i = 0; i < maxLinks; i++ ) {
			var oneLink = (fl?alinks[i]:RB.ln3[i]).split("\/@_");
			var tVId = parseInt(oneLink[0].match(/d=(\d+)/)[1]);
			var newTR = $e('TR');
			if( flKarte ) {
				if( slt ) {
					var newA = trImg(allIDs[39],gtext("del"));
					newA.addEventListener('click', function(x) { return function() { if( fl ) removeLink(x); else removeLink3(x); }}(i), false);
					var newTD = $c(newA);

					var newA = trImg(allIDs[38],gtext("edit"));
					newA.addEventListener('click', function(x) { return function() { if( fl ) editLink(x); else editLink3(x); }}(i), false);
					newTD.appendChild(newA);

					var newA = fl ? trImg(allIDs[40],gtext("unpin")): trImg(allIDs[41],gtext("pin"));
					newA.addEventListener('click', function(x) { return function() { if(fl) unpinLink(x); else pinLink(x); }}(i), false);
					newTD.appendChild(newA);
					newTR.appendChild(newTD);
				} else {
					if( i > 0 ) {
						var newA = $ee('A',$e('IMG',[['src',img_up]]),[['href',jsVoid]]);
						newA.addEventListener('click', function(x) { return function() { moveLinkUpDown(x); }}([i,(fl?0:1),-1]), false);
						var newTD = $c(newA);
					} else var newTD = $c($e('IMG',[['src', '/img/x.gif'],['style','height:12px;width:12px;']]));

					if( i < maxLinks-1 ) {
						var newA = $ee('A',$e('IMG',[['src',img_down]]),[['href',jsVoid]]);
						newA.addEventListener('click', function(x) { return function() { moveLinkUpDown(x); }}([i,(fl?0:1),1]), false);
						newTD.appendChild(newA);
					} else newTD.appendChild($e('IMG',[['src', '/img/x.gif'],['style','height:12px;width:12px;']]));

					newTR.appendChild(newTD);
				}
			}
			var newA = $a(unesc(oneLink[1]),[['href','/karte.php?'+oneLink[0]]]);
			distanceTooltip(newA,0);
			var newTD = $c( newA);
			newTR.appendChild(newTD);
			var newTD = $c(addARLinks(tVId,1));
			newTR.appendChild(newTD);
			newTBody.appendChild(newTR);
		}
		if( i > 0 ) newTBody.appendChild($ee('TR',$c(' ',[['style','height:2px;line-height:2px;background-color:silver;'],['colspan',(flKarte ? 3:2)]])));
	}
	function moveLinkUpDown ( num ) {
		switch ( num[1] ) {
			case 0:
				var oneLink = alinks[num[0]];
				alinks.splice(num[0], 1);
				alinks.splice(num[0]+num[2], 0, oneLink);
				saveLink( alinks );
				break;
			case 1:
				var oneLink = RB.ln3[num[0]];
				RB.ln3.splice(num[0], 1);
				RB.ln3.splice(num[0]+num[2], 0, oneLink);
				saveLink3();
				break;
			case 2:
				var oneLink = clinks[num[0]];
				clinks.splice(num[0], 1);
				clinks.splice(num[0]+num[2], 0, oneLink);
				RB_setValue(GMcookieID + "ln2", clinks.join("@@_")+"@@_");
				redrawLinks();
				break;
		}
	}
	function pinLink ( num ) {
		alinks.push(RB.ln3[num]);
		RB.ln3.splice(num, 1);
		saveVCookie('ln3', RB.ln3, 1);
		saveLink( alinks );
	}
	function unpinLink ( num ) {
		RB.ln3.push(alinks[num]);
		alinks.splice(num, 1);
		saveVCookie('ln3', RB.ln3, 1);
		saveLink( alinks );
	}
	function addLink () {
		var newLink = crtPath.match(/[?&](d=.*)$/i);
		if( newLink.length == 0 ) return;
		newLink = newLink[1];
		var newName = $gt('h1',cont)[0].innerHTML.onlyText().replace(/&.+?;/g, " ");
		newName = prompt(gtext("linkname"), newName);
		if( newName == null ) return;
		var newOneLink = newLink + "\/@_" + esc(newName);
		RB.ln3.push(newOneLink);
		saveLink3();
	}
	function removeLink ( num ) {
		if( ! confirm(gtext("linkdel")+': '+unesc(alinks[num].split("\/@_")[1])+' ?') ) return;
		alinks.splice(num, 1);
		saveLink( alinks );
	}
	function removeLink3 ( num ) {
		if( ! confirm(gtext("linkdel")+': '+unesc(RB.ln3[num].split("\/@_")[1])+' ?') ) return;
		RB.ln3.splice(num, 1);
		saveLink3();
	}
	function editLink ( num ) {
		var oneLink = alinks[num].split("\/@_");
		var newName = prompt(gtext("linkname"), unesc(oneLink[1]));
		if( newName == null ) return;
		alinks[num] = oneLink[0] + "\/@_" + esc(newName);
		saveLink( alinks );
	}
	function editLink3 ( num ) {
		var oneLink = RB.ln3[num].split("\/@_");
		var newName = prompt(gtext("linkname"), unesc(oneLink[1]));
		if( newName == null ) return;
		RB.ln3[num] = oneLink[0] + "\/@_" + esc(newName);
		saveLink3();
	}
	function editCLink () {
		if( closeWindowN(6) ) return;

		function removeCLink ( num ) {
			eBody.removeChild($g('sn'+num));
		}
		function addCLink ( fl ) {
			var v = fl ? crtPath: '';
			var newA = trImg(allIDs[39],gtext("del"));
			newA.addEventListener('click', function(x) { return function() { removeCLink(x); }}(SN), false);
			eBody.appendChild($em('TR',[$c($e('INPUT',[['value',''],['name','lname'],['size',20]])), $c($e('INPUT',[['value',v],['name','lurl'],['size',50]])),$c(newA)],[['id','sn'+(SN++)]]));
		}
		function saveCLinks () {
			var names = $gn('lname');
			var urls = $gn('lurl');
			var newCL = '';
			for( var i = 0; i < names.length; i++ ) {
				if( urls[i].value.length < 3 ) continue;
				if( names[i].value.length == 0 ) {
					if( urls[i].value.length > 25 )
						newCL += esc(urls[i].value.slice(0,9) +'..'+ urls[i].value.slice(-14)) +"\/@_"+ esc(urls[i].value) +"@@_";
					else
						newCL += urls[i].value +"\/@_"+ esc(urls[i].value) +"@@_";
				} else newCL += esc(names[i].value) +"\/@_"+ esc(urls[i].value) +"@@_";
			}
			RB_setValue(GMcookieID + "ln2", newCL);
			cancelCLinks();
			redrawLinks();
		}
		function cancelCLinks () {
			closeWindowN(6);
		}

		var SN = 0;
		var eBody = $e('TBODY');
		var editLinks = $ee('TABLE',eBody);
		editLinks.appendChild($em('THEAD',[$ee('TR',okTD(saveCLinks,cancelCLinks,3)),$em('TR',[$c(gtext("linkname")),$c('URL',[['colspan',2]])])]));
		for( var i = 0; i < clinks.length; i++ ) {
			var oneLink = clinks[i].split("\/@_");
			var newA = trImg(allIDs[39],gtext("del"));
			newA.addEventListener('click', function(x) { return function() { removeCLink(x); }}(SN), false);
			eBody.appendChild($em('TR',[$c($e('INPUT',[['value',unesc(oneLink[0])],['name','lname'],['size',20]])), $c($e('INPUT',[['value',unesc(oneLink[1])],['name','lurl'],['size',50]])),$c(newA)],[['id','sn'+(SN++)]]));
		}
		var newA = $a('+',[['href',jsVoid],['title',"add new"],['style','color:red;']]);
		newA.addEventListener('click', function() { addCLink(false); }, true);
		var newB = $a('(+)',[['href',jsVoid],['title',gtext('addcur')],['style','color:red;']]);
		newB.addEventListener('click', function() { addCLink(true); }, true);
		editLinks.appendChild($ee('TFOOT',$em('TR',[$em('TD',[newA,' / ',newB],[['style','text-align:center;font-size:20px;']]),okTD(saveCLinks,cancelCLinks,2)])));

		windowID[6] = makeFloatD(editLinks, 9);
	}

	var flKarte = /karte.+?[?&]d=.+c=/i.test(crtPath) ? true: false;
	if( /karte.php|position_details.php/i.test(crtPath) ) flKarte = true;
	// village links
	var ln_cookie = RB_getValue(GMcookieID + "ln", "");
	var alinks = ln_cookie.split("@@_");
	alinks.splice((alinks.length - 1), 1);
	// free constant links
	var ln_cookie = RB_getValue(GMcookieID + "ln2", "");
	var clinks = ln_cookie.split("@@_");
	clinks.splice((clinks.length - 1), 1);
	// links bound to village
	loadVCookie('ln3', 'ln3', village_aid, 1);
	if( RB.ln3[0] == 0 ) RB.ln3.length = 0;

	var newTBody = $e('TBODY');
	if( RB.bodyH[2] == 1 ) $at(newTBody,[['style','display:none']]);

	rbLinks = $e('TABLE',[['id',allIDs[9]]]);
	var newTHead = $e('THEAD');
	var newTR = $e('TR');

	var editCL = trImg(allIDs[38],gtext("edit"));
	editCL.addEventListener('click', editCLink, false);

	var hideP = imgHide(2);
	hideP.addEventListener('click', function (x) { return function() { bodyHide(x); }}([newTBody,2,hideP]), false);

	var newTD = $em('TD',[hideP,' ',gtext("links"),': ',editCL],[['colspan',(flKarte?3:2)]]);
	if( flKarte ) {
		var sortL = $ee('A',$e('IMG',[['src',img_updown]]),[['href',jsVoid],['title',gtext("edit")],['style','padding:0px 5px;']]);
		sortL.addEventListener('click', sortLinks, false);
		newTD.appendChild(sortL);
	}
	newTR.appendChild(newTD);
	newTHead.appendChild(newTR);
	rbLinks.appendChild(newTHead);

	for( var i = 0; i < clinks.length; i++ ) {
		var newTR = $e('TR');
		if( ! slt ) {
			if( i > 0 ) {
				var newA = $ee('A',$e('IMG',[['src',img_up]]),[['href',jsVoid]]);
				newA.addEventListener('click', function(x) { return function() { moveLinkUpDown(x); }}([i,2,-1]), false);
				var newTD = $c(newA);
			} else var newTD = $c($e('IMG',[['src', '/img/x.gif'],['style','height:12px;width:12px;']]));

			if( i < clinks.length-1 ) {
				var newA = $ee('A',$e('IMG',[['src',img_down]]),[['href',jsVoid]]);
				newA.addEventListener('click', function(x) { return function() { moveLinkUpDown(x); }}([i,2,1]), false);
				newTD.appendChild(newA);
			} else newTD.appendChild($e('IMG',[['src', '/img/x.gif'],['style','height:12px;width:12px;']]));

			newTR.appendChild(newTD);
		}
		var oneLink = clinks[i].split("\/@_");
		newTR.appendChild($c($a(unesc(oneLink[0]),[['href',unesc(oneLink[1])]]),[['colspan',(flKarte?(slt?3:2):2)]]));
		newTBody.appendChild(newTR);
	}
	if( i > 0 ) newTBody.appendChild($ee('TR',$c(' ',[['style','height:2px;line-height:2px;background-color:silver;'],['colspan',(flKarte ? 3:2)]])));

	intShowLinks(true);
	intShowLinks(false);

	rbLinks.appendChild(newTBody);

	if( RB.Setup[12] == 1 ) {
		windowID[5] = allIDs[9]+'F';
		$g(pageElem[2]).appendChild($ee('P',rbLinks,[['id',windowID[5]]]));
	} else {
		windowID[5] = makeFloatD(rbLinks, 3);
	}
}
function addlinkT4() {
	var vilView = $g('tileDetails');
	if( vilView ) {
		var h1 = $gt('H1',vilView)[0];
		if( ! h1 ) h1 = $gt('H1',cont)[0];
		if( h1 ) {
			var spn = $gc('coordinatesWrapper',h1);
			var xy = getVidFromCoords(spn[0].innerHTML);
			newLink = 'd='+xy;
			var newName = h1.innerHTML.firstText().replace(/([\u2000-\u20ff])/g,'') + ' ' + printCoords(xy);
			newName = prompt(gtext("linkname"), newName);
			if( newName == null ) return;
			var newOneLink = newLink + "\/@_" + esc(newName);
			RB.ln3.push(newOneLink);
			saveLink3();
		}
	}
}

function detectNameAttaker() {
	var tmenu = $gc('filterContainer',cont)[0];
	if( ! (tmenu) ) return;

	var ttable = [];
	var thref = [];
	var nameCache = [];
	var linkCache = [];
	var anameCache = [];

	function nameAttaker( num ) {
		var tname = nameCache[thref[num]];
		var tlink = linkCache[thref[num]];
		var aname = anameCache[thref[num]];
		if( ! tname ){
			var xy = id2xy(thref[num]);
			param = '{"x":'+xy[0]+',"y":'+xy[1]+'}';
			ajaxRequest(fullName+'api/v1/map/tile-details', 'POST', param, function(ajaxResp) {
				var resb = JSON.parse(ajaxResp.responseText);
				var adv = resb.html.toString();
				var res = adv.match(/<td class=\"player\"><a href=\"\/profile\/(.+?)\">(.+)<\/a/i);
				tlink = res[1];
				tname = res[2];
				nameCache[thref[num]] = tname;
				linkCache[thref[num]] = tlink;
				res = adv.match(/<td class=\"alliance\"><a href=\"\/(alliance\/.+?)\">(.*)<\/a/i);
				aname = res[2];
				anameCache[thref[num]] = aname;
				var tTD = $xf('tbody[@class="units"]/tr/th', 'f', ttable[num]);
				if( $gc(allIDs[29],tTD).length > 0 ) return;
				tTD.insertBefore($a(tname,[['href','profile/'+tlink],['title',aname],['class',allIDs[29]]]),tTD.firstChild);
			}, dummy);
		} else {
			var tTD = $xf('tbody[@class="units"]/tr/th', 'f', ttable[num]);
			if( $gc(allIDs[29],tTD).length > 0 ) return;
			tTD.insertBefore($a(tname,[['href','profile/'+tlink],['title',aname],['class',allIDs[29]]]),tTD.firstChild);
		}
	}
	function prepareGetAttakers() {
		var allIn = $xf('.//table[tbody/tr/td/div[@class="in"]]','l');
		var hrefCache = [];
		var curTO = 0;
		for( var i = 0; i < allIn.snapshotLength; i++ ) {
			ttable[i] = allIn.snapshotItem(i);
			thref[i] = $xf('thead/tr/td[@class="role"]/a', 'f', ttable[i]).getAttribute('href');
			thref[i] = thref[i].substring(1);
			hrefCache[thref[i]] = true;
			thref[i] = thref[i].match(/d=(\d+)/i)[1];
			curTO += hrefCache[thref[i]] ? 1: getRandom(500,2000);
			setTimeout(function(x) { return function() { nameAttaker(x); }}(i), curTO);
		}
	}

	var nameLink = $a('???',[['href',jsVoid]]);
	nameLink.addEventListener('click', prepareGetAttakers, false);
	var newSP = $ee('DIV',nameLink,[['style',"position:absolute;margin:5px -30px;display:inline-block;"]]);
	tmenu.insertBefore(newSP,tmenu.firstChild);

	var attFI = $ee('BUTTON',trImg('iReport iReport1'),[['class',"iconFilter"],['onclick',jsNone]]);
	attFI.addEventListener('click', filterIncomeTroops, false);
	tmenu.insertBefore(attFI,tmenu.firstChild.nextSibling);
}

var filterITObj = new Object;
function filterIncomeTroops () {
	function parseNextPage () {
		if( ! nP ) {
			filterITObj.statD.innerHTML = '';
			addSpeedAndRTSend(filterITObj.actD);
			return;
		}
		filterITObj.statD.innerHTML = 'scanning: page'+curNum;
		curNum++;
		ajaxRequest(fullName+nP, 'GET', null, function(ajaxResp) {
			var ad = ajaxNDIV(ajaxResp);
			ad = $xf('.//div[@id="content"]','f',ad);
			if( ! ad ) return;
			nP = getNextReportPage(ad);
			var allIn = $xf('.//table[tbody/tr/td/div[@class="in"]]','l',ad);
			for( var i=0; i<allIn.snapshotLength; i++ ) {
				var town = $xf('.//td[@class="role"]/a','f',allIn.snapshotItem(i));
				if( getVid(town.getAttribute('href')) == village_aid ) continue;
				var adT = allIn.snapshotItem(i).cloneNode(true);
				filterITObj.actD.appendChild(adT);
			}
			ad = null;
			setTimeout(parseNextPage, getRandom(300,1000));
		}, dummy);
	}

	function closeDiv() {
		var newBTX = $ee('BUTTON',gtext("close")+' (X)',[['onclick',jsNone],['class',allIDs[15]],['style','direction:ltr']]);
		newBTX.addEventListener('click', function() {closeWindowN(11);}, true);
		return $ee('DIV',newBTX);
	}

	if( closeWindowN(11) ) return;
	if( typeof filterITObj.newD == 'undefined' ) {
		filterITObj.newD = $e('DIV',[['class',"gid16"],['id','build'],['style','background-color:white;width:551px;']]);
		filterITObj.statD = $e('DIV');
		filterITObj.actD = $e('DIV');
		$am(filterITObj.newD,[closeDiv(),filterITObj.statD,filterITObj.actD,closeDiv()]);
		var nP = 'build.php?gid=16&tt=1&filter=1';
		var curNum = 1;
		parseNextPage();
	}
	windowID[11] = makeFloatD(filterITObj.newD, 11);
}

/***************************** Activity Servers **********************************/

var analyzers = [gtext('incomreso')[0],'travmap.shishnet.org','gettertools.com','inactivesearch.it'];
RB.serversAN = new Array(analyzers.length);
function userActivityServers ( num, id, user ) {
	var dsrv = RB.serversAN[num-1] !== undefined ? RB.serversAN[num-1]: srv;
	if ( num == 1 ) {
		if( RB.serversAN[num-1] === undefined ) dsrv = crtName;
		return ['travmap.shishnet.org','https://travmap.shishnet.org/map.php?server='+dsrv+'&'+(user?'player':'alliance')+'=id:'+id+'&groupby='+(user?'town':'player')+'&casen=on&format=svg&azoom=off','https://travmap.shishnet.org/map.php?server=###'+dsrv+'###&player=....'];
	} else if ( num == 2 ) {
		if( RB.serversAN[num-1] === undefined ) dsrv = crtName;
		return ['gettertools.com','https://www.gettertools.com/'+dsrv+'/'+(user?'Player':'Alliance')+'/'+id+'-','https://www.gettertools.com/###'+dsrv+'###/Player/...'];
	} else {
		if( RB.serversAN[num-1] === undefined ) dsrv = crtName;
		return ['inactivesearch.it','https://www.inactivesearch.it/analyse/'+dsrv+'/'+(user?'player':'alliance')+'/'+id,'https://www.inactivesearch.it/analyse/###'+dsrv+'###/player/...'];
	}
}

function ActivityInfo ( id, user ) {
	var newR = $ee('TR',$c($e('IMG',[['src',img_stat]]),[['style','width:55px;']]));
	var newD = $c('',[['style','text-align:'+docDir[0]+';']]);
	for( var i = 1; i < analyzers.length; i++ ) {
		var alink = userActivityServers( i, id, user );
		newD.appendChild($a(alink[0],[['href',alink[1]],['target','_blank']]));
		newD.appendChild($e('BR'));
	}
	newR.appendChild(newD);
	newR.appendChild($c('',[['id',allIDs[0]],['style','width:40%;text-align:'+docDir[0]+';']]));
	newT = $ee('TABLE',newR,[['class',allIDs[21]]]);
	var newP = $ee('P',newT);
	var lastT = $gt('TABLE',cont);
	if (lastT.length>0) {
		insertAfter(newP, lastT[lastT.length-1]);
	} else {
		var once = false;
		var MutationObserver = window.MutationObserver;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'childList') {
					var vtable = $gc("villages", cont);
					if ( vtable.length == 1 ) {
						observer.disconnect();
						addStats();
						once = true;
					}
				}
			});
		});
		var config = { childList: true, subtree: true };
		observer.observe(cont, config);
	}
	function addStats () {
		if (once) return;
		var lastT = $gt('TABLE',cont);
		insertAfter(newP, lastT[lastT.length-1]);
	}
}
function userActivityInfo() {
	// Get user id
	var uID = crtPath.match(/profile\/(\d+)/);
	ActivityInfo( uID?uID[1]:userID, true );
}
function allyActivityInfo() {
	// Get alliance id
	var aID = crtPath.match(/alliance\/(\d+)/);
	if( aID ) aID = aID[1];
	else if( RB.dictionary[13] > 0 ) aID = RB.dictionary[13]; else return;
	ActivityInfo( aID, false );
}

function AllyBonusPageRefreshRB() {
	var target = $g('dailyContributionTitleText');
	if ( ! target ) { return; }
	var MutationObserver = window.MutationObserver;
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'childList') {
				initRes = true; setTimeout(function() { getResources(); progressbar_ReInit(); }, 250);
			}
		});
	});
	var config = { childList: true, subtree: true };
	observer.observe(target, config);
}

function viewMessageIW() {
	function selectMessage (num) {
		var allRows = $xf('.//tr[td/@class="sel"]','l',cont);
		var tds = allRows.snapshotItem(num).cells;
		$gt('INPUT',tds[0])[0].click();
		var aLinks = $xf('.//a[(contains(@href, "?id=") or contains(@href, "messages/")) and not(contains(@href, "toggleState=")) and not(contains(@href, "mark=")) and not(contains(@href, "build.php"))]','f',tds[1]);
		var aLink = aLinks.href;
		var tV = /report/.test(aLink) ? 1: 0;
		viewMessageIWDisplay( aLink, tV , (num>12?offsetPosition(aLinks):false));
	}

	var allRows = $xf('.//tr[td/@class="sel"]','l',cont);
	for( var i = 0; i < allRows.snapshotLength; i++ ) {
		if (allRows.snapshotItem(i).className) continue;
		var td = allRows.snapshotItem(i).cells[1];
		var newImg = $e('IMG',[['src',img_view]]);
		newImg.addEventListener('click', function(x) { return function() { selectMessage(x); }}(i), false);
		$at(newImg,[['style','position:relative;float:'+docDir[0]+';'+(/report/.test(crtPath)?'':docDir[0]+':-6px;')]]);
		td.insertBefore(newImg, td.firstChild);
	}
}

function viewMessageIWClose() {
	closeWindowN(4);
}
function viewMessageIWDisplay( aLink, tV, xy ) {
	var messCr = './/div[@class="paper"]';
	var viewPref = [
		[messCr,'messages','padding-'+docDir[0]+':25px;text-align:'+docDir[0]+';'],
		['.//*[@id="report_surround" or @id="reportWrapper"]','reports','padding:5px 20px;width:554px;text-align:'+docDir[0]+';']];

	ajaxRequest(aLink, 'GET', null, function(ajaxResp) {
		viewMessageIWClose();
		var ad = ajaxNDIV(ajaxResp);
		var aV = $xf(viewPref[tV][0], 'f', ad);
		ad = null;
		if (aV) {
			var newBTX = $ee('BUTTON',gtext("close")+' (X)',[['onclick',jsNone],['class',allIDs[15]]]);
			newBTX.addEventListener('click', viewMessageIWClose, true);
			var closeBtn = $ee('BUTTON',gtext("close")+' (X)',[['onclick',jsNone],['class',allIDs[15]]]);
			closeBtn.addEventListener('click', viewMessageIWClose, true);
			var newD = $em('DIV',[$ee('DIV',aV,[['class',viewPref[tV][1]],['style',viewPref[tV][2]]]),newBTX],[['style','background-color:white;padding-bottom:10px;']]);
			newD.insertBefore(closeBtn, newD.firstChild);
			windowID[4] = xy ? makeFloat(newD, xy[0], xy[1]): makeFloatD(newD, 4);
			if( tV == 1 ) { addSpeedAndRTSend(newD); analyzerBattle(); getTroopNames(); } else convertCoordsInMessagesToLinks();
			addRefIGM( windowID[4] );
			if( xy ) updatePosition( windowID[4], xy, 4 );
		}
	}, dummy);
}

function viewMessageIWK ( piBl ) {
	var iBl = piBl || cont;
	var allRows = $xf('.//td[.//a[contains(@href, "report?id=")]]','l',iBl);
	for( var i = 0; i < allRows.snapshotLength; i++ ) {
		var td = allRows.snapshotItem(i);
		var aLink = $xf('.//a[contains(@href, "report?")]','f',td).href;
		var newImg = $e('IMG',[['src',img_view]]);
		if( /alliance/.test(crtPath) )
			$at(newImg,[['style','position:relative;float:'+docDir[0]+';'+docDir[0]+':-5px;']]);
		td.insertBefore(newImg, td.firstChild);
		newImg.addEventListener('click', function(x) { return function() { viewMessageIWDisplay(x[0],1,x[1]); }}([aLink,(i>12?offsetPosition(newImg):false)]), false);
	}
}

function parseDorf1 () {
	if( RB.Setup[14] == 0 ) return;

	function parseBuilds() {
		loadZVCookie('Dorf1','village_dorf1');
		var fl = false;
		var newCookie = [0];
		var t = 1;
		var s = 0;
		var fl2 = false;
		var move = $gc('buildingList');
		if( move.length < 1 ) fl2 = true;
		if( fl2 ) {
			if( RB.village_dorf1[0] != 0 ) fl = true;
		} else {
			var descr = $gt('li',move[0]);
			for( var i = 0; i < descr.length; i++ ) {
				newCookie[0]++;
				var td = $gt('div',descr[i]);
				newCookie[t++] = td[s].textContent.onlyText().replace(/\s+?/g,' ').trim();
				if( td.length < 3 ) {
					newCookie[t++] = 0;
					newCookie[t++] = '';
				} else {
					var timer = $xf('.//span[contains(@class, "timer")]','f',td[s+1]).getAttribute("value");
					newCookie[t++] = Math.round(RunTime[0]/1000) + (timer?parseInt(timer):0);
					newCookie[t++] = td[s+1].textContent.onlyText().replace(/.+?\d\d\s\S+\s/,'').replace(/\s+?/g,' ').trim();
				}
				if( RB.dictFL[14] == 0 ) {
					RB.dictionary[14] = newCookie[t-1].split(/\d/,1)[0];
					saveCookie( 'Dict', 'dictionary' );
					RB.dictFL[14] = 1;
					saveCookie( 'DictFL', 'dictFL' );
				}
			}
			fl = true;
		}
		if( fl ) saveVCookie('Dorf1',newCookie,1);
	}
	function parseAttack() {
		loadZVCookie('Dorf11','village_dorf11');
		var fl = RB.village_dorf11[0] == 0 ? false: true;
		var newCookie = [0];
		var t = 1;
		var move = $g('movements');
		if( ! move ) {
			saveVCookie('Dorf11',newCookie,1);
			return;
		}
		var descr = move.tBodies[0].rows;
		for( var i = 0; i < descr.length; i++ ) {
			var aimg = $gt('img',descr[i])[0];
			var atime = toSeconds(descr[i].innerHTML);
			if( aimg ) {
				newCookie[0]++;
				newCookie[t] = aimg.getAttribute('class');
				newCookie[t+2] = $gc('mov',descr[i])[0].innerHTML.onlyText().trim();
			}
			if( atime != 0 ) {
				newCookie[t+1] = Math.round(RunTime[0]/1000) + atime;
				t = t+3;
				fl = true;
			}
		}
		if( fl ) saveVCookie('Dorf11',newCookie,1);
	}
	function parseTroops() {
		loadZVCookie('Dorf12','village_dorf12');
		var newCookie = [0];
		var t = 1;
		var troops = $xf('.//tr[.//img]','r',$g("troops"));
		var fl = RB.village_dorf12[0] ==  troops.snapshotLength ? false : true;
		for( var i = 0; i < troops.snapshotLength; i++ ) {
			if( troops.snapshotItem(i).cells.length < 3 ) continue;
			newCookie[0]++;
			newCookie[t++] = troops.snapshotItem(i).getElementsByTagName('IMG')[0].getAttribute('class').match(/ u(.+)/)[1];
			newCookie[t++] = troops.snapshotItem(i).cells[1].innerHTML;
			if( ! fl ) {
				if( RB.village_dorf12[t-2] == undefined ) fl = true;
				if( RB.village_dorf12[t-2] != newCookie[t-2] ) fl = true;
				if( RB.village_dorf12[t-1] != newCookie[t-1] ) fl = true;
			}
		}
		if( fl ) saveVCookie('Dorf12',newCookie,1);
	}
	function detectTribe () {
		var village = $g("resourceFieldContainer");
		if (village) {
			var race = parseInt(village.getAttribute('class').match(/tribe(\d+)/)[1])-1;
			if( race != RB.Setup[2] ) {
				RB.Setup[2] = race;
				saveCookie( 'RBSetup', 'Setup' );
			}
		}
	}

	parseBuilds();
	if( /dorf1.php/.test(crtPath) ) {
		parseAttack();
		parseTroops();
		detectTribe();
	}
}

function showTooltipBuild ( tb ) {
	var newTABLE = $e('TABLE',[['class',allIDs[7]]]);
	for( var i = 0; i < tb[0]; i++ ) {
		var newTR = $ee('TR',$c(tb[i*3+1]));
		newTR.appendChild($c(tb[i*3+3]));
		newTABLE.appendChild(newTR);
	}
	makeTooltip(newTABLE);
}

function showTooltipInfo ( tb ) {
	var newTABLE = $e('TABLE',[['class',allIDs[7]]]);
	var rf = new Array();
	for( var i = 0; i < tb[0]; i++ ) rf[i]=i;
	rf.sort(function(a,b){return tb[a*4+2]-tb[b*4+2];});
	lastTimerB = timerB.length;
	var t = lastTimerB;
	for( var i = 0; i < tb[0]; i++ ) {
		var newTR = $ee('TR',$c(tb[rf[i]*4+3].replace(/"tinfo_c"/g,allIDs[47])));
		var htf = tb[rf[i]*4+2] - Math.round((Date.now())/1000);
		if( htf > 0 ) {
			timerB[t] = new Object();
			timerB[t].time = htf;
			timerB[t].obj = $c(formatTime(htf, 0));
			newTR.appendChild(timerB[t++].obj);
		} else newTR.appendChild($c('--:--'));
		newTR.appendChild($c(tb[rf[i]*4+4]));
		newTABLE.appendChild(newTR);
	}
	makeTooltip(newTABLE);
}
function showTooltipAttack ( tb ) {
	var newTABLE = $e('TABLE',[['class',allIDs[7]]]);
	lastTimerB = timerB.length;
	var t = lastTimerB;
	for( var i = 0; i < tb[0]; i++ ) {
		var newTR = $ee('TR',$c($e('IMG',[['src','/img/x.gif'],['class',tb[i*3+1]]])));
		var lrt = /2|adv/.test(tb[i*3+1]) ? '&laquo;': '&raquo;';
		newTR.appendChild($c(lrt));
		newTR.appendChild($c(tb[i*3+3]));
		var htf = tb[i*3+2] - Math.round((Date.now())/1000);
		if( htf > 0 ) {
			timerB[t] = new Object();
			timerB[t].time = htf;
			timerB[t].obj = $c(formatTime(htf, 0));
			$am(newTR,[timerB[t++].obj,$c(formatTime(absTime(htf),4))]);
		} else $am(newTR,[$c('--:--'),$c('')]);
		newTABLE.appendChild(newTR);
	}
	makeTooltip(newTABLE);
}

function showDorf1 () {
	var vlist = $g('vlist');
	if( ! vlist ) return;
	var t = 0;
	villages = vlist.tBodies[0].rows;
	for( var i = 0; i < villages_id.length; i++ ) {
		loadZVCookie('Dorf1','village_dorf1',villages_id[i]);
		var newTD = $c('');
		if( RB.village_dorf1[0] > 0 ) {
			var dTime = RB.village_dorf1[2] - Math.round(RunTime[0]/1000);
			var color = dTime < 0 ? 'red': 'black';
			if( dTime < 0 ) dTime = 0;
			timerB3[t] = new Object();
			timerB3[t].time = dTime;
			timerB3[t].obj = $ee('SPAN',formatTime(dTime, 3),[['style','margin:0px 5px;color:'+color+';']]);
			var tb = RB.village_dorf1.slice();
			timerB3[t].obj.addEventListener("mouseover", function(x) { return function() { showTooltipBuild(x); }}(tb), false);
			timerB3[t].obj.addEventListener("mouseout", removeTooltip, false);
			newTD.appendChild(timerB3[t++].obj);
		} else newTD.appendChild($ee('SPAN','--:--',[['style','margin:0px 5px;']]));

		loadZVCookie('Dorf13','village_dorf13',villages_id[i]);
		if( RB.village_dorf13[0] > 0 ) {
			var dTime = RB.village_dorf13[2] - Math.round(RunTime[0]/1000);
			var color = dTime < 0 ? 'red': 'black';
			if( dTime < 0 ) dTime = 0;
			timerB3[t] = new Object();
			timerB3[t].time = dTime;
			timerB3[t].obj = $ee('SPAN',formatTime(dTime, 3));
			var tb = RB.village_dorf13.slice();
			timerB3[t].obj.addEventListener("mouseover", function(x) { return function() { showTooltipBuild(x); }}(tb), false);
			timerB3[t].obj.addEventListener("mouseout", removeTooltip, false);
			var newdid = linkVSwitch[i].match(/newdid=\d+/i)[0];
			newTD.appendChild($em('A',['[',timerB3[t++].obj,']'],[['href',fullName + 'build.php?'+newdid+'&gid=15'],['style','margin:0px 10px 0px -5px;color:'+color+';font-weight:normal;']]));
		}

		loadZVCookie('Dorf14','village_dorf14',villages_id[i]);
		if( RB.village_dorf14[0] > 0 ) {
			var now = Math.round(RunTime[0]/1000);
			var newCookie = [0];
			var fl = false;
			for( var j=0; j<RB.village_dorf14[0]; j++ ) {
				if( RB.village_dorf14[j*4+2] > now ) {
					newCookie[0]++;
					newCookie.push(RB.village_dorf14[j*4+1],RB.village_dorf14[j*4+2],RB.village_dorf14[j*4+3],RB.village_dorf14[j*4+4]);
				} else fl = true;
			}
			if( fl ) {
				var aid_t = village_aid;
				village_aid = villages_id[i];
				saveVCookie('Dorf14',newCookie,1);
				village_aid = aid_t;
			}
			if( newCookie[0] > 0 ) {
				var newI = trImg(allIDs[47]);
				newI.addEventListener("mouseover", function(x) { return function() { showTooltipInfo(x); }}(newCookie), false);
				newI.addEventListener("mouseout", removeTooltip, false);
				newTD.appendChild(newI);
			}
		}

		loadZVCookie('Dorf11','village_dorf11',villages_id[i]);
		if( RB.village_dorf11[0] > 0 ) {
			var newdid = linkVSwitch[i].match(/newdid=\d+/i)[0];
			var newAI = $a('',[['href',fullName + 'build.php?'+newdid+'&gid=16&id=39'],['style','font-weight:400;color:black;']]);
			var tb = RB.village_dorf11.slice();
			for( var j = 0; j < tb[0]; j++ ) {
				newAI.appendChild($e('IMG',[['src','/img/x.gif'],['class',tb[j*3+1]]]));
				if(RB.Setup[14] > 1) {
					var htf = tb[j*3+2] - Math.round((Date.now())/1000);
					if( htf > 0 ) {
						timerB3[t] = new Object();
						timerB3[t].time = htf;
						timerB3[t].obj = $ee('SPAN',formatTime(htf, 3));
						newAI.appendChild(timerB3[t++].obj);
					}
				}
			}
			newAI.addEventListener("mouseover", function(x) { return function() { showTooltipAttack(x); }}(tb), false);
			newAI.addEventListener("mouseout", removeTooltip, false);
			newTD.appendChild(newAI);
		}
		villages[i].appendChild(newTD);
	}
	var awake = $e('DIV',[['id',allIDs[28]]]);
	awake.addEventListener("click", editAWake, false);
	vlist.tHead.rows[0].appendChild($c(awake));
	aClockTimer = t;
	showAWake();
}

function editAWake () {
	var aClock = parseInt(RB_getValue(GMcookieID + 'AC','0'));
	var acc = aClock - Math.round((Date.now())/1000) + getServerTime();
	var ac = acc < 0 ? formatTime(0,0) : formatTime(acc,0);
	var newClock = prompt(gtext("aclock"), ac);
	if( newClock == null ) return;
	var dg = newClock.match(/\d+/g);
	if( ! (dg) ) {
		aClock = 0;
	} else if( dg.length < 1 || dg.length > 3 ) {
		aClock = 0;
	} else {
		if( dg.length == 1 ) {
			aClock = Math.round((Date.now())/1000)+parseInt(dg[0])*60;
		} else {
			var nA = dg.length == 3 ? [dg[0],dg[1],dg[2]]: [dg[0],dg[1],0];
			var tt = toSeconds(nA[0]+':'+nA[1]+':'+nA[2]);
			var st = getServerTime();
			aClock = tt > st ? tt-st: 86400+tt-st;
			aClock += Math.round((Date.now())/1000);
		}
	}
	RB_setValue(GMcookieID + 'AC', aClock);
	showAWake();
}
function showAWake () {
	var awD = $g(allIDs[28]);
	if( ! (awD) ) return;
	var aClock = parseInt(RB_getValue(GMcookieID + 'AC','0'));
	awD.innerHTML = '';
	if( aClock > 0 ) {
		var dTime = aClock - Math.round((Date.now())/1000);
		var color = dTime < 0 ? 'red': 'black';
		if( dTime < 0 ) dTime = 0;
		timerB3[aClockTimer] = new Object();
		timerB3[aClockTimer].time = dTime;
		timerB3[aClockTimer].obj = $eT('SPAN',dTime, 3,[['style','margin:0px 10px;color:'+color+';']]);
		awD.appendChild(timerB3[aClockTimer].obj);
	} else awD.appendChild($ee('SPAN','--:--',[['title','click me']]));
}

function addSpeedAndRTSend ( iBl, href ) {
	var mLinks = $xf('.//a[contains(@href, "' + (typeof href == 'undefined' ? "karte.php?" : "position_details.php?") + '")]', 'r', (typeof iBl == 'undefined' ? cont : iBl));
	for( var j = 0; j < mLinks.snapshotLength; j++ ) {
		var existT = $gc(allIDs[29],mLinks.snapshotItem(j));
		if( existT.length > 0 ) continue; else mLinks.snapshotItem(j).appendChild($e('SPAN',[['class',allIDs[29]]]));
		linkHint(mLinks.snapshotItem(j));
		distanceTooltip(mLinks.snapshotItem(j),1);
		sendResTropAdd(mLinks.snapshotItem(j), 1);
	}
	if (href) addRefIGM(iBl);
}

function bigQuickLinks () {
	var bigIcon = [ // [type (true-id, false-ref), value, additional, img_ID, Dict, Dict additionnal, Background]
		[false, '/build.php?id=39&gid=16', '', 0, 6, 0, 0], // RP
		[true, 3, '&gid=21', 3, 10, 0, 1], // Workshop
		[true, 0, '&gid=17', 4, 7, 0, 1], // Market
		[false, 'alliance', '', 6, 1, 0, 2], // Ally
		[true, 1, '&gid=19', 1, 8, 0, 3], // Barrack
		[true, 2, '&gid=20', 2, 9, 0, 4], // Stable
		[true, 0, '&t=1', 5, 7, 11, 4], // Market in
		[false, 'alliance/reports', '', 7, 1, 12, 5], // Ally attack
		[true, 5, '&gid=29', 1, 24, 0, 3], // Great Barrack
		[true, 6, '&gid=30', 2, 25, 0, 4], // Great Stable
		[true, 7, '&gid=46', 2, 26, 0, 4] // Hospital
	];
	//icons 0-RP, 1-workshop, 2-market, 3-ally, 4-barrack, 5-stable, 6-market_in, 7-ally_attack, 8-great_barracks, 9-great_stable
	//dorf2 0-market, 1-barracks, 2-stable, 3-workshop, 4-Tournament Square, 5-Great Barracks, 6-Great Stable, 7-Hospital
	var t = 0;
	var tt = [];
	for( var t = 0; t < bigIcon.length; t++) {
		tt[t] = bigIcon[t][4] > 0 ? RB.dictionary[bigIcon[t][4]] : '';
		if( bigIcon[t][5] > 0 ) tt[t] += ', ' + RB.dictionary[bigIcon[t][5]];
	}

	function CreateBigLinkButton (strBuilding, iNo, img) {
		if (iNo != 10) var imgC = img.cloneNode(true); else imgC = img;
		if (iNo == 8) { imgC.style.height = '20px'; }
		if (iNo == 9) { imgC.style.height = '23px'; }
		var pos = '';
		if (iNo == 8 || iNo == 9 || iNo == 10) { pos = RB.village_Dorf2[bigIcon[iNo][1]] != 0 ? '' : 'visibility:hidden;' }
		var BigLinkButton = $e('a',[['title',tt[iNo]],['class','layoutButton buttonFramed withIcon round ' + strBuilding + ' green ' + (RB.village_Dorf2[bigIcon[iNo][1]] != 0 ? '' : 'disabled')],['style',pos]]);
		//if (iNo!=0 && iNo!=8 && iNo!=9 && RB.village_Dorf2[bigIcon[iNo][1]] != 0) {
		//	BigLinkButton.setAttribute('onmouseenter', "Travian.Game.Layout.loadLayoutButtonTitle(this, 'activeVillage', '"+strBuilding+"'); this.removeAttribute('onmouseenter')");
		//}
		BigLinkButton.appendChild(imgC);
		if( bigIcon[iNo][0] ) {
			if( RB.village_Dorf2[bigIcon[iNo][1]] != 0 ) { BigLinkButton.href = "/build.php?id="+RB.village_Dorf2[bigIcon[iNo][1]]+bigIcon[iNo][2]; }
		} else { BigLinkButton.href = bigIcon[iNo][1]; }
		if (iNo == 8 || iNo == 9) { BigLinkButton.appendChild($e('img', [['class','productionBoost'],['src','/img/x.gif'],['style','position:absolute;'+docDir[0]+':20px;top:4px;z-index:1000']])); }
		if (iNo >= 8) { BigLinkButton.style.marginLeft = "5px"; }
		return BigLinkButton;
	}

	var sidebarBoxActiveVillage = $g('sidebarBoxActiveVillage');
	var bigIconsHeader = $gc('buttonsWrapper', sidebarBoxActiveVillage)[0];
	var bigIconsFooter = $gc('content', sidebarBoxActiveVillage)[0];
	var childrenB = $gt('a',bigIconsHeader);
	var imgs = [];

	for( var j = 0; j < childrenB.length; j++ ) {
		imgs[j] = $gt('svg',childrenB[j])[0];
	}
	imgs[4] = $gt('svg',$g('sidebarBoxVillagelist'))[0];
	imgs[4].style.width = '24px';

	imgs[5] = $e('i', [['class','healTime_medium'],['style','filter: grayscale(100%);']]);

	if (childrenB[0].className.search('green') == -1 ) { //Plus account active
		for( var j = 0; j < childrenB.length; j++ ) {
			childrenB[j].style.display = "none";
		}
		bigIconsHeader.insertBefore(CreateBigLinkButton('workshop',1,imgs[3]), bigIconsHeader.firstChild);
		bigIconsHeader.insertBefore(CreateBigLinkButton('stable',5,imgs[2]), bigIconsHeader.firstChild);
		bigIconsHeader.insertBefore(CreateBigLinkButton('barracks',4,imgs[1]), bigIconsHeader.firstChild);
		bigIconsHeader.insertBefore(CreateBigLinkButton('market',2,imgs[0]), bigIconsHeader.firstChild);
		if( RB.Setup[16] != 0 ) { bigIconsHeader.insertBefore(CreateBigLinkButton('overview',0,imgs[4]), bigIconsHeader.firstChild); }			
	} else {
		plusAccount = true;
		if( RB.Setup[16] != 0 ) { bigIconsHeader.insertBefore(CreateBigLinkButton('overview',0,imgs[4]), bigIconsHeader.firstElementChild) }
		for( var j = 0; j < childrenB.length; j++ ) {
			// fix links for Plus accounts
			childrenB[j].href = childrenB[j].href.replace('?gid=17', "?id=" + RB.village_Dorf2[bigIcon[2][1]]+bigIcon[2][2]);
			childrenB[j].href = childrenB[j].href.replace('?gid=19', "?id=" + RB.village_Dorf2[bigIcon[4][1]]+bigIcon[4][2]);
			childrenB[j].href = childrenB[j].href.replace('?gid=20', "?id=" + RB.village_Dorf2[bigIcon[5][1]]+bigIcon[5][2]);
			childrenB[j].href = childrenB[j].href.replace('?gid=21', "?id=" + RB.village_Dorf2[bigIcon[1][1]]+bigIcon[1][2]);
		}
	}

	var extraBtns = $e('div', [['class','buttonsWrapper'],['style','display: flex; flex-direction: row; justify-content: flex-end; margin: 0 25px -30px;']]);
	bigIconsFooter.appendChild(extraBtns);
	extraBtns.appendChild(CreateBigLinkButton('barracks',8,imgs[1]));
	extraBtns.appendChild(CreateBigLinkButton('stable',9,imgs[2]));
	extraBtns.appendChild(CreateBigLinkButton('hospital',10,imgs[5]));
}

function karteDistance () {
	var contXY = offsetPosition( cont );
	contRight = ltr ? contXY[0] + cont.clientWidth : contXY[0];
	contTop = contXY[1];
	karteDistance4();
}

var tileDFL = true;
var activeTip = '';
function karteDistance4 () {
	var tipE = $g(windowID[2]);
	if( tipE ) tipE.parentNode.removeChild(tipE);
	var vilView = $g('tileDetails');
	if( vilView ) {
		if( tileDFL ) {
			addRefIGM('tileDetails');
			troopsOasis( vilView );
			viewMessageIWK( vilView );
			linkOnT4Karte( vilView );
		}
		tileDFL = false;
	} else {
		tileDFL = true;
		var tipE = document.querySelectorAll('[data-tippy-root]');
		var ttD = $g(allIDs[3]);
		if( tipE.length > 0 && ! ttD ) {
			var coords = $gc('coordinatesWrapper',tipE[0]);
			if( coords.length > 0 ) {
				var tipC = getVidFromCoords(coords[0].innerHTML);
				if( tipC > 0 ) {
					var newTip = getVTip(tipC);
					if( newTip != activeTip ) {
						activeTip = newTip;
						if( newTip != '' ) {
							var titleElem = $gc('title elementTitle',tipE[0])[0];
							titleElem.appendChild($ee('span',newTip,[['style','color:#77FF77;margin:0px 10px;']]));
						}
					}
					var dTTK = showAllTTime(0, tipC, RB.village_Var[1]);
					$at(dTTK, [['style','background-color:#fef7e7;']]);
					windowID[2] = makeFloat( dTTK, (ltr?contRight+5:contRight-200), contTop);
				}
			}
		}
	}
	setTimeout(karteDistance4, 1000);
}

function linkOnT4Karte ( vV ) {
	var vilView = vV || cont;
	var h1 = $gt('H1',vilView)[0];
	if( h1 ) {
		var spanLast = $gt('SPAN',h1);
		if( spanLast.length == 0 ) return;
		spanLast = spanLast[spanLast.length-1];
		if( RB.Setup[12]>0 ) {
			var xy = getVidFromCoords(h1.innerHTML);
			if( typeof flinks[xy] == 'undefined' ) {
				var al = $a('(+)',[['href',jsVoid],['title',gtext('addcur')],['style','margin:0px 10px;']]);
				al.addEventListener("click", addlinkT4, true);
			} else var al = $ee('SPAN',flinks[xy],[['style','color:#00CB00;margin:0px 10px;']]);
			h1.appendChild(al);
		}
		if( /position_details/.test(crtPath) ) return;
		var ln = $gt('A',$gc('detailImage',vilView)[0]);
		if( ln.length > 0 ) {
			var xy = id2xy(getVid(ln[0].getAttribute('href')));
			var nLink = $a('->',[['href','position_details.php?x='+xy[0]+'&y='+xy[1]],['style','margin:0px 5px;']]);
			h1.appendChild(nLink);
		}
	}
}

function rbNotes () {
	if( closeWindowN(3) ) return;

	function saveNotes () {
		RB_setValue(GMcookieID + 'notes',textNB.value);
		alert( 'saved' );
	}

	var nSize = [[40,15],[55,20],[70,30],[60,45],[40,8],[30,34]];
	var nText = RB_getValue(GMcookieID + 'notes','');
	var newNB = $e('TABLE');
	var textNB = $ee('TEXTAREA',nText,[['cols',nSize[RB.Setup[35]][0]],['rows',nSize[RB.Setup[35]][1]],['style', 'background-image: url('+img_underline+');background-repeat: repeat;']])
	newNB.appendChild($ee('TR',$c(textNB)));
	var saveB = $e('IMG',[['src',img_save]]);
	saveB.addEventListener('click', saveNotes, false);
	newNB.appendChild($ee('TR',$c(saveB,[['style','text-align: center']])));
	windowID[3] = makeFloatD( newNB, 5 );
}

function addRefIGM ( idBlock ) {
	if( RB.Setup[18] == 0 && RB.Setup[19] == 0 ) return;
	var idB = idBlock || pageElem[1];
	var mLinks = $xf('.//a[contains(@href, "/profile/")]', 'l', $g(idB));
	for( var j = 0; j < mLinks.snapshotLength; j++ ) {
		var al = mLinks.snapshotItem(j);
		var uid = al.getAttribute('href').match(/profile\/(\d+)/);
		if( uid ) uid = uid[1]; else continue;
		if( uid != userID && uid != 1 ) {
			al.style.display = 'inline';
			if( RB.Setup[19] > 0 ) al.parentNode.insertBefore($ee('A',trImg(allIDs[37]),[['href',userActivityServers( RB.Setup[19], uid, true )[1]],['style','width:18px;'],['target','_blank']]), al.nextSibling);
			if( RB.Setup[18] > 0 ) al.parentNode.insertBefore($ee('A',trImg(allIDs[36]),[['href','/messages/write?to='+uid],['style','width:18px;']]), al.nextSibling);
		}
	}
	if( RB.Setup[19] > 0 ) {
		var mLinks = $xf('.//a[contains(@href, "alliance/")]', 'r', $g(idB));
		for( var j = 0; j < mLinks.snapshotLength; j++ ) {
			var al = mLinks.snapshotItem(j);
			var uid = al.getAttribute('href').match(/alliance\/(\d+)/);
			if( uid ) uid = uid[1]; else continue;
			if (al.getAttribute('class')) if (al.getAttribute('class').indexOf("tabItem") > -1) continue;
			if( uid > 0 ) {
				al.parentNode.insertBefore($ee('A',trImg(allIDs[37]),[['href',userActivityServers( RB.Setup[19], uid, false )[1]],['target','_blank']]), al.nextSibling);
			}
		}
	}
}

function parseAlly () {
	if( RB.dictFL[12] == 0 ) {
		var tm = $xf('.//a[@href="/alliance/reports"]','f',cont);
		if( tm ) {
			RB.dictionary[12] = tm.innerHTML.onlyText().trim();
			saveCookie( 'Dict', 'dictionary' );
			RB.dictFL[12] = 1;
			saveCookie( 'DictFL', 'dictFL' );
		}
	}
}

function addSpeedRTSendMessageInLLinks() {
	var llinks = $g('llist');
	if( ! llinks ) return;
	if( RB.Setup[15] == 1 ) {
		var mLinks = $xf('tbody//a[contains(@href, "karte.php?")]', 'r', llinks);
		for( var j = 0; j < mLinks.snapshotLength; j++ ) {
			distanceTooltip(mLinks.snapshotItem(j),1);
			sendResTropAdd(mLinks.snapshotItem(j), 1);
		}
	}
	if( RB.Setup[15] == 1 ) {
		var mLinks = $xf('tbody//a[contains(@href, "profile")]', 'r', llinks);
		for( var j = 0; j < mLinks.snapshotLength; j++ ) {
			var al = mLinks.snapshotItem(j);
			var uid = al.getAttribute('href').match(/profile\/(\d+)/)[1];
			al.appendChild($ee('A',trImg(allIDs[36]),[['href','/messages/write?to='+uid]]));
		}
	}
}

function villageHintEdit () {
	function editVHint () {
		newVHint = prompt(gtext("name2"), vName);
		if( newVHint == null ) return;
		if( newVHint.length > 20 ) newVHint = newVHint.substring(0,20);
		if( RB.vHint[village_aid] != newVHint ) {
			RB.vHint[village_aid] = newVHint;
			saveOVCookie('vHint', RB.vHint);
			vName = newVHint;
			vNFC.innerHTML = vName;
		}
	}
	var vNF;
	vNF = $g('villageName');
	vNF.style.display = 'inline-block';
	vNF.style.overflow = 'initial';
	var vName = RB.vHint[village_aid] || '';
	var vNFC = $ee('SPAN',vName,[['style','color:'+vHColor+';font-size:10px;']]);
	var vNFA = $ee('SPAN',vNFC,[['style','white-space:normal']]);
	var vNFe = trImg(allIDs[38],gtext('name2'));
	vNFe.addEventListener('click', editVHint, false);
	vNFA.appendChild(vNFe);
	vNF.parentNode.insertBefore(vNFA, vNF.nextSibling);
}

function villageHintDorf3 () {
	var newdidVH = [];
	for( i = 0; i < villages_id.length; i++ )
		newdidVH[linkVSwitch[i].match(/newdid=(\d+)/i)[1]] = villages_id[i];
	var mLinks = $xf('.//a[contains(@href, "newdid=")]', 'r', cont);
	for( var j = 0; j < mLinks.snapshotLength; j++ ) {
		var mLID = mLinks.snapshotItem(j).getAttribute('href').match(/newdid=(\d+)/)[1];
		linkHint( mLinks.snapshotItem(j), newdidVH[mLID] );
	}
}

function linkHint ( aLink, vID ) {
	try {
		var avID = vID || getVid(aLink.getAttribute('href'));
		if( isNaN(avID) ) return;
	} catch(e) { return; }
	if( RB.vHint[avID] != undefined ) {
		aLink.appendChild($ee('SPAN',' '+RB.vHint[avID],[['style','color:'+vHColor+';']]));
	} else {
		var ht = getVTip(avID);
		if( ht != '' ) {
			var ltext = aLink.innerHTML.onlyText().length;
			if( ltext < 20 )
				aLink.appendChild($ee('SPAN',' '+ht.substring(0,20-ltext),[['style','color:'+vHColor+';']]));
		}
	}
}

function setLC () {
	if( RB.Setup[1] > 0 ) return langs[RB.Setup[1]].match(/\((\w+)\)/)[1];
	lang = navigator.language;
	if( /^ar/i.test(lang) ) return 'ar';
	else if( /^bs/i.test(lang) || crtLang == 'ba' ) return 'bs';
	else if( /^bg/i.test(lang) ) return 'bg';
	else if( /^de/i.test(lang) ) return 'de';
	else if( /^fa/i.test(lang) ) return 'fa';
	else if( /^fr/i.test(lang) ) return 'fr';
	else if( /^hr/i.test(lang) || crtLang == 'hr' ) return 'hr';
	else if( /^hu/i.test(lang) ) return 'hu';
	else if( /^it/i.test(lang) ) return 'it';
	else if( /^pl/i.test(lang) ) return 'pl';
	else if( /^pt/i.test(lang) ) return 'pt';
	else if( /^ua/i.test(lang) || crtLang == 'ua' ) return 'ua';
	else if( /^ro/i.test(lang) ) return 'ro';
	else if( /^ru/i.test(lang) ) return 'ru';
	else if( /^sr/i.test(lang) ) return 'sr';
	else if( /^sv/i.test(lang) ) return 'sv';
	else if( /^tr/i.test(lang) ) return 'tr';
	else if( /^zh/i.test(lang) ) return 'zh';
	else if( /^vi/i.test(lang) ) return 'vi';
	else if( /^el/i.test(lang) || crtLang == 'gr' ) return 'el';
	else if( /^nl/i.test(lang) ) return 'nl';
	else return 'en';
}

function demolishSave () {
	var dem = $g('build');
	if( ! dem ) return;
	if( dem.getAttribute('class').indexOf('gid15') == -1 ) return;

	loadZVCookie('Dorf13','village_dorf13');
	var fl = false;
	var newCookie = [0];
	var t = 1;

	var dem = $g('demolish');
	if( ! dem ) {
		if( RB.village_dorf13[0] != 0 ) fl = true;
	} else {
		if( dem.tagName == 'TABLE' ) {
			var descr = dem.rows;
			for( var i = 0; i < descr.length; i++ ) {
				newCookie[0]++;
				var td = descr[i].cells;
				newCookie[t++] = td[1].innerHTML.onlyText().trim();
				if( td.length < 4 ) {
					newCookie[t++] = 0;
					newCookie[t++] = '';
				} else {
					newCookie[t++] = Math.round(RunTime[0]/1000) + toSeconds(td[2].innerHTML);
					newCookie[t++] = td[3].innerHTML.onlyText().trim();
				}
			}
		}
		fl = true;
	}
	if( fl ) saveVCookie('Dorf13',newCookie,1);
}

function calcAllTroops() {
	if( RB.Setup[10] == 0 ) return;
	var sumT = [0,0,0,0,0,0,0,0,0,0,0];
	var sumC = 0;
	var oFL = true;
	var uFL = true;
	var townTables = $xf('.//table[.//td[@class="role"]/a[contains(@href,"'+village_aid+'")]]','l',cont);
	if( townTables.snapshotLength == 0 ) return;
	var ownTable = false;
	for ( var i=0 ; i < townTables.snapshotLength; i++ ){
		var ttable = townTables.snapshotItem(i);
		uFL = (new RegExp("profile/"+userID)).test(ttable.rows[0].cells[1].innerHTML);
		if( oFL || ! uFL ) for( var t=0; t<10; t++ ) {
			var tC = parseInt(ttable.rows[2].cells[t+1].innerHTML);
			if( isFinite(tC) ) { sumT[t] += tC; sumC += troopInfo( parseInt(RB.Setup[2])*10+t+1, 9) * tC; }
		}
		if( oFL && uFL ) {
			ownTable = ttable;
			if( ttable.rows[2].cells.length > 11 ) {
				var tC = parseInt(ttable.rows[2].cells[t+1].innerHTML);
				if( isFinite(tC) ) {
					sumT[10] += tC; sumC += tC*6;
				}
			}
			oFL = false;
		}
	}
	if( ownTable ) {
		var sumRow = ownTable.rows[2].cloneNode(true);
		for( var t=sumRow.cells.length-1; t>0; t-- ) {
			sumRow.cells[t].innerHTML = sumT[t-1];
			if( sumT[t-1] > 0 ) sumRow.cells[t].removeAttribute('class');
		}
		sumRow.cells[0].innerHTML = gtext('total');
		var existT = $gc(allIDs[20],ownTable);
		if( existT.length > 0 ) ownTable.removeChild(existT[0]);
		ownTable.appendChild($ee('TBODY',sumRow,[['class',allIDs[20]]]));
		var cropC = $gc('r4',ownTable);
		if( cropC.length > 0 ) {
			i = $g(allIDs[29]);
			if( i ) i.parentNode.removeChild(i);
			cropC[0].parentNode.appendChild($ee('SPAN',' ('+ sumC +') ',[['id',allIDs[29]]]));
			//cropC[0].parentNode.firstElementChild.textContent += ' ('+ sumC +') ';
		}
	}
}

function scanTroopsData () {
	var m = 1;
	switch(parseInt(RB.Setup[45])) {
	  case 1:
		m = 1;
		break;
	  case 2:
		m = 2;
		break;
	  case 3:
		m = 2;
		break;
	  case 5:
		m = 2;
		break;
	  case 10:
		m = 4;
		break;
	}
	//Attack, Infantry defense, Cavalery defense, Wood, Clay, Iron, Crop, Speed, Carry, Upkeep
	RB.tropsI = [//Romans
				 //Legionnaire 					   Praetorian 						 Imperian 						   Equites Legati  				   Equites Imperatoris					 Equites Caesaris					   Battering ram					Fire Catapult					  Senator 									Settler
				 40,35,50,120,100,150,30,6*m,50,1, 30,65,35,100,130,160,70,5*m,20,1, 70,40,25,150,160,210,80,7*m,50,1, 0,20,10,140,160,20,40,16*m,0,2, 120,65,50,550,440,320,100,14*m,100,3, 180,80,105,550,640,800,180,10*m,70,4, 60,30,75,900,360,500,70,4*m,0,3, 75,60,10,950,1350,600,90,3*m,0,6, 50,40,30,30750,27200,45000,37500,4*m,0,5, 0,80,80,4600,4200,5800,4400,5*m,3000,1,
	             //Teutons
				 40,20,5,95,75,40,40,7*m,60,1, 10,35,60,145,70,85,40,7*m,40,1, 60,30,30,130,120,170,70,6*m,50,1,0, 10,5,160,100,50,50,9*m,0,1, 55,100,40,370,270,290,75,10*m,110,2, 150,50,75,450,515,480,80,9*m,80,3, 65,30,80,1000,300,350,70,4*m,0,3, 50,60,10,900,1200,600,60,3*m,0,6, 40,60,40,35500,26600,25000,27200,4*m,0,4, 10,80,80,5800,4400,4600,5200,5*m,3000,1,
				 //Gauls
				 15,40,50,100,130,55,30,7*m,35,1, 65,35,20,140,150,185,60,6*m,45,1, 0,20,10,170,150,20,40,17*m,0,2, 100,25,40,350,450,230,60,19*m,75,2, 45,115,55,360,330,280,120,16*m,35,2, 140,60,165,500,620,675,170,13*m,65,3, 50,30,105,950,555,330,75,4*m,0,3, 70,45,10,960,1450,630,90,3*m,0,6, 40,50,50,30750,45400,31000,37500,5*m,0,4, 0,80,80,4400,5600,4200,3900,5*m,3000,1,
				 //Nature http://t4.answers.travian.com/index.php?aid=109
				 10,25,20,0,0,0,0,20,0,1, 20,35,40,0,0,0,0,20,0,1, 60,40,60,0,0,0,0,20,0,1, 80,66,50,0,0,0,0,20,0,1, 50,70,33,0,0,0,0,20,0,2, 100,80,70,0,0,0,0,20,0,2, 250,140,200,0,0,0,0,20,0,3, 450,380,240,0,0,0,0,20,0,3, 200,170,250,0,0,0,0,20,0,3, 600,440,520,0,0,0,0,20,0,5, 
				 //Natars
				 20,35,50,0,0,0,0,0,0,0, 65,30,10,0,0,0,0,0,0,0, 100,90,75,0,0,0,0,0,0,0, 0,10,0,0,0,0,0,0,0,0, 155,80,50,0,0,0,0,0,0,0, 170,140,80,0,0,0,0,0,0,0, 250,120,150,0,0,0,0,0,0,0, 60,45,10,0,0,0,0,0,0,0, 80,50,50,0,0,0,0,0,0,0, 30,40,40,0,0,0,0,0,0,0, 
				 //Egyptians
				 10,30,20,45,60,30,15,7*m,15,1, 30,55,40,115,100,145,60,6*m,50,1, 65,50,20,170,180,220,80,7*m,45,1, 0,20,10,170,150,20,40,16*m,0,2, 50,110,50,360,330,280,120,15*m,50,2, 110,120,150,450,560,610,180,10*m,70,3, 55,30,95,995,575,340,80,4*m,0,3, 65,55,10,980,1510,660,100,3*m,0,6, 40,50,50,34000,50000,34000,42000,4*m,0,4, 0,80,80,5040,6510,4830,4620,5*m,3000,1,
				 //Huns
				 35,40,30,130,80,40,40,6*m,50,1, 50,30,10,140,110,60,60,6*m,30,1, 0,20,10,170,150,20,40,19*m,0,2, 120,30,15,290,370,190,45,16*m,75,2, 110,80,70,320,350,330,50,15*m,105,2, 180,60,40,450,560,610,140,14*m,80,3, 65,30,90,1060,330,360,70,4*m,0,3, 45,55,10,950,1280,620,60,3*m,0,6, 50,40,30,37200,27600,25200,27600,5*m,0,4, 10,80,80,6100,4600,4800,5400,5*m,3000,1,
				 //Spartans
				 50,35,30,110,185,110,35,6*m,60,1, 0,40,22,185,150,35,75,9*m,0,1, 40,85,45,145,95,245,45,8*m,40,1, 90,55,40,130,200,400,65,6*m,50,1, 55,120,90,555,445,330,110,16*m,110,2, 195,80,75,660,495,995,165,9*m,80,3, 65,30,80,525,260,790,130,4*m,0,3, 50,60,10,550,1240,825,135,3*m,0,6, 40,60,40,33450,30665,36240,13935,4*m,0,4, 10,80,80,5115,5580,6045,3255,5*m,3000,1];
	saveCookie('tropsI','tropsI');
	RB.dictFL[13] = 3;
	saveCookie( 'DictFL', 'dictFL' );
}

function getTroopNames() {
	function getTroopNamesFromTable(table) {
		if (!table) return;
		var tUnits = $gt("img",table);
		for (var i=0; i<tUnits.length-1; i++) {
			hn = Math.floor(parseInt(tUnits[i].getAttribute('class').match(/\d+/)[0]));
			RB.dictTR[hn] = tUnits[i].alt;
			RB.trFL[hn] = 1;
		}
		saveCookie('trFL','trFL');
		saveCookie('DictTR','dictTR');
	}
	getTroopNamesFromTable($g("troops")); //RallyPoint
	getTroopNamesFromTable($g("attacker")); //Reports
	getTroopNamesFromTable($g("defender")); //Reports
}

function troopInfo( tt, val ) {
	if( RB.dictFL[13] < 3 ) return 0;
	if( triFL ) {
		loadCookie( 'tropsI', 'tropsI' );
		triFL = false;
	}
	return parseInt(RB.tropsI[(tt-1)*10+val]);
}

function gti( p1, p2, p3 ) {
	return (troopInfo(parseInt(p1),p2)*p3).NaN0();
}
function troopsDorf1 () {
	if( RB.Setup[20] == 0 ) return;
	var tinfoT = $g('troops');
	if( ! tinfoT ) return;
	tiImg = trImg(allIDs[47]);
	tiImg.addEventListener("mouseover", showTroopsITT, false);
	tiImg.addEventListener("mouseout", removeTooltip, false);
	tinfoT.rows[0].cells[0].appendChild(tiImg);
}
function showTroopsITT () {
	var ITTb = $e('TBODY');
	var newITT = $ee('TABLE',ITTb,[['class',allIDs[7]]]);
	loadZVCookie('Dorf12','village_dorf12');
	var tt = 0;
	var tc = 0;
	var ti = [0,0,0,0,0];
	var ts = [0,0,0,0,0];
	var hp = parseInt(RB.dictFL[17]);
	for( var i = 0; i < RB.village_dorf12[0]; i++ ) {
		tn = RB.village_dorf12[i*2+1];
		tt = parseInt(tn);
		tc = parseInt(RB.village_dorf12[i*2+2]);
		var atfl = ( (tt%10) < 7 && troopInfo( tt, 9 ) > 1 ) ? false: true;
		if (tn === 'hero') {
			atfl = parseInt(RB.dictFL[18]) == 1 ? false : true;
		}
		ti = [atfl?gti(tt,0,tc):0, atfl?0:gti(tt,0,tc), gti(tt,1,tc), gti(tt,2,tc), gti(tt,9,tc)];
		if( tt > 30 && tt < 51) ti[0]=0;
		if (tn === 'hero') {
			parseInt(RB.dictFL[18]) == 1 ? ti=[0,hp,0,hp,6] : ti=[hp,0,hp,0,6];
		}
		ts = [atfl?ts[0]+ti[0]:ts[0], atfl?ts[1]:ts[1]+ti[1], ts[2]+ti[2], ts[3]+ti[3], ts[4]+ti[4]];
		ITTb.appendChild($em('TR',[$c(trImg('unit u'+tn)),$c(humanRF(ti[0])),$c(humanRF(ti[1])),$c(humanRF(ti[2])),$c(humanRF(ti[3])),$c(humanRF(ti[4]))]));
	}
	var tHead = $ee('THEAD',$em('TR',[$c('&#931;'),$c(humanRF(ts[0])),$c(humanRF(ts[1])),$c(humanRF(ts[2])),$c(humanRF(ts[3])),$c(humanRF(ts[4]))]));
	tHead.appendChild($em('TR',[$c(''),$em('TD',[trImg('att_all'),trImg('unit u13')]),$em('TD',[trImg('att_all'),trImg('unit u16')]),$c(trImg('def_i')),$c(trImg('def_c')),$c($e('i',[['class','r5']]))]));
	newITT.appendChild(tHead);
	makeTooltip(newITT);
}

function getTroopsInOasis ( vf ) {
	var troopsTR = $xf('.//tr[td/img[contains(@class, "unit u")]]','l',vf );
	if( troopsTR.snapshotLength < 1 ) return false;
	var ITTb = $e('TBODY');
	var newITT = $ee('TABLE',ITTb,[['class',allIDs[7]]]);
	var ti = [0,0,0,0];
	var ts = [0,0,0,0];
	for( var i=0; i<troopsTR.snapshotLength; i++ ) {
		tt = parseInt($gt('IMG',troopsTR.snapshotItem(i))[0].getAttribute('class').match(/\d+/)[0]);
		tc = toNumber(troopsTR.snapshotItem(i).cells[1].innerHTML);
		ti = [gti(tt,1,tc), gti(tt,2,tc), tc, gti(tt,9,tc)];
		ts = [ts[0]+ti[0], ts[1]+ti[1], ts[2]+ti[2], ts[3]+ti[3]];
		ITTb.appendChild($em('TR',[$c(trImg('unit u'+tt)),$c(humanRF(ti[0])),$c(humanRF(ti[1])),$c(humanRF(ti[2])),$c(humanRF(ti[3]))]));
	}
	var tHead = $ee('THEAD',$em('TR',[$c('&#931;'),$c(humanRF(ts[0])),$c(humanRF(ts[1])),$c(humanRF(ts[2])),$c(humanRF(ts[3]))]));
	tHead.appendChild($em('TR',[$c(''),$c(trImg('def_i')),$c(trImg('def_c')),$c(trImg('itemCategory itemCategory_cage')),$c($e('i',[['class','r5']]))]));
	newITT.appendChild(tHead);
	return newITT;
}
function troopsOasis ( vfS ) {
	if( RB.Setup[20] == 0 ) return;
	var vf = vfS || cont;
	var newITT = getTroopsInOasis(vf);
	var i = $gt('H4',vf);
	if(i && newITT) {
		addToolTip(newITT,i[1]);
		i[1].appendChild(oasisKirilloid(vf));
	}
}

function a2bInfo () {
	var ts = [0,0,0,0,0,0];
	var inputs = $gt('INPUT',cont);
	for( var i=0; i<inputs.length; i++ ) {
		if( /t\d+/.test(inputs[i].getAttribute('name')) ) {
			var rtt = parseInt(inputs[i].getAttribute('name').match(/t(\d+)/)[1]);
			var tt = rtt+(parseInt(RB.Setup[2])*10);
			var tc = parseInt(inputs[i].value);
			if( isNaN(tc) ) continue;
			var atfl = ( rtt < 7 && troopInfo( tt, 9 ) > 1 ) ? false: true;
			if (rtt == 11) { //hero
				var hp = parseInt(RB.dictFL[17]);
				var hm = parseInt(RB.dictFL[18]);
				ts = [hm?ts[0]:ts[0]+hp, hm?ts[1]+hp:ts[1], ts[2]+hp, ts[3]+hp, ts[4], ts[5]+6];
			} else {
				ts = [atfl?ts[0]+gti(tt,0,tc):ts[0], atfl?ts[1]:ts[1]+gti(tt,0,tc), ts[2]+gti(tt,1,tc), ts[3]+gti(tt,2,tc), ts[4]+gti(tt,8,tc), ts[5]+gti(tt,9,tc)];
			}
		}
	}
	var rP = $g(allIDs[21]);
	if( rP ) rP.parentNode.removeChild(rP);
	rP = $e('P',[['id',allIDs[21]],['style','max-width:50%;']]);
	rT = $e('TABLE',[['class',allIDs[7]]]);
	rT.appendChild($em('TR',[$c(''),$c(trImg('unit u13')),$c(trImg('unit u16'))]));
	rT.appendChild($em('TR',[$c(trImg('att_all')),$c(humanRF(ts[0])),$c(humanRF(ts[1]))]));
	rT.appendChild($em('TR',[$c(trImg('def1')),$c(humanRF(ts[2])),$c(humanRF(ts[3]))]));
	rT.appendChild($ee('TR',$c('',[['colspan','3']])));
	rT.appendChild($em('TR',[$c($e('i',[['class','r5']])),$c(humanRF(ts[5]),[['colspan','2']])]));
	rT.appendChild($em('TR',[$c(trImg(allIDs[33])),$c(humanRF(ts[4]),[['colspan','2']])]));
	rP.appendChild(rT);
	if( $g('ok') ) $g('ok').parentNode.insertBefore(rP, $g('ok').parentNode.lastElementChild);
	else if( $g('raidListSlot') ) insertAfter(rP, $g('raidListSlot'));
}

function show_alert () {
	var nt = Date.now();
	if( lastAlert > nt-5e3 ) return;
	var audioT = $g(allIDs[22]);
	if( audioT ) audioT.parentNode.removeChild(audioT);
	switch (parseInt(RB.Setup[28])) {
		case 1: // alert
			alert('ding ding');
			break;
		case 2: // HTML5 audio
			document.body.appendChild($e('AUDIO',[['id',allIDs[22]],['src',RB.Setup[29]],['autoplay','true']]));
			break;
	}
	lastAlert = nt;
}

function testAudio () {
	var sW = $g(windowID[0]);
	if( ! sW ) return;
	lastAlert = 0;
	RB.Setup[28] = $gn(28)[0].value;
	RB.Setup[29] = $gn(29)[0].value;
	show_alert();
}

/************************* begin test zone ***************************/

function crannyCalc () {
	var allB = $gc('number',cont);
	if( allB.length == 0 ) allB = $gt('B',cont);
	var cap = parseInt(allB[0].innerHTML);
	if( isNaN(cap) ) return;
	var s = parseInt(RB.Setup[24])/100;
	$at(allB[0],[['title',Math.round(cap*s)]]);
	var newT = $e('TABLE',[['class',allIDs[7]],['style','margin:2px 30px;']]);
	var t = timerB.length;
	for( var i=0; i<4; i++ ) {
		var pc = resNow[i] < cap ? Math.round(resNow[i]/cap*100) : 100;
		var color = 'red';
		if( incomepersecond[i] > 0 && pc < 100 ) {
			timerB[t] = new Object();
			timerB[t].time = Math.round((cap-resNow[i])/incomepersecond[i]);
			timerB[t].obj = $eT('TD',timerB[t].time, 0);
			var ct = timerB[t++].obj;
			color = 'green';
		} else var ct = $c('--:-- ');
		var ca = $c((resNow[i]-cap),[['style','color:'+color+';']]);
		color = 'red';
		if( incomepersecond[i] > 0 && pc < parseInt(RB.Setup[24]) ) {
			timerB[t] = new Object();
			timerB[t].time = Math.round((cap*s-resNow[i])/incomepersecond[i]);
			timerB[t].obj = $eT('TD',timerB[t].time, 0,[['style','background-color:yellow;']]);
			var ct8 = timerB[t++].obj;
			color = 'green';
		} else ct8 = $c('--:-- ',[['style','background-color:yellow;']]);
		var ca8 = $c(Math.round(resNow[i]-cap*s),[['style','background-color:yellow;color:'+color+';']]);
		newT.appendChild($em('TR',[$c($e('i',[['class','r'+(i+1)]])),$c(pc+'%'),ct8,ca8,ct,ca]));
	}
	cont.appendChild(newT);
}

function buildDispatcher () {
	var build = $g('build');
	if( !(build) ) return;
	var gid = build.getAttribute('class');
	gid = gid.split(/\s/)[0];
	if( gid == 'gid17' ) {
		setTimeout(marketSend,700); setTimeout(marketSumm,700); marketOffer(); marketBuy(); setTimeout(marketTradeRoutes,700); stopRP();
		var gold = $xf('//div[@class="npcMerchant"]//button[contains(@class, "gold")]','l',cont);
		for( var i = 0; i < gold.snapshotLength; i++ ) {
			gold.snapshotItem(i).addEventListener('click', function(x) { setTimeout(npcForTroops,500); }, 0);
		}
	} else if( gid == 'gid15' ) {
		demolishSave();
	} else if( gid == 'gid16' ) {
		if( ! /tt=(99|100)/.test(crtPath) && !($g('raidList')) ) {
			stopRP(); incomeResourcesInRP(); detectNameAttaker(); calcAllTroops(); rpFL = true;
			if( $gc('a2b').length > 0 ) { fillXYtoRP(); rpDefaultAction(); getTroopNames(); }
		} else {
			goldClubInfo();
		}
	} else if( gid == 'gid23' ) {
		crannyCalc();
	} else if( gid == 'gid19' || gid == 'gid20' || gid == 'gid21' || gid == 'gid25' || gid == 'gid26' || gid == 'gid29'|| gid == 'gid30' || gid == 'gid36' || gid == 'gid46' || gid == 'gid48' || gid == 'gid49' ) {
		calcTroopCost();
		if( RB.Setup[11] > 0 ) calcNPCtroops();
	} else if( gid == 'gid11' ) {
		if( RB.dictFL[20] == 0 ) {
			var TM = $g("build_value").rows[0].cells[0].innerHTML.replace(/:/g, "");
			RB.dictionary[21] = TM;
			saveCookie( 'Dict', 'dictionary' );
			RB.dictFL[20] = 1;
			saveCookie( 'DictFL', 'dictFL' );
		}
	} else if( gid == 'gid13' ) {
		calcUnitUpgrade();
	}
	underProgressSave(gid);
}

var normalizeProductionCount = 8;
function normalizeProduction () {
	if( RB.Setup[22] < 1 ) return;
	var resT = $g('production');
	if( !(resT) ) return;
	var mm = normalProductionCalc ( income );
	$at(resT.rows[1+mm[0]], [['style','color:green;']]);
	$at(resT.rows[1+mm[1]], [['style','color:red;']]);
}

// by Mike_Sh
function normalProductionCalc ( ires ) {
	var choise = RB.Setup[22] == 1 ? 0: (RB.Setup[22]-1)+RB.Setup[2]*normalizeProductionCount;
	var vNormal = [[10,12,8,6],  // нормальное развитие (производство ресов)/normal development (production resources)
// Romans //
	[12,10,15,3],// Legionnaire
	[10,13,16,7],// Praetorian
	[15,16,21,8],// Imperian
	[14,16,2,4],// Equites Legati
	[55,44,32,10],// Equites Imperatoris
	[55,64,80,18],// Equites Caesaris
	[90,36,50,7],// Battering Ram
	[95,135,60,9],// Fire Catapult
// Teutons //
	[95,75,40,40],// Clubswinger
	[145,70,85,40],// Spearman
	[13,12,17,7],// Axeman
	[16,10,5,5],// Scout
	[74,54,58,15],// Paladin
	[90,103,96,16],// Teutonic Knight
	[100,30,35,7],// Ram
	[90,120,60,6],// Catapult
// Gauls //
	[20,26,11,6],// Phalanx
	[28,30,37,12],// Swordsman
	[17,15,2,4],// Pathfinder
	[35,45,23,6],// Theutates Thunder
	[36,33,28,12],// Druidrider
	[100,124,135,34],// Haeduan
	[190,111,66,15],// Ram
	[96,145,63,9],// Trebuchet
// Nature //
	[],[],[],[],[],[],[],[],
// Natars //
	[],[],[],[],[],[],[],[],
// Egyptians //
	[45,60,30,15],// Slave Militia
	[23,20,29,12],// Ash Warden
	[17,18,22,8],// Khopesh Warrior
	[17,15,2,4],// Sopdu Explorer
	[36,33,28,12],// Anhur Guard
	[45,56,61,18],// Resheph Chariot
	[199,115,68,16],// Ram
	[98,151,66,10],// Stone Catapult
// Huns //
	[13,8,4,4],// Mercenary
	[14,11,6,6],// Bowman
	[17,15,2,4],// Spotter
	[58,74,38,9],// Steppe Rider
	[32,35,33,5],// Marksman
	[45,56,61,14],// Marauder
	[106,33,36,7],// Ram
	[95,128,62,6],// Catapult
// Spartans //
	[110,185,110,35],// Hoplite
	[185,150,35,75],// Sentinel
	[145,95,245,45],// Shieldsman
	[130,200,400,65],// Twinsteel Therion
	[555,445,330,110],// Elpida Rider
	[660,495,995,165],// Corinthian Crusher
	[525,260,790,130],// Ram
	[550,1240,825,135]];// Catapult

	var vPN = [];
	for( var i = 0; i < 4; i++ ) {
		vPN[i] = ires[i] / vNormal[choise][i];
	}
	var minI = 0, maxI = 0;
	var minVal = vPN[0], maxVal = vPN[0];
	for ( i=0; i<(choise?3:4); i++){
		if ( minVal > vPN[i]) {
			minVal = vPN[i];
			minI = i;
		}
		if ( maxVal < vPN[i]) {
			maxVal = vPN[i];
			maxI = i;
		}
	}
	return [maxI,minI];
}

function speedBids () {
	if ( parseInt(RB.Setup[23]) == 0 ) return;
	function speedBidsSub (node) {
		var bform = $gc('auctionDetails',node)[0];
		if( !(bform) ) return;
		var curBid = parseInt($gt('SPAN',bform)[0].textContent);
		$gt('INPUT',bform)[0].value = curBid+parseInt(RB.Setup[23]);
	}
	var target = $g('heroAuction');
	if (target) {
		var MutationObserver = window.MutationObserver;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'childList') {
					if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].nodeName === 'TR' ) {
						speedBidsSub(mutation.addedNodes[0]);
					}
				}
			});
		});
		var config = { childList: true, subtree: true };
		observer.observe(target, config);
	} else {
		var bform = $gc('auctionDetails',cont)[0];
		if( !(bform) ) return;
		var curBid = parseInt($gt('SPAN',bform)[0].innerHTML);
		$gn('maxBid',bform)[0].value = curBid+parseInt(RB.Setup[23]);
	}
}

var ajaxToken=false;
function getAjaxToken () {
	if( ajaxToken ) return ajaxToken;
	var aText = $xf(".//script[contains(text(),'\".slice')]",'f',document.head);
	if( aText ) { 
		ajaxToken = aText.textContent.match(/\"(.+)\".slice/)[1];
		return ajaxToken;
	}
	var aText = $xf('//script[contains(text(),"atob(")]');
	if( aText ) {
		ajaxToken = aText.textContent.match(/atob\('(.+)'\)/)[1];
		ajaxToken = atob(ajaxToken);
		ajaxToken = ajaxToken.match(/'(.+)'/)[1];
		return ajaxToken;
	}
	return ajaxToken;
}

function cropFind () {
	if( RB.Setup[26] == 0 ) return;
	getAjaxToken();

	function cropFindReq2 () {
		if( iaFL ) return;
		neFL = true;
		cropFindReq();
	}
	function cropFindReq () {
		if( iaFL ) return;
		iaFL = true;
		if( $g(allIDs[18]) ) cont.removeChild($g(allIDs[18]));
		cont.appendChild($ee('DIV',$ee('span','searching...',[['id',allIDs[0]]]),[['id',allIDs[18]]]));
		ss = $g(allIDs[0],cont);
		setInterval(function(x){return function(){
			x.style.color = x.style.color=='white'?'black':'white';}
		}(ss),500);
		XY = [parseInt(oX.value),parseInt(oY.value)];
		var zoom = parseInt(oZ.value); if( zoom > 3 || zoom < 1 ) zoom = 2;
		var rK = 1;
		var dX = 21;
		var dY = 17;
		var newY = XY[1] - Math.round((zoom-1)*dY/2);
		if (newY > mapRadius) { newY = newY - 2 * mapRadius };
		if (newY < -mapRadius) { newY = newY + 2 * mapRadius };
		var curTO = 0;
		aCC.length = 0;
		oasis.length = 0;
		for (var i=zoom; i>0; i--) {
			var newX = XY[0] - Math.round((zoom-1)*dX/2);
			if (newX > mapRadius) { newX = newX - 2 * mapRadius };
			if (newX < -mapRadius) { newX = newX + 2 * mapRadius };
			for (var j=zoom; j>0; j--) {
				setTimeout(function(x) { return function() { cropFindGetMap(x); }}({rX:newX,rY:newY,fl:(i==1&&j==1?true:false)}), curTO);
				newX += dX;
				if (newX > mapRadius) { newX = newX - 2 * mapRadius };
				if (newX < -mapRadius) { newX = newX + 2 * mapRadius };
				curTO += Math.round(getRandom(500,1500)*rK);
			}
			newY += dY;
			if (newY > mapRadius) { newY = newY - 2 * mapRadius };
			if (newY < -mapRadius) { newY = newY + 2 * mapRadius };
		}
	}
	function printResult ( ft, mX, mY , descr ) {
		var des = typeof descr == 'undefined' ? '': descr;
		$g(allIDs[18]).appendChild($em('DIV',[ft,' ',$a(mX+'|'+mY,[['href','karte.php?'+'x='+mX+'&y='+mY]])]));
		aCC[aCC.length] = [ft,mX,mY,des];
	}
	function findAnim (x) {
		var vid = xy2id(x[0],x[1]);
		if( typeof chkOasisFL[vid] != "undefined" ) {
			addToolTip(chkOasisFL[vid],x[3].rows[x[2]].cells[2]);
		} else {
			param = '{"x":'+x[0]+',"y":'+x[1]+'}';
			ajaxRequest(fullName+'api/v1/map/tile-details', 'POST', param, function(ajaxResp) {
				var mapData = JSON.parse(ajaxResp.responseText);
				var adv = $ee('DIV',mapData.html,[['style','display:none;']]);
				ad = $xf('.//table[@id="troop_info"]','f',adv);
				if( ad ) {
					chkOasisFL[vid] = getTroopsInOasis(ad);
					if( ! iaFL ) {
						addToolTip(chkOasisFL[vid],x[3].rows[x[2]].cells[2]);
					
						var anim = $xf('.//tr[td/img[contains(@class, "unit u")]]','l',ad);
						if( anim.snapshotLength > 0 ) {
							var animL = [0,0,0,0,0,0,0,1,1,1];
							for( var i=0; i<anim.snapshotLength; i++ ) {
								tt = parseInt($gt('IMG',anim.snapshotItem(i))[0].getAttribute('class').match(/\d+/)[0]);
								tc = toNumber(anim.snapshotItem(i).cells[1].innerHTML);
								if ( animL[tt-31] >0 )
									x[3].rows[x[2]].cells[2].appendChild($em('SPAN',[tc+"x",trImg('unit u'+tt)]));
							}
						}
					}
				}
			}, dummy);
		}
	}
	function printFinal () {
		if( $g(allIDs[18]) ) cont.removeChild($g(allIDs[18]));
		var cell_id = xy2id(XY[0],XY[1]); // village_aid or xy2id(XY[0],XY[1]) ...
		var aCCs = aCC.sort(function (a,b) {
				var dA = parseFloat(calcDistance( xy2id(a[1],a[2]), cell_id ).toFixed(1));
				var dB = parseFloat(calcDistance( xy2id(b[1],b[2]), cell_id ).toFixed(1));
				if( dA < dB ) return -1;
				if( dA > dB ) return 1;
				return 0;
			});
		var newT = $e('TABLE',[['class',allIDs[7]]]);
		oasis.sort(function(a,b){return parseInt(b[2])-parseInt(a[2]);});
		var curTO = 50;
		for( var i=0; i<aCCs.length; i++ ) {
			if( neFL ) {
				if( aCCs[i][3].e.indexOf('oasis') != -1 && typeof aCCs[i][3].uid == "undefined" && anim.checked ) {
					if( typeof chkOasisFL[xy2id(aCCs[i][1],aCCs[i][2])] == "undefined" )
						curTO += getRandom(250,1000);
					else
						curTO += 10;
					setTimeout(function(x) { return function() { findAnim(x) }}([aCCs[i][1],aCCs[i][2],i,newT]), curTO);
				}
				newT.appendChild($em('TR',[
					$c((typeof aCCs[i][3].uid != "undefined" ? $em('A',[aCCs[i][0],(aCCs[i][3].v<8?$e('i',[['class','tribe'+aCCs[i][3].v+'_small']]):"")],[['href','/profile/'+aCCs[i][3].uid[0]]]):"")),
					$c((typeof aCCs[i][3].aid != "undefined" ? ($a(aCCs[i][3].aid[1],[['href','/alliance/'+aCCs[i][3].aid[0]]])):"")),
					$c(aCCs[i][3].e),
					$c($a(aCCs[i][1]+'|'+aCCs[i][2],[['href',('position_details.php?x='+aCCs[i][1]+'&y='+aCCs[i][2])]])),
					$c('<->'),$c(calcDistance(xy2id(aCCs[i][1],aCCs[i][2]), cell_id).toFixed(1))
				]));
			} else {
				var oasisCC = 0;
				var oasisCount = 0;
				for( var t=0; t<oasis.length; t++ ) {
					if( Math.abs(aCCs[i][1]-oasis[t][0]) < 4 && Math.abs(aCCs[i][2]-oasis[t][1]) < 4 ) {
						oasisCC += parseInt(oasis[t][2]);
						if( ++oasisCount > 2 ) break;
					}
				}
				newT.appendChild($em('TR',[$c(aCCs[i][0]),$c(oasisCC>0?'+'+oasisCC+'%':''),
					$c($a(aCCs[i][1]+'|'+aCCs[i][2],[['href','karte.php?'+'x='+aCCs[i][1]+'&y='+aCCs[i][2]]])),
					$c(aCCs[i][3]),$c('<->'),$c(calcDistance(xy2id(aCCs[i][1],aCCs[i][2]), cell_id).toFixed(1))]));
			}
		}
		cont.appendChild($ee('P',newT,[['id',allIDs[18]],['style','margin:10px 15px 0px;']]));
		addSpeedAndRTSend($g(allIDs[18]));
		addRefIGM(allIDs[18]);
		neFL = false;
		iaFL = false;
	}
	function parseV4map (o) {
		var ar = new Object();
		if( typeof o.aid != 'undefined') {
			var ally = o.text.match(/{k.allianz}(.+?)</)[1];
			ar.aid = [o.aid, ally];
		}
		var pl = o.text.match(/{k.spieler}(.+?)</)[1];
		ar.uid = [o.uid, pl];
		var ei = o.text.match(/{k.einwohner}(.+?)</);
		ar.e = ei ? ei[1]: 'oasis';
		if( /{a.r4}/.test(o.text) ) ar.e += ' +'+o.text.match(/{a.r4}\s+(\d+%)/)[1];
		ar.v = o.text.match(/{a.v(\d)}/)[1];
		return [pl,ar];
	}
	function cropFindGetMap ( a ) {
		param = '{"data":{"x":'+a.rX+',"y":'+a.rY+',"zoomLevel":2,"ignorePositions":[]}}';
		ajaxRequest(fullName+'api/v1/map/position', 'POST', param, function(ajaxResp) {
			var mapData = JSON.parse(ajaxResp.responseText);
			var pRules = [[/{k.f1}/,'Crop 9:',c9],[/{k.f6}/,'Crop 15:',c15],[/{k.f7}/,'4-4-3-7:',c7],[/{k.f8}/,'3-4-4-7:',c7],[/{k.f9}/,'4-3-4-7:',c7]];
			for( var i=0; i < mapData.tiles.length; i++ ) {
				if (typeof mapData.tiles[i].title != 'undefined') {
					if( neFL ) {
						if( /{k.fo}/.test(mapData.tiles[i].title)) {
							printResult( "", mapData.tiles[i].position.x, mapData.tiles[i].position.y, {e:"oasis"} );
						} else if( /k.dt}|{k.bt}/.test(mapData.tiles[i].title)) {
							if( mapData.tiles[i].uid == userID ) continue;
							if( typeof mapData.tiles[i].aid != 'undefined' && mapData.tiles[i].aid == RB.dictionary[13] ) continue;
							var md = parseV4map( mapData.tiles[i] );
							printResult( md[0], mapData.tiles[i].position.x, mapData.tiles[i].position.y, md[1] );
						}
					} else {
						for( var t=0; t<pRules.length; t++ ) {
							if( pRules[t][0].test(mapData.tiles[i].title)) {
								if( pRules[t][2].checked )
									printResult( pRules[t][1], mapData.tiles[i].position.x, mapData.tiles[i].position.y );
							}
						}
						if( /{k.bt}|{k.fo}/.test(mapData.tiles[i].title)) {
							if( /{a.r4}/.test(mapData.tiles[i].text)) {
								oasis[oasis.length] = [mapData.tiles[i].position.x, mapData.tiles[i].position.y, mapData.tiles[i].text.match(/{a.r4}\s+(\d+)%/)[1]];
							}
						}
					}
				}
			}
			if( a.fl ) printFinal();
		}, dummy);
	}

	var aCC = [];
	var oasis = [];
	var neFL = false;
	var iaFL = false;
	var chkOasisFL = new Object();
	var cfText = $ee('SPAN',$a('crop find'),[['href',jsVoid],['style','display:inline-block;']]);
	var cfText2 = $ee('SPAN',$a(gtext('neighbors')),[['href',jsVoid],['style','display:inline-block;']]);

	var labels = $gt('LABEL', cont);
	var xCoordText, yCoordText;
	for( var i=0; i < labels.length; i++ ) {
		if ( labels[i].hasAttribute('for') && (labels[i].htmlFor == 'xCoordInputMap') ) xCoordText = labels[i].textContent;
		if ( labels[i].hasAttribute('for') && (labels[i].htmlFor == 'yCoordInputMap') ) yCoordText = labels[i].textContent;
	}
	cfText.addEventListener('click', cropFindReq, false);
	cfText2.addEventListener('click', cropFindReq2, false);
	var XY = /[\?|&](d=|z=|x=|targetMapId=)/.test(crtPath) ? id2xy(getVid(crtPath)): id2xy(village_aid);

	function inps (val, iname) { return $e('INPUT',[['value',val],['name',iname],['id',iname],['class','text coordinates'],['type','text'],['style','width:4em;']]); }
	function inpsC (id, check) {
		var inp = $e('INPUT',[['id',id],['type','checkbox'],['style','margin-'+docDir[0]+':0px;']]);
		if (check) inp.checked = true; return inp;
	}
	function label (text, input) { return $em('LABEL',[text,input],[['style','margin:2px;display:inline-block;']]); }

	var oX = inps(XY[0],'RBmX');
	var oY = inps(XY[1],'RBmY');
	var oZ = $em('select',[$em('OPTION','1',[['value','1']]),$em('OPTION','2',[['value','2'],['selected','']]),$em('OPTION','3',[['value','3']])],[['name','RBzoom'],['id','RBzoom']]);
	var c15 = inpsC('RBc15',true);
	var c9 = inpsC('RBc9',true);
	var c7 = inpsC('RBc7',false);
	var anim = inpsC('RBanim',false);
	var anDiv = $em('SPAN',[' ',trImg('unit u40'),':',anim]);
	cont.appendChild($em('DIV',[label(xCoordText,oX),label(yCoordText,oY),label('zoom:',oZ),label('15:',c15),label('9:',c9),label('7:',c7),cfText,' | ',cfText2,anDiv],[['class','contents'],['style','white-space:nowrap;margin-top:5px;']]));
}

function npcForTroops () {
	var npcT = $g('npc');
	if( !(npcT) ) return;
	var TR = $e('TR');

	var inps = $gt('INPUT', npcT);
	if( inps.length < 4 ) return;

	function redistrNPC ( num ) {
		var tN = parseInt(RB.Setup[2])*10 + num;
		var tRS = troopInfo(tN,3)+troopInfo(tN,4)+troopInfo(tN,5)+troopInfo(tN,6);
		var aCol = Math.floor(resNowSumm / tRS);
		var summ = 0;
		for( var i=0; i<3; i++ ) {
			var tCo = aCol * troopInfo(tN, i+3);
			summ += tCo;
			inps[i].value = tCo + sRes[i];
		}
		inps[i].value = resNowSumm - summ + sRes[i];
	}
	function redistrNPCcrop () {
		var newMaxCrop = fullRes[3] - sRes[3];
		var newCrop = resNowSumm > newMaxCrop ? newMaxCrop: resNowSumm;
		var deltaRes = resNowSumm > newMaxCrop ? Math.ceil((resNowSumm-newCrop)/3): 0;
		for( var i=0; i<3; i++ ) inps[i].value = deltaRes + sRes[i];
		inps[i].value = sRes[i] + (resNowSumm > newMaxCrop ? resNowSumm-deltaRes*3: newCrop);
	}

	var sRes = [0,0,0,0];
	for( var i=0; i<4; i++ ) sRes[i] = parseInt(inps[i].value).NaN0();
	var sumSRes = sRes[0]+sRes[1]+sRes[2]+sRes[3];
	var resNowSumm = resNow[0]+resNow[1]+resNow[2]+resNow[3] - sumSRes;

	for( var i=1; i<11; i++ ) {
		var tN = parseInt(RB.Setup[2])*10+i;
		var tRS = troopInfo(tN,3)+troopInfo(tN,4)+troopInfo(tN,5)+troopInfo(tN,6);
		var aCol = Math.floor(resNowSumm/tRS);
		var newA = $em('A',[trImg('unit u'+tN),'(',aCol,')'],[['href',jsVoid],['onclick','setTimeout(function (x) { return exchangeResources.calculateRest() }, 250);']]);
		newA.addEventListener('click', function(x) { return function() { redistrNPC(x); }}(i), false);
		TR.appendChild($c(newA));
	}
	var newA = $a(($e('i',[['class','r4']])),[['href',jsVoid],['onclick','setTimeout(function (x) { return exchangeResources.calculateRest() },250)']]);
	newA.addEventListener('click',redistrNPCcrop, false);
	TR.appendChild($c(newA));
	var tT = $ee('TABLE',TR,[['class',allIDs[7]]]);
	npcT.parentNode.insertBefore(tT, npcT);
}

function analyzerBattle () {
	if( RB.Setup[25] == 0 || RB.dictFL[13] < 3 ) return;
	var report = $g("reportWrapper");
	if (! report) return;
	var def = $gc('defender');
	var att = $gc('attacker');
	if ( def.length < 1 ) return;
	if ( att.length < 1 ) return;
	var tt = $gt('TABLE',report);
	if( tt.length < 2 ) return;

	function parseTroops ( pRows, pRU, ptS ) {
		var pRace = Math.floor(parseInt($gt('IMG',pRows[0].cells[1])[0].getAttribute('class').match(/u(\d+)/)[1])/10);
		for( var i=10; i>0; i-- ) {
			tCount = parseInt(pRows[1].cells[i].innerHTML).NaN0();
			var tKirillC = tCount;
			if( tCount > 0 ) {
				for( j=0; j<pRU.length; j++) ptS[0][j] += troopInfo(pRace*10+i, pRU[j])*tCount;
				if( i < 7 && troopInfo(pRace*10+i, 9) > 1 ) ptS[3] += troopInfo(pRace*10+i, 0)*tCount;
			}
			if( pRows.length > 2 ) if( pRows[2].cells.length > 3 ) {
				tCount = parseInt(pRows[2].cells[i].innerHTML);
				if( tCount > 0 ) {
					for( j=0; j<pRU.length; j++) ptS[1][j] += troopInfo(pRace*10+i, pRU[j])*tCount;
					tKirillC -= tCount;
				}
			}
			if( pRows.length > 3 ) if( pRows[3].cells.length > 3 ) {
				tCount = parseInt(pRows[3].cells[i].innerHTML);
				if( tCount > 0 ) {
					for( j=0; j<pRU.length; j++) {
						ptS[2][j] += troopInfo(pRace*10+i, pRU[j])*tCount;
					}
					tKirillC -= tCount;
				}
			}
			kirillS = (tKirillC > 0 ? tKirillC:'')+','+kirillS;
		}
		kirillS = 'r'+kirillRace[pRace]+'u'+kirillS.replace(/,*$/,'');
		return ptS;
	}

	var attakerN, defenderN;
	attakerN = $gt('h2')[0].textContent;
	defenderN = $gt('h2')[1].textContent;

	var kirilloid = '#a:';
	var aRow = tt[0].rows;
	var tCount = 0;
	var atS = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],0];
	var aRU =  [0,8,3,4,5,6,9];
	var kirillRace = [0,1,2,3,4,5,6,7];
	var kirillS = '';
	var atS = parseTroops( aRow, aRU, atS );
	kirilloid += kirillS+'Ub#d:'+((RB.Setup[46]==1)?'m9':'');
	kirilloid = kirilloid.replace(/r0(uUb)?/g,'');
	atS[0][1] -= atS[1][1];
	var res = $gc('resources',tt[1]);
	var ress = [];
	ress[0] = 0;
	for( var i=1; i <= res.length; i++ ) {
		var sp = $gt('span',res[i-1]);
		ress[i] = parseInt(sp[0].textContent);
	}

	if( res.length === 6) {
		var pbonus = ress[6];
		var newT = $e('TABLE',[['class',allIDs[7]]]);
		for( i=1; i<11; i++ ) {
			var trC = troopInfo(i+(parseInt(RB.Setup[2])*10), 8);
			if( trC > 1 ) {
				newT.appendChild($em('TR',[$c(trImg('unit u'+(i+parseInt(RB.Setup[2])*10))),$c(Math.ceil(pbonus/trC))]));
			}
		}
		var clone = res[5].cloneNode(true);
		clone.addEventListener("mouseover", function () { makeTooltip(newT); }, false);
		clone.addEventListener("mouseout", removeTooltip, false);
		res[5].parentNode.replaceChild(clone,res[5]);
	}

	var dfS = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],0];
	var dRU =  [1,2,3,4,5,6,9];
	var kirillRace = [0,1,2,3,4,5,6,7];
	var kirillSd = '';
	for( dTc=1; dTc < tt.length; dTc++ ) {
		var dRow = tt[dTc].rows;
		if (tt[dTc].className == 'additionalInformation' || tt[dTc].className == 'combatStatistic') continue;
		if( dRow.length < 2 ) continue;
		kirillS = '';
		var dfS = parseTroops( dRow, dRU, dfS );
		if (tt.length = 4 && $gc('u31',tt[dTc]).length>0) { dfS[0][0] = dfS[0][0] + 10; dfS[0][1] = dfS[0][1] + 10; } //add oasis defense +10
		kirillSd += kirillS+'U#';
	}
	kirilloid += kirillSd.substring(0,2)+('#')+kirillSd;
	kirilloid = kirilloid.replace(/r.uU#/g,'');
	kirilloid = kirilloid.replace(/r0u/g,'u');
	kirilloid = kirilloid.replace(/[;#]$/,'');

	var adCoords = $xf('.//a[contains(@href, "karte.php")]','l',report);
	if( adCoords.snapshotLength > 1 ) {
		var atCoord = getVid(adCoords.snapshotItem(0).getAttribute('href'));
		var dfCoord = getVid(adCoords.snapshotItem(1).getAttribute('href'));
		var distance = Math.round(calcDistance(atCoord,dfCoord));
		var distRef = $ee('SPAN','&lt;- '+distance+' -&gt;',[['style','white-space:nowrap;']]);
		distRef.addEventListener("mouseover", function() {
			var al = parseInt(RB.Setup[9]) == 0 ? parseInt(RB.village_Var[1]) : parseInt(RB.Setup[9]) - 1;
			makeTooltip(showAllTTime(1, [atCoord,dfCoord], al));
		}, false);
		distRef.addEventListener("mouseout", removeTooltip, false);
	} else var distRef = ' ';

	var newTABLE = $e('TABLE',[['class',allIDs[7]],['style','background-color:white;width:100%;margin-top:10px;']]);
	newTABLE.appendChild($em('TR',[$c(distRef),$c(attakerN),$c(defenderN),$c(gtext('total'))]));
	// strength
	var newTR = $ee('TR',$em('TD',[trImg('unit u13'),'+',trImg('unit u16')]));
	var strAP = atS[0][0]-atS[3];
	newTR.appendChild($em('TD',[humanRF(strAP),' + ',humanRF(atS[3])]));
	newTR.appendChild($em('TD',[humanRF(dfS[0][0]),' + ',humanRF(dfS[0][1])]));
	var proc = [0,0];
	proc[0] = Math.round(strAP/(strAP+dfS[0][0])*100).NaN0();
	proc[1] = Math.round(atS[3]/(atS[3]+dfS[0][1])*100).NaN0();
	newTR.appendChild($c(proc[0]+' + '+proc[1]+' = '+Math.round((proc[0]+proc[1])/(proc[0]>0 && proc[1] > 0 ? 2: 1))+'%'));
	newTABLE.appendChild(newTR);
	// crop
	proc[0] = Math.round(atS[1][6]/(atS[1][6]+dfS[1][6])*100).NaN0();
	var newTR = $em('TR',[$c($e('i',[['class','r5']])),$c(humanRF(atS[0][6])+'/'+humanRF(atS[1][6])),
					$c(humanRF(dfS[0][6])+'/'+humanRF(dfS[1][6])),$c(proc[0]+'%')]);
	newTABLE.appendChild(newTR);
	//hospital
	proc[0] = Math.round(atS[2][6]/(atS[2][6]+dfS[2][6])*100).NaN0();
	var newTR = $em('TR',[$c($e('IMG',[['src',img_wounded]])),$c(humanRF(atS[2][6])),$c(humanRF(dfS[2][6])),$c(proc[0]+'%')]);
	newTABLE.appendChild(newTR);
	// resource
	var newTR = $ee('TR',$em('TD',[$e('i',[['class','r1']]),'+',$e('i',[['class','r2']]),'+',$e('i',[['class','r3']]),'+',$e('i',[['class','r4']]),'=']));
	proc[0] = atS[1][2]+atS[1][3]+atS[1][4]+atS[1][5];
	if( atS[0][1] == 0 ) ress = [0,0,0,0,0];
	proc[5] = ress[1]+ress[2]+ress[3]+ress[4];
	proc[1] = dfS[1][2]+dfS[1][3]+dfS[1][4]+dfS[1][5];
	proc[4] = proc[1]+proc[5];
	proc[2] = Math.round((proc[0])/(proc[0]+proc[4])*100).NaN0();
	newTR.appendChild($em('TD',[humanRF(atS[1][2])+' + '+humanRF(atS[1][3])+' + '+humanRF(atS[1][4])+' + '+humanRF(atS[1][5]),$e('BR'),' = '+humanRF(proc[0])]));
	newTR.appendChild($em('TD',[humanRF(dfS[1][2]+ress[1])+' + '+humanRF(dfS[1][3]+ress[2])+' + '+humanRF(dfS[1][4]+ress[3])+' + '+humanRF(dfS[1][5]+ress[4]),$e('BR'),' = '+humanRF(proc[4])]));
	newTR.appendChild($c(proc[2]+'%'));
	newTABLE.appendChild(newTR);
	// carry
	var newTR = $ee('TR',$c(trImg(allIDs[33])));
	proc[4] = atS[0][1] > 0 ? Math.round(proc[5]/atS[0][1]*100) : 0;
	newTR.appendChild($c(proc[4]+'%'));
	newTR.appendChild($c($a('(kirilloid.ru/warsim)',[['href','http://travian.kirilloid.ru/warsim2.php'+kirilloid],['target','_blank'],['style','font-size:11px;']])));
	proc[4] = proc[5] > 0 ? Math.round((proc[5]-proc[0])/proc[5]*100) : '--';
	newTR.appendChild($c(proc[4]+'%'));
	newTABLE.appendChild(newTR);

	//var toLog = $a('https://www.inactivesearch.it/tools/battle-reports');
	//toLog.addEventListener("click", addReport, true);
	var toLog = $a('https://www.inactivesearch.it/tools/battle-reports',[['href','https://www.inactivesearch.it/tools/battle-reports'],['target','_blank']]);
	var kLog = $a('http://travian.kirilloid.ru/report.php',[['href','http://travian.kirilloid.ru/report.php'],['target','_blank']]);
	newTABLE.appendChild($ee('TR',$c(toLog,[['colspan',4]])));
	newTABLE.appendChild($ee('TR',$c(kLog,[['colspan',4]])));

	$gc('attacker')[0].parentNode.parentNode.appendChild(newTABLE);
}

function addReport () {
	if( closeWindowN(8) ) return;
	var reportO = $g('report_surround');
	if(! reportO) {
		reportO = $g("reportWrapper");
		if (! reportO) return;
	}

	function cancelLog () {
		closeWindowN(8);
	}

	var report = reportO.cloneNode(true);
	var rt = $gc(allIDs[7],report)[0];
	rt.parentNode.removeChild(rt);

	var reportV = report.innerHTML.replace(/<button[\s\S]+?button>/g,'').replace(/\"\"/g,'').
		replace(/<script[\s\S]+?script>/g,'').replace(/<i [\s\S]+?i>/g,'').replace(/alt=\"(.+?)\"/g,'>$1<a').replace(/\s{2,}/g,' ').
		replace(/<\/td>/g,"\t").replace(/<\/th>|<\/div>|<\/tr>/g,"\n").onlyText().replace(/\n{2,}/g,'\n').replace(/\t{2,}/g,'\t').replace(/^ +/gm,'').replace(/[^\S\r\n]+$/gm,'');
	var form = $e('FORM',[['id','battleReportsForm'],['method','post'],['action','https://www.inactivesearch.it/tools/battle-reports'],['target','_blank']]);
	form.appendChild($em('SELECT',[$e('OPTION',[['value',$g("mainLayout").getAttribute("lang").toLowerCase().substring(3,5)],['selected','']])],[['name','language'],['hidden','']]));
	form.appendChild($ee('textarea', reportV, [['name','report'],['cols',30],['rows',10]]));
	form.appendChild($em('DIV',[$e('input',[['type','checkbox'],['name','anonymous']])," Anonymous "]));
	form.appendChild($em('DIV',[$e('input',[['type','checkbox'],['name','hide_att']])," Hide attaker troops "]));
	form.appendChild($em('DIV',[$e('input',[['type','checkbox'],['name','hide_def']])," Hide defender troops "]));
	var newBTX = $ee('BUTTON',gtext("cancel"),[['class',allIDs[15]],['onclick',jsNone]]);
	newBTX.addEventListener('click', cancelLog, true);
	form.appendChild($em('DIV',[$ee('BUTTON','Submit',[['type','submit'],['class',allIDs[15]],['name','submit']]),newBTX]));
	var newRF = $ee('DIV',form,[['style','background-color:cyan;']]);

	var xy = offsetPosition(this);
	windowID[8] = makeFloat(newRF, xy[0]-100, xy[1]-250, 21);
}

function returnQuickHelp () {
	var i = "return Travian.Game.Manual.open(0,0);";
	var svg = $gc('answers',$g('outOfGame'))[0].cloneNode(true);
	$ib($ee('li',$ee('A',svg,[['href','#'],['onclick',i]]),[['class',"help"],['style',"position:absolute;"+docDir[1]+":176px;"]]),$g('outOfGame').firstChild);
}

function rpDefaultAction () {
	var nc = $xf('.//input[@name="eventType"]','l',cont);
	if( nc.snapshotLength < 3 ) return;
	if( RB.Setup[27] > 0 ) if( typeof nc.snapshotItem(RB.Setup[27]).getAttribute('disabled') != "string" ) nc.snapshotItem(RB.Setup[27]).checked = true;
	if( RB.dictFL[16] > 0 ) return;
	for( var i=0; i<nc.snapshotLength; i++ ) {
		RB.dictionary[16+i] = nc.snapshotItem(i).parentNode.textContent.trim();
	}
	saveCookie( 'Dict', 'dictionary' );
	RB.dictFL[16] = 1;
	saveCookie( 'DictFL', 'dictFL' );
}

function addAReportFilter () {
	dictRpInit();
	var newD = $e('DIV',[['style','white-space:nowrap;padding:5px;']]);
	for( var i=0; i<iReports.length; i++ ) {
		newD.appendChild($a(trImg('iReport iReport'+iReports[i], RB.dictRp[i]),[['href','/alliance/reports?filter='+iReports[i]+'&own=0'],['style','margin:2px;']]));
	}
	cont.appendChild(newD);
}

function restHeroTime () {
	var timers = $xf('.//div/span[contains(@class, "timer")]','l',cont);
	for( var i=0; i<timers.snapshotLength; i++ ) {
		timers.snapshotItem(i).parentNode.insertBefore($em('SPAN',[' (',formatTime(absTime(toSeconds(timers.snapshotItem(i).textContent)),4),')']), timers.snapshotItem(i).nextSibling);
	}
}

function detectAttack () {
	function getAttackAInfo () {
		$g(allIDs[23]).innerHTML = "checking";
		RB.attackList.length = 1;
		if ( plusAccount == true ) {
			findAttackPA();
			return;
		}
		if ( RB.Setup[46] == 1 ) {
			findAttackFS();
			return;
		}
		FreezeScreen(true);
		var curTO = 0;
		for( var i=0; i<linkVSwitch.length; i++ ) {
			curTO += getRandom(300,1000);
			setTimeout(function(x) { return function() { findAttack(x); }}(i), curTO);
		}
	}
	function showAtt () {
		var aDv = $g(allIDs[23]);
		if( !(aDv) ) {
			aDv = $e('DIV',[['style','max-width:100px;'],['id',allIDs[23]]]);
			makeFloatD(aDv, 10);
			timerNum = timerB.length;
			lastTimerB = timerNum+1;
		}
		if( RB.attackList.length < 2 ) {
			aDv.innerHTML = 'No attack'; 
		} else {
			aDv.innerHTML = '';
		}

		for( var t=1; t<RB.attackList.length; t++ ) {
			aDv.appendChild(vLinks.snapshotItem(RB.attackList[t]).cloneNode(true));
			if(RB.attackList.length > t+1) aDv.appendChild($t(', '));
		}
		aDv.appendChild($e('BR'));
		timerB[timerNum] = new Object();
		timerB[timerNum].time = Math.round(nextCheck/1000);
		timerB[timerNum].obj = $eT('SPAN', timerB[timerNum].time, 0);
		aDv.appendChild(timerB[timerNum].obj);
	}
	function triggerAlarm () {
		var audioT = $g(allIDs[22]);
		if( audioT ) audioT.parentNode.removeChild(audioT);
		document.body.appendChild($e('AUDIO',[['id',allIDs[22]],['src',RB.Setup[29]],['autoplay','true'],['loop','true']]));
	}
	function noAttack () {
		RB.attackList[0] = Date.now();
		RB_setValue(GMcookieID + 'Att', JSON.stringify(RB.attackList));
		nextCheck = getRandom(basePeriod,2e5);
		setTimeout( getAttackAInfo, nextCheck);
		showAtt();
	}
	function showError () {
		var aDv = $g(allIDs[23]);
		if( aDv ) {
			aDv.innerHTML = "<span style='color:red;'> Error! </span>";
		}
	}
	function findAttack( nd ) {
		var aLink = fullName +'dorf1.php?'+ linkVSwitch[nd].match(/newdid=\d+/i)[0];
		ajaxRequest(aLink, 'GET', null, function(ajaxResp) {
			var ad = ajaxNDIV(ajaxResp);
			var move = $xf('.//*[@id="movements"]','f',ad);
			ad = null;
			if (move) {
				if( /att1|att3/.test(move.innerHTML) ) {
					RB.attackList.push(nd);
				}
			}
			if( nd == linkVSwitch.length-1 ) {
				setTimeout( function() { ajaxRequest(active_did, 'GET', null, dummy, dummy); }, getRandom(300,1000));
				RB.attackList[0] = Date.now();
				RB_setValue(GMcookieID + 'Att', JSON.stringify(RB.attackList));
				nextCheck = getRandom(basePeriod,2e5);
				setTimeout( getAttackAInfo, nextCheck);
				FreezeScreen(false);
				showAtt();
				if( RB.attackList.length > 1 ) {
					triggerAlarm();
					//show_alert();
				}
			}
		}, showError);
	}
	function findAttackFS() {
		var aLink = fullName +'alliance/profile?st=members';
		ajaxRequest(aLink, 'GET', null, function(ajaxResp) {
			var ad = ajaxNDIV(ajaxResp);
			var move = $xf('.//*[@class="attack"]','l',ad);
			ad = null;
			if (move) {
				for( var h=0; h<move.snapshotLength; h++ ) {
					var att = $gt('a',move.snapshotItem(h).parentNode);
					var pat = new RegExp('/profile/' + userID);
					for (var i=0; i<att.length; i++) {
						if( pat.test(att[i].href) ) {
							triggerAlarm();
							return;
						}
					}
				}
			}
			noAttack();
		}, showError);
	}
	function findAttackPA() {
		var aLink = fullName +'dorf1.php';
		ajaxRequest(aLink, 'GET', null, function(ajaxResp) {
			var ad = ajaxNDIV(ajaxResp);
			var move = $xf('.//div[contains(@class,"listEntry") and contains(@class,"attack")]','f',ad);
			ad = null;
			if (move) { 
				triggerAlarm();
				return true; 
			} else { noAttack(); }
		}, showError);
	}
	function FreezeScreen( state ) {
		if( RB.Setup[30] < 2 ) return;
		scroll(0,0);
		var outerPane = $g(allIDs[27]);
		if (state) {
			if (outerPane) outerPane.className = allIDs[25];
		} else {
			if (outerPane) outerPane.className = allIDs[24];
		}
	}

	try { RB.attackList = JSON.parse(RB_getValue(GMcookieID + 'Att','[0]')); } catch (err) { RB.attackList = [0]; }
	var timerNum = 0;
	if( RB.Setup[31] < 5 || RB.Setup[31] > 30 ) RB.Setup[31] = 15;
	var basePeriod = (parseInt(RB.Setup[31])-1)*6e4;
	var firstCheck = parseInt(RB.attackList[0]) + basePeriod - RunTime[0];
	var nextCheck =  firstCheck < 3e5 ? getRandom(3e5,3e4): getRandom(firstCheck,1e5);

	var vLinks = $xf(vLinksPat,'l');
	var active_did = crtPath.split("?")[0] + clearAntibot( linkVSwitch[village_aNum] );
	setTimeout( getAttackAInfo, nextCheck);
	showAtt();
	var btnX = $ee('BUTTON','X');
	btnX.addEventListener("click", function(){ FreezeScreen(false) }, true);
	var divIn = $em('div',['checking ',btnX],[['class',allIDs[26]]]);
	var divF = $ee("div",divIn,[['align','center'],['id', allIDs[27]],['class',allIDs[24]]]);
	document.body.insertBefore(divF, document.body.firstChild);
}

function analyzerSetup () {
	if( closeWindowN(7) ) return;

	function okAnalyzer() {
		for( var i=0; i<analyzers.length-1; i++ ) {
			RB.serversAN[i] = inp[i].value;
		}
		saveCookie('AS', 'serversAN');
		cancelAnalyzer();
	}
	function cancelAnalyzer() {
		closeWindowN(7);
	}

	var newT = $e('TABLE',[['class',allIDs[7]],['style','background-color:yellow;']]); // #F0F0F0
	var inp = [];
	for( var i=0; i<analyzers.length-1; i++ ) {
		var ps = userActivityServers(i+1)[2].split('###');
		inp[i] = $e('INPUT',[['type','text'],['value',ps[1]],['size',(ps[1].length+1)]]);
		newT.appendChild($ee('TR',$em('TD',[ps[0],inp[i],ps[2]],[['style','direction:ltr;']])));
	}
	newT.appendChild($ee('TR',okTD(okAnalyzer,cancelAnalyzer)));
	var xy = offsetPosition(this);
	windowID[7] = makeFloat(newT,xy[0]-(ltr?320:20),xy[1]-190,22);
}

function timeToBids () {
	var timers = $xf('.//span[contains(@class,"timer")]','l',cont);
	for( var i=0; i<timers.snapshotLength; i++ ) {
		timers.snapshotItem(i).setAttribute('title',formatTime(absTime(toSeconds(timers.snapshotItem(i).innerHTML)),2));
	}
}

/************************** center number ****************************/
function centerNumber () {

var dorf = 0;
var bCost = [[0],//dummy
[40,100,50,60,1,2,1.67], //Woodcutter Cost gid = 1
[80,40,80,50,1,2,1.67], //Clay Pit Cost gid = 2
[100,80,30,60,1,3,1.67], //Iron Mine Cost gid = 3
[70,90,70,20,1,0,1.67], //Cropland Cost gid = 4
[520,380,290,90,1,4,1.80], //Sawmill Cost gid = 5
[440,480,320,50,1,3,1.80], //Brickyard Cost gid = 6
[200,450,510,120,1,6,1.80], //Iron Foundry Cost gid = 7
[500,440,380,1240,1,3,1.80], //Grain Mill Cost gid = 8
[1200,1480,870,1600,1,4,1.80], //Bakery Cost gid = 9
[130,160,90,40,1,1,1.28], //Warehouse Cost gid = 10
[80,100,70,20,1,1,1.28], //Granary Cost gid = 11
[170,200,380,130,2,4,1.28], //Blacksmith Cost gid = 12
[180,250,500,160,2,4,1.28], //Smithy Cost gid = 13
[1750,2250,1530,240,1,1,1.28], //Tournament Square Cost gid = 14
[70,40,60,20,2,2,1.28], //Main Building Cost gid = 15
[110,160,90,70,1,1,1.28], //Rally Point Cost gid = 16
[80,70,120,70,3,4,1.28], //Marketplace Cost gid = 17
[180,130,150,80,4,3,1.28], //Embassy Cost gid = 18
[210,140,260,120,1,4,1.28], //Barracks Cost gid = 19
[260,140,220,100,2,5,1.28], //Stable Cost gid = 20
[460,510,600,320,3,3,1.28], //Workshop Cost gid = 21
[220,160,90,40,4,4,1.28], //Academy Cost gid = 22
[40,50,30,10,1,0,1.28], //Cranny Cost gid = 23
[1250,1110,1260,600,5,4,1.28], //Town Hall Cost gid = 24
[580,460,350,180,2,1,1.28], //Residence Cost gid = 25
[550,800,750,250,5,1,1.28], //Palace Cost gid = 26
[2880,2740,2580,990,6,4,1.26], //Treasury Cost gid = 27
[1400,1330,1200,400,3,3,1.28], //Trade Office Cost gid = 28
[630,420,780,360,1,4,1.28], //Great Barracks Cost gid = 29
[780,420,660,300,2,5,1.28], //Great Stable Cost gid = 30
[70,90,170,70,1,0,1.28], //City Wall Cost gid = 31
[120,200,0,80,1,0,1.28], //Earth Wall Cost gid = 32
[160,100,80,60,1,0,1.28], //Palisade Cost gid = 33
[155,130,125,70,1,2,1.28], //Stonemason's Lodge Cost gid = 34
[3210,2050,2750,3830,4,6,1.40], //Brewery Cost gid = 35
[80,120,70,90,1,4,1.28], //Trapper Cost gid = 36
[700,670,700,240,1,2,1.33], //Hero's Mansion Cost gid = 37
[650,800,450,200,1,1,1.28], //Great Warehouse Cost gid = 38
[400,500,350,100,1,1,1.28], //Great Granary Cost gid = 39
[66700,69050,72200,13200,0,1,1.0275], //WW Cost gid = 40
[780,420,660,540,3,5,1.28], //Horse Drinking Trough Cost gid = 41
[110,160,70,60,1,0,1.28], //Stone Wall Cost gid = 42
[50,80,40,30,1,0,1.28], //Makeshift Wall Cost gid = 43
[1600,1250,1050,200,2,1,1.22], //Command Center Cost gid = 44
[910,945,910,340,2,1,1.31], //Waterworks Cost gid = 45
[320,280,420,360,4,4,1.28], //Hospital Cost gid = 46
[160,100,80,60,1,0,1.28], //Defensive Wall Cost gid = 47
[320,280,420,360,5,4,1.28], //Asclepeion Cost gid = 48
[1440,1370,1290,495,5,3,1.30] //Harbor Cost gid = 49
];

fieldsOfVillage = {
	'f1':	[3, 3, 0, 3, 3, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //9 crop
	'f2':	[2, 3, 0, 2, 1, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //3-4-5-6
	'f3':	[0, 3, 0, 2, 1, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //4-4-4-6
	'f4':	[0, 3, 0, 1, 1, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //4-5-3-6
	'f5':	[0, 3, 0, 2, 0, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //5-3-4-6
	'f6':	[3, 3, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3], //15 crop
	'f7':	[0, 3, 3, 0, 1, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //4-4-3-7
	'f8':	[2, 3, 3, 0, 1, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //3-4-4-7
	'f9':	[2, 3, 3, 0, 0, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //4-3-4-7
	'f10':	[2, 3, 0, 1, 1, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1], //3-5-4-6
	'f11':	[2, 0, 0, 2, 0, 3, 3, 2, 2, 1, 1, 2, 0, 3, 3, 1, 3, 3], //4-3-5-6
	'f12':	[0, 3, 0, 0, 1, 1, 2, 3, 3, 2, 2, 3, 3, 0, 3, 1, 0, 1]  //5-4-3-6
};
//		'f99':	'Natarian village',

// ›› Main.
function TM_ShowMainBuildingNumbers(){
	var gid, dorf;
	var countArray;
	var BuildingLevel, smallDIV;
	var levels;
	var mapOffset = 1;
	var underConstruction = false;
	// ›› Map1 holds building names, level and building spot IDs in area elements (2 are duplicate walls to be ignored).

	var mapInfo = $g('villageContent');
	var mapInfo2 = $g('resourceFieldContainer');
	if ( mapInfo2 ) {
		countArray = 18;
		dorf = 1;
		var slots = $xf('./a','l',mapInfo2);
		//remove duplicate nodes (travian bug)
		for( var i=1; i < slots.snapshotLength; i++ ) {
			if (slots.snapshotItem(i).href == slots.snapshotItem(i-1).href) {
				slots.snapshotItem(i).parentNode.removeChild(slots.snapshotItem(i));
			}
		}
		if ($gt('DIV',slots.snapshotItem(1)).length>0) {
			levels = $xf('.//DIV','l',mapInfo2);
		}
	} else {
		dorf = 2;
		var lRef = 0;
		levels = $xf('.//div[contains(@class,"labelLayer")]','l',mapInfo);
		var imageElements = $xf('.//img[contains(@class,"building") or contains(@class,"Bottom")]','l',mapInfo);
		countArray = imageElements.snapshotLength;
	}

	if ( !mapInfo && !mapInfo2 ) return;
	for (var i = 0; i < countArray; i++) {
		if (dorf == 1) {
			BuildingLevel = /level(\d+)/.exec(levels.snapshotItem(i).parentNode.className);
			if (! BuildingLevel) continue;
			BuildingLevel = parseInt(BuildingLevel[1]);
			if (i == 0) { var typeOfVillage = /resourceField(\d+)/.exec(mapInfo2.className); }
			gid = fieldsOfVillage['f'+typeOfVillage[1]][i]+1;
			aid = i+mapOffset;
			smallDIV = levels.snapshotItem(i);
			if ( /underConstruction/.test(levels.snapshotItem(i).parentNode.getAttribute('class')) ) underConstruction = true; else underConstruction = false;
		}

		if (dorf == 2) {
			if ( /iso|g16e/.test(imageElements.snapshotItem(i).getAttribute('class') )) continue;
			BuildingLevel = imageElements.snapshotItem(i).previousElementSibling.textContent;
			if (! BuildingLevel) continue;
			BuildingLevel = parseInt(BuildingLevel);

			gid = parseInt(/(\d+)/.exec(imageElements.snapshotItem(i).getAttribute('class'))[1]);
			if ( /g40/.test(imageElements.snapshotItem(i).getAttribute('class') )) { //if WW building
				aid = 35;
			} else {
				aid = parseInt(/(\d+)/.exec(imageElements.snapshotItem(i).previousElementSibling.getAttribute('class'))[1]);
			}
			smallDIV = levels.snapshotItem(lRef++);
			if ( /underConstruction/.test(imageElements.snapshotItem(i).previousElementSibling.getAttribute('class')) ) underConstruction = true; else underConstruction = false;
		}

		if (underConstruction) {
			setInterval(function(x){return function(){
				x.style.color = x.style.color=='white'?'black':'white';}
			}(smallDIV),800);
			if( BuildingLevel==0 ) smallDIV.textContent='0 ';
			BuildingLevel += 1;
		}

		try {
			var k = Math.pow(bCost[gid][6], BuildingLevel);
			var resneed = bCost[gid].map(x => Math.round((x*k)/5)*5);
		} catch (err) {
			continue;
		}

		if (BuildingLevel == getMaxLevel(gid)) {
			smallDIV.style.backgroundColor = getColor(4);//green
		}else if( resneed[0] > fullRes[0] || resneed[1] > fullRes[0] || resneed[2] > fullRes[0] || resneed[3] > fullRes[3] ) {
			smallDIV.style.backgroundColor = getColor(3);//magenta
		}else if( (resNow[0]+resNow[1]+resNow[2]+resNow[3]) >= (resneed[0]+resneed[1]+resneed[2]+resneed[3]) ){
			if(resNow[0] >= resneed[0] && resNow[1] >= resneed[1] && resNow[2] >= resneed[2] && resNow[3] >= resneed[3]){
				smallDIV.style.backgroundColor = getColor(0);//white
			}else{
				smallDIV.style.backgroundColor = getColor(1);//orange #FFC85B
			}
		}else if (parseInt(resneed[0]) > resNow[0] ||
			parseInt(resneed[1]) > resNow[1] ||
			parseInt(resneed[2]) > resNow[2] ||
			parseInt(resneed[3]) > resNow[3] ){
			smallDIV.style.backgroundColor = getColor(2);//red
		}
	}
}

function getColor(x) {
	return RB.Setup[40+x].length>1 ? RB.Setup[40+x]: cnColors[x];
}

function getMaxLevel(gid) {
	var maxLevel;
	switch (gid) {
		case 1:
		case 2:
		case 3:
		case 4: if( village_aid == RB.dictionary[0] ) maxLevel = 25;
				else maxLevel = 10;
			break;
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			maxLevel = 5;
			break;
		case 23:
			maxLevel = 10;
			break;
		case 40:
			maxLevel = 100;
			break;
		default:
			maxLevel = 20;
	}
	return (maxLevel)
}

function cultureCalc () {
	function calcB (bid, lvl, arg) {
		var resneed, cp;
		var cu = 0;
		if (lvl == 0) {
			resneed = bCost[bid];
			cu = 0;
			cp = 0;
		} else if (lvl == 1) {
			resneed = bCost[bid].map(x => Math.round((x*Math.pow(bCost[bid][6], lvl))/5)*5);
			cu = bCost[bid][5];
			cp = Math.round(bCost[bid][4] * Math.pow(1.2, lvl));
		} else {
			resneed = bCost[bid].map(x => Math.round((x*Math.pow(bCost[bid][6], lvl))/5)*5);
			cu = Math.round((5*bCost[bid][5] + lvl-1)/10);
			cp = Math.round(bCost[bid][4] * Math.pow(1.2, lvl));
		}
		if (arg == 'cu') return cu;
		if (arg == 'cp') return cp;
		if (arg == 'resneed') return resneed;
	}
	function createEl (bid,blevel,newB) {
		var resneed = calcB(bid,blevel,'resneed');
		var cu = 0;
		for( var i=0; i<=blevel; i++ ) {
			cu = cu + calcB(bid,i,'cu');
		}
		if (newB == 1) {
			return $em('DIV',[' ',$e('IMG',[['src',img_cp],['title',RB.dictionary[19]],['style','display:inline-block;']]),' '+calcB(bid,blevel,'cp')+' -> '+calcB(bid,blevel+1,'cp')+' ',
				$e('i',[['class','r5'],['title',RB.dictionary[20]],['style','display:inline-block;']]),' '+cu+' -> '+(cu + calcB(bid,blevel+1,'cu'))+' ',
				$e('IMG',[['src',img_car],['style','display:inline-block;']]),'/',$e('IMG',[['src',img_cp],['title',RB.dictionary[19]],['style','display:inline-block;']]),' ',
				((calcB(bid,blevel+1,'cp')-calcB(bid,blevel,'cp'))!=0)?Math.round((resneed[0]+resneed[1]+resneed[2]+resneed[3])/(calcB(bid,blevel+1,'cp')-calcB(bid,blevel,'cp'))).toLocaleString():'-'],
				[['style','white-space:nowrap;']]);
		} else {
			return $em('DIV',[' ',$e('i',[['class','rAll'],['style','display:inline-block;']]),'/',$e('i',[['class','culturePoints_medium'],['style','display:inline-block;'],['title',RB.dictionary[19]]]),' ',
				((calcB(bid,blevel+1,'cp')-calcB(bid,blevel,'cp'))!=0)?Math.round((resneed[0]+resneed[1]+resneed[2]+resneed[3])/(calcB(bid,blevel+1,'cp')-calcB(bid,blevel,'cp'))).toLocaleString():'-'],
				[['style','white-space:nowrap;']]);
		}
	}
	var blevel = $gc('level',$gt('h1',cont)[0]);
	if( blevel.length > 0 ) {
		var contr = $g('contract');
		if( ! contr ) return;
		blevel = parseInt(blevel[0].innerHTML.match(/\d+/)[0]);
		var bid = parseInt($g('build').getAttribute('class').match(/\d+/)[0]);
		var clocks = $gc('culturePointsAndPopulation',contr.parentNode);
		var uc = $gc('underConstruction',cont);
		if (uc.length > 0) blevel = blevel + uc.length;
		if( clocks.length > 0 ) {
			if( clocks[0].childElementCount > 0 ) {
				var cB = createEl(bid, blevel, 0);
				var cl = $gc('wrapper',contr.parentNode);
				cl[0].style.gridTemplateColumns = "auto auto auto auto";
				cl[0].appendChild(cB);
			}
		}
	} else {
		var bnew = $gc('contractWrapper',cont);
		for( var i=0; i<bnew.length; i++ ) {
			bid = parseInt(bnew[i].id.match(/\d+/)[0]);
			var clocks = $gc('resourceWrapper',bnew[i]);
			if( clocks.length > 0 ) {
				var cB = createEl(bid, 0, 1);
				var cl = $gc('lineWrapper',bnew[i]);
				$ib(cB,cl[0]);
			}
		}
	}
}

if( /dorf[1,2]\.php/.test(crtPath) ) TM_ShowMainBuildingNumbers();
if( /^\/build/.test(relName) ) cultureCalc();
}
/****************************** end Center Number ****************************/

function allyQStats (members) {
	var sumC = 0, sumV = 0;
	var villRow = RB.Setup[46] == 1 ? 5 : 4;
	for( var i=1; i<members.rows.length; i++ ) {
		sumC += parseInt( members.rows[i].cells[3].textContent );
		sumV += parseInt( members.rows[i].cells[villRow].textContent );
	}
	i--;
	var semafor = $e('div',[['style','text-align:center;']]);
	var semafor1 = $e('div');
	var semafor2 = $e('div');
	var semafor3 = $e('div');
	for( var t=1; t<6; t++ ) {
		var blue = $xf('.//img[contains(@class,"online'+t+'")]','l',members);
		if( blue.snapshotLength > 0 )
			semafor1.appendChild($em('SPAN',[blue.snapshotItem(0).cloneNode(true),' = ',blue.snapshotLength,'; ']));
	}
	for( var t=1; t<((RB.Setup[47]==1)?9:4); t++ ) {
		if (t==4 || t==5) continue;
		var tribe = $xf('.//i[contains(@class,"tribe'+t+'_medium")]','l',members);
		if( tribe.snapshotLength > 0 ) {
			semafor2.appendChild($e('i',[['class','tribeIcon tribe'+t+'_medium']]));
			semafor2.appendChild($ee('SPAN',' = '+tribe.snapshotLength+'; '));
		}
	}
	for( var t=1; t<3; t++ ) {
		var spec = $xf('.//div[contains(@class,"type'+t+'")]','l',members);
		if( spec.snapshotLength > 0 ) {
			semafor3.appendChild($e('DIV',[['class','memberSpecialization type'+t],['style','float:none;display:inline-block;']]));
			semafor3.appendChild($ee('SPAN',' = '+spec.snapshotLength+'; '));
		}
	}
	semafor.appendChild(semafor1);
	semafor.appendChild(semafor2);
	semafor.appendChild(semafor3);
	var newT = $em('TR',[$c(semafor,[['colspan',3]]),$c(sumC+' / '+i+' = '+Math.round(sumC/i)),$c(sumV+' / '+i+' = '+Math.round(sumV/i),[['style','text-align:center;']])]);
	if( members.rows[1].cells.length > 5 ) newT.appendChild($c('&nbsp;',[['colspan',members.rows[1].cells.length-5]]));
	members.appendChild($ee('TBODY',newT));
}

function calcTroopCost () {
	function resRecalc () {
		allWR = [0,0,0,0,0,0];
		var nc = 0;
		for( var i=0; i < wRes.length; i++ ) {
			nc = parseInt(wRes[i][0].value).NaN0();
			for( var t=0; t<6; t++ ) allWR[t] += wRes[i][t+2] * nc;
		}
		var wantD = '>'+allWR[1]+' >'+allWR[2]+' >'+allWR[3]+' >'+allWR[4];

		var newBTX = $ee('BUTTON',gtext("close")+' (X)',[['onclick',jsNone],['class',allIDs[15]],['style','direction:ltr']]);
		newBTX.addEventListener('click', closeTip, true);

		var nts = tshift>0 ? tshift + (RunTime[0] - (Date.now())) / 1e3: 0;
		var newR = $em('TR',[$em('TD',[$e('i',[['class','clock_medium']]),' ',$eT('SPAN',allWR[0]+nts,0),' ',$e('i',[['class','r5']]),' ',allWR[5]]),$c(newBTX)]);
		var newTbl = $ee('TABLE',newR,[['class',allIDs[7]],['style','background-color:#FAFAFF;']]);
		var newT = needed_show( wantD );
		newR = $ee('TR',$c(newT,[['colspan',2]]));
		newTbl.appendChild(newR);
		closeWindowN(9);
		var xy = offsetPosition(this);
		windowID[9] = makeFloat(newTbl,xy[0]-(ltr?100:300),xy[1]-60);
	}
	function closeTip () {
		closeWindowN(9);
	}

	var inp = $gt('INPUT',cont);
	var t = 0;
	var wRes = [];
	for( var i=0; i < inp.length; i++ ) {
		var tinp = inp[i];
		var tname = tinp.getAttribute('name');
		var tarm = tname.match(/t(\d+)/);
		if( tarm ) tarm = tarm[1]; else continue;
		var res = $gc('resourceWrapper', tinp.parentNode.parentNode);
		if (res.length > 0 ) {
			var base = res[0].innerHTML;
			var nTime = toSeconds($gc('duration', tinp.parentNode.parentNode)[0].innerHTML);
		}
		var nRes = base.match(/>(\d+).+?>(\d+).+?>(\d+).+?>(\d+).+?>(\d+)/);
		wRes[t++] = [tinp,tname,nTime,parseInt(nRes[1]),parseInt(nRes[2]),parseInt(nRes[3]),parseInt(nRes[4]),parseInt(nRes[5])];
		tinp.addEventListener('keyup', resRecalc, false);
		tinp.addEventListener('click', resRecalc, false);
	}
	var tshift = 0;
	var upt = $xf('.//table[@class="under_progress"]','l',cont);
	if( upt.snapshotLength > 0 ) {
		upt = upt.snapshotItem(0);
		var ts = $xf('.//td[@class="dur"]/span','l',upt);
		tshift = toSeconds(ts.snapshotItem(ts.snapshotLength-1).innerHTML);
		var allUC = new Object();
		var mFL = false;
		var ts = $xf('.//td[@class="desc"]/img','l',upt);
		for( var i=0; i < ts.snapshotLength; i++ ) {
			var uclass = ts.snapshotItem(i).getAttribute('class');
			if( typeof(allUC[uclass]) == 'undefined' ) allUC[uclass] = ['',0,0];
			allUC[uclass][0] = ts.snapshotItem(i).getAttribute('alt');
			allUC[uclass][1] += parseInt(ts.snapshotItem(i).parentNode.innerHTML.onlyText().match(/\d+/)[0]);
			if( allUC[uclass][2] > 0 ) mFL = true; else allUC[uclass][2]++;
		}
		if( mFL ) {
			var ts = $xf('.//tbody','f',upt);
			for( var i in allUC )
				ts.appendChild($ee('TR',$em('TD',[trImg(allIDs[45]+' '+i,allUC[i][0]),' '+allUC[i][1]+' '+allUC[i][0]],[['colspan',3]])));
		}
	}
}

function saveHeroSpeed () {
	var sb = $gc("speed tooltip",cont);
	if( sb.length > 0 ) {
		RB.dictFL[19] = sb[0].innerHTML.match(/>\s*?(\d+)/)[1];
		saveCookie( 'DictFL', 'dictFL' );
	}
}

function saveHeroPower () {
	var ap = $g('attributepower');
	if (ap) {
		var pw = $gc("powervalue",ap);
		if( pw.length > 0 ) {
			RB.dictFL[17] = pw[0].textContent.onlyText().trim();
			saveCookie( 'DictFL', 'dictFL' );
		}
	}
	if ( /hero/.test(crtPath)) {
		var MutationObserver = window.MutationObserver;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'childList') {
					checkHeroPower();
					checkHeroSpeed();
				}
			});
		});
		observer.observe(cont, { childList: true, subtree: true });
	}
	function checkHeroPower () {
		var heroattr = $gc('heroAttributes',cont);
		if (heroattr.length > 0) {
			RB.dictFL[17] = $gc("value", heroattr[0])[0].textContent.onlyText().trim();
			saveCookie( 'DictFL', 'dictFL' );
		}
	}
	function checkHeroSpeed () {
		var heroattr = $gc('speedValue',cont);
		if (heroattr.length > 0) {
			RB.dictFL[19] = heroattr[0].textContent.match(/\d+/)[0];
			saveCookie( 'DictFL', 'dictFL' );
		}
	}
	
}

function saveHeroMount () {
	var hr = $g('horse');
	if ( hr ) {
		checkHeroMount();
		var MutationObserver = window.MutationObserver;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'childList') {
					checkHeroMount();
				}
			});
		});
		observer.observe(hr, { childList: true, subtree: true });
	
		function checkHeroMount () {
			if( hr.hasChildNodes() ) {
				RB.dictFL[18] = 1;
				saveCookie( 'DictFL', 'dictFL' );
			} else {
				RB.dictFL[18] = 0;
				saveCookie( 'DictFL', 'dictFL' );
			}
		}
	} else {
		var MutationObserver = window.MutationObserver;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'childList') {
					vtable = $gc("equipmentSlots");
					if (vtable.length == 1) {
						checkHeroMount();
					}
				}
			});
		});
		observer.observe(cont, { childList: true, subtree: true });
		function checkHeroMount () {
			var chorse = $gc('horse',vtable[0]);
			if (chorse.length > 0) {
				if (chorse[0].classList.contains("empty")) {
					RB.dictFL[18] = 0;
					saveCookie( 'DictFL', 'dictFL' );
				} else {
					RB.dictFL[18] = 1;
					saveCookie( 'DictFL', 'dictFL' );
				}
			}
		}
	}
}

function goldClubInfo () {
	function checkClass (clName,chkbox) {
		var ac = $xf('.//tr[(.//i[contains(@class,"'+clName+'")]) and not(contains(@class, "disabled"))]','l',chkbox.parentNode.parentNode.parentNode.parentNode.tBodies[0]);
		for( var t=0; t < ac.snapshotLength; t++ ) {
			$gt('INPUT',ac.snapshotItem(t))[0].checked=chkbox.checked;
		}	
	}
	function checkGreen () {
		checkClass('attack_won_withoutLosses_small',this);
	}
	function checkUni (a) {
		checkClass(a[0],a[1]);
	}
	function checkAll () {
		var ai = $gt('INPUT',this.parentNode.parentNode.parentNode.parentNode.parentNode.tBodies[0]);
		for( var i=1; i<ai.length; i++ )
			ai[i].checked=this.checked;
	}
	function makeChkBox (fListID) {
		return $e('INPUT',[['type','checkbox']]);
	}
	function oasisXY (farmList) {
		var oXY = $gc('coordinatesWrapper',farmList);
		for(var i=0; i<oXY.length; i++) {
			//var xy = id2xy(getVidFromCoords(oXY[i].innerHTML));
			//var newA = '<a href="position_details.php?x='+xy[0]+'&y='+xy[1]+'">'+oXY[i].innerHTML+'</a>';
			//oXY[i].innerHTML = newA;
		}
		return i;
	}
	function uncheckOasis (nd) {
		while (nd.parentNode) {
			nd = nd.parentNode;
			if (nd.tagName === 'TR') {
				$gt('input',nd)[0].checked=false;
				break;
			}
		}
	}
	function findAnimA (x) {
		var vid = getVidFromCoords(x[0].innerHTML);
		var xy = id2xy(vid);
		getAjaxToken();
		param = '{"x":'+xy[0]+',"y":'+xy[1]+'}';
		ajaxRequest(fullName+'api/v1/map/tile-details', 'POST', param, function(ajaxResp) {
			var mapData = JSON.parse(ajaxResp.responseText);
			var adv = $ee('DIV',mapData.html,[['style','display:none;']]);
			ad = $xf('.//table[@id="troop_info"]','f',adv);
			if( ad ) {
				chkOasisFL[x[1]][vid] = getTroopsInOasis(ad);
				if( ! chkOasisFL[x[1]][vid] ) {
					ad = $xf('.//table[@id="village_info"]','f',adv);
					if( ad ) chkOasisFL[x[1]][vid] = ad;
				}
				addToolTip(chkOasisFL[x[1]][vid],x[0].parentNode);
				if( chkOasisFL[x[1]][vid] )
					uncheckOasis(x[0]);
			}
			if( ! x[3] ) {
				x[2].removeAttribute('style');
				x[2].click();
			}
		}, dummy);
	}
	function findAnim (farmList,fListID,cb) {
		var ac = $gc('coordinatesWrapper',farmList.parentNode);
		var curTO = 0;
		for(var i=ac.length-1; i>=0; i--) {
			var vid = getVidFromCoords(ac[i].innerHTML);
			if( typeof(chkOasisFL[fListID][vid]) == 'undefined' ) {
				cb.style.color = cb.style.color=='black'?'red':'black';
				setTimeout(function(x) { return function() { findAnimA(x) }}([ac[i],fListID,cb,i]), curTO);
				curTO += getRandom(250,1000);
			} else {
				if( chkOasisFL[fListID][vid] ) {
					uncheckOasis(ac[i]);
					if( chkOasisFL[fListID].fl )
						addToolTip(chkOasisFL[fListID][vid],ac[i].parentNode);
				}
			}
		}
		chkOasisFL[fListID].fl = false;
	}
	function scanGoldRep () {
		var fTable;
		function addARLFilter (sc,cl,tag) {
			var ac = $xf('.//'+tag+'[contains(@class,"'+sc+'")]','f',fTable.tBodies[0]);
			if( ac ) {
				var nca = makeChkBox(fListID);
				nca.addEventListener('click',function(i) { return function() { checkUni(i) }}([sc,nca]),false);
				$am(sp.firstElementChild,[' | ',nca,' ',trImg(cl+' '+sc,'','i')]);
			}
			fTable.tHead.insertBefore(sp, fTable.tHead.firstChild);
		}
		var fList = $gn('selectAll',cont);

		for( var i=0; i < fList.length; i+=2 ) {
			if (fList[i].tagName != 'INPUT') continue;
			fTable = fList[i].parentNode.parentNode.parentNode.parentNode.parentNode;
			if (fTable.parentElement.parentElement.classList.contains('collapsed') ) continue;
			var fListInput = $gt('INPUT',fTable.tHead);
			if( fListInput.length > 1 ) continue;
			var fListID = fList[i].getAttribute('data-farm-list-id');
			fList[i].addEventListener('click',checkAll,false);
			var nc = makeChkBox(fListID);
			nc.addEventListener('click',checkGreen,false);
			var sp = $em('TR',[$em('td',[nc,trImg('lastRaidState attack_won_withoutLosses_small',RB.dictRp[0],'i')],[['colspan','8']])]);
			addARLFilter('attack_small','','i');
			addARLFilter('bounty_full_small','','i');
			addARLFilter('bounty_half_small','','i');
			
			if( oasisXY(fTable) ) {
				if( typeof(chkOasisFL[fListID]) == 'undefined'  )
					chkOasisFL[fListID] = new Object;
				chkOasisFL[fListID].fl = true;
				var anim = $em('BUTTON',[trImg('unit u31'),' ??? '],[['onclick','return false;']]);
				anim.addEventListener('click',function(x) { return function() { findAnim(x[0],x[1],x[2]) }}([fTable,fListID,anim]),false);
				$am(sp.firstElementChild,[' | ',anim]);
			}

			var allBer = $xf('.//a[contains(@href, "report?id=")]','l',fTable);
			for( var t=0; t < allBer.snapshotLength; t++ ) {
				var tImg = $gt('i',allBer.snapshotItem(t));
				if( tImg.length > 0 ) {
					allBer.snapshotItem(t).addEventListener('click', function(x) { return function() { selectMessage(x); }}([allBer.snapshotItem(t).getAttribute('href'),offsetPosition(tImg[0])]), true);
					allBer.snapshotItem(t).removeAttribute('href');
				}
			}

			/*
			var flID = $gt('INPUT',fList[i].parentNode)[0].getAttribute("onclick").match(/\d+/)[0];
			if( flID != RB.village_Var[2] ) {
				RB.village_Var[2] = flID;
				saveVCookie( 'VV', RB.village_Var );
				if( RB.dictFL[22] == 0 ) {
					try {
						var tm = $gc('tabItem',$gc('active',$gc('subNavi',cont)[0])[0])[0].innerHTML.onlyText().trim();
					} catch(err) {
						var tm = false;
					}
					if( tm ) {
						RB.dictionary[22] = tm;
						saveCookie( 'Dict', 'dictionary' );
						RB.dictFL[22] = 1;
						saveCookie( 'DictFL', 'dictFL' );
					}
				}
			}
			*/
		}
	}
	function selectMessage ( a ) {
		viewMessageIWDisplay( a[0], 1, a[1] );
	}

	var xy = RB_getValue(GMcookieID + 'next', -1);
	if( $gn('x').length < 1 ) {
		if( xy > 0 ) {
			if( RB.overview[1] == "gc" ) {
				RB.overview[1] = "";
				saveCookie('OV', 'overview');
				xy = id2xy( xy );
				document.location.href = 'karte.php?x='+xy[0]+'&y='+xy[1];
			}
		}
		dictRpInit();
		var chkOasisFL = new Object();
		setInterval(scanGoldRep, 1000);

		/*
		document.head.appendChild($ee('SCRIPT','function '+allIDs[0]+'(a){'+
		'$("#list"+a).find(".markSlot").each(function(c,d){'+
			'Travian.Game.RaidList.data[a].slots[d.name.match(/\\d+/)[0]].marked=d.checked;'+
		'});Travian.Game.RaidList.updateTroopSummaryForAList(a);};',[['type',"text/javascript"]]));
		*/

	} else {
		if( xy > 0 ) {
			fillXY();
			RB.overview[1] = "gc";
			saveCookie('OV', 'overview');
		}
		var ss = $g('raidListSlot');
		if( ss ) {
			addShowDistanceIn( $g('save'), 0 );
			ss.addEventListener('keyup', a2bInfo, false);
			ss.addEventListener('click', a2bInfo, false);
		}
	}
}

function calcNPCtroops () {
	var allD = $gc('details',cont);
	for( var i=0; i<allD.length; i++ ) {
		var woodU = allD[i].innerHTML.match(/>\s*?(\d+)/)[1];
		var npcI = $gc('npc',allD[i]);
		if( npcI.length < 1 ) return;
		var woodN = allD[i].innerHTML.match(/r1=(\d+)&/)[1];
		npcI[0].parentNode.appendChild($ee('SPAN','('+(Math.floor(woodN/woodU))+')',[['style','padding:0px 5px;']]));
	}
}

function calcUnitUpgrade () {
	function showUnitUpgrade ( aN ) {
		var ITTb = $e('TBODY');
		var newITT = $ee('TABLE',ITTb,[['class',allIDs[7]]]);
		if( aN[1] > 0 ) ITTb.appendChild(trUC(aN[0],0));
		if( aN[1] > 1 ) ITTb.appendChild(trNull());
		var hlTR = trUC(aN[0],aN[1]);
		hlTR.firstChild.setAttribute('style','background-color:#FF8000;');
		ITTb.appendChild(hlTR);
		if( aN[1] < 19 ) ITTb.appendChild(trUC(aN[0],aN[1]+1));
		if( aN[1] < 18 ) ITTb.appendChild(trNull());
		if( aN[1] < 20 ) ITTb.appendChild(trUC(aN[0],20));
		var tHead = $ee('THEAD',$em('TR',[$c('#'),$c(trImg('att_all')),$c(trImg('def_i')),$c(trImg('def_c'))]));
		newITT.appendChild(tHead);
		makeTooltip(newITT);
	}
	function sUC (tt,c,ul) {
		return gti(tt,c,1)>0?(gti(tt,c,1)+(gti(tt,c,1)+300*gti(tt,9,1)/7)*(Math.pow(1.007,ul)-1)).toFixed(1):0;
	}
	function trUC (tt,ul) {
		return $em('TR',[$c(ul),$c(sUC(tt,0,ul)),$c(sUC(tt,1,ul)),$c(sUC(tt,2,ul))]);
	}
	function trNull () {
		return $ee('TR',$c('...',[['colspan',4],['style','text-align:center;']]));
	}

	var allD = $xf('.//img[contains(@class,"unit ")]','l',cont);
	for( var i=0; i<allD.snapshotLength; i++ ) {
		var uname = allD.snapshotItem(i).getAttribute('class').match(/\d+/)[0];
		var rpn = allD.snapshotItem(i);
		do {
			rpn = rpn.parentNode;
			var spn = $gt('SPAN',rpn);
		} while( spn.length < 1 )
		if( spn[0].innerHTML.match(/:\d+:/) ) continue;
		var curL = parseInt(spn[0].innerHTML.match(/\d+/)[0]);
		spn[0].addEventListener("mouseover", function(x) { return function() { showUnitUpgrade(x); }}([uname,curL]), false);
		spn[0].addEventListener("mouseout", removeTooltip, false);
		spn[0].appendChild(trImg(allIDs[47]));
	}
}

function stopRP () {
	if( RB.Setup[10] > 2 ) {
		var unsafeWindow = this['unsafeWindow'] || window;
		if(typeof unsafeWindow.reload_enabled == 'undefined')
			document.head.appendChild($ee('script','reload_enabled=false',[['type',"text/javascript"]]));
		else
			unsafeWindow.reload_enabled='false';
	}
}

function spielerSort() {
	var once = false;
	if( /\/edit/.test(relName) ) return;
	var vtable = $g("villages");
	if ( ! vtable ) {
		var target = $g('playerProfile');
		var MutationObserver = window.MutationObserver;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'childList') {
					vtable = $gc("villages");
					if ( vtable.length == 1 ) {
						vtable = vtable[0];
						observer.disconnect();
						sortTable();
						parseSpieler();
						once = true;
					}
				}
			});
		});
		var config = { childList: true, subtree: true };
		observer.observe(target, config);
	} else sortTable();

	function sortTable () {
		if (once) return;
		function aSort(a, b) {
			var a = a[lastSC];
			var b = b[lastSC];
			var aa = parseFloat(a.replace(/,/, '.'));
			var bb = parseFloat(b.replace(/,/, '.'));
			if ( isNaN(aa) || isNaN(bb) ) return a < b ? -1: a > b ? 1: 0;
			else return aa - bb;
		}

		function sortSpieler (sc) {
			if( lastSC == sc ) lastSD = 1 - lastSD;
			lastSC = sc;
			vtArr.sort(aSort);
			if( lastSD == 1 ) vtArr.reverse();
			for( var i = 0; i < vtCount; i++ ) {
				vtable.tBodies[0].appendChild(vtArr[i][4]);
			}
		}

		var sortCell;
		var vtrows = vtable.tHead.rows[0];
		var colNo = vtrows.cells.length;
		switch(colNo) {
			case 5: sortCell = [0,2,4]; break;
			case 6: sortCell = [1,3,5]; break;
			case 7: sortCell = [1,3,5,6]; break;
			default: sortCell = [1,3,5];
		}
		for( var i=0; i<sortCell.length; i++ ) {
			var newSL = $a(vtrows.cells[sortCell[i]].innerHTML,[['href',jsVoid]]);
			newSL.addEventListener('click', function(x) { return function() { sortSpieler(x); }}(i), false);
			vtrows.cells[sortCell[i]].textContent = "";
			vtrows.cells[sortCell[i]].appendChild(newSL);
		}

		var lastSD = 1;
		var lastSC = 0;
		var vtrows = vtable.tBodies[0].rows;
		var vtCount = vtrows.length;
		var vtArr = [];
		for (var i = 0; i < vtCount; i++) {
			vtArr[i] = [];
			for( var t=0; t < sortCell.length; t++ ) {
				vtArr[i][t] = vtrows[i].cells[sortCell[t]].textContent.onlyText();
			}
			vtArr[i][4] = vtrows[i];
		}
	}
}

function getNextReportPage ( bl ) {
	var nFL = false;
	var navLink = $gc('next',(bl||cont));
	if( navLink.length > 0 ) {
		if( navLink[0].getAttribute('href') ) nFL = navLink[0].getAttribute('href');
	}
	return nFL;
}

function reportsDelOrSearch () {
	var reportsForm = $g('reportsForm');
	if( !reportsForm ) return;
	var buttons = $gt('button',reportsForm);
	if (buttons.length > 0) {
		dictRpInit();
	}
}

function messagesTopButtons () {
	var messagesForm = $g('messagesForm');
	if( !messagesForm ) return;
	var buttons = $gt('button',messagesForm);
	for (i=0; i<buttons.length; i++) {
		if (buttons[i].name == 'mark') {
			var markasreadButt = buttons[i];
		}
		if (buttons[i].name == 'delete') {
			var delButt = buttons[i];	
		}
		if (buttons[i].name == 'archive') {
			var archiveButton = buttons[i];
		}
	}
	if (buttons.length > 0) {
		if ( archiveButton ) { 
			var newArcAbove = archiveButton.cloneNode(true);
			ltr ? newArcAbove.style.marginLeft = "4px" : newArcAbove.style.marginRight = "4px";
			messagesForm.prepend(newArcAbove);
		}
		if ( delButt ) {
			var newDelAbove = delButt.cloneNode(true);
			ltr ? newDelAbove.style.marginLeft = "4px" : newDelAbove.style.marginRight = "4px";
			messagesForm.prepend(newDelAbove);
		}	
		if ( markasreadButt ) {
			var newMarkAbove = markasreadButt.cloneNode(true);
			messagesForm.prepend(newMarkAbove);
		}
	}
}

function dictRpInit () {
	loadCookie( 'DictRp', 'dictRp' );
	loadCookie( 'DictRpFL', 'dictRpFL' );
	var FL = false;
	for( var i=0; i < 12; i++ ) {
		if( RB.dictRpFL[i] == 1 ) continue;
		var img = $gc('iReport'+iReports[i],cont);
		for( var j = 0; j < img.length; j++ ) {
			if( img[j].hasAttribute('alt') ) {
				RB.dictRp[i] = img[j].getAttribute('alt');
				RB.dictRpFL[i] = 1;
				FL = true;
			} else {
				if( img[j].parentNode.hasAttribute('alt') ) {
					RB.dictRp[i] = img[j].parentNode.getAttribute('alt');
					RB.dictRpFL[i] = 1;
					FL = true;
				}
			}
		}
	}
	if( FL ) {
		saveCookie( 'DictRp', 'dictRp' );
		saveCookie( 'DictRpFL', 'dictRpFL' );
	}
}

function getVTip (vID) {
	if( isNaN(vID) || RB.Setup[36] != 1 ) return '';
	var newTip = '';
	if( RB.vHint[vID] != undefined ) newTip = RB.vHint[vID];
	else if( typeof flinks[vID] != 'undefined' ) newTip = flinks[vID];
	return newTip;
}

function convertLinks () {
	function fillObj (arr) {
		for( var i = 0; i < arr.length; i++ ) {
			var oneLink = arr[i].split("\/@_");
			var tVId = parseInt(oneLink[0].match(/d=(\d+)/)[1]);
			flinks[tVId] = oneLink[1];
		}
	}
	flinks = new Object();
	loadVCookie('ln3', 'ln3', village_aid, 1);
	if( RB.ln3[0] == 0 ) RB.ln3.length = 0;
	fillObj(RB.ln3);
	var alinks = RB_getValue(GMcookieID + "ln", "").split("@@_");
	alinks.splice((alinks.length - 1), 1);
	fillObj(alinks);
}

function underProgressSave (gid) {
	var upt = $gc('under_progress',cont);
	if( upt.length > 0 ) {
	// [i*4+1 gid, i*4+2 time, i*4+3 description, i*4+4 ending]
		loadZVCookie('Dorf14','village_dorf14');
		var newCookie = [0];
		var fl = false;
		for( var i=0; i<RB.village_dorf14[0]; i++ ) {
			if( RB.village_dorf14[i*4+1] == gid ) continue;
			newCookie[0]++;
			newCookie.push(RB.village_dorf14[i*4+1],RB.village_dorf14[i*4+2],RB.village_dorf14[i*4+3],RB.village_dorf14[i*4+4]);
			fl = true;
		}
		var tinfo_c = new RegExp('"'+allIDs[47]+'"');
		for( var i=1; i<upt[0].rows.length; i++ ) {
			var td = upt[0].rows[i].cells;
			if( td.length < 3 ) break;
			newCookie[0]++;
			var ts = td[1].innerHTML.match(/\d+:\d\d:\d\d/);
			newCookie.push(gid, Math.round(RunTime[0]/1000) + toSeconds(ts?ts[0]:"0:00:00"),
							td[0].innerHTML.replace(/[\n\t]/g,' ').replace(/\s+/g,' ').replace(tinfo_c,'"tinfo_c"').replace(/<a.*?<\/a>/g, ''),
							td[2].innerHTML.replace(/[\n\t]/g,' ').replace(/\s+/g,' ').onlyText());
			fl = true;
		}
		if( fl ) saveVCookie('Dorf14',newCookie,1);
	}
}

function villageBMover () {
	function villBMSaveChange () {
		var newCookie = [0];
		for( var i=0; i<crossN.length; i++ ) {
			if( crossN[i] != crossR[i] ) {
				newCookie[0]++;
				newCookie.push(crossR[i],crossN[i]);
			}
		}
		if( newCookie[0] > 0 ) saveVCookie('vBMn',newCookie,1);
		location.reload();
	}
	function villBMClick ( bn ) {
		if( startFL ) {
			aBuild = crossN[bn];
			var clsname = areas[bn].getAttribute("class");
			var re1 = new RegExp("a"+aBuild.toString(),"g");
			var re2 = new RegExp("aid"+aBuild.toString(),"g");
			clsname = clsname.replace(re1, "a41").replace(re2, "aid41");
			areas[bn].setAttribute("class",clsname);
			zBN = bn;
			startFL = false;
		} else {
			if( bn == zBN ) {
				startFL = true;
				var clsname = areas[bn].getAttribute("class");
				clsname = clsname.replace("a41", "a"+aBuild.toString()).replace("aid41", "aid"+aBuild.toString());
				areas[bn].setAttribute("class",clsname);
			} else {
				tBuild = crossN[bn];
				crossN[bn] = aBuild;
				crossN[zBN] = tBuild;
				aBuild = tBuild;
				var clsname1 = areas[zBN].getAttribute("class");
				var clsname2 = areas[bn].getAttribute("class");
				clsname1 = clsname1.replace("a41", "a"+aBuild.toString()).replace("aid41", "aid"+aBuild.toString());
				areas[zBN].setAttribute("class",clsname1);
				var re1 = new RegExp("a"+crossN[zBN].toString(),"g");
				var re2 = new RegExp("aid"+crossN[zBN].toString(),"g");
				clsname2 = clsname2.replace(re1, "a"+crossN[bn].toString()).replace(re2, "aid"+crossN[bn].toString());
				areas[bn].setAttribute("class",clsname2);
				startFL = true;
			}
		}
	}
	function villBMCancel () {
		saveVCookie('vBMn',[0],1);
		location.reload();
	}
	function villBMStart () {
		if( inAct ) {
			villBMSaveChange();
		} else {
			var path = $gt('path',vmap);
			for( var i=0; i<path.length; i++) {
				path[i].removeAttribute('onclick');
				var clone = path[i].cloneNode(true);
				path[i].parentNode.replaceChild(clone, path[i]);
			}
			var colorLayer = $gc('colorLayer',vmap);
			for( var i=0; i<colorLayer.length; i++) {
				colorLayer[i].removeAttribute('href');
			}
			for( var i=0; i<areas.length-3; i++) {
				elClone = areas[i].cloneNode(true);
				areas[i].parentNode.replaceChild(elClone, areas[i]);
				areas[i].addEventListener('click',function(x) { return function() { villBMClick(x) }}(i),false);
			}
			act.style.backgroundColor='yellow';
			$at($gt('IMG',act)[0],[['title',gtext("ok")]]);
			var act_r = $ee('DIV',gtext("reset"),
				[['style','position:absolute;top:124px;left:'+(ltr?820:380)+'px;z-index:500;width:79px;background-color:red;text-align:center;cursor:pointer;']]);
			act_r.addEventListener('click',villBMCancel,false);
			vmap.appendChild(act_r);
			var act_s = $ee('DIV',gtext("save"),
				[['style','position:absolute;top:172px;left:'+(ltr?820:380)+'px;z-index:500;width:79px;background-color:lime;text-align:center;cursor:pointer;']]);
			act_s.addEventListener('click',villBMSaveChange,false);
			vmap.appendChild(act_s);
			inAct = true;
			zImg = trImg(allIDs[47],'empty');
			zImg.setAttribute('style','display:none;');
			vmap.appendChild(zImg);
		}
	}

	var vmap = $g('villageContent');
	if( ! vmap ) return;
	var aBuild = 0;
	var tBuild = 0;
	var zBN = 0;
	var zImg = '';
	var areas = $gc('buildingSlot',vmap);
	var cross = [];
	if( areas.length < 21 ) return;
	loadZVCookie('vBMn','vBMn');
	for( var i=0; i<areas.length-3; i++) cross[i]=i+19;
	var crossN = cross.slice();
	var crossR = cross.slice();

	if( RB.vBMn[0] > 0 ) {
		for( i=0; i<RB.vBMn[0]; i++) {
			var f = RB.vBMn[i*2+1];
			var t = RB.vBMn[i*2+2];
			crossN[f] = parseInt(t);
			var clsname = areas[f-19].getAttribute("class");
			var re1 = new RegExp("a"+f,"g");
			var re2 = new RegExp("aid"+f,"g");
			clsname = clsname.replace(re1, "a"+t).replace(re2, "aid"+t);
			areas[f-19].setAttribute("class",clsname);
		}
	}

	var inAct = false;
	var startFL = true;
	var act = $ee('DIV',$e('IMG',[['src',img_bmove],['title',gtext("bmove")]]),
		[['style','position:absolute;top:140px;left:'+(ltr?820:380)+'px;z-index:500;width:79px;height:32px;cursor:pointer;']]);
	act.addEventListener('click',villBMStart,false);
	vmap.appendChild(act);
}

function oasisKirilloid (vf) {
	var troopsTR = $xf('.//tr[td/img[contains(@class, "unit u")]]','l',vf);
	if( troopsTR.snapshotLength < 1 ) return false;

	var kirillRace = ['','r1','r2','','r3','r4','r5'];
	var kirillS = kirillRace[RB.Setup[2]]+'RuUb#d:p500r3'+((RB.Setup[46]==1)?'m9':'')+'#r3u';

	var anim = new Array(10);
	for( var i=0; i<troopsTR.snapshotLength; i++ )
		anim[parseInt($gt('IMG',troopsTR.snapshotItem(i))[0].getAttribute('class').match(/\d+/)[0])-31] =
			toNumber(troopsTR.snapshotItem(i).cells[1].innerHTML);

	for(i=0; i<10; i++) kirillS += anim[i] ? anim[i]+',': ',';
	kirillS = '#a:'+kirillS.replace(/,*$/,'U');
	return $a('(kirilloid.ru)',[['href','http://travian.kirilloid.ru/warsim2.php'+kirillS],['target','_blank'],['style','font-size:11px;']]);
}

function displayWhatIsNew () {
	if ($g('whatsnew')) { 
		$g("whatsnew").style.visibility = "visible"; return; } 
	else {
		var box = $e('div',[['id','whatsnew'],['style','width:410px;position:fixed;top:50%;left:50%;transform: translate(-50%,-50%);color:black;background-color:#FFFFFF;padding:5px 5px;border-radius:1em;z-index:999;opacity:0.90;']]);
		var header = $e('div',[['style','height:35px;font-size:130%;font-weight:bold;text-align:center;']]);
		var content = $e('div',[['style','margin:0px 20px;font-size: 13px;']]);
		var footer = $e('div',[['style','display:table;margin:15px 20px 5px;width:370px;']]);
		var feedback = $ee('div',$a('Feedback',[['href',homepageurl],['target','_blank']]),[['style','display:table-cell;width:33%;']]);
		var homepage = $ee('div',$a('Homepage',[['href',homepageurl],['target','_blank']]),[['style','display:table-cell;width:33%;text-align:center;']]);
		var donate = $ee('div',$a('Donate',[['href','https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=56E2JM7DNDHGQ&item_name=T4.4+script&currency_code=EUR'],['target','_blank']]),[['style','display:table-cell;width:33%;text-align:'+docDir[1]+';']]);
		var closeb = $ee('div',$a('X',[['style','font-size:120%;float:'+docDir[1]+';']]),[['style','height:15px;padding:10px;']]);
		header.textContent = "About Travian Resource Bar+";
		content.innerHTML = "<p><b>Changelog</b></p> <p>Version "+version+" - Dec 22, 2023:</p> <ui><li>Fixed troops speed calculation</li><li>Fixed detect attacker's name function</li><li>Added back farm list helper functions</li></ui> <p>Version 2.23.21 - Dec 13, 2023:</p> <ui><li>New option: Travel over the map's edge</li></ui> <p>Version 2.23.20 - Dec 8, 2023:</p> <ui><li>Refresh market info when using Show all button</li></ui> <p>Version 2.23.19 - Dec 5, 2023:</p> <ui><li>Fixes for M(emory) function on market</li></ui>";
		footer.appendChild(feedback);
		footer.appendChild(homepage);
		footer.appendChild(donate);
		box.appendChild(closeb);
		box.appendChild(header);
		box.appendChild(content);
		box.appendChild(footer);
		closeb.addEventListener("click", function(){ $g("whatsnew").style.visibility = "hidden";}, false);
		document.body.appendChild(box);
	}
}

/************************** end test zone ****************************/

// start script

	if( ! $g('l1') ) return;
	var userID = getUserID();
	if (userID == null) return;
	var GMcookieID = crtName + '-' + userID + '-';
	loadCookie ( 'RBSetup', 'Setup' );
	RB_addStyle(acss);
	if ( RB.Setup[0] != version ) {
		//displayWhatIsNew();
		RB.Setup[0] = version;
		saveCookie( 'RBSetup', 'Setup' );
	}
	var xyBody = [0,0];

	loadOVCookie('vHint', 'vHint');
	loadCookie ( 'xy', 'XY' );
	loadCookie ( 'bodyH', 'bodyH' );
	loadCookie ( 'DictFL', 'dictFL' );

	if( RB.Setup[2] == 3 || RB.Setup[2] == 4 || RB.Setup[2] > 7 ) { RB.Setup[2] = 0; saveCookie( 'RBSetup', 'Setup' ); }
	var aText = $xf('//script[contains(@src, "/Variables.js")]');
	if (aText) {
		if (RB.Setup[45] == 0 || RB.Setup[46] == 0 || RB.Setup[47] == 0 || RB.Setup[48] == 0 || RB.Setup[50] == 0) {
			ajaxRequest(aText.src, 'GET', null, function(ajaxResp) {
				var ad = ajaxNDIV(ajaxResp);
				T4_Variables = JSON.parse(ad.textContent.match(/Travian.Variables\s*=\s*(.*});/)[1]);
				ad = null;
				if (RB.Setup[45] == 0) { RB.Setup[45] = T4_Variables.Speed; }
				if (RB.Setup[46] == 0) { RB.Setup[46] = T4_Variables.feature_flags.territory ? 1 : 2; }
				if (RB.Setup[47] == 0) {
					if (T4_Variables.tribeIds[2]) RB.Setup[47] = 2; //Romans, Gauls, Teutons
					if (T4_Variables.tribeIds[4]) RB.Setup[47] = 1; //Huns & Egyptians
				}
				if (RB.Setup[48] == 0) { RB.Setup[48] = T4_Variables.Map.Size.width; }
				if (RB.Setup[50] == 0) { RB.Setup[50] = T4_Variables.feature_flags.travelOverTheWorldEdge ? 1 : 2; }
				saveCookie( 'RBSetup', 'Setup' );
			});
			return;
		}
	}

	var mapWidth = RB.Setup[48];
	var mapRadius = (mapWidth - 1) / 2;

	vlist_addButtonsT4();
	loadCookie ( 'Dict', 'dictionary' );

	if( villages_id[0] == 0 ) if( RB.dictionary[0] == 0 ) {
		document.location.href = fullName + 'profile/' + userID;
	} else {
		villages_id[0] = parseInt(RB.dictionary[0]);
		village_aid = villages_id[0];
	}
	loadAllCookie();
	var LC = setLC();
	var arena = RB.dictFL[3] == 0 ? gtext("arena") : RB.dictionary[3];

	//save "produce per hour"
	if( ! getResources() ) return;
	if( /dorf[12].php/.test(crtPath) ) parseDorf1();

	if( RB.overview[0] > -1 ) {
		var i =  parseInt(RB.overview[0]) +1;
		if( i > villages_count ) {
			RB.overview[0] = -2;
			saveCookie('OV', 'overview');
			setTimeout( function() { document.location.href = RB.overview[1]; }, getRandom(300,1000));
		} else {
			RB.overview[0] = i;
			saveCookie('OV', 'overview');
			var newdid = linkVSwitch[i-1].match(/newdid=\d+/i)[0];
			setTimeout( function() { document.location.href = fullName +'dorf1.php?'+ newdid; }, getRandom(300,1000));
		}
		return;
	} else if( RB.overview[0] == -2 ) {
		RB.overview[0] = -1;
		RB.overview[1] = Math.round(RunTime[0]/1000);
		saveCookie('OV', 'overview');
		overviewAll();
	}

	var rect = ltr ? [94,183,272,460] : [458,369,280,92];

	progressbar_init();
	convertLinks();

	var cont = $g(pageElem[1]);

	if( RB.Setup[45] > 0 ) { sM = parseInt(RB.Setup[45]); sC = [16/sM,100]; }
	if( /dorf1.php/.test(crtPath) ) { troopsDorf1(); normalizeProduction(); }
	villageHintEdit();
	if( /dorf2.php/.test(crtPath) ) { parseDorf2(); if( RB.Setup[37] > 0 ) villageBMover(); }
	if( /dorf3.php/.test(crtPath) ) villageHintDorf3();
	if( /(?:messages|report)/.test(crtPath) ) { viewMessageIW(); messagesTopButtons(); }
	if( /report/.test(crtPath) ) reportsDelOrSearch(); else if( RB.overview[0] < -2 ) { RB.overview[0] = -1; saveCookie('OV', 'overview'); }
	if( /messages\//.test(crtPath) ) { convertCoordsInMessagesToLinks(); }
	if( /karte.php\?(.*&)?[zdxy]=/.test(crtPath) ) { distanceToMyVillages(); linkOnT4Karte(); }
	if( /karte.php/.test(crtPath) ) { karteDistance(); cropFind(); }
	if( /position_details.php\?(.*&)?[zdxy]=/.test(crtPath) ) { troopsOasis(); distanceToMyVillages(); viewMessageIWK(); linkOnT4Karte(); }
	if( crtPath.indexOf('alliance') != -1 ) {
		if( $g('offs') ) { viewMessageIWK(); addAReportFilter(); }
		var allianceTable = $gc('allianceMembers',cont);
		if( allianceTable.length > 0 ) { allyActivityInfo(); allyQStats(allianceTable[0]); }
		parseAlly();
		AllyBonusPageRefreshRB();
	}
	if( /^\/profile(?!\?)/.test(relName) ) {
		distanceToTargetVillages(); userActivityInfo();
		if ( ! $g('PlayerProfileEditor') ) { parseSpieler(); spielerSort(); }
	}
	if( /report.+id=/.test(crtPath) ) { addSpeedAndRTSend(); analyzerBattle(); getTroopNames(); }
	if( ! /dorf.\.php/.test(crtPath) && ! /profile/.test(crtPath) ) addRefIGM();
	if( /hero/.test(crtPath) ) { speedBids(); timeToBids(); neededResAdd(); restHeroTime(); saveHeroSpeed(); saveHeroPower(); saveHeroMount(); addSpeedAndRTSend(); addSpeedAndRTSend($gc('boxes',cont)[0]); }
	if( /build.php/.test(crtPath) ) { neededResAdd(); buildDispatcher(); addSpeedAndRTSend(); }

	setTimeout( function() { progressbar_updValues(); setInterval(progressbar_updValues, 1000); }, (1000-progressbar_time-((Date.now())-RunTime[0])));
	bigQuickLinks();
	if( RB.Setup[14] > 0 ) showDorf1();
	if( RB.Setup[12] > 0 ) showLinks();
	if( RB.Setup[17] == 1 ) rbNotes();
	addSpeedRTSendMessageInLLinks();
	//if( RB.dictFL[13] < 3 || RB.Setup[20] == 2) scanTroopsData();
	scanTroopsData();
	returnQuickHelp();
	if( RB.Setup[32] == 1 ) centerNumber();
	if( RB.Setup[34] == 1 ) overviewAll();
	if( nextFL ) if( RB_getValue(GMcookieID + 'next', -1) > 0 ) RB_setValue(GMcookieID + 'next', -1);
	if( RB.Setup[30] > 0 ) detectAttack();
	showRunTime();

/********** end of main code block ************/
}

function backupStart () {
	if(notRunYet) {
		var l4 = document.getElementById('l4');
		if( l4 ) allInOneOpera();
		else setTimeout(backupStart, 500);
	}
}

var notRunYet = true;
if( /Gecko/i.test(navigator.userAgent) ) allInOneOpera();
else if (window.addEventListener) window.addEventListener("load",function () { if(notRunYet) allInOneOpera(); },false);
setTimeout(backupStart, 500);

})();
