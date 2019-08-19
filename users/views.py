from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegistrationForm, UserUpdateForm, ProfileUpdateForm
import json
from django import forms
from users.vk_auth import VKAuth
from django.http import HttpResponse
#AJAX регистрация и вход
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
# from django.contrib.auth.forms import UserCreationForm
from .models import Profile

def enter_site(request):
    if request.user.is_authenticated:
        return redirect('index')
    else:
        return render(request, 'users/enter_site.html')

def userInfo(request):
    response_data = {}
    if (request.method == 'POST') & request.user.is_authenticated:
        response_data['username'] = request.user.username
        response_data['mail'] = request.user.email
    else:
        response_data['error'] = 'user not authenticated'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


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


        # if password != repeat_password:
        #     response_data['error'] = 'passwords should match'
        #     return HttpResponse(json.dumps(response_data), content_type="application/json")
        # if mail and User.objects.filter(email=mail).exclude(username=username).exists():
        #     response_data['error'] = ' mail is already in use; '
        #     return HttpResponse(json.dumps(response_data), content_type="application/json")
        # # регистрация
        # user, created = User.objects.get_or_create(username=username, email=mail)
        # if created:
        #     user.set_password(password)
        #     user.save()
        #     login(request, user)
        #     response_data['url'] = '/index'
        #     return HttpResponse(json.dumps(response_data), content_type="application/json")
        # else:
        #     response_data['error'] = 'could not create such a user'
        #     return HttpResponse(json.dumps(response_data), content_type="application/json")

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
# ______________________________________ #
def registerAJAX(request):
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
        if created:
            user.set_password(password)
            user.save()
            login(request, user)
            response_data['url'] = '/index'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:
            response_data['error'] = 'could not create such a user'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        # user = authenticate(username = username, password = password)
        # if user is not None:
        #     # аутентификация успешна
        #     login(request, user)
        #     response_data['url'] = '/index'
        #     return HttpResponse(json.dumps(response_data), content_type="application/json")
        # else:
        #     # аутентификация не успешна
        #     response_data['error'] = 'user does not exsist or password is incorrect'
        #     return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        # авторизованный пользователь
        if request.user.is_authenticated:
            return redirect('index')
        # неавторизованный пользователь
        return redirect('enter_site')
# ______________________________________ #
# class UserForm(forms.Form):
#     username = forms.CharField(max_length=120)
#     password = forms.CharField(max_length=120)
#
# class UserFormView(FormView):
#     form_class = UserForm
#     # template_name = 'users/ajax.html'
#     success_url = '/index/'
#
#     def form_valid(self, form):
#         response = super(UserFormView, self).form_invalid(form)
#         if self.request.is_ajax():
#             print(form.cleaned_data)
#             data = {
#                 'message' : "Successfully submited form data."
#             }
#             print(response)
#             return JsonResponse(form.errors, status=400)
#         else:
#             return response
#
#     def form_valid(self, form):
#         response = super(UserFormView, self).form_invalid(form)
#         if self.request.is_ajax():
#             print(form.cleaned_data)
#             data = {
#                 'message' : "Successfully submited form data."
#             }
#             return JsonResponse(data)
#         else:
#             return response
#______________________________________#

class VKForm(forms.Form):
    login = forms.CharField(required=True, label='Логин')
    password = forms.CharField(widget=forms.PasswordInput(), required=True, label='Пароль')
class VKForm_two_factor(forms.Form):
    code = forms.CharField(required=True, label='Код подтверждения')


@login_required
def porcess_vk_auth2(request):
    vk_second = request.session.get('vk_second')
    if (vk_second == None):
        redirect('porcess_vk_auth')
    if (not vk_second):
        form = VKForm_two_factor(request.POST)
        if (form.is_valid()):
            code = form.cleaned_data.get('code')
            print(code)
            vkAuth = request.user.profile.vkapi
            vkAuth.form_parser = request.user.profile.formParser
            print(vkAuth)
            print(vkAuth.form_parser)
            print(vkAuth.form_parser.url)
            messages.success(request, f'Введите код подтверждения.')
            return redirect('index')
    else:
        form = VKForm_two_factor()
        request.session['vk_second'] = False
    return render(request, 'users/auth.html', {'form':form})

# Обработка формы авторизации vk
# заполняет пользователю поле с данными для доступа к API vk
# в случае невалидности данных выдает сообщение
@login_required
def porcess_vk_auth(request):

    if (request.method == 'POST'):
        form = VKForm(request.POST)
        if (form.is_valid()):
            login = form.cleaned_data.get('login')
            password = form.cleaned_data.get('password')

            scope = ['friends', 'wall', 'offline', 'groups', 'status']
            app_id = 6836128
            vkAuth = VKAuth(scope, app_id, '5.92')
            #ставим логин и пароль из первой формы
            vkAuth.set_login_password(login, password)
            #первый шаг: если ошибка возвращает -1, если все норм то 0. После этого
            #можно пользоваться этим объектом чтобы забрать токен доступа
            res = vkAuth.auth_step1()
            #переменная отвечающая за код двухфакторки (берем из второй формы)
            code = '165404'
            #если результат первой итерации 1 то вызываем функцию которая логинит нас через код для двухфакторки
            #res = 1
            if res == -1 :
                messages.success(request, f'Ошибка авторизации. Проверьте введенные данные.')
                return redirect('porcess_vk_auth')
            elif res == 0 :
                messages.success(request, f'Аккаунт ВК {login} добавлен.')
                request.user.profile.vkapi = vkAuth
                request.user.profile.formParser = vkAuth.form_parser
                request.user.profile.vktoken = vkAuth.get_token()
                print(vkAuth.get_token())
                request.user.profile.save()
                return redirect('index')
            else:
                return redirect('porcess_vk_auth')
                '''
                #redirect('porcess_vk_auth2', vkAuth=(vkAuth), first_call=True)
                request.user.profile.vkapi = vkAuth
                request.user.profile.formParser = vkAuth.form_parser
                request.session['vk_second'] = True
                request.user.profile.save()#update_fields=["vkapi"])
                #vkAuth.continue_auth(code)
                messages.success(request, f'Введите код подтверждения.')
                return redirect('porcess_vk_auth2')
                '''
    else:
        form = VKForm()
    return render(request, 'users/auth.html', {'form':form})

@login_required
def set_page(request):
    response_data = {}
    if request.method == 'POST':
        if request.user.is_authenticated: # авторизованный AJAX
            request.user.profile.css = request.POST['css']
            request.user.profile.html = request.POST['html']
            request.user.profile.save()
            response_data['status'] = 'page changed'
        else:
            response_data['error'] = 'user not authenticated'
    else:
        response_data['error'] = 'wrong request method'
    return HttpResponse(json.dumps(response_data), content_type="application/json")
    # try:
    #     data = json.loads(request.GET['data'])
    #     request.user.profile.html = data['html']
    #     request.user.profile.css = data['css']
    #     request.user.profile.save()
    #     return redirect('index')
    # except Exception as e:
    #     print('error in editing styles (url: /style/)')

@login_required
def get_page(request):
    response_data = {}
    if request.method == 'POST':
        if request.user.is_authenticated: # авторизованный AJAX
            response_data['css'] = request.user.profile.css
            response_data['html'] = request.user.profile.html
        else:
            response_data['error'] = 'user not authenticated'
    else:
        response_data['error'] = 'wrong request method'
    return HttpResponse(json.dumps(response_data), content_type="application/json")

# Create your views here.
def register(request):
    if (request.method == 'POST'):
        form = UserRegistrationForm(request.POST)
        if (form.is_valid()):
            username = form.cleaned_data.get('username')
            form.save()
            messages.success(request, f'Аккаунт создан {username}, можете войти!')
            return redirect('login')
    else:
        form = UserRegistrationForm()
    return render(request, 'users/register.html', {'form':form})

@login_required
def edit(request):
    if (request.method == 'POST'):
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, instance=request.user.profile)

        if (u_form.is_valid() and p_form.is_valid()):
            u_form.save()
            p_form.save()
            messages.success(request, 'Ваш аккаунт изменен')
            return redirect('edit')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)

    context = {
        'u_form' : u_form,
        'p_form' : p_form,
    }
    return render(request, 'users/edit.html' ,context)
