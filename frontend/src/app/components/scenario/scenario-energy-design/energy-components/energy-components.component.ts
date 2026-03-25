import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Tooltip } from 'bootstrap';
import { EnergyDesignService } from '../../services/energy-design.service';
import { ScenarioService } from '../../services/scenario.service';
import { EnergyDragItemsComponent } from './energy-drag-items/energy-drag-items.component';

@Component({
    selector: 'app-energy-components',
    imports: [CommonModule, EnergyDragItemsComponent],
    templateUrl: './energy-components.component.html',
    styleUrl: './energy-components.component.scss',
})
export class EnergyComponentsComponent {
    scenarioService = inject(ScenarioService);
    router = inject(Router);
    energyDesignService = inject(EnergyDesignService);

    @Input() components: any;
    @Output('touchEnd') touchEnd: EventEmitter<any> = new EventEmitter();

    _touchEnd(e: any) {
        // this.touchEnd.emit(e);
    }

    ngOnInit() {
        this.loadEnergyComponents();
    }

    ngAfterViewInit() {
        this.setComponentsToolTip();
    }

    setComponentsToolTip() {
        const tooltipTriggerList = Array.from(
            document.querySelectorAll('[data-bs-toggle="tooltip"]'),
        );

        tooltipTriggerList.forEach((tooltipTriggerEl) => {
            new Tooltip(tooltipTriggerEl);
        });
    }

    loadEnergyComponents() {
        this.components = this.energyDesignService.getEnergyComponents();
    }
}
