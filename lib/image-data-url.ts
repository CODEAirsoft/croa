export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

export async function compressImageFileAsDataUrl(
  file: File,
  { maxSize = 640, quality = 0.86 } = {},
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo selecionado não é uma imagem.");
  }

  const originalDataUrl = await readFileAsDataUrl(file);

  return new Promise<string>((resolve) => {
    const image = new window.Image();

    image.onload = () => {
      const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
      const scale = largestSide > maxSize ? maxSize / largestSide : 1;
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(originalDataUrl);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);

      const webpDataUrl = canvas.toDataURL("image/webp", quality);
      if (webpDataUrl.startsWith("data:image/webp")) {
        resolve(webpDataUrl);
        return;
      }

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    image.onerror = () => resolve(originalDataUrl);
    image.src = originalDataUrl;
  });
}
