import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

interface OrderItem {
    id: number;
    name?: string;
    number?: number;
    type?: OrderType;
}

class OrderType {
    id = -1;
    name = '';
}

@Component({
    selector: 'app-order-list',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './order-list.component.html',
    styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit {
    selectedItem!: number | null;
    editableMode = false;
    message!: { type: 'error'; txt: string } | null;

    form!: FormGroup;

    get name() {
        return this.form.controls['name'];
    }
    get num() {
        return this.form.controls['num'];
    }
    get typ() {
        return this.form.controls['typ'];
    }

    @Input() fields!: ('name' | 'num' | 'typ')[];
    @Input() data!: OrderItem[];
    @Input() label!: string;

    @Input() typeList!: OrderType[];
    @Input() typeLabel!: string;
    @Input() acceptDuplicate = true;

    ngOnInit() {
        this.initialForm();
    }

    initialForm() {
        this.form = new FormGroup({});
        this.fields.forEach((element) => {
            this.form.addControl(
                element,
                new FormControl(null, [Validators.required])
            );
        });
    }

    addItem() {
        if (this.form.valid) {
            if (!this.data) this.data = [];

            this.addNewItemToList(
                this.name?.value,
                this.num?.value,
                this.typ?.value
            );
        }
    }

    addNewItemToList(name?: string, number?: number, type?: OrderType) {
        const checkDuplicate = (orderList: OrderItem[], itemName: string) => {
            const arr = new Set(orderList.map((item: OrderItem) => item.name));
            const isDuplicate = arr.has(itemName);
            return isDuplicate;
        };

        if (this.acceptDuplicate) {
            this.data.push({
                id: this.data.length,
                name: name,
                number: number,
                type: type,
            });

            this.clearMessage();
            this.clearForms();
        } else {
            const isDuplicate = checkDuplicate(this.data, this.name.value);

            if (!isDuplicate) {
                this.data.push({
                    id: this.data.length,
                    name: name,
                    number: number,
                    type: type,
                });

                this.clearMessage();
                this.clearForms();
            } else {
                this.setMessage('error', 'Duplicate Name!');
                this.name.setErrors({ incorrect: true });
            }
        }
    }

    clearForms() {
        this.name.setValue(null);

        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();

        this.form.reset();
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

        if (this.fields.includes('num'))
            this.num.patchValue(this.data[i].number);

        if (this.fields.includes('typ')) this.typ.setValue(this.data[i].type);

        this.editableMode = true;
    }

    onEdit(approve: boolean) {
        const checkDuplicate = (
            orderList: OrderItem[],
            itemName: string,
            itemId: number
        ) => {
            const arr = new Set(
                orderList
                    .filter((item: OrderItem) => {
                        return item.id != itemId;
                    })
                    .map((item: OrderItem) => item.name || '')
            );

            const isDuplicate = arr.has(itemName);
            return isDuplicate;
        };

        if (approve) {
            if (this.form.valid) {
                const i = this.data.findIndex((x) => x.id == this.selectedItem);

                if (this.acceptDuplicate) {
                    this.data[i].name = this.name.value;

                    if (this.fields.includes('num'))
                        this.data[i].number = this.num.value;

                    if (this.fields.includes('typ'))
                        this.data[i].type = this.typ.value;

                    this.clearEditMode();
                    this.clearForms();
                    this.clearMessage();
                } else {
                    const isDuplicate = checkDuplicate(
                        this.data,
                        this.name.value,
                        this.data[i].id
                    );

                    if (!isDuplicate) {
                        this.data[i].name = this.name.value;

                        if (this.fields.includes('num'))
                            this.data[i].number = this.num.value;

                        if (this.fields.includes('typ'))
                            this.data[i].type = this.typ.value;

                        this.clearEditMode();
                        this.clearForms();
                        this.clearMessage();
                    } else {
                        this.setMessage('error', 'Duplicate Name!');
                        this.name.setErrors({ incorrect: true });
                    }
                }
            } else {
                this.form.markAsDirty();
                this.form.markAsTouched();
                this.form.markAsPristine();
                this.form.markAllAsTouched();
            }
        } else {
            this.clearEditMode();
            this.clearForms();
            this.clearMessage();
        }
    }

    clearEditMode() {
        this.selectedItem = null;
        this.editableMode = false;
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

    setMessage(type: 'error', txt: string) {
        this.message = { type: type, txt: txt };
    }

    clearMessage() {
        this.message = null;
    }
}
