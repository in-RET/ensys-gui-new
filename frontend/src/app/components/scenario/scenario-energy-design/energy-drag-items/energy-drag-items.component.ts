import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-energy-drag-items',
    imports: [],
    templateUrl: './energy-drag-items.component.html',
    styleUrl: './energy-drag-items.component.scss',
})
export class EnergyDragItemsComponent {
    @Input() name!: string;
    @Input() group!: string;
    @Input() id: any;

    drag(ev: any) {
        ev.dataTransfer.setData('node', this.name);
        ev.dataTransfer.setData('group', this.group);
    }
}
