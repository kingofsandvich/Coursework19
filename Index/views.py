from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages

# Create your views here.

def home(request):
	html = ""
	css = ""
	if request.user.is_authenticated:
		html = request.user.profile.html
		css = request.user.profile.css
	return render(request, 'Index/index.html', {'html': html, 'css':css})

def red_home(request):
	if request.user.is_authenticated:
		return redirect('index')
	else:
		return redirect('enter_site')

def edit_page(request):
	return render(request, 'Index/edit_page.html')#, {'html': html, 'css':css})
