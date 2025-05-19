import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { OrderListComponent } from '../order-list/order-list.component';

@Component({
    selector: 'app-form',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OrderListComponent,
    ],
    templateUrl: './form.component.html',
    styleUrl: './form.component.scss',
})
export class FormComponent {
    form!: FormGroup;
    formVisible: boolean = false;

    // @Input() formData!: any;
    _formData: any;
    @Input() set formData(d: any) {
        if (d) {
            this._formData = d;
            this.initForm(this.formData);
        } else this._formData = null;
    }
    get formData() {
        return this._formData;
    }

    @ViewChild('inputs') orderList_inputs!: OrderListComponent;
    @ViewChild('outputs') orderList_outputs!: OrderListComponent;

    @ViewChildren('orderIitems') orderIitems!: QueryList<OrderListComponent>;

    ngOnInit() {}

    initForm(formData: any) {
        this.form = new FormGroup({});

        formData.sections.forEach((section: any) => {
            if (section.name !== 'Ports')
                section.fields.forEach((field: any) => {
                    let fControl: FormControl = new FormControl(
                        {
                            value: field['value'] ? field['value'] : 1,
                            disabled: field.hasOwnProperty('disabled')
                                ? true
                                : null,
                        },
                        []
                    );

                    if (field.isReq)
                        fControl.addValidators(Validators.required);

                    field.name = field.name.toLowerCase().split(' ').join('_');
                    this.form.addControl(field.name, fControl);
                });
        });

        this.formVisible = true;
    }

    submit() {
        if (this.form.valid) {
            const formValue = this.form.getRawValue();

            const hasMultiplePorts = this.formData.sections.find(
                (x: any) => x.name == 'Ports' && x.hasMultiplePorts
            );

            if (hasMultiplePorts) {
                formValue['ports'] = {};

                this.orderIitems.forEach((element: OrderListComponent) => {
                    if (element.id == 'inputs')
                        formValue['ports']['inputs'] = element.data;
                    else if (element.id == 'outputs')
                        formValue['ports']['outputs'] = element.data;
                });
            }

            return formValue;
        } else {
            this.form.markAllAsTouched();
            false;
        }
    }

    toggleControl(fControlName: any) {
        this.form.controls[fControlName].disabled
            ? this.enabelControl(fControlName)
            : this.disableControl(fControlName);
    }

    enabelControl(fControlName: any) {
        this.form.controls[fControlName].enable();
    }

    disableControl(fControlName: any) {
        this.form.controls[fControlName].disable();
    }
}
