import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-scenario-footer',
    imports: [CommonModule, RouterModule],
    templateUrl: './scenario-footer.component.html',
    styleUrl: './scenario-footer.component.scss',
})
export class ScenarioFooterComponent {
    @Input('step') step!: number;
    @Input('scenarioData') scenarioData!: any;

    @Output() nextStep: EventEmitter<any> = new EventEmitter<any>();
    @Output() prevtStep: EventEmitter<any> = new EventEmitter<any>();
    @Output() saveScenario: EventEmitter<any> = new EventEmitter<any>();

    next() {
        this.nextStep.emit();
    }

    previous() {
        this.prevtStep.emit();
    }

    save() {
        this.saveScenario.emit();
    }
}
