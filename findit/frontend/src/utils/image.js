/**
 * Reads an image file, optionally crops it square, shrinks it and returns a
 * compressed JPEG data URL. Keeping images small makes uploads fast and keeps
 * the MySQL rows light.
 */
export function fileToDataUrl(file, { maxSize = 700, quality = 0.72, square = false } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image'));
      img.onload = () => {
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (square) {
          const s = Math.min(img.width, img.height);
          sx = (img.width - s) / 2;
          sy = (img.height - s) / 2;
          sw = sh = s;
        }
        const scale = Math.min(1, maxSize / Math.max(sw, sh));
        const w = Math.round(sw * scale);
        const h = Math.round(sh * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
