export type ConstraintType =
    | 'additional_investment_flow_limit'
    | 'emission_limit'
    | 'equate_flows'
    | 'equate_variables'
    | 'generic_integral_limit'
    | 'investment_limit'
    | 'limit_active_flow_count'
    | 'limit_active_flow_count_by_keyword'
    | 'shared_limit'
    | 'storage_level_constraint';

export interface ConstraintFieldConfig {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    required?: boolean;
    options?: { label: string; value: any }[];
    defaultValue?: string | number | boolean;
    disabled?: boolean;
}

export interface ConstraintDefinition {
    type: ConstraintType;
    label: string;
    fields: ConstraintFieldConfig[];
}

export interface ConstraintRow {
    id: number;
    type: ConstraintType;
    values: Record<string, any>;
    enabled: boolean;
}

export interface ConstraintModel {
    key: string;
    label: string;
}
