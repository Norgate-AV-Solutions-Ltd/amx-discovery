import { BitConverter } from "../BitConverter";
import { DataValidator, Date } from "../types";

export class Packet {
    private data: Buffer;

    constructor(data: Buffer, validator: DataValidator) {
        this.data = data;

        if (!this.validate(validator)) {
            throw new Error("Invalid packet");
        }
    }

    private validate(validator: DataValidator): boolean {
        const { data } = this;

        const index = data.length - 1;

        const checksum = data[index];
        const message = data.subarray(0, index);

        return validator(message) === checksum;
    }

    private getDateShort(): string {
        const { data } = this;

        const day = data[25].toString().padStart(2, "0");
        const month = data[24].toString().padStart(2, "0");
        const year = BitConverter.toInt16(data, 26).toString();

        return `${day}/${month}/${year}`;
    }

    private getSectionEnd(start: number): number {
        const { data } = this;

        const length = data.indexOf(0x00, start) - start;
        const end = start + length;

        return end;
    }

    private getDateLong(): string {
        const { data } = this;

        const start = 34;

        return data.subarray(start, this.getSectionEnd(start)).toString();
    }

    get system(): number {
        return BitConverter.toInt16(this.data.subarray(5, 7), 0);
    }

    get date(): Date {
        return {
            short: this.getDateShort(),
            long: this.getDateLong(),
        };
    }

    get hostname(): string {
        const { data } = this;
        const start = 64;

        return data.subarray(start, this.getSectionEnd(start)).toString();
    }

    get id(): string {
        const { data } = this;
        const start = 74;

        return data.subarray(start, this.getSectionEnd(start)).toString();
    }

    get time(): string {
        const { data } = this;

        const hours = data[28].toString().padStart(2, "0");
        const minutes = data[29].toString().padStart(2, "0");
        const seconds = data[30].toString().padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    }

    get mac(): string {
        const { data } = this;

        return `${data[58].toString(16).padStart(2, "0")}:${data[59]
            .toString(16)
            .padStart(2, "0")}:${data[60]
            .toString(16)
            .padStart(2, "0")}:${data[61]
            .toString(16)
            .padStart(2, "0")}:${data[62]
            .toString(16)
            .padStart(2, "0")}:${data[63].toString(16).padStart(2, "0")}`;
    }
}
