"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ffmpeg_1 = __importDefault(require("ffmpeg"));
const jimp_1 = __importDefault(require("jimp"));
const fs_1 = require("fs");
const color_1 = require("./color");
const particleRGB = [];
const frames = new Map();
new ffmpeg_1.default("./video/target.mp4", (err, video) => {
    if (err)
        return;
    (0, fs_1.rmSync)("./images", { recursive: true });
    (0, fs_1.mkdirSync)("./images");
    let sec = 0;
    if (video.metadata.duration)
        sec = video.metadata.duration.seconds;
    //#1. 동영상에서 이미지를 추출하기 (비동기 방식)
    video.fnExtractFrameToJPG("./images", {
        start_time: 0,
        every_n_frames: 10,
        file_name: '%s'
    }, (error, files) => {
        if (error)
            throw error;
        files.sort((a, b) => Number(a.replace("./images/1920x1080_", "").replace(".jpg", "")) - Number(b.replace("./images/1920x1080_", "").replace(".jpg", ""))).forEach((v, i) => {
            Framing(v);
        });
    });
});
function Framing(v) {
    return __awaiter(this, void 0, void 0, function* () {
        const pixels = [];
        const image = jimp_1.default.read(v, (err, image) => {
            if (err)
                return;
            image.resize(100, 56);
            let index = Number(v.replace("./images/1920x1080_", "").replace(".jpg", "")) - 1;
            for (let y = 0; y < 56; y++) {
                pixels[y] = [];
                for (let x = 0; x < 100; x++) {
                    let pix = jimp_1.default.intToRGBA(image.getPixelColor(x, y));
                    pixels[y][x] = new color_1.Color(pix.r, pix.g, pix.b, pix.a);
                    if (particleRGB.find((v) => v.id === pixels[y][x].id) === undefined) {
                        particleRGB.push(pixels[y][x]);
                    }
                }
            }
            frames.set(index, pixels);
            console.log("frame" + index + " completed... " + frames.size);
        });
    });
}
