import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-scenario-footer',
    imports: [CommonModule],
    templateUrl: './scenario-footer.component.html',
    styleUrl: './scenario-footer.component.scss',
})
export class ScenarioFooterComponent {
    @Input('step') step!: number;

    @Output() nextStep: EventEmitter<any> = new EventEmitter<any>();
    @Output() prevtStep: EventEmitter<any> = new EventEmitter<any>();

    next() {
        this.nextStep.emit();
    }

    previous() {
        this.prevtStep.emit();
    }
}
