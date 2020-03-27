import WS from "ws";
import net from "net";
import TelnetParser from "./parser";
import Config from "./config";

const tcp = net.createServer((sock) => {
    console.log("TCP client connected:", sock.remoteAddress);
    function sendBuffer(data: Buffer): void {
        sock.write(new Uint8Array(data));
    }
    function sendString(data: string): void {
        sock.write(new Uint8Array(Buffer.from(data + "\r\n", "utf-8")));
    }
    sendString("[WS-Telnet TCP Proxy]");
    sendString(`Forwarding connection to ${Config.remote}`);
    const ws: WS = new WS(Config.remote);
    const parser: TelnetParser = new TelnetParser();

    ws.on("open", () => {
        console.log("Proxy connection established for client:", sock.remoteAddress);
        parser.on("data", (data) => {
            if (ws.readyState === 1) ws.send(data);
        });
        sendString("Proxy connection established.\n");
        sock.on("data", (chunk) => {
            parser.accumulate(chunk);
        });
    });

    ws.on("message", (data) => {
        let buf: Buffer | undefined = undefined;
        if (typeof data === "string") {
            buf = Buffer.from(data, "utf-8");
        } else if (data instanceof ArrayBuffer) {
            buf = Buffer.from(data);
        } else {
            if (data instanceof Array) {
                data.forEach((d) => sendBuffer(d));
            } else {
                buf = data;
            }
        }
        if (buf !== undefined) {
            sendBuffer(buf);
        }
    });
    ws.on("close", (code, reason) => {
        console.log("Proxy connection lost for client:", sock.remoteAddress);
        sock.end();
    });
    sock.on("error", (err) => {
        if (!err.message.includes("ECONNRESET")) {
            throw err;
        } else {
            console.log("TCP client connection lost without calling `end`.");
        }
    });
    sock.on("close", (err) => {
        console.log("Client disconnected:", sock.remoteAddress);
        if (ws.readyState === 1) {
            ws.close(undefined, "Local TCP connection lost.");
        }
    });
});

tcp.listen(Config.local.port, Config.local.host);
