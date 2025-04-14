import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { OrderListComponent } from '../order-list/order-list.component';

@Component({
    selector: 'app-modal',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OrderListComponent,
    ],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    form!: FormGroup;

    get portImportTotal() {
        return this.form.get('portImportTotal');
    }

    get portExportTotal() {
        return this.form.get('portExportTotal');
    }

    @ViewChild('modal') modalRef = {} as ElementRef;

    @Input() title!: string;

    inputPortList!: any[];
    outputPortList!: any[];

    ngOnInit() {
        this.initForm();

        setTimeout(() => {
            const modal = new bootstrap.Modal(this.modalRef.nativeElement);
            modal.show();
        }, 0);
    }

    initForm() {
        this.form = new FormGroup({
            portImportTotal: new FormControl('', [Validators.required]),
            portExportTotal: new FormControl('', [Validators.required]),
        });
    }
}
