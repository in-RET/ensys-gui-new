from backend.app.components.common.config import EnConfigContainer
from oemof import solph
from pydantic import Field


##  Container which contains the params for an oemof-investment
#
#   @param maximum: float = float("+inf")
#   @param minimum: float = 0.0
#   @param ep_costs: float = 0.0
#   @param existing: float = 0.0
#   @param nonconvex: bool = False
#   @param offset: float = 0.0
#   @param custom_attributes: Union[None, Dict] = None
class EnInvestment(EnConfigContainer):
    maximum: float = Field(
        float("+inf"),
        title='Maximum',
        description='Maximum of the Investment.'
    )

    minimum: float = Field(
        0.0,
        title='Minimum',
        description='Minimum of the Investment.'
    )

    ep_costs: float = Field(
        0.0,
        title='EP Costs',
        description='ep_costs'
    )

    existing: float = Field(
        0.0,
        title='Existing',
        description='Value of existing investment'
    )

    nonconvex: bool = Field(
        False,
        title='Nonconvex',
        description='Value to mark the Investment as Nonconvex'
    )

    offset: float = Field(
        0.0,
        title='Offset',
        description='Offset'
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
