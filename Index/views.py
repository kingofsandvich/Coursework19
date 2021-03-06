from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
# from django.template import RequestContext

# Create your views here.

def home(request):
	html = ""
	css = ""

	if request.user.is_authenticated:
		page = request.user.profile.pages.all()[0]
		html = page.html
		css = page.css

	return render(request, 'Index/index.html', {'html': html, 'css':css})

def page(request, page_id):
	html = "<h1>page not available</h1>"
	css = ""

	if request.user.is_authenticated:
		pages = request.user.profile.pages.all()
		for page in pages:
			if page.id == page_id:
				html = page.html
				css = page.css

	return render(request, 'Index/index.html', {'html': html, 'css':css})

def red_home(request):
	if request.user.is_authenticated:
		return redirect('index')
	else:
		return redirect('enter_site')

def edit_page(request, page_id):
	return render(request, 'Index/edit_page.html', {'id': page_id})
