import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:5050')

ws.on('open', () => {
    ws.send(JSON.stringify({
        name: 'hello',
    }));
});
