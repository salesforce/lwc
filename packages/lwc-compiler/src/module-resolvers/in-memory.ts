export function inMemoryModuleResolver(files: [{ filename: string }]) {
    for (let key of Object.keys(files)) {
        if (files[key] == undefined || typeof files[key] !== 'string') {
            throw new Error(
                `in-memory module resolution expects values to be string. Received ${files[
                    key
                ]} for key ${key}`
            );
        }
    }

    const fileExists = (fileName: string ) => files.hasOwnProperty(fileName);

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
