import os

from exchangelib import HTMLBody, Account, Configuration, EWSTimeZone, Credentials, Message
from jinja2 import Template

from .user.model import EnUserDB


async def send_mail(token: str, user: EnUserDB):
    with open(os.path.abspath(os.path.join(os.getcwd(), "templates", "activation_mail.html"))) as f:
        mail_template = Template(f.read())

    mail_body = HTMLBody(mail_template.render(
        name=user.username,
        link=f"https://ensys.hs-nordhausen.de/api/user/auth/activate/{token}"
    ))

    tz = EWSTimeZone("Europe/Copenhagen")
    cred = Credentials(
        username=os.getenv("EMAIL_HOST_USER"),
        password=os.getenv("EMAIL_HOST_PASSWORD")
    )
    config = Configuration(server=os.getenv("EMAIL_HOST_IP"), credentials=cred)

    account = Account(
        primary_smtp_address=os.getenv("EMAIL_SENDER"),
        credentials=cred,
        autodiscover=False,
        default_timezone=tz,
        config=config,
    )

    msg = Message(
        account=account,
        subject="Activate your account.",
        body=mail_body,
        to_recipients=[str(user.mail)],
    )

    msg.send_and_save()

    return 1
