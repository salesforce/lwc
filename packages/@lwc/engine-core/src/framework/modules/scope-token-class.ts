import { VM } from '../vm';

export function getScopeTokenClass(owner: VM): string | null {
    const { cmpTemplate, context } = owner;
    return (context.hasScopedStyles && cmpTemplate?.stylesheetToken) || null;
}
