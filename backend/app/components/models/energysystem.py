from typing import List, Union

from pydantic import BaseModel, Field

from .bus import EnBus
from .constraints import EnConstraints
from .converter import EnConverter
from .genericstorage import EnGenericStorage
from .sink import EnSink
from .source import EnSource
from ..common.config import EnConfigContainer
from ..common.types import Frequencies


## Container which contains the params for an ApiEnergysystem
#
#   @param component
class ApiEnergysystem(BaseModel):
    constraints: List[EnConstraints] = Field(
        [],
        title='Constraints',
        description='List of all constraints.'
    )
    components: List[EnBus | EnSink | EnSource | EnConverter | EnGenericStorage] = Field(
        ...,
        title='Components',
        description='List of all components.'
    )

    # TODO: Fix the class to get the "InRetEnsysEnergysystem" back to work with
    def to_EnEnergysystem(self):

        for component in self.components:
            print(component)

            if component["oemof_type"] == "Bus":
                pass
            elif component["oemof_type"] == "Sink":
                pass
            elif component["oemof_type"] == "Source":
                pass
            elif component["oemof_type"] == "Converter":
                pass
            elif component["oemof_type"] == "GenericStorage":
                pass
            else:
                raise Exception("Unknown Type given!")

        for constraint in self.constraints:
            print(constraint)


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

    storages: List[EnGenericStorage] = Field(
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

    def add(self, elem: Union[EnSink, EnSource, EnBus, EnGenericStorage, EnConverter, EnConstraints]):
        if type(elem) is EnSink:
            self.sinks.append(elem)
        elif type(elem) is EnSource:
            self.sources.append(elem)
        elif type(elem) is EnBus:
            self.busses.append(elem)
        elif type(elem) is EnGenericStorage:
            self.storages.append(elem)
        elif type(elem) is EnConverter:
            self.transformers.append(elem)
        elif type(elem) is EnConstraints:
            self.constraints.append(elem)
        else:
            raise Exception("Unknown Type given!")
