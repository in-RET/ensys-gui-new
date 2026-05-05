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
    @Input() allConstraints!: ConstraintRow[];

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
            const fieldDefaultName =
                type +
                '_' +
                (this.allConstraints.filter((X) => X.type === type).length + 1);

            group.addControl(
                field.key,
                new FormControl(
                    {
                        value:
                            data && field.key && data.values[field.key]
                                ? data.values[field.key]
                                : field.defaultValue ||
                                  (field.type === 'number'
                                      ? 0
                                      : fieldDefaultName),
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

        const nextId = Math.max(0, ...this.allConstraints.map((c) => c.id)) + 1;
        const values = this.dynamicFieldsGroup.getRawValue();
        // clear values
        Object.keys(values).forEach((key) => {
            const val = values[key];
            values[key] = typeof val === 'string' ? val.trim() : val;
        });

        const row: ConstraintRow = {
            id: this.data?.id ?? nextId,
            type: this.form.value.type,
            values: { ...values },
            enabled: true,
        };

        if (this.data) this.onEdit.emit(row);
        else this.onAdd.emit(row);
    }
}
