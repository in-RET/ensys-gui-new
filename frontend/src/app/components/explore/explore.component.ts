import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import {
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { filter, startWith } from 'rxjs';
import { ExploreService } from './services/explore.service';

@Component({
    selector: 'app-explore',
    imports: [
        RouterOutlet,
        CommonModule,
        RouterLink,
        NgbDropdown,
        NgbDropdownToggle,
        NgbDropdownMenu,
        NgbDropdownItem,
    ],
    templateUrl: './explore.component.html',
    styleUrl: './explore.component.scss',
})
export class ExploreComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    exploreService = inject(ExploreService);

    currentExploreRoute!: 'projects' | 'templates';
    sortOptions = ['A-Z', 'Z-A', 'Created Date: Asc', 'Created Date: Desc'];

    ngOnInit() {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                startWith(null),
            )
            .subscribe(() => {
                this.currentExploreRoute = this.route.firstChild?.snapshot
                    .url[0]?.path as 'projects' | 'templates';
            });
    }

    removeFocus(event: Event): void {
        (event.currentTarget as HTMLElement).blur();
    }

    orderItemsBy(option: string): void {
        if (this.currentExploreRoute === 'projects')
            this.exploreService.setExploreProject_selectedSortOption(option);
        else if (this.currentExploreRoute === 'templates')
            this.exploreService.setExploreTemplate_selectedSortOption(option);
    }
}
