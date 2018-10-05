export default function detect(): boolean {
    // We need to expose our Synthetic Shadow Root to the window
    // because Selenium uses instanceof to check for ShadowRoot instances.
    // Ideally, we would only apply this during Selenium testing
    // But we need a way to detect that Selenium is running
    // As is, this polyfill will always be applied which is not great
    return true;
}
