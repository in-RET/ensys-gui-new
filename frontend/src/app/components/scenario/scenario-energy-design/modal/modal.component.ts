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

@Component({
    selector: 'app-modal',
    imports: [CommonModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    inputPortList!: any[];
    outputPortList!: any[];

    // temp
    isFormValid: boolean = true;
    modal: any;

    @ViewChild('modal') modalRef = {} as ElementRef;

    @Input() node!: any;
    @Input() title!: string;
    @Input() formData!: any;

    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        setTimeout(() => {
            this.modal = new bootstrap.Modal(this.modalRef.nativeElement);
            this.modal.show();
        }, 0);
    }

    submit() {
        // else this.isFormValid = false;
        // this.close(formValue);
    }

    _closeModal() {
        this.modal.hide();
        this.closeModal.emit();
    }
}
