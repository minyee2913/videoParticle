import ffmpeg from "ffmpeg";
import jimp from "jimp";
import { mkdirSync, rmSync } from "fs";
import { Color } from "./color";

const particleRGB:Color[] = [];
const frames = new Map<number, any>();

new ffmpeg("./video/target.mp4", (err, video)=>{
    if (err) return;

    rmSync("./images", { recursive: true });
    mkdirSync("./images");

    let sec = 0;
    if (video.metadata.duration) sec = video.metadata.duration.seconds;

    //#1. 동영상에서 이미지를 추출하기 (비동기 방식)
    video.fnExtractFrameToJPG("./images", {
        start_time : 0,
        every_n_frames: 10,
        file_name : '%s'
    }, (error, files)=>{
        if (error) throw error;

        files.sort((a, b)=> Number(a.replace("./images/1920x1080_", "").replace(".jpg", "")) - Number(b.replace("./images/1920x1080_", "").replace(".jpg", ""))).forEach((v, i)=>{
            Framing(v);
        });
    });
});

function Framing(v: string): void {
    const pixels:Color[][] = [];
    jimp.read(v, (err, image)=>{
        if (err) return;
        image.resize(100, 56);

        let index = Number(v.replace("./images/1920x1080_", "").replace(".jpg", "")) - 1;

        for (let y = 0; y < 56; y++) {
            pixels[y] = [];
            for (let x = 0; x < 100; x++) {
                let pix = jimp.intToRGBA(image.getPixelColor(x, y));
                pixels[y][x] = new Color(pix.r, pix.g, pix.b, pix.a);

                if (particleRGB.find((v)=>v.id === pixels[y][x].id) === undefined) {
                    particleRGB.push(pixels[y][x]);
                }
            }
        }

        frames.set(index, pixels);
        console.log("frame"+index + " completed... "+frames.size);
    });
}
