import { defineContext } from 'x/contextManager';
import { grandparentContextFactory, anotherGrandparentContextFactory } from 'x/grandparentContext';

export const parentContextFactory = defineContext(grandparentContextFactory);
export const anotherParentContextFactory = defineContext(anotherGrandparentContextFactory);
