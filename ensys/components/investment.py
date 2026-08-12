"""Investment module."""
from typing import Any, Annotated

from oemof import solph
from pydantic import Field, BeforeValidator

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
    :ivar custom_properties: Dictionary of custom constraints or attributes for
        investment.
    :type maximum: float | None
    :type minimum: float
    :type ep_costs: float
    :type existing: float
    :type nonconvex: bool
    :type offset: float
    :type overall_maximum: float | None
    :type overalL_minimum: float | None
    :type custom_properties: dict | None
    """
    def ensure_value_or_none(value: Any) -> Any:
        """
        Ensures value or none is provided.

        :return: value or None
        """
        if value == "":
            return value
        else:
            return value


    maximum: Annotated[float | None, BeforeValidator(ensure_value_or_none)] = Field(
        default=float("+inf"),  # eigtl. float("+inf"),
        title='Maximum',
        description='Maximum of the additional invested capacity; defined per period p for a multi-period model.'
    )

    minimum: Annotated[float, BeforeValidator(ensure_value_or_none)] = Field(
        default=0.0,
        title='Minimum',
        description='Minimum of the additional invested capacity. If nonconvex is True, minimum defines the threshold for the invested capacity; defined per period p for a multi-period model.'
    )

    ep_costs: float = Field(
        default=0.0,
        title='EP Costs',
        description='Equivalent periodical costs or investment expenses for the investment'
                    'For a standard model: equivalent periodical costs for the investment per flow capacity, i.e. annuities for investments already calculated.'
                    'For a multi-period model: Investment expenses for the respective period (in nominal terms). Annuities are calculated within the objective term, also considering age and lifetime.'
    )

    existing: float = Field(
        default=0.0,
        title='Existing',
        description='Existing / installed capacity. The invested capacity is added on top of this value. Hence, existing capacities come at no additional costs. Not applicable if nonconvex is set to True.'
    )

    nonconvex: bool = Field(
        default=False,
        title='Nonconvex',
        description='If True, a binary variable for the status of the investment is created. This enables additional fix investment costs (offset) independent of the invested flow capacity. Therefore, use the offset parameter.'
    )

    offset: float = Field(
        default=0.0,
        title='Offset',
        description='Additional fixed investment costs. Only applicable if nonconvex is set to True.'
    )

    custom_properties: dict | None = Field(
        default=None,
        title="Custom Properties",
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
