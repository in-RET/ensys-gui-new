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
    @Input()
    footer!: string;

    @Output() setLoading: EventEmitter<loadingModel> =
        new EventEmitter<loadingModel>();

    async download(): Promise<void> {
        if (!this.targetElement) {
            return;
        }

        const pdfWidth = 1085;

        this.setLoading.emit({
            key: 'downloading',
            status: true,
        });

        const clone = this.targetElement.cloneNode(true) as HTMLElement;

        this.prepareForPdf(clone);

        const container = document.createElement('div');
        container.classList.add('pdf-export');

        clone.style.width = `${pdfWidth}px`;
        clone.style.maxWidth = `${pdfWidth}px`;
        container.style.width = `${pdfWidth}px`;
        container.style.maxWidth = `${pdfWidth}px`;

        const logoData = await this.imageToPngDataUrl(
            'static/assets/logos/ensys_logo_full.svg',
        );

        container.appendChild(clone);

        this.setPdfSvgWidth(container, pdfWidth);

        container.querySelectorAll<HTMLElement>('.not-in-pdf').forEach((el) => {
            el.style.display = 'none';
        });

        document.body.appendChild(container);

        const pdfOptions = {
            margin: [25, 5, 20, 5],
            filename: this.fileName,

            pagebreak: {
                mode: ['css'],
                before: '.pdf-card-page , .charts-wrapper',
                after: '.chart-block:not(:last-child)',
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
                onclone: (documentClone: Document) => {
                    const clonedContainer = documentClone.querySelector(
                        '.pdf-export',
                    ) as HTMLElement | null;

                    if (!clonedContainer) {
                        return;
                    }

                    clonedContainer.style.setProperty(
                        'width',
                        `${pdfWidth}px`,
                        'important',
                    );
                    clonedContainer.style.setProperty(
                        'max-width',
                        `${pdfWidth}px`,
                        'important',
                    );

                    clonedContainer
                        .querySelectorAll<SVGElement>('.svg-container svg')
                        .forEach((svg) => {
                            this.scaleClonedSvg(svg, pdfWidth);
                        });

                    clonedContainer
                        .querySelectorAll<HTMLElement>(
                            '.chart-block, .charts-wrapper, .js-plotly-plot, .plot-container, .svg-container',
                        )
                        .forEach((chart) => {
                            chart.style.setProperty(
                                'width',
                                '100%',
                                'important',
                            );
                            chart.style.setProperty(
                                'max-width',
                                '100%',
                                'important',
                            );
                            chart.style.setProperty(
                                'min-width',
                                '0',
                                'important',
                            );
                            chart.style.boxSizing = 'border-box';
                        });
                },
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

                    if (this.footer)
                        pdf.text(this.footer, 10, pageHeight - 10, {
                            align: 'left',
                        });
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
        element
            .querySelectorAll<HTMLElement>(
                '.chart-block, .charts-wrapper, .plot-container, .svg-container, .js-plotly-plot',
            )
            .forEach((chart) => {
                chart.style.setProperty('width', '100%', 'important');
                chart.style.setProperty('max-width', '100%', 'important');
                chart.style.setProperty('min-width', '0', 'important');
                chart.style.boxSizing = 'border-box';
            });

        element.style.width = '1085px';
        element.style.boxSizing = 'border-box';
        element.style.height = 'auto';
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        element.style.overflowX = 'hidden';

        this.splitLongCards(element);

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

    private splitLongCards(element: HTMLElement): void {
        const cardsContainer =
            element.querySelector<HTMLElement>('.cards-info');

        if (!cardsContainer) {
            return;
        }

        const pageHeight = this.orientation === 'landscape' ? 210 : 297;
        const printableHeight = pageHeight - 25 - 20;
        const maxCardHeight = (printableHeight / 25.4) * 96 - 80;
        const sourceCards =
            this.targetElement.querySelectorAll<HTMLElement>('.energy-card');

        const cardTemplates = Array.from(
            cardsContainer.querySelectorAll<HTMLElement>(
                ':scope > .energy-card',
            ),
        );
        const cardChunks = cardTemplates.map((card, cardIndex) => {
            const rows = Array.from(
                card.querySelectorAll<HTMLElement>('.energy-card__row'),
            );
            const sourceRows = Array.from(
                sourceCards[cardIndex]?.querySelectorAll<HTMLElement>(
                    '.energy-card__row',
                ) ?? [],
            );
            const titleHeight =
                sourceCards[cardIndex]?.querySelector<HTMLElement>(
                    '.energy-card__title',
                )?.offsetHeight || 40;
            const chunks: HTMLElement[][] = [[]];
            let chunkHeight = titleHeight;

            rows.forEach((row, rowIndex) => {
                const rowHeight = sourceRows[rowIndex]?.offsetHeight || 48;

                if (
                    chunks[chunks.length - 1].length > 0 &&
                    chunkHeight + rowHeight > maxCardHeight
                ) {
                    chunks.push([]);
                    chunkHeight = titleHeight;
                }

                chunks[chunks.length - 1].push(row);
                chunkHeight += rowHeight;
            });

            return chunks;
        });
        const pageCount = Math.max(
            1,
            ...cardChunks.map((chunks) => chunks.length),
        );

        for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
            const pageCards = cardTemplates.map((template, cardIndex) => {
                const card = template.cloneNode(true) as HTMLElement;

                if (
                    pageIndex > 0 &&
                    pageIndex >= cardChunks[cardIndex].length
                ) {
                    const cardWidth =
                        sourceCards[cardIndex]?.getBoundingClientRect().width ||
                        0;
                    card.classList.add('pdf-card-placeholder');
                    card.setAttribute('aria-hidden', 'true');
                    card.style.width = `${cardWidth}px`;
                    card.style.minWidth = `${cardWidth}px`;
                    card.style.flex = `0 0 ${cardWidth}px`;
                    card.style.visibility = 'hidden';
                    card.querySelector<HTMLElement>(
                        '.energy-card__content',
                    )?.replaceChildren();
                    return card;
                }

                const rows = cardChunks[cardIndex][pageIndex];
                const rowsForPage = rows.map(
                    (row) => row.cloneNode(true) as HTMLElement,
                );

                card.querySelector<HTMLElement>(
                    '.energy-card__content',
                )?.replaceChildren(...rowsForPage);

                if (pageIndex > 0) {
                    card.querySelector<HTMLElement>(
                        '.energy-card__title',
                    )?.remove();
                }

                return card;
            });

            if (pageIndex === 0) {
                cardsContainer.replaceChildren(...pageCards);
                continue;
            }

            const page = cardsContainer.cloneNode(false) as HTMLElement;
            page.classList.add('pdf-card-page');
            page.replaceChildren(...pageCards);
            cardsContainer.insertAdjacentElement('afterend', page);
        }
    }

    private setPdfSvgWidth(container: HTMLElement, width: number): void {
        container
            .querySelectorAll<SVGElement>('.svg-container svg')
            .forEach((svg) => {
                this.scaleClonedSvg(svg, width);
            });
    }

    private scaleClonedSvg(svg: SVGElement, width: number): void {
        const originalWidth =
            Number.parseFloat(svg.getAttribute('width') || '') || width;
        const originalHeight =
            Number.parseFloat(svg.getAttribute('height') || '') ||
            svg.getBoundingClientRect().height;

        if (!svg.hasAttribute('viewBox') && originalHeight > 0) {
            svg.setAttribute(
                'viewBox',
                `0 0 ${originalWidth} ${originalHeight}`,
            );
        }

        svg.setAttribute('width', `${width}`);
        svg.style.setProperty('width', '100%', 'important');
        svg.style.setProperty('max-width', '100%', 'important');
        svg.style.setProperty('display', 'block');
        svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
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
