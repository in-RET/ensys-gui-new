import { Injectable, ViewChild } from '@angular/core';
import { FormComponent } from '../scenario-energy-design/form/form.component';
import { OrderListComponent } from '../scenario-energy-design/order-list/order-list.component';

@Injectable({
    providedIn: 'root',
})
export class EnergyDesignService {
    @ViewChild(FormComponent) formComponent!: FormComponent;

    constructor() {}

    getFormData(name: string, data?: any) {
        const getFieldData = function (fName: string) {
            return data ? data[fName.toLocaleLowerCase()] : null;
        };

        switch (name.toLocaleLowerCase()) {
            case 'source':
                return {
                    sections: [
                        {
                            name: 'Name',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Port(Output)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('outputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        // {
                        //     name: 'Ports',
                        //     class: 'col-6',
                        //     fields: [
                        //         {
                        //             name: 'outputs',
                        //             label: 'Outputs',
                        //             span: '12',
                        //         },
                        //     ],
                        // },
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
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                },
                            ],
                        },
                        {
                            name: 'Source',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'source',
                                    placeholder: 'Source',
                                    label: 'Choose...',
                                    isReq: true,
                                    value: getFieldData('source'),
                                    type: 'select',
                                    options: [
                                        {
                                            name: 'Wind power plant',
                                            value: 'Wind power plant',
                                        },
                                        {
                                            name: 'Ground Mounted Photovoltaic',
                                            value: 'Ground Mounted Photovoltaic',
                                        },
                                        {
                                            name: 'Roof Mounted Photovoltaic',
                                            value: 'Roof Mounted Photovoltaic',
                                        },
                                        {
                                            name: 'Import from the power grid',
                                            value: 'Import from the power grid',
                                        },
                                        {
                                            name: 'Biomass supply',
                                            value: 'Biomass supply',
                                        },
                                        {
                                            name: 'Solar thermal system',
                                            value: 'Solar thermal system',
                                        },
                                        {
                                            name: 'Run-of-river power plant',
                                            value: 'Run-of-river power plant',
                                        },
                                        {
                                            name: 'Other',
                                            value: 'Other',
                                        },
                                    ],
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
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '8',
                                },
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
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                },
                            ],
                        },
                        {
                            name: 'Trafo',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'trafo',
                                    placeholder: 'Trafo',
                                    label: 'Choose...',
                                    isReq: true,
                                    value: getFieldData('trafo'),
                                    type: 'select',
                                    options: [
                                        {
                                            name: 'Biogas CHP',
                                            value: 'Biogas CHP',
                                        },
                                        {
                                            name: 'Biogas injection (New facility)',
                                            value: 'Biogas injection (New facility)',
                                        },
                                        {
                                            name: 'Gas and steam power plant',
                                            value: 'Gas and steam power plant',
                                        },
                                        {
                                            name: 'Power to Liquid',
                                            value: 'Power to Liquid',
                                        },
                                        {
                                            name: 'Methanisation',
                                            value: 'Methanisation',
                                        },
                                        {
                                            name: 'Electrolysis',
                                            value: 'Electrolysis',
                                        },
                                        {
                                            name: 'Fuel cell',
                                            value: 'Fuel cell',
                                        },
                                        {
                                            name: 'Air source heat pump (large-scale)',
                                            value: 'Air source heat pump (large-scale)',
                                        },
                                        {
                                            name: 'Electrode heating boiler',
                                            value: 'Electrode heating boiler',
                                        },
                                        {
                                            name: 'Other',
                                            value: 'Other',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                };

            case 'genericgtorage':
                return {
                    sections: [
                        {
                            name: 'Port(Input)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('inputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Port(Output)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('outputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Name',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '4',
                                },
                            ],
                        },
                    ],
                };

            case 'genericstorage':
            case 'predefinedstorage':
                return {
                    sections: [
                        {
                            name: 'Port(Input)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('inputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Port(Output)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('outputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Name',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '4',
                                },
                                {
                                    name: 'Storage',
                                    placeholder: 'Storage',
                                    label: 'Choose...',
                                    isReq: true,
                                    value: getFieldData('Storage'),
                                    type: 'select',
                                    span: '8',
                                    options: [
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
                                    ],
                                },
                            ],
                        },
                    ],
                };

            case 'sink':
                return {
                    sections: [
                        {
                            name: 'Port(Input)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('inputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Name',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                    ],
                };

            case 'excess':
                return {
                    sections: [
                        {
                            name: 'Port(Input)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('inputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Name',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                    ],
                };

            case 'export':
                return {
                    sections: [
                        {
                            name: 'Port(Input)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('inputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Name',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                    ],
                };

            case 'oep':
                return {
                    sections: [
                        {
                            name: 'Port(Input)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('inputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Name',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                    ],
                };

            case 'bus':
                return {
                    sections: [
                        {
                            name: 'Port(Input)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('inputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Port(Output)',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('outputPort_name'),
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },

                        {
                            name: 'Name',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    value: getFieldData('name'),
                                    type: 'text',
                                    span: '6',
                                },
                            ],
                        },
                    ],
                };

            case '_flow':
                return {
                    sections: [
                        {
                            name: '',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'nominal_value',
                                    placeholder: 'nominal_value',
                                    label: 'nominal_value',
                                    isReq: true,
                                    type: 'number',
                                    span: '3',
                                    value: getFieldData('nominal_value'),
                                },
                            ],
                        },

                        {
                            name: '',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'maximum',
                                    placeholder: 'maximum',
                                    label: 'maximum ',
                                    type: 'number',
                                    span: '2',
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'minimum',
                                    label: 'minimum',
                                    type: 'number',
                                    span: '2',
                                },
                                {
                                    name: 'ep_costs ',
                                    placeholder: 'ep_costs ',
                                    label: 'ep_costs ',
                                    type: 'number',
                                    span: '2',
                                },
                                {
                                    name: 'existing ',
                                    placeholder: 'existing ',
                                    label: 'existing ',
                                    type: 'number',
                                    span: '2',
                                },
                                {
                                    name: 'nonconvex ',
                                    placeholder: 'nonconvex ',
                                    label: 'nonconvex ',
                                    type: 'text',
                                    span: '2',
                                },
                                {
                                    name: 'offset ',
                                    placeholder: 'offset ',
                                    label: 'offset',
                                    type: 'number',
                                    span: '2',
                                },
                                {
                                    name: 'overall_maximum ',
                                    placeholder: 'overall_maximum ',
                                    label: 'overall_maximum ',
                                    type: 'number',
                                    span: '3',
                                },
                                {
                                    name: 'overall_minimum ',
                                    placeholder: 'overall_minimum ',
                                    label: 'overall_minimum ',
                                    type: 'number',
                                    span: '3',
                                },

                                {
                                    name: 'interest_rate ',
                                    placeholder: 'interest_rate ',
                                    label: 'interest_rate ',
                                    type: 'number',
                                    span: '2',
                                },
                                {
                                    name: 'lifetime ',
                                    placeholder: 'lifetime ',
                                    label: 'lifetime ',
                                    type: 'number',
                                    span: '2',
                                },
                            ],
                        },

                        {
                            name: '',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'Investment',
                                    placeholder: '',
                                    label: '',
                                    isReq: false,
                                    type: 'switch',
                                    span: 'auto',
                                    value: false,
                                    onClick: () => {
                                        this.formComponent.toggleControl(
                                            'nominal_value'
                                        );

                                        const InvestmentFields =
                                            this.getInvestmentFields().map(
                                                (elm: any) => elm.name
                                            );
                                        InvestmentFields.forEach(
                                            (fieldName: string) => {
                                                debugger;
                                                this.formComponent.toggleControl(
                                                    fieldName
                                                );
                                            }
                                        );
                                    },
                                },
                            ],
                        },

                        {
                            name: 'Investment',
                            class: 'col-12',
                            fields: this.getInvestmentFields(),
                        },
                    ],
                };

            default:
                return null;
        }
    }

    private getInvestmentFields() {
        return [
            {
                name: 'variable_costs',
                placeholder: 'variable_costs',
                label: 'variable_costs',
                type: 'range',
                span: '3',
                disabled: true,
            },
            {
                name: 'max',
                placeholder: 'max',
                label: 'max',
                type: 'range',
                span: '2',
                disabled: true,
            },
            {
                name: 'min',
                placeholder: 'min',
                label: 'min',
                type: 'range',
                span: '2',
                disabled: true,
            },

            {
                name: 'fix ',
                placeholder: 'fix ',
                label: 'fix',
                type: 'range',
                span: '2',
                disabled: true,
            },
            {
                name: 'positive_gradient_limit ',
                placeholder: 'positive_gradient_limit ',
                label: 'positive_gradient_limit ',
                type: 'range',
                span: '4',
                disabled: true,
            },
            {
                name: 'negative_gradient_limit ',
                placeholder: 'negative_gradient_limit ',
                label: 'negative_gradient_limit ',
                type: 'range',
                span: '4',
                disabled: true,
            },
            {
                name: 'full_load_time_max ',
                placeholder: 'full_load_time_max ',
                label: 'full_load_time_max ',
                type: 'number',
                span: '3',
                disabled: true,
            },
            {
                name: 'full_load_time_min ',
                placeholder: 'full_load_time_min ',
                label: 'full_load_time_min ',
                type: 'number',
                span: '3',
                disabled: true,
            },
            {
                name: 'integer ',
                placeholder: 'integer ',
                label: 'integer ',
                type: 'number',
                span: '2',
                disabled: true,
            },
            {
                name: 'nonconvex',
                placeholder: 'nonconvex',
                label: 'nonconvex',
                type: 'number',
                span: '2',
                disabled: true,
            },
            {
                name: 'fixed_costs ',
                placeholder: 'fixed_costs ',
                label: 'fixed_costs ',
                type: 'range',
                span: '3',
                disabled: true,
            },
            {
                name: '_lifetime ',
                placeholder: 'lifetime ',
                label: 'lifetime ',
                type: 'number',
                span: '2',
                disabled: true,
            },
            {
                name: 'age ',
                placeholder: 'age ',
                label: 'age ',
                type: 'number',
                span: '2',
                disabled: true,
            },
        ];
    }

    getNodePorts(data: any, groupName: string, nodeId: string) {
        let transformDataFn = (data: any) => {
            let _data: any;

            if (groupName !== 'conversion') {
                let { name, inputport_name, outputport_name } = data;
                _data = {
                    name,
                    ports: {},
                };

                if (data.inputport_name) {
                    _data.ports['inputs'] = [];
                    _data.ports.inputs.push({ id: 0, name: inputport_name });
                }
                if (data.outputport_name) {
                    _data.ports['outputs'] = [];
                    _data.ports.outputs.push({ id: 0, name: outputport_name });
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
                return { ...data, inp: 0, out: 1 };

            case 'demand':
                return { ...data, inp: 1, out: 0 };

            case 'conversion':
                if (nodeId == 'transformer')
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
                return false; // { ...data, inp: 1, out: 1 };

            default:
                return false;
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
                    {
                        id: 'predefinedSource',
                        name: 'Pre-Source',
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
                    {
                        id: 'predefinedTransformer',
                        name: 'Pre-Transformer',
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
                    {
                        id: 'predefinedStorage',
                        name: 'Pre-Storage',
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

        inputList.forEach((element: OrderListComponent) => {
            formData['ports']['inputs'] = element.data;
        });

        outputList.forEach((element: OrderListComponent) => {
            formData['ports']['outputs'] = element.data;
        });

        return formData;
    }
}
