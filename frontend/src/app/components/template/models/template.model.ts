import {ScenarioModel} from '../../scenario/models/scenario.model';

export interface TemplateModel {
    country: string;
    currency: string; // e.g. "EUR"
    description: string;
    latitude: number;
    longitude: number;
    id: number;
    name: string;
    unit_co2: string; // e.g. "t CO2"
    unit_energy: string; // e.g. "MW/MWh"
    scenarioList?: ScenarioModel[];
}

export interface TemplateResModel {
    country: string;
    currency: string; // e.g. "EUR"
    description: string;
    id: number;
    latitude: number;
    longitude: number;
    name: string;
    unit_co2: string; // e.g. "t CO2"
    unit_energy: string; // e.g. "MW/MWh"
}
