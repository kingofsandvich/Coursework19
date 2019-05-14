from django.db import models
from picklefield.fields import PickledObjectField
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vkapi = PickledObjectField(null=True)
    formParser = PickledObjectField(null=True)
    css = models.CharField(max_length=10000 ,default='')
    html = models.CharField(max_length=10000, default='')
    vktoken = models.CharField(max_length=100, default='')
    vklogin = models.CharField(max_length=100,blank=True)
    vkpassword = models.CharField(max_length=100,blank=True)
    youtubetoken = models.CharField(max_length=100,blank=True)
    def __str__(self):
        return f'{self.user.username}'
