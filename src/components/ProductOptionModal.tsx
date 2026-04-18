'use client';

import { useState, useEffect } from 'react';
import type { BlindProduct, CurtainProduct, EstimateItem } from '@/types/estimate';
import { BLIND_CATEGORY_LABELS, CURTAIN_CATEGORY_LABELS } from '@/types/estimate';
import { formatPrice } from '@/lib/utils';
import { calculateBlindPrice, calculateCurtainPrice, calculateArea } from '@/lib/priceCalculator';
import { generateId } from '@/lib/utils';

interface ProductOptionModalProps {
  product: BlindProduct | CurtainProduct;
  type: 'blind' | 'curtain';
  onClose: () => void;
  onAdd: (item: EstimateItem) => void;
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

export default function ProductOptionModal({
  product,
  type,
  onClose,
  onAdd,
}: ProductOptionModalProps) {
  const [room, setRoom] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [memo, setMemo] = useState('');

  const [motorized, setMotorized] = useState(false);
  const [lining, setLining] = useState(false);
  const [railType, setRailType] = useState<'single' | 'double'>('single');

  const [calculatedPrice, setCalculatedPrice] = useState({
    basePrice: 0,
    optionPrice: 0,
    unitPrice: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    const widthNum = parseInt(width) || 0;
    const heightNum = parseInt(height) || 0;

    if (widthNum > 0 && heightNum > 0) {
      let priceInfo;
      if (type === 'blind') {
        priceInfo = calculateBlindPrice(product as BlindProduct, widthNum, heightNum, {
          motorized,
        });
      } else {
        priceInfo = calculateCurtainPrice(product as CurtainProduct, widthNum, heightNum, {
          lining,
          railType,
        });
      }
      setCalculatedPrice({
        ...priceInfo,
        totalPrice: priceInfo.unitPrice * quantity,
      });
    } else {
      setCalculatedPrice({ basePrice: 0, optionPrice: 0, unitPrice: 0, totalPrice: 0 });
    }
  }, [width, height, quantity, motorized, lining, railType, product, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const widthNum = parseInt(width);
    const heightNum = parseInt(height);

    if (!room || !widthNum || !heightNum) {
      alert('설치 위치와 사이즈를 입력해주세요.');
      return;
    }

    const item: EstimateItem = {
      id: generateId(),
      productId: product.id,
      productType: type,
      productName: product.name,
      imageUrl: product.imageUrl,
      room,
      width: widthNum,
      height: heightNum,
      quantity,
      color: color || undefined,
      motorized: type === 'blind' ? motorized : undefined,
      lining: type === 'curtain' ? lining : undefined,
      railType: type === 'curtain' ? railType : undefined,
      basePrice: calculatedPrice.basePrice,
      optionPrice: calculatedPrice.optionPrice,
      unitPrice: calculatedPrice.unitPrice,
      totalPrice: calculatedPrice.totalPrice,
      memo: memo || undefined,
    };

    onAdd(item);
    onClose();
  };

  const categoryLabel =
    type === 'blind'
      ? BLIND_CATEGORY_LABELS[(product as BlindProduct).category]
      : CURTAIN_CATEGORY_LABELS[(product as CurtainProduct).category];

  const blindProduct = product as BlindProduct;
  const curtainProduct = product as CurtainProduct;

  return (
    <div className="modal-overlay flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="modal-content bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#f9f9f9]">
          <div className="flex items-center gap-3">
            <span className={`badge ${type === 'blind' ? 'badge-blind' : 'badge-curtain'}`}>
              {categoryLabel}
            </span>
            <h2 className="font-bold text-gray-900">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* 이미지 */}
          <div className="md:w-1/3 bg-[#f5f5f5]">
            <div className="aspect-square">
              {product.imageUrl ? (
                <img
                  src={convertToViewableUrl(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {/* 기본 가격 정보 */}
            <div className="p-4 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-1">기본 가격</div>
              <div className="font-bold text-lg text-[#8B7355]">
                {formatPrice(product.price)}/{product.priceType === 'area' ? '㎡' : '개'}
              </div>
            </div>
          </div>

          {/* 폼 */}
          <div className="md:w-2/3 p-4 overflow-y-auto max-h-[60vh]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 설치 위치 */}
              <div className="form-group">
                <label className="form-label">
                  설치 위치 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="input-field"
                  placeholder="예: 거실, 안방, 침실1"
                />
              </div>

              {/* 사이즈 입력 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">
                    가로 (mm) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="size-input"
                    placeholder="1800"
                  />
                  {product.minWidth && product.maxWidth && (
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      {product.minWidth} ~ {product.maxWidth}mm
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    세로 (mm) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="size-input"
                    placeholder="2100"
                  />
                  {product.minHeight && product.maxHeight && (
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      {product.minHeight} ~ {product.maxHeight}mm
                    </p>
                  )}
                </div>
              </div>

              {/* 수량 */}
              <div className="form-group">
                <label className="form-label">수량</label>
                <div className="quantity-control inline-flex">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="quantity-value h-9"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 색상 선택 */}
              {product.colors && product.colors.length > 0 && (
                <div className="form-group">
                  <label className="form-label">색상</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`color-option ${color === c ? 'selected' : ''}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 블라인드 옵션 */}
              {type === 'blind' && blindProduct.motorOption && (
                <div className="form-group">
                  <label className="form-label">추가 옵션</label>
                  <label
                    className={`custom-checkbox ${motorized ? 'selected' : ''}`}
                    onClick={() => setMotorized(!motorized)}
                  >
                    <input
                      type="checkbox"
                      checked={motorized}
                      onChange={(e) => setMotorized(e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`w-5 h-5 border flex items-center justify-center ${motorized ? 'bg-[#8B7355] border-[#8B7355] text-white' : 'border-gray-300'}`}>
                      {motorized && '✓'}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium">전동 옵션</span>
                      <span className="text-sm text-gray-500 ml-2">
                        (+{formatPrice(blindProduct.motorPrice || 0)})
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {/* 커튼 옵션 */}
              {type === 'curtain' && (
                <>
                  {curtainProduct.liningOption && (
                    <div className="form-group">
                      <label className="form-label">추가 옵션</label>
                      <label
                        className={`custom-checkbox ${lining ? 'selected' : ''}`}
                        onClick={() => setLining(!lining)}
                      >
                        <input
                          type="checkbox"
                          checked={lining}
                          onChange={(e) => setLining(e.target.checked)}
                          className="sr-only"
                        />
                        <span className={`w-5 h-5 border flex items-center justify-center ${lining ? 'bg-[#8B7355] border-[#8B7355] text-white' : 'border-gray-300'}`}>
                          {lining && '✓'}
                        </span>
                        <span className="flex-1">
                          <span className="font-medium">안감 추가</span>
                          <span className="text-sm text-gray-500 ml-2">
                            (+{formatPrice(curtainProduct.liningPrice || 0)})
                          </span>
                        </span>
                      </label>
                    </div>
                  )}

                  {curtainProduct.railTypes && curtainProduct.railTypes.length > 1 && (
                    <div className="form-group">
                      <label className="form-label">레일 타입</label>
                      <div className="flex gap-2">
                        {['single', 'double'].map((rt) => (
                          <button
                            key={rt}
                            type="button"
                            onClick={() => setRailType(rt as 'single' | 'double')}
                            className={`flex-1 py-2.5 border text-sm font-medium transition-colors ${
                              railType === rt
                                ? 'border-[#8B7355] bg-[#faf8f5] text-[#8B7355]'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {rt === 'single' ? '싱글 레일' : '더블 레일'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 메모 */}
              <div className="form-group">
                <label className="form-label">메모 (선택)</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="input-field"
                  placeholder="기타 요청사항..."
                />
              </div>
            </form>
          </div>
        </div>

        {/* 하단 가격 및 버튼 */}
        <div className="border-t border-gray-200 p-4 bg-[#f9f9f9]">
          <div className="flex items-center justify-between">
            <div>
              {calculatedPrice.unitPrice > 0 && (
                <div className="text-sm text-gray-500">
                  {calculateArea(parseInt(width) || 0, parseInt(height) || 0).toFixed(2)}㎡
                  {quantity > 1 && ` × ${quantity}개`}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">예상 금액</span>
                <span className="price-display">
                  {calculatedPrice.totalPrice > 0 ? formatPrice(calculatedPrice.totalPrice) : '0원'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-6 py-2.5"
              >
                취소
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={calculatedPrice.unitPrice === 0}
                className="btn-primary px-6 py-2.5 disabled:opacity-50"
              >
                견적에 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
