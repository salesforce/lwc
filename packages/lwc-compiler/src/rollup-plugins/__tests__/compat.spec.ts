import lwcCompatFactory from '../compat';

const codeFixture = `
  const a = 1;
  console.log(a);
`;
const compatCode = `import __callKey1 from "proxy-compat/callKey1";
var a = 1;

__callKey1(console, "log", a);`;

describe('rollup plugin lwc-compat', () => {
    test('lwc-compat default', () => {
        const lwcCompat = lwcCompatFactory(undefined);
        const result = lwcCompat.transform(codeFixture);

        expect(result.code).toBe(compatCode);
        expect(result.map).not.toBeNull();
    });
    test('should override with options', () => {
        const lwcCompat = lwcCompatFactory(undefined, false);
        const result = lwcCompat.transform(codeFixture);

        expect(result.map).toBeNull();
    });
});
