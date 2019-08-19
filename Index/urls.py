from rest_framework import routers
from .api import PageContentViewSet

router = routers.DefaultRouter()
router.register('api/data', PageContentViewSet, 'page_content')

urlpatterns = router.urls
