import * as target from '../wiring';

describe('WireEventTarget', () => {
    describe('connect event', () => {
        it('addEventListener throws on duplicate listener', () => {
        });
    });

    describe('config event', () => {
        it('addEventListener immediately fires when config is statics only', () => {
        });
        it('multiple config listeners from one adapter creates only one trap per property', () => {
        });
        it('multiple config listeners from multiple adapters creates only one trap per property', () => {
        });
        it('invokes all registered listeners on prop change', () => {
        });
        it('invokes config listener once when multiple props updated', () => {
        });
        it('invokes config listener with getter value', () => {
            // verify getter value is used which may differ from the setter's argument
        });
    });

    // TODO - do we need to do some cleanup at cmp "destroy"? what defines destroy?

    describe('dispatchEvent', () => {
        it('ValueChangedEvent updates wired property', () => {
        });
        it('ValueChangedEvent invokes wired method', () => {
        });
        it('throws on non-ValueChangedEvent', () => {
        });
    });

});
