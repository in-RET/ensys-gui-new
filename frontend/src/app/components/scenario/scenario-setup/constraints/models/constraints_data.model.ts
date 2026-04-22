import { ConstraintDefinition } from './constraints.model';

export const CONSTRAINT_DEFINITIONS: ConstraintDefinition[] = [
    {
        type: 'additional_investment_flow_limit',
        label: 'Additional Investment Flow Limit',
        fields: [
            { key: 'keyword', label: 'Keyword', type: 'text', required: true },
            { key: 'limit', label: 'Limit', type: 'number' },
        ],
    },
    {
        type: 'emission_limit',
        label: 'Emission Limit',
        fields: [
            {
                key: 'keyword',
                label: 'Keyword',
                type: 'text',
                required: true,
                defaultValue: 'emission_factor',
                disabled: false,
            },
            { key: 'limit', label: 'Limit', type: 'number' },
            { key: 'flows', label: 'Flows', type: 'text' },
        ],
    },
    {
        type: 'equate_flows',
        label: 'Equate Flows',
        fields: [
            {
                key: 'name',
                label: 'Name',
                type: 'text',
                defaultValue: 'equate_flows',
            },
            { key: 'flows1', label: 'Flows 1', type: 'text', required: true },
            { key: 'flows2', label: 'Flows 2', type: 'text', required: true },
            {
                key: 'factor1',
                label: 'Factor 1',
                type: 'number',
                defaultValue: 1,
            },
        ],
    },
    {
        type: 'equate_variables',
        label: 'Equate Variables',
        fields: [
            { key: 'name', label: 'Name', type: 'text', required: true },
            {
                key: 'factor1',
                label: 'Factor 1',
                type: 'text',
                required: true,
                defaultValue: 1,
            },
            { key: 'var1', label: 'Var 1', type: 'text', required: true },
            { key: 'var2', label: 'Var 2', type: 'text', required: true },
        ],
    },
    {
        type: 'generic_integral_limit',
        label: 'Generic Integral Limit',
        fields: [
            { key: 'keyword', label: 'Keyword', type: 'text', required: true },
            { key: 'flows', label: 'Flows', type: 'text' },
            { key: 'upper_limit', label: 'Upper Limit', type: 'number' },
            { key: 'lower_limit', label: 'Lower Limit', type: 'number' },
            { key: 'limit_name', label: 'Limit Name', type: 'text' },
        ],
    },
    {
        type: 'investment_limit',
        label: 'Investment Limit',
        fields: [{ key: 'limit', label: 'Limit', type: 'number' }],
    },
    {
        type: 'limit_active_flow_count',
        label: 'Limit Active Flow Count',
        fields: [
            {
                key: 'constraint_name',
                label: 'Constraint Name',
                type: 'text',
                required: true,
            },
            { key: 'flows', label: 'Flows', type: 'text', required: true },
            {
                key: 'lower_limit',
                label: 'Lower Limit',
                type: 'number',
                defaultValue: 0,
                required: true,
            },
            { key: 'upper_limit', label: 'Upper Limit', type: 'number' },
        ],
    },
    {
        type: 'limit_active_flow_count_by_keyword',
        label: 'Limit Active Flow Count by Keyword',
        fields: [
            { key: 'keyword', label: 'Keyword', type: 'text', required: true },
            {
                key: 'lower_limit',
                label: 'Lower Limit',
                type: 'number',
                defaultValue: 0,
                required: true,
            },
            { key: 'upper_limit', label: 'Upper Limit', type: 'number' },
        ],
    },
    {
        type: 'shared_limit',
        label: 'Shared Limit',
        fields: [
            {
                key: 'limit_name',
                label: 'Limit Name',
                type: 'text',
                required: true,
            },
            {
                key: 'weights',
                label: 'Weights',
                type: 'text',
                required: true,
            },
            {
                key: 'quantity ',
                label: 'Quantity',
                type: 'text',
                required: true,
            },
            {
                key: 'components',
                label: 'Components',
                type: 'text',
                required: true,
            },
            {
                key: 'upper_limit',
                label: 'Upper Limit',
                type: 'number',
                defaultValue: 0,
                required: true,
            },
            { key: 'lower_limit', label: 'Lower Limit', type: 'number' },
        ],
    },
    {
        type: 'storage_level_constraint',
        label: 'Storage Level Constraint',
        fields: [
            { key: 'name', label: 'Name', type: 'text', required: true },
            {
                key: 'storage_component',
                label: 'Storage Component',
                type: 'text',
                required: true,
            },
            {
                key: 'multiplexer_bus',
                label: 'Multiplexer Bus',
                type: 'text',
                required: true,
            },
            {
                key: 'input_levels',
                label: 'Input Levels',
                type: 'textarea',
                required: true,
            },
            {
                key: 'output_levels',
                label: 'Output Levels',
                type: 'textarea',
                required: true,
            },
        ],
    },
];
