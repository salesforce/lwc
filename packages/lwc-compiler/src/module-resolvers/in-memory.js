export default function({ sources } = {}) {
    for (let key of Object.keys(sources)) {
        if (sources[key] == undefined || typeof sources[key] !== 'string') {
            throw new Error(
                `in-memory module resolution expects values to be string. Received ${sources[
                    key
                ]} for key ${key}`
            );
        }
    }

    const fileExists = fileName => sources.hasOwnProperty(fileName);

    return {
        fileExists(fileName) {
            return Promise.resolve(fileExists(fileName));
        },

        readFile(fileName) {
            return fileExists(fileName)
                ? Promise.resolve(sources[fileName])
                : Promise.reject(new Error(`No such file ${fileName}`));
        },
    };
}
