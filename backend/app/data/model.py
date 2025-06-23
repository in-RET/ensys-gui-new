from typing import Any

from pydantic import BaseModel


class GeneralDataModel(BaseModel):
    """
    GeneralDataModel is a data model class that represents a generic data structure
    with a list of items and their total count.

    This class is designed for use cases where a representation of a collection
    of items alongside a count of those items is needed. It can serve as a base
    structure for applications working with paginated datasets, collections, or
    other similar utilities.

    :ivar items: A list of items representing the data collection.
    :type items: list[Any]
    :ivar totalCount: The total number of items in the collection.
    :type totalCount: int
    """
    items: list[Any]
    totalCount: int
