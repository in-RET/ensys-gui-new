import os
from typing import Any

import pandas as pd
from oemof import solph
from oemof.tools import economics
from pydantic import Field

from .flow import EnFlow, OepFlow
from .investment import EnInvestment
from ..common.basemodel import EnBaseModel
from ..common.types import OepTypes


class EnGenericStorage(EnBaseModel):
    """
    Represents a generic energy storage model with various attributes related to
    inputs, outputs, capacities, efficiencies, and losses.

    This class models an energy storage system with different properties such as
    storage capacity, inflow and outflow conversions, losses, and investment
    options. The class is designed to handle energy optimization tasks and can
    be translated into an oemof (Open Energy Modelling Framework)-compatible
    GenericStorage object.

    :ivar label: Default label for the energy storage instance.
    :ivar inputs: Dictionary representing inflows to the storage. Keys are the
        ending nodes of the inflows.
    :ivar outputs: Dictionary representing outflows from the storage. Keys are
        the ending nodes of the outflows.
    :ivar nominal_storage_capacity: Absolute nominal storage capacity. This can
        be a fixed value or an EnInvestment object for investment optimization.
    :ivar invest_relation_input_capacity: Ratio between the investment variable
        of the input flow and the investment variable of the storage.
    :ivar invest_relation_output_capacity: Ratio between the investment variable
        of the output flow and the investment variable of the storage.
    :ivar invest_relation_input_output: Ratio between the investment variable of
        the output flow and the investment variable of the input flow. Used to
        fix relationships between flow investments.
    :ivar initial_storage_level: Relative storage content before the first
        timestep of optimization (value between 0 and 1). Cannot be used with
        investment mode in multi-period models.
    :ivar balanced: Indicates whether the total inflow and outflow are balanced
        (coupling the storage level of the first and last time step).
    :ivar loss_rate: Relative loss of storage content per hour.
    :ivar fixed_losses_relative: Losses proportional to the nominal storage
        capacity but independent of storage content. Not supported in
        investment mode.
    :ivar fixed_losses_absolute: Losses independent of both storage content and
        nominal storage capacity. Not supported in investment mode.
    :ivar inflow_conversion_factor: Efficiency associated with inflow to the
        storage.
    :ivar outflow_conversion_factor: Efficiency associated with outflow from
        the storage.
    :ivar min_storage_level: Minimum storage level as a fraction of nominal
        storage capacity or invested capacity. Value between 0 and 1. Can be
        set for each timestep using a sequence.
    :ivar max_storage_level: Maximum storage level as a fraction of nominal
        storage capacity or invested capacity. Value between 0 and 1. Can be
        set for each timestep using a sequence.
    :ivar investment: Object determining whether nominal storage capacity is
        optimized. If used, nominal_storage_capacity should not be set.
    :ivar storage_costs: Cost (per energy unit) for maintaining energy in the
        storage.
    :ivar lifetime_inflow: Lifetime of inflow, applicable for multi-period
        models with investment in storage capacity and defined
        invest_relation_input_capacity.
    :ivar lifetime_outflow: Lifetime of outflow, applicable for multi-period
        models with investment in storage capacity and defined
        invest_relation_output_capacity.
    """
    label: str = Field(
        default="Default GenericStorage",
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
        default=None,
        title='invest relation input capacity',
        description='Ratio between the investment variable of the input Flow and the investment variable of the storage'
    )

    invest_relation_output_capacity: float | None = Field(
        default=None,
        title='invest relation output capacity',
        description='Ratio between the investment variable of the output Flow and the investment variable of the storage.'
    )

    invest_relation_input_output: float | None = Field(
        default=None,
        title='invest relation input output',
        description='Ratio between the investment variable of the output Flow and the investment variable of the input flow. This ratio used to fix the flow investments to each other. Values < 1 set the input flow lower than the output and > 1 will set the input flow higher than the output flow.'
    )

    initial_storage_level: float | None = Field(
        default=None,
        title='initial storage level',
        description='The relative storage content in the timestep before the first time step of optimization (between 0 and 1). Note: When investment mode is used in a multi-period model, initial_storage_level is not supported. Storage output is forced to zero until the storage unit is invested in.'
    )

    balanced: bool = Field(
        default=True,
        title='balanced',
        description=' Couple storage level of first and last time step. (Total inflow and total outflow are balanced.)'
    )

    loss_rate: float | list[float] = Field(
        ...,
        title='loss rate',
        description='The relative loss of the storage content per hour.'
    )

    fixed_losses_relative: float | list[float] | None = Field(
        default=None,
        title='fixed losses relative',
        description='Losses per hour that are independent of the storage content but proportional to nominal storage capacity. Note: Fixed losses are not supported in investment mode.'
    )

    fixed_losses_absolute: float | list[float] | None = Field(
        default=None,
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
        default=None,
        title='Investment',
        description='Object indicating if a nominal_value of the flow is determined by the optimization problem. Note: This will refer all attributes to an investment variable instead of to the nominal_storage_capacity. The nominal_storage_capacity should not be set (or set to None) if an investment object is used.'
    )

    storage_costs: float | list[float] | None = Field(
        default=None,
        title='storage costs',
        description='Cost (per energy) for having energy in the storage.'
    )

    lifetime_inflow: int | None = Field(
        default=None,
        title='lifetime inflow',
        description='Determine the lifetime of an inflow; only applicable for multi-period models which can invest in storage capacity and have an invest_relation_input_capacity defined.'
    )

    lifetime_outflow: int | None = Field(
        default=None,
        title='lifetime outflow',
        description='Determine the lifetime of an outflow; only applicable for multi-period models which can invest in storage capacity and have an invest_relation_output_capacity defined.'
    )

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.GenericStorage:
        """
        Converts the current storage object to an oemof-compatible
        GenericStorage component.

        This method takes an oemof EnergySystem object as input,
        builds the appropriate arguments for an oemof GenericStorage,
        and then returns the created GenericStorage component.

        :param energysystem: The specified oemof EnergySystem object required for
            creating the GenericStorage component.
        :type energysystem: solph.EnergySystem
        :return: A GenericStorage component created and populated
            using the provided EnergySystem and associated parameters.
        :rtype: solph.components.GenericStorage
        """
        kwargs = self.build_kwargs(energysystem)

        return solph.components.GenericStorage(**kwargs)


class OepGenericStorage(EnBaseModel):
    """
    Represents a generic storage system in the context of an energy model.

    This class defines a model for a generic storage system including the configurations,
    inputs, outputs, and options for enabling the use of data from the Open Energy Platform (OEP).
    It provides functionalities to modify configuration parameters and convert the model into
    an oemof.solph GenericStorage instance.

    :ivar label: Label to identify the storage system.
    :type label: str
    :ivar inputs: Dictionary with inflows, where keys represent the ending nodes of the inflows.
    :type inputs: dict[str, EnFlow]
    :ivar outputs: Dictionary with outflows, where keys represent the ending nodes of the outflows.
    :type outputs: dict[str, EnFlow]
    """
    label: str = Field(
        default="Default OEP GenericStorage",
        title='Label',
        description=''
    )

    type: OepTypes = Field(
        default=OepTypes.storage_electricity,
        title='Type',
        description='Type of the storage system. This is used to determine the appropriate data source for the storage system.'
    )

    inputs: dict[str, EnFlow | OepFlow] = Field(
        ...,
        title='Inputs',
        description='Dictionary with inflows. Keys must be the ending node(s) of the inflows(s)'
    )

    outputs: dict[str, EnFlow | OepFlow] = Field(
        ...,
        title='Outputs',
        description='Dictionary with outflows. Keys must be the ending node(s) of the outflow(s)'
    )

    def create_non_oep_kwargs(self, es: solph.EnergySystem) -> dict[str, dict]:
        # TODO: Read the data from file (first iteration)
        # TODO: Read the Data from the open energy platform (production)
        year = es.timeindex[0].year

        oep_filepath = os.path.abspath(os.path.join(os.getcwd(), "..", "storage", "oep", self.type.value[1], str(self.type.value[0]) + ".csv"))
        print(f"OEP-File: {oep_filepath}")

        with open(oep_filepath, "r") as f:
            oep_table = pd.read_csv(f, delimiter=";", decimal=",", index_col=0)

        capex = oep_table.loc[year, "investment_costs"]
        interest_rate = 0.05
        opex_percentage = oep_table.loc[year, "operating_costs"] / 100
        amort_time = oep_table.loc[year, "lifetime"]

        annuity = economics.annuity(capex=capex, n=amort_time, wacc=interest_rate)
        opex = capex * opex_percentage
        ep_costs = annuity + opex

        oep_attributes: dict[str, Any] = {
            "nominal_storage_capacity": EnInvestment(
                ep_costs=ep_costs
            ),
            "balanced": bool(oep_table.loc[year, "balanced"]),
            "loss_rate": oep_table.loc[year, "loss_rate"],
            "inflow_conversion_factor": oep_table.loc[year, "efficiency_in"],
            "outflow_conversion_factor": oep_table.loc[year, "efficiency_out"],
            "initial_storage_level": oep_table.loc[year, "initial_storage_level"],
            "min_storage_level": 0,
            "max_storage_level": 1,
            "label": self.label,
            "inputs": self.inputs,
            "outputs": self.outputs
        }

        non_oep_generic_storage = EnGenericStorage(**oep_attributes)

        return non_oep_generic_storage.build_kwargs(es)

    def to_oemof(self, energysystem: solph.EnergySystem) -> solph.components.GenericStorage:
        """
        Converts the current storage parameters to an oemof.solph GenericStorage object.
        This method utilizes the create_non_oep_kwargs function to prepare a dictionary
        of keyword arguments, which are then used to initialize and return an oemof.solph
        GenericStorage instance.

        :param energysystem: The energy system to which the storage configuration is
            applied, provided as an instance of solph.EnergySystem.
        :return: An instance of solph.components.GenericStorage created with the
            necessary parameters.
        :rtype: solph.components.GenericStorage
        """
        kwargs = self.create_non_oep_kwargs(energysystem)

        return solph.components.GenericStorage(**kwargs)
