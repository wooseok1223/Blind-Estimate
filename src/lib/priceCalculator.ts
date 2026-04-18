import type { BlindProduct, CurtainProduct, EstimateItem } from '@/types/estimate';

// 면적 계산 (mm → ㎡)
export function calculateArea(widthMm: number, heightMm: number): number {
  return (widthMm / 1000) * (heightMm / 1000);
}

// 블라인드 가격 계산
export function calculateBlindPrice(
  product: BlindProduct,
  widthMm: number,
  heightMm: number,
  options: { motorized?: boolean }
): { basePrice: number; optionPrice: number; unitPrice: number } {
  let basePrice = 0;

  if (product.priceType === 'fixed') {
    basePrice = product.price;
  } else {
    // 면적 기준
    const areaSqm = calculateArea(widthMm, heightMm);
    basePrice = Math.ceil(product.price * areaSqm);
  }

  // 옵션 가격
  let optionPrice = 0;
  if (options.motorized && product.motorOption && product.motorPrice) {
    optionPrice += product.motorPrice;
  }

  return {
    basePrice,
    optionPrice,
    unitPrice: basePrice + optionPrice,
  };
}

// 커튼 가격 계산
export function calculateCurtainPrice(
  product: CurtainProduct,
  widthMm: number,
  heightMm: number,
  options: { lining?: boolean; railType?: 'single' | 'double' }
): { basePrice: number; optionPrice: number; unitPrice: number } {
  let basePrice = 0;

  if (product.priceType === 'fixed') {
    basePrice = product.price;
  } else {
    // 면적 기준
    const areaSqm = calculateArea(widthMm, heightMm);
    basePrice = Math.ceil(product.price * areaSqm);
  }

  // 옵션 가격
  let optionPrice = 0;
  if (options.lining && product.liningOption && product.liningPrice) {
    optionPrice += product.liningPrice;
  }

  // 더블 레일 추가 비용 (선택적)
  // if (options.railType === 'double') { ... }

  return {
    basePrice,
    optionPrice,
    unitPrice: basePrice + optionPrice,
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
