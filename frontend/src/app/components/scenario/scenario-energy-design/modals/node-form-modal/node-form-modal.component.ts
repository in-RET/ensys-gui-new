import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { ToastService } from '../../../../../shared/services/toast.service';
import { OEPResponse, Port } from '../../../models/node.model';
import { ScenarioBaseInfoModel } from '../../../models/scenario.model';
import {
    EnergyDesignService,
    Ports,
} from '../../../services/energy-design.service';
import { FlowService } from '../../../services/flow.service';
import { ScenarioService } from '../../../services/scenario.service';
import { FormComponent } from '../../form/form.component';
import { ModalComponent } from '../../modal/modal.component';
import { FormModalInfo } from '../../models/scenario-energy-design.model';
import {
    OrderItem,
    OrderListComponent,
} from '../../order-list/order-list.component';
import { ModeOption } from '../../time-series/time-series.component';

@Component({
    selector: 'app-node-form-modal',
    imports: [
        CommonModule,
        FormsModule,
        ModalComponent,
        FormComponent,
        OrderListComponent,
    ],
    templateUrl: './node-form-modal.component.html',
    styleUrl: './node-form-modal.component.scss',
})
export class NodeFormModalComponent {
    formError: { msg: string | null; isShow: boolean } = {
        msg: '',
        isShow: false,
    };

    @Input() modalInfo: FormModalInfo | null = null;
    @Output() formSubmitted = new EventEmitter<any>();
    @Output() modalClosed = new EventEmitter<boolean>();
    @Output() makeNode = new EventEmitter<{
        formValue: any;
        formModalInfo: FormModalInfo;
    }>();
    @Output() updateNode = new EventEmitter<{
        data: any;
        nodeId: number;
        nodeType: string;
    }>();
    @Output() onShowModal_TimeSeries = new EventEmitter<{
        groupName: string;
        controlName: string;
        modes: ModeOption[] | null;
    }>();

    @ViewChild('form')
    formComponent!: FormComponent;

    // ports
    @ViewChild('transform_inputs')
    transform_inputs!: OrderListComponent;
    @ViewChild('transform_outputs')
    transform_outputs!: OrderListComponent;

    constructor(
        private energyDesignService: EnergyDesignService,
        private flowService: FlowService,
        private scenarioService: ScenarioService,
        private toastService: ToastService,
    ) {}

    async ngOnChanges() {
        if (this.modalInfo) {
            this.initializeNodeForm();
        }
    }

    private async initializeNodeForm() {
        if (this.modalInfo) {
            let nodeType: string = this.modalInfo.node.class;

            this.modalInfo.formData =
                await this.energyDesignService.getFormFields_node(
                    nodeType,
                    this.modalInfo.editMode ?? false,
                    this.modalInfo.data,
                    this.defineCallbackFlowForm(),
                );

            // Handle transformer ports, etc. (extract from original method)

            // ?
            if (nodeType == 'transformer') {
                if (this.modalInfo.editMode) {
                    this.modalInfo.data.ports = {
                        ...this.modalInfo.data.ports,
                        editable: !this.modalInfo.data.oep,
                    };
                } else {
                    // a new node
                    this.modalInfo.data = {
                        ports: {
                            inputs: [],
                            outputs: [],
                            editable: true,
                        },
                    };
                }
            }

            this.modalInfo.url =
                this.scenarioService.getEntityInfoUrl(nodeType);

            // appear Modal
            // this.modalInfo.show = true;
        }

        //     // clean previous formModal
        //     this.formModal_info = new FormModalInfo();
        //     // this.formModal_info.id = e.id;
        //     this.formModal_info.type = 'node';
        //     this.formModal_info.title = e.title;
        //     this.formModal_info.action = e.action;
        //     this.formModal_info.node = e.node;
        //     this.formModal_info.data = e.data;
        //     this.formModal_info.editMode = e.editMode;

        //     // on edit
        //     if (e.editMode && e.data && e.data.preDefData)
        //         this.formModal_info.preDefData = e.data.preDefData;

        //     let nodeType = '';

        //     if (!e.editMode) nodeType = e.node?.type ?? '';
        //     else nodeType = e.node?.class ?? '';

        //     this.formModal_info.formData =
        //         await this.energyDesignService.getFormFields_node(
        //             nodeType,
        //             e.editMode,
        //             e.data,
        //             this.defineCallbackFlowForm(),
        //         );

        //     if (e.node?.type == 'transformer' || e.node?.class == 'transformer') {
        //         if (e.editMode) {
        //             this.formModal_info.data.ports = {
        //                 ...this.formModal_info.data.ports,
        //                 editable: !this.formModal_info.data.oep,
        //             };
        //         } else {
        //             // a new node
        //             this.formModal_info.data = {
        //                 ports: {
        //                     inputs: [],
        //                     outputs: [],
        //                     editable: true,
        //                 },
        //             };
        //         }
        //     }

        //     if (this.formModal_info.node)
        //         this.formModal_info.url = this.getEntityInfoUrl(
        //             this.formModal_info.node.class,
        //         );

        //     // appear Modal
        //     this.formModal_info.show = true;
        // }

        // async showFormModal_flow(e: any) {
        //     this.formModal_info = new FormModalInfo();
        //     this.formModal_info.preDefData = e.data.preDefData;

        //     // when edit flow, so load its data
        //     if (e.data)
        //         this.formModal_info.data = {
        //             ...e.data,
        //         };

        //     this.formModal_info.type = 'flow';
        //     this.formModal_info.title = e.title;
        //     this.formModal_info.action = e.action;
        //     this.formModal_info.node = e.node;

        //     let nodeType = e.node?.class ?? '';

        //     if (e.connection) {
        //         this.formModal_info.connection = e.connection;
        //         const connections: Connection = this.formModal_info.connection;

        //         // if flow is creating for 1st time
        //         if (this.formModal_info.preDefData) {
        //             const fData = this.formModal_info.preDefData;

        //             if (this.formModal_info.node?.id === +connections.input_node) {
        //                 const currentPortNum_in =
        //                     +connections['input_port'].split('_')[1];
        //                 this.formModal_info.data =
        //                     fData.inputs[currentPortNum_in - 1]['flow_data'] || {};
        //             } else if (
        //                 this.formModal_info.node?.id === +connections.output_node
        //             ) {
        //                 const currentPortNum_out =
        //                     +connections['output_port'].split('_')[1];
        //                 this.formModal_info.data =
        //                     fData.outputs[currentPortNum_out - 1]['flow_data'] ||
        //                     {};
        //             }
        //         }
        //     }

        //     this.formModal_info.formData =
        //         await this.energyDesignService.getFormFields_flow(
        //             nodeType,
        //             e.editMode,
        //             e.node?.data?.oep,
        //             this.formModal_info.data,
        //             this.defineCallbackFlowForm(),
        //             e.node?.data?.preDefData,
        //         );

        //     this.formModal_info.editMode = e.editMode;
        //     this.formModal_info.url = this.getEntityInfoUrl('flow');
        //     this.formModal_info.show = true;
    }

    private setPredefinedFormFields_storage(option: string) {
        // get oep data form fields
        if (option != 'user_defined') {
            this.formComponent.enabelControl('oep');
            // set oep switch on
            this.formComponent.setFieldData('oep', true);
            this.formComponent.setFieldData('investment', false);
            this.formComponent.setFieldData('inputPort_name', null);
            this.formComponent.setFieldData('outputPort_name', null);
            // disable all fields
            this.formComponent.disableControl('inputPort_name');
            this.formComponent.disableControl('outputPort_name');
            this.formComponent.disableControl('investment');
            this.formComponent.disableControl('nominal_value');

            let lsFields_ = [
                ...[{ name: 'nominal_value' }],
                ...this.energyDesignService.getInvestmentFields(),
            ];

            // const formData = this.formComponent.form.getRawValue();

            lsFields_ = [
                ...this.energyDesignService.getDefaultFields_storage(),
                ...lsFields_,
            ];

            lsFields_.forEach((element: any) => {
                // empty fields
                this.formComponent.setFieldData(element.name, null);
                this.formComponent.disableControl(element.name);
            });

            //set data from server
            const scenarioBaseData: ScenarioBaseInfoModel | null =
                this.scenarioService.restoreBaseInfo_Storage();

            if (scenarioBaseData && scenarioBaseData.scenario) {
                this.flowService
                    .getPreDefinedValue_node(
                        option,
                        scenarioBaseData.scenario.simulationYear,
                    )
                    .pipe(map((d: any) => d.items[0]))
                    .subscribe({
                        next: async (value: OEPResponse) => {
                            for (const key in value.node_data) {
                                const val = value.node_data[key];
                                this.formComponent.setFieldData(key, val);
                            }

                            // set node's ports name+...props
                            value.ports_data.inputs.forEach((port: Port) => {
                                this.formComponent.setFieldData(
                                    'inputPort_name',
                                    port.name,
                                );
                            });

                            // set node's ports name + ...props
                            value.ports_data.outputs.forEach((port: Port) => {
                                this.formComponent.setFieldData(
                                    'outputPort_name',
                                    port.name,
                                );
                            });

                            if (scenarioBaseData && scenarioBaseData.scenario) {
                                const PreDefinedData =
                                    await this.flowService.getPreDefinedValue_ports(
                                        option,
                                        scenarioBaseData.scenario
                                            .simulationYear,
                                    );

                                if (this.modalInfo && this.modalInfo.node)
                                    this.modalInfo.node.data.preDefData =
                                        PreDefinedData;
                            }
                        },
                        error: (err) => {
                            this.toastService.error(
                                err.error && err.error.detail
                                    ? err.error.detail
                                    : 'error',
                            );
                        },
                    });
            }
        } else {
            this.formComponent.disableControl('oep');
            // set oep switch off
            this.formComponent.setFieldData('oep', false);
            this.formComponent.setFieldData('investment', false);
            this.formComponent.setFieldData('nominal_value', null);
            this.formComponent.setFieldData('inputPort_name', null);
            this.formComponent.setFieldData('outputPort_name', null);
            // enable all fields
            this.formComponent.enabelControl('inputPort_name');
            this.formComponent.enabelControl('outputPort_name');
            this.formComponent.enabelControl('investment');
            this.formComponent.enabelControl('nominal_value');

            // clear data
            const lsFields_forEnable = [
                ...this.energyDesignService.getDefaultFields_storage(),
            ];
            lsFields_forEnable.forEach((element: any) => {
                this.formComponent.setFieldData(element.name, null);
                this.formComponent.enabelControl(element.name);
            });
            const lsFields_forDisable = [
                ...this.energyDesignService.getInvestmentFields(),
            ];
            lsFields_forDisable.forEach((element: any) => {
                this.formComponent.setFieldData(element.name, null);
                this.formComponent.disableControl(element.name);
            });

            if (this.modalInfo && this.modalInfo.node) {
                this.modalInfo.node.data.preDefData = undefined;

                if (this.modalInfo.node) {
                    this.modalInfo.node.data.preDefData = {
                        inputs: [],
                        outputs: [],
                    };
                }
            }
        }
    }

    private setPredefinedFormFields_node(option: string, type: string) {
        // get oep data form fields
        if (option != 'user_defined') {
            //set data from server
            const scenarioBaseData: ScenarioBaseInfoModel | null =
                this.scenarioService.restoreBaseInfo_Storage();

            if (scenarioBaseData && scenarioBaseData.scenario) {
                this.flowService
                    .getPreDefinedValue_node(
                        option,
                        scenarioBaseData.scenario.simulationYear,
                    )
                    .pipe(map((d: any) => d.items[0]))
                    .subscribe({
                        next: async (value: OEPResponse) => {
                            if (type == 'transformer' && this.modalInfo) {
                                this.modalInfo.data = {
                                    ...this.modalInfo.data,
                                    ports: {
                                        inputs: [],
                                        outputs: [],
                                        editable: false,
                                    },
                                };
                            }

                            // set node's ports name + ...props
                            value.ports_data.inputs.forEach((port: Port) => {
                                if (type != 'transformer') {
                                    this.formComponent.setFieldData(
                                        'inputPort_name',
                                        port.name,
                                    );
                                } else {
                                    let inputItem: OrderItem;
                                    inputItem = {
                                        id: this.modalInfo?.data.ports.inputs
                                            .length,
                                        name: port.name,
                                        number: port.efficiency ?? 1,
                                    };

                                    this.modalInfo?.data.ports.inputs.push(
                                        inputItem,
                                    );
                                }
                            });

                            // set node's ports name + ...props
                            value.ports_data.outputs.forEach((port: Port) => {
                                if (type != 'transformer') {
                                    this.formComponent.setFieldData(
                                        'outputPort_name',
                                        port.name,
                                    );
                                } else {
                                    let outputItem: OrderItem;
                                    outputItem = {
                                        id: this.modalInfo?.data.ports.outputs
                                            .length,
                                        name: port.name,
                                        number: port.efficiency ?? 1,
                                    };

                                    this.modalInfo?.data.ports.outputs.push(
                                        outputItem,
                                    );
                                }
                            });

                            // set form fields
                            this.formComponent.setFieldData('oep', true);

                            if (this.modalInfo && this.modalInfo.node)
                                this.modalInfo.node.data.oep = true;

                            this.formComponent.enabelControl('oep');
                            this.formComponent.disableControl('inputPort_name');
                            this.formComponent.disableControl(
                                'outputPort_name',
                            );

                            if (scenarioBaseData && scenarioBaseData.scenario) {
                                const PreDefinedData =
                                    await this.flowService.getPreDefinedValue_ports(
                                        option,
                                        scenarioBaseData.scenario
                                            .simulationYear,
                                    );

                                if (this.modalInfo && this.modalInfo.node)
                                    this.modalInfo.node.data.preDefData =
                                        PreDefinedData;
                            }
                        },
                        error: (err) => {
                            this.toastService.error(
                                err.error && err.error.detail
                                    ? err.error.detail
                                    : 'error',
                            );

                            if (type == 'transformer' && this.modalInfo) {
                                this.modalInfo.data = {
                                    ...this.modalInfo.data,
                                    ports: {
                                        inputs: [],
                                        outputs: [],
                                        editable: false,
                                    },
                                };
                            }
                        },
                    });
            }
        } else {
            if (!this.modalInfo) return;

            this.formComponent.disableControl('oep');
            // set oep switch off
            this.formComponent.setFieldData('oep', false);
            this.modalInfo.data.oep = false;
            this.modalInfo.data ? (this.modalInfo.data.oep = false) : null;
            this.modalInfo.node ? (this.modalInfo.node.data.oep = false) : null;

            this.formComponent.setFieldData('inputPort_name', null);
            this.formComponent.setFieldData('outputPort_name', null);
            // enable all fields
            this.formComponent.enabelControl('inputPort_name');
            this.formComponent.enabelControl('outputPort_name');

            if (type == 'transformer') {
                this.modalInfo.data = {
                    ...this.modalInfo.data,
                    ports: {
                        inputs: [],
                        outputs: [],
                        editable: true,
                    },
                };
            }

            if (this.modalInfo.node) {
                this.modalInfo.node.data.preDefData = undefined;
            }

            if (this.modalInfo.node) {
                this.modalInfo.node.data.preDefData = {
                    inputs: [],
                    outputs: [],
                };
            }
        }
    }

    private setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    private cleanFormError() {
        this.formError = { msg: null, isShow: false };
    }

    submitForm(): void {
        if (!this.modalInfo) return;

        const findOEPFieldData = (
            field: any | undefined,
        ): boolean | undefined => {
            if (!field) return undefined;
            return Object.keys(field).some((k) => k === 'oep')
                ? field['oep']
                : undefined;
        };

        let isOepSelected: boolean;
        isOepSelected = findOEPFieldData(this.modalInfo.node.data) ?? false;

        if (this.modalInfo.editMode)
            isOepSelected =
                findOEPFieldData(this.modalInfo.node?.data.oep) ?? false;

        // if (isOepSelected === undefined)
        //     isOepSelected = findOEPFieldData(this.modalInfo.node.oep) ?? false;
        // its wrong, bc if OEP is one then data hasn't changed,
        // so submit means as close fn not more!
        let formData = this.formComponent.submit(!isOepSelected);

        if (formData && this.modalInfo.node) {
            const isNodeNameDuplicate =
                this.scenarioService.checkNodeDuplication(
                    formData.name,
                    this.modalInfo.node.id,
                );

            if (!isNodeNameDuplicate) {
                // add port count(in-out) + transform data
                const portsInfo:
                    | false
                    | { ports: Ports; inp: number; out: number } =
                    this.energyDesignService.getNodePorts(
                        this.modalInfo.node.class,
                        {
                            inputport_name: formData.inputport_name,
                            outputport_name: formData.outputport_name,
                            transform_inputs: this.transform_inputs?.data,
                            transform_outputs: this.transform_outputs?.data,
                        },
                    );

                if (portsInfo === false) {
                    this.setFormError(true, ' * Ports have not been added!');
                    // return false;
                }

                if (formData) {
                    if (!this.modalInfo.editMode) {
                        formData = {
                            ...formData,
                            ...portsInfo,
                            preDefData: this.modalInfo.node?.data.preDefData,
                        };

                        // add connections if node is bus
                        if (this.modalInfo.node?.class !== 'bus')
                            formData['connections'] = {
                                inputs: [],
                                outputs: [],
                            };

                        this.makeNode.emit({
                            formValue: formData,
                            formModalInfo: this.modalInfo,
                        });
                        this.closeModal(true);
                    } else if (this.modalInfo.editMode) {
                        formData = {
                            ...formData,
                            ...portsInfo,
                            preDefData: this.modalInfo.node?.data.preDefData,
                        };

                        formData['connections'] =
                            this.modalInfo.data.connections;

                        // means: pre-D has changed
                        if (this.modalInfo.node?.data.preDefData) {
                            if (
                                this.modalInfo.node.data.preDefData.inputs
                                    .length > 0
                            ) {
                                this.modalInfo.node.data.preDefData.inputs.forEach(
                                    (pre_input: Port) => {
                                        if (
                                            this.modalInfo &&
                                            this.modalInfo.node
                                        ) {
                                            const inputs =
                                                this.modalInfo.node.data
                                                    .connections.inputs;

                                            if (inputs.length > 0) {
                                                if (
                                                    this.modalInfo.node
                                                        .class !== 'bus'
                                                ) {
                                                    inputs.forEach(
                                                        (
                                                            inELm: {
                                                                baseInfo: any;
                                                                formInfo: any;
                                                            },
                                                            i: number,
                                                        ) => {
                                                            if (
                                                                inELm.baseInfo
                                                                    .input_port ==
                                                                `input_${i + 1}`
                                                            ) {
                                                                inELm.formInfo =
                                                                    pre_input.flow_data ||
                                                                    {};
                                                            }
                                                        },
                                                    );
                                                }
                                            }
                                        }
                                    },
                                );
                            } else {
                                const inputs =
                                    this.modalInfo.node.data.connections.inputs;

                                if (inputs.length > 0) {
                                    if (this.modalInfo.node.class !== 'bus') {
                                        inputs.forEach(
                                            (
                                                inELm: {
                                                    baseInfo: any;
                                                    formInfo: any;
                                                },
                                                i: number,
                                            ) => {
                                                if (
                                                    inELm.baseInfo.input_port ==
                                                    `input_${i + 1}`
                                                ) {
                                                    inELm.formInfo = {};
                                                }
                                            },
                                        );
                                    }
                                }
                            }

                            if (
                                this.modalInfo.node.data.preDefData.outputs
                                    .length > 0
                            ) {
                                this.modalInfo.node.data.preDefData.outputs.forEach(
                                    (pre_output: Port) => {
                                        if (this.modalInfo?.node) {
                                            const outputs =
                                                this.modalInfo.node.data
                                                    .connections.outputs;

                                            if (outputs.length > 0) {
                                                if (
                                                    this.modalInfo.node
                                                        .class !== 'bus'
                                                ) {
                                                    outputs.forEach(
                                                        (
                                                            outELm: {
                                                                baseInfo: any;
                                                                formInfo: any;
                                                            },
                                                            i: number,
                                                        ) => {
                                                            if (
                                                                outELm.baseInfo
                                                                    .output_port ==
                                                                `output_${i + 1}`
                                                            ) {
                                                                outELm.formInfo =
                                                                    pre_output.flow_data ||
                                                                    {};
                                                            }
                                                        },
                                                    );
                                                }
                                            }
                                        }
                                    },
                                );
                            } else {
                                const outputs =
                                    this.modalInfo.node.data.connections
                                        .outputs;

                                if (outputs.length > 0) {
                                    if (this.modalInfo.node.class !== 'bus') {
                                        outputs.forEach(
                                            (
                                                outELm: {
                                                    baseInfo: any;
                                                    formInfo: any;
                                                },
                                                i: number,
                                            ) => {
                                                if (
                                                    outELm.baseInfo
                                                        .output_port ==
                                                    `output_${i + 1}`
                                                ) {
                                                    outELm.formInfo = {};
                                                }
                                            },
                                        );
                                    }
                                }
                            }
                        }

                        if (this.modalInfo.node)
                            this.updateNode.emit({
                                data: formData,
                                nodeId: this.modalInfo.node.id,
                                nodeType: this.modalInfo.node.class,
                            });
                        this.closeModal(true);
                    }

                    // this.modalComponent._closeModal(true);
                } else {
                    this.setFormError(true, ' * The form is not completed!');
                }
            } else {
                this.setFormError(true, ' * The name is duplicated!');
            }
        } else {
            this.setFormError(true, ' * Complete the form!');
        }

        this.formSubmitted.emit(formData);
    }

    closeModal(approve: boolean) {
        this.modalClosed.emit(approve);
        this.cleanFormError();
    }

    private defineCallbackFlowForm() {
        return {
            toggleInvestFields: this.toggleInvestFields.bind(this),
            toggleFomFields: this.toggleFomFields.bind(this),
            toggleVisibilitySection: this.toggleVisibilitySection.bind(this),
            showModal_EpCostsCalculator:
                this.showModal_EpCostsCalculator.bind(this),
            onChangePreDefined: this.onChangePreDefined.bind(this),
            toggleOEP: this.toggleOEP.bind(this),
        };
    }

    private toggleInvestFields(investmentFields: string[]) {
        this.formComponent.toggleControl('nominal_value');

        investmentFields.forEach((fieldName: string) => {
            if (
                fieldName !== 'overall_maximum' &&
                fieldName !== 'overall_minimum' &&
                fieldName !== 'interest_rate' &&
                fieldName !== 'lifetime'
            )
                this.formComponent.toggleControl(fieldName);
        });
    }

    private toggleFomFields(fieldList: string[]) {
        fieldList.forEach((fieldName) => {
            this.formComponent.toggleControl(fieldName);
        });
    }

    private toggleVisibilitySection(d: any) {
        if (d) {
            d.forEach((name: any) => {
                let formSection = this.formComponent.formData.sections.find(
                    (x: any) => x.name == name,
                );

                if (formSection) {
                    formSection.visible !== undefined
                        ? (formSection.visible = !formSection.visible)
                        : (formSection.visible = false);
                }
            });
        }
    }

    private showModal_EpCostsCalculator() {
        // this.formModal_calculator.action = {
        //     label: 'ƒ',
        //     fn: 'calculateEpCosts',
        // };
        // this.formModal_calculator.formData = this.getFormFieldsEpCosts();
        // this.modalComponent.hideModal();
        // this.modalInfo.hide = true;
        // this.formModal_calculator.show = true;
    }

    private onChangePreDefined(e: { option: string; type: string }) {
        this.cleanFormError();

        // just in storage node there are aditional sec
        if (e.type == 'genericstorage')
            this.setPredefinedFormFields_storage(e.option);
        else this.setPredefinedFormFields_node(e.option, e.type);
    }

    private toggleOEP(type?: string) {
        if (this.modalInfo && this.modalInfo.node)
            this.modalInfo.node.data.oep =
                this.formComponent.form.controls['oep'].value;

        if (type == 'genericstorage') {
            // user input data
            if (!this.formComponent.form.controls['oep'].value) {
                this.formComponent.enabelControl('investment');
                this.formComponent.enabelControl('nominal_value');
                this.formComponent.enabelControl('inputPort_name');
                this.formComponent.enabelControl('outputPort_name');
                this.formComponent.setFieldData('investment', false);

                const lsFields_ = [
                    ...this.energyDesignService.getDefaultFields_storage(),
                ];

                lsFields_.forEach((element: any) => {
                    this.formComponent.enabelControl(element.name);
                });
            } else {
                this.formComponent.disableControl('inputPort_name');
                this.formComponent.disableControl('outputPort_name');
                this.formComponent.disableControl('investment');
                this.formComponent.disableControl('nominal_value');

                let lsFields_ = [
                    ...this.energyDesignService.getInvestmentFields(),
                ];
                lsFields_ = [
                    ...this.energyDesignService.getDefaultFields_storage(),
                    ...lsFields_,
                ];

                lsFields_.forEach((element: any) => {
                    this.formComponent.disableControl(element.name);
                });
            }
        } else {
            // user input data
            if (!this.formComponent.form.controls['oep'].value) {
                this.formComponent.enabelControl('inputPort_name');
                this.formComponent.enabelControl('outputPort_name');
            } else {
                this.formComponent.disableControl('inputPort_name');
                this.formComponent.disableControl('outputPort_name');
            }

            if (type == 'transformer' && this.modalInfo) {
                this.modalInfo.data.ports.editable =
                    !this.formComponent.form.controls['oep'].value;
            }
        }
    }

    /**
     *
     * @param controlName
     * @param options { component: string, groupName: string // for like transform , modes: Array<{value: string, label: string}> , ...  }
     */
    showModal_TimeSeries(e: {
        controlName: string;
        options?: {
            id: string;
            group: string;
        };
        modes?: ModeOption[] | null;
    }) {
        // clear previous data
        // this.timeSeriesModal = {
        //     id: '',
        //     group: '',
        //     data: [],
        //     modes: [],
        //     show: false,
        // };

        let timeSeriesData: {
            groupName: string;
            controlName: string;
            modes: ModeOption[] | null;
        } = {
            groupName: '',
            controlName: '',
            modes: [
                { value: 'file', label: 'CSV File' },
                { value: 'number', label: 'Single Value' },
            ],
        };

        if (e.options && e.options.group === 'transformer' && e.options.id) {
            timeSeriesData.groupName = e.options.group;
            timeSeriesData.controlName = e.options.id;
        }

        this.onShowModal_TimeSeries.emit(timeSeriesData);
    }

    setTimeSeriesData(controlName: string, data: number[]) {
        // this.formComponent.setFieldData(controlName, data);
        //  if (this.timeSeriesModal.group === 'transformer') {
        if (controlName == 'inputs')
            this.transform_inputs.submitTimeSeriesData(data);
        else if (controlName == 'outputs')
            this.transform_outputs.submitTimeSeriesData(data);
        // } else {
    }
}
