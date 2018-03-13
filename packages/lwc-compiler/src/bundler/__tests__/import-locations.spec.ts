import { collectImportLocations } from "../../bundler/import-location-collector";

describe("import locations", () => {
    test("location collector should return empty array if incoming code isn't module", () => {
        const locs = collectImportLocations("debugger");
        expect(locs.length).toBe(0);
    });

    test("location collector should return empty array if no imports were specified", () => {
        const src = `define('x-foo', function () {});`
        const locs = collectImportLocations("debugger");
        expect(locs.length).toBe(0);
    });

    test("location collector should return location object for each import", () => {
        const src = `define('x-foo', ['x-bar', 'x-foose', 'x-zoolaf'], function (xBar, xFoose, xZoolaf) {
            xBoo();
            xFoose();
            xZoolaf();
        });`;
        const locs = collectImportLocations(src);

        expect(locs.length).toBe(3);
        expect(locs[0]).toMatchObject({
            name: "x-bar",
            location: {
                start: 18,
                length: 5
            }
        });
        expect(locs[1]).toMatchObject({
            name: "x-foose",
            location: {
                start: 27,
                length: 7
            }
        });
        expect(locs[2]).toMatchObject({
            name: "x-zoolaf",
            location: {
                start: 38,
                length: 8
            }
        });
    });
});
