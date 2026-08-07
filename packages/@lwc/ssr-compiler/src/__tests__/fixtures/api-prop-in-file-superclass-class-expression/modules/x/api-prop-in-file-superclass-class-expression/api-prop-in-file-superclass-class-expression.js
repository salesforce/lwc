import { LightningElement, api } from 'lwc';

// W-23508928: `@api` on an in-file base *class expression*. The base must reach LightningElement
// indirectly (via `Mid`) — a class expression extending `LightningElement` *directly* is picked up
// as a component by the main traversal, so its `@api` lands in the leaf allowlist without the fix
// and wouldn't exercise the pass. Here the base's `@api value` is dropped from the leaf's
// `setStaticInternals` allowlist; only the injected `__registerPublicProperties` on the class
// expression + the runtime union keeps `{value}` from rendering `null`.
const Mid = class extends LightningElement {};
const Base = class extends Mid {
    @api value;
};

export default class extends Base {}
