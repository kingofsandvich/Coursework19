from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegistrationForm, UserUpdateForm, ProfileUpdateForm
import json
from django import forms
from users.vk_auth import VKAuth
import vk
from django.http import HttpResponse
#AJAX регистрация и вход
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
# from django.contrib.auth.forms import UserCreationForm
from .models import Profile, API, Page
from django.contrib.auth import logout

def enter_site(request):
    if request.user.is_authenticated:
        return redirect('index')
    else:
        return render(request, 'users/enter_site.html')


def userUpdate(request):
    if request.method == 'POST':
        response_data = {}

        if request.user.is_authenticated: # авторизованный AJAX
            user = request.user
            mail = request.POST['mail']
            username = request.POST['username']
            password = request.POST['password']
            repeat_password = request.POST['repeat_password']

            # почта
            if mail and User.objects.filter(email=mail).exclude(username=username).exists():
                response_data['mail_error'] = ' mail is already in use; '
            else:
                if mail:
                    user.email = mail
                else:
                    response_data['mail_error'] = ' given email name is empty; '


            # имя пользователя
            if username and User.objects.filter(username=username).exists():
                response_data['username_error'] = ' username is already in use; '
            else:
                if username:
                    user.username = username
                else:
                    response_data['username_error'] = ' given username is empty; '

            # пароль
            if password and (password == repeat_password):
                user.set_password('new password')
            else:
                response_data['password_error'] = ' password is incorrect; '

            user.save()
            # response_data['url'] = '/index'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:                             # неавторизованный AJAX
            response_data['error'] = 'user not authenticated'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        # авторизованный пользователь
        if request.user.is_authenticated:
            return redirect('index')
        # неавторизованный пользователь
        return redirect('enter_site')

def loginAJAX(request):
    if request.method == 'POST':
        response_data = {}
        # авторизованный AJAX
        if request.user.is_authenticated:
            response_data['url'] = '/index'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        # неавторизованный AJAX
        username = request.POST['username']
        password = request.POST['password']
        # аутентификация
        user = authenticate(username = username, password = password)
        if user is not None:
            # аутентификация успешна
            login(request, user)
            response_data['url'] = '/index'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:
            # аутентификация не успешна
            response_data['error'] = 'user does not exsist or password is incorrect'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        # авторизованный пользователь
        if request.user.is_authenticated:
            return redirect('index')
        # неавторизованный пользователь
        return redirect('enter_site')

def register(request):
    if request.method == 'POST':
        response_data = {}
        # авторизованный AJAX
        if request.user.is_authenticated:
            response_data['url'] = '/index'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        # неавторизованный AJAX
        mail = request.POST['mail']
        username = request.POST['username']
        password = request.POST['password']
        repeat_password = request.POST['repeat_password']

        if password != repeat_password:
            response_data['error'] = 'passwords should match'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        if mail and User.objects.filter(email=mail).exclude(username=username).exists():
            response_data['error'] = ' mail is already in use; '
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        # регистрация
        user, created = User.objects.get_or_create(username=username, email=mail)
        pagenames = ['main', 'another', 'other', 'else']
        if created:
            for i in range(4):
                new_page = Page(name=pagenames[i], css='', html=pagenames[i] + ' page!')
                new_page.save()
                user.profile.pages.add(new_page)
            user.profile.save()
            user.set_password(password)
            user.save()
            login(request, user)
            response_data['url'] = '/index'
        else:
            response_data['error'] = 'could not create such a user'

        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        # авторизованный пользователь
        if request.user.is_authenticated:
            return redirect('index')
        # неавторизованный пользователь
        return redirect('enter_site')

# ______авторизация и API _______________________________
def if_source_token_active(token, source):
    try:
        if source == 'vk':
            return get_source_id(token, source) != -1
        else:
            return False
        return True
    except:
        return False

def get_source_id(token, source='vk'):
    if source == 'vk':
        # print(type(token))
        # print(token)

        session = vk.Session(access_token = token)
        vk_api = vk.API(session, v = '5.92')
        return vk_api.users.get()[0]['id']
    else:
        return -1

# чтобы у двух пользователей не было одного аккаунта
def can_change_source_user(user, api_username, token, source='vk', in_use=True):
    answ = False
    message = ''

    id = get_source_id(token, source)

    # проверяем есть ли базе данных пользователь соцсети с таким id
    in_apis = API.objects.filter(user_id=id, source=source).exists()
    # или и соответствует ли владелец этого обьекта текущему пользователю сайта
    in_users_apis = user.profile.apis.all().filter(user_id=id, source=source).exists()

    if ~in_apis:
        # такого api нет, создаем для переданного пользователя
        answ = True
        message = source + " user authenticated in current account"
        new_api = API(user_id=id,
                      token=token,
                      username=api_username,
                      source=source,
                      in_use=in_use)
        new_api.save()
        user.profile.apis.add(new_api)
        user.profile.save()
    elif in_users_apis:
        # такой api есть у текущего пользователя
        # обновляем его поля
        users_api = user.profile.apis.all().filter(user_id=id, source=source)[0]
        users_api.token = token
        users_api.username = username
        users_api.in_use = in_use
        users_api.save()

        answ = True
        message = source + " user is already authenticated in current account"
    else: # то же что ~in_users_apis
        # api используется другим пользователем
        answ = False
        message = source + " user authenticated in other account"

    return answ, message

# не вызывается напрямую
# предпологаем, что пользователь авторизован, а метод запроса POST
@login_required
def vk_auth_step_one(request):
    response_data = {}

    username = request.POST['username']
    password = request.POST['password']
    source = request.POST['source']
    step = int(request.POST['step'])
    in_use = request.POST['in_use'] == 'true'

    app_id = 6836128
    scope = ['friends', 'wall', 'offline', 'groups']
    vkAuth = VKAuth(scope, app_id, '5.92', username, password)

    response_value = -1
    try:
        response_value = vkAuth.auth_step1()
    except:
        response_value = -1

    response_data['username'] = username
    response_data['source'] = source
    response_data['in_use'] = in_use

    if response_value == -1:
        response_data['error'] = 'authorization error, invalid username or password'
    elif response_value == 0:
        token = vkAuth.get_token()
        can_use, message = can_change_source_user(request.user, username, token, 'vk', in_use)
        if can_use:
            is_actve = True # так как выданный токен назначается новым и старым объектам
            response_data['is_actve'] = is_actve
            response_data['step'] = 1
        else:
            response_data['error'] = message
        print(vkAuth)
        print(type(vkAuth))
        request.user.profile.temp_api_object = vkAuth
        request.user.profile.save()
        request.user.save()
    else:
        print()
        print(vkAuth.__dict__)
        print()
        print(vkAuth.response.__dict__)
        print()

        request.user.profile.temp_api_object = vkAuth
        request.user.profile.vkapi = vkAuth.session

        request.user.profile.save()
        request.user.save()
        response_data['step'] = 2

    print(response_data)
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required
# по аналогии с vk_auth_step_one
def vk_auth_step_two(request):
    response_data = {}
    vkAuth = request.user.profile.temp_api_object
    vkAuth.session = request.user.profile.vkapi

    code = request.POST['code']
    username = request.POST['username']
    password = request.POST['password']
    source = request.POST['source']
    step = int(request.POST['step'])
    in_use = request.POST['in_use'] == 'true'

    response_data['username'] = username
    response_data['source'] = source
    response_data['in_use'] = in_use

    try:
        vkAuth.continue_auth(code)
        token = vkAuth.get_token()
        can_use, message = can_change_source_user(request.user,
                                                  username,
                                                  token,
                                                  'vk',
                                                  in_use)
        if can_use:
            is_actve = True # так как выданный токен назначается новым и старым объектам
            response_data['is_actve'] = is_actve
            response_data['step'] = 1
        else:
            response_data['error'] = message
    except:
        response_data['error'] = 'authorization error, invalid code'

    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required
def deleteSource(request):
    response_data = {}
    if request.method == 'POST':
        user_id = request.POST['user_id']
        source = request.POST['source']

        try:
            request.user.profile.apis.all().filter(user_id=user_id, source=source).delete()
        except:
            response_data['error'] = 'can not delete from database'

    else:
        response_data['error'] = 'wrong request method'
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required
def setSource(request):
    response_data = {}
    if request.method == 'POST':
        source = request.POST['source']
        step = int(request.POST['step'])

        if source == 'vk':
            if step == 1:
                return vk_auth_step_one(request)
            elif step == 2:
                return vk_auth_step_two(request)
            else:
                response_data['error'] = 'undefined situation'
        else:
            response_data['error'] = 'unknown source'
    else:
        response_data['error'] = 'wrong request method'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required
def userInfo(request):
    response_data = {}
    if (request.method == 'POST') & request.user.is_authenticated:
        response_data['username'] = request.user.username
        response_data['mail'] = request.user.email
        accounts = []

        for account in request.user.profile.apis.all():
            print(account.token)
            accounts.append({
                'source' : account.source,
                'username' : account.username,
                'is_actve' : if_source_token_active(account.token, account.source),
                'in_use' : account.in_use,
                'is_filled' : True,
                'step' : 1,
                'user_id' : account.user_id,
            })

        response_data['accounts'] = accounts
    else:
        response_data['error'] = 'user not authenticated'
    return HttpResponse(json.dumps(response_data), content_type="application/json")

def log_out(request):
    logout(request)
    return redirect('enter_site')

@login_required
def set_page(request, page_id):
    response_data = {}
    if request.method == 'POST':
        if request.user.is_authenticated: # авторизованный AJAX
            page = Page.objects.get(id=page_id)
            page.css = request.POST['css']
            page.html = request.POST['html']
            page.name = request.POST['name']
            page.save()
            response_data['status'] = 'page changed'
        else:
            response_data['error'] = 'user not authenticated'
    else:
        response_data['error'] = 'wrong request method'
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required
def get_page(request, page_id):
    response_data = {}
    if request.method == 'POST':
        if request.user.is_authenticated: # авторизованный AJAX
            page = Page.objects.get(id=page_id)
            response_data['css'] = page.css
            response_data['html'] = page.html
            response_data['name'] = page.name
            response_data['id'] = page_id
        else:
            response_data['error'] = 'user not authenticated'
    else:
        response_data['error'] = 'wrong request method'
    return HttpResponse(json.dumps(response_data), content_type="application/json")
