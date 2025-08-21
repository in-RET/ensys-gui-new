from pydantic import Field, field_validator

from .energysystem import EnEnergysystem
from ..common.basemodel import EnBaseModel
from ..common.types import Solver


class EnModel(EnBaseModel):
    """
    Represents an energy model that solves optimization problems for a given
    energy system using a specified solver.

    This class is designed to manage and execute energy model optimization tasks.
    It provides configuration options for the underlying solver, including the
    ability to enable verbose output and specify additional solver arguments.
    The focus is on integrating with a defined energy system and ensuring that
    the energy system provided is not empty or undefined.

    :ivar energysystem: The energy system that the model operates upon. This is
        a required parameter.
    :type energysystem: EnEnergysystem
    :ivar solver: The solver to use for optimization tasks. Defaults to the
        Gurobi solver.
    :type solver: Solver
    :ivar solver_verbose: Specifies whether to enable verbose output from the
        solver during runtime. Defaults to True.
    :type solver_verbose: bool
    :ivar solver_kwargs: Extra configuration arguments for the solver, such as
        gap limits or other solver-specific parameters. Defaults to None.
    :type solver_kwargs: dict[str, bool | str | int | float] | None
    """
    energysystem: EnEnergysystem = Field(
        ...,
        title='Energysystem',
        description='Energysystem to solve'
    )

    solver: Solver = Field(
        default=Solver.gurobi,
        title='Solver',
        description='Solver'
    )

    solver_verbose: bool = Field(
        default=True,
        title='Solver verbose',
        description='Print output from the Solver'
    )

    solver_kwargs: dict[str, bool | str | int | float] | None = Field(
        default=None,
        title='Solver Extra Arguments',
        description='Extra arguments for the Solver (MIP_GAP etc.)'
    )

    @classmethod
    @field_validator('energysystem')
    def es_is_not_none(cls, v):
        """
        Validates the 'energysystem' field during class instantiation to ensure it is not set to None.
        This method is called automatically by the Pydantic validator mechanism.

        :param v: The value provided for the 'energysystem' field.
        :type v: Any
        :return: The validated 'energysystem' value if it is not None.
        :rtype: Any
        :raises ValueError: If the 'energysystem' value is None.
        """
        if v is None:  # pragma: no cover
            raise ValueError("Energysystem can not be 'None'.")

        return v  # pragma: no cover
