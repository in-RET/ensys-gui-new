import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IconType,
    SelectedIconType,
} from '../../../components/scenario/models/node.model';
import { ModalStateService } from '../../../components/scenario/scenario-energy-design/modals/modal-state.service';
import { NodeService } from '../../../components/scenario/services/node.service';

@Component({
    selector: 'app-icon-picker',
    imports: [CommonModule, FormsModule],
    templateUrl: './icon-picker.component.html',
    styleUrl: './icon-picker.component.scss',
})
export class IconPickerComponent {
    search = '';
    iconList: Map<string, IconType[]> = new Map();
    selectedIcon: SelectedIconType | null = null;
    keepOrder = () => 0;

    @Input() icon: { iconOrigin: string; iconName: string } | null = null;

    nodeService = inject(NodeService);
    modalStateService = inject(ModalStateService);

    get filteredIcons(): Record<string, IconType[]> {
        const term = this.search.trim().toLowerCase();

        if (!term) {
            return Object.fromEntries(this.iconList);
        }

        return Object.fromEntries(
            Object.entries(this.iconList).map(([category, icons]) => [
                category,
                icons.filter(
                    (i: IconType) =>
                        i.name.toLowerCase().includes(term) ||
                        i.label.toLowerCase().includes(term),
                ),
            ]),
        );
    }

    ngOnInit() {
        const icons = this.nodeService.getNodeIcons();

        // sort base on selected node
        if (this.icon) {
            const map = new Map<string, IconType[]>();
            const firstKey: string = this.icon.iconOrigin;

            if (icons[firstKey]) {
                map.set(firstKey, icons[firstKey]);
            }

            for (const [key, value] of Object.entries(icons)) {
                if (key !== firstKey) {
                    map.set(key, value);
                }
            }

            this.iconList = map;
        }
    }

    selectIcon(icon: IconType, origin: string) {
        this.selectedIcon = { ...icon, origin };
    }
}
