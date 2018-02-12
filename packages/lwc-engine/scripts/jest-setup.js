/**
 * Add global mock for User Timing API. The engine rely on those API for performance measurement.
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API
 */
global.performance = {
    mark() {},
    measure() {},
    clearMarks() {},
    clearMeasures() {},
};
