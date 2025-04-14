import { Component, EventEmitter, Output } from '@angular/core';
import Drawflow from 'drawflow';

@Component({
    selector: 'app-energy-drawflow',
    imports: [],
    templateUrl: './energy-drawflow.component.html',
    styleUrl: './energy-drawflow.component.scss',
})
export class EnergyDrawflowComponent {
    modalVisibility: boolean = false;
    editor!: Drawflow;

    @Output('_drop') _drop: EventEmitter<string> = new EventEmitter();

    ngOnInit() {
        var id: any = document.getElementById('drawflow');
        this.editor = new Drawflow(id);
        this.editor.start();
    }

    allowDrop(ev: any) {
        ev.preventDefault();
    }

    onDrop(ev: any) {
        ev.preventDefault();

        const nodeName = ev.dataTransfer.getData('node');
        const nodeGroup = ev.dataTransfer.getData('group');
        // nodeGroup === 'conversion';
        //     ? this.IOBusOptions(nodeName, ev.clientX, ev.clientY)
        //     : this.addNodeToDrawFlow(nodeName, ev.clientX, ev.clientY, 1, 1);
        // this.addNodeToDrawFlow(nodeName, ev.clientX, ev.clientY, 30, 6);

        this.modalVisibility = true;
        this._drop.emit(nodeName);
    }
}
