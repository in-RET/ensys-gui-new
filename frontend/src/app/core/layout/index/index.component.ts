import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-index',
    imports: [CommonModule],
    templateUrl: './index.component.html',
    styleUrl: './index.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexComponent {}
