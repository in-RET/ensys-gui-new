import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnergyDesignService } from '../../../services/energy-design.service';
import { ScenarioService } from '../../../services/scenario.service';
import { EnergyDrawflowComponent } from '../../energy-drawflow/energy-drawflow.component';
import { FormComponent } from '../../form/form.component';
import { ModalComponent } from '../../modal/modal.component';
import { EditFormModalInfo } from '../../models/scenario-energy-design.model';
import { ModeOption } from '../../time-series/time-series.component';

interface Connection {
    input_node: string;
    input_port: string;
    output_node: string;
    output_port: string;
}

@Component({
    selector: 'app-flow-form-modal',
    imports: [CommonModule, FormsModule, ModalComponent, FormComponent],
    templateUrl: './flow-form-modal.component.html',
    styleUrl: './flow-form-modal.component.scss',
})
export class FlowFormModalComponent {
    energyDesignService = inject(EnergyDesignService);
    formError: { msg: string | null; isShow: boolean } = {
        msg: '',
        isShow: false,
    };
    // formModal_calculator: any = {
    //     show: false,
    //     title: 'EP Costs Calculator',
    //     action: {
    //         label: undefined,
    //         fn: undefined,
    //     },
    // };

    @Input() modalInfo!: EditFormModalInfo | null;
    @Output() saveConnectionInNode = new EventEmitter<any>();
    @Output() modalClosed = new EventEmitter<boolean | any>();
    @Output() onShowModal_EpCostsCalculator = new EventEmitter<any>();
    @Output() onShowModal_TimeSeries = new EventEmitter<{
        groupName: string;
        controlName: string;
        modes: ModeOption[] | null;
    }>();

    @ViewChild('form')
    formComponent!: FormComponent;
    @ViewChild(EnergyDrawflowComponent)
    energyDrawflowComponent!: EnergyDrawflowComponent;

    scenarioService = inject(ScenarioService);

    async ngOnChanges() {
        if (this.modalInfo) {
            this.initializeFlowForm();
        }
    }

    async initializeFlowForm() {
        if (!this.modalInfo) return;

        this.modalInfo.node.data.preDefData = this.modalInfo.data.preDefData;

        // when edit flow, so load its data
        if (this.modalInfo.data)
            this.modalInfo.data = {
                ...this.modalInfo.data,
            };

        let nodeType = this.modalInfo.node.class;

        if (this.modalInfo.connection) {
            // this.modalInfo.data.connection = this.modalInfo.connection;
            // const connections: Connection = this.modalInfo.data.connection;
            const connections: Connection = this.modalInfo.connection;

            // if flow is creating for 1st time
            if (this.modalInfo.data.preDefData) {
                const fData = this.modalInfo.data.preDefData;

                if (this.modalInfo.node.id === +connections.input_node) {
                    const currentPortNum_in =
                        +connections['input_port'].split('_')[1];
                    this.modalInfo.data =
                        fData.inputs[currentPortNum_in - 1]['flow_data'] || {};
                } else if (
                    this.modalInfo.node.id === +connections.output_node
                ) {
                    const currentPortNum_out =
                        +connections['output_port'].split('_')[1];
                    this.modalInfo.data =
                        fData.outputs[currentPortNum_out - 1]['flow_data'] ||
                        {};
                }
            }
        }

        this.modalInfo.formData =
            await this.energyDesignService.getFormFields_flow(
                nodeType,
                this.modalInfo.editMode,
                this.modalInfo.node?.data?.oep,
                this.modalInfo.data,
                this.defineCallbackFlowForm(),
                this.modalInfo.node?.data?.preDefData,
            );

        this.modalInfo.url = this.scenarioService.getEntityInfoUrl('flow');
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

    submitForm() {
        if (!this.modalInfo) return;

        // for flow, if OEP is on
        // if (this.modalInfo.node.data.oep) {
        //     const isOepSelected = this.modalInfo.node.data.oep;

        //     let formData = this.formComponent.submit(!isOepSelected);

        //     // now, call state serv and fill data out
        //     // save data of connection fields in both sides
        //     this.saveConnectionInNode.emit({
        //         connection: this.modalInfo.data.connection,
        //         editMode: this.modalInfo.editMode,
        //         data: formData,
        //     });

        //     // this.saveCurrentDrawflow();
        // }

        const findOEPFieldData = (
            field: any | undefined,
        ): boolean | undefined => {
            if (!field) return undefined;
            return Object.keys(field).some((k) => k === 'oep')
                ? field['oep']
                : undefined;
        };

        let isOepSelected: boolean;
        isOepSelected = findOEPFieldData(this.modalInfo.data) ?? false;

        if (this.modalInfo.editMode)
            isOepSelected =
                findOEPFieldData(this.modalInfo.node.data.oep) ?? false;

        if (isOepSelected === undefined)
            isOepSelected =
                findOEPFieldData(this.modalInfo.node.data.oep) ?? false;

        let formData = this.formComponent.submit(!isOepSelected);

        if (formData) {
            // save data of connection fields in both sides
            this.saveConnectionInNode.emit({
                connection: this.modalInfo.connection,
                editMode: this.modalInfo.editMode,
                data: formData,
            });
            this.closeModal(true);
        } else {
            this.setFormError(true, ' * Complete the form!');
        }
    }

    closeAndDeleteConnection() {
        if (this.modalInfo && !this.modalInfo.editMode)
            this.modalClosed.emit({
                approved: false,
                shouldConnectionDelete: true,
                connection: this.modalInfo.connection,
            });
        else
            this.modalClosed.emit({
                approved: false,
                shouldConnectionDelete: false,
            });
    }

    closeModal(approved: boolean) {
        if (!approved) this.closeAndDeleteConnection();
        else this.modalClosed.emit({ approved: approved });
        this.cleanFormError();
    }

    private defineCallbackFlowForm() {
        return {
            toggleInvestFields: this.toggleInvestFields.bind(this),
            toggleFomFields: this.toggleFomFields.bind(this),
            toggleVisibilitySection: this.toggleVisibilitySection.bind(this),
            showModal_EpCostsCalculator:
                this.showModal_EpCostsCalculator.bind(this),
            showModal_TimeSeries: this.showModal_TimeSeries.bind(this),
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
        this.onShowModal_EpCostsCalculator.emit({
            action: {
                label: 'ƒ',
                fn: 'calculateEpCosts',
            },
            formData: this.energyDesignService.getFormFieldsEpCosts(),
        });
    }

    calculateEpCosts(epCosts: number) {
        this.formComponent.setFieldData('ep_costs', epCosts);
    }

    /**
     *
     * @param controlName
     * @param options { component: string, groupName: string // for like transform , modes: Array<{value: string, label: string}> , ...  }
     */
    private showModal_TimeSeries(e: {
        controlName: string;
        modes: ModeOption[] | null;
        // options?: {
        //     id: string;
        //     group: string;
        // };
    }) {
        // clear previous data
        let timeSeriesData: {
            groupName: string;
            controlName: string;
            modes: ModeOption[] | null;
        } = {
            groupName: 'flow',
            controlName: e.controlName,
            modes: [],
        };

        // condirions: filed is 'fix' && not from node 'source' || 'sink'
        // if (!e.modes && this.modalInfo) {
        if (this.modalInfo) {
            if (e.modes) timeSeriesData.modes = e.modes;
            else if (
                this.modalInfo.node.class !== 'source' &&
                this.modalInfo.node.class !== 'sink'
            ) {
                timeSeriesData.modes = [
                    { value: 'file', label: 'CSV File' },
                    { value: 'number', label: 'Single Value' },
                ];
            }
        }

        this.onShowModal_TimeSeries.emit(timeSeriesData);
    }

    setTimeSeriesData(controlName: string, data: number[]) {
        this.formComponent.setFieldData(controlName, data);
    }
}
