'use client';

import type { BlindProduct, CurtainProduct } from '@/types/estimate';
import { BLIND_CATEGORY_LABELS, CURTAIN_CATEGORY_LABELS } from '@/types/estimate';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface ProductListProps {
  products: (BlindProduct | CurtainProduct)[];
  type: 'blind' | 'curtain';
  onSelect: (product: BlindProduct | CurtainProduct) => void;
}

export default function ProductList({ products, type, onSelect }: ProductListProps) {
  const getCategoryLabel = (product: BlindProduct | CurtainProduct) => {
    return type === 'blind'
      ? BLIND_CATEGORY_LABELS[(product as BlindProduct).category]
      : CURTAIN_CATEGORY_LABELS[(product as CurtainProduct).category];
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        등록된 제품이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-700">이미지</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">카테고리</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">제품명</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">설명</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">가격</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">색상</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700">선택</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <td className="py-3 px-4">
                <div className="relative w-16 h-16 rounded overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    type === 'blind'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {getCategoryLabel(product)}
                </span>
              </td>
              <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
              <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                {product.description || '-'}
              </td>
              <td className="py-3 px-4">
                <span className="font-semibold text-blue-600">
                  {product.priceType === 'fixed'
                    ? formatPrice(product.price)
                    : `${formatPrice(product.price)}/㎡`}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {product.colors?.slice(0, 2).join(', ') || '-'}
                {product.colors && product.colors.length > 2 && '...'}
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onSelect(product)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  선택
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
