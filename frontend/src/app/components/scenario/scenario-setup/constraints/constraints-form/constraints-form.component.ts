import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    ConstraintDefinition,
    ConstraintRow,
    ConstraintType,
} from '../models/constraints.model';
import { CONSTRAINT_DEFINITIONS } from '../models/constraints_data.model';

@Component({
    selector: 'app-constraints-form',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './constraints-form.component.html',
    styleUrl: './constraints-form.component.scss',
})
export class ConstraintsFormComponent {
    form!: FormGroup;
    selectedDefinition: ConstraintDefinition | null = null;
    definitions = CONSTRAINT_DEFINITIONS;

    private _data!: ConstraintRow | null;
    @Input() set data(d: ConstraintRow | null) {
        if (d) {
            this._data = d;
        }
    }
    get data(): ConstraintRow | null {
        return this._data;
    }
    @Input() totalRec!: number;

    @Output() onAdd: EventEmitter<ConstraintRow> =
        new EventEmitter<ConstraintRow>();
    @Output() onEdit: EventEmitter<ConstraintRow> =
        new EventEmitter<ConstraintRow>();

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.initialForm();

        if (this.data) this.buildDynamicFields(this.data.type, this.data);

        this.form
            .get('type')
            ?.valueChanges.subscribe((type: ConstraintType) => {
                this.buildDynamicFields(type);
            });
    }

    initialForm() {
        this.form = this.fb.group({
            type: [this.data ? this.data.type : null, Validators.required],
            dynamicFields: this.fb.group({}),
        });
    }

    get dynamicFieldsGroup(): FormGroup {
        return this.form.get('dynamicFields') as FormGroup;
    }

    buildDynamicFields(type: ConstraintType, data?: ConstraintRow): void {
        this.selectedDefinition =
            this.definitions.find((d) => d.type === type) ?? null;

        const group = this.fb.group({});

        this.selectedDefinition?.fields.forEach((field) => {
            group.addControl(
                field.key,
                new FormControl(
                    {
                        value:
                            data && field.key && data.values[field.key]
                                ? data.values[field.key]
                                : field.defaultValue || null,
                        disabled: field.disabled ?? false,
                    },
                    field.required ? Validators.required : [],
                ),
            );
        });

        this.form.setControl('dynamicFields', group);
    }

    submit(): void {
        if (this.form.invalid || !this.selectedDefinition) {
            this.form.markAllAsTouched();
            return;
        }

        const row: ConstraintRow = {
            id: this.data ? this.data.id : ++this.totalRec,
            type: this.form.value.type,
            values: { ...this.dynamicFieldsGroup.value },
            enabled: true,
        };

        if (this.data) this.onEdit.emit(row);
        else this.onAdd.emit(row);
    }
}
