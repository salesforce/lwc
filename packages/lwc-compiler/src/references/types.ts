export declare type ReferenceType = 'resourceUrl' | 'label' | 'apexClass' | 'apexMethod' | 'sobjectClass' | 'sobjectField' | 'component';
export interface ReferenceLocation {
    start: number;
    length: number;
}
export interface Reference {
    type: ReferenceType;
    id: string;
    file: string;
    locations: ReferenceLocation[];
}
