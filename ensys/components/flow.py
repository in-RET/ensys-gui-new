from oemof import solph
from pydantic import Field

from .investment import EnInvestment
from .nonconvex import EnNonConvex
from ..common.basemodel import EnBaseModel


class EnFlow(EnBaseModel):
    """
    Represents an energy flow model designed to manage and optimize energy-related variables
    and constraints in an energy system. It includes parameters such as nominal values,
    variable costs, bounds, gradients, and additional constraints like nonconvex flows,
    lifetime, or custom attributes.

    This class is typically employed in optimization scenarios where energy flows
    between nodes in a system are analyzed and adjusted based on various input parameters
    to minimize costs or adhere to specific constraints.

    :ivar nominal_value: The nominal value of the flow. If set, the corresponding optimization
        variable of the flow object will be bounded by this value multiplied with
        min(lower bound)/max(upper bound).
    :type nominal_value: float | EnInvestment
    :ivar variable_costs: The costs associated with one unit of the flow per hour. These costs
        for each timestep will be added to the objective expression of the optimization problem.
    :type variable_costs: float | list[float] | None
    :ivar min: Normed minimum value of the flow.
    :type min: float | list[float] | None
    :ivar max: Normed maximum value of the flow. The absolute maximum flow will be calculated
        by multiplying nominal_value with max.
    :type max: float | list[float] | None
    :ivar fix: Normed fixed value for the flow variable. It will be multiplied with
        nominal_value to get the absolute value.
    :type fix: float | list[float] | None
    :ivar positive_gradient_limit: Normed upper bound on the positive difference
        (flow[t-1] < flow[t]) of two consecutive flow values.
    :type positive_gradient_limit: dict | None
    :ivar negative_gradient_limit: Normed upper bound on the negative difference
        (flow[t-1] > flow[t]) of two consecutive flow values.
    :type negative_gradient_limit: dict | None
    :ivar full_load_time_max: Maximum energy transported by the flow, expressed as the
        time (in hours) the flow would have to run at nominal capacity (nominal_value).
    :type full_load_time_max: int | None
    :ivar full_load_time_min: Minimum energy transported by the flow, expressed as the
        time (in hours) the flow would have to run at nominal capacity (nominal_value).
    :type full_load_time_min: int | None
    :ivar integer: If True, the flow values will be bounded to integers.
    :type integer: bool | None
    :ivar nonconvex: If a nonconvex flow object is specified, the flow's constraints
        will be significantly altered based on the NonConvexFlow model.
    :type nonconvex: EnNonConvex | None
    :ivar fixed_costs: Fixed costs associated with a flow, provided on a yearly basis.
        Applicable only for a multi-period model.
    :type fixed_costs: float | list[float] | None
    :ivar lifetime: Lifetime of a flow (in years). When reached (considering the initial age),
        the flow is forced to 0. Applicable only for a multi-period model.
    :type lifetime: int | None
    :ivar age: Age of a flow (in years). When reached (considering the initial age),
        the flow is forced to 0. Applicable only for a multi-period model.
    :type age: int | None
    :ivar custom_attributes: Custom attributes provided as a dictionary for customized
        investment limits or additional properties.
    :type custom_attributes: dict | None
    """
    nominal_value: float | EnInvestment = Field(
        default=None,
        title='Nominal Value',
        description='The nominal value of the flow. If this value is set the corresponding optimization variable of '
                    'the flow object will be bounded by this value multiplied with min(lower bound)/max(upper bound).'
    )

    variable_costs: float | list[float] | None = Field(
        default=None,
        title='Variable Costs',
        description='The costs associated with one unit of the flow per hour. The costs for each timestep will be added to the objective expression of the optimization problem.'
    )

    # numeric or sequence
    min: float | list[float] | None = Field(
        default=None,
        title='Minimum',
        description='Normed minimum value of the flow (see max).'
    )

    # numeric or sequence
    max: float | list[float] | None = Field(
        default=None,
        title='Maximum',
        description='Normed maximum value of the flow. The flow absolute maximum will be calculated by multiplying nominal_value with max'
    )

    # numeric or sequence or None
    fix: float | list[float] | None = Field(
        default=None,
        title='Fix',
        description='Normed fixed value for the flow variable. '
                    'Will be multiplied with the nominal_value to get the absolute value'
    )

    positive_gradient_limit: dict | None = Field(
        default=None,
        title='Positive Gradient Limit',
        description='the normed upper bound on the positive difference (flow[t-1] < flow[t]) of two consecutive flow values.'
    )
    negative_gradient_limit: dict | None = Field(
        default=None,
        title='Negative Gradient Limit',
        description='the normed upper bound on the negative difference (flow[t-1] > flow[t]) of two consecutive flow values.'
    )

    full_load_time_max: int | None = Field(
        default=None,
        title='Full Load Time Maximum',
        description='Maximum energy transported by the flow expressed as the time (in hours) that the flow would have to run at nominal capacity (nominal_value).'
    )

    full_load_time_min: int | None = Field(
        default=None,
        title='Full Load Time Minimum',
        description='Minimum energy transported by the flow expressed as the time (in hours) that the flow would have to run at nominal capacity (nominal_value).'
    )

    integer: bool | None = Field(
        default=None,
        title='Integer',
        description='Set True to bound the flow values to integers.'
    )

    nonconvex: EnNonConvex | None = Field(
        default=None,
        title='Nonconvex',
        description='If a nonconvex flow object is added here, the flow constraints will be altered significantly as '
                    'the mathematical model for the flow will be different, i.e. constraint etc. from NonConvexFlow '
                    'will be used instead of Flow. '
    )

    fixed_costs: float | list[float] | None = Field(
        default=None,
        title='Fixed Costs',
        description='The fixed costs associated with a flow. Note: These are only applicable for a multi-period model and given on a yearly basis.'
    )

    lifetime: int | None = Field(
        default=None,
        title='Lifetime',
        description='The lifetime of a flow (usually given in years); once it reaches its lifetime (considering also an initial age), the flow is forced to 0. Note: Only applicable for a multi-period model.'
    )

    age: int | None = Field(
        default=None,
        title='Age',
        description='The age of a flow (usually given in years); once it reaches its age (considering also an initial age), the flow is forced to 0. Note: Only applicable for a multi-period model.'
    )

    custom_attributes: dict | None = Field(
        default=None,
        title="Custom Attributes",
        description="Custom Attributes as dictionary for custom investment limits."
    )

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Flow:
        """
        Converts the current instance into an oemof.solph.Flow object using the provided
        energy system and internal parameters. The method prepares the necessary
        arguments from the instance and inputs, constructs the Flow object, and
        returns it.

        :param energysystem: The energy system object used to derive specific
            characteristics for the flow conversion (oemof.solph.EnergySystem).
        :return: A corresponding oemof.solph.Flow object built using the instance
            parameters and the energy system context (oemof.solph.Flow).
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.Flow(**kwargs)
