import { getReferenceReport } from "../../references/javascript";
import { DiagnosticLevel } from "../../diagnostics/diagnostic";

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
            getReferenceReport(`import * as label from '@label/foo';`, "test.js")
                .diagnostics[0].message
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
