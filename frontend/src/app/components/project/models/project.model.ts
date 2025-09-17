import { ScenarioModel } from '../../scenario/models/scenario.model';

export interface ProjectReqModel {
    country: string;
    currency: string; // e.g. "EUR"
    date_created: string; // ISO datetime string
    date_updated: string | null; // can be null
    description: string;
    is_favorite: boolean;
    latitude: number;
    longitude: number;
    name: string;
    unit_co2: string; // e.g. "t CO2"
    unit_energy: string; // e.g. "MW/MWh"
}

export interface ProjectResModel {
    country: string;
    currency: string; // e.g. "EUR"
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
    currency: string; // e.g. "EUR"
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
