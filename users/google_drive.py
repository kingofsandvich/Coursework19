from google_auth_oauthlib.flow import InstalledAppFlow
from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import io
from googleapiclient.http import MediaIoBaseDownload
from apiclient.http import MediaFileUpload, MediaIoBaseDownload
from mimetypes import MimeTypes
import urllib
import magic
from IPython.display import Image
from IPython.core.display import HTML

def create_drive():
    CLIENT_SECRET_FILE = 'secret_key.json'
    SCOPES = ['https://www.googleapis.com/auth/drive']
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
    i = 8080

    while True:
        try:
            credentials = flow.run_local_server(host='localhost',
                port=i,
                authorization_prompt_message='Please visit this URL: {url}',
                success_message='The auth flow is complete; you may close this window.',
                open_browser=True)
            """это нужно отправлять в методы как параметр service"""
            drive = build('drive', 'v3', credentials=credentials)
            break
        except Exception as e:
            i += 1

    return drive

def download(service, filepath, fileId) :
    try :
        request = service.files().get_media(fileId=fileId)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            print ("Download %d%%." % int(status.progress() * 100))

        with io.open(filepath,'wb') as f :
            fh.seek(0)
            f.write(fh.read())
    except Exception as ex :
        print("error")

def createFolder(service, name):
    file_metadata = {
    'name': name,
    'mimeType': 'application/vnd.google-apps.folder'
    }
    file = drive_service.files().create(body=file_metadata,
                                        fields='id').execute()
    print ('Folder ID: %s' % file.get('id'))

def searchFile(service, size, query):
    results = service.files().list(pageSize=size,
                                   fields="nextPageToken, files(id, name, kind, mimeType)",q=query).execute()
    items = results.get('files', [])
    return items

def searchFileAllByName(service, name_part) :
    page_token = None
    files = []
    query = "name contains '" + name_part + "'"
    while True:
        response = service.files().list(q=query,
                                        spaces='drive',
                                        fields='nextPageToken, files(id, name)',
                                        pageToken=page_token).execute()
        files.append(response.get('files', []))
        page_token = response.get('nextPageToken', None)
        if page_token is None:
            break
    files_res = []
    for file in files[0] :
            res = drive.files().get(fileId=file['id'],
                                    fields='id, name, modifiedTime, thumbnailLink, owners(displayName)').execute()
            files_res.append(res)
    return files_res

def uploadFile(service, filename, filepath):
    try :
        mime = magic.Magic(mime=True)
        mimetype = mime.from_file(filepath)
        if mimetype == None :
            mimetype = 'text/plain'
        file_metadata = {'name': filename}
        media = MediaFileUpload(filepath,
                                mimetype=mimetype)
        file = service.files().create(body=file_metadata,
                                      media_body=media,
                                      fields='id').execute()
        print('File ID: %s' % file.get('id'))
    except Exception as ex :
        print("error")

"""res = searchFileAllByName(drive, "jpg") - ищет файлы содержащие jpg в имени (работает не оч)
   searchFile(drive, 50, "name contains 'jpg'") - здесь мы отправляем запрос на первые 50 файлов, инструкция
   "name contains 'jpg'" означает поиск файлов с jpg в названии
   uploadFile(drive, "test_api", "c:\\Users\\Michael\\Desktop\\gDrive\\pepega2.jpeg") - загружаем файл в
   google drive под названием test_api, берем файл по вот этому длинному пути"""
