import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-project-scenario-item',
    imports: [CommonModule, RouterLink],
    templateUrl: './project-scenario-item.component.html',
    styleUrl: './project-scenario-item.component.scss',
})
export class ProjectScenarioItemComponent {
    @Input() data: any;
}
