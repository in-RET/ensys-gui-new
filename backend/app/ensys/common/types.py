from enum import Enum


class Constraints(Enum):
    """
    Represents a collection of constraints that can be applied to a model in the context of
    optimization problems. These constraints encompass various types of bounds and limits, allowing
    the user to define investments, flow restrictions, and active flow management to match specific
    use cases or requirements effectively.

    :ivar shared_limit: Adds a constraint to the given model that restricts the weighted sum of
        variables to a corridor.
    :type shared_limit: str
    :ivar investment_limit: Sets an absolute limit for the total investment costs of an investment
        optimization problem.
    :type investment_limit: str
    :ivar additional_investment_flow_limit: Global limit for investment flows weighted by an
        attribute keyword. This constraint is only valid for Flows, not for components such as an
        investment storage. The attribute named by the keyword must be added to every Investment
        attribute of the flow to be considered. The total value of keyword attributes after
        optimization can be retrieved by calling `oemof.solph.Model.invest_limit_${keyword}`.
        (Mathematically represented as: Σ (P_i * w_i) ≤ limit, where IF is the set of
        InvestmentFlows considered for the integral limit.)
    :type additional_investment_flow_limit: str
    :ivar generic_integral_limit: Sets a global limit for flows weighted by an attribute called a
        keyword. The attribute named by the keyword must be added to every flow considered.
    :type generic_integral_limit: str
    :ivar emission_limit: Short handle for `generic_integral_limit()` with `keyword="emission_factor"`.
    :type emission_limit: str
    :ivar limit_active_flow_count: Sets limits (lower and/or upper) for the number of concurrently
        active NonConvex flows. The flows are provided as a list.
    :type limit_active_flow_count: str
    :ivar limit_active_flow_count_by_keyword: Wrapper for `limit_active_flow_count` that allows setting
        limits to the count of concurrently active flows by using a keyword instead of a list. The
        constraint will be named as `${keyword}_count`.
    :type limit_active_flow_count_by_keyword: str
    :ivar equate_variables: Ensures that specified variables within the optimization problem are
        treated as equivalent.
    :type equate_variables: str
    """
    shared_limit = 'shared_limit'
    investment_limit = 'investment_limit'
    additional_investment_flow_limit = 'additional_investment_flow_limit'
    generic_integral_limit = 'generic_integral_limit'
    emission_limit = 'emission_limit'
    limit_active_flow_count = 'limit_active_flow_count'
    limit_active_flow_count_by_keyword = 'limit_active_flow_count_by_keyword'
    equate_variables = 'equate_variables'


class Interval(Enum):
    """
    Represents various fixed time intervals available for use.

    This class is an enumeration that defines specific time intervals as constants,
    describing their corresponding durations in hours. The intervals are represented
    as descriptive names and associated with their numerical values (in fractional
    hours). These values can be leveraged to standardize time-related calculations.

    :ivar quarter_hourly: Represents a timestep of 15 minutes.
    :type quarter_hourly: float
    :ivar half_hourly: Represents a timestep of 30 minutes.
    :type half_hourly: float
    :ivar hourly: Represents a timestep of 60 minutes.
    :type hourly: int
    """
    quarter_hourly = 0.25
    half_hourly = 0.5
    hourly = 1


class Solver(Enum):
    """
    Represents enumeration of different solvers available for mathematical programming.

    The class provides a list of solvers used in optimization problems. These include
    different solvers for linear programming and mixed-integer linear programming. It
    allows explicit references to specific solvers and can be helpful for choosing the
    most compatible solver for a given optimization task.

    :ivar cbc: COIN-OR Branch-and-Cut Solver.
    :type cbc: str
    :ivar gurobi: Gurobi MILP Solver.
    :type gurobi: str
    :ivar gurobi_direct: Gurobi MILP Solver (Direct interface).
    :type gurobi_direct: str
    :ivar gurobi_persistent: Gurobi MILP Solver (Persistent interface).
    :type gurobi_persistent: str
    :ivar glpk: GNU Linear Programming Kit Solver.
    :type glpk: str
    :ivar cplex: IBM ILOG CPLEX Optimization Solver.
    :type cplex: str
    :ivar kiwi: Kiwisolver from PyPI.
    :type kiwi: str
    """
    cbc = 'cbc'
    gurobi = 'gurobi'
    gurobi_direct = 'gurobi_direct'
    gurobi_persistent = 'gurobi_persistent'
    glpk = 'glpk'
    cplex = 'cplex'
    kiwi = 'kiwi'


# TODO: Automatisch generieren aus Dateiordner
class OepTypes(Enum):
    """
    Defines the OepTypes enumeration that categorizes various types of energy systems
    and technologies. Each enumeration value represents a specific energy-related
    component, along with its associated category, such as storage, source, or converter.

    This enumeration can be used for energy modeling, categorization, and analysis in
    energy systems. It provides an organized scheme for referencing and interacting
    with different energy-related components.

    :ivar storage_electricity: An energy storage system for electricity, categorized
                               as generic storage.
    :ivar storage_electricity_pumped_hydro_storage_power_technology: A pumped hydro
                               energy storage system, categorized as generic storage.
    :ivar storage_gas: A gas storage system, categorized as generic storage.
    :ivar storage_heat_district_heating: A heat storage system for district heating,
                               categorized as generic storage.
    :ivar storage_heat_seasonal: A seasonal heat storage system, categorized as generic
                               storage.
    :ivar storage_hydrogen: A hydrogen storage system, categorized as generic storage.
    :ivar fuel_cells: A fuel cell system for energy generation, categorized as a source.
    :ivar hydrogen_feed_in: A hydrogen feed-in system, categorized as a source.
    :ivar onshore_wind_power_plant: An onshore wind power generator, categorized as a source.
    :ivar rooftop_photovoltaic_power_plant: A rooftop photovoltaic system, categorized as
                               a source.
    :ivar run_river_power_plant: A run-of-river power generation plant, categorized as a source.
    :ivar solar_thermal_power_plant: A solar thermal power generation plant, categorized
                               as a source.
    :ivar power_to_liquid_system: A system converting power to liquid fuel, categorized as
                               a converter.
    :ivar biogas_combined_heat_and_power_plant: A biogas-fueled combined heat and power
                               generation plant, categorized as a converter.
    :ivar biogas_upgrading_plant: A plant for upgrading biogas, categorized as a converter.
    :ivar biomass_combined_heat_and_power_plant: A biomass-fueled combined heat and power
                               generation plant, categorized as a converter.
    :ivar biomass_heating_plant: A biomass-based heating system, categorized as a converter.
    :ivar biomass_power_plant: A biomass-fueled power generation plant, categorized as a
                               converter.
    :ivar biomass_to_liquid_system: A system converting biomass to liquid fuel, categorized
                               as a converter.
    :ivar biomethane_injection_plant: A system for injecting biomethane into the grid,
                               categorized as a converter.
    :ivar combined_heat_and_power_generating_unit: A combined heat and power-generating unit,
                               categorized as a converter.
    :ivar electrical_heater: An electrical heater, categorized as a converter.
    :ivar electrolysis: A system for producing hydrogen through electrolysis, categorized
                               as a converter.
    :ivar heat_pump_air_waste_heat: A heat pump system using waste heat from air, categorized
                               as a converter.
    :ivar heat_pump_air_ambient_heat: A heat pump system utilizing ambient air heat,
                               categorized as a converter.
    :ivar heat_pump_ground_river_heat: A heat pump that uses ground or river heat, categorized
                               as a converter.
    :ivar methanation: A system for producing methane from hydrogen and CO2, categorized as
                               a converter.
    """
    storage_electricity = ("storage_electricity", "generic_storage")
    storage_electricity_pumped_hydro_storage_power_technology = (
        "storage_electricity_pumped_hydro_storage_power_technology", "generic_storage")
    storage_gas = ("storage_gas", "generic_storage")
    storage_heat_district_heating = ("storage_heat_district_heating", "generic_storage")
    storage_heat_seasonal = ("storage_heat_seasonal", "generic_storage")
    storage_hydrogen = ("storage_hydrogen", "generic_storage")
    fuel_cells = ("fuel_cells", "source")
    hydrogen_feed_in = ("hydrogen_feed_in", "source")
    onshore_wind_power_plant = ("onshore_wind_power_plant", "source")
    rooftop_photovoltaic_power_plant = ("rooftop_photovoltaic_power_plant", "source")
    run_river_power_plant = ("run_river_power_plant", "source")
    solar_thermal_power_plant = ("solar_thermal_power_plant", "source")
    power_to_liquid_system = ("power_to_liquid_system", "converter")
    biogas_combined_heat_and_power_plant = ("biogas_combined_heat_and_power_plant", "converter")
    biogas_upgrading_plant = ("biogas_upgrading_plant", "converter")
    biomass_combined_heat_and_power_plant = ("biomass_combined_heat_and_power_plant", "converter")
    biomass_heating_plant = ("biomass_heating_plant", "converter")
    biomass_power_plant = ("biomass_power_plant", "converter")
    biomass_to_liquid_system = ("biomass_to_liquid_system", "converter")
    biomethane_injection_plant = ("biomethane_injection_plant", "converter")
    combined_heat_and_power_generating_unit = ("combined_heat_and_power_generating_unit", "converter")
    electrical_heater = ("electical_heater", "converter")
    electrolysis = ("electrolysis", "converter")
    heat_pump_air_waste_heat = ("heat_pump_air_waste_heat", "converter")
    heat_pump_air_ambient_heat = ("heat_pump_air_ambient_heat", "converter")
    heat_pump_ground_river_heat = ("heat_pump_ground_river_heat", "converter")
    methanation = ("methanation", "converter")
