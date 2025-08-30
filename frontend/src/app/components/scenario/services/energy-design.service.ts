import { Injectable } from '@angular/core';
import { GeneralService } from '../../../shared/services/general.service';
import { OrderItem } from '../scenario-energy-design/order-list/order-list.component';
import { FlowService } from './flow.service';

type EPCostParams = {
    capex: number;
    zinsatz: number; // interest rate (0 < zinsatz < 1)
    lifetime: number; // project lifetime in years
    opexPercentage: number; // opex as a decimal (e.g., 0.05 for 5%)
};

interface Port extends OrderItem {
    code: string;
}

interface Ports {
    inputs: Port[];
    outputs: Port[];
}

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
        if (editData.mode) {
            return editData.data[fName.toLocaleLowerCase()];
        } else {
            return dValue ? dValue : null;
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

    getDefaultFields_storage(data?: any) {
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

            item['disabled'] = this.getFieldData(
                'oep',
                {
                    mode: false,
                    data: data,
                },
                false
            );

            return item;
        });
    }

    getFormFields(
        type: string,
        name: string,
        editMode: boolean,
        data?: any,
        callback?: any
    ) {
        let fields = null;

        const getFields_node = async () => {
            let preDefinedList: string[];
            let fields: any;

            switch (name.toLocaleLowerCase()) {
                case 'source':
                    preDefinedList =
                        await this.flowService.getPreDefinedsByName(
                            name.toLocaleLowerCase()
                        );

                    fields = {
                        sections: [
                            {
                                name: 'OEP',
                                class: 'col-12',
                                visible: true,
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
                                            callback['toggleOEP'](
                                                name.toLocaleLowerCase()
                                            );
                                        },
                                        undefined,
                                        this.getFieldData(
                                            name.toLocaleLowerCase(),
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            'user_defined'
                                        ) == 'user_defined'
                                            ? true
                                            : false,
                                        false
                                    ),

                                    this.getField(
                                        name.toLocaleLowerCase(),
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
                                                type: name.toLocaleLowerCase(),
                                            });
                                        },
                                        preDefinedList,
                                        false,
                                        'user_defined'
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

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
                                        data,
                                        undefined,
                                        undefined,
                                        undefined,
                                        this.getFieldData(
                                            'oep',
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            undefined
                                        )
                                    ),
                                ],
                            },
                        ],
                    };

                    return fields;

                case 'transformer':
                    preDefinedList =
                        await this.flowService.getPreDefinedsByName(
                            'converter'
                        );

                    fields = {
                        sections: [
                            {
                                name: 'OEP',
                                class: 'col-12',
                                visible: true,
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
                                            callback['toggleOEP'](
                                                name.toLocaleLowerCase()
                                            );
                                        },
                                        undefined,
                                        this.getFieldData(
                                            name.toLocaleLowerCase(),
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            'user_defined'
                                        ) == 'user_defined'
                                            ? true
                                            : false,
                                        false
                                    ),

                                    this.getField(
                                        name.toLocaleLowerCase(),
                                        'Converter',
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
                                                type: name.toLocaleLowerCase(),
                                            });
                                        },
                                        preDefinedList,
                                        false,
                                        'user_defined'
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

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
                    return fields;

                case 'genericstorage':
                    preDefinedList =
                        await this.flowService.getPreDefinedsByName('storage');

                    fields = {
                        sections: [
                            {
                                name: 'OEP',
                                class: 'col-12',
                                visible: true,
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
                                            callback['toggleOEP']('storage');
                                        },
                                        undefined,
                                        this.getFieldData(
                                            'storage',
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            'user_defined'
                                        ) == 'user_defined'
                                            ? true
                                            : false,
                                        false
                                    ),

                                    this.getField(
                                        'storage',
                                        'Storage',
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
                                                type: 'storage',
                                            });
                                        },
                                        preDefinedList,
                                        false,
                                        'user_defined'
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'info',
                                class: 'col-12',
                                visible: true,
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
                                name: 'divider',
                                class: 'dashed',
                            },

                            {
                                name: 'non-OEP',
                                class: 'col-12',
                                label: 'Investments & Defaults',
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
                                                    data
                                                ).map((elm: any) => elm.name);

                                            callback['toggleInvestFields'](
                                                InvestmentFields
                                            );
                                        },
                                        undefined,
                                        this.getFieldData('oep', {
                                            mode: editMode,
                                            data,
                                        })
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
                                        }) ||
                                            this.getFieldData('oep', {
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
                                            this.getFieldData('investment', {
                                                mode: editMode,
                                                data,
                                            });

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
                                fields: this.getDefaultFields_storage(data),
                            },
                        ],
                    };

                    return fields;

                case 'sink':
                case 'excess':
                case 'export':
                case 'oep':
                    preDefinedList =
                        await this.flowService.getPreDefinedsByName(
                            name.toLocaleLowerCase()
                        );

                    fields = {
                        sections: [
                            {
                                name: 'OEP',
                                class: 'col-12',
                                visible: true,
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
                                            callback['toggleOEP'](
                                                name.toLocaleLowerCase()
                                            );
                                        },
                                        undefined,
                                        this.getFieldData(
                                            name.toLocaleLowerCase(),
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            'user_defined'
                                        ) == 'user_defined'
                                            ? true
                                            : false,
                                        false
                                    ),

                                    this.getField(
                                        name.toLocaleLowerCase(),
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
                                                type: name.toLocaleLowerCase(),
                                            });
                                        },
                                        preDefinedList,
                                        false,
                                        'user_defined'
                                    ),
                                ],
                            },

                            {
                                name: 'divider',
                                class: 'dashed',
                            },

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
                                        data,
                                        undefined,
                                        undefined,
                                        undefined,
                                        this.getFieldData(
                                            'oep',
                                            {
                                                mode: editMode,
                                                data,
                                            },
                                            undefined
                                        )
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

                    return fields;

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
            let preDefinedList: string[];

            switch (name) {
                case 'genericstorage':
                    preDefinedList =
                        await this.flowService.getPreDefinedsByName(name);

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
                                                ).map((elm: any) => elm.name);

                                            callback['toggleInvestFields'](
                                                InvestmentFields
                                            );
                                        }
                                        // undefined,
                                        // this.getFieldData(
                                        //     'oep',
                                        //     {
                                        //         mode: true,
                                        //         data: data,
                                        //     },
                                        //     false
                                        // )
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
                                visible: true,
                                fields: [
                                    ...this.getInvestmentFields(
                                        data,
                                        callback
                                    ).map((elm: any) => {
                                        const isInvSelected: boolean =
                                            this.getFieldData('investment', {
                                                mode: editMode,
                                                data,
                                            });

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

                default:
                    preDefinedList =
                        await this.flowService.getPreDefinedsByName(name);

                    const fields = {
                        sections: [
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
                                            this.getFieldData('investment', {
                                                mode: editMode,
                                                data,
                                            });

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

    getFormFieldsEpCosts() {
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
        transform_inputs?: OrderItem[],
        transform_outputs?: OrderItem[],
        groupName?: string
    ): any {
        let transformPorts = (): Ports | false => {
            let ports: Ports;

            if (
                nodeId === 'transformer' &&
                transform_inputs &&
                transform_outputs
            ) {
                // add port(in-out) list to the node
                if (transform_inputs.length && transform_outputs.length) {
                    ports = this.getTransformPorts(
                        transform_inputs,
                        transform_outputs
                    );
                    return ports;
                } else return false;
            } else {
                let { inputport_name, outputport_name } = data;
                ports = { inputs: [], outputs: [] };

                if (inputport_name) {
                    ports.inputs.push({
                        id: 0,
                        name: inputport_name,
                        code: 'input_1',
                    });
                }

                if (outputport_name) {
                    ports.outputs.push({
                        id: 0,
                        name: outputport_name,
                        code: 'output_1',
                    });
                }

                return ports;
            }
        };

        const _ports: Ports | false = transformPorts();

        // Converter node
        if (_ports == false) return false;

        data['ports'] = _ports;

        if (groupName) {
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
            }
        } else {
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

    getTransformPorts(inputList: OrderItem[], outputList: OrderItem[]): Ports {
        const ports: Ports = {
            inputs: [],
            outputs: [],
        };
        // const ports: any = {};

        inputList.forEach((element: OrderItem, index: number) => {
            const newElm: Port = { ...element, code: `input_${index + 1}` };
            ports.inputs.push(newElm);
        });

        outputList.forEach((element: OrderItem, index: number) => {
            const newElm: Port = { ...element, code: `output_${index + 1}` };
            ports.outputs.push(newElm);
        });

        return ports;
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
