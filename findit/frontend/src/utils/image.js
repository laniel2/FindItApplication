/**
 * Reads an image file, optionally crops it square, shrinks it and returns a
 * compressed JPEG data URL. Keeping images small makes uploads fast and keeps
 * browser storage usage low on mobile.
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
        if (!ctx) {
          reject(new Error('This browser could not process the image'));
          return;
        }
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

        // Mobile browsers have limited localStorage space, so compress more aggressively
        // before saving a data URL. Reject if the image still remains too large.
        const maxEncodedLength = 180000;
        let nextQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', nextQuality);

        while (dataUrl.length > maxEncodedLength && nextQuality > 0.35) {
          nextQuality -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', nextQuality);
        }

        if (dataUrl.length > maxEncodedLength) {
          reject(new Error('That photo is too large for this phone. Please choose a smaller picture.'));
          return;
        }

        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
