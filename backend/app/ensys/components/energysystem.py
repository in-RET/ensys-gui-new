from typing import Literal

from oemof import solph
from pydantic import Field

from .bus import EnBus
from .constraints import EnConstraints
from .converter import EnConverter
from .genericstorage import EnGenericStorage, OepGenericStorage
from .sink import EnSink
from .source import EnSource
from ..common.basemodel import EnBaseModel


class EnEnergysystem(EnBaseModel):
    """
    Represents an energy system consisting of various components including busses,
    sinks, sources, converters, generic storages, and constraints.

    This class serves as a model for energy systems where components can be added
    and managed. It provides methods to organize these components and convert them
    into a format suitable for oemof energy systems, enabling seamless integration
    with oemof's modeling and analysis tools.

    :ivar busses: List of all busses in the energy system.
    :type busses: list[EnBus]
    :ivar sinks: List of all sinks in the energy system.
    :type sinks: list[EnSink]
    :ivar sources: List of all sources in the energy system.
    :type sources: list[EnSource]
    :ivar converters: List of all converters in the energy system.
    :type converters: list[EnConverter]
    :ivar generic_storages: List of all generic storages in the energy system.
    :type generic_storages: list[EnGenericStorage]
    :ivar constraints: List of all constraints associated with the energy system.
    :type constraints: list[EnConstraints]
    """
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
        """
        Adds an element to the corresponding list based on its type. Determines
        the type of the given element and appends it to its respective
        container (e.g., sinks, sources, busses, etc.). Raises an exception
        if the type of the element is not recognized.

        :param elem: The element to be added. It should be one of the following
                     types: EnSink, EnSource, EnBus, EnGenericStorage,
                     EnConverter, or EnConstraints.
        :type elem: EnSink | EnSource | EnBus | EnGenericStorage | EnConverter | EnConstraints
        :return: None
        """
        if type(elem) is EnSink:
            self.sinks.append(elem)
        elif type(elem) is EnSource:
            self.sources.append(elem)
        elif type(elem) is EnBus:
            self.busses.append(elem)
        elif type(elem) in [EnGenericStorage, OepGenericStorage]:
            self.generic_storages.append(elem)
        elif type(elem) is EnConverter:
            self.converters.append(elem)
        elif type(elem) is EnConstraints:
            self.constraints.append(elem)
        else:
            raise Exception("Unknown Type given!")

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.EnergySystem:
        """
        Converts the internal energy system components to an oemof energy system and adds
        them to the provided oemof energy system instance. Each component in the internal
        energy system is iterated through, converted to its corresponding oemof object,
        and subsequently added to the provided energy system. This includes busses, sinks,
        sources, converters, and generic storages.

        :param energysystem: The oemof energy system instance to which the converted components
            of the internal energy system are added.
        :return: An updated oemof energy system instance containing all converted components.
        :rtype: solph.EnergySystem
        """
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
