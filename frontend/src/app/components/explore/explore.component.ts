import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import type { ProjectModel } from '../project/models/project.model';
import { ProjectExploreComponent } from '../project/project-explore/project-explore.component';
import { ModalStateService } from '../scenario/scenario-energy-design/modals/modal-state.service';
import { UploadDataComponent } from '../scenario/scenario-energy-design/modals/upload-data/upload-data.component';
import { ScenarioStateService } from '../scenario/services/scenario-state.service';
import type { TemplateModel } from '../template/models/template.model';
import { ExploreService } from './services/explore.service';

interface ProjectExploreOutlet {
    project_list: ProjectModel[] | undefined;
    loading: { projects?: boolean };
    openUploadProjects: () => void;
}

interface TemplateExploreOutlet {
    templateList: TemplateModel[] | undefined;
    loading: { templates?: boolean };
}

function isProjectExploreOutlet(
    component: unknown,
): component is ProjectExploreOutlet {
    return (
        typeof component === 'object' &&
        component !== null &&
        'project_list' in component &&
        'loading' in component
    );
}

function isTemplateExploreOutlet(
    component: unknown,
): component is TemplateExploreOutlet {
    return (
        typeof component === 'object' &&
        component !== null &&
        'templateList' in component &&
        'loading' in component
    );
}

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
        UploadDataComponent,
    ],
    templateUrl: './explore.component.html',
    styleUrl: './explore.component.scss',
})
export class ExploreComponent implements OnInit {
    @ViewChild(RouterOutlet) private routerOutlet?: RouterOutlet;
    @ViewChild(UploadDataComponent)
    private uploadDataComponent?: UploadDataComponent;

    private router = inject(Router);
    private route = inject(ActivatedRoute);
    exploreService = inject(ExploreService);
    scenarioStateService = inject(ScenarioStateService);
    modalStateService = inject(ModalStateService);

    currentExploreRoute!: 'projects' | 'templates';
    sortOptions = [
        'A-Z',
        'Z-A',
        'Created Date: Asc',
        'Created Date: Desc',
        'Last Modified: Asc',
        'Last Modified: Desc',
    ];

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

    // as it calls multiple times
    // get canDownloadProjects(): boolean {
    //     const component = this.routerOutlet?.component;
    //     return (
    //         isProjectExploreOutlet(component) &&
    //         !component.loading.projects &&
    //         component.project_list !== undefined
    //     );
    // }

    downloadProjects(): void {
        const component = this.routerOutlet?.component;

        if (
            !isProjectExploreOutlet(component) ||
            component.loading.projects ||
            component.project_list === undefined
        ) {
            return;
        }

        const file = new Blob(
            [JSON.stringify(component.project_list, null, 2)],
            { type: 'application/json' },
        );
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'projects.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // get canDownloadTemplates(): boolean {
    //     const component = this.routerOutlet?.component;
    //     return (
    //         isTemplateExploreOutlet(component) &&
    //         !component.loading.templates &&
    //         component.templateList !== undefined
    //     );
    // }

    downloadTemplates(): void {
        const component = this.routerOutlet?.component;
        if (
            !isTemplateExploreOutlet(component) ||
            component.loading.templates ||
            component.templateList === undefined
        ) {
            return;
        }

        const file = new Blob(
            [JSON.stringify(component.templateList, null, 2)],
            { type: 'application/json' },
        );
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'templates.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    openUploadProjects(): void {
        this.modalStateService.openUploadData();
    }

    onUploadData(data: string | null) {
        if (data === null) {
            return;
        }

        const projectExplore = this.routerOutlet?.component;
        if (!(projectExplore instanceof ProjectExploreComponent)) {
            return;
        }

        if (!projectExplore.submitUploadProjects(data)) {
            this.uploadDataComponent?.setFormError(
                true,
                projectExplore.uploadError,
            );
            return;
        }

        this.uploadDataComponent?.closeModal(true);
    }

    onUploadprojectsClosed() {
        this.modalStateService.closeUploadData();
    }
}
