from oemof import solph
from pydantic import Field

from .flow import EnFlow
from ..common.basemodel import EnBaseModel


class EnSource(EnBaseModel):
    """
    Represents an energy source model within the system.

    This class is used to define a source object with unique attributes such as
    a label and outputs. It is part of a model system and can interface with
    external libraries to represent energy system components.

    :ivar label: A string holding the label of the Source object. The label of
        each object must be unique to ensure proper identification.
    :type label: str
    :ivar outputs: A dictionary mapping input nodes to their corresponding outflows
        (i.e., output values) within the system.
    :type outputs: dict[str, EnFlow]
    """
    label: str = Field(
        "Default Source",
        title='Label',
        description='String holding the label of the Source object. The label of each object must be unique.'
    )

    outputs: dict[str, EnFlow] = Field(
        ...,
        title='Outputs',
        description='A dictionary mapping input nodes to corresponding outflows (i.e. output values).'
    )

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Source:
        """
        Builds and returns an oemof.solph Source component from the specified energy system.

        This method constructs necessary keyword arguments for creating an
        oemof.solph Source component using the provided energy system. It utilizes
        the `build_kwargs` method to generate the required arguments, and then creates
        and returns the corresponding Source component.

        :param energysystem: Energy system for which the oemof.solph Source component
            is to be built.
        :type energysystem: solph.EnergySystem
        :return: An instance of solph.components.Source created based on the provided
            energy system.
        :rtype: solph.components.Source
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Source(**kwargs)
