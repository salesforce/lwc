export default {
    props: {
        control: true,
    },
    snapshot(target) {
        return {
            p: target.querySelector('p'),
        };
    },
    test(target, snapshots) {
        expect(target.querySelector('p')).toBe(snapshots.p);

        target.control = false;

        return Promise.resolve().then(() => {
            expect(target.querySelector('p')).toBeNull();
        });
    },
};
