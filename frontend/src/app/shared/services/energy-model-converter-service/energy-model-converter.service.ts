import { Injectable } from '@angular/core';
import { DrawflowNode } from 'drawflow';
import { convertDrawflowToEnergyModel } from './converter';

@Injectable({
    providedIn: 'root',
})
export class EnergyModelConverterService {
    constructor() {}

    convertDrawFlowDataToOemofModelData(data: DrawflowNode) {
        const d = convertDrawflowToEnergyModel(data);
        return d;
    }

    downloadJson(obj: any, filename: string) {
        const blob = new Blob([JSON.stringify(obj, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    }
}
