import { DrawflowNode } from 'drawflow';
import { ProjectModel } from '../../project/models/project.model';
import { ConstraintRow } from '../scenario-setup/constraints/models/constraints.model';

export interface CurrentScenarioModel {
    project: ProjectModel;
    scenario: ScenarioModel;
}

export interface ScenarioReqModel {
    name: string;
    start_date: number; // timestamp
    time_steps: number;
    interval: number;
    modeling_data: string | null; // looks like JSON stored as string
    project_id?: number;
    user_id?: number;
    constraints: ConstraintRow[] | string;
}

export interface ScenarioResModel {
    id: number;
    interval: number;
    name: string;
    project_id: number;
    simulation_year: number;
    start_date: number; // timestamp
    time_steps: number;
    user_id?: number;
    modeling_data: string; // looks like JSON stored as string
    constraints: string | null | {};
}

export interface ScenarioModel {
    id: number;
    interval: number;
    name: string;
    project_id: number;
    simulation_year: number;
    sDate: number;
    timeStep: number;
    modeling_data?: string; // looks like JSON stored as string
    constraints?: ConstraintRow[];
    description?: string;
}

export interface ScenarioBaseInfoModel_project {
    id: number;
    name: string;
    scenarioList?: ScenarioModel[];
}

export interface ScenarioBaseInfoModel_scenario {
    id?: number;
    name: string;
    sDate: number; // timestamp
    timeStep: number;
    interval: number;
    simulationYear: number;
    constraints: ConstraintRow[];
    modeling_data: { [nodeKey: string]: DrawflowNode } | null;
}

export interface ScenarioBaseInfoModel {
    project: ScenarioBaseInfoModel_project;
    scenario?: ScenarioBaseInfoModel_scenario;
}

// update scenario model for update scenario

export interface ScenarioUpdatedModel_project {
    id: number;
    name: string;
}

export interface ScenarioUpdatedModel_scenario {
    id: number;
    name: string;
    sDate: number; // timestamp
    timeStep: number;
    interval: number;
    simulationYear: number;
    constraints: ConstraintRow[];
    modeling_data: { [nodeKey: string]: DrawflowNode } | null;
}
export interface ScenarioUpdatedModel {
    project: ScenarioUpdatedModel_project;
    scenario: ScenarioUpdatedModel_scenario;
}

export enum UserModelingSTEP {
    SCENARIO_SETUP = 1,
    SCENARIO_MODELING = 2,
    SCENARIO_ANALYSIS = 3,
}
export interface UserModelingStateModel {
    currentStep: UserModelingSTEP;
    data: ScenarioBaseInfoModel;
    autoUpdate: boolean;
}
