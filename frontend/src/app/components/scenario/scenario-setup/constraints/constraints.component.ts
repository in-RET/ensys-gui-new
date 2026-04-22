import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';

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
    // constraintFormInfo!: {
    //     show: boolean;
    // };
    private _constraintFormInfo: { show: boolean } = { show: false };

    get constraintFormInfo(): { show: boolean } {
        return this._constraintFormInfo;
    }

    set constraintFormInfo(value: { show: boolean }) {
        this._constraintFormInfo = value;
    }

    private _data: ConstraintRow[] | null = null;
    @Input() set data(value: ConstraintRow[]) {
        if (value) this.constraintList = value;
    }
    get data(): ConstraintRow[] | null {
        return this._data;
    }

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
        this.constraintList = this.constraintList.filter((x) => x.id !== rowId);
    }

    onEditConstraint(row: ConstraintRow): void {
        this.selectedConstraint = row;
        this.modalConstraint_open();
    }

    toggleConstraintStatus(rowId: number): void {
        const i = this.constraintList.findIndex((X) => X.id == rowId);
        if (i > -1)
            this.constraintList[i].enabled = !this.constraintList[i].enabled;
    }

    getConstraintData(): ConstraintRow[] {
        // const _sampleD: ConstraintModel[] = [
        //     {
        //         key: 'a',
        //         label: 'A',
        //     },
        //     {
        //         key: 'b',
        //         label: 'B',
        //     },
        // ];
        // return _sampleD;
        return this.constraintList;
    }
}
