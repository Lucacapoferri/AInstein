import imaplib
import email
from email.header import decode_header
from dotenv import load_dotenv
import os

load_dotenv()

mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(os.getenv("EMAIL"), os.getenv("PASSWORD"))
mail.select("inbox")

# Step 2: Search and fetch all message IDs
_, data = mail.search(None, 'OR SUBJECT "Re:" SUBJECT "R:"')
ids = data[0].split()[-5:]

messages = {}   
threads = {}

def clean_subject(subject_raw):
    subject, encoding = decode_header(subject_raw)[0]
    if isinstance(subject, bytes):
        return subject.decode(encoding or "utf-8")
    return subject

for eid in ids:
    res, msg_data = mail.fetch(eid, "(RFC822)")
    msg = email.message_from_bytes(msg_data[0][1])
    subject = clean_subject(msg["Subject"])
    print("Subject:", subject)
    print("From:", msg["From"])
    print("-" * 30)