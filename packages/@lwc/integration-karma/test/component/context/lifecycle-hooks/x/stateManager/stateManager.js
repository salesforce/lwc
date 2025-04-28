import { defineState } from 'test-state';

export const createAtomicState = defineState((atom) => 
    () => {
        const name = atom('foo');
        return {
            name,
        };
    }
);

export const useAtomicState = defineState((atom, computed, update, fromContext) =>
    () => {
        debugger;
        const name = fromContext(createAtomicState);
        return {
            name,
        };
    }
);

