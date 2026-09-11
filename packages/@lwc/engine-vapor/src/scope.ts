/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * A minimal effect-scope implementation modeled on Vue's `EffectScope`. A scope
 * collects cleanup callbacks (e.g. stopping render effects, removing event
 * listeners) registered via `onScopeDispose` while it is active, so that an
 * entire subtree of reactive work can be torn down at once. This is what makes
 * `v-if`/`for:each` branch teardown leak-free.
 */

export class EffectScope {
    private cleanups: (() => void)[] = [];
    private effects: { stop(): void }[] = [];
    private active = true;
    readonly parent: EffectScope | undefined;

    constructor() {
        this.parent = activeScope;
    }

    register(cleanup: () => void): void {
        if (this.active) {
            this.cleanups.push(cleanup);
        }
    }

    /** Register a reactive effect to be stopped when this scope is torn down.
     *  Avoids allocating a per-effect `() => effect.stop()` cleanup closure
     *  (paid once per render effect on mount — ~3 per for:each row). */
    registerEffect(effect: { stop(): void }): void {
        if (this.active) {
            this.effects.push(effect);
        }
    }

    /** Run `fn` with this scope active so nested registrations attach here. */
    run<T>(fn: () => T): T {
        const prev = activeScope;
        // Publish this scope as the active registration target for the duration of `fn` —
        // nested effects/scopes attach here; the pattern requires exposing `this` globally.
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        activeScope = this;
        try {
            return fn();
        } finally {
            activeScope = prev;
        }
    }

    stop(): void {
        if (!this.active) return;
        this.active = false;
        // Stop directly-registered effects FIRST, then run other cleanups. This
        // preserves the previous behavior in the common case (a scope holds only
        // `effect.stop()` cleanups, registered by renderEffect AFTER effect.run()),
        // and is the safe ordering when a scope ALSO holds a non-effect cleanup
        // (e.g. a DynamicFragment registers a closure that stops a NESTED content
        // scope): making this scope's own effects inert before running arbitrary
        // cleanups prevents a cleanup-triggered write from being observed by an
        // effect that hasn't been stopped yet.
        for (const effect of this.effects) {
            effect.stop();
        }
        this.effects = [];
        for (const cleanup of this.cleanups) {
            cleanup();
        }
        this.cleanups = [];
    }
}

let activeScope: EffectScope | undefined;

export function getActiveScope(): EffectScope | undefined {
    return activeScope;
}

/** Register a cleanup with the currently-active scope, if any. */
export function onScopeDispose(cleanup: () => void): void {
    if (activeScope) {
        activeScope.register(cleanup);
    }
}
