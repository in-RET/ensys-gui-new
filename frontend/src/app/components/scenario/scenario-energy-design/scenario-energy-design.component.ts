import { CommonModule } from '@angular/common';
import {
    Component,
    inject,
    Input,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
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

    @ViewChild(FormComponent)
    formComponent!: FormComponent;

    @ViewChild(ModalComponent)
    modalComponent!: ModalComponent;

    // ports
    @ViewChildren('transform_inputs')
    transform_inputs!: QueryList<OrderListComponent>;
    @ViewChildren('transform_outputs')
    transform_outputs!: QueryList<OrderListComponent>;

    @Input() currentScenario: any;

    contentLayoutService = inject(ContentLayoutService);
    energyDesignService = inject(EnergyDesignService);

    ngOnInit() {
        this.loadEnergyComponents();
        // this.getBaseInfoFromStorage();

        setTimeout(() => {
            // this.toggleFullScreen();
        }, 0);
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
        this.formModal_info.formData = this.energyDesignService.getFormData(
            e.id,
            e.data
        );
        this.formModal_info.data = e.data;
        this.formModal_info.editMode = e.editMode;

        // appear Modal
        this.formModal_info.show = true;
    }

    toggleModal(appear: boolean) {}

    closeModal() {
        // this.toggleModal(approve);
        this.formModal_info.show = false;
        this.setFormError(false, '');
        // if (!approve && !this.editMode) {
        //     this.removeSingleConnection(this.currentConnection);
        // }
        // this.editMode = false;
    }

    // ============================

    makeNode(formValue: any, formModalInfo: FormModalInfo) {
        let { ports } = formValue;

        this.energyDrawflowComponent.addNode({
            id: formModalInfo.id,
            name: formValue.name,
            data: { ports },
            inp: formValue.inp,
            out: formValue.out,
            position: {
                x: formModalInfo.data.node.position.x,
                y: formModalInfo.data.node.position.y,
            },
        });
    }

    updateNode(nodeId: number, data: any) {
        this.energyDrawflowComponent.updateNode(nodeId, data);
    }

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    submitFormData() {
        let formData = this.formComponent.submit();

        if (formData) {
            if (
                this.formModal_info &&
                this.formModal_info.id &&
                (this.formModal_info._id || !this.formModal_info.editMode) &&
                this.formModal_info.type === 'node'
            ) {
                const isNodeNameDuplicate =
                    this.energyDrawflowComponent.checkNodeDuplication(
                        formData.name,
                        this.formModal_info._id
                    );

                if (!isNodeNameDuplicate && isNodeNameDuplicate !== undefined) {
                    // transform situation
                    if (this.formModal_info.id === 'transformer') {
                        formData = this.energyDesignService.getTransformPorts(
                            formData,
                            this.transform_inputs,
                            this.transform_outputs
                        );
                    }

                    if (formData && !this.formModal_info.editMode) {
                        formData = this.energyDesignService.getNodePorts(
                            formData,
                            this.formModal_info.data.node.groupName,
                            this.formModal_info.id
                        );

                        if (formData) {
                            this.makeNode(formData, this.formModal_info);

                            this.setFormError(false, '');
                            this.modalComponent._closeModal(false);
                        } else
                            this.setFormError(
                                true,
                                ' * The ports are not completed!'
                            );
                    } else if (
                        this.formModal_info &&
                        this.formModal_info.editMode &&
                        this.formModal_info._id
                    ) {
                        this.updateNode(this.formModal_info._id, formData);

                        this.formModal_info = new FormModalInfo();
                        this.setFormError(false, '');
                        this.modalComponent._closeModal(false);
                    }
                } else {
                    this.setFormError(true, ' * The name is duplicated!');
                }
            }
            // flow
            else if (
                this.formModal_info &&
                this.formModal_info.id &&
                this.formModal_info.type === 'flow'
            ) {
                // save data of connection fields in both sides
                this.energyDrawflowComponent.saveConnectionInNodes(
                    this.formModal_info.data.connection
                );

                this.setFormError(false, '');
                this.modalComponent._closeModal(true);
            }
        } else {
            this.setFormError(true, ' * Complete the form!');
        }
    }

    getData() {
        return this.energyDrawflowComponent.getData();
    }

    toggleFullScreen() {
        this.isFullscreen = !this.isFullscreen;
        this.contentLayoutService.setScreenFull(this.isFullscreen);
    }

    ngOnDestroy() {
        this.isFullscreen = false;
        this.contentLayoutService.setScreenFull(this.isFullscreen);
    }
}
