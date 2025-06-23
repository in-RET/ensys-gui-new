from oemof import solph
from pydantic import Field

from ..common.basemodel import EnBaseModel


class EnBus(EnBaseModel):
    """
    Represents a bus in an energy system model.

    This class is used to define a bus element, which is a central node in an energy
    system. The bus connects different components such as sources, demands, and
    transformers and facilitates the movement of energy between them. It also checks for
    balance in energy inflows and outflows at every timestep.

    :ivar label: String holding the label of the Bus object. The label of each object must
        be unique.
    :type label: str
    :ivar balanced: Indicates if the bus is balanced, i.e., if the sum of inflows equals
        the sum of outflows for each timestep; defaults to True.
    :type balanced: bool
    """
    label: str = Field(
        title='Label',
        description='String holding the label of the Bus object. The label of each object must be unique.'
    )

    balanced: bool = Field(
        True,
        title='Balanced',
        description=' Indicates if bus is balanced, i.e. if the sum of inflows equals to the sum of outflows for each timestep; defaults to True'
    )

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Bus:
        """
        Converts the current instance into an oemof.solph.Bus object using the
        provided energy system. This method prepares necessary keyword arguments
        from the energy system to initialize and return a solph.Bus instance.

        :param energysystem: An instance of solph.EnergySystem used to build
            keyword arguments for the solph.Bus.
        :type energysystem: solph.EnergySystem
        :return: A solph.Bus object initialized with the built keyword arguments.
        :rtype: solph.Bus
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.Bus(**kwargs)
