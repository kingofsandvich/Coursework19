from django.contrib import admin
from users import views as user_views
from django.contrib.auth import views as auth_views
from django.urls import path, include

from django.contrib.auth.decorators import login_required
from users.soc_med_api import display, change_status, repost, set_like
from users.views import set_page, get_page, porcess_vk_auth, porcess_vk_auth2
from users.views import set_page2, get_page2, log_out
from Index import views as ind_views
# from Index import page


urlpatterns = [
    path('', ind_views.red_home),

    path('index/', ind_views.home, name="index"),
    path('edit_page/', ind_views.edit_page, name="edit_page"),
    path('admin/', admin.site.urls),
    # path('register/', user_views.register, name='register'),
    # path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),

    # path('es/',user_views.enter_site),
    path('deleteSource/',user_views.deleteSource),
    path('setSource/',user_views.setSource),
    path('userInfo/',user_views.userInfo),
    path('userUpdate/',user_views.userUpdate),
    path('loginAJAX/',user_views.loginAJAX),
    path('registerAJAX/',user_views.registerAJAX),
    path('enter/', user_views.enter_site, name='enter_site'),

    # path('enter_site/', user_views.JoinFormView.as_view(), name='enter'),

    path('register/', user_views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),

    path('logout/', log_out, name='logout'),
    path('edit/', user_views.edit, name='edit'),

    path('style/set/', set_page),
    path('style/', set_page),
    path('style/get/', get_page),

    path('page/<int:page_id>/get', get_page2), # ajax get page for constructor
    path('page/<int:page_id>/set', set_page2), # ajax set page for constructor
    path('page/<int:page_id>/edit', ind_views.edit_page2, name='page_edit'),
    path('page/<int:page_id>', ind_views.page, name='page_get'),

    path('change_status/vk/',change_status),
    path('feed/<int:utfrom>/<int:utto>/', display),
    path('repost/<int:owner_id>/<int:post_id>/', repost),
    path('like/<int:owner_id>/<int:post_id>/', set_like),
    path('authorize/vk/',porcess_vk_auth, name='porcess_vk_auth'),
    path('authorize/vk/2',porcess_vk_auth2, name='porcess_vk_auth2'),

    path('api/',include('REST.urls')),
]
