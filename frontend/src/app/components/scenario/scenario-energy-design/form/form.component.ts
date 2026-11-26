import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { NumberOnlyDirective } from '../../../../shared/directives/form-fileld/number-only.directive';
import { TimeSeriesSummaryDirective } from '../../../../shared/directives/form-fileld/time-series-summary.directive';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';

@Component({
    selector: 'app-form',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FileUploaderComponent,
        NumberOnlyDirective,
        TimeSeriesSummaryDirective,
    ],
    templateUrl: './form.component.html',
    styleUrl: './form.component.scss',
})
export class FormComponent {
    form!: FormGroup;
    formVisible: boolean = false;

    _formData: any;
    @Input() set formData(d: any) {
        if (d) {
            this._formData = d;
            this.initForm();
        } else this._formData = null;
    }
    get formData() {
        return this._formData;
    }

    @Output('onSubmit') _onSubmit: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() { }

    initForm() {
        this.form = new FormGroup({});
        this.formData.sections.forEach((section: any) => {
            if (section.name !== 'Ports' && section.fields)
                section.fields.forEach((field: any) => {
                    let fControl: FormControl = new FormControl(
                        {
                            value: field['value'] ? field['value'] : null,
                            disabled: field.hasOwnProperty('disabled')
                                ? field['disabled']
                                : null,
                        },
                        [],
                    );

                    if (field.isReq)
                        fControl.addValidators(Validators.required);

                    field.name = field.name.toLowerCase().split(' ').join('_');
                    this.form.addControl(field.name, fControl);
                });
        });

        this.formVisible = true;
    }

    submit(checkFormValidation: boolean = true) {
        if (checkFormValidation) return this.checkFormValidation();
        else return this.form.getRawValue();
    }

    onSubmit() {
        this._onSubmit.emit();
    }

    getRawValue() {
        return this.form.getRawValue();
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
        if (this.form.controls[fControlName.toLocaleLowerCase()])
            this.form.controls[fControlName].disabled
                ? this.enabelControl(fControlName)
                : this.disableControl(fControlName);
    }

    enabelControl(fControlName: any) {
        if (this.form.controls[fControlName.toLocaleLowerCase()])
            this.form.controls[fControlName.toLocaleLowerCase()].enable();
    }

    disableControl(fControlName: any) {
        if (this.form.controls[fControlName.toLocaleLowerCase()])
            this.form.controls[fControlName.toLocaleLowerCase()].disable();
    }

    fileUploaderChange(e: any, fControlName: any) {
        if (this.form.controls[fControlName.toLocaleLowerCase()])
            this.form.controls[fControlName.toLocaleLowerCase()].setValue(e);
    }

    setFieldData(fControlName: string, val: any) {
        if (this.form.get(fControlName.toLowerCase()))
            this.form.get(fControlName.toLowerCase())?.setValue(val);
        else {
            const keys = fControlName.split('.');
            let group: FormGroup = this.form;
            keys.slice(0, -1).forEach((key) => {
                let control = group.get(key);

                if (!(control instanceof FormGroup)) {
                    control = new FormGroup({});
                    group.addControl(key, control);
                }

                group = control as FormGroup;
            });

            const lastKey = keys[keys.length - 1];

            if (!group.contains(lastKey)) {
                group.addControl(lastKey, new FormControl(val));
            } else {
                group.get(lastKey)?.setValue(val);
            }
        }
    }

    getFieldData(fControlName: string) {
        if (this.form.get(fControlName.toLowerCase()))
            return this.form.get(fControlName.toLowerCase())?.value;
        else

            return null;

    }

    setFieldError(fControlName: string, errorMsg: string) {
        if (this.form.get(fControlName.toLowerCase())) {
            this.form.get(fControlName.toLowerCase())?.setErrors({ customError: errorMsg });
        }
    }

}
