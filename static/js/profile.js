window.onload = initAll;


function initAll(){
	getAllElements();
	setAllActions();
}

var otp_btn,mobile,otp_box,otp,sv_otp_btn,sv_btn_box,otp_ctrl_box;
var loader1;
function getAllElements(){
	otp_btn = document.getElementsByName('otp_btn')[0];
	mobile = document.getElementById('id_mobile');
	otp_box = document.getElementById('otp_box');
	otp = document.getElementById('otp');
	sv_otp_btn = document.getElementById('sv_otp_btn');
	sv_btn_box = document.getElementById('sv_btn_box');
	otp_ctrl_box = document.getElementById('otp_ctrl_box');
	loader1 = document.getElementById('loader1');
}

function setAllActions(){
	otp_btn.onclick = sendOTP;

	sv_otp_btn.onclick = checkOTP;
}

var chkotpreq
function checkOTP(){
	otpval = otp.value; 
	if(otpval.length==6&&!isNaN(otpval)){
		chkotpreq = new XMLHttpRequest();

		chkotpreq.open('get','/todoapp/checkotp/?otp='+otpval,true);
		chkotpreq.onreadystatechange = chkOtpResp;
		chkotpreq.send();
	}
}

function chkOtpResp(){
	if(chkotpreq.readyState==4&&chkotpreq.status==200){
		if(chkotpreq.responseText=='true'){
			sv_btn_box.style.visibility = 'visible';
			otp_ctrl_box.style.display = 'none';
		}
	}
}

var otpReq;
function sendOTP(){
	loader1.style.visibility = 'visible';
	mobnum = mobile.value;
	if(mobnum.length==10&&!isNaN(mobnum)){
		otpReq = new XMLHttpRequest();

		otpReq.open('get','/todoapp/sendotp/?mobile='+mobnum,true);
		otpReq.onreadystatechange = otpResponse;
		otpReq.send();
	}else{
		alert('Please Enter Valid 10 digit mobile Number!')
	}
}

function otpResponse(){
	if(otpReq.readyState==4&&otpReq.status==200){
		if((otpReq.responseText).slice(0,4)=='done'){
			loader1.style.visibility = 'hidden';
			otp_btn.style.display = 'none';
			otp_box.style.display = 'inline';
			alert("your OTP is :"+(otpReq.responseText).slice(4,10));
		}
	}
}