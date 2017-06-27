jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
import { enableCompatMode, disableCompatMode } from "../src/framework/xproxy";

const itOriginal = it;
const beforeEachOriginal = beforeEach;
const describeOriginal = describe;

let lastBeforeEachFn; // this is needed because we are artificially duplicating some tests, so the initialization must run twice

const queue = [];
let running = false;

global.describe = function (name, fn) {
    lastBeforeEachFn = undefined;
    describeOriginal(name, fn);
}

global.beforeEach = function (fn) {
    lastBeforeEachFn = fn;
    beforeEachOriginal(fn);
}

global.itCompat = function (name, fn) {
    const reset = lastBeforeEachFn;
    itOriginal('[Compat Only] ' + name, function () {
        const thisValue = this, args = arguments;
        return new Promise((resolve, reject) => {
            queue.push(() => {
                return new Promise((resolve) => {
                    // runs the beforeEach right before the test runs
                    reset && reset();
                    enableCompatMode();
                    resolve(fn.apply(thisValue, args));
                }).then(resolve, reject);
            });
            run();
        });
    });
};

global.it = function (name, fn) {
    const reset = lastBeforeEachFn;
    itOriginal(name, function () {
        const thisValue = this, args = arguments;
        return new Promise((resolve, reject) => {
            queue.push(() => {
                return new Promise((resolve) => {
                    // runs the beforeEach right before the test runs
                    reset && reset();
                    disableCompatMode();
                    resolve(fn.apply(thisValue, args));
                }).then(resolve, reject);
            });
            run();
        });
    });
    itOriginal('[Compat] ' + name, function () {
        const thisValue = this, args = arguments;
        return new Promise((resolve, reject) => {
            queue.push(() => {
                return new Promise((resolve) => {
                    // runs the beforeEach right before the test runs
                    resetDOM();
                    reset && reset();
                    enableCompatMode();
                    resolve(fn.apply(thisValue, args));
                }).then(resolve, reject);
            });
            run();
        });
    });
};

function resetDOM() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}

function run() {
    if (running || queue.length === 0) {
        return;
    }
    running = true;
    const first = queue.shift();
    function nextAndNext() {
        running = false;
        run();
    }
    first().then(nextAndNext, nextAndNext);
}
