from oemof import solph
from pydantic import Field

from ..common.config import EnConfigContainer
from .flow import EnFlow


## Container which contains the params for an InRetEnsys-Transformer-Object
#
#   @param label: str = "Default Transformer"
#   @param inputs: Dict[str, EnFlow] = None
#   @param outputs: Dict[str, EnFlow] = None
#   @param conversion_factors: Dict = None
class EnConverter(EnConfigContainer):
    label: str = Field(
        "Default Transformer",
        title='Label',
        description='Label'
    )

    inputs: dict[str, EnFlow] = Field(
        ...,
        title='Inputs',
        description='Inputs'
    )

    outputs: dict[str, EnFlow] = Field(
        ...,
        title='Outputs',
        description='Outputs'
    )

    conversion_factors: dict = Field(
        ...,
        title='Conversion Factors',
        description='Dictionary with all conversion factors. <Bus.Label> : Float'
    )

    ##  Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.Transformer-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Transformer:
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Transformer(**kwargs)
