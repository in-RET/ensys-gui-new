from typing import Union

from ..common.config import EnConfigContainer
from oemof import solph
from pydantic import Field


##  Container which contains the params for an InRetEnsys-NonConvex-Object
#
#   @param startup_costs: float] = None
#   @param shutdown_costs: float] = None
#   @param activity_costs: float] = None
#   @param minimum_uptime: int] = None
#   @param minimum_downtime: int] = None
#   @param maximum_startups: int] = None
#   @param maximum_shutdowns: int] = None
#   @param initial_status: int = 0
#   @param positive_gradient: Dict] = None
#   @param negative_gradient: Dict] = None
#   @param startup_costs: float] = None
#   @param shutdown_costs: float] = None
#   @param activity_costs: float] = None
#   @param minimum_uptime: int] = None
#   @param minimum_downtime: int] = None
#   @param maximum_startups: int] = None
#   @param maximum_shutdowns: int] = None
#   @param initial_status: int = 0
#   @param positive_gradient: Dict] = None
#   @param negative_gradient: Dict] = None
class EnNonConvex(EnConfigContainer):
    startup_costs: Union[float, None] = Field(
        None,
        title='Startups Costs',
        description=''
    )

    shutdown_costs: Union[float, None] = Field(
        None,
        title='Shutdown Costs',
        description=''
    )

    activity_costs: Union[float, None] = Field(
        None,
        title='Activity Costs',
        description=''
    )

    minimum_uptime: Union[int, None] = Field(
        None,
        title='Minimum Uptime',
        description=''
    )
    minimum_downtime: Union[int, None] = Field(
        None,
        title='Minimum Downtime',
        description=''
    )

    maximum_startups: Union[int, None] = Field(
        None,
        title='Maximum Startups',
        description=''
    )

    maximum_shutdowns: Union[int, None] = Field(
        None,
        title='Maximum Shutdowns',
        description=''
    )

    # 0/False = off, 1/True = on
    initial_status: int = Field(
        0,
        title='initial Status',
        description=''
    )
    positive_gradient: Union[dict, None] = Field(
        None,
        title='positive Gradient',
        description=''
    )

    negative_gradient: Union[dict, None] = Field(
        None,
        title='negative Gradient',
        description=''
    )

    ## Returns an oemof-object from the given args of this object.
    #
    #   Builts a dictionary with all keywords given by the object and returns the oemof object initialised with these 'kwargs'.
    #
    #   @param self The Object Pointer
    #   @param energysystem The oemof-Energysystem to reference other objects i.e. for flows.
    #   @return solph.NonConvex-Object (oemof)
    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.NonConvex:
        kwargs = self.build_kwargs(energysystem)

        return solph.NonConvex(**kwargs)
