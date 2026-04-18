// 가격 포맷팅 (원화)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

// 사이즈 포맷팅 (mm -> m 또는 mm 표시)
export function formatSize(mm: number): string {
  if (mm >= 1000) {
    return (mm / 1000).toFixed(2) + 'm';
  }
  return mm + 'mm';
}

// UUID 생성
export function generateId(): string {
  return crypto.randomUUID();
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 면적 계산 (m²)
export function calculateArea(widthMm: number, heightMm: number): number {
  return (widthMm / 1000) * (heightMm / 1000);
}