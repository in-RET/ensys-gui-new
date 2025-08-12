import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';

@Component({
    selector: 'app-form',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FileUploaderComponent,
    ],
    templateUrl: './form.component.html',
    styleUrl: './form.component.scss',
})
export class FormComponent {
    form!: FormGroup;
    formVisible = false;

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

    @Output('onSubmit') _onSubmit: EventEmitter<any> = new EventEmitter<any>();

    initForm(formData: any) {
        this.form = new FormGroup({});

        formData.sections.forEach((section: any) => {
            if (section.name !== 'Ports' && section.fields)
                section.fields.forEach((field: any) => {
                    const fControl: FormControl = new FormControl(
                        {
                            value: field['value'] ? field['value'] : null,
                            disabled: field.hasOwnProperty('disabled')
                                ? field['disabled']
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
        const formData = this.checkFormValidation();
        return formData;
    }

    onSubmit() {
        this._onSubmit.emit();
    }

    checkFormValidation() {
        if (this.form.valid) {
            return this.form.getRawValue();
        } else {
            this.form.markAllAsTouched();
            return false;
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

    fileUploaderChange(e: any, fControlName: any) {
        if (e) {
            this.form.controls[fControlName].disabled
                ? this.form.controls[fControlName].enable()
                : this.form.controls[fControlName].disable();
        } else {
            this.form.controls[fControlName].enable();
        }

        this.form.controls[fControlName].setValue(e);
    }

    setFieldData(fControlName: string, val: any) {
        this.form.controls[fControlName].setValue(val);
    }
}
