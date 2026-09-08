import React from "react";

interface BannerGlassProps {
 text: string;
}

const BannerGlass: React.FC<BannerGlassProps> = ({ text }) => {
 return (
 <div className="mx-auto max-w-7xl px-5 py-2 mt-4 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white text-center shadow-md">{text}</div>
 );
};

export default BannerGlass;
