export interface Metadata {
    doc?: string;
    declarationLoc?: Location;
    decorators: Array<ApiDecorator | TrackDecorator | WireDecorator>;
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

export type DecoratorTargetType = DecoratorTargetProperty | DecoratorTargetMethod;
export type DecoratorTargetProperty = 'property';
export type DecoratorTargetMethod = 'property';

export interface Location {
    start: Position;
    end: Position;
}

export interface Position {
    line: number;
    column: number;
}
