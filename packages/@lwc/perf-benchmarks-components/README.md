# @lwc/perf-benchmarks-components

This is a companion package to `@lwc/perf-benchmarks`. The reason it exists is because we need a way to be able to swap out these components when running in `@lwc/perf-benchmarks`.

For instance, if we change something in the LWC compiler, this will affect the compiled components, but not necessarily the runtime code. So we need to recompile all components using the new compiler in order to do an effective A/B test of the compiler itself.

This means we need different versions of the components used in `@lwc/perf-benchmarks`, which means we need the components to live as a separate package.
