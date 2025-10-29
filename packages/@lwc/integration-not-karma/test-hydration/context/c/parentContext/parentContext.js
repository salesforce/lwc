import { defineContext } from 'c/contextManager';
import { grandparentContextFactory, anotherGrandparentContextFactory } from 'c/grandparentContext';

export const parentContextFactory = defineContext(grandparentContextFactory);
export const anotherParentContextFactory = defineContext(anotherGrandparentContextFactory);
