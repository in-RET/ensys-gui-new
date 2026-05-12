import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewChild,
} from '@angular/core';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../../shared/services/alert.service';
import { ModalComponent } from '../../scenario-energy-design/modal/modal.component';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { ConstraintsFormComponent } from './constraints-form/constraints-form.component';
import { ConstraintRow } from './models/constraints.model';

@Component({
    selector: 'app-constraints',
    imports: [
        CommonModule,
        ModalComponent,
        ConstraintsFormComponent,
        NgbDropdownModule,
    ],
    templateUrl: './constraints.component.html',
    styleUrl: './constraints.component.scss',
})
export class ConstraintsComponent {
    constraintList: ConstraintRow[] = [];
    selectedConstraint!: ConstraintRow | null;

    private _constraintFormInfo: { show: boolean } = { show: false };
    set constraintFormInfo(value: { show: boolean }) {
        this._constraintFormInfo = value;
    }
    get constraintFormInfo(): { show: boolean } {
        return this._constraintFormInfo;
    }

    private _data: ConstraintRow[] | null = null;
    @Input() set data(value: ConstraintRow[]) {
        if (value) this.constraintList = value;
    }
    get data(): ConstraintRow[] | null {
        return this._data;
    }

    @Output() removeConstraintFromFlow: EventEmitter<string> =
        new EventEmitter<string>();
    @Output() addConstraintToFlow: EventEmitter<string> =
        new EventEmitter<string>();
    @Output() toggleConstraintOnFlow: EventEmitter<{
        name: string;
        status: boolean;
    }> = new EventEmitter<{ name: string; status: boolean }>();
    @Output() editConstraintOnFlow: EventEmitter<{ old: string; new: string }> =
        new EventEmitter<{ old: string; new: string }>();

    @ViewChild('constraintsForm') constraintsForm!: ConstraintsFormComponent;

    alertService = inject(AlertService);
    scenarioStateService = inject(ScenarioStateService);

    submitForm() {
        this.constraintsForm.submit();
        this.modalConstraint_close(true);
    }

    addConstraint(d: ConstraintRow) {
        this.constraintList.push(d);
    }

    editConstraint(d: ConstraintRow): void {
        const i = this.constraintList.findIndex((X) => X.id == d.id);
        const constraintName: string = (
            (this.constraintList[i].values['keyword'] as string) ||
            (this.constraintList[i].values['name'] as string)
        )
            .trim()
            .replace(/\s+/g, '_');

        const newConstraintName: string = (
            (d.values['keyword'] as string) || (d.values['name'] as string)
        )
            .trim()
            .replace(/\s+/g, '_');
        if (newConstraintName !== constraintName) {
            this.onEditConstraintOnFlow(constraintName, newConstraintName);
        }

        this.constraintList[
            this.constraintList.findIndex((X) => X.id === d.id)
        ] = d;
        this.modalConstraint_close();
    }

    modalConstraint_open() {
        this.constraintFormInfo = {
            show: true,
        };
    }

    modalConstraint_close(approved?: boolean) {
        if (this.selectedConstraint) this.selectedConstraint = null;

        this.constraintFormInfo = {
            show: false,
        };
    }

    async onDeleteRow(id: number): Promise<void> {
        if (
            await this.alertService.confirm(
                `Are you sure ?`,
                'Delete',
                undefined,
                undefined,
                'warning',
            )
        )
            this.onDeleteConstraint(id);
    }

    onDeleteConstraint(rowId: number) {
        const i = this.constraintList.findIndex((X) => X.id == rowId);
        this.onRemoveConstraintFromFlow(
            (this.constraintList[i].values['keyword'] as string) ||
                (this.constraintList[i].values['name'] as string),
        );

        this.constraintList = this.constraintList.filter((x) => x.id !== rowId);
    }

    onEditConstraint(row: ConstraintRow): void {
        this.selectedConstraint = row;
        this.modalConstraint_open();
    }

    toggleConstraintStatus(rowId: number): void {
        const i = this.constraintList.findIndex((X) => X.id == rowId);

        if (i > -1) {
            this.constraintList[i].enabled = !this.constraintList[i].enabled;
            // const fieldName = (
            //     (this.constraintList[i].values['keyword'] as string) ||
            //     (this.constraintList[i].values['name'] as string)
            // )
            //     .trim()
            //     .replace(/\s+/g, '_');

            // if (this.constraintList[i].enabled)
            //     this.onEnableConstraintFromFlow(fieldName);
            // else this.onDisableConstraintToFlow(fieldName);
        }
    }

    getConstraintData(): ConstraintRow[] {
        return this.constraintList;
    }

    onRemoveConstraintFromFlow(constraintName: string): void {
        this.removeConstraintFromFlow.emit(constraintName);
    }
    onAddConstraintToFlow(constraintName: string): void {
        this.addConstraintToFlow.emit(constraintName);
    }

    onEnableConstraintFromFlow(constraintName: string): void {}
    onDisableConstraintToFlow(constraintName: string): void {}

    onEditConstraintOnFlow(
        old_constraintName: string,
        new_constraintName: string,
    ): void {
        this.editConstraintOnFlow.emit({
            old: old_constraintName.toLowerCase(),
            new: new_constraintName.toLowerCase(),
        });
    }
}
