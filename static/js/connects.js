window.onload = initAll;

function initAll(){
	getAllElements();

	setAllActions();
}

var srch_fld,search_result,rec_box,invt_,all_con_;
function getAllElements(){
	srch_fld = document.getElementById('srch_fld');
	search_result = document.getElementById('search_result');
	rec_box = document.getElementById('rec_box');
	invt_ = document.getElementById('invt_');
	all_con_ = document.getElementById('all_con_');
}

function setAllActions(){
	srch_fld.onkeyup = function(){
						  var len = this.value.trim().length;	
						  if(len>2){
							searchUser();
						  }
					   };

	srch_fld.onfocus = function(){
						 search_result.style.display = 'none';
					   };
	
	invt_.onclick = collectInvitations;

	collectAllConnections();

	all_con_.onclick = collectAllConnections;
}

//-------------------------------
var allreq;
function collectAllConnections(){
	all_con_.className = 'con_lnk con_act';
	invt_.className = 'con_lnk';

	allreq = new XMLHttpRequest();
	allreq.open('get','/todoapp/collectallcons/',false);
	allreq.onreadystatechange = showConnections;
	allreq.send();
}

function showConnections(){
	if(allreq.readyState==4&&allreq.status==200){
		var res = JSON.parse(allreq.responseText);
		//alert(res)
		rec_box.innerHTML = '';

		for(prop in res){
			showOneConnectAtATime_(res[prop])
		}
	}
}
//------------------------------




var invreq;
function collectInvitations(){
	all_con_.className = 'con_lnk';
	invt_.className = 'con_lnk con_act';

	invreq = new XMLHttpRequest();
	invreq.open('get','/todoapp/collectinvites/',false);
	invreq.onreadystatechange = showInvites;
	invreq.send();
}

function showInvites(){
	if(invreq.readyState==4&&invreq.status==200){
		var res = JSON.parse(invreq.responseText);
		//alert(res)
		rec_box.innerHTML = '';

		for(prop in res){
			showOneConnectAtATime_(res[prop])
		}
	}
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++
function showOneConnectAtATime_(obj){

	var outerbox = document.createElement('div');
	outerbox.className = 'records';	
	rec_box.appendChild(outerbox);
	
	var img = document.createElement('img');
	img.className = 'prof_pic';
	img.src = '/static/images/'+obj.profpic;
	outerbox.appendChild(img);

	var uname = document.createElement('span');
	uname.className = 'prof_name';
	uname.innerHTML = obj.username;
	outerbox.appendChild(uname);

	var mobile = document.createElement('span');
	mobile.className = 'prof_mobile';
	mobile.innerHTML = obj.mobile;
	outerbox.appendChild(mobile);

	var ct = document.createElement('span');
	ct.className = 'prof_city';
	ct.innerHTML = obj.city;
	outerbox.appendChild(ct);

	var stbx = document.createElement('span');
	stbx.className = 'prof_con_status';
	outerbox.appendChild(stbx);
	//1.
	var stts = document.createElement('span');
	stts.className = 'cur_st';

	//2.
	var st_act = document.createElement('span');
	st_act.className = 'action';
	
	connect=true
	if(!connect){
		stts.innerHTML = 'Not Yet Connected';	
		st_act.innerHTML = 'Connect';
		st_act.touserid = obj.user_id;
		st_act.onclick = startConnection;
		stbx.appendChild(stts);
		stbx.appendChild(st_act);
	}else{
		var stid = obj.status_id;
		
		stts.innerHTML = stid==4?'Pending':stid==5?'Accepted':'Rejected';
		stbx.appendChild(stts);	

		st_act.conid = obj.con_id;
		st_act.onclick = changeConnectionStatus;
		if(stid==4){
			if(obj.user_id==obj.from_user_id){
				st_act.innerHTML = 'Accept';				
				//action=1(Accept)|2(Reject)|3(Disconnect)|4(Cancel)
				st_act.action = 1;
				
				var st_act2 = document.createElement('span');
				st_act2.className = 'action2';
				st_act2.innerHTML = 'Reject';
				st_act2.conid = obj.con_id;
				st_act2.action = 2;
				st_act2.onclick = changeConnectionStatus;
				stbx.appendChild(st_act);
				stbx.appendChild(st_act2);
			}else{				
				st_act.innerHTML = 'Cancel';
				st_act.action = 4;
				
				stbx.appendChild(st_act);
			}			
		}else if(stid==5){			
			st_act.innerHTML = 'Disconnect';
			st_act.className = 'action2';
			st_act.action = 3;
			
			stbx.appendChild(st_act);
		}else{
			//when status is 6
			//###########################
			if(obj.user_id==obj.from_user_id){
				st_act.innerHTML = 'Accept';
				st_act.action = 1;
				
				stbx.appendChild(st_act);
			}else{
				st_act.innerHTML = 'Cancel';
				st_act.action = 4;
				
				st_act.className = 'action2';
				stbx.appendChild(st_act);
			}	
			//########################
		}
	}	
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++


var srchreq;
function searchUser(){
	srchreq = new XMLHttpRequest();
	srchreq.open('get','/todoapp/searchuser/?searchkey='+srch_fld.value,false);
	srchreq.onreadystatechange = showSearchResult;
	srchreq.send();
}

function showSearchResult(){
	if(srchreq.readyState==4&&srchreq.status==200){
		//alert(srchreq.responseText)
		var recs = JSON.parse(srchreq.responseText);

		search_result.innerHTML = '';
		
		for(i=0;i<recs.length;i++){
			var obj = document.createElement('div');
			obj.className = 'result_record';
			obj.innerHTML = recs[i].fields.username;
			obj.userid = recs[i].pk;

			search_result.appendChild(obj);

			obj.onmouseover = function(){ this.className = 'result_record result_record_ov'; }
			obj.onmouseout = function(){ this.className = 'result_record result_record_ot'; }

			obj.onclick = userDetails;
		}
		
		search_result.style.display = 'block';
	}
}

var dtlreq;
function userDetails(){
	dtlreq = new XMLHttpRequest();
	dtlreq.open('get','/todoapp/userdetail/?userid='+this.userid,false);
	dtlreq.onreadystatechange = showUserDetail;
	dtlreq.send();
}

function showUserDetail(){
	if(dtlreq.readyState==4&&dtlreq.status==200){
		// alert(dtlreq.responseText)
		search_result.style.display = 'none';
		
		resp = JSON.parse(dtlreq.responseText);

		user=resp[0];
		userprof=resp[1];
		city=resp[2];
		connect=resp[3]
		
		rec_box.innerHTML = '';
		showOneConnectAtATime(user,userprof,city,connect)
	}
}

function showOneConnectAtATime(user,userprof,city,connect){

	var outerbox = document.createElement('div');
	outerbox.className = 'records';	
	rec_box.appendChild(outerbox);
	
	var img = document.createElement('img');
	img.className = 'prof_pic';
	img.src = '/static/images/'+userprof.fields.profpic;
	outerbox.appendChild(img);

	var uname = document.createElement('span');
	uname.className = 'prof_name';
	uname.innerHTML = user.fields.username;
	outerbox.appendChild(uname);

	var mobile = document.createElement('span');
	mobile.className = 'prof_mobile';
	mobile.innerHTML = userprof.fields.mobile;
	outerbox.appendChild(mobile);

	var ct = document.createElement('span');
	ct.className = 'prof_city';
	ct.innerHTML = city.fields.city_name;
	outerbox.appendChild(ct);

	var stbx = document.createElement('span');
	stbx.className = 'prof_con_status';
	outerbox.appendChild(stbx);
	//1.
	var stts = document.createElement('span');
	stts.className = 'cur_st';

	//2.
	var st_act = document.createElement('span');
	st_act.className = 'action';
	
	if(!connect){
		stts.innerHTML = 'Not Yet Connected';	
		st_act.innerHTML = 'Connect';
		st_act.touserid = user.pk;
		st_act.onclick = startConnection;
		stbx.appendChild(stts);
		stbx.appendChild(st_act);
	}else{
		var stid = connect.fields.status;
		
		stts.innerHTML = stid==4?'Pending':stid==5?'Accepted':'Rejected';
		stbx.appendChild(stts);	

		st_act.conid = connect.pk;
		st_act.onclick = changeConnectionStatus;
		if(stid==4){
			if(user.pk==connect.fields.from_user){
				st_act.innerHTML = 'Accept';				
				//action=1(Accept)|2(Reject)|3(Disconnect)|4(Cancel)
				st_act.action = 1;
				
				var st_act2 = document.createElement('span');
				st_act2.className = 'action2';
				st_act2.innerHTML = 'Reject';
				st_act2.conid = connect.pk;
				st_act2.action = 2;
				st_act2.onclick = changeConnectionStatus;
				stbx.appendChild(st_act);
				stbx.appendChild(st_act2);
			}else{				
				st_act.innerHTML = 'Cancel';
				st_act.action = 4;
				
				stbx.appendChild(st_act);
			}			
		}else if(stid==5){			
			st_act.innerHTML = 'Disconnect';
			st_act.className = 'action2';
			st_act.action = 3;
			
			stbx.appendChild(st_act);
		}else{
			//when status is 6
			//###########################
			if(user.pk==connect.fields.from_user){
				st_act.innerHTML = 'Accept';
				st_act.action = 1;
				
				stbx.appendChild(st_act);
			}else{
				st_act.innerHTML = 'Cancel';
				st_act.action = 4;
				
				st_act.className = 'action2';
				stbx.appendChild(st_act);
			}	
			//########################
		}
	}	
}


var conreq;
function startConnection(){
	conreq = new XMLHttpRequest();
	conreq.open('get','/todoapp/startconnection/?touserid='+this.touserid,false);
	conreq.onreadystatechange = afterConnect;
	conreq.send();
}

function afterConnect(){
	if(conreq.readyState==4&&conreq.status==200){
		if(conreq.responseText=='done'){
			rec_box.innerHTML = '';
			var dv = document.createElement('div');
			dv.className = 'messagebox msg_success';
			dv.innerHTML = 'Connection established Successfully...';
			rec_box.appendChild(dv);
		}
	}
}


var constreq;
function changeConnectionStatus(){
	var stid = this.action==1?5:this.action==2?6:0;
	constreq = new XMLHttpRequest();
	constreq.open('get','/todoapp/changeconstatus/?conid='+this.conid+'&stid='+stid,false);
	constreq.onreadystatechange = afterConStatusChange;
	constreq.send();
}

function afterConStatusChange(){
	if(constreq.readyState==4&&constreq.status==200){
		if(constreq.responseText=='done'){
			rec_box.innerHTML = '';
			var dv = document.createElement('div');
			dv.className = 'messagebox msg_success';
			dv.innerHTML = 'Connection established Successfully...';
			rec_box.appendChild(dv);
		}
	}
}