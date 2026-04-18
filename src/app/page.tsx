'use client';

import { useState } from 'react';
import type { BlindProduct, CurtainProduct, EstimateItem, CustomerInfo, Estimate } from '@/types/estimate';
import ProductSelector from '@/components/ProductSelector';
import ProductOptionModal from '@/components/ProductOptionModal';
import EstimateTable from '@/components/EstimateTable';
import CustomerForm from '@/components/CustomerForm';
import EstimateSummary from '@/components/EstimateSummary';
import { calculateEstimateTotal } from '@/lib/priceCalculator';
import { saveEstimate } from '@/lib/googleSheets';
import { generateId } from '@/lib/utils';

type Step = 'select' | 'review' | 'customer';

const STEPS = [
  { key: 'select', label: '제품 선택', num: 1 },
  { key: 'review', label: '견적 확인', num: 2 },
  { key: 'customer', label: '문의하기', num: 3 },
] as const;

export default function Home() {
  const [step, setStep] = useState<Step>('select');
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    email: '',
    visitDate: '',
  });
  const [installationFee, setInstallationFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<{
    product: BlindProduct | CurtainProduct;
    type: 'blind' | 'curtain';
  } | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProductSelect = (product: BlindProduct | CurtainProduct, type: 'blind' | 'curtain') => {
    setSelectedProduct({ product, type });
  };

  const handleAddItem = (item: EstimateItem) => {
    setItems((prev) => [...prev, item]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCustomerChange = (updates: Partial<CustomerInfo>) => {
    setCustomer((prev) => ({ ...prev, ...updates }));
  };

  const { subtotal, totalAmount } = calculateEstimateTotal(items, installationFee, discount);

  const handleSave = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      setMessage({ type: 'error', text: '고객 정보를 모두 입력해주세요.' });
      return;
    }

    if (items.length === 0) {
      setMessage({ type: 'error', text: '견적 항목을 추가해주세요.' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    const estimate: Estimate = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer,
      items,
      subtotal,
      installationFee,
      discount,
      totalAmount,
      notes,
      status: 'draft',
    };

    const result = await saveEstimate(estimate);

    setIsSending(false);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
  };

  const handleReset = () => {
    if (confirm('견적을 초기화하시겠습니까?')) {
      setItems([]);
      setCustomer({ name: '', phone: '', address: '', email: '', visitDate: '' });
      setInstallationFee(0);
      setDiscount(0);
      setNotes('');
      setStep('select');
      setMessage(null);
    }
  };

  const getStepStatus = (stepKey: string) => {
    const stepIndex = STEPS.findIndex(s => s.key === stepKey);
    const currentIndex = STEPS.findIndex(s => s.key === step);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 헤더 */}
      <header className="site-header">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#8B7355]">블라인드</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-600">맞춤 견적 시스템</span>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border border-gray-200 hover:border-gray-300"
            >
              초기화
            </button>
          </div>
        </div>
      </header>

      {/* 스텝 네비게이션 */}
      <nav className="step-nav">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key as Step)}
            className={`step-item ${getStepStatus(s.key)}`}
          >
            <span className="step-number">
              {getStepStatus(s.key) === 'completed' ? '✓' : s.num}
            </span>
            <span className="step-label">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 알림 메시지 */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message.type === 'success' ? '✓' : '!'}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Step 1: 제품 선택 */}
        {step === 'select' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="section-title">제품 선택</h2>
              <p className="text-gray-500 text-sm -mt-3 mb-4">
                원하시는 제품을 선택하시면 사이즈와 옵션을 입력할 수 있습니다.
              </p>
            </div>

            <ProductSelector onSelect={handleProductSelect} />

            {/* 하단 고정 바 */}
            {items.length > 0 && (
              <div className="floating-bar p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">선택 제품</span>
                      <span className="bg-[#8B7355] text-white px-2.5 py-0.5 text-sm font-medium">
                        {items.length}개
                      </span>
                    </div>
                    <div className="hidden sm:block border-l border-gray-200 pl-4">
                      <span className="text-sm text-gray-500">예상 금액</span>
                      <span className="ml-2 font-bold text-lg">{subtotal.toLocaleString()}원</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('review')}
                    className="btn-primary px-6 py-2.5"
                  >
                    견적 확인하기 →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 견적 확인 */}
        {step === 'review' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title mb-0">견적 확인</h2>
              </div>
              <button
                onClick={() => setStep('select')}
                className="btn-secondary px-4 py-2 text-sm"
              >
                + 제품 추가
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* 견적 테이블 */}
              <div className="lg:col-span-2">
                <EstimateTable items={items} onRemove={handleRemoveItem} />
              </div>

              {/* 견적 요약 */}
              <div className="lg:col-span-1">
                <EstimateSummary
                  subtotal={subtotal}
                  installationFee={installationFee}
                  discount={discount}
                  totalAmount={totalAmount}
                  notes={notes}
                  onInstallationFeeChange={setInstallationFee}
                  onDiscountChange={setDiscount}
                  onNotesChange={setNotes}
                />

                {/* 버튼 */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setStep('customer')}
                    disabled={items.length === 0}
                    className="btn-primary w-full py-3 text-base disabled:opacity-50"
                  >
                    견적 문의하기
                  </button>
                  <button
                    onClick={() => setStep('select')}
                    className="btn-secondary w-full py-3"
                  >
                    이전 단계
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 고객 정보 */}
        {step === 'customer' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="section-title">문의 정보 입력</h2>
              <p className="text-gray-500 text-sm -mt-3 mb-4">
                연락받으실 정보를 입력해주시면 빠르게 상담 연락 드리겠습니다.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* 고객 정보 폼 */}
              <div className="lg:col-span-2">
                <CustomerForm customer={customer} onChange={handleCustomerChange} />
              </div>

              {/* 견적 요약 */}
              <div className="lg:col-span-1">
                <div className="card">
                  <div className="card-header">
                    견적 요약
                  </div>
                  <div className="card-body">
                    {/* 제품 목록 */}
                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <span className="text-gray-800">{item.productName}</span>
                            <span className="text-gray-400 ml-1">({item.room})</span>
                          </div>
                          <span className="font-medium">{item.totalPrice.toLocaleString()}원</span>
                        </div>
                      ))}
                    </div>

                    {/* 금액 정보 */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">제품 합계</span>
                        <span>{subtotal.toLocaleString()}원</span>
                      </div>
                      {installationFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">설치비</span>
                          <span>+{installationFee.toLocaleString()}원</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">할인</span>
                          <span className="text-red-500">-{discount.toLocaleString()}원</span>
                        </div>
                      )}
                    </div>

                    {/* 총 금액 */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">총 예상 금액</span>
                        <span className="price-display">{totalAmount.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={isSending}
                    className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="spinner"></div>
                        <span>전송 중...</span>
                      </>
                    ) : (
                      '견적 문의 보내기'
                    )}
                  </button>
                  <button
                    onClick={() => setStep('review')}
                    className="btn-secondary w-full py-3"
                  >
                    이전 단계
                  </button>
                </div>

                {/* 안내 문구 */}
                <div className="mt-4 p-4 bg-[#faf8f5] border border-[#e8e0d5] text-sm text-gray-600">
                  <p className="font-medium text-gray-800 mb-2">안내사항</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• 실측 후 최종 금액이 변경될 수 있습니다.</li>
                    <li>• 문의 접수 후 1영업일 내 연락드립니다.</li>
                    <li>• 설치 일정은 상담 시 조율 가능합니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 제품 옵션 모달 */}
      {selectedProduct && (
        <ProductOptionModal
          product={selectedProduct.product}
          type={selectedProduct.type}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleAddItem}
        />
      )}

      {/* 푸터 (Step 1일 때만 여백 추가) */}
      {step === 'select' && items.length > 0 && <div className="h-20"></div>}
    </div>
  );
}
