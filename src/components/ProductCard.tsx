'use client';

import { useState } from 'react';
import type { BlindProduct, CurtainProduct } from '@/types/estimate';
import { BLIND_CATEGORY_LABELS, CURTAIN_CATEGORY_LABELS } from '@/types/estimate';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: BlindProduct | CurtainProduct;
  type: 'blind' | 'curtain';
  onSelect: (product: BlindProduct | CurtainProduct) => void;
}

function convertToViewableUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http') && !url.includes('drive.google.com')) {
    return url;
  }
  let fileId = '';
  if (url.includes('/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) fileId = match[1];
  } else if (url.includes('open?id=')) {
    const match = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
    if (match) fileId = match[1];
  } else if (url.includes('uc?id=') || url.includes('uc?export=view&id=')) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) fileId = match[1];
  }
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return url;
}

export default function ProductCard({ product, type, onSelect }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const categoryLabel =
    type === 'blind'
      ? BLIND_CATEGORY_LABELS[(product as BlindProduct).category]
      : CURTAIN_CATEGORY_LABELS[(product as CurtainProduct).category];

  const priceLabel =
    product.priceType === 'fixed'
      ? formatPrice(product.price)
      : `${formatPrice(product.price)}/㎡`;

  const imageUrl = convertToViewableUrl(product.imageUrl || '');
  const hasValidImage = imageUrl && !imageError;

  return (
    <div
      onClick={() => onSelect(product)}
      className="product-card cursor-pointer"
    >
      {/* 이미지 */}
      <div className="relative aspect-square bg-[#f5f5f5]">
        {hasValidImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="spinner"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">이미지 없음</span>
          </div>
        )}

        {/* 카테고리 뱃지 */}
        <div className="absolute top-2 left-2">
          <span className={`badge ${type === 'blind' ? 'badge-blind' : 'badge-curtain'}`}>
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* 정보 */}
      <div className="p-2 md:p-3">
        <h3 className="font-medium text-gray-800 text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[10px] md:text-xs text-gray-500 mb-1.5 md:mb-2 line-clamp-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#8B7355] text-xs md:text-sm">
            {priceLabel}
          </span>

          {/* 옵션 표시 */}
          <div className="flex items-center gap-1">
            {type === 'blind' && (product as BlindProduct).motorOption && (
              <span className="badge badge-option text-[9px] md:text-[11px]">전동</span>
            )}
          </div>
        </div>

        {/* 색상 수 */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-1 md:mt-2 text-[10px] md:text-xs text-gray-400">
            {product.colors.length}가지 색상
          </div>
        )}
      </div>
    </div>
  );
}
