import { renderComponent } from '@lwc/ssr-runtime';

// Generic benchmark for styled components, SSR-flavored!
export function styledComponentSsrBenchmark(
    name,
    numComponents,
    componentOrComponents,
    { benchmark, run }
) {
    benchmark(name, () => {
        const isArray = Array.isArray(componentOrComponents);

        run(async () => {
            for (let i = 0; i < numComponents; i++) {
                await renderComponent(
                    isArray ? `styled-component${i}` : 'styled-component',
                    isArray ? componentOrComponents[i] : componentOrComponents,
                    {}
                );
            }
        });
    });
}
