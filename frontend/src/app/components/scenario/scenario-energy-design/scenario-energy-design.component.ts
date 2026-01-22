import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tooltip } from 'bootstrap';
import Drawflow from 'drawflow';
import { interval, map, Subscription, switchMap } from 'rxjs';
import { ContentLayoutService } from '../../../core/layout/services/content-layout.service';
import { ResDataModel } from '../../../shared/models/http.model';
import { ToastService } from '../../../shared/services/toast.service';
import { FlowData, OEPResponse, Port } from '../models/node.model';
import { ScenarioBaseInfoModel } from '../models/scenario.model';
import { EnergyDesignService, Ports } from '../services/energy-design.service';
import { FlowService } from '../services/flow.service';
import { ScenarioService } from '../services/scenario.service';
import { SimulationResModel } from '../simulation/models/simulation.model';
import { SimulationService } from '../simulation/services/simulation.service';
import { SimulationListCardComponent } from '../simulation/simulation-list/simulation-list-card/simulation-list-card.component';
import { EnergyComponentsComponent } from './energy-components/energy-components.component';
import { EnergyDrawflowComponent } from './energy-drawflow/energy-drawflow.component';
import { FormComponent } from './form/form.component';
import { ModalComponent } from './modal/modal.component';
import {
    OrderItem,
    OrderListComponent,
} from './order-list/order-list.component';
import { TimeSeriesComponent } from './time-series/time-series.component';

interface FormNode {
    type: string;
    name: string;
    position: { x: number; y: number };
    class: string;
    id?: number;
    data?: any;
    oep: boolean;
    preDefData?: any | undefined;
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
    preDefData!:
        | {
              name: string;
              simulationYear: number;
          }
        | undefined;
    flowData: { inputs: FlowData[]; outputs: FlowData[] } | undefined;
    url: string = '';
}

@Component({
    selector: 'app-scenario-energy-design',
    imports: [
        CommonModule,
        FormsModule,
        ModalComponent,
        FormComponent,
        EnergyComponentsComponent,
        EnergyDrawflowComponent,
        OrderListComponent,
        SimulationListCardComponent,
        TimeSeriesComponent,
    ],
    templateUrl: './scenario-energy-design.component.html',
    styleUrl: './scenario-energy-design.component.scss',
})
export class ScenarioEnergyDesignComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    components: any;
    editor!: Drawflow;

    editMode: boolean = false;
    isFullscreen: boolean = false;
    showSimulations: boolean = false;

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
        action: {
            label: undefined,
            fn: undefined,
        },
    };

    simulationList!: SimulationResModel[];
    private subscriptionSimulation!: Subscription;

    timeSeriesModal: any = {
        id: '',
        gtoup: {},
        show: false,
        title: 'Time Series Data',
        action: {
            label: 'Import',
            fn: undefined,
        },
        data: undefined,
        modes: undefined,
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
    simulationService = inject(SimulationService);
    cdr = inject(ChangeDetectorRef);

    @ViewChild('plotDiv', { static: true }) plotDiv!: ElementRef;

    ngOnInit() {
        this.loadEnergyComponents();
    }

    ngAfterViewInit() {
        this.setComponentsToolTip();
    }

    setComponentsToolTip() {
        const tooltipTriggerList = Array.from(
            document.querySelectorAll('[data-bs-toggle="tooltip"]'),
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
                this.defineCallbackFlowForm(),
            );

        if (e.node?.type == 'transformer' || e.node?.class == 'transformer') {
            if (e.editMode) {
                this.formModal_info.data.ports = {
                    ...this.formModal_info.data.ports,
                    editable: !this.formModal_info.data.oep,
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

        if (this.formModal_info.node)
            this.formModal_info.url = this.getEntityInfoUrl(
                this.formModal_info.node.type,
            );
        // appear Modal
        this.formModal_info.show = true;
        console.log(this.formModal_info);
    }

    async showFormModal_flow(e: any) {
        this.formModal_info = new FormModalInfo();
        // load flow data from server
        if (e.node?.data?.preDefData) {
            const pData = e.node.data.preDefData;
            const data = await this.flowService.getPreDefinedValue_ports(
                pData.name,
                pData.simulationYear,
            );
            this.formModal_info.preDefData = {
                name: pData.name,
                simulationYear: pData.simulationYear,
            };
            this.formModal_info.flowData = data;
            this.formModal_info.data = {
                ...e.data,
                connection: e.connection,
            };
        } else this.formModal_info.data = e.data;

        this.formModal_info.type = 'flow';
        this.formModal_info.title = e.title;
        this.formModal_info.action = e.action;
        this.formModal_info.node = e.node;

        let nodeType = e.node?.class ?? '';
        let flowData: any;
        let currentPortNum!: number;
        const connections = this.formModal_info.data.connection;

        for (const key in connections) {
            if (!Object.hasOwn(connections, key)) continue;

            const element = connections[key];

            if (this.formModal_info.node?.id === +element) {
                if (this.formModal_info.flowData == null) break;
                const fData = this.formModal_info.flowData;

                if (key.split('_')[0] === 'input') {
                    currentPortNum = +connections['input_class'].split('_')[1];
                    flowData = fData.inputs[currentPortNum - 1]['flow_data'];
                } else {
                    currentPortNum = +connections['output_class'].split('_')[1];
                    flowData = fData.outputs[currentPortNum - 1]['flow_data'];
                }
            }
        }

        this.formModal_info.formData =
            await this.energyDesignService.getFormFields_flow(
                nodeType,
                e.editMode,
                e.node?.data?.oep,
                this.formModal_info.data,
                this.defineCallbackFlowForm(),
                flowData,
            );

        this.formModal_info.editMode = e.editMode;
        this.formModal_info.url = this.getEntityInfoUrl('flow');
        this.formModal_info.show = true;
    }

    defineCallbackFlowForm() {
        let callbackList: any = [];
        callbackList['toggleInvestFields'] = this.toggleInvestFields.bind(this);

        callbackList['toggleFomFields'] = this.toggleFomFields.bind(this);

        callbackList['toggleVisibilitySection'] =
            this.toggleVisibilitySection.bind(this);

        callbackList['showModalEpCostsCalculator'] =
            this.showModalEpCostsCalculator.bind(this);

        callbackList['onChangePreDefined'] = this.onChangePreDefined.bind(this);

        callbackList['toggleOEP'] = this.toggleOEP.bind(this);

        callbackList['openModal_TimeSeries'] =
            this.openModal_TimeSeries.bind(this);

        return callbackList;
    }

    toggleInvestFields(investmentFields: string[]) {
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

    toggleFomFields(fieldList: string[]) {
        fieldList.forEach((fieldName) => {
            this.formComponent.toggleControl(fieldName);
        });
    }

    toggleVisibilitySection(d: any) {
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

    checkConnectionToDelete() {
        if (
            this.formModal_info &&
            this.formModal_info.type === 'flow' &&
            !this.formModal_info.editMode
        )
            this.energyDrawflowComponent.removeSingleConnection(
                this.formModal_info.data.connection,
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

    showModalEpCostsCalculator() {
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
                        next: (value: OEPResponse) => {
                            // save in/out data port based on predefined item, to use in flow
                            // this.formModal_info.preDefData = value.ports_data;

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
                                        id: this.formModal_info.data.ports
                                            .inputs.length,
                                        name: port.name,
                                        number: port.efficiency ?? 1,
                                    };

                                    this.formModal_info.data.ports.inputs.push(
                                        inputItem,
                                    );
                                }

                                // this.formModal_info.node?.data?.connections?.inputs.forEach(
                                //     (port_a: any, index: number) => {
                                //         // port_a == {'input_X': {baseInfo:..., formInfo:...}  }
                                //         value.ports_data.inputs.forEach(
                                //             (port_b: Port) => {
                                //                 for (const key in port_b.flow_data) {
                                //                     if (
                                //                         Object.prototype.hasOwnProperty.call(
                                //                             port_b.flow_data,
                                //                             key,
                                //                         )
                                //                     ) {
                                //                         port_a[
                                //                             'input_' +
                                //                                 (index + 1)
                                //                         ].formInfo[key] =
                                //                             port_b.flow_data[
                                //                                 key
                                //                             ];
                                //                     }
                                //                 }
                                //             },
                                //         );
                                //     },
                                // );

                                // this.formModal_info.data?.connections?.inputs.forEach(
                                //     (port_a: any, index: number) => {
                                //         // port_a == {'input_X': {baseInfo:..., formInfo:...}  }
                                //         value.ports_data.inputs.forEach(
                                //             (port_b: Port) => {
                                //                 for (const key in port_b.flow_data) {
                                //                     if (
                                //                         Object.prototype.hasOwnProperty.call(
                                //                             port_b.flow_data,
                                //                             key,
                                //                         )
                                //                     ) {
                                //                         port_a[
                                //                             'input_' +
                                //                                 (index + 1)
                                //                         ].formInfo[key] =
                                //                             port_b.flow_data[
                                //                                 key
                                //                             ];
                                //                     }
                                //                 }
                                //             },
                                //         );
                                //     },
                                // );
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
                                        id: this.formModal_info.data.ports
                                            .outputs.length,
                                        name: port.name,
                                        number: port.efficiency ?? 1,
                                    };

                                    this.formModal_info.data.ports.outputs.push(
                                        outputItem,
                                    );
                                }

                                // this.formModal_info.node?.data?.connections?.outputs.forEach(
                                //     (port_a: any, index: number) => {
                                //         // port_a == {'output_X': {baseInfo:..., formInfo:...}  }
                                //         value.ports_data.outputs.forEach(
                                //             (port_b: Port) => {
                                //                 for (const key in port_b.flow_data) {
                                //                     if (
                                //                         Object.prototype.hasOwnProperty.call(
                                //                             port_b.flow_data,
                                //                             key,
                                //                         )
                                //                     ) {
                                //                         port_a[
                                //                             'output_' +
                                //                                 (index + 1)
                                //                         ].formInfo[key] =
                                //                             port_b.flow_data[
                                //                                 key
                                //                             ];
                                //                     }
                                //                 }
                                //             },
                                //         );
                                //     },
                                // );

                                // this.formModal_info.data?.connections?.outputs.forEach(
                                //     (port_a: any, index: number) => {
                                //         // port_a == {'output_X': {baseInfo:..., formInfo:...}  }
                                //         value.ports_data.outputs.forEach(
                                //             (port_b: Port) => {
                                //                 for (const key in port_b.flow_data) {
                                //                     if (
                                //                         Object.prototype.hasOwnProperty.call(
                                //                             port_b.flow_data,
                                //                             key,
                                //                         )
                                //                     ) {
                                //                         port_a[
                                //                             'output_' +
                                //                                 (index + 1)
                                //                         ].formInfo[key] =
                                //                             port_b.flow_data[
                                //                                 key
                                //                             ];
                                //                     }
                                //                 }
                                //             },
                                //         );
                                //     },
                                // );
                            });

                            // set form fields
                            this.formComponent.setFieldData('oep', true);
                            // this.formModal_info.data
                            //     ? (this.formModal_info.data.oep = true)
                            //     : null;
                            this.formModal_info.node
                                ? (this.formModal_info.node.oep = true)
                                : null;

                            // this.formComponent.setFieldData(
                            //     'inputPort_name',
                            //     null
                            // );
                            // this.formComponent.setFieldData(
                            //     'outputPort_name',
                            //     null
                            // );
                            // disable all fields

                            this.formComponent.enabelControl('oep');
                            this.formComponent.disableControl('inputPort_name');
                            this.formComponent.disableControl(
                                'outputPort_name',
                            );

                            // set icon name for node's icon, based on predefined item
                            // this.formModal_info.data.icon_name = option;

                            if (scenarioBaseData && scenarioBaseData.scenario)
                                this.formModal_info.preDefData = {
                                    name: option,
                                    simulationYear:
                                        scenarioBaseData.scenario
                                            .simulationYear,
                                };
                        },
                        error: (err) => {
                            this.toastService.error(
                                err.error && err.error.detail
                                    ? err.error.detail
                                    : 'error',
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
            this.formModal_info.data.oep = false;
            this.formModal_info.data
                ? (this.formModal_info.data.oep = false)
                : null;
            this.formModal_info.node
                ? (this.formModal_info.node.oep = false)
                : null;

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
                        next: (value: OEPResponse) => {
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

                            value.ports_data.outputs.forEach((port: Port) => {
                                this.formComponent.setFieldData(
                                    'outputPort_name',
                                    port.name,
                                );
                            });

                            // save in/out data port based on predefined item, to use in flow
                            // this.formModal_info.preDefData = value.ports_data;

                            if (scenarioBaseData && scenarioBaseData.scenario)
                                this.formModal_info.preDefData = {
                                    name: option,
                                    simulationYear:
                                        scenarioBaseData.scenario
                                            .simulationYear,
                                };
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
        }
    }

    toggleOEP(type?: string) {
        if (this.formModal_info.node)
            this.formModal_info.node.oep =
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

            if (type == 'transformer') {
                this.formModal_info.data.ports.editable =
                    !this.formComponent.form.controls['oep'].value;
            }
        }
    }

    getEntityInfoUrl(nodeName: string) {
        switch (nodeName) {
            case 'source':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#module-oemof.solph.components._source';

            case 'transformer':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#module-oemof.solph.components._converter';

            case 'genericStorage':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#module-oemof.solph.components._generic_storage';

            case 'sink':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#oemof.solph.components._sink.Sink';

            case 'bus':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.busses.html';

            case 'flow':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.flow.html#module-oemof.solph.flows';

            default:
                return 'https://oemof-solph.readthedocs.io';
        }
    }

    // ============================ form handling ============================

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

    submitFormData(): boolean | undefined {
        if (
            this.formModal_info.type == 'flow' &&
            (this.formModal_info.node?.oep ||
                this.formModal_info.node?.data.oep)
        ) {
            const isOepSelected =
                this.formModal_info.node?.oep ??
                this.formModal_info.node?.data.oep;
            let formData = this.formComponent.submit(!isOepSelected);
            // save data of connection fields in both sides
            this.energyDrawflowComponent.saveConnectionInNode(
                this.formModal_info.data.connection,
                this.formModal_info.editMode,
                formData,
            );

            this.modalComponent._closeModal(true);
            return true;
        }

        const findOEPFieldData = (
            field: any | undefined,
        ): boolean | undefined => {
            if (!field) return undefined;
            return Object.keys(field).some((k) => k === 'oep')
                ? field['oep']
                : undefined;
        };

        let isOepSelected: boolean;
        isOepSelected = findOEPFieldData(this.formModal_info.data) ?? false;

        if (this.formModal_info.editMode)
            isOepSelected =
                findOEPFieldData(this.formModal_info.node?.data.oep) ?? false;
        if (isOepSelected === undefined)
            isOepSelected =
                findOEPFieldData(this.formModal_info.node?.oep) ?? false;

        let formData = this.formComponent.submit(!isOepSelected);

        if (formData) {
            if (this.formModal_info.type === 'node') {
                const isNodeNameDuplicate =
                    this.energyDrawflowComponent.checkNodeDuplication(
                        formData.name,
                        this.formModal_info.node?.id ?? 0,
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
                        );

                        if (portsInfo === false) {
                            this.setFormError(
                                true,
                                ' * Ports have not been added!',
                            );
                            return false;
                        }

                        // formData = { ...formData, ...portsInfo };
                        formData = {
                            ...formData,
                            ...portsInfo,
                            preDefData: this.formModal_info.preDefData,
                        };

                        // cause of flow pre-data
                        // formData['connections'] = this.formModal_info.data
                        //     ? this.formModal_info.data['connections']
                        //     : null;

                        // set preDefData
                        // if (this.formModal_info.preDefData)
                        //     formData['preDefData'] =
                        //         this.formModal_info.preDefData;

                        if (formData) {
                            if (!this.formModal_info.editMode)
                                this.makeNode(formData, this.formModal_info);
                            else if (this.formModal_info.editMode) {
                                this.updateNode(
                                    formData,
                                    this.formModal_info.node?.id ?? 0,
                                    this.formModal_info.node.type ??
                                        this.formModal_info.node.class,
                                );
                            }

                            this.modalComponent._closeModal(true);
                        } else {
                            this.setFormError(
                                true,
                                ' * The form is not completed!',
                            );
                        }
                    } else {
                        this.setFormError(
                            true,
                            ' * Error during getting node data!',
                        );
                        return false;
                    }
                } else {
                    this.setFormError(true, ' * The name is duplicated!');
                }
            } else if (this.formModal_info.type === 'flow') {
                // save data of connection fields in both sides
                this.energyDrawflowComponent.saveConnectionInNode(
                    this.formModal_info.data.connection,
                    this.formModal_info.editMode,
                    formData,
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
                },
            );
            if (!epCosts) {
                this.setFormCalError(
                    true,
                    'zinsatz (interest rate) must be between 0 and 1!',
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

    openSimulationsList(scenarioId: number) {
        this.loadSimulations(scenarioId);
    }

    loadSimulationsLoading: boolean = false;
    loadSimulations(scenarioId: number) {
        this.showSimulations = true;
        this.loadSimulationsLoading = true;

        this.simulationService.loadSimulations(scenarioId).subscribe({
            next: (value: ResDataModel<SimulationResModel>) => {
                this.simulationList = value.items;
                this.loadSimulationsLoading = false;
                this.cdr.detectChanges();

                this.subscriptionSimulation = interval(1000) // every 1 second
                    .pipe(
                        switchMap(() => {
                            return this.simulationService.loadSimulations(
                                scenarioId,
                            );
                        }),
                    )
                    .subscribe({
                        next: (value: ResDataModel<SimulationResModel>) => {
                            this.simulationList = value.items;
                            this.loadSimulationsLoading = false;
                        },
                        error: (err) => {
                            console.error(err);
                        },
                    });
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    closeSimulationModal() {
        this.showSimulations = false;
        this.simulationList = [];
        this.subscriptionSimulation.unsubscribe();
    }

    openInfoUrl(url: string | undefined) {
        if (url) window.open(url, '_blank')?.focus();
    }

    /**
     *
     * @param controlName
     * @param options { component: string, groupName: string // for like transform , modes: Array<{value: string, label: string}> , ...  }
     */
    openModal_TimeSeries(e: {
        controlName: string;
        options?: {
            id: string;
            group: string;
        };
    }) {
        if (e.options) {
            this.timeSeriesModal.group = e.options.group;
            this.timeSeriesModal.id = e.options.id;

            if (e.options.group === 'transformer') {
                this.timeSeriesModal.modes = [
                    { value: 'file', label: 'CSV File' },
                    { value: 'number', label: 'Single Value' },
                ];
            }
        } else {
            if (e.controlName) this.timeSeriesModal.id = e.controlName;
            else this.timeSeriesModal.id = e;
        }

        this.modalComponent.hideModal();
        this.formModal_info.hide = true;
        this.timeSeriesModal.show = true;
    }

    closeModal_TimeSeries(data: any) {
        if (this.timeSeriesModal.group === 'transformer') {
            if (this.timeSeriesModal.id == 'inputs')
                this.transform_inputs.submitTimeSeriesData(data);
            else if (this.timeSeriesModal.id == 'outputs')
                this.transform_outputs.submitTimeSeriesData(data);
        } else {
            // if (this.timeSeriesModal.id == 'timeSeries')
            //     this.transform_inputs.submitTimeSeriesData(data);
            // else

            this.formComponent.setFieldData(this.timeSeriesModal.id, data);
        }

        this.timeSeriesModal.show = false;
        this.formModal_info.hide = false;
        this.modalComponent.showModal();
    }

    ngOnDestroy() {
        this.isFullscreen = false;
        this.contentLayoutService.setScreenFull(this.isFullscreen);
        if (this.showSimulations) this.subscriptionSimulation.unsubscribe();
    }
}
