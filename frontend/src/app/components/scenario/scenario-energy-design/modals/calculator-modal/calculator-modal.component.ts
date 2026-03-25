import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnergyDesignService } from '../../../services/energy-design.service';
import { FormComponent } from '../../form/form.component';
import { ModalComponent } from '../../modal/modal.component';
import { FormModalInfo } from '../../models/scenario-energy-design.model';

@Component({
    selector: 'app-calculator-modal',
    imports: [CommonModule, FormsModule, ModalComponent, FormComponent],
    templateUrl: './calculator-modal.component.html',
    styleUrl: './calculator-modal.component.scss',
})
export class CalculatorModalComponent {
    formError: { msg: string | null; isShow: boolean } = {
        msg: '',
        isShow: false,
    };

    @Input() modalInfo: FormModalInfo | null = null;
    @Output() formSubmitted = new EventEmitter<any>();
    @Output() modalClosed = new EventEmitter<boolean>();

    @ViewChild('form')
    formComponent!: FormComponent;

    energyDesignService = inject(EnergyDesignService);

    onFormSubmitted() {
        this.cleanFormError();

        let formData = this.formComponent.submit();

        if (formData) {
            const epCosts: number | false = this.energyDesignService.epCostsCal(
                {
                    capex: formData.capex,
                    zinsatz: formData.zinsatz,
                    lifetime: formData.lifetime,
                    opexPercentage: formData.opexpercentage,
                },
            );

            if (!epCosts) {
                this.setFormError(
                    true,
                    'zinsatz (interest rate) must be between 0 and 1!',
                );
            } else {
                this.formSubmitted.emit(epCosts);
                this.closeModal(true);
            }
        } else this.setFormError(true, ' * The form is not completed!');
    }

    private setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    private cleanFormError() {
        this.formError = { msg: null, isShow: false };
    }

    closeModal(approve: boolean) {
        this.modalClosed.emit(approve);
        this.cleanFormError();
    }
}
