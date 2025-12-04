"""
Email Module
-----------

This module provides email functionality for the EnSys application.
It handles email notifications and templating.

:module: mail
"""

import os

from exchangelib import HTMLBody, Account, Configuration, Credentials, Message
from jinja2 import Template

from .user.model import EnUserDB


async def send_mail(token: str, user: EnUserDB):
    """
    Send an account activation email to a newly registered user.

    This function generates and sends an HTML email containing an activation link
    to the user's registered email address. It uses Exchange Web Services (EWS)
    for email delivery.

    :param token: The authentication token for account activation
    :type token: str
    :param user: The user database object containing recipient information
    :type user: EnUserDB
    :raises IOError: If the email template file cannot be read
    :raises Exception: If email configuration is invalid or sending fails
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
