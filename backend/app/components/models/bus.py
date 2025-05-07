from backend.app.components.common.config import EnConfigContainer
from oemof import solph
from pydantic import Field


## Container which contains the params for an oemof-Bus
#
#   @param label The Label of the Bus, must be named for further references in flows.
#   @param balanced If 'True' the input is equal the output of the bus.
class EnBus(EnConfigContainer):
    label: str = Field(
        title='Label',
        description='Name of the Bus'
    )

    balanced: bool = Field(
        True,
        title='balanced',
        description='If Balanced, then Input == Output'
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return Solph.Bus-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Bus:
        kwargs = self.build_kwargs(energysystem)

        return solph.Bus(**kwargs)
