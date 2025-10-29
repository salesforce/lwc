import { LightningElement, track, api } from 'lwc';

export default class extends LightningElement {
    @track customCtor = undefined;

    async loadCtor() {
        // note, using `c-` prefix instead of `c/` because these are
        // handled by `registerForLoad`
        const ctor = await import('c-ctor');
        this.customCtor = ctor;
    }
    async loadAlter() {
        // note, using `c-` prefix instead of `c/` because these are
        // handled by `registerForLoad`
        const alter = await import('c-alter');
        this.customCtor = alter;
    }

    @api enableCtor() {
        void this.loadCtor();
    }
    @api enableAlter() {
        void this.loadAlter();
    }
    @api disableAll() {
        this.customCtor = null;
    }
}
