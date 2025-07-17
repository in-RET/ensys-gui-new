from oemof import solph
from pydantic import Field

from .flow import EnFlow, OepFlow
from ..common.basemodel import EnBaseModel


class EnConverter(EnBaseModel):
    """
    Represents a converter class for modeling energy systems.

    This class is designed to manage conversion processes between inputs and
    outputs in an energy system model. It allows defining inflows and outflows
    with specific conversion factors and integrates with `oemof` to build
    compatible energy system components. The `label` attribute ensures that each
    converter has a unique, identifiable name in the system.

    :ivar label: A unique label identifying the converter.
    :type label: str
    :ivar inputs: Dictionary of inflows with their starting nodes.
    :type inputs: dict[str, EnFlow]
    :ivar outputs: Dictionary of outflows with their ending nodes.
    :type outputs: dict[str, EnFlow]
    :ivar conversion_factors: Dictionary of conversion factors, where each key
        corresponds to connected nodes and values can be a scalar or a list of
        conversion factors for time-dependent variations. If unspecified, defaults
        to 1 for all flows.
    :type conversion_factors: dict[str, float | list[float]]
    """
    label: str = Field(
        "Default Converter",
        title='Label',
        description='String holding the label of the Converter object. The label of each object must be unique.'
    )

    inputs: dict[str, EnFlow | OepFlow] = Field(
        ...,
        title='Inputs',
        description='Dictionary with inflows. Keys must be the starting node(s) of the inflow(s)'
    )

    outputs: dict[str, EnFlow | OepFlow] = Field(
        ...,
        title='Outputs',
        description='Dictionary with outflows. Keys must be the ending node(s) of the outflow(s)'
    )

    conversion_factors: dict[str, float | list[float]] = Field(
        ...,
        title='Conversion Factors',
        description='Dictionary containing conversion factors for conversion of each flow. Keys must be the connected nodes (typically Buses). The dictionary values can either be a scalar or an iterable with individual conversion factors for each time step. Default: 1. If no conversion_factor is given for an in- or outflow, the conversion_factor is set to 1'
    )

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.Converter:
        """
        Converts the current instance into an oemof.solph Converter object and integrates
        it into the provided oemof EnergySystem. This method prepares and builds the
        necessary keyword arguments from the instance's state and passes them into
        the Converter component.

        :param energysystem: An oemof.solph EnergySystem instance that serves as a
            container storing energy models, components, and their relations.
        :type energysystem: solph.EnergySystem
        :return: An oemof.solph.Converter instance initialized and built using the
            processed arguments from this instance's data.
        :rtype: solph.components.Converter
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.components.Converter(**kwargs)
