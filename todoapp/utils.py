from twilio.rest import Client
from .models import EmailVerification
import json
import requests
import random
import os

from django.core.mail import send_mail

def verifyEmail(request,user):
	activation_code=random.randrange(111111,999999)
	
	email = EmailVerification(user = user, pin = activation_code)
	print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",user, activation_code)
	email.save()
		
	subject='Welcome to ToDoApp!!'
	message='''We are happy to see you on our platform. <br /><br />
			   Please click over the <a href='http://localhost:8000/todoapp/actact/?id={}&act_code={}&uname={}'>link</a> to activate your account. Please make sure to complete your profile to appear on search result of connects.  	
			'''.format(user.id,activation_code,user.first_name+' '+user.last_name)
	
	send_mail(subject,'','ToDoApp Welcomes you',[request.POST.get('email')],fail_silently=False,html_message=message)		


def reCaptcha(request):
	responsekey=request.POST.get('g-recaptcha-response')
	secretkey= os.environ['RECAPTCHA_SECRET_KEY']
	
	captchadata={'secret':secretkey,'response':responsekey}
	
	resp=requests.post('https://www.google.com/recaptcha/api/siteverify',data=captchadata)
	
	respdict=json.loads(resp.text)
	
	return respdict['success']


def sendOTP(mobnum,request):
	#secret key
	account_sid = "account_sid"
	auth_token  = "auth_token"

	#client = Client(account_sid, auth_token)
	otp = str(random.randrange(111111,999999))
	request.session['otp'] = otp
	print(otp+' ----------##########~~~~~~~~~~~~###########')

	# message = client.messages.create(
	# 	to="+91"+mobnum, 
	# 	from_="+12053457159",
	# 	body="Hello from ISRDC ToDoApp! Your OTP: "+otp)

	return otp