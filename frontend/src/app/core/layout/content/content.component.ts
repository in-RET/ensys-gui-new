import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-content',
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './content.component.html',
    styleUrl: './content.component.scss',
    standalone: true,
})
export class ContentComponent {}
