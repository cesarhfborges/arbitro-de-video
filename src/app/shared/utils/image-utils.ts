/**
 * Realiza upscaling de uma imagem a partir de um arquivo, sem adicionar canvas à tela.
 *
 * @param fileContent A URL de dados ou caminho do arquivo da imagem a ser ampliada.
 * @param scaleFactor O fator de escala para o upscaling (e.g., 2 para dobrar o tamanho).
 * @param upscaleMethod O método de upscaling a ser usado: 'nearest-neighbor', 'bilinear' ou 'bicubic'.
 * @returns Uma Promise que resolve para um objeto HTMLImageElement
 * contendo a imagem ampliada.
 * @throws {Error} Se não for possível carregar a imagem ou ocorrer um erro durante o processamento.
 */
function upscaleImage(fileContent, scaleFactor, upscaleMethod = 'nearest-neighbor'): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const upscaledWidth = originalWidth * scaleFactor;
        const upscaledHeight = originalHeight * scaleFactor;

        // Cria um canvas fora da tela para a imagem ampliada
        const canvas = document.createElement('canvas');
        canvas.width = upscaledWidth;
        canvas.height = upscaledHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do canvas.'));
          return;
        }

        // Desenha a imagem original no canvas ampliado, aplicando o método de upscaling
        switch (upscaleMethod) {
          case 'nearest-neighbor':
            ctx.imageSmoothingEnabled = false; // Desativa a suavização
            ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, upscaledWidth, upscaledHeight);
            break;
          case 'bilinear':
          case 'bicubic':
            // Implementação da interpolação bilinear/bicúbica
            const srcData = getPixelColor(ctx, img, originalWidth, originalHeight);

            for (let y = 0; y < upscaledHeight; y++) {
              for (let x = 0; x < upscaledWidth; x++) {
                const srcX = x / scaleFactor;
                const srcY = y / scaleFactor;
                let color;
                if (upscaleMethod === 'bilinear') {
                  color = getBilinearPixel(srcX, srcY, originalWidth, originalHeight, srcData);
                } else {
                  color = getBicubicPixel(srcX, srcY, originalWidth, originalHeight, srcData);
                }

                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
                ctx.fillRect(x, y, 1, 1);
              }
            }
            break;
          default:
            reject(new Error(`Método de upscaling "${upscaleMethod}" não suportado.`));
            return;
        }

        // Cria um novo objeto Image a partir dos dados do canvas ampliado
        const resultImg = new Image();
        resultImg.onload = () => {
          resolve(resultImg);
        };
        resultImg.onerror = (error) => {
          reject(new Error('Erro ao carregar a imagem ampliada a partir do canvas.'));
        };
        resultImg.src = canvas.toDataURL(); // Obtém a URL de dados do canvas

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem a partir da URL.'));
    };

    img.src = fileContent; // Define a URL da imagem
  });
}

/**
 * Reads the color value of a pixel
 *
 * @param ctx
 * @param img
 * @param width
 * @param height
 * @returns
 */
function getPixelColor(ctx, img, width, height) {
  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  return data;
}

/**
 * Gets the color of the specified pixel using bilinear interpolation
 *
 * @param x
 * @param y
 * @param width
 * @param height
 * @param data
 * @returns
 */
function getBilinearPixel(x, y, width, height, data) {
  const x1 = Math.floor(x);
  const x2 = Math.ceil(x);
  const y1 = Math.floor(y);
  const y2 = Math.ceil(y);

  if (x1 < 0 || x2 >= width || y1 < 0 || y2 >= height) {
    return {r: 0, g: 0, b: 0, a: 0}; // Return transparent black for out-of-bounds
  }

  const a = (x - x1) / (x2 - x1);
  const b = (y - y1) / (y2 - y1);

  const index11 = (x1 + y1 * width) * 4;
  const index12 = (x1 + y2 * width) * 4;
  const index21 = (x2 + y1 * width) * 4;
  const index22 = (x2 + y2 * width) * 4;

  const color11 = {
    r: data[index11],
    g: data[index11 + 1],
    b: data[index11 + 2],
    a: data[index11 + 3],
  };
  const color12 = {
    r: data[index12],
    g: data[index12 + 1],
    b: data[index12 + 2],
    a: data[index12 + 3],
  };
  const color21 = {
    r: data[index21],
    g: data[index21 + 1],
    b: data[index21 + 2],
    a: data[index21 + 3],
  };
  const color22 = {
    r: data[index22],
    g: data[index22 + 1],
    b: data[index22 + 2],
    a: data[index22 + 3],
  };

  const color1 = {
    r: color11.r * (1 - a) + color21.r * a,
    g: color11.g * (1 - a) + color21.g * a,
    b: color11.b * (1 - a) + color21.b * a,
    a: color11.a * (1 - a) + color21.a * a,
  };

  const color2 = {
    r: color12.r * (1 - a) + color22.r * a,
    g: color12.g * (1 - a) + color22.g * a,
    b: color12.b * (1 - a) + color22.b * a,
    a: color12.a * (1 - a) + color22.a * a,
  };

  return {
    r: color1.r * (1 - b) + color2.r * b,
    g: color1.g * (1 - b) + color2.g * b,
    b: color1.b * (1 - b) + color2.b * b,
    a: color1.a * (1 - b) + color2.a * b,
  };
}

/**
 * Gets the color of the specified pixel using bicubic interpolation
 *
 * @param x
 * @param y
 * @param width
 * @param height
 * @param data
 * @returns
 */
function getBicubicPixel(x, y, width, height, data) {
  const a = getCubicValues(x);
  const b = getCubicValues(y);

  const color = {r: 0, g: 0, b: 0, a: 0};
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const pixelX = Math.floor(x) + j - 1;
      const pixelY = Math.floor(y) + i - 1;

      if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
        const index = (pixelX + pixelY * width) * 4;
        const weight = a[j] * b[i];

        color.r += data[index] * weight;
        color.g += data[index + 1] * weight;
        color.b += data[index + 2] * weight;
        color.a += data[index + 3] * weight;
      }
    }
  }
  return color;
}

/**
 * Bicubic helper function to get cubic coefficients
 *
 * @param x
 * @returns
 */
function getCubicValues(x) {
  const fv = Math.floor(x);
  const a = x - fv;
  const a2 = a * a;
  const a3 = a * a2;

  const p = -0.5; // You can adjust this
  const q = 2.5;
  const r = -3;
  const s = 1;

  const c0 = (p * a3) - (p * a2) + (s * a);
  const c1 = (q * a3) - (q * a2) + (r * a) + 1;
  const c2 = (r * a3) - (r * a2) + (q * a);
  const c3 = (s * a3) - (p * a2);
  return [c0, c1, c2, c3];
}

export {upscaleImage};
