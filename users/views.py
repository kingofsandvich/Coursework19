from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegistrationForm, UserUpdateForm, ProfileUpdateForm
from django.shortcuts import redirect
import json
from django import forms
from users.vk_auth import VKAuth

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
    try:
        data = json.loads(request.GET['data'])
        request.user.profile.html = data['html']
        request.user.profile.css = data['css']
        request.user.profile.save()
        return redirect('index')
    except Exception as e:
        print('error in editing styles (url: /style/)')

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
