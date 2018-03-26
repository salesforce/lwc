import { getReferenceReport } from "../../references/javascript";
import { DiagnosticLevel } from "../../diagnostics/diagnostic";

describe("module import", () => {
    test("multiple imports from single module", () => {
        const references = getReferenceReport(
            `import { api, track, Element } from 'engine';`,
            "foo.js"
        ).references;

        expect(references.length).toBe(1);
        expect(references[0]).toMatchObject({
            file: "foo.js",
            id: "engine",
            locations: [{ length: 6, start: 51 }],
            type: "module"
        });
    });
    test("default import from module", () => {
        const references = getReferenceReport(
            `import everything from 'engine';`,
            "foo.js"
        ).references;

        expect(references[0]).toMatchObject({
            file: "foo.js",
            id: "engine",
            locations: [{ length: 6, start: 38 }],
            type: "module"
        });
    });

    test("common import from module", () => {
        const references = getReferenceReport(
            `import * as allmystuff from 'engine';`,
            "foo.js"
        ).references;

        expect(references[0]).toMatchObject({
            file: "foo.js",
            id: "engine",
            locations: [{ length: 6, start: 43 }],
            type: "module"
        });
    });
});

describe("resource-url", () => {
    test("gather metadata", () => {
        expect(
            getReferenceReport(
                `import resource from '@resource-url/foo';`,
                "test.js"
            ).references
        ).toEqual([
            {
                id: "foo",
                file: "test.js",
                type: "resourceUrl",
                locations: [
                    {
                        start: 36,
                        length: 3
                    }
                ]
            }
        ]);
    });

    test("errors when using namespaced import", () => {
        expect(
            getReferenceReport(
                `import * as resource from '@resource-url/foo';`,
                "test.js"
            ).diagnostics[0].message
        ).toBe("@resource-url modules only support default imports.");
    });

    test("errors when using a named import", () => {
        expect(
            getReferenceReport(
                `import { resource } from '@resource-url/foo';`,
                "test.js"
            ).diagnostics[0].message
        ).toBe("@resource-url modules only support default imports.");
    });
});

describe("label", () => {
    test("gather metadata", () => {
        expect(
            getReferenceReport(`import label from '@label/foo';`, "test.js")
                .references
        ).toEqual([
            {
                id: "foo",
                file: "test.js",
                type: "label",
                locations: [
                    {
                        start: 26,
                        length: 3
                    }
                ]
            }
        ]);
    });

    test("errors when using namespaced import", () => {
        expect(
            getReferenceReport(
                `import * as label from '@label/foo';`,
                "test.js"
            ).diagnostics[0].message
        ).toBe("@label modules only support default imports.");
    });

    test("errors when using a named import", () => {
        expect(
            getReferenceReport(`import { label } from '@label/foo';`, "test.js")
                .diagnostics[0].message
        ).toBe("@label modules only support default imports.");
    });
});

describe("apex", () => {
    test("gather metadata", () => {
        expect(
            getReferenceReport(
                `import methodA from '@apex/MyClass.methodA';`,
                "test.js"
            ).references
        ).toEqual([
            {
                id: "MyClass.methodA",
                file: "test.js",
                type: "apexMethod",
                locations: [
                    {
                        start: 27,
                        length: 15
                    }
                ]
            }
        ]);
    });

    test("errors when using namespaced import", () => {
        const { diagnostics } = getReferenceReport(
            `import * as MyClass from '@apex/MyClass';`,
            "test.js"
        );
        expect(diagnostics[0].level).toBe(DiagnosticLevel.Fatal);
        expect(diagnostics[0].message).toBe(
            "@apex modules only support default imports."
        );
    });

    test("errors when using a default import", () => {
        const { diagnostics } = getReferenceReport(
            `import { methodA } from '@apex/MyClass';`,
            "test.js"
        );
        expect(diagnostics[0].level).toBe(DiagnosticLevel.Fatal);
        expect(diagnostics[0].message).toBe(
            "@apex modules only support default imports."
        );
    });
});
