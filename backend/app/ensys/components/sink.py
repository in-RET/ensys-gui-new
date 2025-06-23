from oemof import solph
from pydantic import Field

from .flow import EnFlow
from ..common.basemodel import EnBaseModel


class EnSink(EnBaseModel):
    """
    Represents a sink in an energy system model.

    A sink is used to define endpoints for energy flows within the
    context of the oemof energy system framework. This class includes
    attributes for defining the sink's label and its inputs, which
    specify the inflow connections to the sink. Each sink object must
    have a unique label for identification. Inputs are represented
    as a dictionary of node-inflow mappings.

    :ivar label: A string representing the unique label of the Sink
                 object.
    :type label: str
    :ivar inputs: A dictionary mapping input nodes to their respective
                  EnFlow objects, which define the input values.
    :type inputs: dict[str, EnFlow]
    """
    label: str = Field(
        "Default Sink",
        title='Label',
        description='String holding the label of the Sink object. The label of each object must be unique.'
    )

    inputs: dict[str, EnFlow] = Field(
        ...,
        title='Inputs',
        description='A dictionary mapping input nodes to corresponding inflows (i.e. input values).'
    )

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Sink:
        """
        Converts the current energy system object to an oemof `Sink` component.

        This method transforms the energy system data into a format compatible with
        oemof.solph by constructing the necessary keyword arguments and returning an
        instance of `solph.components.Sink`.

        :param energysystem: The oemof.solph EnergySystem instance to which the data
            will be transferred.
        :type energysystem: solph.EnergySystem
        :return: An oemof.solph Sink component created using the current energy system
            parameters.
        :rtype: solph.components.Sink
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Sink(**kwargs)
