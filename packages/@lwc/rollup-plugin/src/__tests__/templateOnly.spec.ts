import { describe, expect, it } from 'vitest';

import { runRollup } from './util';

describe('template-only components', () => {
    it('works as an entrypoint', async () => {
        const { code } = await runRollup('template-only/x/basic/basic.html');
        expect(code).toContain('no JS');
    });

    it('can be used in a template', async () => {
        const { code } = await runRollup('template-only/x/used-in-template/used-in-template.html');
        expect(code).toContain('no JS');
    });

    it('can be used in a component', async () => {
        const { code } = await runRollup('template-only/x/used-in-js/used-in-js.js');
        expect(code).toContain('no JS');
    });

    it('can be used in app code', async () => {
        const { code } = await runRollup('template-only/main.js');
        expect(code).toContain('no JS');
    });

    it('works when aliased', async () => {
        const { code } = await runRollup('template-only/main.js');
        expect(code).toContain('no JS');
    });
});
