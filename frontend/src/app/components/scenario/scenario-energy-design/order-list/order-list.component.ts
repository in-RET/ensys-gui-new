import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

interface OrderItem {
    id: number;
    name: string;
}

@Component({
    selector: 'app-order-list',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './order-list.component.html',
    styleUrl: './order-list.component.scss',
})
export class OrderListComponent {
    selectedItem!: number | null;
    name: FormControl = new FormControl('');
    editableMode: boolean = false;

    @Input() data!: OrderItem[];
    @Input() label!: string;

    // @Output('') : EventEmitter<any> =
    //     new EventEmitter<any>();

    addItem() {
        !this.data ? (this.data = []) : null;

        if (this.name.value.trim('')) {
            const newItem: OrderItem = {
                id: this.data.length,
                name: this.name.value,
            };

            this.data.push(newItem);
            this.name.setValue('');
        }
    }
    selectItem(id: number) {
        if (!this.editableMode) {
            id === this.selectedItem
                ? (this.selectedItem = null)
                : (this.selectedItem = id);
        }
    }

    deleteItem() {
        const i = this.data.findIndex((x) => x.id == this.selectedItem);
        this.data.splice(i, 1);
    }

    edit() {
        const i = this.data.findIndex((x) => x.id == this.selectedItem);
        this.name.patchValue(this.data[i].name);
        this.editableMode = true;
    }

    clearEditMode() {
        this.selectedItem = null;
        this.name.setValue('');
        this.editableMode = false;
    }

    editItem(status: boolean) {
        if (status) {
            const i = this.data.findIndex((x) => x.id == this.selectedItem);
            this.data[i].name = this.name.value;
        }

        this.clearEditMode();
    }
}
