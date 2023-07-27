import dgram, { RemoteInfo } from "dgram";
import { Buffer } from "buffer";

interface Date {
    short: string;
    long: string;
}

interface Device {
    ip: string;
    system: number;
    date: Date;
    time: string;
    mac: string;
    hostName: string;
    id?: string;
}

function getTimestamp() {
    return new Date().toLocaleTimeString();
}

function calculateChecksum(data: Buffer): number {
    let checksum = 0;

    const bytes = Array.from(data);

    for (const byte of bytes) {
        checksum += byte;
    }

    return checksum & 0xff;
}

function getSystemNumber(message: Buffer): number {
    return message[5] * 256 + message[6];
}

function getShortDate(message: Buffer): string {
    const day = message[25].toString().padStart(2, "0");
    const month = message[24].toString().padStart(2, "0");
    const year = (message[26] * 256 + message[27]).toString();

    return `${day}/${month}/${year}`;
}

function getMessageEnd(message: Buffer, start: number): number {
    const length = message.indexOf(0x00, start) - start;
    const end = start + length;

    return end;
}

function getLongDate(message: Buffer): string {
    const start = 34;

    return message.slice(start, getMessageEnd(message, start)).toString().trim();
}

function getTime(message: Buffer): string {
    const hours = message[28].toString().padStart(2, "0");
    const minutes = message[29].toString().padStart(2, "0");
    const seconds = message[30].toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}

function getMac(message: Buffer): string {
    return `${message[58]
        .toString(16)
        .padStart(2, "0")}:${message[59]
        .toString(16)
        .padStart(2, "0")}:${message[60]
        .toString(16)
        .padStart(2, "0")}:${message[61]
        .toString(16)
        .padStart(2, "0")}:${message[62]
        .toString(16)
        .padStart(2, "0")}:${message[63]
        .toString(16)
        .padStart(2, "0")}`;
}

function getHostName(message: Buffer): string {
    const start = 64;

    return message.slice(start, getMessageEnd(message, start)).toString();
}

function getId(message: Buffer): string {
    const start = 74;

    return message.slice(start, getMessageEnd(message, start)).toString();
}

function verifyMessage(message: Buffer): boolean {
    const checksum = message[message.length - 1];
    message = message.slice(0, message.length - 1);

    return calculateChecksum(message) === checksum;
}



function main() {
    const socket = dgram.createSocket("udp4");

    const devices: Device[] = [];

    socket.on("message", (message: Buffer, remoteInfo: RemoteInfo) => {
        if (!verifyMessage(message)) {
            console.log(`${getTimestamp()} - Invalid Message from ${remoteInfo.address}`);
            return;
        }

        devices.push({
            ip: remoteInfo.address,
            system: getSystemNumber(message),
            date: {
                short: getShortDate(message),
                long: getLongDate(message),
            },
            time: getTime(message),
            mac: getMac(message),
            hostName: getHostName(message),
            id: getId(message),
        });
    });

    // socket.on("listening", () => {
    //     const address = socket.address();
    //     console.log(`Listening on port ${address.port}`);
    // });

    socket.bind(1319);

    setTimeout(() => {
        socket.close();

        if (devices.length === 0) {
            return;
        }

        console.log(JSON.stringify(devices, null, 4));
    }, 5000);
}

if (require.main === module) {
    main();
}
