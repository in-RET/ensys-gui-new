import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ScenarioStateService } from '../../../services/scenario-state.service';

@Component({
    selector: 'app-energy-drag-items',
    imports: [CommonModule],
    templateUrl: './energy-drag-items.component.html',
    styleUrl: './energy-drag-items.component.scss',
})
export class EnergyDragItemsComponent {
    touchedItem: any;

    @Input() name!: string;
    @Input() group!: string;
    @Input() id: any;

    @Output('touchEnd') _touchEnd: EventEmitter<any> = new EventEmitter();

    private scenarioStateService = inject(ScenarioStateService);

    drag(ev: DragEvent) {
        ev.dataTransfer?.setData('id', this.id);
        ev.dataTransfer?.setData('node', this.name);
        ev.dataTransfer?.setData('group', this.group);

        this.scenarioStateService.setDrawflowMovementState(true);
    }

    touchStart(ev: TouchEvent) {
        ev.preventDefault();
    }

    touchMove(ev: TouchEvent) {
        ev.preventDefault();
        this.touchedItem = ev.changedTouches[0];
    }

    touchEnd(ev: TouchEvent) {
        ev.preventDefault();

        const touchedElement = document.elementFromPoint(
            this.touchedItem.clientX,
            this.touchedItem.clientY,
        );

        if (
            touchedElement?.className === 'drawflow' ||
            touchedElement?.id === 'drawflow'
        )
            this._touchEnd.emit({
                id: this.id,
                name: this.name,
                group: this.group,
                pos: {
                    x: this.touchedItem.clientX,
                    y: this.touchedItem.clientY,
                },
            });
    }
}
