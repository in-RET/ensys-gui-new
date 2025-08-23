import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { Tooltip } from 'bootstrap';
import Drawflow from 'drawflow';
import { ContentLayoutService } from '../../../core/layout/services/content-layout.service';
import { ToastService } from '../../../shared/services/toast.service';
import { EnergyDesignService } from '../services/energy-design.service';
import { FlowService } from '../services/flow.service';
import { ScenarioService } from '../services/scenario.service';
import { EnergyComponentsComponent } from './energy-components/energy-components.component';
import { EnergyDrawflowComponent } from './energy-drawflow/energy-drawflow.component';
import { FormComponent } from './form/form.component';
import { ModalComponent } from './modal/modal.component';
import { OrderListComponent } from './order-list/order-list.component';

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

class FormModalInfo {
    _id: number | undefined = undefined;
    id: string | undefined = undefined;
    show: boolean = false;
    title: string | undefined = undefined;
    formData: any | undefined = undefined;
    action: any | undefined = undefined;
    data: any | undefined = undefined;
    type: 'node' | 'flow' | undefined = undefined;
    editMode: boolean = false;
    hide: boolean = false;
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

    formError: any = {
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

        this.toastService.show('Saved successfully!', {
            type: 'success',
            position: 'top-right',
        });
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
        this.energyDrawflowComponent.onTouchEnd(e.id, e.name, e.group, e.pos);
    }

    /**
     *
     * @param e => {
     *  id: `${nodeId}`, // to get formData
     * }
     *
     */
    async showFormModal(e: {
        _id: number;
        id: string;
        node?: any;
        type: 'node' | 'flow';
        title: string;
        action: any;
        editMode: boolean;
        data: any;
    }) {
        // clean previous formModal
        this.formModal_info = new FormModalInfo();

        this.formModal_info._id = e._id;
        this.formModal_info.type = e.type;
        this.formModal_info.id = e.id;
        this.formModal_info.title = e.title;
        this.formModal_info.action = e.action;

        if (e.editMode && e.node && this.formModal_info.type == 'node') {
            e.data['name'] = e.node.name;
        }

        this.formModal_info.formData =
            await this.energyDesignService.getFormData(
                e.type,
                e.id,
                e.editMode,
                e.editMode ? e.data : null,
                this.defineCallbackFlowForm()
            );
        this.formModal_info.data = e.data;
        this.formModal_info.editMode = e.editMode;

        // appear Modal
        this.formModal_info.show = true;
    }

    defineCallbackFlowForm() {
        let callbackList: any = [];
        callbackList['toggleInvestFields'] = this.toggleInvestFields.bind(this);

        callbackList['toggleFomFields'] = this.toggleFomFields.bind(this);

        callbackList['toggleVisibilitySection'] =
            this.toggleVisibilitySection.bind(this);

        callbackList['showEpCostsCalculator'] =
            this.showEpCostsCalculator.bind(this);

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

    showEpCostsCalculator() {
        this.formModal_calculator.action = {
            label: 'ƒ',
            fn: 'calculateEpCosts',
        };
        this.formModal_calculator.formData =
            this.energyDesignService.getFormDataEpCosts();

        this.modalComponent.hideModal();
        this.formModal_info.hide = true;
        this.formModal_calculator.show = true;
    }

    onChangePreDefined(e: { option: string; type: string }) {
        console.log(e);

        // get oep data form fields
        if (e.option != 'user_defined') {
            this.formComponent.enabelControl('oep');

            // set oep switch on
            this.formComponent.setFieldData('oep', true);
            this.formComponent.setFieldData('investment', false);

            // disable all fields
            this.formComponent.disableControl('investment');
            this.formComponent.disableControl('nominal_value');

            let lsFields_ = [
                ...[{ name: 'nominal_value' }],
                ...this.energyDesignService.getInvestmentFields(),
            ];

            if (e.type == 'storage') {
                const formData = this.formComponent.form.getRawValue();

                lsFields_ = [
                    ...this.energyDesignService.getDefaultFields_storage(
                        formData
                    ),
                    ...lsFields_,
                ];
            } else {
                lsFields_ = [
                    ...this.energyDesignService.getDefaultFields_flow(),
                    ...lsFields_,
                ];
            }

            lsFields_.forEach((element: any) => {
                // empty fields
                this.formComponent.setFieldData(element.name, null);
                this.formComponent.disableControl(element.name);
            });

            //set data from server
            this.formComponent.setFieldData('nominal_value', 2127716.667);
            this.formComponent.setFieldData('maximum', 10);
            this.formComponent.setFieldData('minimum', 5);
            this.formComponent.setFieldData('ep_costs', 0.41);

            let scenarioBaseData: { project: any; scenario: any } =
                this.scenarioService.restoreBaseInfo_Storage();

            this.flowService
                .getPreDefinedValue(
                    e.option,
                    scenarioBaseData.scenario.simulationYear
                )
                .subscribe({
                    next: (value) => {},
                    error: (err) => {
                        console.log(err);
                        // err.error.detail
                    },
                });
        } else {
            this.formComponent.disableControl('oep');

            // set oep switch off
            this.formComponent.setFieldData('oep', false);
            this.formComponent.setFieldData('investment', false);

            // enable all fields
            this.formComponent.enabelControl('investment');
            this.formComponent.enabelControl('nominal_value');

            const lsFields_forEnable =
                e.type != 'storage'
                    ? [...this.energyDesignService.getDefaultFields_flow()]
                    : [...this.energyDesignService.getDefaultFields_storage()];
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

            // clear data
            this.formComponent.setFieldData('nominal_value', null);
            this.formComponent.setFieldData('maximum', null);
            this.formComponent.setFieldData('minimum', null);
            this.formComponent.setFieldData('ep_costs', null);
        }
    }

    toggleOEP(type?: string) {
        // user input data
        if (!this.formComponent.form.controls['oep'].value) {
            this.formComponent.enabelControl('investment');
            this.formComponent.enabelControl('nominal_value');
            this.formComponent.setFieldData('investment', false);

            const lsFields_ =
                type == 'storage'
                    ? [...this.energyDesignService.getDefaultFields_storage()]
                    : [...this.energyDesignService.getDefaultFields_flow()];

            lsFields_.forEach((element: any) => {
                this.formComponent.enabelControl(element.name);
            });
        } else {
            this.formComponent.disableControl('investment');
            this.formComponent.disableControl('nominal_value');

            let lsFields_ = [...this.energyDesignService.getInvestmentFields()];
            lsFields_ =
                type == 'storage'
                    ? [
                          ...this.energyDesignService.getDefaultFields_storage(),
                          ...lsFields_,
                      ]
                    : [
                          ...this.energyDesignService.getDefaultFields_flow(),
                          ...lsFields_,
                      ];

            lsFields_.forEach((element: any) => {
                this.formComponent.disableControl(element.name);
            });
        }
    }

    // ============================

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    setFormCalError(status: boolean, msg: string) {
        this.formCalError = {
            msg: msg,
            isShow: status,
        };
    }

    submitFormData() {
        let formData = this.formComponent.submit();

        if (formData) {
            // new-node
            if (this.formModal_info.type === 'node' && this.formModal_info.id) {
                const isNodeNameDuplicate =
                    this.energyDrawflowComponent.checkNodeDuplication(
                        formData.name,
                        this.formModal_info._id
                    );

                if (!isNodeNameDuplicate) {
                    // add port count(in-out) + transform data
                    formData = this.energyDesignService.getNodePorts(
                        formData,
                        this.formModal_info.id,
                        this.transform_inputs,
                        this.transform_outputs,
                        this.formModal_info.data.node?.groupName
                    );

                    formData['connections'] =
                        this.formModal_info.data['connections'];

                    if (formData) {
                        if (!this.formModal_info.editMode)
                            this.makeNode(formData, this.formModal_info);
                        else if (
                            this.formModal_info.editMode &&
                            this.formModal_info._id
                        )
                            this.updateNode(
                                formData,
                                this.formModal_info._id,
                                this.formModal_info.id
                            );

                        this.modalComponent._closeModal(true);
                    } else {
                        this.setFormError(
                            true,
                            ' * The form is not completed!'
                        );
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
            id: formModalInfo.id,
            name: formValue.name,
            data: formValue,
            inp: formValue.inp,
            out: formValue.out,
            position: {
                x: formModalInfo.data.node.position.x,
                y: formModalInfo.data.node.position.y,
            },
        });
    }

    updateNode(data: any, nodeId: number, nodeType: string) {
        if (nodeId && nodeType)
            this.energyDrawflowComponent.updateNode(nodeId, nodeType, data);
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
