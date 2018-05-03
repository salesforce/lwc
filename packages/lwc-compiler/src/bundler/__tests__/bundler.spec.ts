import { bundle } from "../bundler";
import { pretify } from "../../__tests__/utils";

describe('bundler', () => {
    test('throws when invoked without configurations', async () => {
        try {
            const { diagnostics, code, metadata } = await bundle();
        } catch (error) {
            expect(error.message).toBe("Expected options object, received \"undefined\".");
        }
    });
});
