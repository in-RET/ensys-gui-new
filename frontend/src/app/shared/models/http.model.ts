export interface ResModel<T> {
    data: ResDataModel<T>;
    success: boolean;
    error: ErrorModel[];
}

interface ErrorModel {
    code: number;
    message: string;
}

export interface ResDataModel<T> {
    items: T[];
    totalCount: number;
}
