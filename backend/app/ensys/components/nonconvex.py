from oemof import solph
from pydantic import Field

from ..common.basemodel import EnBaseModel


class EnNonConvex(EnBaseModel):
    """
    Represents a non-convex energy model with constraints and cost attributes.

    Defines attributes and limitations associated with non-convex behavior, including
    cost structures, operational constraints, and gradient limits, for modeling
    purposes in an energy system optimization context.

    :ivar startup_costs: Costs associated with a start of the flow (representing a unit).
    :type startup_costs: float | list[float] | None
    :ivar shutdown_costs: Costs associated with the shutdown of the flow (representing a unit).
    :type shutdown_costs: float | list[float] | None
    :ivar activity_costs: Costs associated with the active operation of the flow, independently from the actual output.
    :type activity_costs: float | list[float] | None
    :ivar inactivity_costs: Costs associated with not operating the flow.
    :type inactivity_costs: float | list[float] | None
    :ivar minimum_uptime: Minimum number of time steps that a flow must be greater than its minimum flow after startup. Be aware that minimum up and downtimes can contradict each other and may lead to infeasible problems.
    :type minimum_uptime: int | list[int] | None
    :ivar minimum_downtime: Minimum number of time steps a flow is forced to zero after shutting down. Be aware that minimum up and downtimes can contradict each other and may lead to infeasible problems.
    :type minimum_downtime: int | list[int] | None
    :ivar maximum_startups: Maximum number of start-ups in the optimization timeframe.
    :type maximum_startups: int | None
    :ivar maximum_shutdowns: Maximum number of shutdowns in the optimization timeframe.
    :type maximum_shutdowns: int | None
    :ivar initial_status: Integer value indicating the status of the flow in the first time step (0 = off, 1 = on). For minimum up and downtimes, the initial status is set for the respective values in the beginning, e.g., if a minimum uptime of four timesteps is defined and the initial status is set to one, the initial status is fixed for the four first timesteps of the optimization period. Otherwise, if the initial status is set to zero, the first timesteps are fixed for the number of minimum downtime steps.
    :type initial_status: int
    :ivar positive_gradient_limit: The normed upper bound on the positive difference (flow[t-1] < flow[t]) of two consecutive flow values.
    :type positive_gradient_limit: dict | None
    :ivar negative_gradient_limit: The normed upper bound on the negative difference (flow[t-1] > flow[t]) of two consecutive flow values.
    :type negative_gradient_limit: dict | None
    """
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

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.NonConvex:
        """
        Converts the given energy system into an oemof.solph.NonConvex object using
        parameters built by the `build_kwargs` method. This function prepares the
        necessary parameters by interacting with the provided energy system and
        constructs the required non-convex properties for the output.

        :param energysystem: The energy system instance that holds the data and
            configuration required to create an `oemof.solph.NonConvex` object.
        :return: An instance of `solph.NonConvex` configured with the parameters
            derived from the input energy system.
        :rtype: solph.NonConvex
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.NonConvex(**kwargs)
