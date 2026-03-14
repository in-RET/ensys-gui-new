import { ScenarioModel } from '../../scenario/models/scenario.model';

export interface TemplateResModel {
    id: number;
    country: string;
    latitude: number;
    unit_energy: string; // e.g. "MW/MWh"
    longitude: number;
    description: string;
    name: string;
    unit_currency: string; // e.g. "EUR"
    unit_co2: string; // e.g. "t CO2"
}
export interface TemplateModel {
    id: number;
    country: string;
    latitude: number;
    unit_energy: string; // e.g. "MW/MWh"
    longitude: number;
    description: string;
    name: string;
    unit_currency: string; // e.g. "EUR"
    unit_co2: string; // e.g. "t CO2"
    scenarioList?: ScenarioModel[];
}
