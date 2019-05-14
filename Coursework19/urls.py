from django.contrib import admin
from users import views as user_views
from django.contrib.auth import views as auth_views
from django.urls import path, include

from django.contrib.auth.decorators import login_required
from users.soc_med_api import display, change_status, repost, set_like
from users.views import set_page, porcess_vk_auth, porcess_vk_auth2
from Index import views as ind_views



urlpatterns = [
    path('', ind_views.red_home),
    path('index/', ind_views.home, name="index"),
    path('edit_page/', ind_views.edit_page, name="edit_page"),
    path('admin/', admin.site.urls),
    path('register/', user_views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='users/logout.html'), name='logout'),
    path('edit/', user_views.edit, name='edit'),
    path('feed/<int:utfrom>/<int:utto>/', display),
    path('repost/<int:owner_id>/<int:post_id>/', repost),
    path('like/<int:owner_id>/<int:post_id>/', set_like),
    path('style/', set_page),
    path('authorize/vk/',porcess_vk_auth, name='porcess_vk_auth'),
    path('authorize/vk/2',porcess_vk_auth2, name='porcess_vk_auth2'),
    path('change_status/vk/',change_status),
]
