import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const data = fs.readFileSync("src/data/products.ts", "utf8");
const names = [...data.matchAll(/image: "([^"]+)"/g)].map((match) => match[1]);

for (const name of new Set(names)) {
  const input = path.join("public", "images", `${name}.webp`);
  const base = await sharp(input)
    .resize(1200, 1500, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 86 })
    .toBuffer();

  await sharp(base)
    .extract({ left: 0, top: 80, width: 1200, height: 820 })
    .resize(1200, 1500, { fit: "cover" })
    .webp({ quality: 84 })
    .toFile(path.join("public", "images", `${name}-detail-1.webp`));

  await sharp(base)
    .extract({ left: 0, top: 600, width: 1200, height: 820 })
    .resize(1200, 1500, { fit: "cover" })
    .webp({ quality: 84 })
    .toFile(path.join("public", "images", `${name}-detail-2.webp`));
}

console.log(`${new Set(names).size} ürün için detay görselleri hazır.`);
