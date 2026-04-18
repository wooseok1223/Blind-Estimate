import type { BlindProduct, CurtainProduct, EstimateItem } from '@/types/estimate';

// 면적 계산 (cm → ㎡)
export function calculateArea(widthCm: number, heightCm: number): number {
  return (widthCm / 100) * (heightCm / 100);
}

// 블라인드 최소 면적 (㎡)
const BLIND_MIN_AREA: Record<string, number> = {
  zebra: 2.0,    // 콤비블라인드
  roll: 1.5,     // 롤블라인드
  wood: 1.5,     // 우드블라인드
  honeycomb: 1.5, // 허니콤
  aluminum: 1.5,  // 알루미늄
  default: 1.5,
};

// 블라인드 가격 계산
export function calculateBlindPrice(
  product: BlindProduct,
  widthCm: number,
  heightCm: number,
  options: { motorized?: boolean }
): { basePrice: number; optionPrice: number; unitPrice: number; area: number; appliedArea: number } {
  let basePrice = 0;

  if (product.priceType === 'fixed') {
    basePrice = product.price;
    return {
      basePrice,
      optionPrice: options.motorized && product.motorOption && product.motorPrice ? product.motorPrice : 0,
      unitPrice: basePrice + (options.motorized && product.motorOption && product.motorPrice ? product.motorPrice : 0),
      area: 0,
      appliedArea: 0,
    };
  }

  // 면적 기준 계산
  const areaSqm = calculateArea(widthCm, heightCm);

  // 최소 면적 적용
  const minArea = BLIND_MIN_AREA[product.category] || BLIND_MIN_AREA.default;
  const appliedArea = Math.max(areaSqm, minArea);

  basePrice = Math.ceil(product.price * appliedArea);

  // 옵션 가격
  let optionPrice = 0;
  if (options.motorized && product.motorOption && product.motorPrice) {
    optionPrice += product.motorPrice;
  }

  return {
    basePrice,
    optionPrice,
    unitPrice: basePrice + optionPrice,
    area: areaSqm,
    appliedArea,
  };
}

// 커튼 가격 계산 (주름배율 적용)
export function calculateCurtainPrice(
  product: CurtainProduct,
  widthCm: number,
  heightCm: number,
  options: { lining?: boolean; railType?: 'single' | 'double'; pleatRatio?: 1.5 | 2.0 }
): { basePrice: number; optionPrice: number; unitPrice: number; area: number; pleatWidth: number } {
  let basePrice = 0;
  const pleatRatio = options.pleatRatio || 2.0; // 기본 나비주름 2배

  if (product.priceType === 'fixed') {
    basePrice = product.price;
    return {
      basePrice,
      optionPrice: options.lining && product.liningOption && product.liningPrice ? product.liningPrice : 0,
      unitPrice: basePrice + (options.lining && product.liningOption && product.liningPrice ? product.liningPrice : 0),
      area: 0,
      pleatWidth: 0,
    };
  }

  // 주름배율 적용한 가로 길이
  const pleatWidth = widthCm * pleatRatio;

  // 면적 계산 (주름배율 적용된 가로 × 세로)
  const areaSqm = (pleatWidth / 100) * (heightCm / 100);

  basePrice = Math.ceil(product.price * areaSqm);

  // 나비주름(2배)일 경우 30% 추가
  if (pleatRatio === 2.0) {
    basePrice = Math.ceil(basePrice * 1.3);
  }

  // 옵션 가격
  let optionPrice = 0;
  if (options.lining && product.liningOption && product.liningPrice) {
    optionPrice += product.liningPrice;
  }

  return {
    basePrice,
    optionPrice,
    unitPrice: basePrice + optionPrice,
    area: areaSqm,
    pleatWidth,
  };
}

// 총 견적 계산
export function calculateEstimateTotal(
  items: EstimateItem[],
  installationFee: number,
  discount: number
): { subtotal: number; totalAmount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = subtotal + installationFee - discount;
  return { subtotal, totalAmount: Math.max(0, totalAmount) };
}