from django.urls import path

from . import views

urlpatterns = [
	path('index/', views.index_view),
	path('showprofile/', views.show_profile_view),
	path('signup/', views.signup_view),
	path('actact/', views.account_activation_view),
	path('profile/', views.profile_view),
	path('showtodos/', views.show_todos_view),
	path('dashboard/', views.dashboard_view),
	path('sendotp/', views.sendotp_view),
	path('checkotp/', views.checkotp_view),
	path('changetitle/', views.change_title_view),
	path('deltodo/', views.delete_todo_view),
	path('savetextnote/', views.save_textnote_view),
	#path('deltextnote/', views.delete_textnote_view),
	path('savechecklist/', views.save_checklist_view),
	path('getallpoints/', views.all_points_view),
	path('setpointdone/', views.set_point_done_view),
	path('setpointactive/', views.set_point_active_view),
	path('connects/', views.show_connects_view),
	path('searchuser/', views.search_user_view),
	path('userdetail/', views.user_detail_view),
	path('startconnection/', views.start_connection_view),
	path('changeconstatus/', views.change_connection_status_view),
	path('collectinvites/', views.collect_invites_view),
	path('collectallcons/', views.collect_all_connections_view),
	path('sharetodo/', views.share_todo_view),
	path('activerecords/', views.active_records_view),
	path('activesharedtodos/', views.active_shared_todos_view),
	path('activenewinvites/', views.active_new_invites_view)
]