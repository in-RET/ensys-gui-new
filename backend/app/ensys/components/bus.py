from ..common.basemodel import EnBaseModel
from oemof import solph
from pydantic import Field


## Container, which contains the params for an oemof-Bus
#
#   @param label The Label of the Bus, must be named for further references in flows.
#   @param balanced If 'True' the input is equal to the output of the bus.
class EnBus(EnBaseModel):
    label: str = Field(
        title='Label',
        description='String holding the label of the Bus object. The label of each object must be unique.'
    )

    balanced: bool = Field(
        True,
        title='Balanced',
        description=' Indicates if bus is balanced, i.e. if the sum of inflows equals to the sum of outflows for each timestep; defaults to True'
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects, i.e., for flows.
    #   @return Solph.Bus-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Bus:
        kwargs = self.build_kwargs(energysystem)

        return solph.Bus(**kwargs)
