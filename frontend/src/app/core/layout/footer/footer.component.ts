import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-footer',
    imports: [NgIf],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    @Input() user: any = {
        is_authenticated: false,
        info: null,
    };
}
