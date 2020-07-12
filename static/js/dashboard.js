window.onload = initAll;

function initAll(){
	getAllElements();

	setAllActions();
}

var active_recs,shared_recs,nwinv_recs;
function getAllElements(){
	active_recs = document.getElementById('active_recs');
	shared_recs = document.getElementById('shared_recs');
	nwinv_recs = document.getElementById('nwinv_recs');
}

function setAllActions(){
	collectAllActiveRecords();
	collectAllSharedRecords();
	collectAllNewInvites();
}

var ninvreq;
function collectAllNewInvites(){
	ninvreq = new XMLHttpRequest();
	ninvreq.open('get','/todoapp/activenewinvites',false);
	ninvreq.onreadystatechange = showNewInvites;
	ninvreq.send();
}

function showNewInvites(){
	if(ninvreq.readyState==4&&ninvreq.status==200){
		var res = JSON.parse(ninvreq.responseText);
		displayRecords_(res,nwinv_recs);
	}
}

//-----------------------------------
function displayRecords_(res,block){
	for(prop in res){
		var dv = document.createElement('div');
		dv.className = 'actrec_box';
		
		var ttl = document.createElement('div');
		ttl.innerHTML = res[prop].username;
		ttl.className = 'actttl_';

		var crt = document.createElement('div');
		crt.innerHTML = res[prop].joined;
		crt.className = 'actcrt_';

		var typ = document.createElement('img');
		typ.src = '/static/images/'+res[prop].profpic;
		typ.className = 'acttyp_';

		dv.appendChild(typ);
		dv.appendChild(ttl);
		dv.appendChild(crt);
		

		block.appendChild(dv);
	}

	var more = document.createElement('div');
	more.innerHTML = '<a href="/todoapp/connects">more...</a>';
	more.className = 'actmore_';
	block.appendChild(more);
}
//----------------------------------------


var shreq;
function collectAllSharedRecords(){
	shreq = new XMLHttpRequest();
	shreq.open('get','/todoapp/activesharedtodos',false);
	shreq.onreadystatechange = showActiveSharedToDos;
	shreq.send();
}

function showActiveSharedToDos(){
	if(shreq.readyState==4&&shreq.status==200){
		var res = JSON.parse(shreq.responseText);

		displayRecords(res,shared_recs);
	}
}

var actreq;
function collectAllActiveRecords(){
	actreq = new XMLHttpRequest();

	actreq.open('get','/todoapp/activerecords',false);
	actreq.onreadystatechange = showActiveRecords;
	actreq.send();
}

function showActiveRecords(){
	if(actreq.readyState==4&&actreq.status==200){
		var res = JSON.parse(actreq.responseText);
		
		displayRecords(res,active_recs);
	}
}


function displayRecords(res,block){
	for(prop in res){
		var dv = document.createElement('div');
		dv.className = 'actrec_box';
		
		var ttl = document.createElement('div');
		ttl.innerHTML = res[prop].title;
		ttl.className = 'actttl_';

		var crt = document.createElement('div');
		crt.innerHTML = res[prop].created;
		crt.className = 'actcrt_';

		var typ = document.createElement('img');
		typ.src = res[prop].typeid==1?'/static/images/textnote_.png':'/static/images/chklst_.png';
		typ.className = 'acttyp_';

		dv.appendChild(typ);
		dv.appendChild(ttl);
		dv.appendChild(crt);
		

		block.appendChild(dv);
	}

	var more = document.createElement('div');
	more.innerHTML = '<a href="/todoapp/showtodos">more...</a>';
	more.className = 'actmore_';
	block.appendChild(more);
}