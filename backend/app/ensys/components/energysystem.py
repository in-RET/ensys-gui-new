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
        [],
        title='Components',
        description='List of all components.'
    )

    constraints: list[EnConstraints] = Field(
        [],
        title='Constraints',
        description='List of all constraints.'
    )

    interval: Interval = Field(
        Interval.hourly,
        title='Interval',
        description='The time interval in hours e.g. 0.5 for 30min or 2 for a two hour interval (default: 1).'
    )

    simulation_year: datetime.date.year = Field(
        ...,
        title='Simulation year',
        description='The year of the index. If number and start is set the year parameter is ignored.'
    )

    start_date: datetime.date | None = Field(
        None,
        title='Start Date',
        description='Optional start time. If start is not set, 00:00 of the first day of the given year is the start time.'
    )

    time_steps: int | None = Field(
        None,
        title='Time Steps',
        description='The number of time intervals. By default number is calculated to create an index of one year. For a shorter or longer period the number of intervals can be set by the user.'
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
