'use client';

import type { EstimateItem } from '@/types/estimate';
import { formatPrice } from '@/lib/utils';

interface EstimateTableProps {
  items: EstimateItem[];
  onRemove: (id: string) => void;
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

export default function EstimateTable({ items, onRemove }: EstimateTableProps) {
  if (items.length === 0) {
    return (
      <div className="card">
        <div className="card-header">견적 항목</div>
        <div className="card-body text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">선택한 제품이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">제품 선택 화면에서 원하시는 제품을 선택해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <span>견적 항목</span>
        <span className="text-sm font-normal text-gray-500">{items.length}개</span>
      </div>

      {/* 테이블 헤더 - 데스크톱만 */}
      <div className="hidden md:block">
        <table className="estimate-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>제품 정보</th>
              <th style={{ width: '20%' }}>사이즈 / 옵션</th>
              <th style={{ width: '10%' }} className="text-center">수량</th>
              <th style={{ width: '20%' }} className="text-right">금액</th>
              <th style={{ width: '10%' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {/* 제품 정보 */}
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={convertToViewableUrl(item.imageUrl)}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className={`badge ${item.productType === 'blind' ? 'badge-blind' : 'badge-curtain'}`}>
                        {item.productType === 'blind' ? '블라인드' : '커튼'}
                      </span>
                      <p className="font-medium text-gray-800 mt-1">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.room}</p>
                    </div>
                  </div>
                </td>

                {/* 사이즈 / 옵션 */}
                <td>
                  <p className="text-sm">{item.width}cm × {item.height}cm</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.color && (
                      <span className="text-xs text-gray-500">{item.color}</span>
                    )}
                    {item.motorized && (
                      <span className="badge badge-option">전동</span>
                    )}
                    {item.lining && (
                      <span className="badge badge-option">안감</span>
                    )}
                    {item.railType === 'double' && (
                      <span className="badge badge-option">더블레일</span>
                    )}
                  </div>
                </td>

                {/* 수량 */}
                <td className="text-center">{item.quantity}개</td>

                {/* 금액 */}
                <td className="text-right">
                  <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)} × {item.quantity}</p>
                  <p className="font-bold text-[#8B7355]">{formatPrice(item.totalPrice)}</p>
                </td>

                {/* 삭제 */}
                <td className="text-center">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="삭제"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 뷰 */}
      <div className="md:hidden">
        {items.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex gap-3">
              {/* 이미지 */}
              <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                {item.imageUrl ? (
                  <img
                    src={convertToViewableUrl(item.imageUrl)}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`badge ${item.productType === 'blind' ? 'badge-blind' : 'badge-curtain'}`}>
                      {item.productType === 'blind' ? '블라인드' : '커튼'}
                    </span>
                    <p className="font-medium text-gray-800 mt-1">{item.productName}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-1">{item.room}</p>
                <p className="text-sm text-gray-600">{item.width}cm × {item.height}cm</p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {item.color && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5">{item.color}</span>
                  )}
                  {item.motorized && <span className="badge badge-option">전동</span>}
                  {item.lining && <span className="badge badge-option">안감</span>}
                  {item.railType === 'double' && <span className="badge badge-option">더블레일</span>}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">{item.quantity}개</span>
                  <span className="font-bold text-[#8B7355]">{formatPrice(item.totalPrice)}</span>
                </div>
              </div>
            </div>

            {item.memo && (
              <p className="text-xs text-gray-400 mt-2 pl-23">메모: {item.memo}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
