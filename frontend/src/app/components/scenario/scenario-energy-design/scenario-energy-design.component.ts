import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { Tooltip } from 'bootstrap';
import Drawflow from 'drawflow';
import Swal from 'sweetalert2';
import { ContentLayoutService } from '../../../core/layout/services/content-layout.service';
import { EnergyDesignService } from '../services/energy-design.service';
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

    // formData: any;
    formError: any = {
        msg: '',
        isShow: false,
    };

    // for all modals
    formModal_info!: FormModalInfo;

    @ViewChild(EnergyDrawflowComponent)
    energyDrawflowComponent!: EnergyDrawflowComponent;

    @ViewChild('form')
    formComponent!: FormComponent;

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

    clearGridModel() {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will clear the whole grid model! This will not actually delete any asset from the scenario. You will need to save after clearing for the changes to actually take effect.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear everything!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                this.energyDrawflowComponent.editor.clearModuleSelected();
                this.energyDrawflowComponent.saveCurrentDrawflow();
            }
        });
        // .then((result) => save_topology());
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
    showFormModal(e: {
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

        if (e.editMode && e.node) {
            e.data['name'] = e.node.name;
        }

        this.formModal_info.formData = this.energyDesignService.getFormData(
            e.id,
            e.editMode,
            e.data,
            this.defineCallbackFlowForm(e.id)
        );

        this.formModal_info.data = e.data;
        this.formModal_info.editMode = e.editMode;

        // appear Modal
        this.formModal_info.show = true;
    }

    defineCallbackFlowForm(flowType: 'node' | '_flow' | string) {
        // if (flowType == '_flow') {
        let callbackList: any = [];
        callbackList['toggleInvestFields'] = this.toggleInvestFields.bind(this);
        callbackList['toggleFomFields'] = this.toggleFomFields.bind(this);
        callbackList['toggleVisibilitySection'] =
            this.toggleVisibilitySection.bind(this);
        return callbackList;
        // } else return false;
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

    toggleModal(appear: boolean) {}

    closeModal(approve: boolean) {
        if (
            this.formModal_info.type === 'flow' &&
            !this.formModal_info.editMode &&
            !approve
        )
            this.energyDrawflowComponent.removeSingleConnection(
                this.formModal_info.data.connection
            );

        this.formModal_info = new FormModalInfo();
        this.setFormError(false, '');
    }

    // ============================

    setFormError(status: boolean, msg: string) {
        this.formError = {
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
