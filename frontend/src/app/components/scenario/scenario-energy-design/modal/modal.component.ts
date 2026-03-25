import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { Modal } from 'bootstrap';

@Component({
    selector: 'app-modal',
    imports: [CommonModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnInit, OnDestroy {
    modal: any;

    @Input() title!: string;
    @Input() formData!: any;
    @Input() size: 'sm' | '' | 'lg' | 'xl' = 'xl'; // sm, md, lg, xl, full
    @Input() hasActions: boolean = true;
    @Input() show: boolean = true;

    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('modal') modalEl!: ElementRef;
    private isInitialized = false;

    ngOnInit() {
        // setTimeout(() => {
        //     this.modal = new (window as any).bootstrap.Modal(
        //         this.modalRef.nativeElement,
        //     );
        //     this.modal.show();
        // }, 0);
    }

    ngAfterViewInit() {
        this.modal = new Modal(this.modalEl.nativeElement);
        this.isInitialized = true;

        // sync initial state
        this.syncModal();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['show'] && this.isInitialized) {
            this.syncModal();
        }
    }

    private syncModal() {
        if (this.show) {
            this.modal.show();
        } else {
            this.modal.hide();
        }
    }

    _closeModal(approve: boolean) {
        this.closeModal.emit(approve);
    }

    hideModal() {
        this.modal.hide();
    }

    showModal() {
        this.modal.show();
    }

    ngOnDestroy() {
        this.hideModal();
    }
}
