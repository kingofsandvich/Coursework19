from google_auth_oauthlib.flow import InstalledAppFlow

CLIENT_SECRET_FILE = 'secret_key.json'
SCOPES = ['https://mail.google.com/']
flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)

credentials = flow.run_local_server(host='localhost',
    port=8080,
    authorization_prompt_message='Please visit this URL: {url}',
    success_message='The auth flow is complete; you may close this window.',
    open_browser=True)

from apiclient.discovery import build
import base64
from email.mime.text import MIMEText
from email.mime.audio import MIMEAudio
from email.mime.image import MIMEImage
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
import mimetypes
from datetime import datetime
from datetime import timedelta

gmail = build('gmail', 'v1', credentials = credentials)

def get_address (gmail) :
    response = gmail.users().getProfile(userId = 'me').execute()
    return response['emailAddress']

def create_message(sender, to, subject, message_text):
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes())
    raw = raw.decode()
    return {'raw': raw}

def create_message_with_attachment(sender, to, subject, message_text, file):
    message = MIMEMultipart()
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject

    msg = MIMEText(message_text)
    message.attach(msg)

    content_type, encoding = mimetypes.guess_type(file)

    if content_type is None or encoding is not None:
        content_type = 'application/octet-stream'
    main_type, sub_type = content_type.split('/', 1)
    if main_type == 'text':
        fp = open(file, 'rb')
        msg = MIMEText(fp.read(), _subtype=sub_type)
        fp.close()
    elif main_type == 'image':
        fp = open(file, 'rb')
        msg = MIMEImage(fp.read(), _subtype=sub_type)
        fp.close()
    elif main_type == 'audio':
        fp = open(file, 'rb')
        msg = MIMEAudio(fp.read(), _subtype=sub_type)
        fp.close()
    else:
        fp = open(file, 'rb')
        msg = MIMEBase(main_type, sub_type)
        msg.set_payload(fp.read())
        fp.close()
    filename = os.path.basename(file)
    msg.add_header('Content-Disposition', 'attachment', filename=filename)
    message.attach(msg)
    raw = base64.urlsafe_b64encode(message.as_bytes())
    raw = raw.decode()
    return {'raw': raw}

def send_message(gmail, message):
    try:
        message = (gmail.users().messages().send(userId = 'me', body = message)
            .execute())
        print('Message Id: %s' % message['id'])
    except Exception as ex:
        print('hey')
        print('An error occurred: %s' % ex)

def get_messages_ids(gmail, spamOn) :
    time = (datetime.now() - timedelta(days=7))
    messages_all = []
    print(time)
    j = 0
    nextpgtoken = None
    while True :
        subres = gmail.users().messages().list(userId = 'me', pageToken = nextpgtoken, maxResults = 500, includeSpamTrash = spamOn).execute()
        messages_all+=subres['messages']
        try :
            nextpgtoken = subres.get('nextPageToken')
        except :
            break
        if nextpgtoken is None :
            break
        j+=1

    return messages_all

def get_messages (gmail, from_time, to_time, ids) :
    all_messages = []
    lastmsg = gmail.users().messages().get(userId = 'me', id = ids[len(ids) - 1]['id']).execute()
    if int(lastmsg['internalDate']) / 1000 > to_time :
        print(int(lastmsg['internalDate'])) / 1000
        return all_messages
    for id_ in ids :
        msg = gmail.users().messages().get(userId = 'me', id = id_['id']).execute()
        if int(msg['internalDate']) / 1000 < to_time and int(msg['internalDate']) / 1000 > from_time :
            subject = ""
            print(msg)
            for head in msg['payload']['headers'] :
                if head['name'] == 'Subject' :
                    subject = head['value']
            all_messages.append([msg['snippet'], msg['internalDate'], subject])
        elif int(msg['internalDate']) / 1000 <= from_time :
            break
    return all_messages

#наш адрес
address = get_address(gmail)
#создаем сообщение: от адреса, на адрес legomike, тема - test2, текст - дратути
message = create_message(address, 'legomike@mail.ru', 'test2', 'dratuti!')
#отправляем
send_message(gmail, message)


#получаем все айдишники наших писем
res1 = get_messages_ids(gmail, False)
#получаем текста писем темы и время по заданному отрезку времени
res2 = get_messages(gmail, 1557017743, 1557449743, res1)
