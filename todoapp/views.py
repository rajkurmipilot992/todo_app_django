from django.shortcuts import render,redirect
from .forms import SignupForm,UserProfileForm
from .models import EmailVerification, UserProfile,ToDoList,ToDoPoints,City,Connects,ToDoAccess
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .utils import sendOTP,reCaptcha,verifyEmail
from django.http import HttpResponse,JsonResponse
import json
from django.core import serializers

# Create your views here.
def index_view(request):
	return render(request, 'todoapp/index.html')

def signup_view(request):
	if request.method=='POST':
		#verified=reCaptcha(request)
		verified=True

		if verified:						
			form=SignupForm(request.POST)
			user=form.save()
			user.set_password(user.password)
			user.is_active=0
			verifyEmail(request,user)			
			user.save()
			

			return render(request, 'todoapp/aftersignup.html')
		else:
			return redirect('/todoapp/signup')
		
	else:
		form=SignupForm()
		return render(request, 'todoapp/signup.html', {'form':form})


def account_activation_view(request):
	uid=request.GET.get('id')
	request.session['uid'] = uid

	uname=request.GET.get('uname')
	request.session['uname'] = uname
	
	actcode=int(request.GET.get('act_code'))
	user_email_model= EmailVerification.objects.get(user = uid)
	activation_code = user_email_model.pin
	values_to_update = {'profpic':"profpics/a2.png"}
	userprof, create = UserProfile.objects.update_or_create(user_id=uid, defaults = values_to_update)
	userprof.save()
	try:
		user=User.objects.get(id=uid)
		if actcode==activation_code:
			user.is_active=1
			user.save()
			user_email_model.delete()

			return redirect('/todoapp/profile')
	except:
		return render(request, 'todoapp/error.html')

@login_required
def show_profile_view(request):
	request.session['uid'] = request.user.id
	
	userName = str(request.user.first_name)+" "+str(request.user.last_name)
	userProfDetail = UserProfile.objects.get(user_id = request.user.id)
	
	city_id = userProfDetail.city_id
	if city_id:
		city = str(City.objects.get(id = city_id))
	else:
		city = "update your city"

	userData = {"name":userName, "mobile":str(userProfDetail.mobile), "pic":"/static/images/"+str(userProfDetail.profpic), "email":str(request.user.email),"city":city} 	
	return render(request, "todoapp/showprofile.html", userData)


def profile_view(request):

	if request.method=='POST':
		profpic=request.FILES.get('profpic')
		mobile=request.POST.get('mobile')
		ctid=request.POST.get('city')
		
		if request.user.is_authenticated:
			request.session['uid'] = request.user.id
			# print("usid   $$$$$$$$$$$$$$$$$$$$$$$", request.user.id)
		
		uid=request.session['uid']
		# uid=request.user.id
			
		values_to_update = {'mobile': mobile, 'profpic': profpic, 'city_id': ctid}
		
		uf, uf_new = UserProfile.objects.update_or_create(user_id=uid, defaults = values_to_update)

		if request.user.is_authenticated:
			return redirect('/todoapp/dashboard')
		else:
			return redirect('/accounts/login')
	else:
		try:
			uid=request.session['uid']
			name = request.user.first_name
		except:
			return redirect('/accounts/login')
			
		form=UserProfileForm()
		return render(request, 'todoapp/profile.html', {'form':form,'name':name})


@login_required
def show_todos_view(request):
	uid=request.session['_auth_user_id']
	userprof=UserProfile.objects.get(user_id=uid)

	#alltodos=ToDoList.objects.filter(userprof_id=userprof.id)
	
	todoid_=ToDoAccess.objects.filter(user_id=uid).values('todolist_id')	
	alltodos=ToDoList.objects.filter(userprof_id=userprof.id)|ToDoList.objects.filter(id__in=todoid_)
	
	if request.method=='POST':
		title=request.POST.get('title')		
		todotypeid=request.POST.get('urselection')

		todolist=ToDoList(title=title,userprof_id=userprof.id,todotype_id=todotypeid)
		todolist.save()		
		return redirect('/todoapp/showtodos')
	else:		
		return render(request, 'todoapp/todolist.html', {'todos':alltodos})


@login_required
def dashboard_view(request):
	request.session['uname'] = str(request.user.username)
	request.session['uid'] = request.user.id
	uid=request.user.id
	request.session['login']=True
	path='todoapp/dashboard.html'
	
	uf, uf_new = UserProfile.objects.get_or_create(user_id=uid) 
	if uf_new :
		uf.profpic='profpics/a7.png'
		uf.save()
	else:
		pass

		# if userprof.usertype_id==1:
		# 	path = 'todoapp/admin.html'
		# elif userprof.usertype_id==2:
		# 	path = 'todoapp/manager.html'
	return render(request, path)


def sendotp_view(request):
	mobnum=request.GET.get('mobile')

	otp = sendOTP(mobnum,request)

	return HttpResponse("done"+otp)


def checkotp_view(request):
	resp = 'false'
	
	userotp=request.GET.get('otp')
	serverotp=request.session['otp']
	
	'''
	if(userotp==serverotp):
		resp = 'true'
	'''
	###
	resp = 'true'

	return HttpResponse(resp)


@login_required
def change_title_view(request):
	title=request.GET.get('title')
	todoid=request.GET.get('todoid')

	todoobj=ToDoList.objects.get(id=todoid)
	todoobj.title=title
	todoobj.save()

	return HttpResponse("done")

#Old
'''
def delete_textnote_view(request):
	todoid=request.GET.get('todoid')
	todorec=ToDoList.objects.get(id=todoid)
	todorec.delete()

	return HttpResponse('done')
'''

#New
@login_required
def delete_todo_view(request):
	todoid=request.GET.get('todoid')
	todoobj=ToDoList.objects.get(id=todoid)
	todoobj.delete()

	return HttpResponse('done')


@login_required
def save_textnote_view(request):
	todoid=request.GET.get('todoid')
	textnote=request.GET.get('textnote')
	todorec=ToDoList.objects.get(id=todoid)
	todorec.textnote=textnote
	todorec.save()

	return HttpResponse('done')


@login_required
def save_checklist_view(request):
	todopoints=request.GET.getlist('point')
	actives=request.GET.getlist('active')
	todoid=request.GET.get('todoid')

	allpoints=ToDoPoints.objects.filter(todolistid_id=todoid)
	for point in allpoints:
		point.delete()
	
	i=0
	for todop in todopoints:
		active=eval(actives[i].capitalize())
		i+=1
		status_id = 1 if active else 2
		# print(status_id)
		todopoint=ToDoPoints(todopoint=todop,todolistid_id=todoid,status_id=status_id)
		todopoint.save()

	return HttpResponse('done')


@login_required
def all_points_view(request):
	resp='norecords'
	
	todoid=request.GET.get('todoid')

	uid=request.session['_auth_user_id']
	userprof=UserProfile.objects.get(user_id=uid)

	recs=ToDoList.objects.filter(userprof_id=userprof.id,id=todoid)
	
	if len(recs)==1:
		todopoints=ToDoPoints.objects.filter(todolistid_id=todoid)	
		
		if len(todopoints)!=0:	
			ser=serializers.serialize('json',todopoints)
			points=json.loads(ser)
			resp=json.dumps(points)
	else:
		resp='wrong'

	return HttpResponse(resp)


@login_required
def set_point_done_view(request):
	todopointid=request.GET.get('todopointid')

	todopoint=ToDoPoints.objects.get(id=todopointid)
	todopoint.status_id=2
	todopoint.save()

	return HttpResponse('done')


@login_required
def set_point_active_view(request):
	todopointid=request.GET.get('todopointid')

	todopoint=ToDoPoints.objects.get(id=todopointid)
	todopoint.status_id=1
	todopoint.save()

	return HttpResponse('done')


@login_required
def show_connects_view(request):
	return render(request, 'todoapp/connects.html')


@login_required
def search_user_view(request):	
	searchkey=request.GET.get('searchkey')
	
	users=User.objects.filter(username__contains=searchkey)
	
	ser=serializers.serialize('json',users)
	usrs=json.loads(ser)	

	return HttpResponse(json.dumps(usrs))
	

@login_required
def user_detail_view(request):
	userid=request.GET.get('userid')
	uid=request.session['_auth_user_id']
	
	user=User.objects.get(id=userid)
	userprof=UserProfile.objects.get(user_id=userid)
	city=City.objects.get(id=userprof.city_id)
	cons=Connects.objects.filter(from_user_id=uid,to_user_id=userid)|Connects.objects.filter(from_user_id=userid,to_user_id=uid)
	
	# print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
	# print(cons) 
	# print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
	lst=[user,userprof,city]
	if len(cons)!=0:
		lst.append(cons.first())

	
	ser=serializers.serialize('json',lst)
	
	usr=json.loads(ser)

	return HttpResponse(json.dumps(usr))	
	

@login_required
def start_connection_view(request):
	touserid=request.GET.get('touserid')
	fromuid=request.session['_auth_user_id']

	con=Connects(from_user_id=fromuid,to_user_id=touserid)
	con.save()

	return HttpResponse('done')


@login_required
def change_connection_status_view(request):
	conid=request.GET.get('conid')
	stid=int(request.GET.get('stid'))

	if stid==0:
		con=Connects.objects.get(id=conid)
		con.delete()
	else:
		con=Connects.objects.get(id=conid)
		con.status_id=stid
		con.save()

	return HttpResponse('done')


@login_required
def collect_invites_view(request):
	uid=request.session['_auth_user_id']
	uid=int(uid)
	cons=Connects.objects.filter(from_user_id=uid,status_id=4)|Connects.objects.filter(to_user_id=uid,status_id=4)
	recs=dict()
	i=1
	for con in cons:
		if con.from_user_id==uid:
			invid=con.to_user_id
		else:
			invid=con.from_user_id

		user=User.objects.get(id=invid)		
		userprof=UserProfile.objects.get(user_id=invid)		
		city=City.objects.get(id=userprof.city_id)
		
		recs['obj'+str(i)] = {'user_id':user.id,
							  'username':user.username,
							  'mobile':userprof.mobile,
							  'city':city.city_name,
							  'profpic':str(userprof.profpic),
							  'con_id':con.id,
							  'from_user_id':con.from_user_id,
							  'to_user_id':con.to_user_id,
							  'status_id':con.status_id
							 };
		i+=1
			
	return JsonResponse(recs)


@login_required
def collect_all_connections_view(request):
	uid=request.session['_auth_user_id']
	uid=int(uid)
	cons=Connects.objects.filter(from_user_id=uid,status_id=5)|Connects.objects.filter(to_user_id=uid,status_id=5)
	recs=dict()
	i=1
	for con in cons:
		if con.from_user_id==uid:
			invid=con.to_user_id
		else:
			invid=con.from_user_id

		user=User.objects.get(id=invid)		
		userprof=UserProfile.objects.get(user_id=invid)		
		city=City.objects.get(id=userprof.city_id)
		
		recs['obj'+str(i)] = {'user_id':user.id,
							  'username':user.username,
							  'mobile':userprof.mobile,
							  'city':city.city_name,
							  'profpic':str(userprof.profpic),
							  'con_id':con.id,
							  'from_user_id':con.from_user_id,
							  'to_user_id':con.to_user_id,
							  'status_id':con.status_id
							 };
		i+=1
			
	return JsonResponse(recs)


@login_required
def share_todo_view(request):
	uid=request.GET.get('uid')
	todoid=request.GET.get('todoid')

	todoaccess=ToDoAccess(todolist_id=todoid,user_id=uid)

	todoaccess.save()

	return HttpResponse('done')

@login_required
def active_records_view(request):
	uid=request.session['_auth_user_id']
	userprof=UserProfile.objects.get(user_id=uid)

	actrecs=ToDoList.objects.filter(userprof_id=userprof.pk).order_by('-updated_at')
	# print('#####################################################')
	#print(actrecs.query)
	#print(actrecs[0:3:1])
	# print('#####################################################')

	lst=actrecs[0:3:1]
	recs=dict()
	i=1
	for rec in lst:
		recs['obj'+str(i)]={'todoid':rec.id,'title':rec.title,'created':rec.created,'typeid':rec.todotype_id}
		i+=1

	return JsonResponse(recs)

@login_required
def active_shared_todos_view(request):
	uid=request.session['_auth_user_id']
	userprof=UserProfile.objects.get(user_id=uid)

	todoacc=ToDoAccess.objects.filter(user_id=uid).values('todolist_id').order_by('-id')
	recs=ToDoList.objects.filter(id__in=todoacc)[0:3:1]
	
	resp=dict()
	i=1
	for rec in recs:
		resp['obj'+str(i)]={'todoid':rec.pk,'title':rec.title,'created':rec.created,'typeid':rec.todotype_id}
		i+=1

	return JsonResponse(resp)


@login_required
def active_new_invites_view(request):
	uid=request.session['_auth_user_id']
	
	cons=Connects.objects.filter(to_user_id=uid,status_id=4).values('from_user_id').order_by('-id')
	users=User.objects.filter(id__in=cons)[:3:1]
	# print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
	# print(cons.query)
	# print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
	
	resp=dict()
	i=1
	for user in users:
		prof=UserProfile.objects.get(user_id=user.id)
		city=City.objects.get(id=prof.city_id)
		resp['obj'+str(i)]={'username':user.username,'email':user.email,'joined':user.date_joined,'mobile':prof.mobile,'profpic':str(prof.profpic),'city':city.city_name}
		i+=1

	
	return JsonResponse(resp)
