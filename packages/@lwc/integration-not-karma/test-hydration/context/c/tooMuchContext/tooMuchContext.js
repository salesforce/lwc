import { grandparentContextFactory } from 'c/grandparentContext';
import { LightningElement } from 'lwc';

export default class TooMuchContext extends LightningElement {
    context = grandparentContextFactory('grandparent provided value');
    // Only test in CSR right now as it throws in SSR. There is additional fixtures ssr coverage for this case.
    tooMuch =
        typeof window !== 'undefined'
            ? grandparentContextFactory('this world is not big enough for me')
            : undefined;
}
