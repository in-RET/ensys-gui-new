import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { Tooltip } from 'bootstrap';
import Drawflow from 'drawflow';
import { map } from 'rxjs';
import { ContentLayoutService } from '../../../core/layout/services/content-layout.service';
import { ToastService } from '../../../shared/services/toast.service';
import { OEPPorts, OEPResponse, Port } from '../models/node.model';
import { EnergyDesignService, Ports } from '../services/energy-design.service';
import { FlowService } from '../services/flow.service';
import { ScenarioModel, ScenarioService } from '../services/scenario.service';
import { EnergyComponentsComponent } from './energy-components/energy-components.component';
import { EnergyDrawflowComponent } from './energy-drawflow/energy-drawflow.component';
import { FormComponent } from './form/form.component';
import { ModalComponent } from './modal/modal.component';
import {
    OrderItem,
    OrderListComponent,
} from './order-list/order-list.component';

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

interface FormNode {
    type: string;
    name: string;
    position: { x: number; y: number };
    class: string;
    id?: number;
}

class FormModalInfo {
    id?: number;
    title: string = '';
    formData: any | undefined;
    action: any | undefined;
    data: any | undefined;
    type: 'node' | 'flow' | undefined;
    editMode: boolean = false;
    hide: boolean = false;
    show: boolean = false;
    node?: FormNode;
    preDefData!: OEPPorts | undefined;
}

@Component({
    selector: 'app-scenario-energy-design',
    imports: [
        CommonModule,
        ModalComponent,
        FormComponent,
        EnergyComponentsComponent,
        EnergyDrawflowComponent,
        OrderListComponent,
    ],
    templateUrl: './scenario-energy-design.component.html',
    styleUrl: './scenario-energy-design.component.scss',
})
export class ScenarioEnergyDesignComponent {
    components: any;
    editor!: Drawflow;
    // currentNode: any;
    // currentConnection: any;

    editMode: boolean = false;
    isFullscreen: boolean = false;

    formError: { msg: string | null; isShow: boolean } = {
        msg: '',
        isShow: false,
    };
    formCalError: any = {
        msg: '',
        isShow: false,
    };

    // for all modals
    formModal_info!: FormModalInfo;

    formModal_calculator: any = {
        show: false,
        title: 'EP Costs Calculator',
    };

    @ViewChild(EnergyDrawflowComponent)
    energyDrawflowComponent!: EnergyDrawflowComponent;

    @ViewChild('form')
    formComponent!: FormComponent;
    @ViewChild('form_cal')
    formCalComponent!: FormComponent;

    @ViewChild(ModalComponent)
    modalComponent!: ModalComponent;

    // ports
    @ViewChild('transform_inputs')
    transform_inputs!: OrderListComponent;
    @ViewChild('transform_outputs')
    transform_outputs!: OrderListComponent;

    @Input() currentScenario: any;

    contentLayoutService = inject(ContentLayoutService);
    energyDesignService = inject(EnergyDesignService);
    scenarioService = inject(ScenarioService);
    flowService = inject(FlowService);
    toastService = inject(ToastService);

    ngOnInit() {
        this.loadEnergyComponents();
    }

    ngAfterViewInit() {
        this.setComponentsToolTip();
    }

    setComponentsToolTip() {
        const tooltipTriggerList = Array.from(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );

        tooltipTriggerList.forEach((tooltipTriggerEl) => {
            new Tooltip(tooltipTriggerEl);
        });
    }

    loadEnergyComponents() {
        this.components = this.energyDesignService.getEnergyComponents();
    }

    getBaseInfoFromStorage() {
        // if (initalData.project && initalData.scenario) {
        //     this.project['name'] = initalData.project.name;
        //     this.scenario['name'] = initalData.name;
        // } else this.router.navigate(['']);
    }

    touchEnd(e: any) {
        //   this.energyDrawflowComponent.onTouchEnd(e.id, e.name, e.group, e.pos);
    }

    /**
     *
     * @param e => {
     *  id: `${nodeId}`, // to get formData
     * }
     *
     */
    async showFormModal_node(e: FormModalInfo) {
        // clean previous formModal
        this.formModal_info = new FormModalInfo();
        // this.formModal_info.id = e.id;
        this.formModal_info.type = 'node';
        this.formModal_info.title = e.title;
        this.formModal_info.action = e.action;
        this.formModal_info.node = e.node;
        this.formModal_info.data = e.data;
        this.formModal_info.editMode = e.editMode;

        // on edit
        if (e.editMode && e.data && e.data.preDefData)
            this.formModal_info.preDefData = e.data.preDefData;

        // on edit
        // if (e.editMode && this.formModal_info.node) {
        //     e.data['name'] = this.formModal_info.node.name;
        // }

        let nodeType = '';
        if (!e.editMode) nodeType = e.node?.type ?? '';
        else nodeType = e.node?.class ?? '';

        this.formModal_info.formData =
            await this.energyDesignService.getFormFields_node(
                nodeType,
                e.editMode,
                e.data,
                this.defineCallbackFlowForm()
            );

        if (e.node?.type == 'transformer') {
            if (e.editMode) {
                this.formModal_info.data.ports = {
                    ...this.formModal_info.data.ports,
                    editable: this.formModal_info.data.oep,
                };
            } else {
                // a new node

                this.formModal_info.data = {
                    ports: {
                        inputs: [],
                        outputs: [],
                        editable: true,
                    },
                };
            }
        }

        // appear Modal
        this.formModal_info.show = true;
    }

    async showFormModal_flow(e: FormModalInfo) {
        // clean previous formModal
        this.formModal_info = new FormModalInfo();

        // this.formModal_info.id = e.id;
        this.formModal_info.type = 'flow';
        this.formModal_info.title = e.title;
        this.formModal_info.action = e.action;
        this.formModal_info.node = e.node;
        this.formModal_info.data = e.data;
        this.formModal_info.preDefData = e.data.preDefData;

        let nodeType = e.node?.class ?? '';
        // if (!e.editMode) {
        //     nodeType = e.node?.type ?? '';
        // } else nodeType = e.node?.class ?? '';

        this.formModal_info.formData =
            await this.energyDesignService.getFormFields_flow(
                nodeType,
                e.editMode,
                e.data,
                this.defineCallbackFlowForm()
            );
        this.formModal_info.data = e.data;
        this.formModal_info.editMode = e.editMode;

        if (e.node?.name == 'transformer' && false) {
            if (e.editMode) {
                this.formModal_info.data.ports = {
                    ...this.formModal_info.data.ports,
                    editable: this.formModal_info.data.oep
                        ? !this.formModal_info.data.oep
                        : true,
                };
            } else {
                // a new node
                this.formModal_info.data = {
                    ...this.formModal_info.data,
                    ports: {
                        inputs: [],
                        outputs: [],
                        editable: this.formModal_info.data.oep
                            ? !this.formModal_info.data.oep
                            : true,
                    },
                };
            }
        }

        // appear Modal
        this.formModal_info.show = true;
    }

    showEpCostsCalModal() {
        this.formModal_calculator.action = {
            label: 'ƒ',
            fn: 'calculateEpCosts',
        };
        this.formModal_calculator.formData =
            this.energyDesignService.getFormFieldsEpCosts();

        this.modalComponent.hideModal();
        this.formModal_info.hide = true;
        this.formModal_calculator.show = true;
    }

    defineCallbackFlowForm() {
        let callbackList: any = [];
        callbackList['toggleInvestFields'] = this.toggleInvestFields.bind(this);

        callbackList['toggleFomFields'] = this.toggleFomFields.bind(this);

        callbackList['toggleVisibilitySection'] =
            this.toggleVisibilitySection.bind(this);

        callbackList['showEpCostsCalModal'] =
            this.showEpCostsCalModal.bind(this);

        callbackList['onChangePreDefined'] = this.onChangePreDefined.bind(this);

        callbackList['toggleOEP'] = this.toggleOEP.bind(this);

        return callbackList;
    }

    toggleInvestFields(investmentFields: string[]) {
        this.formComponent.toggleControl('nominal_value');

        investmentFields.forEach((fieldName: string) => {
            this.formComponent.toggleControl(fieldName);
        });
    }

    toggleFomFields(fieldList: string[]) {
        fieldList.forEach((fieldName) => {
            this.formComponent.toggleControl(fieldName);
        });
    }

    toggleVisibilitySection(d: any) {
        if (d) {
            d.forEach((name: any) => {
                let formSection = this.formComponent.formData.sections.find(
                    (x: any) => x.name == name
                );

                if (formSection) {
                    formSection.visible !== undefined
                        ? (formSection.visible = !formSection.visible)
                        : (formSection.visible = false);
                }
            });
        }
    }

    checkConnectionToDelete() {
        if (
            this.formModal_info &&
            this.formModal_info.type === 'flow' &&
            !this.formModal_info.editMode
        )
            this.energyDrawflowComponent.removeSingleConnection(
                this.formModal_info.data.connection
            );
    }

    cleanFormData() {
        this.formModal_info = new FormModalInfo();
        this.setFormError(false, '');
    }

    closeModal(approve: boolean) {
        if (!approve) this.checkConnectionToDelete();

        this.cleanFormData();
    }

    closeModalEpCostsCalculator() {
        this.formModal_calculator.show = false;
        this.formModal_info.hide = false;
        this.modalComponent.showModal();
    }

    onChangePreDefined(e: { option: string; type: string }) {
        this.cleanFormError();

        // just in storage node there are aditional sec
        if (e.type == 'genericstorage')
            this.setPredefinedFormFields_storage(e.option);
        else this.setPredefinedFormFields_node(e.option, e.type);
    }

    private setPredefinedFormFields_node(option: string, type: string) {
        // [...this.energyDesignService.getDefaultFields_flow()];
        // get oep data form fields
        if (option != 'user_defined') {
            this.formComponent.enabelControl('oep');
            // set oep switch on
            this.formComponent.setFieldData('oep', true);
            this.formComponent.setFieldData('inputPort_name', null);
            this.formComponent.setFieldData('outputPort_name', null);
            // disable all fields
            this.formComponent.disableControl('inputPort_name');
            this.formComponent.disableControl('outputPort_name');

            //set data from server
            const scenarioBaseData: ScenarioModel | null =
                this.scenarioService.restoreBaseInfo_Storage();

            if (scenarioBaseData && scenarioBaseData.scenario) {
                this.flowService
                    .getPreDefinedValue(
                        option,
                        scenarioBaseData.scenario.simulationYear
                    )
                    .pipe(map((d: any) => d.items[0]))
                    .subscribe({
                        next: (value: OEPResponse) => {
                            if (type == 'transformer') {
                                this.formModal_info.data = {
                                    ...this.formModal_info.data,
                                    ports: {
                                        inputs: [],
                                        outputs: [],
                                        editable: false,
                                    },
                                };
                            }

                            // set node's ports name+...props
                            value.ports_data.inputs.forEach((port: Port) => {
                                if (type != 'transformer') {
                                    this.formComponent.setFieldData(
                                        'inputPort_name',
                                        port.name
                                    );
                                } else {
                                    let inputItem: OrderItem;
                                    inputItem = {
                                        id: this.formModal_info.data.ports
                                            .inputs.length,
                                        name: port.name,
                                        number:
                                            value.node_data['efficiency'] ?? 1,
                                    };

                                    this.formModal_info.data.ports.inputs.push(
                                        inputItem
                                    );
                                }
                            });

                            value.ports_data.outputs.forEach((port: Port) => {
                                if (type != 'transformer') {
                                    this.formComponent.setFieldData(
                                        'outputPort_name',
                                        port.name
                                    );
                                } else {
                                    let outputItem: OrderItem;
                                    outputItem = {
                                        id: this.formModal_info.data.ports
                                            .outputs.length,
                                        name: port.name,
                                        number:
                                            value.node_data['efficiency'] ?? 1,
                                    };

                                    this.formModal_info.data.ports.outputs.push(
                                        outputItem
                                    );
                                }
                            });

                            // save in/out data port based on predefined item, to use in flow
                            this.formModal_info.preDefData = value.ports_data;
                        },
                        error: (err) => {
                            console.log(err);
                            this.toastService.error(
                                err.error && err.error.detail
                                    ? err.error.detail
                                    : 'error'
                            );

                            if (type == 'transformer') {
                                this.formModal_info.data = {
                                    ...this.formModal_info.data,
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
            this.formComponent.disableControl('oep');
            // set oep switch off
            this.formComponent.setFieldData('oep', false);
            this.formComponent.setFieldData('inputPort_name', null);
            this.formComponent.setFieldData('outputPort_name', null);
            // enable all fields
            this.formComponent.enabelControl('inputPort_name');
            this.formComponent.enabelControl('outputPort_name');

            if (type == 'transformer') {
                this.formModal_info.data = {
                    ...this.formModal_info.data,
                    ports: {
                        inputs: [],
                        outputs: [],
                        editable: true,
                    },
                };
            }

            this.formModal_info.preDefData = undefined;
        }
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
            const scenarioBaseData: ScenarioModel | null =
                this.scenarioService.restoreBaseInfo_Storage();

            if (scenarioBaseData && scenarioBaseData.scenario) {
                this.flowService
                    .getPreDefinedValue(
                        option,
                        scenarioBaseData.scenario.simulationYear
                    )
                    .pipe(map((d: any) => d.items[0]))
                    .subscribe({
                        next: (value: OEPResponse) => {
                            for (const key in value.node_data) {
                                const val = value.node_data[key];
                                this.formComponent.setFieldData(key, val);
                            }

                            // set node's ports name+...props
                            value.ports_data.inputs.forEach((port: Port) => {
                                this.formComponent.setFieldData(
                                    'inputPort_name',
                                    port.name
                                );
                            });

                            value.ports_data.outputs.forEach((port: Port) => {
                                this.formComponent.setFieldData(
                                    'outputPort_name',
                                    port.name
                                );
                            });

                            // save in/out data port based on predefined item, to use in flow
                            this.formModal_info.preDefData = value.ports_data;
                        },
                        error: (err) => {
                            console.log(err);
                            this.toastService.error(
                                err.error && err.error.detail
                                    ? err.error.detail
                                    : 'error'
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

            // this.formComponent.setFieldData('nominal_value', null);
            // this.formComponent.setFieldData('maximum', null);
            // this.formComponent.setFieldData('minimum', null);
            // this.formComponent.setFieldData('ep_costs', null);
        }
    }

    toggleOEP(type?: string) {
        if (type == 'storage') {
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

            if (type == 'transformer') {
                this.formModal_info.data.ports.editable =
                    !this.formComponent.form.controls['oep'].value;
            }
        }
    }

    // ============================

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    cleanFormError() {
        this.formError = { msg: null, isShow: false };
    }

    setFormCalError(status: boolean, msg: string) {
        this.formCalError = {
            msg: msg,
            isShow: status,
        };
    }

    submitFormData() {
        let formData = this.formComponent.submit(
            !this.formModal_info.data?.oep
        );

        if (formData) {
            // new-node
            if (this.formModal_info.type === 'node') {
                const isNodeNameDuplicate =
                    this.energyDrawflowComponent.checkNodeDuplication(
                        formData.name,
                        this.formModal_info.node?.id ?? 0
                    );

                if (!isNodeNameDuplicate) {
                    if (this.formModal_info.node) {
                        // add port count(in-out) + transform data
                        const portsInfo:
                            | { ports: Ports; inp: number; out: number }
                            | false = this.energyDesignService.getNodePorts(
                            this.formModal_info.node.type ??
                                this.formModal_info.node.class,
                            {
                                inputport_name: formData.inputport_name,
                                outputport_name: formData.outputport_name,
                                transform_inputs: this.transform_inputs?.data,
                                transform_outputs: this.transform_outputs?.data,
                            },

                            this.formModal_info.preDefData
                        );

                        if (portsInfo === false) {
                            this.setFormError(
                                true,
                                ' * Ports have not been added!'
                            );
                            return false;
                        }

                        formData = { ...formData, ...portsInfo };
                        formData['connections'] = this.formModal_info.data
                            ? this.formModal_info.data['connections']
                            : null;

                        // set preDefData
                        if (this.formModal_info.preDefData)
                            formData['preDefData'] =
                                this.formModal_info.preDefData;

                        if (formData) {
                            if (!this.formModal_info.editMode)
                                this.makeNode(formData, this.formModal_info);
                            else if (this.formModal_info.editMode) {
                                this.updateNode(
                                    formData,
                                    this.formModal_info.node?.id ?? 0,
                                    this.formModal_info.node.type ??
                                        this.formModal_info.node.class
                                );
                            }

                            this.modalComponent._closeModal(true);
                        } else {
                            this.setFormError(
                                true,
                                ' * The form is not completed!'
                            );
                        }
                    } else {
                        this.setFormError(
                            true,
                            ' * Error during getting node data!'
                        );
                        return false;
                    }
                } else {
                    this.setFormError(true, ' * The name is duplicated!');
                }
            }
            // flow
            else if (this.formModal_info.type === 'flow') {
                // save data of connection fields in both sides
                this.energyDrawflowComponent.saveConnectionInNodes(
                    this.formModal_info.data.connection,
                    this.formModal_info.editMode,
                    formData
                );

                this.modalComponent._closeModal(true);
            }
        } else {
            this.setFormError(true, ' * Complete the form!');
        }

        return true;
    }

    calculateEpCosts() {
        this.setFormCalError(false, '');

        let formData = this.formCalComponent.submit();

        if (formData) {
            const epCosts: number | false = this.energyDesignService.epCostsCal(
                {
                    capex: formData.capex,
                    zinsatz: formData.zinsatz,
                    lifetime: formData.lifetime,
                    opexPercentage: formData.opexpercentage,
                }
            );
            if (!epCosts) {
                this.setFormCalError(
                    true,
                    'zinsatz (interest rate) must be between 0 and 1!'
                );
            } else {
                this.formComponent.setFieldData('ep_costs', epCosts);
                this.closeModalEpCostsCalculator();
            }
        } else this.setFormCalError(true, ' * The form is not completed!');
    }

    makeNode(formValue: any, formModalInfo: FormModalInfo) {
        this.energyDrawflowComponent.addNode({
            id: formModalInfo.node?.type,
            name: formValue.name,
            data: formValue,
            inp: formValue.inp,
            out: formValue.out,
            position: {
                x: formModalInfo.node?.position.x,
                y: formModalInfo.node?.position.y,
            },
        });
    }

    updateNode(data: any, nodeId: number, nodeType: string) {
        this.energyDrawflowComponent.updateNode(nodeId, nodeType, data);
        this.toastService.success('Node edited.');
    }

    toggleFullScreen() {
        this.isFullscreen = !this.isFullscreen;
        this.contentLayoutService.setScreenFull(this.isFullscreen);
    }

    getData() {
        return this.energyDrawflowComponent.getData();
    }

    ngOnDestroy() {
        this.isFullscreen = false;
        this.contentLayoutService.setScreenFull(this.isFullscreen);
    }
}
