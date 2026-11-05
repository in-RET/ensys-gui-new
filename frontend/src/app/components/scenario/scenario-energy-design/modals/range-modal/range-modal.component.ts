import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormComponent } from '../../form/form.component';
import { ModalComponent } from '../../modal/modal.component';
import { FormModalInfo } from '../../models/scenario-energy-design.model';

@Component({
    selector: 'app-range-modal',
    imports: [CommonModule, FormsModule, ModalComponent, FormComponent],
    templateUrl: './range-modal.component.html',
    styleUrl: './range-modal.component.scss',
})
export class RangeModalComponent {
    formError: { msg: string | null; isShow: boolean; } = {
        msg: '',
        isShow: false,
    };

    @Input() modalInfo: FormModalInfo | null = null;
    @Output() formSubmitted = new EventEmitter<any>();
    @Output() modalClosed = new EventEmitter<boolean>();

    @ViewChild('form')
    formComponent!: FormComponent;

    onFormSubmitted() {
        this.cleanFormError();

        let formData = this.formComponent.getRawValue();

        if (+formData.min && +formData.max) {

            if ((this.modalInfo?.data && +formData.min && (this.modalInfo?.data < +formData.min)) &&
                (this.modalInfo?.data && +formData.max && (+formData.max < this.modalInfo?.data))) {
                this.formComponent.setFieldError('min', ' * Out of Range of ' + this.modalInfo?.data + '!');
                this.formComponent.setFieldError('max', ' * Out of Range of ' + this.modalInfo?.data + ' !');
                this.setFormError(true, ' * Out of Range of ' + this.modalInfo?.data + '!');
            }
            else if (this.modalInfo?.data && +formData.min && (this.modalInfo?.data < +formData.min)) {
                this.formComponent.setFieldError('min', ' * Out of Range of ' + this.modalInfo?.data + '!');
                this.setFormError(true, ' * Out of Range of ' + this.modalInfo?.data + '!');
            } else if (this.modalInfo?.data && +formData.max && (+formData.max < this.modalInfo?.data)) {
                this.formComponent.setFieldError('max', ' * Out of Range of ' + this.modalInfo?.data + ' !');
                this.setFormError(true, ' * Out of Range of ' + this.modalInfo?.data + '!');
            } else {
                let submitedData = this.formComponent.submit();

                if (submitedData) {
                    this.formSubmitted.emit({
                        ...formData,
                        fieldName: this.modalInfo?.fieldName,
                    });
                } else this.setFormError(true, ' * The form is not completed!');
            }
        } else this.setFormError(true, ' * The form is not completed!');

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

    closeModal(approve: boolean) {
        this.modalClosed.emit(approve);
        this.cleanFormError();
    }
}
