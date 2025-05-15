from oemof import solph
from pydantic import Field

from .flow import EnFlow
from ..common.basemodel import EnBaseModel


## Container which contains the params for an EnSys-Transformer-Object
#
#   @param label: str = "Default Transformer"
#   @param inputs: Dict[str, EnFlow] = None
#   @param outputs: Dict[str, EnFlow] = None
#   @param conversion_factors: Dict = None
class EnConverter(EnBaseModel):
    label: str = Field(
        "Default Converter",
        title='Label',
        description='String holding the label of the Converter object. The label of each object must be unique.'
    )

    inputs: dict[str, EnFlow] = Field(
        ...,
        title='Inputs',
        description='Dictionary with inflows. Keys must be the starting node(s) of the inflow(s)'
    )

    outputs: dict[str, EnFlow] = Field(
        ...,
        title='Outputs',
        description='Dictionary with outflows. Keys must be the ending node(s) of the outflow(s)'
    )

    conversion_factors: dict[str, float | list[float]] = Field(
        ...,
        title='Conversion Factors',
        description='Dictionary containing conversion factors for conversion of each flow. Keys must be the connected nodes (typically Buses). The dictionary values can either be a scalar or an iterable with individual conversion factors for each time step. Default: 1. If no conversion_factor is given for an in- or outflow, the conversion_factor is set to 1'
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builds a dictionary with all keywords given by the object
    #   and returns the oemof object initialized with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e., for flows.
    #   @return solph.Transformer-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Converter:
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Converter(**kwargs)
