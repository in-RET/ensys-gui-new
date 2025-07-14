import enum
import os

from oemof import solph
from pydantic import Field

from . import EnFlow
from ..common.basemodel import EnBaseModel
from ..common.types import OEPTypes


def get_enum_list():
    """
    Extracts and constructs an enumeration from CSV filenames present in a directory.

    This function reads a directory path from an environment variable,
    fetches all the CSV files within that directory, and creates an
    Enum object, where each item corresponds to a CSV file. The name of
    each enum item is derived from the file name (without the extension),
    and its value is the complete name of the CSV file.

    :param: None
    :raises KeyError: If the environment variable "OEP_TEMP_PATH" is not set.
    :raises TypeError: If the contents of the directory cannot be traversed.
    :raises AttributeError: If the input path is malformed or not valid.
    :return: An enumeration object with CSV file names converted to enum names and values.
    :rtype: enum.Enum
    """
    path = os.getenv("OEP_TEMP_PATH")

    (root,dirs,files) = os.walk(path)

    enum_list = []
    for file in files:
        if file.endswith(".csv"):
            enum_name = file.replace(".csv", "")
            enum_value = file
            enum_list.append((enum_name, enum_value))

    return enum.Enum("OEPTypes", enum_list)


class EnOEP(EnBaseModel):
    label: str = Field(
        title='Label',
        description='String holding the label of the OEP object. The label of each object must be unique.'
    )

    type: OEPTypes = Field(
        title='Type',
        description='String holding the type of the OEP object. The type of each object must be unique.'
    )

    data_source: str = Field(
        default="",
        title='Data Source',
        description='Element to specify the data source for the OEP object.'
    )

    inputs: dict[str, EnFlow] = Field(
        ...,
        title='Inputs',
        description='Dictionary with inflows. Keys must be the ending node(s) of the inflows(s)'
    )

    outputs: dict[str, EnFlow] = Field(
        ...,
        title='Outputs',
        description='Dictionary with outflows. Keys must be the ending node(s) of the outflow(s)'
    )

    def download_oep_data(self) -> dict[str, str]:
        oep_data_dict = {
            "label": "my first object",
            "inputs": {
                "Strombus": {
                    "variable_costs": 30.0
                }
            }
        }

        return oep_data_dict

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components:
        # erstmal müssen die Daten runtergeladen werden
        # zudem müssen die inputs und outputs gebaut werden
        # diese müssen zusammengefügt als kwargs übergeben werden

        kwargs = self.build_kwargs(energysystem)

        # Download the oep data
        oep_data = self.download_oep_data()

        return self.type.value(**kwargs)
