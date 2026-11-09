import { createElement, LightningElement, setFeatureFlagForTest } from 'lwc';
import Component from 'x/cmp';

// See W-23887203
afterEach(() => setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', false));

it('calling LightningElement throws when Legacy Locker is disabled', () => {
    expect(() => createElement('x-cmp', { is: Component })).toThrow(
        'LightningElement must be constructed.'
    );
});

it('calling LightningElement reaches constructor validation when Legacy Locker is enabled', () => {
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', true);

    expect(() => LightningElement.call({})).toThrow('Illegal constructor');
});
