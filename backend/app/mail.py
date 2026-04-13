"""Email helpers for activation messages via EWS."""

import os

from exchangelib import HTMLBody, Account, Configuration, Credentials, Message
from jinja2 import Template

from .user.model import EnUserDB


async def send_mail(token: str, user: EnUserDB):
    """Send an activation email with a token link.

    - param token: activation token to embed in the email
    - param user: EnUserDB recipient
    - raises: IOError on missing template, Exception on bad config or send failure
    """
    exchange_user = os.getenv("EXCHANGE_USER")
    exchange_pass = os.getenv("EXCHANGE_PASS")
    exchange_server = os.getenv("EXCHANGE_SERVER")

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

    # Read email template
    template_path = os.path.join("templates", "mail", "activation.html")
    try:
        with open(template_path, "r") as f:
            template = Template(f.read())
    except IOError as e:
        raise IOError(f"Failed to read email template: {str(e)}")

    # Generate email content
    content = template.render(
        username=user.username,
        token=token,
        base_url=os.getenv("FRONTEND_URL", "http://localhost:4200"),
    )

    # Create and send email
    message = Message(
        account=account,
        subject="Account Activation - EnSys",
        body=HTMLBody(content),
        to_recipients=[user.email],
    )

    message.send()
