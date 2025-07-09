import json

from sqlmodel import select
from starlette import status

from .model import EnScenarioDB
from ..security import decode_token
from ..user.model import EnUserDB


def validate_scenario_owner(scenario_id, db, token) -> (bool, int, str):
    """
    Validates whether the owner of a given scenario matches the user from the provided
    authentication token. This function ensures that the logged-in user has the
    authorization to access or modify the scenario.

    :param scenario_id: ID of the scenario to validate ownership for.
    :type scenario_id: Int
    :param db: Database session for executing queries and retrieving data. Dependency injection.
    :type db: Session
    :param token: Authentication token representing the logged-in user.
    :type token: Str
    :return: A tuple containing three values:
             - A boolean indicating whether the user is the owner of the scenario.
             - An HTTP status code indicating the result of the validation.
             - A string message explaining the result (empty string if validation
               is successful).
    :rtype: Tuple(bool, int, str)
    """
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()
    if not user:
        return False, status.HTTP_404_NOT_FOUND, "User not found."

    scenario = db.get(EnScenarioDB, scenario_id)

    if scenario.user_id == user.id:
        return True, status.HTTP_200_OK, ""
    else:
        return False, status.HTTP_401_UNAUTHORIZED, "User not authorized."

def transform_flowchart_data_to_energysystem(flowchart_data: json):
    pass