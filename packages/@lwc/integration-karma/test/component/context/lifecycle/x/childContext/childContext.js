import { defineContext } from 'test-utils';
import { parentContextFactory, anotherParentContextFactory } from 'x/parentContext';

export const childContextFactory = defineContext(parentContextFactory);
export const anotherChildContextFactory = defineContext(anotherParentContextFactory);
