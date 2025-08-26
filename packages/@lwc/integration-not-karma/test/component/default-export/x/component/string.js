export default Math.random() < 0 ? 'foo' : 'bar'; // trick bundler/minifier into not dead-code-eliminating this
