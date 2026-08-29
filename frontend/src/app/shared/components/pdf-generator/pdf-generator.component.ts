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

        this.setLoading.emit({
            key: 'downloading',
            status: true,
        });

        const clone = this.targetElement.cloneNode(true) as HTMLElement;

        this.prepareForPdf(clone);

        const container = document.createElement('div');
        container.classList.add('pdf-export');
        container.style.boxSizing = 'border-box';
        container.style.width = '1085px';
        container.style.maxWidth = '1085px';
        container.style.overflowX = 'hidden';

        const logoData = await this.imageToPngDataUrl(
            'static/assets/logos/ensys_logo_full.svg',
        );

        container.appendChild(clone);

        container.querySelectorAll<HTMLElement>('.not-in-pdf').forEach((el) => {
            el.style.display = 'none';
        });

        document.body.appendChild(container);
        this.alignCardPages(container);

        const pdfOptions = {
            margin: [25, 5, 20, 5],
            filename: this.fileName,

            pagebreak: {
                mode: ['css'],
                before: '.chart-block, .pdf-card-page',
                avoid: ['.chart-block', '.energy-card'],
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
        element.style.width = '100%';
        element.style.maxWidth = '100%';
        element.style.boxSizing = 'border-box';
        element.style.height = 'auto';
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        element.style.overflowX = 'hidden';

        this.splitLongCards(element);
        this.prepareChartsForPdf(element);

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

    private alignCardPages(container: HTMLElement): void {
        const firstPage = container.querySelector<HTMLElement>(
            '.cards-info:not(.pdf-card-page)',
        );

        if (!firstPage) {
            return;
        }

        const firstPageRect = firstPage.getBoundingClientRect();
        const columns = Array.from(
            firstPage.querySelectorAll<HTMLElement>(':scope > .energy-card'),
        ).map((card) => {
            const rect = card.getBoundingClientRect();
            return {
                left: rect.left - firstPageRect.left,
                width: rect.width,
            };
        });

        container
            .querySelectorAll<HTMLElement>('.cards-info')
            .forEach((page) => {
                page.style.justifyContent = 'flex-start';

                Array.from(
                    page.querySelectorAll<HTMLElement>(':scope > .energy-card'),
                ).forEach((card, columnIndex) => {
                    const column = columns[columnIndex];
                    if (!column) {
                        return;
                    }

                    const previousColumn = columns[columnIndex - 1];
                    const leftOffset = previousColumn
                        ? column.left -
                          previousColumn.left -
                          previousColumn.width
                        : column.left;

                    card.style.flex = `0 0 ${column.width}px`;
                    card.style.width = `${column.width}px`;
                    card.style.marginLeft = `${leftOffset}px`;
                    card.style.marginRight = '0';
                });
            });
    }

    private prepareChartsForPdf(element: HTMLElement): void {
        element
            .querySelectorAll<HTMLElement>('.chart-block')
            .forEach((block) => {
                block.style.breakInside = 'avoid';
                block.style.pageBreakInside = 'avoid';
                block.style.setProperty('width', '100%', 'important');
                block.style.setProperty('max-width', '100%', 'important');
                block.style.boxSizing = 'border-box';

                const chart =
                    block.querySelector<HTMLElement>('.js-plotly-plot');
                if (chart) {
                    chart.style.setProperty('width', '100%', 'important');
                    chart.style.setProperty('max-width', '100%', 'important');
                    chart.style.setProperty('min-width', '0', 'important');
                    chart.style.boxSizing = 'border-box';
                    chart.style.height = '400px';
                    chart.style.maxHeight = '400px';

                    chart
                        .querySelectorAll<HTMLElement>(
                            '.plot-container, .svg-container, .main-svg, svg, canvas',
                        )
                        .forEach((innerElement) => {
                            innerElement.style.setProperty(
                                'width',
                                '100%',
                                'important',
                            );
                            innerElement.style.setProperty(
                                'max-width',
                                '100%',
                                'important',
                            );
                            innerElement.style.boxSizing = 'border-box';
                            innerElement.style.overflow = 'hidden';

                            if (innerElement.tagName.toLowerCase() === 'svg') {
                                innerElement.setAttribute('width', '100%');
                            }
                        });
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
