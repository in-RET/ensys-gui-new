from typing import Union

from ..common.basemodel import EnBaseModel
from ..common.types import Constraints
from pydantic import Field


##  Container which contains the params for constraints
#
#   @param typ Type of the Constraints, all possible types are given in the Enum types.Constraints
#   @param var1 (pyomo.environ.Var) – First variable, to be set to equal with Var2 and multiplied with factor1.
#   @param var2 (pyomo.environ.Var) – Second variable, to be set equal to @f$Var1 * factor1@f$.
#   @param factor1 (float) – Factor to define the proportion between the variables.
#   @param name (str) – Optional name for the equation e.g. in the LP file. By default the name is: equate + string representation of var1 and var2.
#   @param keyword (string) – keyword to consider (searches all NonConvexFlows)
#   @param quantity (pyomo.core.base.var.IndexedVar) – Shared Pyomo variable for all components of a type.
#   @param limit_name (string) – Name of the constraint to create
#   @param components (list of components) – list of components of the same type
#   @param weights (list of numeric values) – has to have the same length as the list of components
#   @param limit (numeric) – Absolute limit of keyword attribute for the energy system.
#   @param flows (list of flows) – flows (have to be NonConvex) in the format [(in, out)]
#   @param constraint_name (string) – name for the constraint
#   @param upper_limit (integer) – maximum number of active flows in the list
#   @param lower_limit (integer) – minimum number of active flows in the list
class EnConstraints(EnBaseModel):
    typ: Union[Constraints, None] = Field(
        None,
        title='Typ',
        description='Type of the constraint.'
    )

    var1: Union[object, None] = Field(
        None,
        title='var1',
        description='First variable, to be set to equal with Var2 and multiplied with factor1.'
    )

    var2: Union[object, None] = Field(
        None,
        title='var2',
        description='Second variable, to be set equal to (Var1 * factor1).'
    )

    factor1: Union[float, None]= Field(
        None,
        title='factor1',
        description='Factor to define the proportion between the variables.',
    )

    name: Union[str, None] = Field(
        None,
        title='Name',
        description='Optional name'
    )

    keyword: Union[str, None] = Field(
        None,
        title='Keyword',
        description='Keyword to consider (searches all NonConvexFlows)'
    )

    quantity: Union[object, None] = Field(
        None,
        title='Quantity',
        description=''
    )

    limit_name: Union[str, None] = Field(
        None,
        title='Limit Name',
        description=''
    )

    components: Union[list, None] = Field(
        None,
        title='Components',
        description=''
    )

    weights: Union[list[float], None] = Field(
        None,
        title='Weights',
        description=''
    )

    limit: Union[float, None] = Field(
        None,
        title='Limit',
        description=''
    )

    flows: Union[list, dict, None] = Field(
        None,
        title='Flows',
        description=''
    )

    constraint_name: Union[str, None] = Field(
        None,
        title='constraint name',
        description=''
    )

    upper_limit: Union[int, None] = Field(
        None,
        title='Upper Limit',
        description=''
    )

    lower_limit: Union[int, None] = Field(
        None,
        title='Lower Limit',
        description=''
    )

    ## Returns a dictionary of the given args of this object.
    #
    #   @param self The Object Pointer
    #   @return dictionary of kwargs
    def to_oemof(self) -> dict[str, dict]:
        args = {}
        for var in vars(self):
            if var != "typ":
                if vars(self)[var] is not None:
                    args[var] = vars(self)[var]

        return args
