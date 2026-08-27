import { DrawflowNode } from 'drawflow';

export interface Action {
    fn: string;
    label: string;
}

export interface Position {
    x: number;
    y: number;
}

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
