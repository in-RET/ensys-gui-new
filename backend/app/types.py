from enum import Enum


class oemofBlockTypes(Enum):
    generic_storage = "generic_storage"
    sink = "sink"
    source = "source"
    converter = "converter"


class oepTypes(Enum):
    # Storages
    test_storage = "test_storage"
    storage_electricity_generic = "storage_electricity_generic"
    storage_electricity_li_ion = "storage_electricity_li_ion"
    storage_electricity_natrium = "storage_electricity_natrium"
    storage_electricity_pumped_hydro_storage_power_technology = "storage_electricity_pumped_hydro_storage_power_technology"
    storage_gas = "storage_gas"
    storage_heat_district_heating = "storage_heat_district_heating"
    storage_heat_seasonal = "storage_heat_seasonal"
    storage_hydrogen = "storage_hydrogen"

    # Sinks
    test_sink = "test_sink"
    electricity_export = "electricity_export"
    electricity_demand_efh = "electricity_demand_efh"
    # electricity_demand_industry = "electricity_demand_industry"
    # electricity_demand_mfh = "electricity_demand_mfh"
    heat_demand_efh = "heat_demand_efh"
    # heat_demand_industry = "heat_demand_industry"
    # heat_demand_mfh = "heat_demand_mfh"

    # Sources
    test_source = "test_source"
    hydrogen_feed_in = "hydrogen_feed_in"
    run_river_power_plant = "run_river_power_plant"
    solar_thermal_power_plant = "solar_thermal_power_plant"
    onshore_wind_power_plant = "onshore_wind_power_plant"
    openfield_photovoltaic_power_plant = "openfield_photovoltaic_power"
    rooftop_photovoltaic_power_plant = "rooftop_photovoltaic_power"

    # Converters
    test_converter = "test_converter"
    power_to_liquid_system = "power_to_liquid_system"
    #fuel_cells = "fuel_cells"
    biogas_combined_heat_and_power_plant = "biogas_combined_heat_and_power_plant"
    biomass_combined_heat_and_power_plant = "biomass_combined_heat_and_power_plant"
    biomass_heating_plant = "biomass_heating_plant"
    biomass_power_plant = "biomass_power_plant"
    biomass_to_liquid_system_substrat = "biomass_to_liquid_system_substrat"
    biomethane_injection_plant = "biomethane_injection_plant"
    combined_heat_and_power_generating_unit = "combined_heat_and_power_generating_unit"
    electrical_heater = "electrical_heater"
    #electrolysis = "electrolysis"
    heat_pump_air_waste_heat = "heat_pump_air_waste_heat"
    heat_pump_air_ambient_heat = "heat_pump_air_ambient_heat"
    heat_pump_ground_river_heat = "heat_pump_ground_river_heat"
    methanation = "methanation"


oepTypesData: dict[oemofBlockTypes, list[dict[str, str]]] = {
    oemofBlockTypes.generic_storage: [
        {"name": "test_storage", "label": "Generic Test Storage"},
        {"name": "storage_electricity_generic", "label": "Electricity Storage - Generic"},
        {"name": "storage_electricity_li_ion", "label": "Electricity Storage - Li-ion"},
        {"name": "storage_electricity_natrium", "label": "Electricity Storage - Natrium"},
        {"name" : "storage_electricity_pumped_hydro_storage_power_technology",
         "label": "Electricity Storage - Pumped Hydro Storage Power Technology"
        },
        {"name": "storage_gas", "label": "Gas Storage"},
        {"name": "storage_heat_district_heating", "label": "Heat Storage - District Heating"},
        {"name": "storage_heat_seasonal", "label": "Heat Storage - Seasonal"},
        {"name": "storage_hydrogen", "label": "Hydrogen Storage"}
    ],

    oemofBlockTypes.sink           : [
        {"name": "test_sink", "label": "Generic Test Sink"},
        {"name": "electricity_export", "label": "Electricity Export to Grid"},
        {"name": "electricity_demand_efh", "label": "Electricity Demand - EFH"},
        # {"name": "electricity_demand_industry", "label": "Electricity Demand - Industry"},
        # {"name": "electricity_demand_mfh", "label": "Electricity Demand - MFH"},
        {"name": "heat_demand_efh", "label": "Heat Demand - EFH"},
        # {"name": "heat_demand_industry", "label": "Heat Demand - Industry"},
        # {"name": "heat_demand_mfh", "label": "Heat Demand - MFH"},
    ],

    oemofBlockTypes.source         : [
        {"name": "test_source", "label": "Generic Test Source"},
        {"name": "hydrogen_feed_in", "label": "Hydrogen Feed In"},
        {"name": "run_river_power_plant", "label": "Power Plant - River Run"},
        {"name": "solar_thermal_power_plant", "label": "Power Plant - Solar Thermal"},
        {"name": "onshore_wind_power_plant", "label": "Power Plant - Wind Onshore"},
        {"name": "openfield_photovoltaic_power_plant", "label": "Power Plant - Photovoltaic Openfield"},
        {"name": "rooftop_photovoltaic_power_plant", "label": "Power Plant - Photovoltaic Rooftop"},
    ],
    oemofBlockTypes.converter      : [
        {"name": "test_converter", "label": "Generic Test Converter"},
        {"name": "power_to_liquid_system", "label": "Power to Liquid System"},
        #{"name": "fuel_cells", "label": "Fuel Cell"},
        {"name": "biogas_combined_heat_and_power_plant", "label": "Combined Heat and Power Plant - Biogas"},
        {"name": "biomass_combined_heat_and_power_plant", "label": "Combined Heat and Power Plant - Biomass"},
        {"name": "biomass_heating_plant", "label": "Heating Plant - Biomass"},
        {"name": "biomass_power_plant", "label": "Power Plant - Biomass"},
        {"name": "biomass_to_liquid_system_substrat", "label": "Biomass to Liquid System - Substrat"},
        {"name": "biomethane_injection_plant", "label": "Biomethane Injection Plant"},
        {"name": "combined_heat_and_power_generating_unit", "label": "Combined Heat and Power Plant - Other"},
        {"name": "electrical_heater", "label": "Electrical Heater"},
        #{"name": "electrolysis", "label": "Electrolysis"},
        {"name": "heat_pump_air_waste_heat", "label": "Heat Pump - Air Waste Heat"},
        {"name": "heat_pump_air_ambient_heat", "label": "Heat Pump - Air Ambient Heat"},
        {"name": "heat_pump_ground_river_heat", "label": "Heat Pump - Ground River Heat"},
        {"name": "methanation", "label": "Methanation"}
    ]
}
