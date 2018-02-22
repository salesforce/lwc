import { Diagnostic } from '../diagnostics/diagnostic';

export declare type ReferenceType = 'resourceUrl' | 'label' | 'apexClass' | 'apexMethod' | 'sobjectClass' | 'sobjectField' | 'component';
export interface ReferenceLocation {
    start: number;
    length: number;
}
export interface BundleReference {
    type: ReferenceType;
    id: string;
    file: string;
    locations: ReferenceLocation[];
}
export interface ReferenceReport {
    references: BundleReference[];
    diagnostics: Diagnostic[];
}
