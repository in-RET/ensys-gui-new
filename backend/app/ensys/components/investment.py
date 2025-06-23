from oemof import solph
from pydantic import Field

from ..common.basemodel import EnBaseModel


class EnInvestment(EnBaseModel):
    """
    Represents an investment model for energy system components.

    This class defines the properties and configurations for managing investments in energy
    system components. The attributes include limits on capacity investment, cost-related
    parameters, and constraints for both standard and multi-period models. It supports
    nonconvex investments and custom limits through additional configurations.

    :ivar maximum: Maximum additional invested capacity; defined per period in a
        multi-period model.
    :ivar minimum: Minimum additional invested capacity. Defines the threshold when
        nonconvex is True; defined per period in a multi-period model.
    :ivar ep_costs: Equivalent periodical costs or investment expenses per flow capacity
        in both standard and multi-period models.
    :ivar existing: Installed capacity without additional investment costs; not applicable
        if nonconvex is True.
    :ivar nonconvex: Flag to enable binary variables for investment status, allowing offset
        costs independent of invested flow capacity.
    :ivar offset: Fixed costs for nonconvex investments.
    :ivar overall_maximum: Overall maximum capacity investment, applicable to
        multi-period models.
    :ivar overalL_minimum: Overall minimum capacity investment, applicable to
        multi-period models.
    :ivar lifetime: Lifetime of the unit in years, applicable to multi-period models.
    :ivar age: Start age of the unit in years at the beginning of optimization,
        applicable to multi-period models.
    :ivar interest_rate: Interest rate for annuities calculation in a multi-period
        model; defaults to the model's discount rate if unspecified.
    :ivar fixed_costs: Fixed costs per period in nominal terms, applicable to
        multi-period models.
    :ivar custom_attributes: Dictionary of custom constraints or attributes for
        investment.
    :type maximum: float | None
    :type minimum: float
    :type ep_costs: float
    :type existing: float
    :type nonconvex: bool
    :type offset: float
    :type overall_maximum: float | None
    :type overalL_minimum: float | None
    :type lifetime: int | None
    :type age: int | None
    :type interest_rate: float | None
    :type fixed_costs: float | None
    :type custom_attributes: dict
    """
    maximum: float | None = Field(
        None,  # eigtl. float("+inf"),
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

    # kwargs: Dict = Field(
    #    None,
    #    title='kwargs',
    #    description='Extra arguments for the object'
    # )

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Investment:
        """
        Converts the object's internal configuration to an oemof.solph Investment object.

        This method takes an oemof EnergySystem object and uses the provided system
        configuration to construct and return an oemof.solph Investment object. The
        generated Investment object encapsulates investment-related parameters for
        use in energy system modeling, particularly for optimization.

        :param energysystem: The oemof.solph EnergySystem object containing the
            necessary system configuration and parameters.
        :type energysystem: solph.EnergySystem
        :return: An oemof.solph Investment object constructed based on the internal
            configuration and the provided EnergySystem object.
        :rtype: solph.Investment
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.Investment(**kwargs)
