import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tooltip } from 'bootstrap';
import { EnergyDesignService } from '../../services/energy-design.service';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { ScenarioService } from '../../services/scenario.service';
import { ModalStateService } from '../modals/modal-state.service';
import { EnergyDragItemsComponent } from './energy-drag-items/energy-drag-items.component';

@Component({
    selector: 'app-energy-components',
    imports: [CommonModule, EnergyDragItemsComponent, FormsModule],
    templateUrl: './energy-components.component.html',
    styleUrl: './energy-components.component.scss',
})
export class EnergyComponentsComponent {
    scenarioService = inject(ScenarioService);
    router = inject(Router);
    energyDesignService = inject(EnergyDesignService);
    scenarioStateService = inject(ScenarioStateService);
    modalStateService = inject(ModalStateService);

    @Input() components: any;
    @Output('touchEnd') touchEnd: EventEmitter<any> = new EventEmitter();
    @Output() goToSetupPage: EventEmitter<void> = new EventEmitter<void>();

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

    onGoToSetupPage() {
        this.goToSetupPage.emit();
    }

    onChange_autoUpdate(val: boolean) {
        this.scenarioService.updateUserModelingState({
            autoUpdate: val,
        });
        this.scenarioStateService.setUserModelingState({
            autoUpdate: val,
        });
    }

    // onOpenSetupModal() {
    //     this.modalStateService.openSetup();
    // }
}
