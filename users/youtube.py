key = "AIzaSyAGiKPDv5E6fvVleGpVBglxDfci3GJ2xG8"

from apiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from datetime import datetime
from datetime import timedelta

#возвращает список ваших подписок на ютубе для следующего метода
def get_subscriptions(youtube) :
    nextpgtoken = None

    subscriptions_all = []

    while 1 :
        subres = youtube.subscriptions().list(part="snippet,contentDetails",
            mine=True, maxResults=5, pageToken=nextpgtoken).execute()

        subscriptions_all+=subres['items']


        nextpgtoken = subres.get('nextPageToken')


        if nextpgtoken is None :
            break

    return subscriptions_all

#получить недельные видео из подписок. Возвращает лист объектов видео, принимает лист подписок,
#который получается из прошлого метода
def get_week_videos(subscriptions, youtube) :

    time = (datetime.now() - timedelta(days=7))
    videos_all = []
    print(time)
    j = 0
    for channel in subscriptions :
        i = 0
        nextpgtoken = None
        videos_latest = youtube.channels().list(id=channel['snippet']['resourceId']['channelId'],
                                                part="contentDetails").execute()
        while True :

            subres = youtube.playlistItems().list(playlistId=videos_latest['items'][0]
                                                  ['contentDetails']['relatedPlaylists']
                                                  ['uploads'], part='snippet',maxResults=50,
                                                  pageToken=nextpgtoken).execute()

            if (datetime.strptime(subres['items'][len(subres['items']) - 1]['snippet']['publishedAt'][:-5], '%Y-%m-%dT%H:%M:%S') < time) :
                videos_all+=subres['items']
                break;

            videos_all+=subres['items']

            try :
                nextpgtoken = subres.get('nextPageToken')
            except :
                break

            if nextpgtoken is None :
                break

            i+=1

    videos_all = [x for x in videos_all if datetime.strptime(x['snippet']['publishedAt'][:-5], '%Y-%m-%dT%H:%M:%S') > time]

    last_videos_sorted = sorted(videos_all, key=lambda video: video['snippet']['publishedAt'][:-5], reverse = True)
    return last_videos_sorted

#просто получить строчку юрл видео
def get_url (video) :
    return "https://www.youtube.com/watch?v=" + video['snippet']['resourceId']['videoId']

#поставить лайк видео
def set_like (video, youtube) :
    try :
        print(video['snippet'])
        youtube.videos().rate(id = video['snippet']['resourceId']['videoId'], rating = 'like').execute()
    except Exception as ex :
        print (ex)

#поставить диз
def set_dislike (video, youtube) :
    try :
        youtube.videos().rate(id = video['snippet']['resourceId']['videoId'], rating = 'dislike').execute()
    except Exception as ex :
        print (ex)

#убрать оценку с видоса
def remove_rating (video, youtube) :
    try :
        youtube.videos().rate(id = video['snippet']['resourceId']['videoId'], rating = 'none').execute()
    except Exception as ex :
        print (ex)


#Сама авторизация
CLIENT_SECRET_FILE = 'secret_key.json'
SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)

credentials = flow.run_local_server(host='localhost',
    port=8080,
    authorization_prompt_message='Please visit this URL: {url}',
    success_message='The auth flow is complete; you may close this window.',
    open_browser=True)

#этот объект можно использовать как vk_api в прошлом примере
youtube = build('youtube', 'v3', credentials=credentials)
