'use client';

import { formatPrice } from '@/lib/utils';

interface EstimateSummaryProps {
  subtotal: number;
  installationFee: number;
  discount: number;
  totalAmount: number;
  notes: string;
  onInstallationFeeChange: (fee: number) => void;
  onDiscountChange: (discount: number) => void;
  onNotesChange: (notes: string) => void;
}

export default function EstimateSummary({
  subtotal,
  installationFee,
  discount,
  totalAmount,
  notes,
  onInstallationFeeChange,
  onDiscountChange,
  onNotesChange,
}: EstimateSummaryProps) {
  return (
    <div className="card">
      <div className="card-header text-sm md:text-base">견적 요약</div>
      <div className="card-body space-y-3 md:space-y-4">
        {/* 제품 소계 */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm md:text-base">제품 소계</span>
          <span className="font-medium text-sm md:text-base">{formatPrice(subtotal)}</span>
        </div>

        {/* 설치비 */}
        <div className="form-group">
          <label className="form-label">설치비</label>
          <div className="relative">
            <input
              type="number"
              value={installationFee || ''}
              onChange={(e) => onInstallationFeeChange(parseInt(e.target.value) || 0)}
              className="input-field text-right pr-8"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
          </div>
        </div>

        {/* 할인 */}
        <div className="form-group">
          <label className="form-label">할인</label>
          <div className="relative">
            <input
              type="number"
              value={discount || ''}
              onChange={(e) => onDiscountChange(parseInt(e.target.value) || 0)}
              className="input-field text-right pr-8"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
          </div>
        </div>

        {/* 총 금액 */}
        <div className="bg-[#faf8f5] border border-[#e8e0d5] p-3 md:p-4 -mx-4 md:-mx-5 -mb-4 md:-mb-5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800 text-sm md:text-base">총 예상 금액</span>
            <span className="price-display text-lg md:text-2xl">{formatPrice(totalAmount)}</span>
          </div>
          <p className="text-[11px] md:text-xs text-gray-500 mt-1.5 md:mt-2">* 실측 후 최종 금액이 변경될 수 있습니다.</p>
        </div>
      </div>

      {/* 비고 */}
      <div className="p-4 md:p-5 border-t border-gray-100">
        <div className="form-group mb-0">
          <label className="form-label text-xs md:text-sm">비고 / 요청사항</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder="특이사항, 요청사항 등을 입력해주세요..."
          />
        </div>
      </div>
    </div>
  );
}
