import { EventEmitter } from "events";

class TelnetParser extends EventEmitter {
    private buffer: Buffer = Buffer.alloc(0);
    public accumulate(data: Buffer): void {
        if (this.buffer.length === 0) this.buffer = data;
        else this.buffer = Buffer.concat([this.buffer, data]);
        const buffers: Buffer[] = [];
        let iac = this.buffer.indexOf(255);
        if (iac !== -1) iac = this.buffer.indexOf(255);
        let behind = 0;
        while (iac !== -1) {
            if (this.buffer[iac + 1] === 255) iac += 2;
            else {
                if (this.buffer[iac + 1] === 240) iac += 2;
                buffers.push(this.buffer.slice(behind, iac));
                behind = iac;
                iac = this.buffer.indexOf(255, behind + 1);
            }
        }
        if (behind < this.buffer.length && buffers.length > 0) {
            buffers.push(this.buffer.slice(behind));
        } else {
            buffers.push(this.buffer);
        }
        buffers
            .filter((x) => x.length > 0)
            .map((x) => TelnetParser.cleanSubnegotiationData(x))
            .forEach((buff) => {
                if (buff.length > 2 && buff[buff.length - 2] === 0x0d && buff[buff.length - 1] === 0x0a)
                    buff = buff.slice(0, buff.length - 2);
                this.emit("data", buff);
            });
        this.buffer = Buffer.alloc(0);
    }

    public on(event: "data", listener: (data: Buffer) => void): this;
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    public emit(event: "data", data: Buffer): boolean;
    public emit(event: string, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
}

namespace TelnetParser {
    export function cleanSubnegotiationData(data: Buffer): Buffer {
        const temp: number[] = [];
        for (let i = 0; i < data.byteLength; i++) {
            if (data[i] === 255 && i + 1 < data.byteLength && data[i + 1] === 255) i++;
            temp.push(data[i]);
        }
        return Buffer.from(temp);
    }
}

export = TelnetParser;
