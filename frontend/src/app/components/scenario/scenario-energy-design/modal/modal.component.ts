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

    @ViewChild('modal') modalRef = {} as ElementRef;
    @ViewChild(FormComponent) formComponent!: FormComponent;

    @Input() node!: any;
    @Input() title!: string;

    @Output() closeModal: EventEmitter<null> = new EventEmitter<null>();

    ngOnInit() {
        console.log(this.node.name);

        this.initFormData(this.node.name);

        setTimeout(() => {
            const modal = new bootstrap.Modal(this.modalRef.nativeElement);
            modal.show();
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
        }
    }

    submit() {
        if (this.formComponent.form.valid) {
            this.isFormValid = true;
            const formValue = this.formComponent.form.getRawValue();
            console.log(formValue);
        } else this.isFormValid = false;
    }

    close() {
        this.closeModal.emit();
    }
}
