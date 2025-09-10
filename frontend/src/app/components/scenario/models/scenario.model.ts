import { ProjectModel } from '../../project/models/project.model';

export interface CurrentScenarioModel {
    project: ProjectModel;
    scenario: ScenarioModel;
}

export interface ScenarioReqModel {
    name: string;
    start_date: string; // ISO date string (e.g., "2025-01-01")
    time_steps: number;
    interval: number;
    modeling_data: string; // looks like JSON stored as string
    project_id?: number;
    user_id?: number;
}

export interface ScenarioResModel {
    id: number;
    name: string;
    project_id: number;
    sDate: string; // ISO date string (e.g., "2025-01-01")
    interval: number;
    modeling_data: string; // looks like JSON stored as string
    timeStep: number;
    user_id?: number;
}

export interface ScenarioModel {
    id: number;
    name: string;
    project_id: number;
    project_name?: string;
    sDate: string; // ISO date string (e.g., "2025-01-01")
    interval: number;
    timeStep: number;
    modeling_data?: string; // looks like JSON stored as string
}

export interface ScenarioBaseInfoModel {
    project: {
        id: number;
        name: string;
        scenarioList: ScenarioModel[];
    };
    scenario?: {
        id?: number;
        name: string;
        sDate: string;
        timeStep: number;
        interval: number;
        simulationYear: number;
    };
    modeling_data?: string; // looks like JSON stored as string
}
