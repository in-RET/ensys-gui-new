import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import * as bootstrap from 'bootstrap';
import { FormComponent } from '../form/form.component';
import { OrderListComponent } from '../order-list/order-list.component';

@Component({
    selector: 'app-modal',
    imports: [CommonModule, OrderListComponent, FormComponent],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    formData!: any;
    inputPortList!: any[];
    outputPortList!: any[];

    // temp
    isFormValid: boolean = true;
    modal: any;

    @ViewChild('modal') modalRef = {} as ElementRef;
    @ViewChild(FormComponent) formComponent!: FormComponent;
    @ViewChild('inputs') orderList_inputs!: OrderListComponent;
    @ViewChild('outputs') orderList_outputs!: OrderListComponent;

    @Input() node!: any;
    @Input() title!: string;

    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        this.initFormData(this.node.name);

        setTimeout(() => {
            this.modal = new bootstrap.Modal(this.modalRef.nativeElement);
            this.modal.show();
        }, 0);
    }

    initFormData(nodeName: string) {
        // this.form = signal<FormGroup>();

        switch (nodeName) {
            case 'Source':
                this.formData = {
                    sections: [
                        {
                            name: 'Output Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },

                        {
                            name: 'Economical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },

                        {
                            name: 'Technical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'Nominal_value',
                                    placeholder: 'Nominal value',
                                    label: 'Nominal value',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'max',
                                    placeholder: 'max',
                                    label: 'max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'min',
                                    placeholder: 'min',
                                    label: 'min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Nonconvex',
                                    placeholder: 'Nonconvex',
                                    label: 'Nonconvex',
                                    isReq: true,
                                    type: 'number',
                                },
                                {
                                    name: 'Summed_max',
                                    placeholder: 'Summed max',
                                    label: 'Summed max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Summed_min',
                                    placeholder: 'Summed min',
                                    label: 'Summed min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Emission_factor',
                                    placeholder: 'Emission factor',
                                    label: 'Emission factor',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Renewable_factor',
                                    placeholder: 'Renewable factor',
                                    label: 'Renewable factor',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Predefined Source':
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

                        {
                            name: 'Economical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },

                        {
                            name: 'Technical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'Nominal_value',
                                    placeholder: 'Nominal value',
                                    label: 'Nominal value',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'max',
                                    placeholder: 'max',
                                    label: 'max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'min',
                                    placeholder: 'min',
                                    label: 'min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Nonconvex',
                                    placeholder: 'Nonconvex',
                                    label: 'Nonconvex',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Summed_max',
                                    placeholder: 'Summed max',
                                    label: 'Summed max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Summed_min',
                                    placeholder: 'Summed min',
                                    label: 'Summed min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Emission_factor',
                                    placeholder: 'Emission factor',
                                    label: 'Emission factor',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Renewable_factor',
                                    placeholder: 'Renewable factor',
                                    label: 'Renewable factor',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Transformer':
                this.formData = {
                    sections: [
                        {
                            name: 'Name',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    type: 'text',
                                    span: '4',
                                },
                            ],
                        },

                        {
                            name: 'Economical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },

                        {
                            name: 'Technical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'Nominal_value',
                                    placeholder: 'Nominal value',
                                    label: 'Nominal value',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'max',
                                    placeholder: 'max',
                                    label: 'max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'min',
                                    placeholder: 'min',
                                    label: 'min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Nonconvex',
                                    placeholder: 'Nonconvex',
                                    label: 'Nonconvex',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Summed_max',
                                    placeholder: 'Summed max',
                                    label: 'Summed max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Summed_min',
                                    placeholder: 'Summed min',
                                    label: 'Summed min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Renewable_factor',
                                    placeholder: 'Renewable factor',
                                    label: 'Renewable factor',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Predefined Transformer':
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

                        {
                            name: 'Economical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },

                        {
                            name: 'Technical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'e    fficiency',
                                    placeholder: 'Efficiency',
                                    label: 'Efficiency',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'max',
                                    placeholder: 'max',
                                    label: 'max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'min',
                                    placeholder: 'min',
                                    label: 'min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Nonconvex',
                                    placeholder: 'Nonconvex',
                                    label: 'Nonconvex',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Summed_max',
                                    placeholder: 'Summed max',
                                    label: 'Summed max',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Summed_min',
                                    placeholder: 'Summed min',
                                    label: 'Summed min',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Renewable_factor',
                                    placeholder: 'Renewable factor',
                                    label: 'Renewable factor',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'efficiency_el',
                                    placeholder: 'Efficiency el',
                                    label: 'Efficiency el',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'efficiency_th',
                                    placeholder: 'Efficiency th',
                                    label: 'Efficiency th',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'GenericStorage':
                this.formData = {
                    sections: [
                        {
                            name: 'Input Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Output Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '4',
                                },
                            ],
                        },

                        {
                            name: 'Economical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'invest_relation_input_capacity',
                                    placeholder:
                                        'Invest relation input capacity',
                                    label: 'Invest relation input capacity',
                                    isReq: false,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'invest_relation_output_capacity',
                                    placeholder:
                                        'Invest relation output capacity',
                                    label: 'Invest relation output capacity',
                                    isReq: false,
                                    type: 'number',
                                    span: 12,
                                },
                            ],
                        },

                        {
                            name: 'Technical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'Nominal_value',
                                    placeholder: 'Nominal value',
                                    label: 'Nominal value',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'Nonconvex',
                                    placeholder: 'Nonconvex',
                                    label: 'Nonconvex',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },

                                {
                                    name: 'thermal_loss_rate',
                                    placeholder: 'Thermal loss rate',
                                    label: 'Thermal loss rate',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'fixed_thermal_losses_relative',
                                    placeholder:
                                        'Fixed thermal losses relative',
                                    label: 'Fixed thermal losses relative',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'fixed_thermal_losses_absolute',
                                    placeholder:
                                        'Fixed thermal losses absolute',
                                    label: 'Fixed thermal losses absolute',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'balanced',
                                    placeholder: 'Balanced',
                                    label: 'Balanced',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'initial_storage_level',
                                    placeholder: 'Initial storage level',
                                    label: 'Initial storage level',
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'inflow_conversion_factor',
                                    placeholder: 'Inflow conversion factor',
                                    label: 'Inflow conversion factor',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'outflow_conversion_factor',
                                    placeholder: 'Outflow conversion factor',
                                    label: 'Outflow conversion factor',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'Nominal storage capacity',
                                    placeholder: 'Nominal storage capacity',
                                    label: 'Nominal storage capacity',
                                    type: 'number',
                                    span: 12,
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Predefined Storage':
                this.formData = {
                    sections: [
                        {
                            name: 'Input Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Output Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '4',
                                },
                                {
                                    name: 'Storage',
                                    placeholder: 'Storage',
                                    label: 'Choose...',
                                    isReq: true,
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

                        {
                            name: 'Economical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'invest_relation_input_capacity',
                                    placeholder:
                                        'Invest relation input capacity',
                                    label: 'Invest relation input capacity',
                                    isReq: false,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'invest_relation_output_capacity',
                                    placeholder:
                                        'Invest relation output capacity',
                                    label: 'Invest relation output capacity',
                                    isReq: false,
                                    type: 'number',
                                    span: 12,
                                },
                            ],
                        },

                        {
                            name: 'Technical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'Nonconvex',
                                    placeholder: 'Nonconvex',
                                    label: 'Nonconvex',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },

                                {
                                    name: 'thermal_loss_rate',
                                    placeholder: 'Thermal loss rate',
                                    label: 'Thermal loss rate',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'fixed_thermal_losses_relative',
                                    placeholder:
                                        'Fixed thermal losses relative',
                                    label: 'Fixed thermal losses relative',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'fixed_thermal_losses_absolute',
                                    placeholder:
                                        'Fixed thermal losses absolute',
                                    label: 'Fixed thermal losses absolute',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'balanced',
                                    placeholder: 'Balanced',
                                    label: 'Balanced',
                                    isReq: true,
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'initial_storage_level',
                                    placeholder: 'Initial storage level',
                                    label: 'Initial storage level',
                                    type: 'number',
                                    span: 6,
                                },
                                {
                                    name: 'inflow_conversion_factor',
                                    placeholder: 'Inflow conversion factor',
                                    label: 'Inflow conversion factor',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                                {
                                    name: 'outflow_conversion_factor',
                                    placeholder: 'Outflow conversion factor',
                                    label: 'Outflow conversion factor',
                                    isReq: true,
                                    type: 'number',
                                    span: 12,
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Sink':
                this.formData = {
                    sections: [
                        {
                            name: 'Input Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Technical parameters',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'Nominal_value',
                                    placeholder: 'Nominal value',
                                    label: 'Nominal value',
                                    isReq: false,
                                    type: 'number',
                                },

                                {
                                    name: 'Renewable_factor',
                                    placeholder: 'Renewable factor',
                                    label: 'Renewable factor',
                                    isReq: false,
                                    type: 'number',
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Excess':
                this.formData = {
                    sections: [
                        {
                            name: 'Input Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Technical parameters',
                            class: 'col-4',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Export':
                this.formData = {
                    sections: [
                        {
                            name: 'Input Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Technical parameters',
                            class: 'col-12',
                            fields: [
                                {
                                    name: 'variable_costs',
                                    placeholder: 'Variable costs',
                                    label: 'Variable costs',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'Nominal_value',
                                    placeholder: 'Nominal value',
                                    label: 'Nominal value',
                                    isReq: false,
                                    type: 'number',
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'OEP':
                this.formData = {
                    sections: [
                        {
                            name: 'Input Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Technical parameters',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'Nominal_value',
                                    placeholder: 'Nominal value',
                                    label: 'Nominal value',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'Renewable_factor',
                                    placeholder: 'Renewable factor',
                                    label: 'Renewable factor',
                                    isReq: false,
                                    type: 'number',
                                },
                            ],
                        },

                        {
                            name: 'OEP',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'oep_table',
                                    placeholder: 'Table name',
                                    label: 'Table name',
                                    isReq: true,
                                    type: 'text',
                                },
                                {
                                    name: 'oep_column',
                                    placeholder: 'Column name',
                                    label: 'Column name',
                                    isReq: true,
                                    type: 'text',
                                },
                            ],
                        },
                    ],
                };
                break;

            case 'Bus':
                this.formData = {
                    sections: [
                        {
                            name: 'Input Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'inputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
                                    type: 'text',
                                    span: '8',
                                },
                            ],
                        },
                        {
                            name: 'Output Port',
                            class: 'col-6',
                            fields: [
                                {
                                    name: 'outputPort_name',
                                    placeholder: 'Name',
                                    label: 'Name',
                                    isReq: true,
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
                                    type: 'text',
                                    span: '6',
                                },
                                {
                                    name: 'energy_carrier',
                                    placeholder: 'Energy carrier',
                                    label: 'Energy carrier',
                                    isReq: true,
                                    type: 'text',
                                    span: '6',
                                },
                            ],
                        },
                    ],
                };
        }
    }

    submit() {
        if (this.formComponent.form.valid) {
            this.isFormValid = true;
            const formValue = this.formComponent.form.getRawValue();

            if (this.node.name === 'Transformer') {
                formValue['ports'] = {};
                formValue['ports']['inputs'] = this.orderList_inputs.getData();
                formValue['ports']['outputs'] =
                    this.orderList_outputs.getData();
            }
            this.close(formValue);
        } else this.isFormValid = false;
    }

    close(data?: any) {
        this.closeModal.emit(data);
        this.modal.hide();
    }
}
