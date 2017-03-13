import { HTMLElement } from 'raptor-engine';

export default class Options extends HTMLElement {
    config;
    isRunning;

    handleBaseUrlChange({ target }) {
        this.config.baseUrl = target.value;
    }

    handleCompareUrlChange({ target }) {
        this.config.compareUrl = target.value;
    }

    handleGrepChange({ target }) {
        this.config.grep = target.value;
    }

    handleMinSampleCountChange({ target }) {
        this.config.minSampleCount = parseInt(target.value);
    }

    handleMaxDurationChange({ target }) {
        this.config.maxDuration = parseInt(target.value);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('start'));
    }
}
