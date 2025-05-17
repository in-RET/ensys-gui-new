import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import Drawflow from 'drawflow';
import Swal from 'sweetalert2';
import { EnergyComponentsComponent } from './energy-components/energy-components.component';
import { EnergyDrawflowComponent } from './energy-drawflow/energy-drawflow.component';
import { FormComponent } from './form/form.component';
import { ModalComponent } from './modal/modal.component';

interface EnergySystemModel {
    project_id: string;
    scenario: {
        scenario_id: string;
        components: [
            {
                name: string;
                oemof_type: string;
                data: {};
                position: { x: string; y: string };
                links: [
                    {
                        input: {
                            source: string;
                            target: string;
                            name: string;
                        };
                        output: {
                            source: string;
                            target: string;
                            name: string;
                        };
                    }
                ];
            }
        ];
    };
}

@Component({
    selector: 'app-scenario-energy-design',
    imports: [
        CommonModule,
        ModalComponent,
        FormComponent,
        EnergyComponentsComponent,
        EnergyDrawflowComponent,
    ],
    templateUrl: './scenario-energy-design.component.html',
    styleUrl: './scenario-energy-design.component.scss',
})
export class ScenarioEnergyDesignComponent {
    components: any = {
        items: [
            {
                group_name: 'production',
                group_components: [
                    {
                        id: 'source',
                        name: 'Source',
                    },
                    {
                        id: 'predefinedSource',
                        name: 'Predefined Source',
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
                        name: 'Predefined Transformer',
                    },
                ],
            },
            {
                group_name: 'storage',
                group_components: [
                    {
                        id: 'genericStorage',
                        name: 'GenericStorage',
                    },
                    {
                        id: 'predefinedStorage',
                        name: 'Predefined Storage',
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
                        id: 'predefinedSinkOEP',
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
        ],
    };

    editor!: Drawflow;
    modalVisibility: boolean = false;
    createdNode: any = {}; // {name: ....}
    formData!: any;
    formError: any = {
        msg: '',
        isShow: false,
    };
    editMode: boolean = false;
    currentEditNode: any;

    @ViewChild(EnergyDrawflowComponent)
    energyDrawflowComponent!: EnergyDrawflowComponent;

    @ViewChild(FormComponent)
    formComponent!: FormComponent;

    @ViewChild(ModalComponent)
    modalComponent!: ModalComponent;

    ngOnInit() {}

    clearGridModel() {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will clear the whole grid model! This will not actually delete any asset from the scenario. You will need to save after clearing for the changes to actually take effect.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear everything!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            result.isConfirmed &&
                this.energyDrawflowComponent.editor.clearModuleSelected();
        });
        // .then((result) => save_topology());
    }

    drop(node: any) {
        this.formData = null;

        // this.createdNode['id'] = e.id;
        // this.createdNode['name'] = e.name;
        this.createdNode = node;
        this.initFormData(this.createdNode.name);
        this.toggleModal(true);
    }

    editNode(e: any) {
        this.editMode = true;
        this.currentEditNode = e;
        this.formData = null;

        this.initFormData(e.name, e.data);
        this.toggleModal(true);
    }

    toggleModal(appear: boolean) {
        this.modalVisibility = appear;
        this.setFormError(false, '');
    }

    makeNode(data: any) {
        if (data)
            switch (this.createdNode.group) {
                case 'production':
                    this.energyDrawflowComponent.addNode({
                        ...data,
                        inp: 0,
                        out: 1,
                    });
                    break;

                case 'bus':
                case 'storage':
                    this.energyDrawflowComponent.addNode({
                        ...data,
                        inp: 1,
                        out: 1,
                    });
                    break;

                case 'demand':
                    this.energyDrawflowComponent.addNode({
                        ...data,
                        inp: 1,
                        out: 0,
                    });
                    break;

                case 'conversion':
                    if (this.createdNode.id == 'transformer')
                        this.energyDrawflowComponent.addNode({
                            ...data,
                            inp: data['ports']['inputs']
                                ? data['ports']['inputs'].length
                                : 0,
                            out: data['ports']['outputs']
                                ? data['ports']['outputs'].length
                                : 0,
                        });
                    break;
            }
    }

    updateNode(data: any) {
        if (data)
            switch (this.createdNode.group) {
                case 'production':
                    this.energyDrawflowComponent.updateNode(
                        this.currentEditNode.id,
                        data
                    );
                    break;

                case 'bus':
                case 'storage':
                    this.energyDrawflowComponent.updateNode(
                        this.currentEditNode.id,
                        data
                    );
                    break;

                case 'demand':
                    this.energyDrawflowComponent.updateNode(
                        this.currentEditNode.id,
                        data
                    );
                    break;

                case 'conversion':
                    if (this.createdNode.id == 'transformer')
                        this.energyDrawflowComponent.updateNode(
                            this.currentEditNode.id,
                            data
                        );
                    break;
            }
    }

    initFormData(nodeName: string, data?: any) {
        // this.form = signal<FormGroup>();

        const getFieldData = function (fName: string) {
            return data ? data[fName.toLocaleLowerCase()] : null;
        };

        nodeName = nodeName.toLocaleLowerCase();

        switch (nodeName) {
            case 'source':
                this.formData = {
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
                break;

            case 'predefined source':
            case 'predefinedsource':
                this.formData = {
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
                break;

            case 'transformer':
                this.formData = {
                    sections: [
                        {
                            name: 'Ports',
                            class: 'col-12',
                            hasMultiplePorts: true,
                            fields: [
                                {
                                    name: 'inputs',
                                    label: 'Inputs',
                                    span: '6',
                                },
                                {
                                    name: 'outputs',
                                    label: 'Outputs',
                                    span: '6',
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
                break;

            case 'predefined transformer':
            case 'predefinedtransformer':
                this.formData = {
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
                break;

            case 'genericgtorage':
                this.formData = {
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
                break;

            case 'predefined storage':
            case 'predefinedstorage':
                this.formData = {
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
                break;

            case 'sink':
                this.formData = {
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
                break;

            case 'excess':
                this.formData = {
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
                break;

            case 'export':
                this.formData = {
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
                break;

            case 'oep':
                this.formData = {
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
                break;

            case 'bus':
                this.formData = {
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
        }
    }

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    submitFormData() {
        const _formData = this.formComponent.submit();

        if (_formData) {
            this.setFormError(false, '');
            this.editMode
                ? this.updateNode(_formData)
                : this.makeNode(_formData);
            this.modalComponent._closeModal(true);
            this.editMode = false;
        } else {
            this.setFormError(true, ' * Complete the form!');
        }
    }

    getData() {
        return this.energyDrawflowComponent.getData();
    }
}
