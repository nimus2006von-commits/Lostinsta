#!/usr/bin/env python3
import struct
import zlib


def chunk(tag, data):
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def make_icon(size, filename):
    bg_top = (18, 18, 26)
    bg_bottom = (42, 38, 84)
    dot = (124, 108, 245)

    rows = []
    cx = (size - 1) / 2
    cy = (size - 1) / 2
    radius = size * 0.30

    for y in range(size):
        row = bytearray()
        t = y / (size - 1)
        br = round(bg_top[0] + (bg_bottom[0] - bg_top[0]) * t)
        bgc = round(bg_top[1] + (bg_bottom[1] - bg_top[1]) * t)
        bb = round(bg_top[2] + (bg_bottom[2] - bg_top[2]) * t)
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = (dx * dx + dy * dy) ** 0.5
            if dist <= size * 0.36:
                row += bytes((br, bgc, bb, 255))
            elif dist <= radius and dist > size * 0.25:
                row += bytes(dot + (255,))
            else:
                row += bytes((br, bgc, bb, 255))
        rows.append(bytes(row))

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(b"".join(b"\x00" + r for r in rows), 9))
        + chunk(b"IEND", b"")
    )

    with open(filename, "wb") as f:
        f.write(png)


make_icon(192, "icons/icon-192.png")
make_icon(512, "icons/icon-512.png")
print("icons created")
