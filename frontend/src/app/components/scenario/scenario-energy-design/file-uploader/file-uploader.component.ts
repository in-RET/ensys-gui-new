import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-file-uploader',
    imports: [CommonModule],
    templateUrl: './file-uploader.component.html',
    styleUrl: './file-uploader.component.scss',
})
export class FileUploaderComponent {
    fileInfo!: { name: string; label: string; data: any } | null;

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
                    this.fileInfo = { name: '', label: '', data: null };
                    this.fileInfo.name = `${file.name} (${formatBytes(
                        file.size
                    )})`;
                    content = this.formatList(content); //content.split('\r\n').join(',');

                    this.fileInfo.label = this.shortenList(content);
                    this.fileInfo.data = content;
                    this.fileUploaderChange.emit(content);
                };
                reader.readAsText(file);
            }
        }
    }

    formatList(rawStr: string) {
        const arr = rawStr.trim().split(/\r?\n/).filter(Boolean); // Split on \n or \r\n and remove empty lines
        if (arr.length <= 4) return arr.join(','); // No need to shorten
        return arr.join(',');
    }

    shortenList(str: string) {
        let arr = str.split(',');
        if (arr.length <= 4) return str; // Nothing to shorten

        let firstTwo = arr.slice(0, 2);
        let lastTwo = arr.slice(-2);
        return [...firstTwo, '...', ...lastTwo].join(',');
    }

    clearFileData() {
        this.fileUploaderChange.emit(null);
        this.fileInfo = null;
    }
}
