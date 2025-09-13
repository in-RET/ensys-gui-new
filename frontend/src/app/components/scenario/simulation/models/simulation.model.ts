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
