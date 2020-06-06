
function getConfig() {
    if (__DEV__) {
        return {
            // addr: 'ws://127.0.0.1:9421',
            addr: `ws://${window.location.hostname}:9421`,
        }
    }
    return {
        addr: 'ws://39.101.200.7:9421',
    };
}

export default getConfig();

