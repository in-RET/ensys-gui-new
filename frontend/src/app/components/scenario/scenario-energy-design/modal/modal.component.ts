import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';

@Component({
    selector: 'app-modal',
    imports: [CommonModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    modal: any;

    @ViewChild('modal') modalRef = {} as ElementRef;

    @Input() title!: string;
    @Input() formData!: any;

    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        setTimeout(() => {
            // this.modal = new bootstrap.Modal(this.modalRef.nativeElement);
            this.modal = new (window as any).bootstrap.Modal(
                this.modalRef.nativeElement
            );
            this.modal.show();
        }, 0);
    }

    _closeModal(approve: boolean) {
        this.modal.hide();
        this.closeModal.emit(approve);
    }
}
