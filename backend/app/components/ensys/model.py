from typing import Union

from .energysystem import EnEnergysystem
from ..common.basemodel import EnBaseModel
from ..common.types import Solver
from pydantic import Field, field_validator


## Container which contains the params for an InRetEnsys-Model
#
#   @param energysystem The Energysystem which should be optimized.
#   @param solver The Solvername for the optimization.
#   @param solver_verbose Set true if the solver should print his output and steps.
class EnModel(EnBaseModel):
    energysystem: EnEnergysystem = Field(
        ...,
        title='Energysystem',
        description='Energysystem to solve'
    )

    solver: Solver = Field(
        Solver.gurobi,
        title='Solver',
        description='Solver'
    )

    solver_verbose: bool = Field(
        True,
        title='Solver verbose',
        description='Print output from the Solver'
    )

    solver_kwargs: Union[dict[str, Union[bool, str, int, float]], None] = Field(
        None,
        title='Solver Extra Arguments',
        description='Extra arguments for the Solver (MIP_GAP etc.)'
    )

    @classmethod
    @field_validator('energysystem')
    def es_is_not_none(cls, v):
        if v is None: # pragma: no cover
            raise ValueError("Energysystem can not be 'None'.")

        return v # pragma: no cover
