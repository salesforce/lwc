import { ReactionEventType, ReactionCallback, ReactionEvent } from './types';
import { forEach } from './shared/language';

const reactionQueue: Array<ReactionEvent> = [];

export function queueCallback(
    type: ReactionEventType,
    node: Node,
    callbackList: Array<ReactionCallback>
) {
    if (callbackList.length === 1) {
        reactionQueue.push({ type, node, callback: callbackList[0] });
        return; // Optimization to avoid the foreach
    }
    forEach.call(callbackList, callback => {
        reactionQueue.push({ type, node, callback: callback });
    });
}

export function flushQueue() {
    forEach.call(reactionQueue, (entry: ReactionEvent, index: number) => {
        // TODO: Should this be fault tolerant? If one callback failed, should the processing end of continue?
        entry.callback.call(entry.node, entry.type);
        reactionQueue.slice(index, 1);
    });
}
