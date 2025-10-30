import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6 border-b border-gray-700">
      <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        AI 舊照片修復與編輯器
      </h1>
      <p className="mt-2 text-md md:text-lg text-gray-400 max-w-3xl mx-auto">
        為您的照片注入新生命。 透過一個簡單的按鈕，即可修復舊照片、應用令人驚豔的效果。
      </p>
    </header>
  );
};

export default Header;