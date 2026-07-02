import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { IconPickerComponent } from '../../../../../shared/components/icon-picker/icon-picker.component';
import { IconType } from '../../../models/node.model';
import { ModalComponent } from '../../modal/modal.component';

@Component({
    selector: 'app-icon-picker-modal',
    imports: [CommonModule, ModalComponent, IconPickerComponent],
    templateUrl: './icon-picker-modal.component.html',
    styleUrl: './icon-picker-modal.component.scss',
})
export class IconPickerModalComponent {
    @Input() modalInfo: { iconOrigin: string; iconName: string } | null = null;
    @Output() submitIcon = new EventEmitter<IconType>();
    @Output() modalClosed = new EventEmitter<boolean>();

    @ViewChild(IconPickerComponent) iconPicker!: IconPickerComponent;

    onSubmitIcon() {
        const icon: IconType = this.iconPicker.selectedIcon!;

        this.submitIcon.emit(icon);
        this.closeModal(true);
    }

    closeModal(approve: boolean) {
        this.modalClosed.emit(approve);
    }
}
