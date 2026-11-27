import { api } from 'lwc';

export const GetterSetterMixin = (Class) =>
    class extends Class {
        _bar = 'default';

        @api
        get bar() {
            return this._bar;
        }

        set bar(val) {
            this._bar = val;
        }
    };
