import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';

@Component({
    selector: 'app-upload-data',
    imports: [CommonModule, ModalComponent, FormsModule],
    templateUrl: './upload-data.component.html',
    styleUrl: './upload-data.component.scss',
})
export class UploadDataComponent {
    data: string | null = null;
    formError: { msg: string | null; isShow: boolean } = {
        msg: '',
        isShow: false,
    };

    @Input() modalInfo: boolean | null = false;

    @Output() modalClosed = new EventEmitter<boolean>();
    @Output() onUploadData: EventEmitter<string | null> = new EventEmitter<
        string | null
    >();

    onFileSelect(event: Event): void {
        const input = event.target;
        if (!(input instanceof HTMLInputElement) || !input.files?.length) {
            return;
        }

        const file = input.files[0];
        this.formError = { msg: '', isShow: false };

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                this.setFormError(
                    true,
                    'Unable to read the selected file as text.',
                );
                return;
            }

            this.data = reader.result;
        };
        reader.onerror = () => {
            this.setFormError(true, 'Unable to read the selected file.');
        };
        reader.readAsText(file);
        input.value = '';
    }

    onSubmitData() {
        this.onUploadData.emit(this.data);
    }

    closeModal(approve: boolean) {
        this.modalClosed.emit(approve);
    }

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }
}
