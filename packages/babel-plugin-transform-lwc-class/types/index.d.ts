export interface Metadata {
    decorators: Array<ApiDecorator | TrackDecorator | WireDecorator>;
    classMembers?: Array<ClassMember>;
    declarationLoc?: Location;
    doc?: string;
    exports?: ModuleExports[];
}

export interface ApiDecorator {
    type: 'api';
    targets: ApiDecoratorTarget[];
}

export interface ApiDecoratorTarget {
    name: string;
    type: DecoratorTargetType;
}

export interface TrackDecorator {
    type: 'track';
    targets: TrackDecoratorTarget[];
}

export interface TrackDecoratorTarget {
    name: string;
    type: DecoratorTargetProperty;
}

export interface WireDecorator {
    type: 'wire';
    targets: WireDecoratorTarget[];
}

export interface WireDecoratorTarget {
    name: string;
    params: { [name: string]: string };
    static: any;
    type: DecoratorTargetType;
}

export interface ClassMember {
    name: string;
    type: DecoratorTargetType;
    decorator?: string;
    doc?: string;
    loc?: Location;
}

export type DecoratorTargetType = DecoratorTargetProperty | DecoratorTargetMethod;
export type DecoratorTargetProperty = 'property';
export type DecoratorTargetMethod = 'method';

export interface Location {
    start: Position;
    end: Position;
}

export interface Position {
    line: number;
    column: number;
}
export interface ModuleExports {
    type: 'ExportNamedDeclaration' | 'ExportDefaultDeclaration' | 'ExportAllDeclaration';
    value?: string;
}
