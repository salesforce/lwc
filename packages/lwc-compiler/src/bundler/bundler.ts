// import { Diagnostic, DiagnosticLevel } from '../diagnostics/diagnostic';

// import { rollup } from 'rollup';
// import * as rollupPluginReplace from 'rollup-plugin-replace';

// import { isCompat, isProd } from '../modes';

// import rollupModuleResolver from '../rollup-plugins/module-resolver';
// import rollupTransfrom from '../rollup-plugins/transform';
// import rollupCompat from '../rollup-plugins/compat';
// import rollupMinify from '../rollup-plugins/minify';


// export interface BundleResult {
//     code?: string;
//     map?: string;
//     errors?: Diagnostic[];
// }

// // TODO: Content needs to be altered once we finilize the api
// export interface BundleOptions {
//     format?: string;
//     mode: string;
//     env?: any,
//     globals?: any,
//     mapNamespaceFromPath?: boolean,
//     resolveProxyCompat?: any,
//     // TODO: below attributes must be renamed; some removed completely once tests pass
//     moduleName?: string,
//     moduleNamespace?: string,
//     normalizedModuleName?: string,
//     sources: [{ filename: string }],
//     moduleResolver?: any,
//     $metadata?: any,
//     componentName?: string,
//     componentNamespace?: string;
// }

// function rollupWarningOverride(warning: any) {
//     if (warning.code && warning.code === 'UNRESOLVED_IMPORT') {
//         return;
//     }

//     console.warn(warning.message);
// }

// // TODO: type for metadata
// function mergeMetadata(metadata: any) {
//     const dependencies = new Map((metadata.rollupDependencies || []).map((d: any) => ([d, 'module'])));
//     const decorators = [];

//     for (let i in metadata) {
//         (metadata[i].templateDependencies || []).forEach((td: any) => (dependencies.set(td, 'component')));
//         decorators.push(...(metadata[i].decorators || []));
//     }

//     return {
//         decorators,
//         references: Array.from(dependencies).map(d => ({name: d[0], type: d[1]}))
//     };
// }


// export function bundle(entry: string, options: any) {
//     const environment = options.env!.NODE_ENV || process.env.NODE_ENV;
//     const plugins = [
//         rollupPluginReplace({ 'process.env.NODE_ENV': JSON.stringify(environment) }),
//         rollupModuleResolver({
//             moduleResolver: options.moduleResolver,
//             $metadata: options.normalizedModuleName,
//         }),
//         rollupTransfrom(options)
//     ];

//     if (isCompat(options.mode)) {
//         plugins.push(rollupCompat(options.resolveProxyCompat));
//     }

//     if (isProd(options.mode)) {
//         plugins.push(rollupMinify(options));
//     }

//     return rollup({
//         input: entry,
//         plugins: plugins,
//         onwarn: rollupWarningOverride,
//     }).then(
//         (bundleFn: any) => {
//             return bundleFn
//                 .generate({
//                     amd: { id: options.normalizedModuleName },
//                     interop: false,
//                     strict: false,
//                     format: options.format,
//                     globals: options.globals
//                 })
//                 .then((result: BundleResult) => {
//                     return {
//                         code: result.code,
//                         map: result.map,
//                         metadata: mergeMetadata(options.$metadata),
//                         rawMetadata: options.$metadata
//                         // TODO: perhaps add format here?
//                     };
//                 }, (error: any) => {
//                     return handleFailure(error, entry);
//                 });
//         }, (error: any) => {
//             return handleFailure(error, entry);
//         });
// }

// function handleFailure(error: any, filename: string) {
//     // TODO:  do we need location?
//     const diagnostic: Diagnostic = {
//         level: DiagnosticLevel.Fatal,
//         filename,
//         message: error.message,
//     };
//     return { errors: [diagnostic] };
// }
