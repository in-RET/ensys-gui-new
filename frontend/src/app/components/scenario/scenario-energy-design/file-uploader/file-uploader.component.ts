import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-file-uploader',
    imports: [],
    templateUrl: './file-uploader.component.html',
    styleUrl: './file-uploader.component.scss',
})
export class FileUploaderComponent {
    fileInfo!: string;

    @Output() fileUploaderChange: EventEmitter<any> = new EventEmitter();

    /**
     * Called when the value of the file input changes, i.e. when a file has been
     * selected for upload.
     *
     * @param input the file input HTMLElement
     */
    onFileSelect(input: HTMLInputElement): void {
        /**
         * Format the size to a human readable string
         *
         * @param bytes
         * @returns the formatted string e.g. `105 kB` or 25.6 MB
         */
        function formatBytes(bytes: number): string {
            const UNITS = [
                'Bytes',
                'kB',
                'MB',
                'GB',
                'TB',
                'PB',
                'EB',
                'ZB',
                'YB',
            ];
            const factor = 1024;
            let index = 0;

            while (bytes >= factor) {
                bytes /= factor;
                index++;
            }

            return `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`;
        }

        if (input && input.files) {
            const file = input.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = (e: any) => {
                    let content = e.target.result;
                    this.fileInfo = `${file.name} (${formatBytes(file.size)})`;
                    content = content.split('\r\n').join(',');
                    this.fileUploaderChange.emit(content);
                };
                reader.readAsText(file);
            }
        }
    }
}
