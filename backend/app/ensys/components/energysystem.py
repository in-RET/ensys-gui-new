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
    busses: list[EnBus] = Field(
        default=[],
        title='Busses',
        description='List of all busses.'
    )

    sinks: list[EnSink] = Field(
        default=[],
        title='Sinks',
        description='List of all sinks.'
    )

    sources: list[EnSource] = Field(
        default=[],
        title='Sources',
        description='List of all sources.'
    )

    converters: list[EnConverter] = Field(
        default=[],
        title='Converters',
        description='List of all converters.'
    )

    generic_storages: list[EnGenericStorage] = Field(
        default=[],
        title='Generic Storages',
        description='List of all generic storages.'
    )

    constraints: list[EnConstraints] = Field(
        default=[],
        title='Constraints',
        description='List of all constraints.'
    )

    def add(self, elem: EnSink | EnSource | EnBus | EnGenericStorage | EnConverter | EnConstraints):
        if type(elem) is EnSink:
            self.sinks.append(elem)
        elif type(elem) is EnSource:
            self.sources.append(elem)
        elif type(elem) is EnBus:
            self.busses.append(elem)
        elif type(elem) is EnGenericStorage:
            self.generic_storages.append(elem)
        elif type(elem) is EnConverter:
            self.converters.append(elem)
        elif type(elem) is EnConstraints:
            self.constraints.append(elem)
        else:
            raise Exception("Unknown Type given!")

    def to_oemof_energysystem(self, energysystem: solph.EnergySystem) -> solph.EnergySystem:
        for bus in self.busses:
            energysystem.add(bus.to_oemof(energysystem))

        for sink in self.sinks:
            energysystem.add(sink.to_oemof(energysystem))

        for source in self.sources:
            energysystem.add(source.to_oemof(energysystem))

        for converter in self.converters:
            energysystem.add(converter.to_oemof(energysystem))

        for generic_storage in self.generic_storages:
            energysystem.add(generic_storage.to_oemof(energysystem))

        # TODO: Adding Constraints

        return energysystem
