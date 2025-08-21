import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    constructor() {}

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
        title: string = 'Are you sure?',
        confirmButtonText: string = 'Yes',
        cancelButtonText: string = 'Cancel',
        icon: SweetAlertIcon = 'question'
    ): Promise<boolean> {
        const result = await Swal.fire({
            title,
            text: message,
            icon,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
        });
        return result.isConfirmed;
    }
}
