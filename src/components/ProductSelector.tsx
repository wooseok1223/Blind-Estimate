'use client';

import { useState, useEffect } from 'react';
import type { BlindProduct, CurtainProduct } from '@/types/estimate';
import { BLIND_CATEGORY_LABELS, CURTAIN_CATEGORY_LABELS } from '@/types/estimate';
import { fetchBlindProducts, fetchCurtainProducts } from '@/lib/googleSheets';
import ProductCard from './ProductCard';

type ProductType = 'all' | 'blind' | 'curtain';

interface ProductSelectorProps {
  onSelect: (product: BlindProduct | CurtainProduct, type: 'blind' | 'curtain') => void;
}

export default function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [blindProducts, setBlindProducts] = useState<BlindProduct[]>([]);
  const [curtainProducts, setCurtainProducts] = useState<CurtainProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productType, setProductType] = useState<ProductType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const [blinds, curtains] = await Promise.all([
        fetchBlindProducts(),
        fetchCurtainProducts(),
      ]);
      setBlindProducts(blinds.filter((p) => p.isActive));
      setCurtainProducts(curtains.filter((p) => p.isActive));
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredBlinds = blindProducts.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  );
  const filteredCurtains = curtainProducts.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  );

  useEffect(() => {
    setCategoryFilter('all');
  }, [productType]);

  const handleSelect = (product: BlindProduct | CurtainProduct) => {
    const type = blindProducts.some((p) => p.id === product.id) ? 'blind' : 'curtain';
    onSelect(product, type);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100">
        <div className="spinner mb-4"></div>
        <span className="text-gray-500 text-sm">제품을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div>
      {/* 필터 영역 */}
      <div className="bg-white border border-gray-100 p-3 md:p-4 mb-3 md:mb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* 타입 필터 */}
          <div className="flex border border-gray-200">
            {[
              { key: 'all', label: '전체' },
              { key: 'blind', label: '블라인드' },
              { key: 'curtain', label: '커튼' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setProductType(tab.key as ProductType)}
                className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors ${
                  productType === tab.key
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 세부 카테고리 필터 */}
          {productType !== 'all' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select-field w-auto text-xs md:text-sm py-1.5 md:py-2"
            >
              <option value="all">전체 종류</option>
              {productType === 'blind'
                ? Object.entries(BLIND_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))
                : Object.entries(CURTAIN_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
            </select>
          )}

          {/* 제품 수 */}
          <span className="text-xs md:text-sm text-gray-400 ml-auto">
            총 {productType === 'all'
              ? blindProducts.length + curtainProducts.length
              : productType === 'blind'
              ? filteredBlinds.length
              : filteredCurtains.length
            }개 제품
          </span>
        </div>
      </div>

      {/* 블라인드 섹션 */}
      {(productType === 'all' || productType === 'blind') && filteredBlinds.length > 0 && (
        <section className="mb-4 md:mb-6">
          {productType === 'all' && (
            <div className="flex items-center gap-2 mb-2 md:mb-3 px-1">
              <h3 className="font-bold text-gray-800 text-sm md:text-base">블라인드</h3>
              <span className="text-xs md:text-sm text-gray-400">{filteredBlinds.length}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
            {filteredBlinds.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                type="blind"
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* 커튼 섹션 */}
      {(productType === 'all' || productType === 'curtain') && filteredCurtains.length > 0 && (
        <section className="mb-4 md:mb-6">
          {productType === 'all' && (
            <div className="flex items-center gap-2 mb-2 md:mb-3 px-1">
              <h3 className="font-bold text-gray-800 text-sm md:text-base">커튼</h3>
              <span className="text-xs md:text-sm text-gray-400">{filteredCurtains.length}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
            {filteredCurtains.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                type="curtain"
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* 제품 없음 */}
      {filteredBlinds.length === 0 && filteredCurtains.length === 0 && (
        <div className="bg-white border border-gray-100 text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500">해당 조건의 제품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
