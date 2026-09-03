import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
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

    // doesn't work!
    @ViewChild('dataTextarea')
    set dataTextarea(element: ElementRef<HTMLTextAreaElement> | undefined) {
        if (element) {
            setTimeout(() => element.nativeElement.focus(), 500);
        }
    }

    @Input() modalInfo: boolean | null = false;

    @Output() modalClosed = new EventEmitter<boolean>();
    @Output() onUploadData: EventEmitter<string | null> = new EventEmitter<
        string | null
    >();

    onSubmitData() {
        this.onUploadData.emit(this.data);
    }

    closeModal(approve: boolean) {
        this.data = null;
        this.modalClosed.emit(approve);
    }

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }
}
