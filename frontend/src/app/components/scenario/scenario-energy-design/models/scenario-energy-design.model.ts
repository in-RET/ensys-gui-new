import { DrawflowNode } from 'drawflow';

export interface Action {
    fn: string;
    label: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface ConnectionInfo {
    source: { node: any; port: any };
    destination: { node: any; port: any };
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
    connection?: {
        output_node: string;
        input_node: string;
        output_port: string;
        input_port: string;
    };
    connection_singleInOut?: {
        in: ConnectionInfo | null;
        out: ConnectionInfo | null;
    };
}

export interface EditFormModalInfo extends FormModalInfo {
    id: string;
    _id: number;
    calledByANode?: boolean;
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
