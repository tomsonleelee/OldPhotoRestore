import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSingleImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    // If no image part was found, investigate the reason.
    const finishReason = candidate?.finishReason;
    if (finishReason === 'SAFETY') {
        throw new Error(`圖片生成失敗，因為內容可能不符合安全政策。請嘗試使用不同的圖片。`);
    }
    
    const textResponse = response.text;
    if (textResponse) {
      throw new Error(`模型返回了文字而非圖片: "${textResponse}"`);
    }

    if (finishReason) {
        throw new Error(`圖片生成失敗，原因: ${finishReason}`);
    }

    throw new Error("API 回應中找不到圖片資料。請稍後再試。");
};


export const editImageWithPrompt = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string[]> => {
  try {
    const images: string[] = [];
    // Generate 4 images sequentially to avoid potential rate-limiting issues.
    for (let i = 0; i < 4; i++) {
        const image = await generateSingleImage(base64ImageData, mimeType, prompt);
        images.push(image);
    }
    return images;

  } catch (error) {
    console.error("使用 Gemini 編輯圖片時發生錯誤:", error);
    if (error instanceof Error) {
        // The error from generateSingleImage is already user-friendly and in Chinese.
        throw error;
    }
    throw new Error("生成圖片時發生未知錯誤。");
  }
};