export class BitConverter {
    public static toInt16(buffer: Buffer, offset: number = 0) {
        return buffer[offset] * 256 + buffer[offset + 1];
    }

    public static toInt32(buffer: Buffer, offset: number = 0) {
        return (
            (buffer[offset] << 24) |
            (buffer[offset + 1] << 16) |
            (buffer[offset + 2] << 8) |
            buffer[offset + 3]
        );
    }
}
