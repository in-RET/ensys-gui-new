from typing import List, Union

from backend.app.components.common.config import EnConfigContainer
from .bus import EnBus
from .constraints import EnConstraints
from .genericstorage import EnStorage
from .sink import EnSink
from .source import EnSource
from .converter import EnConverter
from backend.app.components.common.types import Frequencies
from pydantic import Field


##  Container which contains the params for an InRetEnergysystem
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
class EnEnergysystem(EnConfigContainer):
    busses: List[EnBus] = Field(
        [],
        title='Busses',
        description='List of all busses.'
    )

    sinks: List[EnSink] = Field(
        [],
        title='Sinks',
        description='List of all sinks.'
    )

    sources: List[EnSource] = Field(
        [],
        title='Sources',
        description='List of all Sources.'
    )

    transformers: List[EnConverter] = Field(
        [],
        title='Transformers',
        description='List of all transformers.'
    )

    storages: List[EnStorage] = Field(
        [],
        title='Storages',
        description='List of all storages.'
    )

    constraints: List[EnConstraints] = Field(
        [],
        title='Constraints',
        description='List of all constraints.'
    )

    frequenz: Frequencies = Field(
        Frequencies.hourly,
        title='Frequency',
        description='Frequency of the timesteps'
    )

    start_date: str = Field(
        title='Start Date',
        description=''
    )

    time_steps: int = Field(
        title='Time Steps',
        description='Number of timesteps from Startdate'
    )

    def add(self, elem: Union[EnSink, EnSource, EnBus, EnStorage, EnConverter, EnConstraints]):
        if type(elem) is EnSink:
            self.sinks.append(elem)
        elif type(elem) is EnSource:
            self.sources.append(elem)
        elif type(elem) is EnBus:
            self.busses.append(elem)
        elif type(elem) is EnStorage:
            self.storages.append(elem)
        elif type(elem) is EnConverter:
            self.transformers.append(elem)
        elif type(elem) is EnConstraints:
            self.constraints.append(elem)
        else:
            raise Exception("Unknown Type given!")
