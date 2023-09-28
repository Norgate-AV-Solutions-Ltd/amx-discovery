import { Date } from "./Date";

export interface Device {
    ip: string;
    system: number;
    date: Date;
    time: string;
    mac: string;
    hostname: string;
    id: string;
}
