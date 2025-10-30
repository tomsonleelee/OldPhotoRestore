import React, { useState, useCallback, ChangeEvent } from 'react';
import Header from './components/Header';
import Loader from './components/Loader';
import ImageContainer from './components/ImageContainer';
import { editImageWithPrompt } from './services/geminiService';
import type { ImageState } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageState | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const [header, base64] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (base64 && mimeType) {
          setOriginalImage({ base64, mimeType });
          setGeneratedImages(null);
          setSelectedImage(null);
          setError(null);
        } else {
            setError("無法解析上傳的圖片檔案。");
        }
      };
      reader.onerror = () => {
        setError("讀取圖片檔案失敗。");
      }
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage) {
      setError("請先上傳照片");
      return;
    }
    setIsLoading(true);
    setGeneratedImages(null);
    setSelectedImage(null);
    setError(null);
    try {
      const restorationPrompt = "想像這張照片是今天用一台現代、高品質的數位相機拍攝的。請生成一張看起來就是那樣的圖片。色彩應該要鮮豔，細節應該要清晰，任何老化的跡象，如褪色或刮痕，都應該消失。";
      const newImageBase64Array = await editImageWithPrompt(
        originalImage.base64,
        originalImage.mimeType,
        restorationPrompt
      );
      
      const imageUrls = newImageBase64Array.map(base64 => `data:image/png;base64,${base64}`);
      setGeneratedImages(imageUrls);
      setSelectedImage(imageUrls[0]);

    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("發生未知錯誤。");
        }
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  const isGenerateDisabled = !originalImage || isLoading;

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Inputs */}
          <div className="flex flex-col gap-6">
            <ImageContainer title="原始圖片" imageUrl={originalImage ? `data:${originalImage.mimeType};base64,${originalImage.base64}` : null} placeholderText="在此上傳您的圖片">
                {!originalImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                         <label htmlFor="file-upload" className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                            上傳圖片
                        </label>
                        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                )}
            </ImageContainer>

            {originalImage && (
                 <div className="w-full">
                     <label htmlFor="file-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm w-full text-center block">
                        更換圖片
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
            )}
            
            <button
              onClick={handleGenerateClick}
              disabled={isGenerateDisabled}
              className="w-full py-4 px-6 font-bold text-lg rounded-lg transition-all transform hover:scale-105 disabled:transform-none bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 shadow-lg hover:shadow-purple-500/50 disabled:shadow-none"
            >
              {isLoading ? '處理中...' : '舊照片翻新 ✨'}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col">
            <ImageContainer title="生成圖片" imageUrl={selectedImage} placeholderText="您增強後的圖片將顯示在此處">
              {isLoading && <Loader />}
              {error && !isLoading && (
                <div className="text-center text-red-400 p-4">
                  <p className="font-semibold">生成失敗</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </ImageContainer>

            {generatedImages && !isLoading && (
                <div className="mt-4">
                    <p className="text-center text-gray-400 mb-2 text-sm">選擇您最喜歡的一張</p>
                    <div className="grid grid-cols-4 gap-2 bg-gray-800/50 p-2 rounded-lg">
                        {generatedImages.map((imgUrl, index) => (
                             <img
                                key={index}
                                src={imgUrl}
                                alt={`變化版本 ${index + 1}`}
                                onClick={() => setSelectedImage(imgUrl)}
                                className={`cursor-pointer rounded-md aspect-square object-cover transition-all ${selectedImage === imgUrl ? 'ring-2 ring-purple-500 scale-105' : 'ring-0 ring-transparent hover:opacity-80'}`}
                             />
                        ))}
                    </div>
                </div>
            )}

            {selectedImage && !isLoading && (
                 <a
                    href={selectedImage}
                    download="restored-image.png"
                    className="mt-6 w-full text-center py-3 px-6 font-bold text-lg rounded-lg transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-600/50"
                  >
                    下載圖片
                  </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;