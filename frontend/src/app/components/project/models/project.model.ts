import { ScenarioModel } from '../../scenario/models/scenario.model';

export interface ProjectReqModel {}

export interface ProjectResModel {
    country: string;
    unit_currency: string; // e.g. "EUR"
    date_created: string; // ISO datetime string
    date_updated: string | null; // can be null
    description: string;
    id: number;
    is_favorite: boolean;
    latitude: number;
    longitude: number;
    name: string;
    unit_co2: string; // e.g. "t CO2"
    unit_energy: string; // e.g. "MW/MWh"
}

export interface ProjectModel {
    country: string;
    unit_currency: string; // e.g. "EUR"
    date_created: string; // ISO datetime string
    date_updated: string | null; // can be null
    description: string;
    id: number;
    is_favorite: boolean;
    latitude: number;
    longitude: number;
    name: string;
    unit_co2: string; // e.g. "t CO2"
    unit_energy: string; // e.g. "MW/MWh"
    scenarioList?: ScenarioModel[];
}

export enum EnergyUnit {
    KW = 'KW/KWh',
    MW = 'MW/MWh',
}
