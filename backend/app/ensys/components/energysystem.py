import datetime

from pydantic import Field
from oemof import solph

from .bus import EnBus
from .constraints import EnConstraints
from .converter import EnConverter
from .genericstorage import EnGenericStorage
from .sink import EnSink
from .source import EnSource
from ..common.basemodel import EnBaseModel
from ..common.types import Interval


## Container which contains the params for an EnEnergysystem
#
#   @param busses
#   @param sinks
#   @param sources
#   @param transformers
#   @param storages
#   @param constraints
#   @param frequenz
#   @param start_date
#   @param time_steps
class EnEnergysystem(EnBaseModel):
    components: list[EnBus | EnSink | EnSource | EnConverter] = Field(
        default=[],
        title='Components',
        description='List of all components.'
    )

    constraints: list[EnConstraints] = Field(
        default=[],
        title='Constraints',
        description='List of all constraints.'
    )

    def add(self, elem: EnSink | EnSource | EnBus | EnGenericStorage | EnConverter | EnConstraints):
        if type(elem) is EnSink | EnSource | EnBus | EnGenericStorage | EnConverter:
            self.components.append(elem)
        elif type(elem) is EnConstraints:
            self.constraints.append(elem)
        else:
            raise Exception("Unknown Type given!")

    def to_oemof_energysystem(self, energysystem: solph.EnergySystem) -> solph.EnergySystem:
        for component in self.components:
            energysystem.add(component.to_oemof(energysystem))

        # TODO: Adding Constraints

        return energysystem
