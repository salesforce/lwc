import { LightningElement, track, api } from 'lwc';

export default class extends LightningElement {
    @track customCtor = undefined;

    async loadCtor() {
        // note, using `x-` prefix instead of `x/` because these are
        // handled by `registerForLoad`
        const ctor = await import('x-ctor');
        this.customCtor = ctor;
    }
    async loadAlter() {
        // note, using `x-` prefix instead of `x/` because these are
        // handled by `registerForLoad`
        const alter = await import('x-alter');
        this.customCtor = alter;
    }

    @api enableCtor() {
        this.loadCtor();
    }
    @api enableAlter() {
        this.loadAlter();
    }
    @api disableAll() {
        this.customCtor = null;
    }
}
