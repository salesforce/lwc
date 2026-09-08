/*
 * Teardown microbench: Set-based (LWC) vs Link-based (Vue) reactivity teardown.
 *
 * ROOT CAUSE HYPOTHESIS: LWC-vapor uses Set<ReactiveEffect> for Dep structure,
 * so ReactiveEffect.stop() calls dep.delete(this) for each dep. Set.delete is
 * O(hash + search), so teardown is O(n_effects × m_deps × delete_cost).
 *
 * Vue Vapor uses doubly-linked-list Link nodes: unlinking is O(1) pointer
 * manipulation per link, so teardown is O(n_effects × m_deps × constant).
 *
 * METHOD: Isolate pure data-structure teardown cost (no DOM, no other overhead).
 */

import { describe, bench } from 'vitest';

// ============================================================================
// LWC-vapor's Set-based structure (simplified from renderEffect.ts)
// ============================================================================

type LwcDep = Set<LwcEffect>;

class LwcEffect {
    deps: LwcDep[] = [];
    private stopped = false;

    addDep(dep: LwcDep): void {
        this.deps.push(dep);
        dep.add(this);
    }

    stop(): void {
        if (this.stopped) return;
        this.stopped = true;
        // Critical path: O(n) Set.delete for each dep
        for (const dep of this.deps) {
            dep.delete(this);
        }
        this.deps = [];
    }
}

class LwcScope {
    private cleanups: (() => void)[] = [];
    private active = true;

    register(cleanup: () => void): void {
        if (this.active) {
            this.cleanups.push(cleanup);
        }
    }

    stop(): void {
        if (!this.active) return;
        this.active = false;
        for (const cleanup of this.cleanups) {
            cleanup();
        }
        this.cleanups = [];
    }
}

// ============================================================================
// Vue Vapor's Link-based structure (from system.ts)
// ============================================================================

interface VueLink {
    dep: any;
    sub: any;
    prevSub: VueLink | undefined;
    nextSub: VueLink | undefined;
    prevDep: VueLink | undefined;
    nextDep: VueLink | undefined;
}

class VueEffect {
    deps: VueLink | undefined = undefined;
    depsTail: VueLink | undefined = undefined;
    private stopped = false;

    addLink(depNode: any): void {
        const prevDep = this.depsTail;
        const link: VueLink = {
            dep: depNode,
            sub: this,
            prevDep,
            nextDep: undefined,
            prevSub: undefined,
            nextSub: undefined,
        };

        if (prevDep) {
            prevDep.nextDep = link;
        } else {
            this.deps = link;
        }
        this.depsTail = link;
    }

    stop(): void {
        if (this.stopped) return;
        this.stopped = true;
        // O(1) pointer manipulation per link
        let dep = this.deps;
        while (dep !== undefined) {
            const nextDep = dep.nextDep;
            // Simplified unlink (just traverse)
            dep = nextDep;
        }
        this.deps = undefined;
        this.depsTail = undefined;
    }
}

class VueScope {
    private effects: VueEffect[] = [];

    register(effect: VueEffect): void {
        this.effects.push(effect);
    }

    stop(): void {
        for (const effect of this.effects) {
            effect.stop();
        }
        this.effects = [];
    }
}

// ============================================================================
// BENCHMARKS: Match krausest clear-1k scenario (1000 scopes × 3 effects × 5 deps)
// ============================================================================

const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};
const OPTS = { time: 2000, warmupTime: 300, teardown } as const;

describe('teardown-microbench: Set vs Link', () => {
    // Baseline: scope cleanup overhead only (no effect teardown)
    bench(
        '1k scopes × 3 empty cleanups (baseline)',
        () => {
            const scopes: LwcScope[] = [];

            for (let i = 0; i < 1000; i++) {
                const scope = new LwcScope();
                scope.register(() => {});
                scope.register(() => {});
                scope.register(() => {});
                scopes.push(scope);
            }

            for (const scope of scopes) {
                scope.stop();
            }
        },
        OPTS
    );

    // LWC Set-based: 1k scopes × 3 effects × 5 deps
    bench(
        'LWC Set: 1k × 3 effects × 5 deps',
        () => {
            const scopes: LwcScope[] = [];
            const sharedDeps: LwcDep[] = [];

            // Pre-create shared deps
            for (let d = 0; d < 10; d++) {
                sharedDeps.push(new Set());
            }

            for (let i = 0; i < 1000; i++) {
                const scope = new LwcScope();

                for (let e = 0; e < 3; e++) {
                    const effect = new LwcEffect();

                    for (let d = 0; d < 5; d++) {
                        effect.addDep(sharedDeps[d]);
                    }

                    scope.register(() => effect.stop());
                }

                scopes.push(scope);
            }

            // Measure teardown
            for (const scope of scopes) {
                scope.stop();
            }
        },
        OPTS
    );

    // Vue Link-based: 1k scopes × 3 effects × 5 links
    bench(
        'Vue Link: 1k × 3 effects × 5 links',
        () => {
            const scopes: VueScope[] = [];
            const sharedDepNodes: any[] = [];

            for (let d = 0; d < 10; d++) {
                sharedDepNodes.push({});
            }

            for (let i = 0; i < 1000; i++) {
                const scope = new VueScope();

                for (let e = 0; e < 3; e++) {
                    const effect = new VueEffect();

                    for (let d = 0; d < 5; d++) {
                        effect.addLink(sharedDepNodes[d]);
                    }

                    scope.register(effect);
                }

                scopes.push(scope);
            }

            for (const scope of scopes) {
                scope.stop();
            }
        },
        OPTS
    );

    // Heavy deps: 10 deps per effect (test scaling)
    bench(
        'LWC Set: 1k × 3 effects × 10 deps',
        () => {
            const scopes: LwcScope[] = [];
            const sharedDeps: LwcDep[] = [];

            for (let d = 0; d < 20; d++) {
                sharedDeps.push(new Set());
            }

            for (let i = 0; i < 1000; i++) {
                const scope = new LwcScope();

                for (let e = 0; e < 3; e++) {
                    const effect = new LwcEffect();

                    for (let d = 0; d < 10; d++) {
                        effect.addDep(sharedDeps[d]);
                    }

                    scope.register(() => effect.stop());
                }

                scopes.push(scope);
            }

            for (const scope of scopes) {
                scope.stop();
            }
        },
        OPTS
    );

    bench(
        'Vue Link: 1k × 3 effects × 10 links',
        () => {
            const scopes: VueScope[] = [];
            const sharedDepNodes: any[] = [];

            for (let d = 0; d < 20; d++) {
                sharedDepNodes.push({});
            }

            for (let i = 0; i < 1000; i++) {
                const scope = new VueScope();

                for (let e = 0; e < 3; e++) {
                    const effect = new VueEffect();

                    for (let d = 0; d < 10; d++) {
                        effect.addLink(sharedDepNodes[d]);
                    }

                    scope.register(effect);
                }

                scopes.push(scope);
            }

            for (const scope of scopes) {
                scope.stop();
            }
        },
        OPTS
    );

    // 10k rows (krausest clear-10k scenario)
    bench(
        'LWC Set: 10k × 3 effects × 5 deps',
        () => {
            const scopes: LwcScope[] = [];
            const sharedDeps: LwcDep[] = [];

            for (let d = 0; d < 10; d++) {
                sharedDeps.push(new Set());
            }

            for (let i = 0; i < 10000; i++) {
                const scope = new LwcScope();

                for (let e = 0; e < 3; e++) {
                    const effect = new LwcEffect();

                    for (let d = 0; d < 5; d++) {
                        effect.addDep(sharedDeps[d]);
                    }

                    scope.register(() => effect.stop());
                }

                scopes.push(scope);
            }

            for (const scope of scopes) {
                scope.stop();
            }
        },
        OPTS
    );

    bench(
        'Vue Link: 10k × 3 effects × 5 links',
        () => {
            const scopes: VueScope[] = [];
            const sharedDepNodes: any[] = [];

            for (let d = 0; d < 10; d++) {
                sharedDepNodes.push({});
            }

            for (let i = 0; i < 10000; i++) {
                const scope = new VueScope();

                for (let e = 0; e < 3; e++) {
                    const effect = new VueEffect();

                    for (let d = 0; d < 5; d++) {
                        effect.addLink(sharedDepNodes[d]);
                    }

                    scope.register(effect);
                }

                scopes.push(scope);
            }

            for (const scope of scopes) {
                scope.stop();
            }
        },
        OPTS
    );
});
