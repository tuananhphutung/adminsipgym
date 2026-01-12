
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, PlayCircle } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageUploaded: (url: string) => void;
  className?: string;
  label?: string;
  aspect?: 'aspect-video' | 'aspect-square' | 'h-48'; // Thêm prop để kiểm soát tỉ lệ
  accept?: string; // New prop to control file types
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageUploaded, 
  className = "", 
  label = "Ảnh",
  aspect = "aspect-video",
  accept = "image/*"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadToCloudinary(file);
    setIsUploading(false);

    if (url) {
      onImageUploaded(url);
    }
  };

  const isVideo = (url?: string | null) => {
      if (!url) return false;
      return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.includes('/video/upload');
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">{label}</label>}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full ${aspect} bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-all overflow-hidden`}
      >
        {currentImage ? (
          <>
            {isVideo(currentImage) ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video src={currentImage} className="w-full h-full object-cover opacity-60" muted playsInline />
                    <PlayCircle className="absolute w-12 h-12 text-white/80" />
                </div>
            ) : (
                <img src={currentImage} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
            )}
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="text-white w-8 h-8 drop-shadow-lg" />
            </div>
            {/* Nút nhỏ hiển thị trạng thái đã có ảnh */}
            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md p-1.5 rounded-full">
               <Camera className="w-3 h-3 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-400 p-4 text-center">
             <Upload className="w-8 h-8 mb-2 text-slate-300" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Chạm để tải lên</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mb-2" />
              <span className="text-white text-[10px] font-bold uppercase">Đang tải lên...</span>
            </div>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={accept} 
        className="hidden" 
      />
    </div>
  );
};

export default ImageUpload;
