import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-index',
    imports: [CommonModule, FooterComponent],
    templateUrl: './index.component.html',
    styleUrl: './index.component.scss',
})
export class IndexComponent {}
