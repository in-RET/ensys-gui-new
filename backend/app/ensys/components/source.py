from ..common.basemodel import EnBaseModel
from .flow import EnFlow
from oemof import solph
from pydantic import Field


## Container which contains the params for an EnSys-Source-Object
#
#   @param label: str = "Default Sink"
#   @param outputs: Dict[str, EnFlow]
class EnSource(EnBaseModel):
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

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builds a dictionary with all keywords given by the object
    #   and returns the oemof object initialized with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects, i.e., for flows.
    #   @return solph.Source-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Source:
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Source(**kwargs)
