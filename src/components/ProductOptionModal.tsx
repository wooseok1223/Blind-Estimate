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
  const [pleatRatio, setPleatRatio] = useState<1.5 | 2.0>(2.0); // 기본 나비주름 2배

  const [calculatedPrice, setCalculatedPrice] = useState({
    basePrice: 0,
    optionPrice: 0,
    unitPrice: 0,
    totalPrice: 0,
    area: 0,
    appliedArea: 0,
    pleatWidth: 0,
  });

  useEffect(() => {
    const widthNum = parseFloat(width) || 0;
    const heightNum = parseFloat(height) || 0;

    if (widthNum > 0 && heightNum > 0) {
      if (type === 'blind') {
        const priceInfo = calculateBlindPrice(product as BlindProduct, widthNum, heightNum, {
          motorized,
        });
        setCalculatedPrice({
          ...priceInfo,
          totalPrice: priceInfo.unitPrice * quantity,
          pleatWidth: 0,
        });
      } else {
        const priceInfo = calculateCurtainPrice(product as CurtainProduct, widthNum, heightNum, {
          lining,
          railType,
          pleatRatio,
        });
        setCalculatedPrice({
          ...priceInfo,
          totalPrice: priceInfo.unitPrice * quantity,
          appliedArea: priceInfo.area,
        });
      }
    } else {
      setCalculatedPrice({ basePrice: 0, optionPrice: 0, unitPrice: 0, totalPrice: 0, area: 0, appliedArea: 0, pleatWidth: 0 });
    }
  }, [width, height, quantity, motorized, lining, railType, pleatRatio, product, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

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

  // 최소/최대 사이즈 (cm 기준)
  const minWidthCm = product.minWidth;
  const maxWidthCm = product.maxWidth;
  const minHeightCm = product.minHeight;
  const maxHeightCm = product.maxHeight;

  return (
    <div className="modal-overlay flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="modal-content bg-white w-full md:max-w-2xl md:mx-4 md:rounded-lg max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-fade-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-[#f9f9f9] flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <span className={`badge ${type === 'blind' ? 'badge-blind' : 'badge-curtain'} flex-shrink-0`}>
              {categoryLabel}
            </span>
            <h2 className="font-bold text-gray-900 text-sm md:text-base truncate">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {/* 모바일: 세로 레이아웃 / 데스크톱: 가로 레이아웃 */}
          <div className="flex flex-col md:flex-row">
            {/* 이미지 + 가격 정보 */}
            <div className="md:w-1/3 bg-[#f5f5f5] flex-shrink-0">
              <div className="aspect-video md:aspect-square">
                {product.imageUrl ? (
                  <img
                    src={convertToViewableUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-12 md:w-16 h-12 md:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* 기본 가격 정보 */}
              <div className="p-3 md:p-4 border-t border-gray-100">
                <div className="text-xs md:text-sm text-gray-500 mb-1">기본 가격</div>
                <div className="font-bold text-base md:text-lg text-[#8B7355]">
                  {formatPrice(product.price)}/{product.priceType === 'area' ? '㎡' : '개'}
                </div>
              </div>
            </div>

            {/* 폼 */}
            <div className="md:w-2/3 p-3 md:p-4">
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                {/* 설치 위치 */}
                <div className="form-group">
                  <label className="form-label text-xs md:text-sm">
                    설치 위치 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="input-field text-sm md:text-base py-2.5 md:py-2"
                    placeholder="예: 거실, 안방, 침실1"
                  />
                </div>

                {/* 사이즈 입력 (cm 단위) */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs md:text-sm">
                      가로 (cm) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="size-input text-sm md:text-base py-2.5 md:py-3"
                      placeholder="180"
                      inputMode="decimal"
                    />
                    {minWidthCm && maxWidthCm && (
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1 text-center">
                        {minWidthCm}~{maxWidthCm}cm
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs md:text-sm">
                      세로 (cm) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="size-input text-sm md:text-base py-2.5 md:py-3"
                      placeholder="210"
                      inputMode="decimal"
                    />
                    {minHeightCm && maxHeightCm && (
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1 text-center">
                        {minHeightCm}~{maxHeightCm}cm
                      </p>
                    )}
                  </div>
                </div>

                {/* 수량 */}
                <div className="form-group">
                  <label className="form-label text-xs md:text-sm">수량</label>
                  <div className="quantity-control inline-flex">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="quantity-btn w-10 h-10 md:w-9 md:h-9 text-lg"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      className="quantity-value h-10 md:h-9 w-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="quantity-btn w-10 h-10 md:w-9 md:h-9 text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 색상 선택 */}
                {product.colors && product.colors.length > 0 && (
                  <div className="form-group">
                    <label className="form-label text-xs md:text-sm">색상</label>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`color-option text-xs md:text-sm px-2.5 md:px-3.5 py-1.5 md:py-2 ${color === c ? 'selected' : ''}`}
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
                    <label className="form-label text-xs md:text-sm">추가 옵션</label>
                    <label
                      className={`custom-checkbox p-3 ${motorized ? 'selected' : ''}`}
                      onClick={() => setMotorized(!motorized)}
                    >
                      <input
                        type="checkbox"
                        checked={motorized}
                        onChange={(e) => setMotorized(e.target.checked)}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 ${motorized ? 'bg-[#8B7355] border-[#8B7355] text-white' : 'border-gray-300'}`}>
                        {motorized && '✓'}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="font-medium text-sm">전동 옵션</span>
                        <span className="text-xs md:text-sm text-gray-500 ml-2">
                          (+{formatPrice(blindProduct.motorPrice || 0)})
                        </span>
                      </span>
                    </label>
                  </div>
                )}

                {/* 커튼 옵션 */}
                {type === 'curtain' && (
                  <>
                    {/* 주름 배율 선택 */}
                    <div className="form-group">
                      <label className="form-label text-xs md:text-sm">주름 스타일</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPleatRatio(1.5)}
                          className={`flex-1 py-2.5 border text-sm font-medium transition-colors ${
                            pleatRatio === 1.5
                              ? 'border-[#8B7355] bg-[#faf8f5] text-[#8B7355]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div>민주름 1.5배</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">기본</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPleatRatio(2.0)}
                          className={`flex-1 py-2.5 border text-sm font-medium transition-colors ${
                            pleatRatio === 2.0
                              ? 'border-[#8B7355] bg-[#faf8f5] text-[#8B7355]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div>나비주름 2배</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">풍성함 +30%</div>
                        </button>
                      </div>
                    </div>

                    {curtainProduct.liningOption && (
                      <div className="form-group">
                        <label className="form-label text-xs md:text-sm">추가 옵션</label>
                        <label
                          className={`custom-checkbox p-3 ${lining ? 'selected' : ''}`}
                          onClick={() => setLining(!lining)}
                        >
                          <input
                            type="checkbox"
                            checked={lining}
                            onChange={(e) => setLining(e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 ${lining ? 'bg-[#8B7355] border-[#8B7355] text-white' : 'border-gray-300'}`}>
                            {lining && '✓'}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="font-medium text-sm">안감 추가</span>
                            <span className="text-xs md:text-sm text-gray-500 ml-2">
                              (+{formatPrice(curtainProduct.liningPrice || 0)})
                            </span>
                          </span>
                        </label>
                      </div>
                    )}

                    {curtainProduct.railTypes && curtainProduct.railTypes.length > 1 && (
                      <div className="form-group">
                        <label className="form-label text-xs md:text-sm">레일 타입</label>
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
                  <label className="form-label text-xs md:text-sm">메모 (선택)</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="input-field text-sm py-2.5 md:py-2"
                    placeholder="기타 요청사항..."
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 하단 가격 및 버튼 - 고정 */}
        <div className="border-t border-gray-200 p-3 md:p-4 bg-[#f9f9f9] flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center justify-between md:block">
              <div>
                {calculatedPrice.unitPrice > 0 && (
                  <div className="text-xs md:text-sm text-gray-500">
                    {type === 'blind' ? (
                      <>
                        {calculatedPrice.area.toFixed(2)}㎡
                        {calculatedPrice.appliedArea > calculatedPrice.area && (
                          <span className="text-orange-500"> → 최소 {calculatedPrice.appliedArea.toFixed(1)}㎡ 적용</span>
                        )}
                      </>
                    ) : (
                      <>
                        {parseFloat(width) || 0}cm × {pleatRatio}배 = {calculatedPrice.pleatWidth}cm폭, {calculatedPrice.area.toFixed(2)}㎡
                      </>
                    )}
                    {quantity > 1 && ` × ${quantity}개`}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-xs md:text-sm text-gray-500">예상 금액</span>
                  <span className="price-display text-xl md:text-2xl">
                    {calculatedPrice.totalPrice > 0 ? formatPrice(calculatedPrice.totalPrice) : '0원'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 md:flex-none px-4 md:px-6 py-3 md:py-2.5 text-sm"
              >
                취소
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={calculatedPrice.unitPrice === 0}
                className="btn-primary flex-1 md:flex-none px-4 md:px-6 py-3 md:py-2.5 text-sm disabled:opacity-50"
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