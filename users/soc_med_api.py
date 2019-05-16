from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse
from django.http import HttpResponse
import json
from django.shortcuts import redirect

from users.vk_auth import get_news_from_to_date, set_status
from users.vk_auth import repost as repost_vk
from users.vk_auth import set_like as set_like_vk

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
