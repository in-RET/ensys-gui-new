import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { filter, startWith } from 'rxjs';

@Component({
    selector: 'app-explore',
    imports: [RouterOutlet, CommonModule, RouterLink],
    templateUrl: './explore.component.html',
    styleUrl: './explore.component.scss',
})
export class ExploreComponent {
    currentExploreRoute = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                startWith(null),
            )
            .subscribe(() => {
                this.currentExploreRoute =
                    this.route.firstChild?.snapshot.url[0]?.path ?? '';
            });
    }

    removeFocus(event: Event): void {
        (event.currentTarget as HTMLElement).blur();
    }
}
