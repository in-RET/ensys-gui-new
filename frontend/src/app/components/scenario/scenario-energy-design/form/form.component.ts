import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-form',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './form.component.html',
    styleUrl: './form.component.scss',
})
export class FormComponent {
    form!: FormGroup;

    @Input() formData!: any;
    // @Input() form!: FormGroup;
    // form = model<FormGroup>();

    // get fControl()

    ngOnInit() {
        if (this.formData) this.initForm();
    }

    initForm() {
        this.form = new FormGroup({});

        this.formData.sections.forEach((section: any) => {
            section.fields.forEach((field: any) => {
                let fControl: FormControl = new FormControl(null, []);

                if (field.isReq) fControl.addValidators(Validators.required);

                this.form.addControl(field.name, fControl);
            });
        });
    }
}
