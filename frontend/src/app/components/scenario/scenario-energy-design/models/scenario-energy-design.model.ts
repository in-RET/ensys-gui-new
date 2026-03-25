import { DrawflowNode } from 'drawflow';

export interface Action {
    fn: string;
    label: string;
}

export interface Position {
    x: number;
    y: number;
}

// export interface NodeModel {
//     class: string;
//     name: string;
//     position: Position;
//     data?: any;
// }

export interface FormModalInfo {
    title: string;
    action: Action;
    editMode: boolean;
    node: DrawflowNode;
    formData: any;
    data: any;
    url: string;
    show: boolean;
}

export interface EditFormModalInfo extends FormModalInfo {
    id: string;
    _id: number;
    connection: any;
}

interface FormNode {
    type: string;
    name: string;
    position: { x: number; y: number };
    class: string;
    id?: number;
    data?: any;
    oep: boolean;
    preDefData?: any | undefined;
}

// class FormModalInfo {
//     id?: number;
//     title: string = '';
//     formData: any | undefined;
//     action: any | undefined;
//     data: any | undefined;
//     type: 'node' | 'flow' | undefined;
//     editMode: boolean = false;
//     hide: boolean = false;
//     show: boolean = false;
//     node?: FormNode;
//     preDefData!: { inputs: []; outputs: [] } | undefined;
//     flowData: { inputs: FlowData[]; outputs: FlowData[] } | undefined;
//     url: string = '';
//     connection!: Connection;
// }

// timeSeriesModal: any = {
//     id: '',
//     group: {},
//     show: false,
//     title: 'Time Series Data',
//     action: {
//         label: 'Import',
//         fn: undefined,
//     },
//     data: undefined,
//     modes: undefined,
// };
