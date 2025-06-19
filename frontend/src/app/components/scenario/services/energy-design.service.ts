import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EnergyDesignService {
    constructor() {}

    getFormData(name: string, data?: any, callback?: any) {
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
                                    name: 'Investment',
                                    placeholder: '',
                                    label: 'InV',
                                    isReq: false,
                                    type: 'switch',
                                    span: 'auto',
                                    value: getFieldData('Investment'),
                                    onClick: () => {
                                        const InvestmentFields =
                                            this.getInvestmentFields(data).map(
                                                (elm: any) => elm.name
                                            );

                                        callback(InvestmentFields);
                                    },
                                },
                            ],
                        },

                        {
                            name: '',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'nominal_value',
                                    placeholder: 'Nominal Value',
                                    label: 'Nominal Value',
                                    type: 'number',
                                    span: '3',
                                    value: getFieldData('nominal_value'),
                                    disabled: getFieldData('Investment'),
                                },
                            ],
                        },

                        {
                            name: 'Investment',
                            class: 'col-12',
                            fields: this.getInvestmentFields(data).map(
                                (elm: any) => {
                                    const isInvSelected: boolean =
                                        getFieldData('Investment');
                                    elm['disabled'] = !isInvSelected;
                                    return elm;
                                }
                            ),
                        },

                        {
                            name: '',
                            class: 'col-12',
                            fields: this.getDefaultFields(data),
                        },
                    ],
                };

            default:
                return null;
        }
    }

    private getInvestmentFields(data: any) {
        const getFieldData = function (fName: string) {
            return data ? data[fName.toLocaleLowerCase()] : null;
        };
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
                span: '3',
            },
            {
                name: 'overall_minimum',
                placeholder: 'overall_minimum',
                label: 'overall_minimum',
                type: 'number',
                span: '3',
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
            item['value'] = getFieldData(item.name);
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

    private getDefaultFields(data: any) {
        const getFieldData = function (fName: string) {
            return data ? data[fName.toLocaleLowerCase()] : null;
        };

        return [
            {
                name: 'variable_costs',
                placeholder: 'variable_costs',
                label: 'variable_costs',
                type: 'range',
                span: '4',
            },
            {
                name: 'max',
                placeholder: 'max',
                label: 'max',
                type: 'range',
                span: '4',
            },
            {
                name: 'min',
                placeholder: 'min',
                label: 'min',
                type: 'range',
                span: '4',
            },
            {
                name: 'fix',
                placeholder: 'fix',
                label: 'fix',
                type: 'range',
                span: '4',
            },
            {
                name: 'positive_gradient_limit',
                placeholder: 'positive_gradient_limit',
                label: 'positive_gradient_limit',
                type: 'range',
                span: '4',
            },
            {
                name: 'negative_gradient_limit',
                placeholder: 'negative_gradient_limit',
                label: 'negative_gradient_limit',
                type: 'range',
                span: '4',
            },
            {
                name: 'fixed_costs',
                placeholder: 'fixed_costs',
                label: 'fixed_costs',
                type: 'range',
                span: '4',
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
            item['value'] = getFieldData(item.name);
            if (item['value']) item['disabled'] = true;
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
                return { ...data, inp: 0, out: 1 };

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
}
