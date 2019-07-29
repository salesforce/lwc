export enum ReactionEventType {
    connected = 'connected',
    disconnected = 'disconnected',
}

export type ReactionCallback = (this: Node, reactionEventType: ReactionEventType) => void;

export interface ReactionEvent {
    type: ReactionEventType;
    callback: ReactionCallback;
    node: Node;
}
