window.onload = initAll;

function initAll(){
	getAllElements();
	setAllActions();
}

var txnote,chklist,urselectiontxt,urselection,records_box;
var main_table,textnote_main_box,checklist_main_box;
var _ttl_common,ttl_type_,_ttl_txt,_ttl_created,_ttl_txt_edit,ttl_sv_;
var txnote_edit_box,_sv_msg,ttl_del_;
var checklist_box,checklist_box_;
var  tbd_1,tbd_2,share_,rec_box;
function getAllElements(){
	txnote = document.getElementById('txnote');
	chklist = document.getElementById('chklist');
	urselectiontxt = document.getElementById('urselectiontxt');
	urselection = document.getElementById('urselection');
	records_box = document.getElementById('records_box');

	main_table = document.getElementById('main_table');
	textnote_main_box = document.getElementById('textnote_main_box');
	checklist_main_box = document.getElementById('checklist_main_box');

	_ttl_common = document.getElementById('_ttl_common');
	ttl_type_ = document.getElementById('ttl_type_');
	_ttl_txt = document.getElementById('_ttl_txt');
	_ttl_txt_edit = document.getElementById('_ttl_txt_edit');
	_ttl_created = document.getElementById('_ttl_created');
	ttl_sv_ = document.getElementById('ttl_sv_');

	txnote_edit_box = document.getElementById('txnote_edit_box');
	_sv_msg = document.getElementById('_sv_msg');
	ttl_del_ = document.getElementById('ttl_del_');

	checklist_box = document.getElementById('checklist_box');	
	tbd_1 = document.getElementById('tbd_1');	
	tbd_2 = document.getElementById('tbd_2');	

	share_ = document.getElementById('share_');	
	rec_box = document.getElementById('rec_box');	

	//checklist_box_ = document.getElementById('checklist_box_');	

	var i = 1;
	while(true){
		var elm = document.getElementById('_edit_'+i);
		var del = document.getElementById('_del_'+i);
		var hdnfld = document.getElementById('_todo_id_'+i);		
		var loader = document.getElementById('_loader_'+i);
		var ttlsp = document.getElementById('ttl_txt_'+i); 
		var created = document.getElementById('_created_'+i); 
		var todotypeid = document.getElementById('_todotype_id_'+i); 
		var txnote_data_ = document.getElementById('txnote_data_'+i++); 
		
		if(loader){
			loader.style.visibility = 'hidden';
		}

		//alert(!elm)
		if(!elm){
			//alert(i);
			break;
		}else{
			var todoid = hdnfld.value;
			ttlsp.textnote = txnote_data_.innerHTML;
			ttlsp.todotypeid = todotypeid.value;
			ttlsp.created = created.innerHTML;
			ttlsp.todoid = todoid;
			ttlsp.onclick = showToDoBox;
			del.todoid = todoid;
			del.onclick = delRecord;
			elm.todoid = todoid;
			elm.onclick = function(){ 
							var rec_id = this.id.substr(6);
							var ttl_span = document.getElementById('ttl_txt_'+rec_id);
							var ttl_fld = document.getElementById('ttl_edit_'+rec_id);
							var loader = document.getElementById('_loader_'+rec_id);
							ttl_span.style.display = 'none';
							ttl_fld.style.display = 'inline';
							ttl_fld.value = ttl_span.innerHTML;
							ttl_fld.focus();
							ttl_fld.todoid = this.todoid;
							ttl_fld.recnum = rec_id;
							ttl_fld.onblur = saveChanges;
						  };
		}
	}
}


var pointsreq;
var cellClasses = new Array('chk_cell_lft','chk_cell_mdl','chk_cell_rht');
var row_index = 0;
function showToDoBox(){
	main_table.style.display = 'none';
	_ttl_common.style.display = 'block';
	_ttl_txt.innerHTML = this.innerHTML;
	_ttl_created.innerHTML = this.created;
	
	ttl_sv_.todoid = this.todoid;
	if(this.todotypeid==1){
		textnote_main_box.style.display = 'block';
		ttl_sv_.todotypeid = 1;	
		ttl_type_.src = '/static/images/textnote_.png';
		if(this.textnote!='None'){
			txnote_edit_box.value = this.textnote;
		}
	}else{
		checklist_main_box.style.display = 'block';
		ttl_type_.src = '/static/images/checklist.png';
		ttl_sv_.todotypeid = 2;

		//checklist_box.innerHTML = '';
		tbd_1.innerHTML = '';
		
		pointsreq = new XMLHttpRequest();
		pointsreq.open('get','/todoapp/getallpoints/?todoid='+this.todoid,false);
		pointsreq.onreadystatechange = showPoints;
		pointsreq.send();
		//#######
		//createCheckListRow();
		
		/*
		for(i=0;i<4;i++){
			var row = checklist_box.insertRow(i);
			
			for(j=0;j<3;j++){
				var cell = row.insertCell(j);
				cell.className = cellClasses[j];
				if(j==0){ 
					var chk = document.createElement('input');
					chk.type = 'checkbox';
					chk.className = '_chk_';
					cell.appendChild(chk);
				}else if(j==1){
					var pointfld = document.createElement('input');
					pointfld.className = '_pointfld_';
					cell.appendChild(pointfld);
				}else{
					var delimg = document.createElement('img');
					delimg.className = '_delimg_';
					delimg.src = '/static/images/delete.png';
					cell.appendChild(delimg);
				}
			}
		}*/
	}	
}

function showPoints(){
	if(pointsreq.readyState==4&&pointsreq.status==200){
		var resp = pointsreq.responseText;
		if(resp=='norecords'){
			createCheckListRow();
		}else if(resp=='wrong'){
			alert('you are not allowed to access another user\'s records')
		}else{
			alert(resp)
			var points = JSON.parse(resp);
						
			for(i=0;i<points.length;i++){
				if(points[i].fields.status==1){
					createCheckListRow(points[i].fields.todopoint,points[i].pk);
				}else{
					createDoneCheckListRow(points[i].fields.todopoint,points[i].pk);
				}
			}
		}
	}
}

function createCheckListRow(todopoint,todopointid){
	var row = tbd_1.insertRow(row_index);

	row.id = '_row_id_'+row_index;
	row.style.height = 60+'px';

	row.ondragover = function(e){
						e.preventDefault();
					 };
	
	row.ondrop = function(e){
					e.preventDefault();
					var droprowindex = this.rowIndex;

					var id = e.dataTransfer.getData('inpfldid');
					var dragfld = document.getElementById(id);
					var tmp = dragfld.value;

					var dragrowindex = e.dataTransfer.getData('dragrowindex');
					
					dragrowindex=parseInt(dragrowindex);
					droprowindex = parseInt(droprowindex);
					if(dragrowindex<droprowindex){
						for(i=dragrowindex;i<droprowindex;i++){														
							var a = checklist_box.rows[i].getElementsByTagName('input')[1];
							var b = checklist_box.rows[i+1].getElementsByTagName('input')[1];
							
							a.value = b.value;
							if(i+1==droprowindex){
								b.value = tmp;
							}
						}
					}else{
						for(i=dragrowindex;i>droprowindex;i--){														
							var a = checklist_box.rows[i].getElementsByTagName('input')[1];
							var b = checklist_box.rows[i-1].getElementsByTagName('input')[1];
							
							a.value = b.value;
							if(i-1==droprowindex){
								b.value = tmp;
							}
						}
					}		
					
					if(dragrowindex!=droprowindex){
						saveCheckList();
					}
				 };
		
	for(j=0;j<3;j++){
		var cell = row.insertCell(j);
		cell.className = cellClasses[j];
		if(j==0){ 
			var img = document.createElement('img');
			img.src = '/static/images/dots.jpg';
			img.className = 'dotimg';
			img.draggable = true;
			cell.appendChild(img);

			img.ondragstart = function(e){
								var dragrow = this.parentNode.parentNode;
								var inpfld = dragrow.getElementsByTagName('input')[1];
								
								e.dataTransfer.setData('inpfldid',inpfld.id);
								e.dataTransfer.setData('dragrowindex',dragrow.rowIndex);
							  };
	

			var chk = document.createElement('input');
			chk.type = 'checkbox';
			chk.className = '_chk_';
			if(todopoint){
				chk.todopoint = todopoint;
				chk.todopointid = todopointid;
			}
			cell.appendChild(chk);
			chk.onclick = moveToDoneCheckList;
		}else if(j==1){
			var pointfld = document.createElement('input');
			pointfld.active = true;
			pointfld.className = '_pointfld_';
			pointfld.id = '_point_fld_'+row_index;
			if(todopoint){
				pointfld.value = todopoint;
			}
			pointfld.onkeyup = function(e){
								 	if(e.keyCode==13){
										createCheckListRow();
									}
							     };
			cell.appendChild(pointfld);
			pointfld.focus();
		}else{
			var delimg = document.createElement('img');
			delimg.id = '_del_point_'+row_index++;
			delimg.className = '_delimg_';
			delimg.src = '/static/images/delete.png';
			cell.appendChild(delimg);
			delimg.onclick = delOnePointRow;
		}
	}
}

var doneReq;
function moveToDoneCheckList(){
	createDoneCheckListRow(this.todopoint,this.todopointid);	
	
	doneReq = new XMLHttpRequest();
	doneReq.open('get','/todoapp/setpointdone/?todopointid='+this.todopointid,false);
	doneReq.onreadystatechange = afterDoneSet;
	doneReq.send();

	tbd_1.deleteRow(this.parentNode.parentNode.rowIndex);
	row_index--;
}

function afterDoneSet(){
	if(doneReq.readyState==4&&doneReq.status==200){
		if(doneReq.responseText=='done'){
			
		}
	}
}

var activeReq;
function moveToActiveCheckList(){
	createCheckListRow(this.todopoint,this.todopointid);

	activeReq = new XMLHttpRequest();
	activeReq.open('get','/todoapp/setpointactive/?todopointid='+this.todopointid,false);
	activeReq.onreadystatechange = afterActiveSet;
	activeReq.send();
		
	tbd_2.removeChild(this.parentNode.parentNode);
	//tbd_2.deleteRow(this.parentNode.parentNode.rowIndex);
	row_index_--;
}

function afterActiveSet(){
	if(activeReq.readyState==4&&activeReq.status==200){
		if(activeReq.responseText=='done'){
		
		}
	}
}

var row_index_ = 1;
function createDoneCheckListRow(todopoint,todopointid){
	var row = tbd_2.insertRow(row_index_);

	row.id = '_row_x_id_'+row_index_;
	row.style.height = 60+'px';

	/*
	row.ondragover = function(e){
						e.preventDefault();
					 };
	
	row.ondrop = function(e){
					e.preventDefault();
					var droprowindex = this.rowIndex;

					var id = e.dataTransfer.getData('inpfldid');
					var dragfld = document.getElementById(id);
					var tmp = dragfld.value;

					var dragrowindex = e.dataTransfer.getData('dragrowindex');
					
					dragrowindex=parseInt(dragrowindex);
					droprowindex = parseInt(droprowindex);
					if(dragrowindex<droprowindex){
						for(i=dragrowindex;i<droprowindex;i++){														
							var a = checklist_box.rows[i].getElementsByTagName('input')[1];
							var b = checklist_box.rows[i+1].getElementsByTagName('input')[1];
							
							a.value = b.value;
							if(i+1==droprowindex){
								b.value = tmp;
							}
						}
					}else{
						for(i=dragrowindex;i>droprowindex;i--){														
							var a = checklist_box.rows[i].getElementsByTagName('input')[1];
							var b = checklist_box.rows[i-1].getElementsByTagName('input')[1];
							
							a.value = b.value;
							if(i-1==droprowindex){
								b.value = tmp;
							}
						}
					}		
					
					if(dragrowindex!=droprowindex){
						saveCheckList();
					}
				 };
	*/
	

	for(j=0;j<3;j++){
		var cell = row.insertCell(j);
		cell.className = cellClasses[j];
		if(j==0){ 
			var img = document.createElement('img');
			img.src = '/static/images/dots.jpg';
			img.className = 'dotimg';
			
			//img.draggable = true;
			cell.appendChild(img);

			/*
			img.ondragstart = function(e){
								var dragrow = this.parentNode.parentNode;
								var inpfld = dragrow.getElementsByTagName('input')[1];
								
								e.dataTransfer.setData('inpfldid',inpfld.id);
								e.dataTransfer.setData('dragrowindex',dragrow.rowIndex);
							  };
			*/	

			var chk = document.createElement('input');
			chk.type = 'checkbox';
			chk.className = '_chk_';
			if(todopoint){
				chk.todopoint = todopoint;
				chk.todopointid = todopointid;
			}
			cell.appendChild(chk);
			chk.onclick = moveToActiveCheckList;
		}else if(j==1){
			var pointfld = document.createElement('input');
			pointfld.active = false;
			pointfld.className = '_pointfld_';
			pointfld.id = '_point_x_fld_'+row_index_;
			
			if(todopoint){
				pointfld.value = todopoint;
			}
			pointfld.disabled = true; 

			/*
			pointfld.onkeyup = function(e){
								 	if(e.keyCode==13){
										createCheckListRow();
									}
							     };
			*/

			cell.appendChild(pointfld);
			//pointfld.focus();
		}else{
			var delimg = document.createElement('img');
			delimg.id = 'x_del_point_'+row_index_++;
			delimg.className = '_delimg_';
			delimg.src = '/static/images/delete.png';
			cell.appendChild(delimg);
			delimg.onclick = delOneDonePointRow;
		}
	}
}




function delOnePointRow(){
	var recnum = this.id.substr(11);
	var row = document.getElementById('_row_id_'+recnum);	
	var tbody = checklist_box.tBodies[0];
	tbody.removeChild(row);
	row_index--;
	saveCheckList();
}



function delOneDonePointRow(){
	var recnum = this.id.substr(12);
	var row = document.getElementById('_row_x_id_'+recnum);	
	var tbody = checklist_box.tBodies[1];
	tbody.removeChild(row);
	row_index_--;
	saveCheckList();
}

var delReq;
function delRecord(){
	var recnum = this.id.substr(5);
	var loader = document.getElementById('_loader_'+recnum);
	loader.style.visibility = 'visible';
 	delReq = new XMLHttpRequest();

	delReq.recbox = this.parentNode.parentNode.parentNode; 
	delReq.open('get','/todoapp/deltodo/?todoid='+this.todoid,false);
	delReq.onreadystatechange = afterDel;
	delReq.send();
}

function afterDel(){
	//alert(delReq.readyState+'---'+delReq.status)
	if(delReq.readyState==4&&delReq.status==200){
		if(delReq.responseText=='done'){
			messageFlash();
			records_box.removeChild(delReq.recbox);
		}
	}
}


function messageFlash(){
	_sv_msg.style.visibility = 'visible';
	setTimeout(function(){ _sv_msg.style.visibility = 'hidden'; }, 3000);
}



function setAllActions(){
	chklist.txt = 'Check List';
	txnote.txt = 'Text Note';

	txnote.typeid = 1;
	chklist.typeid = 2;

	chklist.onclick = txnote.onclick = todotypeFunc;

	
	_ttl_txt.onclick = function(){
						_ttl_txt.style.display = 'none';
						_ttl_txt_edit.style.display = 'inline';
						_ttl_txt_edit.value = _ttl_txt.innerHTML;
						_ttl_txt_edit.focus();
					   };

	_ttl_txt_edit.onblur = function(){
							_ttl_txt.style.display = 'inline';
							_ttl_txt_edit.style.display = 'none';
							if(_ttl_txt.innerHTML!=_ttl_txt_edit.value){
								saveTitleOfTextNote(this.value);
							}
							_ttl_txt.innerHTML = _ttl_txt_edit.value;							
						   };

	ttl_sv_.onclick = function(){						
						if(this.todotypeid==1){
							saveTextNote();
						}else{
							saveCheckList();
						}	
					  };

	ttl_del_.onclick = delToDo;

	share_.onclick = collectAllConnections;
}


//------------------------------------------------------
var allreq;
function collectAllConnections(){
	allreq = new XMLHttpRequest();
	allreq.open('get','/todoapp/collectallcons/',false);
	allreq.onreadystatechange = showConnections;
	allreq.send();
}

function showConnections(){
	if(allreq.readyState==4&&allreq.status==200){
		
		// alert(allreq.responseText)
		var res = JSON.parse(allreq.responseText);
		
		rec_box.innerHTML = '';
		rec_box.style.visibility = 'visible';

		for(prop in res){
			var obj = res[prop];
			var dv = document.createElement('div');
			dv.className = 'conrec_';
			dv.innerHTML = obj.username;
			dv.userid = obj.user_id;
			
			dv.onmouseover = function(){
								this.className = 'conrec_ conrec_ov';
							 };

			dv.onmouseout = function(){
								this.className = 'conrec_ conrec_ot';
							};

			dv.onclick = saveToDoShare;

			rec_box.appendChild(dv);
		}
	}
}
//------------------------------------------------------
var sharereq;
function saveToDoShare(){
	var userId = this.userid;
	var todoid = ttl_sv_.todoid;

	sharereq = new XMLHttpRequest();
	sharereq.open('get','/todoapp/sharetodo/?todoid='+todoid+"&uid="+userId,false);
	sharereq.onreadystatechange = afterToDoShare;
	sharereq.send();
}

function afterToDoShare(){
	if(sharereq.readyState==4&&sharereq.status==200){
		// alert(sharereq.responseText)
		rec_box.style.visibility = 'hidden';
		messageFlash();
	}
}


var delreq1;
function delToDo(){
	//ttl_sv_
	delreq1 = new XMLHttpRequest();
	delreq1.open('get','/todoapp/deltodo/?todoid='+ttl_sv_.todoid,false);
	delreq1.onreadystatechange = afterToDoDelete;
	delreq1.send();
}

function afterToDoDelete(){
	if(delreq1.readyState==4&&delreq1.status==200){
		if(delreq1.responseText=='done'){
			window.location = '/todoapp/showtodos';
		}
	}
}

//#####################################################
var ttsvreq;
function saveTitleOfTextNote(title){
	ttsvreq = new XMLHttpRequest();
	ttsvreq.open('get','/todoapp/changetitle/?title='+title+'&todoid='+ttl_sv_.todoid,false);
	ttsvreq.onreadystatechange = afterTxNoteTitleSave;
	ttsvreq.send();
}

function afterTxNoteTitleSave(){
	if(ttsvreq.readyState==4&&ttsvreq.status==200){
		// alert(ttsvreq.responseText);
	}
}

var svreq1;
function saveTextNote(){
	svreq1 = new XMLHttpRequest();
	svreq1.open('get','/todoapp/savetextnote/?todoid='+ttl_sv_.todoid+'&textnote='+txnote_edit_box.value,false);
	svreq1.setRequestHeader('Content-Type', 'text/plain')
	svreq1.onreadystatechange = afterTextNoteSave;
	svreq1.send();
}

function afterTextNoteSave(){
	//alert(svreq1.readyState+'---'+svreq1.status)
	if(svreq1.readyState==4&&svreq1.status==200){
		if(svreq1.responseText=='done'){			
			messageFlash();	
		}
	}
}

var chksvreq;
function saveCheckList(){
	var allinps = checklist_box.getElementsByTagName('input');
	var i=1;
	var str = '';
	while(true){
		if(allinps[i]){
			if(allinps[i].value.trim().length!=0){
				var active = allinps[i].active;
				str = str + ('&point='+allinps[i].value+'&active='+active);				
			}
			i = i + 2;
		}else{
			break;
		}
	}
	// alert('/todoapp/savechecklist/?todoid='+ttl_sv_.todoid+str)	
	
	chksvreq = new XMLHttpRequest();
	chksvreq.open('get','/todoapp/savechecklist/?todoid='+ttl_sv_.todoid+str,false);
	chksvreq.onreadystatechange = afterCheckListSave;
	chksvreq.send();
}

function afterCheckListSave(){
	if(chksvreq.readyState==4&&chksvreq.status==200){
		if(chksvreq.responseText=='done'){
			messageFlash();
			window.location = '/todoapp/showtodos';
		}
	}
}

var ttlreq;
function saveChanges(){
	var ttl_span = document.getElementById('ttl_txt_'+this.recnum);
	var loader = document.getElementById('_loader_'+this.recnum);
	//alert(loader.id)	
	
	if(ttl_span.innerHTML!=this.value){
		loader.style.visibility = 'visible';
		ttlreq = new XMLHttpRequest();
		
		ttlreq.recnum = this.recnum;
		
		//alert('/todoapp/changetitle/?title='+this.value+'&todoid='+this.todoid)
		ttlreq.open('get','/todoapp/changetitle/?title='+this.value+'&todoid='+this.todoid,false);
		ttlreq.onreadystatechange = afterTitleSave;
		ttlreq.send();
	}else{
		ttl_span.style.display = 'inline';
		this.style.display = 'none';
	}
}

function afterTitleSave(){
	if(ttlreq.readyState==4&&ttlreq.status==200){
		if(ttlreq.responseText=='done'){
			var ttl_span = document.getElementById('ttl_txt_'+ttlreq.recnum);
			var ttl_fld = document.getElementById('ttl_edit_'+ttlreq.recnum);
			var loader = document.getElementById('_loader_'+ttlreq.recnum);
			
			loader.style.visibility = 'hidden';
			ttl_span.style.display = 'inline';
			ttl_fld.style.display = 'none'

			ttl_span.innerHTML = ttl_fld.value;
		}
	}
}

function todotypeFunc(){
	if(this.id=='txnote'){
		txnote.src = '/static/images/textnote_.png'
		chklist.src = '/static/images/checklist.png'
	}else{
		txnote.src = '/static/images/textnote.png'
		chklist.src = '/static/images/chklst_.png'
	}
	
	//this.style.border = '1px solid red';
	//this.className = 'todotyp_onclick';
	urselectiontxt.innerHTML = 'Type Selected: '+this.txt;
	urselection.value = this.typeid;
}