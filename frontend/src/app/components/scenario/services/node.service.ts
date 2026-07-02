import { Injectable } from '@angular/core';
import { IconType } from '../models/node.model';

@Injectable({
    providedIn: 'root',
})
export class NodeService {
    private iconList: Record<string, IconType[]> = {
        source: [
            {
                name: 'default',
                label: 'Default',
                icon: 'default',
            },
            {
                name: 'run_river_power_plant',
                label: 'Power Plant - River Run',
                icon: 'power_plant_river_run',
            },
            {
                name: 'solar_thermal_power_plant',
                label: 'Power Plant - Solar Thermal',
                icon: 'power_plant_solar_thermal',
            },
            {
                name: 'onshore_wind_power_plant',
                label: 'Power Plant - Wind Onshore',
                icon: 'power_plant_wind_onshore',
            },
            {
                name: 'openfield_photovoltaic_power_plant',
                label: 'Power Plant - Photovoltaic Openfield',
                icon: 'power_plant_photovoltaic_openfield',
            },
            {
                name: 'rooftop_photovoltaic_power_plant',
                label: 'Power Plant - Photovoltaic Rooftop',
                icon: 'power_plant_photovoltaic_rooftop',
            },
        ],
        transformer: [
            {
                name: 'default',
                label: 'Default',
                icon: 'default',
            },
            {
                name: 'power_to_liquid_system',
                label: 'Power to Liquid System',
                icon: 'power_to_liquid',
            },
            {
                name: 'biogas_combined_heat_and_power_plant',
                label: 'Combined Heat and Power Plant - Biogas',
                icon: 'combined_heat_and_power_plant_biogas',
            },
            {
                name: 'biomass_combined_heat_and_power_plant',
                label: 'Combined Heat and Power Plant - Biomass',
                icon: 'combined_heat_and_power_plant_biomass',
            },
            {
                name: 'biomass_heating_plant',
                label: 'Heating Plant - Biomass',
                icon: 'heating_plant_biomass',
            },
            {
                name: 'biomass_power_plant',
                label: 'Power Plant - Biomass',
                icon: 'power_plant_biomass',
            },
            {
                name: 'biomass_to_liquid_system_substrat',
                label: 'Biomass to Liquid System - Substrat',
                icon: 'biomass_to_liquid_system_substrat',
            },
            {
                name: 'biomethane_injection_plant',
                label: 'Biomethane Injection Plant',
                icon: 'biomethane_injection_plant',
            },
            {
                name: 'combined_heat_and_power_generating_unit',
                label: 'Combined Heat and Power Plant - Fossil',
                icon: 'combined_heat_and_power_generating_unit',
            },
            {
                name: 'electrical_heater',
                label: 'Electrical Heater',
                icon: 'electrical_heater',
            },
            {
                name: 'heat_pump_air_waste_heat',
                label: 'Heat Pump - Air Waste Heat',
                icon: 'heat_pump_air_waste_heat',
            },
            {
                name: 'heat_pump_air_ambient_heat',
                label: 'Heat Pump - Air Ambient Heat',
                icon: 'heat_pump_air_ambient_heat',
            },
            {
                name: 'heat_pump_ground_river_heat',
                label: 'Heat Pump - Ground River Heat',
                icon: 'heat_pump_air_ambient_heat',
            },
            {
                name: 'methanation',
                label: 'Methanation',
                icon: 'methanation',
            },
        ],
        genericStorage: [
            {
                name: 'default',
                label: 'Default',
                icon: 'default',
            },
            {
                name: 'storage_electricity_generic',
                label: 'Electricity Storage - Generic',
                icon: 'electricity_storage_generic',
            },
            {
                name: 'storage_electricity_li_ion',
                label: 'Electricity Storage - Li-ion',
                icon: 'electricity_storage_li_ion',
            },
            {
                name: 'storage_electricity_natrium',
                label: 'Electricity Storage - Natrium',
                icon: 'electricity_storage_generic',
            },
            {
                name: 'storage_gas',
                label: 'Gas Storage',
                icon: 'gas_storage',
            },
            {
                name: 'storage_heat_district_heating',
                label: 'Heat Storage - District Heating',
                icon: 'heat_storage_district_heating',
            },
            {
                name: 'storage_heat_seasonal',
                label: 'Heat Storage - Seasonal',
                icon: 'heat_storage_seasonal',
            },
            {
                name: 'storage_heat_household',
                label: 'Heat Storage - Household',
                icon: 'heat_storage_household',
            },
            {
                name: 'storage_hydrogen',
                label: 'Hydrogen Storage',
                icon: 'hydrogen_storage',
            },
        ],
        sink: [
            {
                name: 'default',
                label: 'Default',
                icon: 'default',
            },
            {
                name: 'electricity_demand_sfh',
                label: 'Electricity Demand - SFH',
                icon: 'electricity_demand_sfh',
            },
            {
                name: 'electricity_demand_electric_car',
                label: 'Electricity Demand - Electric Car',
                icon: 'electricity_demand_electric_car',
            },
            {
                name: 'electricity_demand_industry',
                label: 'Electricity Demand - Industry',
                icon: 'electricity_demand_industry',
            },
            {
                name: 'heat_demand_sfh',
                label: 'Heat Demand - SFH',
                icon: 'heat_demand_sfh',
            },
            {
                name: 'heat_demand_industry_room',
                label: 'Heat Demand - Industry (Room Heating)',
                icon: 'heat_demand_industry_room',
            },
            {
                name: 'heat_demand_industry_process',
                label: 'Heat Demand - Industry (Process Heat)',
                icon: 'heat_demand_industry_process',
            },
            {
                name: 'demand_g0',
                label: 'Generic Demand - G0',
                icon: 'default',
            },
            {
                name: 'demand_g3',
                label: 'Generic Demand - G3',
                icon: 'default',
            },
            {
                name: 'demand_ha4',
                label: 'Generic Demand - HA4',
                icon: 'default',
            },
            {
                name: 'demand_t24',
                label: 'Generic Demand - T24',
                icon: 'default',
            },
        ],
    };

    constructor() {}

    getNodeIcons(): Record<string, IconType[]> {
        return this.iconList || [];
    }

    getNodeIconsByType(nodeType: string): IconType[] {
        //  {
        // name
        // value
        // }
        return this.iconList[nodeType] || [];
    }
}
