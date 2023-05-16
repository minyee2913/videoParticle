"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = void 0;
class Color {
    constructor(r, g, b, a = 0xff) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.id = `${r}-${g}-${b}-${a}`;
    }
    static fromARGB(code) {
        return new Color((code >> 16) & 0xff, (code >> 8) & 0xff, code & 0xff, (code >> 24) & 0xff);
    }
    static fromABGR(code) {
        return new Color(code & 0xff, (code >> 8) & 0xff, (code >> 16) & 0xff, (code >> 24) & 0xff);
    }
    static fromRGB(code) {
        return new Color((code >> 16) & 0xff, (code >> 8) & 0xff, code & 0xff, 0);
    }
    toABGR() {
        return (this.a << 24) | (this.b << 16) | (this.g << 8) | this.r;
    }
    toARGB() {
        return (this.a << 24) | (this.r << 16) | (this.g << 8) | this.b;
    }
}
exports.Color = Color;
