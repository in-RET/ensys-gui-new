from ..common.basemodel import EnBaseModel
from oemof import solph
from pydantic import Field


##  Container which contains the params for an InRetEnsys-NonConvex-Object
#
#   @param startup_costs: float = None
#   @param shutdown_costs: float = None
#   @param activity_costs: float = None
#   @param minimum_uptime: int = None
#   @param minimum_downtime: int = None
#   @param maximum_startups: int = None
#   @param maximum_shutdowns: int = None
#   @param initial_status: int = 0
#   @param positive_gradient: Dict = None
#   @param negative_gradient: Dict = None
#   @param startup_costs: float = None
#   @param shutdown_costs: float = None
#   @param activity_costs: float = None
#   @param minimum_uptime: int = None
#   @param minimum_downtime: int = None
#   @param maximum_startups: int = None
#   @param maximum_shutdowns: int = None
#   @param initial_status: int = 0
#   @param positive_gradient: Dict = None
#   @param negative_gradient: Dict = None
class EnNonConvex(EnBaseModel):
    startup_costs: float | list[float] | None = Field(
        None,
        title='Startups Costs',
        description='Costs associated with a start of the flow (representing a unit).'
    )

    shutdown_costs: float | list[float] | None = Field(
        None,
        title='Shutdown Costs',
        description='Costs associated with the shutdown of the flow (representing a unit).'
    )

    activity_costs: float | list[float] | None = Field(
        None,
        title='Activity Costs',
        description='Costs associated with the active operation of the flow, independently from the actual output.'
    )

    inactivity_costs: float | list[float] | None = Field(
        None,
        title='Inactivity Costs',
        description='Costs associated with not operating the flow.'
    )

    minimum_uptime: int | list[int] | None = Field(
        None,
        title='Minimum Uptime',
        description='Minimum number of time steps that a flow must be greater then its minimum flow after startup. Be aware that minimum up and downtimes can contradict each other and may lead to infeasible problems.',
        ge=0
    )
    minimum_downtime: int | list[int] | None = Field(
        None,
        title='Minimum Downtime',
        description='Minimum number of time steps a flow is forced to zero after shutting down. Be aware that minimum up and downtimes can contradict each other and may to infeasible problems.',
        ge=0
    )

    maximum_startups: int | None = Field(
        None,
        title='Maximum Startups',
        description='Maximum number of start-ups in the optimization timeframe.',
        ge=0
    )

    maximum_shutdowns: int | None = Field(
        None,
        title='Maximum Shutdowns',
        description='Maximum number of shutdowns in the optimization timeframe.',
        ge=0
    )

    # 0/False = off, 1/True = on
    initial_status: int = Field(
        0,
        title='initial Status',
        description='Integer value indicating the status of the flow in the first time step (0 = off, 1 = on). For minimum up and downtimes, the initial status is set for the respective values in the beginning e.g. if a minimum uptime of four timesteps is defined and the initial status is set to one, the initial status is fixed for the four first timesteps of the optimization period. Otherwise if the initial status is set to zero and the first timesteps are fixed for the number of minimum downtime steps.',
        ge=0,
        le=1
    )

    positive_gradient_limit: dict | None = Field(
        None,
        title='positive Gradient Limit',
        description='the normed upper bound on the positive difference (flow[t-1] < flow[t]) of two consecutive flow values.'
    )

    negative_gradient_limit: dict | None = Field(
        None,
        title='negative Gradient limit',
        description='the normed upper bound on the negative difference (flow[t-1] > flow[t]) of two consecutive flow values.'
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builds a dictionary with all keywords given by the object and returns the oemof object initialized with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects, i.e., for flows.
    #   @return solph.NonConvex-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.NonConvex:
        kwargs = self.build_kwargs(energysystem)

        return solph.NonConvex(**kwargs)
