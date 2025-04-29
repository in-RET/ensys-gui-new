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
    @Input() id!: string;
    // @Input() name!: string;

    // @Output('') : EventEmitter<any> =
    //     new EventEmitter<any>();

    ngOnInit() {
        // this.data = [
        //     { id: 0, name: 'a' },
        //     { id: 1, name: 'b' },
        //     { id: 2, name: 'c' },
        // ];
    }

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
