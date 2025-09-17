import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ContentLayoutService } from '../services/content-layout.service';

@Component({
    selector: 'app-content',
    imports: [RouterOutlet, NavbarComponent, CommonModule],
    templateUrl: './content.component.html',
    styleUrl: './content.component.scss',
    standalone: true,
})
export class ContentComponent {
    isFullscreen: boolean | undefined = true;

    contentLayoutService = inject(ContentLayoutService);

    ngOnInit() {
        this.contentLayoutService.fullscreenStatus.subscribe(
            (status: boolean | undefined) => (this.isFullscreen = status)
        );
    }
}
