import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    constructor() { }

    success(message: string, title = 'Success') {
        return Swal.fire({
            title,
            text: message,
            icon: 'success',
            confirmButtonText: 'OK',
        });
    }

    error(message: string, title = 'Error') {
        return Swal.fire({
            title,
            text: message,
            icon: 'error',
            confirmButtonText: 'OK',
        });
    }

    alert(message: string, title = 'Notice', icon: SweetAlertIcon = 'info') {
        return Swal.fire({
            title,
            text: message,
            icon,
            confirmButtonText: 'OK',
        });
    }

    warning(message: string, title: string = 'Warning') {
        return Swal.fire({
            title,
            text: message,
            icon: 'warning',
            confirmButtonText: 'OK',
        });
    }

    info(message: string, title: string = 'Info') {
        return Swal.fire({
            title,
            text: message,
            icon: 'info',
            confirmButtonText: 'OK',
        });
    }

    async confirm(
        message: string,
        title?: string,
        confirmButtonText?: string,
        cancelButtonText?: string,
        icon?: SweetAlertIcon,
    ): Promise<boolean>;
    async confirm(
        message: string,
        title: string,
        confirmButtonText: string,
        cancelButtonText: string | undefined,
        icon: SweetAlertIcon,
        denyButtonText: string,
    ): Promise<'confirm' | 'deny' | 'cancel'>;
    async confirm(
        message: string,
        title: string = 'Are you sure?',
        confirmButtonText: string = 'Yes',
        cancelButtonText: string | undefined = 'Cancel',
        icon: SweetAlertIcon = 'question',
        denyButtonText?: string,
    ): Promise<boolean | 'confirm' | 'deny' | 'cancel'> {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const result = await Swal.fire({
            title,
            text: message,
            icon,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
            ...(denyButtonText && {
                showDenyButton: true,
                denyButtonText,
            }),

            confirmButtonColor: '#198754',
            denyButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
        });

        if (denyButtonText) {
            if (result.isConfirmed) return 'confirm';
            if (result.isDenied) return 'deny';
            return 'cancel';
        }

        return result.isConfirmed;
    }
}
