import re
import urllib
import logging
import requests
import getpass
from html.parser import HTMLParser
import vk
from datetime import datetime
from datetime import timedelta
import time as tm

from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse
from django.http import HttpResponse
import json
import copy

class FormParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.url         = None
        self.denial_url  = None
        self.params      = {}
        self.method      = 'GET'
        self.in_form     = False
        self.in_denial   = False
        self.form_parsed = False

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == 'form':
            if self.in_form:
                raise RuntimeError('Nested form tags are not supported yet')
            else:
                self.in_form = True
        if not self.in_form:
            return

        attrs = dict((name.lower(), value) for name, value in attrs)

        if tag == 'form':
            self.url = attrs['action']
            if 'method' in attrs:
                self.method = attrs['method']
        elif tag == 'input' and 'type' in attrs and 'name' in attrs:
            if attrs['type'] in ['hidden', 'text', 'password']:
                self.params[attrs['name']] = attrs['value'] if 'value' in attrs else ''
        elif tag == 'input' and 'type' in attrs:
            if attrs['type'] == 'submit':
                self.params['submit_allow_access'] = True
        elif tag == 'div' and 'class' in attrs:
            if attrs['class'] == 'near_btn':
                self.in_denial = True
        elif tag == 'a' and 'href' in attrs and self.in_denial:
            self.denial_url = attrs['href']

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == 'form':
            if not self.in_form:
                raise RuntimeError('Unexpected end of <form>')
            self.form_parsed = True
            self.in_form = False
        elif tag == 'div' and self.in_denial:
            self.in_denial = False
    def __deepcopy__(self, memo):
        fp = FormParser()
        fp.url         = self.url
        fp.denial_url  = self.denial_url
        fp.params      = self.params
        fp.method      = self.method
        fp.in_form     = self.in_form
        fp.in_denial   = self.in_denial
        fp.form_parsed = self.form_parsed
        return fp


class VKAuth(object):

    def __init__(self, permissions, app_id, api_v, email=None, pswd=None, two_factor_auth=False, security_code=None, auto_access=True):
        """
        @args:
            permissions: list of Strings with permissions to get from API
            app_id: (String) vk app id that one can get from vk.com
            api_v: (String) vk API version
        """

        self.session        = requests.Session()
        self.form_parser    = FormParser()
        self._user_id       = None
        self._access_token  = None
        self.response       = None

        self.permissions    = permissions
        self.api_v          = api_v
        self.app_id         = app_id
        self.two_factor_auth= two_factor_auth
        self.security_code  = security_code
        self.email          = email
        self.pswd           = pswd
        self.auto_access    = auto_access

        if security_code != None and two_factor_auth == False:
            raise RuntimeError('Security code provided for non-two-factor authorization')

    def auth_step1(self):
        """
            1. Asks vk.com for app authentication for a user
            2. If user isn't logged in, asks for email and password
            3. Retreives access token and user id
        """
        api_auth_url = 'https://oauth.vk.com/authorize'
        app_id = self.app_id
        permissions = self.permissions
        redirect_uri = 'https://oauth.vk.com/blank.html'
        display = 'wap'
        api_version = self.api_v

        auth_url_template = '{0}?client_id={1}&scope={2}&redirect_uri={3}&display={4}&v={5}&response_type=token'
        auth_url = auth_url_template.format(api_auth_url, app_id, ','.join(permissions), redirect_uri, display, api_version)

        self.response = self.session.get(auth_url)

        #look for <form> element in response html and parse it
        if not self._parse_form():
            return -1
            #raise RuntimeError('No <form> element found. Please, check url address')
        else:
            # try to log in with email and password (stored or expected to be entered)
            try :
                if not self._log_in() :
                    return -1
            except :
                return -1

            # handling two-factor authentication
            # expecting a security code to enter here
            if self.two_factor_auth:
                return 1

            else :
                # allow vk to use this app and access self.permissions
                self._allow_access()

                # now get _access_token and _user_id
                self._get_params()

                # close current session
                self._close()
                return 0

    def set_login_password(self, login, password):
        self.pswd = password
        self.email = login

    def get_login_password(self) :
        return [self.email, self.pswd]

    def get_token(self):
        """
            @return value:
                None if _access_token == None
                (String) access_token that was retreived in self.auth() method
        """
        return self._access_token

    def get_user_id(self):
        """
            @return value:
                None if _user_id == None
                (String) _user_id that was retreived in self.auth() method
        """
        return self._user_id

    def continue_auth(self, code):
        self._two_fact_auth()

        self.security_code = code
        self._submit_form({'code': self.security_code})

        if not self._parse_form():
            raise RuntimeError('No <form> element found. Please, check url address')

        # allow vk to use this app and access self.permissions
        self._allow_access()

        # now get _access_token and _user_id
        self._get_params()

        # close current session
        self._close()

    def _parse_form(self):

        self.form_parser = FormParser()
        parser = self.form_parser

        try:
            parser.feed(str(self.response.content))
        except:
            print('Unexpected error occured while looking for <form> element')
            return False

        return True

    def _submit_form(self, *params):

        parser = self.form_parser

        if parser.method == 'post':
            payload = parser.params
            payload.update(*params)
            try:
                self.response = self.session.post(parser.url, data=payload)
            except requests.exceptions.RequestException as err:
                print("Error: ", err)
            except requests.exceptions.HTTPError as err:
                print("Error: ", err)
            except requests.exceptions.ConnectionError as err:
                print("Error: ConnectionError\n", err)
            except requests.exceptions.Timeout as err:
                print("Error: Timeout\n", err)
            except:
                print("Unexpecred error occured")

        else:
            self.response = None

    def _log_in(self):

        self._submit_form({'email': self.email, 'pass': self.pswd})

        if not self._parse_form():
            raise RuntimeError('No <form> element found. Please, check url address')

        # if wrong email or password
        if 'pass' in self.form_parser.params:
            print('Wrong email or password')
            self.email = None
            self.pswd = None
            return False
        elif 'code' in self.form_parser.params and not self.two_factor_auth:
            self.two_factor_auth = True
            return True
        else:
            return True

    def _two_fact_auth(self):

        prefix = 'https://m.vk.com'

        if prefix not in self.form_parser.url:
            self.form_parser.url = prefix + self.form_parser.url

        if self.security_code == None:
            print('Enter security code for two-factor authentication: ')

    def _allow_access(self):

        parser = self.form_parser

        if 'submit_allow_access' in parser.params and 'grant_access' in parser.url:
            if not self.auto_access:
                answer = ''
                msg =   'Application needs access to the following details in your profile:\n' + \
                        str(self.permissions) + '\n' + \
                        'Allow it to use them? (yes or no)'

                attempts = 5
                while answer not in ['yes', 'no'] and attempts > 0:
                    answer = input(msg).lower().strip()
                    attempts-=1

                if answer == 'no' or attempts == 0:
                    self.form_parser.url = self.form_parser.denial_url
                    print('Access denied')

            self._submit_form({})

    def _get_params(self):

        try:
            params = self.response.url.split('#')[1].split('&')
            self._access_token = params[0].split('=')[1]
            self._user_id = params[2].split('=')[1]
        except IndexError as err:
            print('Coudln\'t fetch token and user id\n')
            print(err)
            print(self.response.url)

    def _close(self):
        self.session.close()
        self.response = None
        self.form_parser = None
        self.security_code = None
        self.email = None
        self.pswd = None

    def __deepcopy__(self, memo):
        vkAuth = VKAuth(self.permissions, self.app_id, self.api_v,
       self.email, self.pswd, self.two_factor_auth,
        self.security_code, self.auto_access)
        vkAuth.form_parser = copy.deepcopy(self.form_parser)

        print(vkAuth.form_parser)
        return vkAuth


#lastNDays - за сколько последних дней нужны новости
def get_news_till_date (vkAuth, lastNDays) :
    token = vkAuth.get_token()
    session0 = vk.Session(access_token = token)
    vk_api = vk.API(session0, v = '5.92')

    if lastNDays < 1 :
        lastNDays = 1
    news = []
    time = (datetime.now() - timedelta(days=lastNDays))
    unixtime = tm.mktime(time.timetuple())
    newsFeed = vk_api.newsfeed.get(max_photos = 15, count = 100, start_time = unixtime, filters = 'post')
    news += newsFeed['items']
    i = len(news) - 1
    try :
        nextPg = newsFeed['next_from']


        while i < 1000 :
            if nextPg :
                newsFeed = vk_api.newsfeed.get(max_photos = 15, count = 100, start_time = unixtime,
                                               start_from = nextPg, filters = 'post')
                news += newsFeed['items']
                i = len(news) - 1
                nextPg = newsFeed['next_from']

            else :
                break

    except Exception as ex :
        print(ex)

    if i >= 1000 :
        news = news[:1000]

    return news

# время в юникс формате
def get_news_from_to_date (token, from_time, to_time) :
    #token = vkAuth.get_token()
    session0 = vk.Session(access_token = token)
    vk_api = vk.API(session0, v = '5.92')

    news = []
    newsFeed = vk_api.newsfeed.get(max_photos = 15, count = 100, start_time = from_time,
                                   end_time = to_time, filters = 'post')
    news += newsFeed['items']
    i = len(news) - 1
    try :
        nextPg = newsFeed['next_from']


        while i < 1000 :
            if nextPg :
                newsFeed = vk_api.newsfeed.get(max_photos = 15, count = 100, start_time = from_time,
                                               start_from = nextPg, end_time = to_time, filters = 'post')
                news += newsFeed['items']
                i = len(news) - 1
                nextPg = newsFeed['next_from']

            else :
                break

    except Exception as ex :
        print(ex)

    if i >= 1000 :
        news = news[:1000]

    return news

'''
scope = ['friends', 'wall', 'offline', 'groups']
vkAuth = VKAuth(scope, app_id, '5.92')
#ставим логин и пароль из первой формы
vkAuth.set_login_password(login, password)
#первый шаг: если ошибка возвращает -1, если все норм то 0. После этого
#можно пользоваться этим объектом чтобы забрать токен доступа
res = vkAuth.auth_step1()
#переменная отвечающая за код двухфакторки (берем из второй формы)
code = '165404'
#если результат первой итерации 1 то вызываем функцию которая логинит нас через код для двухфакторки
if res == 1 :
    vkAuth.continue_auth(code)
'''

#id - post_id у объекта поста из ленты, owner - source_id у объекта поста

def set_like (id, owner, vk_api) :
    try :
        vk_api.likes.add(type = 'post', item_id = id, owner_id = owner)
    except Exception as err :
        print(err)

def delete_like (id, owner, vk_api) :
    try :
        vk_api.likes.delete(type = 'post', item_id = id, owner_id = owner)
    except Exception as err :
        print(err)
#text - сопроводительный текст к репосту

def repost (id, owner, text, vk_api) :
    try :
        obj = "wall" + str(owner) + "_" + str(id)
        vk_api.wall.repost(message = text, object = obj)
    except Exception as ex :
        print(ex)

#text - текст комментария

def comment(id, owner, text, vk_api) :
    try:
        vk_api.wall.createComment(message = text, owner_id = owner, post_id = id)
    except Exception as ex :
        print(ex)

#текст поста

def post(text, vk_api) :
    try :
        vk_api.wall.post(message = text)
    except Exception as ex :
        print(ex)

#id - айди группы или поста. По идее они положительные, но когда мы берем их из объектов новостной ленты
#как source_id, то получаем для групп отрицательные числа. Это неважно: просто передаем поле source_id как оно есть

def get_name(id, vk_api) :
    try :
        if id > 0 :
            user = vk_api.users.get(user_ids = [id], fields = 'photo_50,photo_max,photo_max_orig')[0]
            full_name = ""
            try :
                full_name += (user['first_name'] + " ")
            except :
                print ('no name')
            try :
                full_name += user['last_name']
            except :
                print ('no sec name')
            return full_name
        else :
            group = vk_api.groups.getById(group_id = -id, fields = 'description')[0]
            return group['name']
    except Exception as ex :
        print(ex)
    return str(id)

def set_status (text, token) :
    session = vk.Session(access_token = token)
    vk_api = vk.API(session, v = '5.92')
    try :
        vk_api.status.set(text = text)
    except Exception as ex :
        print (ex)
