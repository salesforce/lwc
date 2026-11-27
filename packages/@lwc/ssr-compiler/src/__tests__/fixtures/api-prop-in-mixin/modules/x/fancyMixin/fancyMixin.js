import { api } from 'lwc';

export const FancyMixin = (Class) =>
    class extends Class {
        @api foo;
    };
