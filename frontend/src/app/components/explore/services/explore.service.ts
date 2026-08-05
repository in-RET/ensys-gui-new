import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ExploreService {
    private exploreProject_selectedSortOption$ = new BehaviorSubject<string>(
        'A-Z',
    );
    get exploreProject_selectedSortOption() {
        return this.exploreProject_selectedSortOption$.asObservable();
    }

    private exploreTemplate_selectedSortOption$ = new BehaviorSubject<string>(
        'A-Z',
    );
    get exploreTemplate_selectedSortOption() {
        return this.exploreTemplate_selectedSortOption$.asObservable();
    }

    sortData(data: any[], sortOption: string): any[] {
        switch (sortOption) {
            case 'A-Z':
                return data.sort((a, b) => a.name.localeCompare(b.name));

            case 'Z-A':
                return data.sort((a, b) => b.name.localeCompare(a.name));

            case 'Created Date: Asc':
                return data.sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime(),
                );

            case 'Created Date: Desc':
                return data.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                );

            default:
                return data;
        }
    }

    setExploreProject_selectedSortOption(option: string) {
        const currentOption = this.exploreProject_selectedSortOption$.value;
        if (currentOption === option) {
            return;
        }
        this.exploreProject_selectedSortOption$.next(option);
    }

    getExploreProject_selectedSortOption(): string {
        return this.exploreProject_selectedSortOption$.value;
    }

    setExploreTemplate_selectedSortOption(option: string) {
        const currentOption = this.exploreTemplate_selectedSortOption$.value;
        if (currentOption === option) {
            return;
        }
        this.exploreTemplate_selectedSortOption$.next(option);
    }

    getExploreTemplate_selectedSortOption(): string {
        return this.exploreTemplate_selectedSortOption$.value;
    }
}
