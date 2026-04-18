'use client';

import type { CustomerInfo } from '@/types/estimate';

interface CustomerFormProps {
  customer: CustomerInfo;
  onChange: (customer: Partial<CustomerInfo>) => void;
}

export default function CustomerForm({ customer, onChange }: CustomerFormProps) {
  return (
    <div className="card">
      <div className="card-header">고객 정보</div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 고객명 */}
          <div className="form-group">
            <label className="form-label">
              고객명 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="input-field"
              placeholder="홍길동"
            />
          </div>

          {/* 연락처 */}
          <div className="form-group">
            <label className="form-label">
              연락처 <span className="required">*</span>
            </label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="input-field"
              placeholder="010-1234-5678"
            />
          </div>

          {/* 주소 */}
          <div className="form-group md:col-span-2">
            <label className="form-label">
              설치 주소 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={customer.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className="input-field"
              placeholder="서울시 강남구 테헤란로 123, 101동 1001호"
            />
          </div>

          {/* 이메일 */}
          <div className="form-group">
            <label className="form-label">이메일 (선택)</label>
            <input
              type="email"
              value={customer.email || ''}
              onChange={(e) => onChange({ email: e.target.value })}
              className="input-field"
              placeholder="example@email.com"
            />
          </div>

          {/* 방문 희망일 */}
          <div className="form-group">
            <label className="form-label">방문 희망일 (선택)</label>
            <input
              type="date"
              value={customer.visitDate || ''}
              onChange={(e) => onChange({ visitDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-100 text-sm">
          <p className="text-gray-600">
            <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다.
          </p>
          <p className="text-gray-500 mt-1">
            입력하신 정보는 견적 상담을 위해서만 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
