function createInterceptedWebsocket(originalWebSocket: typeof window.WebSocket, fetchOptions?: { [key: string]: any }) {
  return function (url: string, protocols?: string | string[]) {
    // Modify the request to include custom headers using a WebSocket handshake
    const modifiedUrl = new URL(url);
    if (modifiedUrl.hostname === fetchOptions.hostname) {
      modifiedUrl.searchParams.append('directline_token', fetchOptions.authorizationToken);
    }

    const ws = new originalWebSocket(modifiedUrl.toString(), protocols);

    const originalSend = ws.send;
    ws.send = function (data: any) {
      originalSend.call(ws, data);
    };

    return ws;
  } as any;
}

export default createInterceptedWebsocket;
