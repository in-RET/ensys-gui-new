import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { CalculatorModalComponent } from './modals/calculator-modal/calculator-modal.component';
import { FlowFormModalComponent } from './modals/flow-form-modal/flow-form-modal.component';
import { ModalState, ModalStateService } from './modals/modal-state.service';
import { NodeFormModalComponent } from './modals/node-form-modal/node-form-modal.component';
import { SimulationModalComponent } from './modals/simulation-modal/simulation-modal.component';
import { TimeSeriesModalComponent } from './modals/time-series-modal/time-series-modal.component';
import { FormModalInfo } from './models/scenario-energy-design.model';
import { ModeOption } from './time-series/time-series.component';

@Component({
    selector: 'app-scenario-energy-design',
    imports: [
        CommonModule,
        FormsModule,
        EnergyComponentsComponent,
        EnergyDrawflowComponent,
        NodeFormModalComponent,
        FlowFormModalComponent,
        CalculatorModalComponent,
        TimeSeriesModalComponent,
        SimulationModalComponent,
    ],
    templateUrl: './scenario-energy-design.component.html',
    styleUrl: './scenario-energy-design.component.scss',
})
export class ScenarioEnergyDesignComponent {
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

    formModal_calculator: any = {
        show: false,
        title: 'EP Costs Calculator',
        action: {
            label: undefined,
            fn: undefined,
        },
    };

    @ViewChild(EnergyDrawflowComponent)
    energyDrawflowComponent!: EnergyDrawflowComponent;

    @ViewChild('form')
    formComponent!: FormComponent;
    @ViewChild(ModalComponent)
    modalComponent!: ModalComponent;
    @ViewChild(NodeFormModalComponent)
    nodeFormModalComponent!: NodeFormModalComponent;
    @ViewChild(FlowFormModalComponent)
    flowFormModalComponent!: FlowFormModalComponent;

    @Input() currentScenario: any;

    contentLayoutService = inject(ContentLayoutService);
    energyDesignService = inject(EnergyDesignService);
    scenarioService = inject(ScenarioService);
    flowService = inject(FlowService);
    toastService = inject(ToastService);
    modalStateService = inject(ModalStateService);

    toggleFullScreen() {
        this.isFullscreen = !this.isFullscreen;
        this.contentLayoutService.setScreenFull(this.isFullscreen);
    }

    getData() {
        return this.energyDrawflowComponent.getData();
    }

    openInfoUrl(url: string | undefined) {
        if (url) window.open(url, '_blank')?.focus();
    }

    makeNode(formValue: any, formModalInfo: FormModalInfo) {
        this.energyDrawflowComponent.drawflow_node_add(
            formModalInfo.node.class,
            formValue.name,
            formValue.inp,
            formValue.out,
            formValue,
            formModalInfo.node.pos_x,
            formModalInfo.node.pos_y,
        );
    }

    updateNode(data: any, nodeId: number, nodeType: string) {
        this.energyDrawflowComponent.drawflow_node_update(
            nodeId,
            nodeType,
            data,
        );
        this.toastService.success('Node edited.');
    }

    onNodeFormSubmitted(e: any) {}

    onNodeFormClosed(e: any) {
        this.modalStateService.closeNodeForm();
    }

    flow_updateConnectionInNode(e: {
        connection: any;
        editMode: boolean;
        data: any;
    }) {
        this.energyDrawflowComponent.saveConnectionInNode(
            e.connection,
            e.editMode,
            e.data,
        );
    }

    onFlowFormSubmitted(e: any) {}

    onFlowFormClosed(e: {
        approved: boolean;
        shouldConnectionDelete?: boolean;
        connection?: any;
    }) {
        if (!e.approved && e.shouldConnectionDelete)
            this.energyDrawflowComponent.removeSingleConnection(e.connection);

        this.modalStateService.closeFlowForm();
    }

    toggleFlowForm() {
        this.modalStateService.toggleFlowForm();
    }

    onShowModal_TimeSeries(e: {
        groupName: string;
        controlName: string;
        modes: ModeOption[] | null;
    }) {
        let currentState!: ModalState;
        const subscription = this.modalStateService.modalState.subscribe(
            (state) => {
                currentState = state;
            },
        );
        subscription.unsubscribe();

        if (currentState.nodeForm) {
            this.modalStateService.toggleNodeForm();
        } else if (currentState.flowForm) {
            this.modalStateService.toggleFlowForm();
        }

        this.modalStateService.openTimeSeries(e);
    }

    onTimeSeriesSubmitted(e: { controlName: string; data: number[] }) {
        if (e) {
            let currentState!: ModalState;
            const subscription = this.modalStateService.modalState.subscribe(
                (state) => {
                    currentState = state;
                },
            );
            subscription.unsubscribe();

            if (
                currentState.timeSeries &&
                currentState.timeSeries.groupName === 'transformer'
            ) {
                this.nodeFormModalComponent.setTimeSeriesData(
                    e.controlName,
                    e.data,
                );
            } else if (
                currentState.timeSeries &&
                currentState.timeSeries.groupName === 'flow'
            ) {
                this.flowFormModalComponent.setTimeSeriesData(
                    e.controlName,
                    e.data,
                );
            }
        }
    }

    onTimeSeriesClosed() {
        this.modalStateService.closeTimeSeries();

        let currentState!: ModalState;
        const subscription = this.modalStateService.modalState.subscribe(
            (state) => {
                currentState = state;
            },
        );
        subscription.unsubscribe();

        if (currentState.nodeForm) {
            this.modalStateService.toggleNodeForm();
        } else if (currentState.flowForm) {
            this.modalStateService.toggleFlowForm();
        }
    }

    onCalculatorOpened(e: { action: any; formData: any }) {
        this.modalStateService.toggleFlowForm();

        this.modalStateService.openCalculator({
            action: e.action,
            formData: e.formData,
        });
    }

    onCalculateEpCosts(epCosts: number) {
        this.flowFormModalComponent.calculateEpCosts(epCosts);
    }

    onCalculatorClosed() {
        this.modalStateService.closeCalculator();
        this.toggleFlowForm();
    }

    showModal_Simulation(scenarioId: number) {
        this.modalStateService.openSimulation({ scenarioId: scenarioId });
    }

    onSimulationClosed() {
        this.modalStateService.closeSimulation();
    }

    ngOnDestroy() {
        this.isFullscreen = false;
        this.contentLayoutService.setScreenFull(this.isFullscreen);
        this.scenarioService.removeDrawflow_Data();
    }
}
