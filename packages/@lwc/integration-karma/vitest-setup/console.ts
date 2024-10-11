let consoleCallCount = 0;

// Patch console.error/console.warn, etc. so if it's called, we throw
function patchConsole() {
    (['error', 'warn'] as const).forEach(function (method) {
        var originalMethod = window.console[method];
        window.console[method] = function () {
            consoleCallCount++;
            return originalMethod.apply(this, Array.from(arguments));
        };
    });
}

function throwIfConsoleCalled() {
    if (consoleCallCount) {
        throw new Error(
            'Expected console not to be called, but was called ' + consoleCallCount + ' time(s)'
        );
    }
}

beforeAll(function () {
    patchConsole();
});

afterAll(function () {
    throwIfConsoleCalled();
});

afterEach(function () {
    consoleCallCount = 0;
});
