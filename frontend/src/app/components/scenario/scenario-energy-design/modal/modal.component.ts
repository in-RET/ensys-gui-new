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
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
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
                                    name: 'max',
                                    placeholder: 'max',
                                    label: 'max',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'min',
                                    placeholder: 'min',
                                    label: 'min',
                                    isReq: false,
                                    type: 'number',
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
                                },
                                {
                                    name: 'Summed_min',
                                    placeholder: 'Summed min',
                                    label: 'Summed min',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'Emission_factor',
                                    placeholder: 'Emission factor',
                                    label: 'Emission factor',
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
                                },
                                {
                                    name: 'maximum',
                                    placeholder: 'Maximum',
                                    label: 'Maximum',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'minimum',
                                    placeholder: 'Minimum',
                                    label: 'Minimum',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'existing',
                                    placeholder: 'Existing',
                                    label: 'Existing',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'capex',
                                    placeholder: 'Capex',
                                    label: 'Capex',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'opex',
                                    placeholder: 'Opex',
                                    label: 'Opex',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'offset',
                                    placeholder: 'Offset',
                                    label: 'Offset',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'lifetime',
                                    placeholder: 'Lifetime',
                                    label: 'Lifetime',
                                    isReq: false,
                                    type: 'number',
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
                                    name: 'max',
                                    placeholder: 'max',
                                    label: 'max',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'min',
                                    placeholder: 'min',
                                    label: 'min',
                                    isReq: false,
                                    type: 'number',
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
                                },
                                {
                                    name: 'Summed_min',
                                    placeholder: 'Summed min',
                                    label: 'Summed min',
                                    isReq: false,
                                    type: 'number',
                                },
                                {
                                    name: 'Emission_factor',
                                    placeholder: 'Emission factor',
                                    label: 'Emission factor',
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
