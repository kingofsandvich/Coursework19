from django.db import models
from picklefield.fields import PickledObjectField
from django.contrib.auth.models import User

class Page(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField(default='')
    css = models.TextField(default='')
    html = models.TextField(default='')

APIs = set(['vk','youtube'])

class API(models.Model):
    api_object = PickledObjectField(null=True)
    token = models.CharField(max_length=100, default='')
    user_id = models.CharField(max_length=100, default='')
    username = models.CharField(max_length=100, default='')
    source = models.CharField(max_length=3, default='')
    in_use = models.BooleanField(default=True)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vkapi = PickledObjectField(null=True)
    temp_api_object = PickledObjectField(null=True)
    formParser = PickledObjectField(null=True)

    css = models.CharField(max_length=10000 ,default='')
    html = models.CharField(max_length=10000, default='')

    vktoken = models.CharField(max_length=100, default='')
    vklogin = models.CharField(max_length=100,blank=True)
    vkpassword = models.CharField(max_length=100,blank=True)
    youtubetoken = models.CharField(max_length=100,blank=True)

    apis = models.ManyToManyField(API)
    pages = models.ManyToManyField(Page)

    # pages = models.ForeignKey(Page, on_delete=models.CASCADE)


    def __str__(self):
        return f'{self.user.username}'
