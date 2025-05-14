from ..common.basemodel import EnBaseModel
from .flow import EnFlow
from .investment import EnInvestment
from oemof import solph
from pydantic import Field


##  Container which contains the params for an oemof-genericstorage
#
#   @param label: str = "Default Storage"
#   @param inputs: Dict[str, InRetEnsysFlow]
#   @param outputs: Dict[str, InRetEnsysFlow]
#   @param nominal_storage_capacity: float] = None
#   @param invest_relation_input_capacity: float] = None
#   @param invest_relation_output_capacity: float] = None
#   @param invest_relation_input_output: float] = None
#   @param initial_storage_level: float] = None
#   @param balanced: bool = True
#   @param loss_rate: float = 0.0
#   @param fixed_losses_relative: float] = None
#   @param fixed_losses_absolute: float] = None
#   @param inflow_conversion_factor: float = 1
#   @param outflow_conversion_factor: float = 1
#   @param min_storage_level: float = 0
#   @param max_storage_level: float = 1
#   @param investment: EnInvestment] = None
class EnGenericStorage(EnBaseModel):
    label: str = Field(
        "Default GenericStorage",
        title='Label',
        description=''
    )

    inputs: dict[str, EnFlow] = Field(
        ...,
        title='Inputs',
        description='Dictionary with inflows. Keys must be the ending node(s) of the inflows(s)'
    )

    outputs: dict[str, EnFlow] = Field(
        ...,
        title='Outputs',
        description='Dictionary with outflows. Keys must be the ending node(s) of the outflow(s)'
    )
    nominal_storage_capacity: float | EnInvestment = Field(
        ...,
        title='nominal storage capacity',
        description='object Absolute nominal capacity of the storage, fixed value or object describing parameter of investment optimisations.'
    )

    invest_relation_input_capacity: float | None = Field(
        None,
        title='invest relation input capacity',
        description='Ratio between the investment variable of the input Flow and the investment variable of the storage'
    )

    invest_relation_output_capacity: float | None = Field(
        None,
        title='invest relation output capacity',
        description='Ratio between the investment variable of the output Flow and the investment variable of the storage.'
    )

    invest_relation_input_output: float | None = Field(
        None,
        title='invest relation input output',
        description='Ratio between the investment variable of the output Flow and the investment variable of the input flow. This ratio used to fix the flow investments to each other. Values < 1 set the input flow lower than the output and > 1 will set the input flow higher than the output flow.'
    )

    initial_storage_level: float | None = Field(
        None,
        title='initial storage level',
        description='The relative storage content in the timestep before the first time step of optimization (between 0 and 1). Note: When investment mode is used in a multi-period model, initial_storage_level is not supported. Storage output is forced to zero until the storage unit is invested in.'
    )

    balanced: bool = Field(
        True,
        title='balanced',
        description=' Couple storage level of first and last time step. (Total inflow and total outflow are balanced.)'
    )

    loss_rate: float | list[float] = Field(
        ...,
        title='loss rate',
        description='The relative loss of the storage content per hour.'
    )

    fixed_losses_relative: float | list[float] | None = Field(
        None,
        title='fixed losses relative',
        description='Losses per hour that are independent of the storage content but proportional to nominal storage capacity. Note: Fixed losses are not supported in investment mode.'
    )

    fixed_losses_absolute: float | list[float] | None = Field(
        None,
        title='Fixed losses absolute',
        description='Losses per hour that are independent of storage content and independent of nominal storage capacity. Note: Fixed losses are not supported in investment mode.'
    )

    inflow_conversion_factor: float | list[float] = Field(
        ...,
        title='Conversion factor: Inflow',
        description='The relative conversion factor, i.e. efficiency associated with the inflow of the storage.'
    )

    outflow_conversion_factor: float | list[float] = Field(
        ...,
        title='Conversion factor: Outflow',
        description='The relative conversion factor, i.e. efficiency associated with the outflow of the storage.'
    )

    min_storage_level: float | list[float] = Field(
        ...,
        title='Minimum storage level',
        description='The normed minimum storage content as fraction of the nominal storage capacity or the capacity that has been invested into (between 0 and 1). To set different values in every time step use a sequence.'
    )

    max_storage_level: float | list[float] = Field(
        ...,
        title='Maximum storage level',
        description='The normed maximum storage content as fraction of the nominal storage capacity or the capacity that has been invested into (between 0 and 1). To set different values in every time step use a sequence.'
    )

    investment: EnInvestment | None = Field(
        None,
        title='Investment',
        description='Object indicating if a nominal_value of the flow is determined by the optimization problem. Note: This will refer all attributes to an investment variable instead of to the nominal_storage_capacity. The nominal_storage_capacity should not be set (or set to None) if an investment object is used.'
    )

    storage_costs: float | list[float] | None = Field(
        None,
        title='storage costs',
        description='Cost (per energy) for having energy in the storage.'
    )

    lifetime_inflow: int | None = Field(
        None,
        title='lifetime inflow',
        description='Determine the lifetime of an inflow; only applicable for multi-period models which can invest in storage capacity and have an invest_relation_input_capacity defined.'
    )

    lifetime_outflow: int | None = Field(
        None,
        title='lifetime outflow',
        description='Determine the lifetime of an outflow; only applicable for multi-period models which can invest in storage capacity and have an invest_relation_output_capacity defined.'
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.GenericStorage-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.GenericStorage:
        kwargs = self.build_kwargs(energysystem)

        return solph.components.GenericStorage(**kwargs)
