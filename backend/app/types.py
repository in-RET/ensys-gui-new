# TODO: Automatisch generieren aus Dateiordner
from enum import Enum


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
    # storages
    storage_electricity = ("storage_electricity", "generic_storage")
    storage_electricity_pumped_hydro_storage_power_technology = (
        "storage_electricity_pumped_hydro_storage_power_technology", "generic_storage")
    storage_gas = ("storage_gas", "generic_storage")
    storage_heat_district_heating = ("storage_heat_district_heating", "generic_storage")
    storage_heat_seasonal = ("storage_heat_seasonal", "generic_storage")
    storage_hydrogen = ("storage_hydrogen", "generic_storage")
    
    # sinks
    electricity_export = ("electricity_export", "sink")

    electricity_demand_efh = ("electricity_demand_efh", "sink")
    electricity_demand_industry = ("electricity_demand_industry", "sink")
    electricity_demand_mfh = ("electricity_demand_mfh", "sink")
    heat_demand_efh = ("heat_demand_efh", "sink")
    heat_demand_industry = ("heat_demand_industry", "sink")
    heat_demand_mfh = ("heat_demand_mfh", "sink")
    
    # sources
    hydrogen_feed_in = ("hydrogen_feed_in", "source")
    run_river_power_plant = ("run_river_power_plant", "source")
    solar_thermal_power_plant = ("solar_thermal_power_plant", "source")
    onshore_wind_power_plant_east_th = ("onshore_wind_power_plant_east_th", "source")
    onshore_wind_power_plant_middle_th = ("onshore_wind_power_plant_middle_th", "source")
    onshore_wind_power_plant_north_th = ("onshore_wind_power_plant_north_th", "source")
    onshore_wind_power_plant_swest_th = ("onshore_wind_power_plant_swest_th", "source")
    openfield_photovoltaic_power_plant_east_th = ("openfield_photovoltaic_power_plant_east_th", "source")
    openfield_photovoltaic_power_plant_middle_th = ("openfield_photovoltaic_power_plant_middle_th", "source")
    openfield_photovoltaic_power_plant_north_th = ("openfield_photovoltaic_power_plant_north_th", "source")
    openfield_photovoltaic_power_plant_swest_th = ("openfield_photovoltaic_power_plant_swest_th", "source")
    rooftop_photovoltaic_power_plant_east_th = ("rooftop_photovoltaic_power_plant_east_th", "source")
    rooftop_photovoltaic_power_plant_middle_th = ("rooftop_photovoltaic_power_plant_middle_th", "source")
    rooftop_photovoltaic_power_plant_north_th = ("rooftop_photovoltaic_power_plant_north_th", "source")
    rooftop_photovoltaic_power_plant_swest_th = ("rooftop_photovoltaic_power_plant_swest_th", "source")
    
    # converters
    power_to_liquid_system = ("power_to_liquid_system", "converter")
    fuel_cells = ("fuel_cells", "converter")
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
