import ffmpeg from "ffmpeg";
import jimp from "jimp";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFile, writeFileSync } from "fs";
import { Color } from "./color";

const date = new Date();

const config = JSON.parse(readFileSync("./data/config.json", "utf8"));
const dir = `./result/${date.getTime()}_${config.name}`;

mkdirSync(dir);
mkdirSync(dir+"/particles");
mkdirSync(dir+"/particles/" + config.name);
mkdirSync(dir+"/functions");
mkdirSync(dir+"/functions/" + config.name);

const json = {
	"format_version": "1.10.0",
	"particle_effect": {
		"description": {
			"identifier": "2913video:default",
			"basic_render_parameters": {
				"material": "particles_alpha",
				"texture": "textures/particle/particles"
			}
		},
		"components": {
			"minecraft:emitter_rate_instant": {
				"num_particles": 1
			},
			"minecraft:emitter_lifetime_once": {
				"active_time": 1
			},
			"minecraft:emitter_shape_point": {
				"direction": ["0.8 * Math.random(-0.8, 0.8)", "1.5 * Math.random(-0.8, 0.8)", "1.5 * Math.random(-0.8, 0.8)"]
			},
			"minecraft:particle_lifetime_expression": {
				"max_lifetime": "1 / Math.random(1, 5) + 0.1"
			},
			"minecraft:particle_initial_speed": 1,
			"minecraft:particle_appearance_billboard": {
				"size": [0.1, 0.1],
				"facing_camera_mode": "lookat_xyz",
				"uv": {
					"texture_width": 128,
					"texture_height": 128,
					"flipbook": {
						"base_UV": [56, 88],
						"size_UV": [8, 8],
						"step_UV": [-8, 0],
						"frames_per_second": 8,
						"max_frame": 8,
						"stretch_to_lifetime": true
					}
				}
			},
			"minecraft:particle_appearance_lighting": {},
			"minecraft:particle_appearance_tinting": {
				"color": [1, 1, 1, 1]
			}
		}
	}
}

new ffmpeg("./data/target.mp4", (err, video)=>{
    if (err) return;

    rmSync("./images", { recursive: true });
    mkdirSync("./images");

    let sec = 0;
    if (video.metadata.duration) sec = video.metadata.duration.seconds;

    video.fnExtractFrameToJPG("./images", {
        start_time : 0,
        every_n_frames: 10,
        file_name : '%s'
    }, async (error, files)=>{
        if (error) throw error;

        const images:any[] = [];
        const sorted = files.sort((a, b)=> Number(a.replace("./images/1920x1080_", "").replace(".jpg", "")) - Number(b.replace("./images/1920x1080_", "").replace(".jpg", "")));

        for (let v of sorted) {
            const image = await jimp.read(v);

            image.resize(65, jimp.AUTO);

            images.push(
                {
                    i: Number(v.replace("./images/1920x1080_", "").replace(".jpg", "")) - 1,
                    image: image,
                }
            );
        }

        console.log(images);

        const cmds: string[] = [
            "scoreboard objectives add 2913video dummy",
            "scoreboard players add @s 2913video 1",
        ];
        for (let image of images) {
            Framing(image.image, image.i);
        }

        for (let image of images) {
            cmds.push(
                `execute as @s[scores={2913video=${image.i * 10}}] at @s run function ${config.name}/frame${image.i}`,
                `execute as @s[scores={2913video=${image.i * 10 + 5}}] at @s run function ${config.name}/frame${image.i}`,
            );
        }

        writeFileSync(dir + `/functions/${config.name}/play.mcfunction`, cmds.join("\n"), "utf8");
    });
});

function Framing(image:any, index:number) {
    const js = json;
    const pixels:Color[][] = [];
    const commands:string[] = [];
    const particles: {id: string, data: string}[] = [];
    const name = config.name;

    for (let y = 0; y < image.bitmap.height; y++) {
        pixels[y] = [];
        for (let x = 0; x < image.bitmap.width; x++) {
            let pix = jimp.intToRGBA(image.getPixelColor(x, y));
            const color = new Color(pix.r, pix.g, pix.b, pix.a);
            pixels[y][x] = color;
        }
    }

    let y = 0;
    for (let v of pixels) {
        const pt = js;

        let x = 0;
        for (let a of v) {
            commands.push(`particle 2913video:${a.id} ^${(x*-0.1).toFixed(1)} ^${(y*-0.1).toFixed(1)} ^`);
            pt.particle_effect.description.identifier = `2913video:${a.id}`;
            pt.particle_effect.components["minecraft:particle_appearance_tinting"].color = [a.r/255, a.g/255, a.b/255];

            particles.push(
                {
                    id: a.id,
                    data: JSON.stringify(pt, null, 4),
                }
            );
            x++;
        }

        y++;
    }

    writeFileSync(dir + `/functions/${name}/frame${index}.mcfunction`, commands.join("\n"), "utf8");
    for (let p of particles) {
        if (!existsSync(dir + `/particles/${name}/${p.id}.particle.json`)) writeFileSync(dir + `/particles/${name}/${p.id}.particle.json`, p.data, "utf8");
    }
    console.log("frame"+index + " completed... ");
}
