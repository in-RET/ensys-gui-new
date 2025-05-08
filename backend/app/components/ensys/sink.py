from ..common.basemodel import EnBaseModel
from .flow import EnFlow
from oemof import solph
from pydantic import Field


## Container which contains the params for an InRetEnsys-Sink-Object
#
#   @param label: str = "Default Sink"
#   @param inputs: Dict[str, EnFlow]
class EnSink(EnBaseModel):
    label: str = Field(
        "Default Sink",
        title='Label',
        description='Label'
    )

    inputs: dict[str, EnFlow] = Field(
        ...,
        title='Inputs',
        description='Inputs'
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.Sink-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Sink:
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Sink(**kwargs)
