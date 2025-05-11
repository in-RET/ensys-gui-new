from ..common.basemodel import EnBaseModel
from .flow import EnFlow
from oemof import solph
from pydantic import Field


## Container which contains the params for an InRetEnsys-Source-Object
#
#   @param label: str = "Default Sink"
#   @param outputs: Dict[str, EnFlow]
class EnSource(EnBaseModel):
    label: str = Field(
        "Default Source",
        title='Label',
        description='Label'
    )

    outputs: dict[str, EnFlow] = Field(
        ...,
        title='Outputs',
        description='Outputs'
    )

    ##  Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.Source-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Source:
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Source(**kwargs)
