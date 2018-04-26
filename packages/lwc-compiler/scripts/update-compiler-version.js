const path = require("path");
const replace = require("rollup-plugin-replace");
const { rollup } = require("rollup");
const { version } = require("../package.json");

async function updateVersion(version) {
    const source = destination = "dist/commonjs/index.js";
    const result = await rollup({
        input: path.resolve(source),
        plugins: [
            replace({
                __VERSION__: version
            })
        ]
    });

    await result.write({
        file: path.resolve(destination),
        format: "cjs",
        sourcemap: true,
    });

    console.log("Compiler version: ", version);
}

if (!version || typeof version !== "string") {
    throw new Error(
        "Failed to update compiler version. Expected version value as a string, received: ",
        version
    );
}

updateVersion(version);
