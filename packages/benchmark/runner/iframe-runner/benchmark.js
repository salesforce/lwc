const BENCHMARK_NAME_REGEX = /^(?:[\da-z-_]+\/?)+$/;

export const registered = [];

export function register(config) {
    if (!config.name) {
        throw new Error('Missing name for benchmark.');
    } else if (!config.name.match(BENCHMARK_NAME_REGEX)) {
        throw new Error(`${config.name} is an invalid benchmark name.`);
    }

    if (!config.run) {
        throw new Error(`${config.name} benchmark should have a run function`);
    }

    registered.push(config);
}
