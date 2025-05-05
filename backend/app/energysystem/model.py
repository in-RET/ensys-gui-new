from pydantic import BaseModel

from ..component.model import EnComponent
from ..constraint.model import EnConstraint
from ..flow.model import EnFlow


class EnEnergysystem(BaseModel):
    scenario_id: int
    constraints: list[EnConstraint] | None = None
    components: list[EnComponent] | None = None
    inputs: list[EnFlow] | None = None
    outputs: list[EnFlow] | None = None



