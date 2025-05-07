from typing import List

from .bus import EnBus
from .constraints import EnConstraints
from .converter import EnConverter
from .genericstorage import EnStorage
from .sink import EnSink
from .source import EnSource
from ..common.config import EnConfigContainer


## Container which contains the params for an EnEnergysystem
#
#   @param component
class EnEnergysystem(EnConfigContainer):
    components: List[EnBus | EnSink | EnSource | EnConverter | EnStorage | EnConstraints]
