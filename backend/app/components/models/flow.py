from typing import Sequence, Union

from ..common.config import EnConfigContainer
from .investment import EnInvestment
from .nonconvex import EnNonConvex
from oemof import solph
from pydantic import Field


##  Container which contains the params for an oemof-flow
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
class EnFlow(EnConfigContainer):
    nominal_value: Union[float, None] = Field(
        None,
        title='Nominal Value',
        description='The nominal value of the flow. If this value is set the corresponding optimization variable of '
                    'the flow object will be bounded by this value multiplied with min(lower bound)/max(upper bound).'
    )

    # numeric or sequence or None
    fix: Union[float, Sequence[float], None] = Field(
        None,
        title='Fix',
        description='Normed fixed value for the flow variable. '
                    'Will be multiplied with the nominal_value to get the absolute value'
    )

    # numeric or sequence
    min: Union[float, Sequence[float], None] = Field(
        None,
        title='Minimum',
        description=''
    )

    # numeric or sequence
    max: Union[float, Sequence[float], None] = Field(
        None,
        title='Maximum',
        description=''
    )

    positive_gradient: Union[dict, None] = Field(
        None,
        title='Positive Gradient',
        description=''
    )
    negative_gradient: Union[dict, None] = Field(
        None,
        title='Negative Gradient',
        description=''
    )

    summed_max: Union[float, None] = Field(
        None,
        title='Summed Maximum',
        description='Specific maximum value summed over all timesteps. '
                    'Will be multiplied with the nominal_value to get the absolute limit.'
    )

    summed_min: Union[float, None] = Field(
        None,
        title='Summed Minimum',
        description='Specific minimum value summed over all timesteps. '
                    'Will be multiplied with the nominal_value to get the absolute limit.'
    )

    variable_costs: Union[float, Sequence[float], None] = Field(
        None,
        title='Variable Costs',
        description='The costs associated with one unit of the flow.'
    )

    investment: Union[EnInvestment, None] = Field(
        None,
        title='Investment',
        description='Object indicating if a nominal_value of the flow is determined by the optimization problem.'
    )

    nonconvex: Union[EnNonConvex, None] = Field(
        None,
        title='Nonconvex',
        description='If a nonconvex flow object is added here, the flow constraints will be altered significantly as '
                    'the mathematical model for the flow will be different, i.e. constraint etc. from NonConvexFlow '
                    'will be used instead of Flow. '
    )

    custom_attributes: Union[dict, None] = Field(
        None,
        title="Custom Attributes",
        description="Custom Attributes as dictionary for custom investment limits."
    )

    ##  Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.Flow-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.Flow:
        kwargs = self.build_kwargs(energysystem)

        return solph.Flow(**kwargs)
