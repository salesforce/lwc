# Dynamic Components or Pivots

## Status

_wip_

## Goal

Support dynamic (lazy or promise based) component creation that runs in the same fiber.

## The Problem

Today, there are only 2 ways to create a Raptor component instance:

 * Invoking `Raptor.createElement()`, which returns a new DOM Element with the public API of the underlaying component instance, creating a brand new fiber.
 * Use a `<template>` tag in a component, which creates a new component under the hood that runs on the same fiber as the owner component, and therefore it is subject to the invariants of the diffing algo.

The problem is that to create a component programatically, you have to use `Raptor.createElement()`, which implies creating a new fiber, which is sometimes undesirable because the developer will have to observe the owner state, and pipe all values into the children element manually, which also implies that there will be at multiple invocations to the patch mechanism (one per fiber).

## Open questions

 * Can the dynamic component method be a parameter on render?
 * Lifecycle hooks: Where is the right place for all this?
 * Promise based? An opaque construct?
 * Slots placeholder support: What if owner has a slot that should be propagated to the children?
 * Can children component be folded into the owner?

## Proposals

TBD
