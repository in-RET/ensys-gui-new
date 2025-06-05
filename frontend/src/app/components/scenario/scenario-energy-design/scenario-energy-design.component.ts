import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import Drawflow from 'drawflow';
import Swal from 'sweetalert2';
import { ContentLayoutService } from '../../../core/layout/services/content-layout.service';
import { EnergyDesignService } from '../services/energy-design.service';
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

class FormModalInfo {
    id: string | undefined = undefined;
    show: boolean = false;
    title: string | undefined = undefined;
    formData: any | undefined = undefined;
    action: any | undefined = undefined;
    data: any | undefined = undefined;
    type: 'node' | 'flow' | undefined = undefined;
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

    @Input() currentScenario: any;

    contentLayoutService = inject(ContentLayoutService);
    energyDesignService = inject(EnergyDesignService);

    ngOnInit() {
        this.loadEnergyComponents();
        // this.getBaseInfoFromStorage();
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
        type: 'node' | 'flow';
        id: string;
        title: string;
        action: any;
        editMode: boolean;
        data: any;
    }) {
        // clean previous formModal
        this.formModal_info = new FormModalInfo();

        this.formModal_info.type = e.type;
        this.formModal_info.id = e.id;
        this.formModal_info.title = e.title;
        this.formModal_info.action = e.action;
        this.formModal_info.formData = this.energyDesignService.getFormData(
            e.id
        );
        this.formModal_info.show = true;
        this.formModal_info.data = e.data;

        // this.formData = null;
        // this.editMode = e.editMode;
        // this.components.items.forEach(
        //     (group: { group_name: string; group_components: any[] }) => {
        //         group.group_components.forEach(
        //             (component: { id: string; name: string }) => {
        //                 e.node.class === component.id
        //                     ? (e.node.group = group.group_name)
        //                     : false;
        //             }
        //         );
        //     }
        // );
        // this.currentNode = e.node;
        // this.initFormData(e.node.class, this.currentNode.data);
        // this.toggleModal(true);
    }
    // showModalConnection(data?: any) {
    //     this.initFormData(data);
    //     this.toggleModal(true);
    // }

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
        this.energyDrawflowComponent.addNode({
            id: formModalInfo.id,
            name: formValue.name,
            data: { ...formValue },
            inp: formValue.inp,
            out: formValue.out,
            position: {
                x: formModalInfo.data.node.position.x,
                y: formModalInfo.data.node.position.y,
            },
        });
    }

    updateNode(data: any) {
        // this.energyDrawflowComponent.updateNode(this.currentNode.id, data);
    }

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    submitFormData() {
        let _formData = this.formComponent.submit();

        if (_formData) {
            if (
                this.formModal_info &&
                this.formModal_info.id &&
                this.formModal_info.type === 'node'
            ) {
                _formData = this.energyDesignService.getNodePorts(
                    _formData,
                    this.formModal_info.data.node.name,
                    this.formModal_info.id
                );

                const isNodeUnique =
                    this.energyDrawflowComponent.checkNodeDuplication(
                        _formData.name
                    );

                if (isNodeUnique && isNodeUnique !== undefined) {
                    if (this.editMode) {
                        this.updateNode(_formData);
                        this.editMode = false;
                    } else this.makeNode(_formData, this.formModal_info);

                    this.setFormError(false, '');
                    this.modalComponent._closeModal(false);
                } else this.setFormError(true, ' * The name is duplicated!');
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
