from ..common.basemodel import EnBaseModel
from .investment import EnInvestment
from .nonconvex import EnNonConvex
from oemof import solph
from pydantic import Field


## Container which contains the params for an oemof-flow
#
#   @param nominal_value
#   @param fix
#   @param min
#   @param max
#   @param positive_gradient
#   @param negative_gradient
#   @param summed_max
#   @param summed_min
#   @param variable_costs
#   @param investement Ensys-Investment-Object, if the Flow should be optimized for an Investmentlimit.
#   @param nonconvex Ensys-NonConvex-Object, if the Flow should be nonconvex. Non possible if the flow is an Investmentflow.
#   @param custom_attributes Keyword-Arguments for special Keywords, used by constraints.
class EnFlow(EnBaseModel):
    nominal_value: float | EnInvestment = Field(
        None,
        title='Nominal Value',
        description='The nominal value of the flow. If this value is set the corresponding optimization variable of '
                    'the flow object will be bounded by this value multiplied with min(lower bound)/max(upper bound).'
    )

    variable_costs: float | list[float] | None = Field(
        None,
        title='Variable Costs',
        description='The costs associated with one unit of the flow per hour. The costs for each timestep will be added to the objective expression of the optimization problem.'
    )

    # numeric or sequence
    min: float | list[float] | None = Field(
        None,
        title='Minimum',
        description='Normed minimum value of the flow (see max).'
    )

    # numeric or sequence
    max: float | list[float] | None = Field(
        None,
        title='Maximum',
        description='Normed maximum value of the flow. The flow absolute maximum will be calculated by multiplying nominal_value with max'
    )

    # numeric or sequence or None
    fix: float | list[float] | None = Field(
        None,
        title='Fix',
        description='Normed fixed value for the flow variable. '
                    'Will be multiplied with the nominal_value to get the absolute value'
    )

    positive_gradient_limit: dict | None = Field(
        None,
        title='Positive Gradient Limit',
        description='the normed upper bound on the positive difference (flow[t-1] < flow[t]) of two consecutive flow values.'
    )
    negative_gradient_limit: dict | None = Field(
        None,
        title='Negative Gradient Limit',
        description='the normed upper bound on the negative difference (flow[t-1] > flow[t]) of two consecutive flow values.'
    )

    full_load_time_max: int | None = Field(
        None,
        title='Full Load Time Maximum',
        description='Maximum energy transported by the flow expressed as the time (in hours) that the flow would have to run at nominal capacity (nominal_value).'
    )

    full_load_time_min: int | None = Field(
        None,
        title='Full Load Time Minimum',
        description='Minimum energy transported by the flow expressed as the time (in hours) that the flow would have to run at nominal capacity (nominal_value).'
    )

    integer: bool | None = Field(
        None,
        title='Integer',
        description='Set True to bound the flow values to integers.'
    )

    nonconvex: EnNonConvex | None = Field(
        None,
        title='Nonconvex',
        description='If a nonconvex flow object is added here, the flow constraints will be altered significantly as '
                    'the mathematical model for the flow will be different, i.e. constraint etc. from NonConvexFlow '
                    'will be used instead of Flow. '
    )

    fixed_costs: float | list[float] | None = Field(
        None,
        title='Fixed Costs',
        description='The fixed costs associated with a flow. Note: These are only applicable for a multi-period model and given on a yearly basis.'
    )

    lifetime: int | None = Field(
        None,
        title='Lifetime',
        description='The lifetime of a flow (usually given in years); once it reaches its lifetime (considering also an initial age), the flow is forced to 0. Note: Only applicable for a multi-period model.'
    )

    age: int | None = Field(
        None,
        title='Age',
        description='The age of a flow (usually given in years); once it reaches its age (considering also an initial age), the flow is forced to 0. Note: Only applicable for a multi-period model.'
    )

    custom_attributes: dict | None = Field(
        None,
        title="Custom Attributes",
        description="Custom Attributes as dictionary for custom investment limits."
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.Flow-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Flow:
        kwargs = self.build_kwargs(energysystem)

        return solph.Flow(**kwargs)

