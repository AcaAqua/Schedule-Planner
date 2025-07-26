
import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useTranslation } from '../hooks/useTranslation';
import { XMarkIcon } from './icons';

interface ImageCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImageUrl: string) => void;
  aspect?: number;
  circularCrop?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ 
  imageSrc, 
  onClose, 
  onSave, 
  aspect = 1,
  circularCrop = false
}) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  function handleSaveCrop() {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    if (!image || !canvas || !completedCrop) {
        return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    
    onSave(canvas.toDataURL('image/jpeg'));
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('crop.image.title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex justify-center items-center">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minWidth={100}
              minHeight={100}
              circularCrop={circularCrop}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh' }}
              />
            </ReactCrop>
          )}
        </div>
        <div className="flex items-center justify-end p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={handleSaveCrop}
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {t('crop.image.save')}
          </button>
        </div>
      </div>
      <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropModal;
