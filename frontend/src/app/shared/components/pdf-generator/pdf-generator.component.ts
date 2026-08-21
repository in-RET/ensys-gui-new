import { Component, EventEmitter, Input, Output } from '@angular/core';
import html2pdf from 'html2pdf.js';

export interface loadingModel {
    key: 'downloading' | 'page';
    status: boolean;
}

@Component({
    selector: 'app-pdf-generator',
    imports: [],
    templateUrl: './pdf-generator.component.html',
    styleUrl: './pdf-generator.component.scss',
})
export class PdfGeneratorComponent {
    @Input({ required: true })
    targetElement!: HTMLElement;

    @Input()
    fileName = 'document.pdf';
    @Input()
    btnTxt: string = 'Download As PDF';
    @Input()
    orientation: 'portrait' | 'landscape' = 'portrait';

    @Output() setLoading: EventEmitter<loadingModel> =
        new EventEmitter<loadingModel>();

    async download(): Promise<void> {
        if (!this.targetElement) {
            return;
        }

        this.setLoading.emit({
            key: 'downloading',
            status: true,
        });

        const clone = this.targetElement.cloneNode(true) as HTMLElement;

        this.prepareForPdf(clone);

        const container = document.createElement('div');
        container.classList.add('pdf-export');

        const logoData = await this.imageToPngDataUrl(
            'static/assets/logos/ensys_logo_full.svg',
        );

        container.appendChild(clone);

        container.querySelectorAll<HTMLElement>('.not-in-pdf').forEach((el) => {
            el.style.display = 'none';
        });

        document.body.appendChild(container);

        const pdfOptions = {
            margin: [25, 5, 20, 5],
            filename: this.fileName,

            pagebreak: {
                mode: ['css'],
                before: '.plot_heading:not(:first-child)',
                avoid: ['.js-plotly-plot'],
            },

            image: {
                type: 'jpeg',
                quality: 0.98,
            },

            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
            },

            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: this.orientation,
            },
        } as any;

        try {
            const pdfWorker = html2pdf()
                .set(pdfOptions)
                .from(container)
                .toPdf();

            await pdfWorker.get('pdf').then((pdf: any) => {
                const pageCount = pdf.internal.getNumberOfPages();

                for (let page = 1; page <= pageCount; page++) {
                    pdf.setPage(page);
                    pdf.addImage(logoData, 'PNG', 10, 5, 23, 8);

                    const pageSize = pdf.internal.pageSize;
                    const pageWidth = pageSize.getWidth();
                    const pageHeight = pageSize.getHeight();
                    pdf.setFontSize(8);
                    pdf.text(
                        `Page ${page} of ${pageCount}`,
                        pageWidth - 10,
                        pageHeight - 10,
                        {
                            align: 'right',
                        },
                    );
                }
            });

            await pdfWorker.save();
        } finally {
            container.remove();

            this.setLoading.emit({
                key: 'downloading',
                status: false,
            });
        }
    }

    private prepareForPdf(element: HTMLElement): void {
        element.style.height = 'auto';
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';

        const scrollableElements = element.querySelectorAll<HTMLElement>('*');

        scrollableElements.forEach((el) => {
            const style = window.getComputedStyle(el);

            if (
                style.overflow === 'auto' ||
                style.overflow === 'scroll' ||
                style.overflowY === 'auto' ||
                style.overflowY === 'scroll'
            ) {
                el.style.height = 'auto';
                el.style.maxHeight = 'none';
                el.style.overflow = 'visible';
                el.style.overflowY = 'visible';
            }
        });
    }

    private imageToDataUrl(src: string): Promise<string> {
        return fetch(src)
            .then((response) => response.blob())
            .then(
                (blob) =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onloadend = () =>
                            resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }),
            );
    }

    private imageToPngDataUrl(src: string): Promise<string> {
        return fetch(src)
            .then((response) => response.text())
            .then(
                (svgText) =>
                    new Promise<string>((resolve, reject) => {
                        const svgBlob = new Blob([svgText], {
                            type: 'image/svg+xml',
                        });
                        const url = URL.createObjectURL(svgBlob);
                        const image = new Image();

                        image.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = image.naturalWidth || 300;
                            canvas.height = image.naturalHeight || 100;

                            const context = canvas.getContext('2d');

                            if (!context) {
                                reject(
                                    new Error(
                                        'Could not create canvas context',
                                    ),
                                );
                                return;
                            }

                            context.drawImage(image, 0, 0);
                            URL.revokeObjectURL(url);
                            resolve(canvas.toDataURL('image/png'));
                        };

                        image.onerror = () => {
                            URL.revokeObjectURL(url);
                            reject(new Error('Could not load SVG logo'));
                        };

                        image.src = url;
                    }),
            );
    }
}
