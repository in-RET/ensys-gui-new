import os

from oep_client import OepClient


def get_oep_client():
    """
    Provides a generator function to yield an instance of the OepClient class.

    This function accesses environment variables to retrieve the necessary
    credentials and configurations required for creating an OepClient instance.
    It uses `os.getenv` to get the `OEP_TOKEN` and `OEP_TOPIC` values for
    authentication and topic management, respectively. The OepClient instance is
    yielded, allowing the caller to manage resources appropriately.

    :return:
        OepClient: A generator that yields an instance of the OepClient class
        configured with a token and a default schema retrieved from the
        environment variables.
    :rtype: OepClient
    """
    yield OepClient(
        token=os.getenv("OEP_TOKEN"),
        default_schema=os.getenv("OEP_TOPIC")
    )
