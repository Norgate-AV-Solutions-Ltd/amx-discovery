import dgram, { RemoteInfo } from "dgram";
import { Device } from "../../lib/types";
import { Packet } from "../../lib/Packet";
import { getChecksum } from "../../lib/utils";

const ICSP_PORT = 1319;

export async function discover(): Promise<Device[]> {
    const devices: Device[] = [];

    const socket = dgram.createSocket("udp4");
    socket.bind(ICSP_PORT);

    socket.on("message", (message: Buffer, remoteInfo: RemoteInfo) => {
        let packet: Packet;

        try {
            packet = new Packet(message, getChecksum);
        } catch (error: any) {
            console.error(error.message);
            return;
        }

        devices.push({
            ip: remoteInfo.address,
            system: packet.system,
            date: packet.date,
            time: packet.time,
            mac: packet.mac,
            hostname: packet.hostname,
            id: packet.id,
        });
    });

    return new Promise((resolve) => {
        setTimeout(async () => {
            socket.close();
            resolve(devices);
        }, 5000);
    });
}
