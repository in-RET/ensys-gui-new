"""Email helpers for activation messages via EWS."""

import os

from exchangelib import HTMLBody, Account, Configuration, Credentials, Message
from jinja2 import Template

from .user.model import EnUserDB


def get_mail_account():
    exchange_user = os.getenv("EMAIL_HOST_USER")
    exchange_pass = os.getenv("EMAIL_HOST_PASSWORD")
    exchange_server = os.getenv("EMAIL_HOST_IP")

    if not all([exchange_user, exchange_pass, exchange_server]):
        raise Exception("Email configuration is incomplete")

    credentials = Credentials(exchange_user, exchange_pass)
    config = Configuration(server=exchange_server, credentials=credentials)

    account = Account(
        primary_smtp_address=exchange_user,
        config=config,
        autodiscover=False,
        access_type="delegate",
    )
    return account


def send_activation_mail(token: str, user: EnUserDB):
    """Send an activation email with a token link.

    - param token: activation token to embed in the email
    - param user: EnUserDB recipient
    - raises: IOError on missing template, Exception on bad config or send failure
    """

    # Read email template
    template_path = os.path.join("templates", "mail", "activation_mail.html")
    try:
        with open(template_path, "r") as f:
            template = Template(f.read())
    except IOError as e:
        raise IOError(f"Failed to read email template: {str(e)}")

    # Generate email content
    content = template.render(
        username=user.username,
        token=token
    )

    # Create and send email
    message = Message(
        account=get_mail_account(),
        subject="Account Activation - EnSys",
        body=HTMLBody(content),
        to_recipients=[user.mail],
    )

    message.send()



def send_reset_mail(user: EnUserDB, password: str):
    """Send a reset email.

    - param token: activation token to embed in the email
    - param user: EnUserDB recipient
    - raises: IOError on missing template, Exception on bad config or send failure
    """
    # Read email template
    template_path = os.path.join("templates", "mail", "reset_mail.html")
    try:
        with open(template_path, "r") as f:
            template = Template(f.read())
    except IOError as e:
        raise IOError(f"Failed to read email template: {str(e)}")

    # Generate email content
    content = template.render(
        name=user.username,
        new_password=password,
    )

    # Create and send email
    message = Message(
        account=get_mail_account(),
        subject="Account Password Reset - EnSys",
        body=HTMLBody(content),
        to_recipients=[user.mail],
    )

    message.send()
