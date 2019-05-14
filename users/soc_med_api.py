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
from django.shortcuts import redirect

from users.vk_auth import get_news_from_to_date, set_status
from users.vk_auth import repost as repost_vk
from users.vk_auth import set_like as set_like_vk

def get_news_from_to (vkAuth, utfrom, utto) :
    access_token = vkAuth.get_token()
    session0 = vk.Session(access_token = access_token)
    vk_api = vk.API(session0, v = '5.92')

    news = []
    newsFeed = vk_api.newsfeed.get(max_photos = 15,
                                   count = 100,
                                   start_time = utfrom,
                                   end_time = utto)

    news += newsFeed['items']
    i = len(news) - 1
    try :
        nextPg = newsFeed['next_from']
        while i < 1000 :
            if nextPg :
                newsFeed = vk_api.newsfeed.get(max_photos = 15,
                                               count = 100,
                                               start_time = utfrom,
                                               start_from = utto)
                news += newsFeed['items']
                i = len(news) - 1
            else :
                break
    except  :
        print('error while getting VK feed')

    if i >= 1000 :
        news = news[:1000]
    print("num posts = " + str(len(news)))
    news = {"vk":news}

    return json.dumps(news)

#@login_required
def display(request, utfrom, utto):
    profile = request.user.profile
    #print(profile.vkapi)
    if (profile.vkapi == None):
        redirect('porcess_vk_auth')

    data = get_news_from_to_date(profile.vktoken, utfrom, utto)
    print(len(data))
    data = json.dumps({"vk":data})

    return HttpResponse(data, content_type="application/json")

def repost(request, owner_id, post_id):
    try:
        session = vk.Session(access_token = request.user.profile.vktoken)
        vk_api = vk.API(session, v = '5.92')
        repost_vk(post_id, -owner_id, "", vk_api)
        return HttpResponse("ok")
    except Exception as e:
        return HttpResponse("error")

def set_like(request, owner_id, post_id):
    session = vk.Session(access_token = request.user.profile.vktoken)
    vk_api = vk.API(session, v = '5.92')
    set_like_vk(post_id, -owner_id, vk_api)
    return HttpResponse("ok")
    try:
        session = vk.Session(access_token = request.user.profile.vktoken)
        vk_api = vk.API(session, v = '5.92')
        set_like_vk(post_id, -owner_id, "", vk_api)
        return HttpResponse("ok")
    except Exception as e:
        return HttpResponse("error")

def change_status(request):
    try:
        print(request.GET['data'])
        set_status(request.GET['data'], request.user.profile.vktoken)
        return HttpResponse("ok")
    except Exception as e:
        return HttpResponse("error")
