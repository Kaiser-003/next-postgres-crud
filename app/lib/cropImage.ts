export default function getCroppedImg(
  imageSrc: string,
  pixelCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }

      // Fixed output size
      canvas.width = 400;
      canvas.height = 400;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        400,
        400
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not create cropped image"));
            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    };

    image.onerror = () => {
      reject(new Error("Could not load image"));
    };

    image.src = imageSrc;
  });
}
