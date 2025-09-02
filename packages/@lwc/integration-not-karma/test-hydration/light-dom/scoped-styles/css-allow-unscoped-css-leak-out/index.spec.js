export default {
    snapshot(target) {
        return {
            basicElement: target.shadowRoot.querySelector('x-basic'),
            otherElement: target.shadowRoot.querySelector('x-other'),
        };
    },
    test(target, snapshots) {
        const { basicElement, otherElement } = this.snapshot(target);
        expect(basicElement).toBe(snapshots.basicElement);
        expect(otherElement).toBe(snapshots.otherElement);

        const basicHostComputed = getComputedStyle(basicElement);
        const basicComputed = getComputedStyle(basicElement.querySelector('div'));
        const otherComputed = getComputedStyle(otherElement.querySelector('div'));
        expect(basicHostComputed.backgroundColor).toEqual('rgb(255, 0, 0)');
        expect(basicComputed.color).toEqual('rgb(0, 128, 0)');
        expect(basicComputed.marginLeft).toEqual('10px');
        expect(basicComputed.marginRight).toEqual('5px');
        expect(otherComputed.color).toEqual('rgb(0, 0, 0)');
        expect(otherComputed.marginLeft).toEqual('10px');
        expect(otherComputed.marginRight).toEqual('5px');
    },
};
