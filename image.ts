
export async function compressImage(base64: string, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas context failed"));

      ctx.drawImage(img, 0, 0, width, height);
      // Export als JPEG spart enorm Platz gegenüber PNG
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (e) => reject(e);
  });
}

/**
 * Konvertiert einen Base64 String in einen Blob für den Upload zu Supabase Storage
 */
export async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return await response.blob();
}
