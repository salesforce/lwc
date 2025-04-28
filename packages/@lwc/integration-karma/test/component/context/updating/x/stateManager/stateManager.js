import { defineState } from 'test-state';

export const nameStateFactory = defineState((atom, computed, update) => 
    () => {
        const name = atom('foo');

        const updateName = update({ name }, (_, newName) => ({
            name: newName,
        }));

        return {
            name,
            updateName,
        };
    }
);

export const consumeStateFactory = defineState((atom, computed, update, fromContext) =>
    () => {
        const name = fromContext(nameStateFactory);

        const updateName = update({ name }, (_, newName) => ({
            name: newName,
        }));

        return {
            name,
            updateName
        };
    }
);

