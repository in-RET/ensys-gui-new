import { CommonModule } from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import {AuthCoreService} from '../../auth/auth.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-index',
    imports: [CommonModule, FooterComponent],
    templateUrl: './index.component.html',
    styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit{

    authCoreService = inject(AuthCoreService);
    router = inject(Router);

    ngOnInit() {
        this.authCoreService.currentToken.subscribe((res) => {
            if (res) {
                this.router.navigate(['/projects'])
            } else {
                this.router.navigate(['/'])
            }
        });
    }
}
