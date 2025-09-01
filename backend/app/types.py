from enum import Enum


class oemofBlockTypes(Enum):
    generic_storage = "generic_storage"
    sink = "sink"
    source = "source"
    converter = "converter"


class oepTypes(Enum):
    # Storages
    test_storage = "test_storage"
    storage_electricity = "storage_electricity"
    storage_electricity_pumped_hydro_storage_power_technology = "storage_electricity_pumped_hydro_storage_power_technology"
    storage_gas = "storage_gas"
    storage_heat_district_heating = "storage_heat_district_heating"
    storage_heat_seasonal = "storage_heat_seasonal"
    storage_hydrogen = "storage_hydrogen"

    # Sinks
    test_sink = "test_sink"
    electricity_export = "electricity_export"
    electricity_demand_efh = "electricity_demand_efh"
    electricity_demand_industry = "electricity_demand_industry"
    electricity_demand_mfh = "electricity_demand_mfh"
    heat_demand_efh = "heat_demand_efh"
    heat_demand_industry = "heat_demand_industry"
    heat_demand_mfh = "heat_demand_mfh"

    # Sources
    test_source = "test_source"
    hydrogen_feed_in = "hydrogen_feed_in"
    run_river_power_plant = "run_river_power_plant"
    solar_thermal_power_plant = "solar_thermal_power_plant"
    onshore_wind_power_plant_east_th = "onshore_wind_power_plant_east_th"
    onshore_wind_power_plant_middle_th = "onshore_wind_power_plant_middle_th"
    onshore_wind_power_plant_north_th = "onshore_wind_power_plant_north_th"
    onshore_wind_power_plant_swest_th = "onshore_wind_power_plant_swest_th"
    openfield_photovoltaic_power_plant_east_th = "openfield_photovoltaic_power_plant_east_th"
    openfield_photovoltaic_power_plant_middle_th = "openfield_photovoltaic_power_plant_middle_th"
    openfield_photovoltaic_power_plant_north_th = "openfield_photovoltaic_power_plant_north_th"
    openfield_photovoltaic_power_plant_swest_th = "openfield_photovoltaic_power_plant_swest_th"
    rooftop_photovoltaic_power_plant_east_th = "rooftop_photovoltaic_power_plant_east_th"
    rooftop_photovoltaic_power_plant_middle_th = "rooftop_photovoltaic_power_plant_middle_th"
    rooftop_photovoltaic_power_plant_north_th = "rooftop_photovoltaic_power_plant_north_th"
    rooftop_photovoltaic_power_plant_swest_th = "rooftop_photovoltaic_power_plant_swest_th"

    # Converters
    test_converter = "test_converter"
    power_to_liquid_system = "power_to_liquid_system"
    fuel_cells = "fuel_cells"
    biogas_combined_heat_and_power_plant = "biogas_combined_heat_and_power_plant"
    biogas_upgrading_plant = "biogas_upgrading_plant"
    biomass_combined_heat_and_power_plant = "biomass_combined_heat_and_power_plant"
    biomass_heating_plant = "biomass_heating_plant"
    biomass_power_plant = "biomass_power_plant"
    biomass_to_liquid_system = "biomass_to_liquid_system"
    biomethane_injection_plant = "biomethane_injection_plant"
    combined_heat_and_power_generating_unit = "combined_heat_and_power_generating_unit"
    electrical_heater = "electrical_heater"
    electrolysis = "electrolysis"
    heat_pump_air_waste_heat = "heat_pump_air_waste_heat"
    heat_pump_air_ambient_heat = "heat_pump_air_ambient_heat"
    heat_pump_ground_river_heat = "heat_pump_ground_river_heat"
    methanation = "methanation"


oepTypesData: dict[oemofBlockTypes, list[dict[str, str | None]]] = {
    oemofBlockTypes.generic_storage: [
        {"name": "test_storage", "label": "Generic Test Storage"},
        {"name": "storage_electricity", "label": None},
        {"name": "storage_electricity_pumped_hydro_storage_power_technology", "label": None},
        {"name": "storage_gas", "label": None},
        {"name": "storage_heat_district_heating", "label": None},
        {"name": "storage_heat_seasonal", "label": None},
        {"name": "storage_hydrogen", "label": None}
    ],

    oemofBlockTypes.sink           : [
        {"name": "test_sink", "label": "Generic Test Sink"},
        {"name": "electricity_export", "label": "Electricity Export to Grid"},
        {"name": "electricity_demand_efh", "label": None},
        {"name": "electricity_demand_industry", "label": None},
        {"name": "electricity_demand_mfh", "label": None},
        {"name": "heat_demand_efh", "label": None},
        {"name": "heat_demand_industry", "label": None},
        {"name": "heat_demand_mfh", "label": None}
    ],

    oemofBlockTypes.source         : [
        {"name": "test_source", "label": "Generic Test Source"},
        {"name": "hydrogen_feed_in", "label": None},
        {"name": "run_river_power_plant", "label": None},
        {"name": "solar_thermal_power_plant", "label": None},
        {"name": "onshore_wind_power_plant_east_th", "label": None},
        {"name": "onshore_wind_power_plant_middle_th", "label": None},
        {"name": "onshore_wind_power_plant_north_th", "label": None},
        {"name": "onshore_wind_power_plant_swest_th", "label": None},
        {"name": "openfield_photovoltaic_power_plant_east_th", "label": None},
        {"name": "openfield_photovoltaic_power_plant_middle_th", "label": None},
        {"name": "openfield_photovoltaic_power_plant_north_th", "label": None},
        {"name": "openfield_photovoltaic_power_plant_swest_th", "label": None},
        {"name": "rooftop_photovoltaic_power_plant_east_th", "label": None},
        {"name": "rooftop_photovoltaic_power_plant_middle_th", "label": None},
        {"name": "rooftop_photovoltaic_power_plant_north_th", "label": None},
        {"name": "rooftop_photovoltaic_power_plant_swest_th", "label": None}
    ],
    oemofBlockTypes.converter      : [
        {"name": "test_converter", "label": "Generic Test Converter"},
        {"name": "power_to_liquid_system", "label": None},
        {"name": "fuel_cells", "label": None},
        {"name": "biogas_combined_heat_and_power_plant", "label": None},
        {"name": "biogas_upgrading_plant", "label": None},
        {"name": "biomass_combined_heat_and_power_plant", "label": None},
        {"name": "biomass_heating_plant", "label": None},
        {"name": "biomass_power_plant", "label": None},
        {"name": "biomass_to_liquid_system", "label": None},
        {"name": "biomethane_injection_plant", "label": None},
        {"name": "combined_heat_and_power_generating_unit", "label": None},
        {"name": "electrical_heater", "label": None},
        {"name": "electrolysis", "label": None},
        {"name": "heat_pump_air_waste_heat", "label": None},
        {"name": "heat_pump_air_ambient_heat", "label": None},
        {"name": "heat_pump_ground_river_heat", "label": None},
        {"name": "methanation", "label": None}
    ]
}
