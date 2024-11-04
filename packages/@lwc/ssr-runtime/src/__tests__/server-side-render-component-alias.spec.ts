import { describe, it, expect } from 'vitest';
import { renderComponent, serverSideRenderComponent } from '../index';

describe('renderComponent as alias of serverSideRenderComponent', () => {
    it('is an alias', () => {
        expect(renderComponent).toBe(serverSideRenderComponent);
    });
});
