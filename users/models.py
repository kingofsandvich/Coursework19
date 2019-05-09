from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vklogin = models.CharField(max_length=100)
    vkpassword = models.CharField(max_length=100)
    youtubetoken = models.CharField(max_length=100)
    def __str__(self):
        return f'{self.user.username}'

class Posts(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
