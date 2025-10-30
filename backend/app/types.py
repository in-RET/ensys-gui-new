"""
EnSys Type Definitions
=====================

This module defines the core type enumerations used throughout the EnSys application
for component and system modeling.

It includes two main enumerations:
    - oemofBlockTypes: Basic block types for energy system modeling
    - oepTypes: Detailed component types for specific energy system elements
"""

from enum import Enum


class oemofBlockTypes(Enum):
    """
    Basic block types for energy system modeling based on oemof framework.

    This enumeration defines the fundamental building blocks that can be used
    to construct energy system models.

    Attributes:
        generic_storage: Generic storage component for energy storage systems
        sink: Component representing energy consumption or demand
        source: Component representing energy generation or supply
        converter: Component for energy conversion between different forms
    """
    generic_storage = "generic_storage"
    sink = "sink"
    source = "source"
    converter = "converter"


class oepTypes(Enum):
    """
    Detailed component types for specific energy system elements.

    This enumeration provides a comprehensive list of specific energy system
    components, categorized by their function (storage, sink, source, converter).

    Storage Components:
        storage_electricity_*: Various electricity storage technologies
        storage_gas: Gas storage systems
        storage_heat_*: Different heat storage implementations
        storage_hydrogen: Hydrogen storage systems

    Sink Components:
        electricity_demand_*: Various electricity consumption patterns
        heat_demand_*: Different heat demand profiles
        demand_*: Generic demand profiles

    Source Components:
        *_power_plant: Different types of power generation plants

    Converter Components:
        *_system: Various energy conversion systems
        *_plant: Different types of power and heating plants
    """

    # Storages
    storage_electricity_generic = "storage_electricity_generic"
    storage_electricity_li_ion = "storage_electricity_li_ion"
    storage_electricity_natrium = "storage_electricity_natrium"
    # storage_electricity_pumped_hydro_storage_power_technology = "storage_electricity_pumped_hydro_storage_power_technology"
    storage_gas = "storage_gas"
    storage_heat_district_heating = "storage_heat_district_heating"
    storage_heat_seasonal = "storage_heat_seasonal"
    storage_heat_household = "storage_heat_household"
    storage_hydrogen = "storage_hydrogen"

    # Sinks
    electricity_demand_sfh = "electricity_demand_sfh"
    electricity_demand_electric_car = "electricity_demand_electric_car"
    electricity_demand_industry = "electricity_demand_industry"
    heat_demand_sfh = "heat_demand_sfh"
    heat_demand_industry_room = "heat_demand_industry_room"
    heat_demand_industry_process = "heat_demand_industry_process"
    demand_g0 = "demand_g0"
    demand_g3 = "demand_g3"
    demand_ha4 = "demand_ha4"
    demand_t24 = "demand_t24"

    # Sources
    run_river_power_plant = "run_river_power_plant"
    solar_thermal_power_plant = "solar_thermal_power_plant"
    onshore_wind_power_plant = "onshore_wind_power_plant"
    openfield_photovoltaic_power_plant = "openfield_photovoltaic_power"
    rooftop_photovoltaic_power_plant = "rooftop_photovoltaic_power"

    # Converters
    power_to_liquid_system = "power_to_liquid_system"
    biogas_combined_heat_and_power_plant = "biogas_combined_heat_and_power_plant"
    biomass_combined_heat_and_power_plant = "biomass_combined_heat_and_power_plant"
    biomass_heating_plant = "biomass_heating_plant"
    biomass_power_plant = "biomass_power_plant"
    biomass_to_liquid_system_substrat = "biomass_to_liquid_system_substrat"
    biomethane_injection_plant = "biomethane_injection_plant"
    combined_heat_and_power_generating_unit = "combined_heat_and_power_generating_unit"
    electrical_heater = "electrical_heater"
    heat_pump_air_waste_heat = "heat_pump_air_waste_heat"
    heat_pump_air_ambient_heat = "heat_pump_air_ambient_heat"
    heat_pump_ground_river_heat = "heat_pump_ground_river_heat"
    methanation = "methanation"


oepTypesData: dict[oemofBlockTypes, list[dict[str, str]]] = {
    oemofBlockTypes.generic_storage: [
        {"name": "storage_electricity_generic", "label": "Electricity Storage - Generic"},
        {"name": "storage_electricity_li_ion", "label": "Electricity Storage - Li-ion"},
        {"name": "storage_electricity_natrium", "label": "Electricity Storage - Natrium"},
        # {"name": "storage_electricity_pumped_hydro_storage_power_technology",
        #  "label": "Electricity Storage - Pumped Hydro Storage Power Technology"
        #  },
        {"name": "storage_gas", "label": "Gas Storage"},
        {"name": "storage_heat_district_heating", "label": "Heat Storage - District Heating"},
        {"name": "storage_heat_seasonal", "label": "Heat Storage - Seasonal"},
        {"name": "storage_heat_household", "label": "Heat Storage - Household"},
        {"name": "storage_hydrogen", "label": "Hydrogen Storage"}
    ],

    oemofBlockTypes.sink: [
        {"name": "electricity_demand_sfh", "label": "Electricity Demand - SFH"},
        {"name": "electricity_demand_electric_car", "label": "Electricity Demand - Electric Car"},
        {"name": "electricity_demand_industry", "label": "Electricity Demand - Industry"},
        {"name": "heat_demand_sfh", "label": "Heat Demand - SFH"},
        {"name": "heat_demand_industry_room", "label": "Heat Demand - Industry (Room Heating)"},
        {"name": "heat_demand_industry_process", "label": "Heat Demand - Industry (Process Heat)"},
        {"name": "demand_g0", "label": "Generic Demand - G0"},
        {"name": "demand_g3", "label": "Generic Demand - G3"},
        {"name": "demand_ha4", "label": "Generic Demand - HA4"},
        {"name": "demand_t24", "label": "Generic Demand - T24"},
    ],

    oemofBlockTypes.source: [
        {"name": "run_river_power_plant", "label": "Power Plant - River Run"},
        {"name": "solar_thermal_power_plant", "label": "Power Plant - Solar Thermal"},
        {"name": "onshore_wind_power_plant", "label": "Power Plant - Wind Onshore"},
        {"name": "openfield_photovoltaic_power_plant", "label": "Power Plant - Photovoltaic Openfield"},
        {"name": "rooftop_photovoltaic_power_plant", "label": "Power Plant - Photovoltaic Rooftop"},
    ],
    oemofBlockTypes.converter: [
        {"name": "power_to_liquid_system", "label": "Power to Liquid System"},
        {"name": "biogas_combined_heat_and_power_plant", "label": "Combined Heat and Power Plant - Biogas"},
        {"name": "biomass_combined_heat_and_power_plant", "label": "Combined Heat and Power Plant - Biomass"},
        {"name": "biomass_heating_plant", "label": "Heating Plant - Biomass"},
        {"name": "biomass_power_plant", "label": "Power Plant - Biomass"},
        {"name": "biomass_to_liquid_system_substrat", "label": "Biomass to Liquid System - Substrat"},
        {"name": "biomethane_injection_plant", "label": "Biomethane Injection Plant"},
        {"name": "combined_heat_and_power_generating_unit", "label": "Combined Heat and Power Plant - Fossil"},
        {"name": "electrical_heater", "label": "Electrical Heater"},
        {"name": "heat_pump_air_waste_heat", "label": "Heat Pump - Air Waste Heat"},
        {"name": "heat_pump_air_ambient_heat", "label": "Heat Pump - Air Ambient Heat"},
        {"name": "heat_pump_ground_river_heat", "label": "Heat Pump - Ground River Heat"},
        {"name": "methanation", "label": "Methanation"}
    ]
}
