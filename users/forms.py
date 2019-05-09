from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile

# переопределяем поля пользователя
class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=False)
    #vklogin = forms.CharField(required=False)
    #vkpassword = forms.CharField(required=False)
    #youtubetoken = forms.CharField(required=False)
    class Meta:
        model = User
        fields = ['username', 'email', 'password1','password2']

class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField()
    class Meta:
        model = User
        fields = ['username','email']

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['vklogin','vkpassword','youtubetoken']
