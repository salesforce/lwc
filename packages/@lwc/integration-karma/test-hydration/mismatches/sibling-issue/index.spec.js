export default {
    props: {
        showMe: false,
    },
    clientProps: {
        showMe: true,
    },
    snapshot(target) {
        // const div = target.querySelector('div');
        // return {
        //     div,
        // };
    },
    test(target, snapshots, consoleCalls) {
        // FIXME: validate hydration mismatch and console warn/errors
    },
};
