export class Color {

    r: number;
    g: number;
    b: number;
    a: number;
    id: string;

    setColor(c: number) {
        return Math.round(c/10)*10;
    }

    constructor(r: number, g: number, b: number, a: number = 0xff) {
        this.r = this.setColor(r);
        this.g = this.setColor(g);
        this.b = this.setColor(b);
        this.a = a;
        this.id = `${this.r}-${this.g}-${this.b}-${a}`;
    }

    static fromARGB(code: number): Color {
        return new Color((code >> 16) & 0xff, (code >> 8) & 0xff, code & 0xff, (code >> 24) & 0xff);
    }

    static fromABGR(code: number): Color {
        return new Color(code & 0xff, (code >> 8) & 0xff, (code >> 16) & 0xff, (code >> 24) & 0xff);
    }

    static fromRGB(code: number): Color {
        return new Color((code >> 16) & 0xff, (code >> 8) & 0xff, code & 0xff, 0);
    }

    toABGR(): number {
        return (this.a << 24) | (this.b << 16) | (this.g << 8) | this.r;
    }

    toARGB(): number {
        return (this.a << 24) | (this.r << 16) | (this.g << 8) | this.b;
    }
}