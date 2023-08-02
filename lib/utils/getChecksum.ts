export function getChecksum(data: Buffer): number {
    let checksum = 0;

    const bytes = Array.from(data);

    for (const byte of bytes) {
        checksum += byte;
    }

    return checksum & 0xff;
}
