import * as fs from 'fs';

const DEFAULT_ENCODING = 'utf-8';

export default function() {
    return {
        fileExists(fileName) {
            return new Promise(resolve =>
                fs.access(fileName, fs.constants.F_OK, err => {
                    return err ? resolve(false) : resolve(true);
                })
            );
        },

        readFile(fileName) {
            return new Promise((resolve, reject) =>
                fs.readFile(fileName, DEFAULT_ENCODING, (err, data) => {
                    return err ? reject(err) : resolve(data);
                })
            );
        },
    };
}
