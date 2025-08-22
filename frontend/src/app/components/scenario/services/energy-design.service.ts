import { Injectable } from '@angular/core';
import { GeneralService } from '../../../shared/services/general.service';
import { FlowService } from './flow.service';

type EPCostParams = {
    capex: number;
    zinsatz: number; // interest rate (0 < zinsatz < 1)
    lifetime: number; // project lifetime in years
    opexPercentage: number; // opex as a decimal (e.g., 0.05 for 5%)
};

@Injectable({
    providedIn: 'root',
})
export class EnergyDesignService {
    constructor(
        private flowService: FlowService,
        private generalService: GeneralService
    ) {}

    private getFieldData(
        fName: string,
        editData: { mode: boolean; data?: any },
        dValue?: any
    ) {
        if (editData.mode) return editData.data[fName.toLocaleLowerCase()];
        else {
            return dValue !== null || dValue !== undefined ? dValue : null;
        }
    }

    private getField(
        name: string,
        placeholder: string,
        label: string,
        isReq: boolean,
        type: string,
        space: string,
        editMode: boolean,
        data?: any,
        classList?: string,
        callback?: any,
        options?: any[],
        disabled?: boolean,
        defaultVal?: any
    ) {
        const _field = {
            name: name,
            placeholder: placeholder,
            label: label,
            isReq: isReq,
            value: this.getFieldData(
                name,
                { mode: editMode, data },
                defaultVal
            ),
            type: type,
            span: space,
            class: classList,
            onClick: callback,
            selectOptionList: options,
            disabled: disabled,
        };

        return _field;
    }

    private getNonInvestmentFields(data: any) {
        return [
            // {
            //     name: 'nominal_value',
            //     placeholder: 'Nominal Value',
            //     label: 'Nominal Value',
            //     type: 'number',
            //     span: '',
            //     value: this.getField('nominal_value'),
            //     disabled: this.getField('investment'),
            // },
        ];
    }

    getInvestmentFields(data?: any, callback?: any) {
        return [
            {
                name: 'maximum',
                placeholder: 'maximum',
                label: 'maximum',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'minimum',
                placeholder: 'minimum',
                label: 'minimum',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'ep_costs',
                placeholder: 'ep_costs',
                label: 'ep_costs',
                type: 'number',
                span: 'auto',
                actions: [
                    {
                        name: 'ep_costs_calculator',
                        label: '',
                        icon: 'calculator',
                        onClick: () => {
                            callback['showEpCostsCalculator']();
                        },
                    },
                ],
            },
            {
                name: 'existing',
                placeholder: 'existing',
                label: 'existing',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'nonconvex',
                placeholder: 'nonconvex',
                label: 'nonconvex',
                type: 'text',
                span: 'auto',
            },
            {
                name: 'offset',
                placeholder: 'offset',
                label: 'offset',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'overall_maximum',
                placeholder: 'overall_maximum',
                label: 'overall_maximum',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'overall_minimum',
                placeholder: 'overall_minimum',
                label: 'overall_minimum',
                type: 'number',
                span: 'auto',
            },

            {
                name: 'interest_rate',
                placeholder: 'interest_rate',
                label: 'interest_rate',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'lifetime',
                placeholder: 'lifetime',
                label: 'lifetime',
                type: 'number',
                span: 'auto',
            },
        ].map((item: any) => {
            //   item['value'] = this.getField(item.name);
            item['value'] = data ? data[item.name.toLocaleLowerCase()] : null;
            item['label'] = this.generalService.convertText_uppercaseAt0(
                item['label']
            );

            return item;
        });
    }

    getDefaultFields_flow(data?: any) {
        return [
            {
                name: 'variable_costs',
                placeholder: 'variable_costs',
                label: 'variable_costs',
                type: 'range',
                span: 'auto',
            },
            {
                name: 'max',
                placeholder: 'max',
                label: 'max',
                type: 'range',
                span: 'auto',
            },
            {
                name: 'min',
                placeholder: 'min',
                label: 'min',
                type: 'range',
                span: 'auto',
            },
            {
                name: 'fix',
                placeholder: 'fix',
                label: 'fix',
                type: 'range',
                span: 'auto',
            },
            {
                name: 'positive_gradient_limit',
                placeholder: 'positive_gradient_limit',
                label: 'positive_gradient_limit',
                type: 'range',
                span: 'auto',
            },
            {
                name: 'negative_gradient_limit',
                placeholder: 'negative_gradient_limit',
                label: 'negative_gradient_limit',
                type: 'range',
                span: 'auto',
            },
            {
                name: 'fixed_costs',
                placeholder: 'fixed_costs',
                label: 'fixed_costs',
                type: 'range',
                span: 'auto',
            },

            {
                name: 'full_load_time_max',
                placeholder: 'full_load_time_max',
                label: 'full_load_time_max',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'full_load_time_min',
                placeholder: 'full_load_time_min',
                label: 'full_load_time_min',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'integer',
                placeholder: 'integer',
                label: 'integer',
                type: 'number',
                span: 'auto',
            },
            {
                name: '_nonconvex',
                placeholder: 'nonconvex',
                label: 'nonconvex',
                type: 'number',
                span: 'auto',
            },
            {
                name: '_lifetime',
                placeholder: 'lifetime',
                label: 'lifetime',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'age',
                placeholder: 'age',
                label: 'age',
                type: 'number',
                span: 'auto',
            },
        ].map((item: any) => {
            // item['value'] = this.getField(item.name);
            item['value'] = data ? data[item.name.toLocaleLowerCase()] : null;

            // check if its a range/number value
            if (item['value']) {
                const isRangeVal = item['value'].split(',').length > 1;

                if (isRangeVal) item['disabled'] = true;
            }

            item['label'] = item['label']
                .split(/[-_]/g)
                .map(
                    (word: string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLocaleLowerCase()
                )
                .join(' ')
                .trim();

            item['placeholder'] = item['placeholder']
                .split(/[-_]/g)
                .map(
                    (word: string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLocaleLowerCase()
                )
                .join(' ')
                .trim();

            return item;
        });
    }

    private getDefaultFields_storage(data: any) {
        return [
            {
                name: 'nominal_storage_capacity',
                placeholder: 'nominal_storage_capacity',
                label: 'nominal_storage_capacity',
                type: 'number',
                span: '4',
            },
            {
                name: 'invest_relation_input_capacity',
                placeholder: 'invest_relation_input_capacity',
                label: 'invest_relation_input_capacity',
                type: 'number',
                span: '4',
            },
            {
                name: 'invest_relation_output_capacity',
                placeholder: 'invest_relation_output_capacity',
                label: 'invest_relation_output_capacity',
                type: 'number',
                span: '4',
            },
            {
                name: 'invest_relation_input_output',
                placeholder: 'invest_relation_input_output',
                label: 'invest_relation_input_output',
                type: 'number',
                span: '4',
            },
            {
                name: 'initial_storage_level',
                placeholder: 'initial_storage_level',
                label: 'initial_storage_level',
                type: 'number',
                span: '4',
            },
            {
                name: 'balanced',
                placeholder: 'balanced',
                label: 'balanced',
                type: 'switch',
                span: 'auto',
                class: 'd-flex',
            },
            {
                name: 'loss_rate',
                placeholder: 'loss_rate',
                label: 'loss_rate',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'fixed_losses_relative',
                placeholder: 'fixed_losses_relative',
                label: 'fixed_losses_relative',
                type: 'number',
                span: '4',
            },
            {
                name: 'fixed_losses_absolute',
                placeholder: 'fixed_losses_absolute',
                label: 'fixed_losses_absolute',
                type: 'number',
                span: '4',
            },
            {
                name: 'inflow_conversion_factor',
                placeholder: 'inflow_conversion_factor',
                label: 'inflow_conversion_factor',
                type: 'number',
                span: '4',
            },
            {
                name: 'outflow_conversion_factor',
                placeholder: 'outflow_conversion_factor',
                label: 'outflow_conversion_factor',
                type: 'number',
                span: '4',
            },
            {
                name: 'min_storage_level',
                placeholder: 'min_storage_level',
                label: 'min_storage_level',
                type: 'number',
                span: '4',
            },
            {
                name: 'max_storage_level',
                placeholder: 'max_storage_level',
                label: 'max_storage_level',
                type: 'number',
                span: '4',
            },
            {
                name: 'storage_costs',
                placeholder: 'storage_costs',
                label: 'storage_costs',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'lifetime_inflow',
                placeholder: 'lifetime_inflow',
                label: 'lifetime_inflow',
                type: 'number',
                span: 'auto',
            },
            {
                name: 'lifetime_outflow',
                placeholder: 'lifetime_outflow',
                label: 'lifetime_outflow',
                type: 'number',
                span: 'auto',
            },
        ].map((item: any) => {
            item['value'] = data ? data[item.name.toLocaleLowerCase()] : null;
            item['label'] = item['label']
                .split(/[-_]/g)
                .map(
                    (word: string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLocaleLowerCase()
                )
                .join(' ')
                .trim();
            return item;
        });
    }

    private storagePreList: any[] = [
        {
            name: 'Sodium storage',
            value: 'Sodium storage',
        },
        {
            name: 'Lithium Ion Battery Storage',
            value: 'Lithium Ion Battery Storage',
        },
        {
            name: 'Pumped storage power plant',
            value: 'Pumped storage power plant',
        },
        {
            name: 'Heat storage (seasonal)',
            value: 'Heat storage (seasonal)',
        },
        {
            name: 'Heat storage (short term)',
            value: 'Heat storage (short term)',
        },
        {
            name: 'Gas storage',
            value: 'Gas storage',
        },
        {
            name: 'Hydrogen storage',
            value: 'Hydrogen storage',
        },
        {
            name: 'Other',
            value: 'Other',
        },
    ];

    getFormData(
        type: string,
        name: string,
        editMode: boolean,
        data?: any,
        callback?: any
    ) {
        let fields = null;

        const getFields_node = () => {
            switch (name.toLocaleLowerCase()) {
                case 'source':
                    return {
                        sections: [
                            {
                                name: 'info',
                                class: 'col-12',
                                fields: [
                                    this.getField(
                                        'name',
                                        'Name',
                                        'Name',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),
                                    this.getField(
                                        'outputPort_name',
                                        'Name',
                                        'Port(Out)',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),
                                ],
                            },
                        ],
                    };

                case 'Pre-source':
                case 'predefinedsource':
                    return {
                        sections: [
                            {
                                name: 'Name',
                                class: 'col-6',
                                fields: [
                                    // {
                                    //     name: 'name',
                                    //     placeholder: 'Name',
                                    //     label: 'Name',
                                    //     isReq: true,
                                    //     value: getField('name'),
                                    //     type: 'text',
                                    // },
                                ],
                            },
                            {
                                name: 'Source',
                                class: 'col-6',
                                fields: [
                                    {
                                        // name: 'source',
                                        // placeholder: 'Source',
                                        // label: 'Choose...',
                                        // isReq: true,
                                        // value: getField('source'),
                                        // type: 'select',
                                        // options: [
                                        //     {
                                        //         name: 'Wind power plant',
                                        //         value: 'Wind power plant',
                                        //     },
                                        //     {
                                        //         name: 'Ground Mounted Photovoltaic',
                                        //         value: 'Ground Mounted Photovoltaic',
                                        //     },
                                        //     {
                                        //         name: 'Roof Mounted Photovoltaic',
                                        //         value: 'Roof Mounted Photovoltaic',
                                        //     },
                                        //     {
                                        //         name: 'Import from the power grid',
                                        //         value: 'Import from the power grid',
                                        //     },
                                        //     {
                                        //         name: 'Biomass supply',
                                        //         value: 'Biomass supply',
                                        //     },
                                        //     {
                                        //         name: 'Solar thermal system',
                                        //         value: 'Solar thermal system',
                                        //     },
                                        //     {
                                        //         name: 'Run-of-river power plant',
                                        //         value: 'Run-of-river power plant',
                                        //     },
                                        //     {
                                        //         name: 'Other',
                                        //         value: 'Other',
                                        //     },
                                        // ],
                                    },
                                ],
                            },
                        ],
                    };

                case 'transformer':
                    return {
                        sections: [
                            {
                                name: 'Name',
                                class: 'col-6',
                                fields: [
                                    this.getField(
                                        'name',
                                        'Name',
                                        'Name',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),
                                ],
                            },
                        ],
                    };

                case 'Pre-transformer':
                case 'predefinedtransformer':
                    return {
                        sections: [
                            {
                                name: 'Name',
                                class: 'col-6',
                                fields: [
                                    {
                                        // name: 'name',
                                        // placeholder: 'Name',
                                        // label: 'Name',
                                        // isReq: true,
                                        // value: getField('name'),
                                        // type: 'text',
                                    },
                                ],
                            },
                            {
                                name: 'Trafo',
                                class: 'col-6',
                                fields: [
                                    {
                                        // name: 'trafo',
                                        // placeholder: 'Trafo',
                                        // label: 'Choose...',
                                        // isReq: true,
                                        // value: getField('trafo'),
                                        // type: 'select',
                                        // options: [
                                        //     {
                                        //         name: 'Biogas CHP',
                                        //         value: 'Biogas CHP',
                                        //     },
                                        //     {
                                        //         name: 'Biogas injection (New facility)',
                                        //         value: 'Biogas injection (New facility)',
                                        //     },
                                        //     {
                                        //         name: 'Gas and steam power plant',
                                        //         value: 'Gas and steam power plant',
                                        //     },
                                        //     {
                                        //         name: 'Power to Liquid',
                                        //         value: 'Power to Liquid',
                                        //     },
                                        //     {
                                        //         name: 'Methanisation',
                                        //         value: 'Methanisation',
                                        //     },
                                        //     {
                                        //         name: 'Electrolysis',
                                        //         value: 'Electrolysis',
                                        //     },
                                        //     {
                                        //         name: 'Fuel cell',
                                        //         value: 'Fuel cell',
                                        //     },
                                        //     {
                                        //         name: 'Air source heat pump (large-scale)',
                                        //         value: 'Air source heat pump (large-scale)',
                                        //     },
                                        //     {
                                        //         name: 'Electrode heating boiler',
                                        //         value: 'Electrode heating boiler',
                                        //     },
                                        //     {
                                        //         name: 'Other',
                                        //         value: 'Other',
                                        //     },
                                        // ],
                                    },
                                ],
                            },
                        ],
                    };

                case 'genericstorage':
                    return {
                        sections: [
                            {
                                name: 'info',
                                class: 'col-12',
                                fields: [
                                    this.getField(
                                        'inputPort_name',
                                        'Name',
                                        'Port(In)',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),

                                    this.getField(
                                        'name',
                                        'Name',
                                        'Name',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),

                                    this.getField(
                                        'outputPort_name',
                                        'Name',
                                        'Port(Out)',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'OEP',
                                class: 'col-12',
                                fields: [
                                    this.getField(
                                        'oep',
                                        'Switch On/Off',
                                        'OEP',
                                        false,
                                        'switch',
                                        'auto',
                                        editMode,
                                        data,
                                        'pt-3',
                                        () => {
                                            callback['']([
                                                'non-OEP',
                                                'non-investment',
                                                'investment',
                                                'defaults',
                                            ]);

                                            callback['toggleFomFields']([
                                                'storage',
                                            ]);
                                        },
                                        undefined,
                                        undefined,
                                        true
                                    ),

                                    this.getField(
                                        'storage',
                                        'Storage',
                                        'Choose...',
                                        true,
                                        'select',
                                        '8',
                                        editMode,
                                        data,
                                        '',
                                        () => {
                                            callback['toggleVisibilitySection'](
                                                ['non-OEP']
                                            );
                                        },
                                        this.storagePreList,
                                        !this.getFieldData(
                                            'OEP',
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            true
                                        )
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'non-OEP',
                                class: 'col-12',
                                label: 'Investments & Defaults',
                                visible: !this.getFieldData(
                                    'OEP',
                                    {
                                        mode: editMode,
                                        data,
                                    },
                                    true
                                ),
                                fields: [
                                    this.getField(
                                        'investment',
                                        '',
                                        'Investment',
                                        false,
                                        'switch',
                                        'auto',
                                        editMode,
                                        data,
                                        'my-3',
                                        () => {
                                            const InvestmentFields =
                                                this.getInvestmentFields(
                                                    data
                                                ).map((elm: any) => elm.name);

                                            callback['toggleInvestFields'](
                                                InvestmentFields
                                            );
                                        }
                                    ),
                                ],
                            },

                            {
                                name: 'non-investment',
                                class: 'col-9',
                                visible: !this.getFieldData(
                                    'OEP',
                                    {
                                        mode: editMode,
                                        data,
                                    },
                                    true
                                ),
                                fields: [
                                    this.getField(
                                        'nominal_value',
                                        'Nominal Value',
                                        'Nominal Value',
                                        false,
                                        'number',
                                        'auto',
                                        editMode,
                                        data,
                                        undefined,
                                        undefined,
                                        undefined,
                                        this.getFieldData('investment', {
                                            mode: editMode,
                                            data,
                                        })
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'investment',
                                class: 'col-12',
                                visible: !this.getFieldData(
                                    'OEP',
                                    {
                                        mode: editMode,
                                        data,
                                    },
                                    true
                                ),
                                fields: [
                                    ...this.getInvestmentFields(
                                        data,
                                        callback
                                    ).map((elm: any) => {
                                        const isInvSelected: boolean =
                                            data['investment'];
                                        elm['disabled'] = !isInvSelected;

                                        if (elm.actions) {
                                            elm.actions.forEach(
                                                (element: any) => {
                                                    element['disabled'] =
                                                        !isInvSelected;
                                                }
                                            );
                                        }

                                        return elm;
                                    }),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'defaults',
                                class: 'col-12',
                                visible: !this.getFieldData(
                                    'OEP',
                                    {
                                        mode: editMode,
                                        data,
                                    },
                                    true
                                ),
                                fields: this.getDefaultFields_storage(data),
                            },
                        ],
                    };

                case 'sink':
                case 'excess':
                case 'export':
                case 'oep':
                    return {
                        sections: [
                            {
                                name: 'info',
                                class: 'col-12',
                                fields: [
                                    this.getField(
                                        'inputPort_name',
                                        'Name',
                                        'Port(In)',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),
                                    this.getField(
                                        'name',
                                        'Name',
                                        'Name',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),
                                ],
                            },
                        ],
                    };

                case 'bus':
                    return {
                        sections: [
                            {
                                name: 'info',
                                class: 'col-12',
                                fields: [
                                    this.getField(
                                        'inputPort_name',
                                        'Name',
                                        'Port(In)',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),

                                    this.getField(
                                        'name',
                                        'Name',
                                        'Name',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),

                                    this.getField(
                                        'outputPort_name',
                                        'Name',
                                        'Port(Out)',
                                        true,
                                        'text',
                                        '',
                                        editMode,
                                        data
                                    ),
                                ],
                            },
                        ],
                    };

                default:
                    return null;
            }
        };

        const getFields_flow = async () => {
            switch (name) {
                case 'genericstorage':
                    if (!data.oep) {
                        return {
                            sections: [
                                {
                                    name: 'non-OEP',
                                    class: 'col-12',
                                    fields: [
                                        this.getField(
                                            'investment',
                                            '',
                                            'Investment',
                                            false,
                                            'switch',
                                            'auto',
                                            editMode,
                                            data,
                                            'my-3',
                                            () => {
                                                const InvestmentFields =
                                                    this.getInvestmentFields(
                                                        data
                                                    ).map(
                                                        (elm: any) => elm.name
                                                    );

                                                callback['toggleInvestFields'](
                                                    InvestmentFields
                                                );
                                            }
                                        ),
                                    ],
                                },

                                {
                                    name: 'non-investment',
                                    class: 'col-9',
                                    fields: [
                                        this.getField(
                                            'nominal_value',
                                            'Nominal Value',
                                            'Nominal Value',
                                            false,
                                            'number',
                                            'auto',
                                            editMode,
                                            data,
                                            undefined,
                                            undefined,
                                            undefined,
                                            this.getFieldData('investment', {
                                                mode: editMode,
                                                data,
                                            })
                                        ),
                                    ],
                                },

                                {
                                    name: 'divider',
                                    class: 'dashed',
                                },

                                {
                                    name: 'investment',
                                    class: 'col-12',
                                    fields: [
                                        ...this.getInvestmentFields(
                                            data,
                                            callback
                                        ).map((elm: any) => {
                                            const isInvSelected: boolean =
                                                data['investment'];

                                            elm['disabled'] = !isInvSelected;

                                            if (elm.actions) {
                                                elm.actions.forEach(
                                                    (element: any) => {
                                                        element['disabled'] =
                                                            !isInvSelected;
                                                    }
                                                );
                                            }

                                            return elm;
                                        }),
                                    ],
                                },

                                {
                                    name: 'divider',
                                    class: 'dashed',
                                },

                                {
                                    name: 'defaults',
                                    class: 'col-12',
                                    fields: this.getDefaultFields_flow(data),
                                },
                            ],
                        };
                    } else return null;

                default:
                    const preDefinedList =
                        await this.flowService.getPreDefinedsByName(name);

                    const fields = {
                        sections: [
                            {
                                name: 'OEP',
                                class: 'col-12',
                                fields: [
                                    this.getField(
                                        'oep',
                                        'Switch On/Off',
                                        'OEP',
                                        false,
                                        'switch',
                                        'auto',
                                        editMode,
                                        data,
                                        'pt-3',
                                        () => {
                                            callback['toggleOEP']();
                                        },
                                        undefined,
                                        true,
                                        false
                                    ),

                                    this.getField(
                                        'source',
                                        'Source',
                                        '',
                                        true,
                                        'select',
                                        '8',
                                        editMode,
                                        data,
                                        '',
                                        (e: any) => {
                                            callback['onChangePreDefined']({
                                                option: e,
                                                type: name,
                                            });
                                        },
                                        // [],
                                        preDefinedList,
                                        !this.getFieldData(
                                            'OEP',
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            true
                                        ),
                                        'user_defined'
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'non-OEP',
                                class: 'col-12',
                                visible: true,
                                fields: [
                                    this.getField(
                                        'investment',
                                        '',
                                        'Investment',
                                        false,
                                        'switch',
                                        'auto',
                                        editMode,
                                        data,
                                        'my-3',
                                        () => {
                                            const InvestmentFields =
                                                this.getInvestmentFields(
                                                    data,
                                                    callback
                                                ).map((elm: any) => elm.name);

                                            callback['toggleInvestFields'](
                                                InvestmentFields
                                            );
                                        }
                                    ),
                                ],
                            },

                            {
                                name: 'non-investment',
                                class: 'col-9',
                                visible: true,
                                fields: [
                                    this.getField(
                                        'nominal_value',
                                        'Nominal Value',
                                        'Nominal Value',
                                        false,
                                        'number',
                                        'auto',
                                        editMode,
                                        data,
                                        undefined,
                                        undefined,
                                        undefined,
                                        this.getFieldData('investment', {
                                            mode: editMode,
                                            data,
                                        })
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'investment',
                                class: 'col-12',
                                visible: true,
                                fields: [
                                    ...this.getInvestmentFields(
                                        data,
                                        callback
                                    ).map((elm: any) => {
                                        const isInvSelected: boolean =
                                            data['investment'];
                                        elm['disabled'] = !isInvSelected;

                                        if (elm.actions) {
                                            elm.actions.forEach(
                                                (element: any) => {
                                                    element['disabled'] =
                                                        !isInvSelected;
                                                }
                                            );
                                        }
                                        return elm;
                                    }),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'defaults',
                                class: 'col-12',
                                visible: true,
                                fields: this.getDefaultFields_flow(data),
                            },
                        ],
                    };

                    return fields;
            }
        };

        switch (type) {
            case 'node':
                fields = getFields_node();
                break;

            case 'flow':
                fields = getFields_flow();
                break;
        }

        return fields;
    }

    getFormDataEpCosts() {
        return {
            sections: [
                {
                    name: 'calculateField',
                    class: '',
                    fields: [
                        {
                            name: 'capex',
                            placeholder: 'Capex',
                            label: 'Capex',
                            type: 'number',
                            span: 'auto',
                            isReq: true,
                        },
                        {
                            name: 'zinsatz',
                            placeholder: 'Zinsatz',
                            label: 'Zinsatz',
                            type: 'number',
                            span: 'auto',
                            step: '0.01',
                            isReq: true,
                        },
                        {
                            name: 'lifetime',
                            placeholder: 'Lifetime',
                            label: 'Lifetime',
                            type: 'number',
                            span: 'auto',
                            isReq: true,
                        },
                        {
                            name: 'opexPercentage',
                            placeholder: 'Opex Percentage',
                            label: 'Opex Percentage',
                            type: 'number',
                            span: 'auto',
                            isReq: true,
                        },
                    ],
                },
            ],
        };
    }

    getNodePorts(
        data: any,
        nodeId: string,
        transform_inputs: any,
        transform_outputs: any,
        groupName?: string
    ) {
        let transformDataFn = (data: any) => {
            let _data: any;

            if (nodeId === 'transformer') {
                // add port(in-out) list to the node
                if (
                    transform_inputs.data.length &&
                    transform_outputs.data.length
                ) {
                    _data = this.getTransformPorts(
                        data,
                        transform_inputs,
                        transform_outputs
                    );
                    return _data;
                } else return false;
            } else if (nodeId !== 'transformer') {
                let { inputport_name, outputport_name } = data;
                _data = {
                    ...data,
                    ports: {},
                };

                if (data.inputport_name) {
                    _data.ports['inputs'] = [];
                    _data.ports.inputs.push({
                        id: 0,
                        name: inputport_name,
                        code: 'input_1',
                    });
                }
                if (data.outputport_name) {
                    _data.ports['outputs'] = [];
                    _data.ports.outputs.push({
                        id: 0,
                        name: outputport_name,
                        code: 'output_1',
                    });
                }

                return _data;
            } else {
                return data;
            }
        };
        data = transformDataFn(data);

        switch (groupName) {
            case 'production':
                return { ...data, inp: 0, out: 1 };

            case 'bus':
                return { ...data, inp: 1, out: 1 };

            case 'storage':
                return { ...data, inp: 1, out: 1 };

            case 'demand':
                return { ...data, inp: 1, out: 0 };

            case 'conversion':
                if (nodeId == 'transformer') {
                    if (
                        data &&
                        data['ports'] &&
                        data['ports']['inputs'] &&
                        data['ports']['outputs'] &&
                        data['ports']['inputs'].length &&
                        data['ports']['outputs'].length
                    ) {
                        return {
                            ...data,
                            inp: data['ports']['inputs'].length,
                            out: data['ports']['outputs'].length,
                        };
                    }
                } else if (nodeId !== 'transformer') {
                    return { ...data, inp: 0, out: 0 };
                }

                return false;

            default:
                return data;
        }
    }

    getEnergyComponents() {
        return [
            {
                group_name: 'production',
                group_components: [
                    {
                        id: 'source',
                        name: 'Source',
                    },
                ],
            },
            {
                group_name: 'conversion',
                group_components: [
                    {
                        id: 'transformer',
                        name: 'Transformer',
                    },
                ],
            },
            {
                group_name: 'storage',
                group_components: [
                    {
                        id: 'genericStorage',
                        name: 'Storage',
                    },
                ],
            },
            {
                group_name: 'demand',
                group_components: [
                    {
                        id: 'sink',
                        name: 'Sink',
                    },
                    {
                        id: 'excess',
                        name: 'Excess',
                    },
                    {
                        id: 'export',
                        name: 'Export',
                    },
                    {
                        id: 'OEP',
                        name: 'OEP',
                    },
                ],
            },
            {
                group_name: 'bus',
                group_components: [
                    {
                        id: 'bus',
                        name: 'Bus',
                    },
                ],
            },
        ];
    }

    getTransformPorts(formData: any, inputList: any, outputList: any) {
        formData['ports'] = {};

        inputList.data.forEach((element: any, index: number) => {
            element['code'] = `input_${index + 1}`;
        });
        formData['ports']['inputs'] = inputList.data;

        outputList.data.forEach((element: any, index: number) => {
            element['code'] = `output_${index + 1}`;
        });
        formData['ports']['outputs'] = outputList.data;

        return formData;
    }

    epCostsCal({
        capex,
        zinsatz,
        lifetime,
        opexPercentage,
    }: EPCostParams): number | false {
        if (zinsatz <= 0 || zinsatz >= 1) {
            return false;
        }

        const numerator = zinsatz * Math.pow(1 + zinsatz, lifetime);
        const denominator = Math.pow(1 + zinsatz, lifetime) - 1;
        const capexCosts = capex * (numerator / denominator);
        const opexCosts = capex * opexPercentage;
        const epCosts = capexCosts + opexCosts;

        return Math.trunc(epCosts * 1000) / 1000;
    }
}
