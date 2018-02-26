export function bundleMetadataCollector() {
    // TODO: import types from babel-plugin-transform
    const fileMetadata: { references: any; decorators: any[] } = {
        references: {},
        decorators: []
    };

    const moduleReferences: { [name: string]: string } = {};

    function module(reference: any) {
        moduleReferences[reference] = "module";
    }

    function file(reference: string, meta: any) {
        (meta.templateDependencies || []).forEach((reference: string) => {
            fileMetadata.references[reference] = "component";
        });
        fileMetadata.decorators.push(...(meta.decorators || []));
    }

    function getMetadata() {
        // merge reference maps by overriding
        // matching reference values from 'module' to 'component'
        const refMaps = Object.assign(
            {},
            moduleReferences,
            fileMetadata.references
        );

        const refs = Object.entries(refMaps).map(([name, type]) => {
            return { name, type };
        });

        return { references: refs, decorators: fileMetadata.decorators };
    }

    return { file, module, getMetadata };
}
