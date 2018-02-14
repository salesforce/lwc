# LWC Performance Timing

## Status

- Start Date: 2018-02-05
- RFC PR: https://github.com/salesforce/lwc/pull/61
- Implementation PR: https://github.com/salesforce/lwc/pull/98

## Goals

* Provide better tooling to speedup a LWC based application by surfacing performance timing information about the engine and the components.
* Allow programmatic access to the timing information for automated performance testing.
* Provide an equivalent support on all the supported browsers.

## Challenges

* It can be hard to analyse performance profile of LWC based applications. Reading the call stack and understanding why a component get rendered requires a deep knowledge of LWC lifecycle and rendering.
* Browsers like IE11 don't offer the capability to view the generated performance profile as a flamechart. In order to optimize on such browser, markers should be added to component code. While this approach works well to measure user-land code, it doesn't give information of the engine and rendering performance.

## Existing implementations

### React timing marks

In version `v15.4.0`, React added support for marker on the timeline with the different lifecycle events ([changelog](https://reactjs.org/blog/2016/11/16/react-v15.4.0.html#profiling-components-with-chrome-timeline)). This functionality is disabled by default, can only get turned on in `DEV` mode using the `?react_perf` query string. See example at: https://olz8m97rz5.codesandbox.io/?react_perf.

**Note:** Since v16, the markers are on by default in `DEV` mode.

**Observed lifecycle hooks:**

* rendering phases: `mount`, `constructor`, `update`, `commitChanges`
* component phases: `componentWillMount`, `componentWillUnmount`, `componentWillReceiveProps`, `shouldComponentUpdate`, `componentWillUpdate`, `componentDidUpdate`, `componentDidMount`, `getChildContext`
**Implementation:** [ReactDebugFiberPerf.js](https://github.com/facebook/react/blob/b77b12311f0c66aad9b50f805c53dcc05d2ea75c/packages/react-reconciler/src/ReactDebugFiberPerf.js)

### React performance tools (deprecated with v16)

Before releasing the timing marks, React offered the capability to introspect performance timing via the `Perf` object. This object is only available in `DEV` mode. The object exposes the following APIs:

* Measurement:

    * `Perf.start()`, `Perf.stop()`: Start and stop the measurement
    * `Perf.getLastMeasurements()`: Get the last measurement object. It's an opaque object that's consumed by analysis methods

* Analysis:
    * `Perf.printInclusive(measurements)`: print component inclusive time and #instances
    * `Perf.printExclusive(measurements)`: print component exclusive time for the different lifecycle hooks
    * `Perf.printWasted(measurements)`: print time waited rendering component that didn't led to any change in the DOM
    * `Perf.printOperations(measurements)`: print time for DOM operations
    * `Perf.printDOM(measurements)`: print generated DOM

**Observed lifecycle hooks:** `render` and sum of all the lifecycle hooks
**Implementation**: [ReactPerf.js](https://github.com/facebook/react/blob/d6e70586b77d4d52c4046b007b8a619e4463058c/src/renderers/shared/ReactPerf.js)

You can find more detail in the React documentation: [performance tools](https://reactjs.org/docs/perf.html)

### Vue

After React announcement, In version `2.2.3`, Vue added support for markers ([config](https://vuejs.org/v2/api/#performance)). This functionality is also disabled by default, and can be turned on using a global config flag `Vue.config.performance = true;` in `DEV` mode. Originally the functionality was enabled by default, it then get disabled because of the performance impact [issue#5174](https://github.com/vuejs/vue/issues/5174). See example at: https://l4xqw3qn5z.codesandbox.io/

**Observed lifecycle hooks:** `init`, `render`, `patch`
**Implementation:** [perf.js](https://github.com/vuejs/vue/blob/master/src/core/util/perf.js)

## Proposal

### What?

In the case of LWC, the following hooks are good candidates for performance timing: `constructor`, `patch`, `connectedCallback`, `renderedCallback`, `errorCallback`, `disconnectedCallback`.

### Where?
In order to put the measurement in place around the following hooks, it would require to put marks directly in the engine. Using services would have been preferable in order to break the coupling. Since the current service API doesn't expose pre/post hooks for each life cycle event, it make it impossible to measure the actual lifecycle event duration.

### How?

#### Measurement

In both framework, the timing marks is based on [`performance.mark`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark) and [`performance.measure`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure). The following snippet is extracted from Vue implementation:

```js
/** perf.js */
const mark = tag => performance.mark(tag);
const measure = (name, startTag, endTag) => {
    performance.measure(name, startTag, endTag);

    // Avoid performance entry buffer overflow
    performance.clearMarks(startTag);
    performance.clearMarks(endTag);
    performance.clearMeasures(name);
};

/** init.js */
mark('lwc-perf-start:render');

// ... Do the render work ...

mark('lwc-perf-end:render');
measure('render', 'lwc-perf-start:render', 'lwc-perf-end:render');
```

The Chrome devtool timeline surface the `performance.measure`s as a flamechart above the javascript callstack. Firefox and Safari doesn't display the performance measures in the timeline. IE11 and Edge shows markers in a waterfall manner in their timeline.

Adding performance `marks` and `measures` has a visible impact on performance. Because of the overhead on IE11, **the performance markers should be disabled by default** and only turned on when requested.

| # marks | Chrome | Firefox | Safari | IE11   |
|---------|--------|---------|--------|--------|
| 1000    | 3.5    | 1.8     | 2.3    | 15.2   |
| 100000  | 352.5  | 166.3   | 85.5   | 1454.6 |

> Test: https://jsfiddle.net/hd4mzwwo/

#### Enablement

For now, the performance timing will be enabled by default for all mode except `production`. In `production` mode, the code for performance timing will get stripped from the source code.

#### Consumption

The `PerformanceObserver` API is used to observe performance events. The `PerformanceObserver` constructor accepts a callback methods invoked when a performance event is recorded. An instance of the `PerformanceObserver` start listening to performance events after calling the `observe` method with a list of [entry type](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType) to listen.

Even if this API is not available in IE11, it's possible to create a polyfill specifically for `performance.mark` and `performance.measure`.

```js
const observer = new PerformanceObserver(list => {
    console.log(list.getEntries())
});

observer.observe({
    entryTypes: ['measure']
});
```

**Note:** After running some tests, it appears the `PerformanceObserver` doesn't have a maximum buffer size.
