export let isAdapterInvoked = false;

export function adapter() {
    isAdapterInvoked = true;
}
