// ===== 제품 타입 =====

// 가격 계산 방식
export type PriceType = 'fixed' | 'area'; // 고정가 / 면적 기준

// 블라인드 카테고리
export type BlindCategory =
  | 'roll' // 롤블라인드
  | 'wood' // 우드블라인드
  | 'vertical' // 버티컬블라인드
  | 'venetian' // 베네시안블라인드
  | 'honeycomb' // 허니콤블라인드
  | 'zebra'; // 콤비블라인드(지브라)

// 커튼 카테고리
export type CurtainCategory =
  | 'blackout' // 암막커튼
  | 'sheer' // 쉬폰커튼
  | 'double' // 이중커튼
  | 'linen' // 린넨커튼
  | 'velvet'; // 벨벳커튼

// 블라인드 제품 (Google Sheets에서 가져옴)
export interface BlindProduct {
  id: string;
  category: BlindCategory;
  name: string; // 제품명
  description?: string; // 설명
  imageUrl: string; // 이미지 URL
  priceType: PriceType; // 가격 계산 방식
  price: number; // 고정가 또는 ㎡당 가격
  minWidth?: number; // 최소 가로 (mm)
  maxWidth?: number; // 최대 가로 (mm)
  minHeight?: number; // 최소 세로 (mm)
  maxHeight?: number; // 최대 세로 (mm)
  colors?: string[]; // 색상 옵션
  motorOption?: boolean; // 전동 옵션 가능 여부
  motorPrice?: number; // 전동 추가 가격
  isActive: boolean; // 판매 중 여부
}

// 커튼 제품 (Google Sheets에서 가져옴)
export interface CurtainProduct {
  id: string;
  category: CurtainCategory;
  name: string;
  description?: string;
  imageUrl: string;
  priceType: PriceType;
  price: number; // 고정가 또는 ㎡당 가격
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  colors?: string[];
  liningOption?: boolean; // 안감 옵션 가능 여부
  liningPrice?: number; // 안감 추가 가격
  railTypes?: ('single' | 'double')[]; // 레일 타입 옵션
  isActive: boolean;
}

// 모든 제품 타입
export type Product = BlindProduct | CurtainProduct;

// ===== 견적 아이템 =====

// 선택된 견적 아이템
export interface EstimateItem {
  id: string;
  productId: string;
  productType: 'blind' | 'curtain';
  productName: string;
  imageUrl: string;
  room: string; // 설치 위치 (거실, 안방 등)
  width: number; // mm
  height: number; // mm
  quantity: number;
  // 옵션
  color?: string;
  motorized?: boolean; // 블라인드 전동
  lining?: boolean; // 커튼 안감
  railType?: 'single' | 'double'; // 커튼 레일
  // 가격
  basePrice: number; // 기본 가격
  optionPrice: number; // 옵션 추가 가격
  unitPrice: number; // 개당 가격 (기본 + 옵션)
  totalPrice: number; // 총 가격 (개당 x 수량)
  memo?: string;
}

// ===== 고객 정보 =====

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
  visitDate?: string;
}

// ===== 견적서 =====

export interface Estimate {
  id: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  items: EstimateItem[];
  subtotal: number;
  installationFee: number;
  discount: number;
  discountReason?: string;
  totalAmount: number;
  notes?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'completed';
}

// ===== 라벨 =====

export const BLIND_CATEGORY_LABELS: Record<BlindCategory, string> = {
  roll: '롤블라인드',
  wood: '우드블라인드',
  vertical: '버티컬블라인드',
  venetian: '베네시안블라인드',
  honeycomb: '허니콤블라인드',
  zebra: '콤비블라인드(지브라)',
};

export const CURTAIN_CATEGORY_LABELS: Record<CurtainCategory, string> = {
  blackout: '암막커튼',
  sheer: '쉬폰커튼',
  double: '이중커튼',
  linen: '린넨커튼',
  velvet: '벨벳커튼',
};

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  fixed: '고정가',
  area: '면적 기준 (㎡)',
};
