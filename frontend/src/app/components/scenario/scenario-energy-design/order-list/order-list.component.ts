import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

interface OrderItem {
    id: number;
    name: string;
    type?: OrderType;
}

class OrderType {
    id!: number;
    name!: string;
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
    type: FormControl = new FormControl();
    editableMode: boolean = false;

    @Input() data!: OrderItem[];
    @Input() label!: string;
    @Input() withType: boolean = false;
    @Input() typeList!: OrderType[];
    @Input() typeLabel!: string;

    ngOnInit() {}

    addItem() {
        if (this.withType) {
            if (this.type.value && this.name.value.trim('')) {
                !this.data ? (this.data = []) : null;

                this.data.push({
                    id: this.data.length,
                    name: this.name.value,
                    type: this.type.value,
                });

                this.name.setValue('');
                this.type.setValue(null);
            }
        } else {
            if (this.name.value.trim('')) {
                !this.data ? (this.data = []) : null;

                this.data.push({
                    id: this.data.length,
                    name: this.name.value,
                });

                this.name.setValue('');
                this.type.setValue(null);
            }
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
        const foundItemIndex = this.data.findIndex(
            (x) => x.id == this.selectedItem
        );

        // decrease id
        this.data.forEach((element, index) => {
            index > foundItemIndex ? (element.id -= 1) : null;
        });

        this.data.splice(foundItemIndex, 1);
        this.clearEditMode();
    }

    edit() {
        const i = this.data.findIndex((x) => x.id == this.selectedItem);
        this.name.patchValue(this.data[i].name);
        this.type.patchValue(this.data[i].type);
        this.editableMode = true;
    }

    clearEditMode() {
        this.selectedItem = null;
        this.name.setValue('');
        this.type.setValue(null);
        this.editableMode = false;
    }

    editItem(status: boolean) {
        if (status) {
            const i = this.data.findIndex((x) => x.id == this.selectedItem);
            this.data[i].name = this.name.value;
            this.withType ? (this.data[i].type = this.type.value) : false;
        }

        this.clearEditMode();
    }

    moveItemUpDown(direction: 'down' | 'up') {
        switch (direction) {
            case 'down':
                if (
                    (this.selectedItem || this.selectedItem == 0) &&
                    this.selectedItem < this.data.length - 1
                ) {
                    const i = this.data.findIndex(
                        (x) => x.id == this.selectedItem
                    );

                    this.data[i].id += 1;
                    this.data[i + 1].id -= 1;

                    var element = this.data[i];
                    this.data.splice(i, 1);
                    this.data.splice(i + 1, 0, element);

                    this.selectedItem = element.id;
                }
                break;

            case 'up':
                if (this.selectedItem && this.selectedItem > 0) {
                    const i = this.data.findIndex(
                        (x) => x.id == this.selectedItem
                    );

                    this.data[i].id -= 1;
                    this.data[i - 1].id += 1;

                    var element = this.data[i];
                    this.data.splice(i, 1);
                    this.data.splice(i - 1, 0, element);

                    this.selectedItem = element.id;
                }
                break;
        }
    }

    getData() {
        return this.data;
    }
}
