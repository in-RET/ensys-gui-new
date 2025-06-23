from pydantic import Field

from ..common.basemodel import EnBaseModel
from ..common.types import Constraints


class EnConstraints(EnBaseModel):
    """
    Represents constraint definitions used for various optimization models.

    The `EnConstraints` class is used for defining constraints within an optimization
    framework. It allows the user to configure various parameters of the constraint, such as
    the variables involved, proportional factors, limits, and weights. Additionally, the
    class provides functionality to parse its data into a format suited for downstream
    usage.

    :ivar typ: Type of the Constraints, all possible types are given in the Enum types.Constraints
    :ivar var1: First variable, to be set to equal with Var2 and multiplied with factor1.
    :ivar var2: Second variable, to be set equal to (Var1 * factor1).
    :ivar factor1: Factor to define the proportion between the variables.
    :ivar name: Optional name for the equation e.g. in the LP file. By default the name is: equate + string representation of var1 and var2.
    :ivar keyword: Keyword to consider (searches all NonConvexFlows).
    :ivar quantity: Shared Pyomo variable for all components of a type.
    :ivar limit_name: Name of the constraint to create.
    :ivar components: List of components from the same type.
    :ivar weights: It has to have the same length as the list of components
    :ivar limit: Absolute limit of keyword attribute for the energy system.
    :ivar flows: List or dictionary that describes flows relevant to the constraint.
    :ivar constraint_name: Name assigned to the constraint.
    :ivar upper_limit: Maximum number of active flows in the list
    :ivar lower_limit: Minimum number of active flows in the list
    """
    typ: Constraints | None = Field(
        None,
        title='Typ',
        description='Type of the constraint.'
    )

    var1: object | None = Field(
        None,
        title='var1',
        description='First variable, to be set to equal with Var2 and multiplied with factor1.'
    )

    var2: object | None = Field(
        None,
        title='var2',
        description='Second variable, to be set equal to (Var1 * factor1).'
    )

    factor1: float | None = Field(
        None,
        title='factor1',
        description='Factor to define the proportion between the variables.',
    )

    name: str | None = Field(
        None,
        title='Name',
        description='Optional name'
    )

    keyword: str | None = Field(
        None,
        title='Keyword',
        description='Keyword to consider (searches all NonConvexFlows)'
    )

    quantity: object | None = Field(
        None,
        title='Quantity',
        description=''
    )

    limit_name: str | None = Field(
        None,
        title='Limit Name',
        description=''
    )

    components: list | None = Field(
        None,
        title='Components',
        description=''
    )

    weights: list[float] | None = Field(
        None,
        title='Weights',
        description=''
    )

    limit: float | None = Field(
        None,
        title='Limit',
        description=''
    )

    flows: list | dict | None = Field(
        None,
        title='Flows',
        description=''
    )

    constraint_name: str | None = Field(
        None,
        title='constraint name',
        description=''
    )

    upper_limit: int | None = Field(
        None,
        title='Upper Limit',
        description=''
    )

    lower_limit: int | None = Field(
        None,
        title='Lower Limit',
        description=''
    )

    def to_oemof(self) -> dict[str, dict]:
        """
        Converts the attributes of the current instance into a dictionary format.

        This method iterates through all the attributes of the instance, excluding the
        attribute named "typ". If an attribute is not `None`, it is added to the resulting
        dictionary. The resulting dictionary represents the instance in a format compatible
        for further usage or processing.

        :return: A dictionary representation of the instance where keys are attribute names
                 and values are their corresponding data, excluding attributes that are `None`
                 or named "typ".
        :rtype: dict[str, dict]
        """
        args = {}
        for var in vars(self):
            if var != "typ":
                if vars(self)[var] is not None:
                    args[var] = vars(self)[var]

        return args
