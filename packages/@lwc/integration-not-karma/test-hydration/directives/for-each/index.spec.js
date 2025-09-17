export default {
    props: {
        colors: ['red', 'yellow', 'blue'],
    },
    snapshot(target) {
        return {
            ul: target.shadowRoot.querySelector('ul'),
            colors: target.shadowRoot.querySelectorAll('li'),
        };
    },
    test(target, snapshots) {
        const ul = target.shadowRoot.querySelector('ul');
        let colors = ul.querySelectorAll('li');
        expect(ul).toBe(snapshots.ul);
        expect(colors[0]).toBe(snapshots.colors[0]);
        expect(colors[0].textContent).toBe('red');
        expect(colors[1]).toBe(snapshots.colors[1]);
        expect(colors[1].textContent).toBe('yellow');
        expect(colors[2]).toBe(snapshots.colors[2]);
        expect(colors[2].textContent).toBe('blue');

        target.colors = ['orange', 'green', 'violet'];

        return Promise.resolve().then(() => {
            colors = ul.querySelectorAll('li');
            expect(colors[0].textContent).toBe('orange');
            expect(colors[1].textContent).toBe('green');
            expect(colors[2].textContent).toBe('violet');
        });
    },
};
