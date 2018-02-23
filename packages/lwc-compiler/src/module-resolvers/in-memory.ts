import { BundleFiles } from "../options";

export function inMemoryModuleResolver(files: BundleFiles) {
    const fileExists = (fileName: string) => files.hasOwnProperty(fileName);

    return {
        fileExists(fileName: string) {
            return Promise.resolve(fileExists(fileName));
        },
        readFile(fileName: string) {
            return fileExists(fileName)
                ? Promise.resolve(files[fileName])
                : Promise.reject(new Error(`No such file ${fileName}`));
        },
    };
}
