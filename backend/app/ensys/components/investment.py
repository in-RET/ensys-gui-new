from ..common.basemodel import EnBaseModel
from oemof import solph
from pydantic import Field


## Container which contains the params for an oemof-investment
#
#   @param maximum: float = float("+inf")
#   @param minimum: float = 0.0
#   @param ep_costs: float = 0.0
#   @param existing: float = 0.0
#   @param nonconvex: bool = False
#   @param offset: float = 0.0
#   @param custom_attributes: Union[None, Dict] = None
class EnInvestment(EnBaseModel):
    maximum: float = Field(
        float("+inf"),
        title='Maximum',
        description='Maximum of the additional invested capacity; defined per period p for a multi-period model.'
    )

    minimum: float = Field(
        0.0,
        title='Minimum',
        description='Minimum of the additional invested capacity. If nonconvex is True, minimum defines the threshold for the invested capacity; defined per period p for a multi-period model.'
    )

    ep_costs: float = Field(
        0.0,
        title='EP Costs',
        description='Equivalent periodical costs or investment expenses for the investment'
                    'For a standard model: equivalent periodical costs for the investment per flow capacity, i.e. annuities for investments already calculated.'
                    'For a multi-period model: Investment expenses for the respective period (in nominal terms). Annuities are calculated within the objective term, also considering age and lifetime.'
    )

    existing: float = Field(
        0.0,
        title='Existing',
        description='Existing / installed capacity. The invested capacity is added on top of this value. Hence, existing capacities come at no additional costs. Not applicable if nonconvex is set to True.'
    )

    nonconvex: bool = Field(
        False,
        title='Nonconvex',
        description='If True, a binary variable for the status of the investment is created. This enables additional fix investment costs (offset) independent of the invested flow capacity. Therefore, use the offset parameter.'
    )

    offset: float = Field(
        0.0,
        title='Offset',
        description='Additional fixed investment costs. Only applicable if nonconvex is set to True.'
    )

    overall_maximum: float | None = Field(
        None,
        title='Overall Maximum',
        description='Overall maximum capacity investment, i.e. the amount of capacity that can be totally installed at maximum in any period (taking into account decommissionings); only applicable for multi-period models'
    )

    overalL_minimum: float | None = Field(
        None,
        title='Overall Minimum',
        description='Overall minimum capacity investment, i.e. the amount of capacity that can be totally installed at minimum in any period (taking into account decommissionings); only applicable for multi-period models'
    )

    lifetime: int | None = Field(
        None,
        title='Lifetime',
        description='Units lifetime, given in years; only applicable for multi-period models'
    )

    age: int | None = Field(
        None,
        title='Age',
        description='Units start age, given in years at the beginning of the optimization; only applicable for multi-period models'
    )

    interest_rate: float | None = Field(
        None,
        title='Interest Rate',
        description='Interest rate for calculating annuities when investing in a particular unit; only applicable for multi-period models. If nothing else is specified, the interest rate is the same as the model discount rate of the multi-period model.'
    )

    fixed_costs: float | None = Field(
        None,
        title='Fixed Costs',
        description='Fixed costs in each period (given in nominal terms); only applicable for multi-period models'
    )

    custom_attributes: dict = Field(
        {},
        title="Custom Attributes",
        description="Custom Attributes as dictionary for custom investment limits."
    )

    #kwargs: Dict = Field(
    #    None,
    #    title='kwargs',
    #    description='Extra arguments for the object'
    #)

    ##  Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.Investment-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Investment:
        kwargs = self.build_kwargs(energysystem)

        return solph.Investment(**kwargs)
