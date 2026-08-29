export interface SimulationResModel {
    id: number;
    start_date: string;
    end_date: string;
    sim_token: string;
    status_message: string;
    status: SimulationStatus;
    scenario_id: number;
}

export enum SimulationStatus {
    STARTED = 1,
    FINISHED = 2,
    FAILED = 3,
    STOPPED = 4,
}

export interface SimulationResultModel {
    static: StaticResultModel[];
    graphs: GraphResultModel[];
}

export interface StaticResultModel {
    name: string;
    value: number;
    unit: string;
    type: string;
}

export interface GraphResultModel {
    name: string;
    index: string[];
    data: GraphDataModel[];
}

export interface GraphDataModel {
    name: string;
    data: number[];
}

export interface ResultGroup {
    type: string;
    items: StaticResultModel[];
}
