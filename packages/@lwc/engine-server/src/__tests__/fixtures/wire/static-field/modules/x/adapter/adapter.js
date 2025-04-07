export default class adapter {
    constructor(dataCallback) {
        this.dc = dataCallback;
    }

    connect() {}

    update(config) {
        // JSON.stringify serializes differently for engine-server/ssr-compiler, so we do it manually
        const output = Object.entries(config)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`)
            .join('\n')
            // Quotes are encoded as &quot; in the output, which makes it harder to read...
            .replace(/"/g, '');

        this.dc(`{\n${output}\n}`);
    }

    disconnect() {}
}
