import { createElement } from 'lwc';

import NotFormAssociated from 'x/notFormAssociated';
import FormAssociated from 'x/formAssociated';
import FormAssociatedFalse from 'x/formAssociatedFalse';

if (typeof ElementInternals !== 'undefined' && !process.env.SYNTHETIC_SHADOW_ENABLED) {
    it('should throw an error when duplicate tag name used with different formAssociated value', () => {
        // Register tag with formAssociated = true
        createElement('x-form-associated', { is: FormAssociated });
        // Try to register again with formAssociated = false
        expect(() => createElement('x-form-associated', { is: FormAssociatedFalse })).toThrowError(
            /<x-form-associated> was already registered with formAssociated=true. It cannot be re-registered with formAssociated=false. Please rename your component to have a different name than <x-form-associated>/
        );
    });

    it('should not throw when duplicate tag name used with the same formAssociated value', () => {
        // formAssociated = true
        createElement('x-form-associated', { is: FormAssociated });
        expect(() => createElement('x-form-associated', { is: FormAssociated })).not.toThrow();
        // formAssociated = false
        createElement('x-form-associated-false', { is: FormAssociatedFalse });
        expect(() =>
            createElement('x-form-associated-false', { is: FormAssociatedFalse })
        ).not.toThrow();
        // formAssociated = undefined
        createElement('x-not-form-associated', { is: NotFormAssociated });
        expect(() =>
            createElement('x-not-form-associated', { is: NotFormAssociated })
        ).not.toThrow();
    });
}
