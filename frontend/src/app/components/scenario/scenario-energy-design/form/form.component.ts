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

    @Input() formData!: any;
    @Input() node!: any;
    // @Input() form!: FormGroup;
    // form = model<FormGroup>();

    // get fControl()

    // @Output() submit: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('inputs') orderList_inputs!: OrderListComponent;
    @ViewChild('outputs') orderList_outputs!: OrderListComponent;

    @ViewChildren('orderIitems') orderIitems!: QueryList<OrderListComponent>;

    ngOnInit() {
        if (this.formData) this.initForm();
    }

    initForm() {
        // console.log(this.formData);

        this.form = new FormGroup({});

        this.formData.sections.forEach((section: any) => {
            if (section.name !== 'Ports')
                section.fields.forEach((field: any) => {
                    // let fControl: FormControl = new FormControl(null, []);
                    let fControl: FormControl = new FormControl('q', []);

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
}
