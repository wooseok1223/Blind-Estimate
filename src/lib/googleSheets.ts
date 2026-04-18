import type {
  BlindProduct,
  CurtainProduct,
  BlindCategory,
  CurtainCategory,
  PriceType,
  Estimate,
} from '@/types/estimate';

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

// ===== 제품 데이터 불러오기 =====

// Sheets에서 블라인드 제품 목록 가져오기
export async function fetchBlindProducts(): Promise<BlindProduct[]> {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('Google Sheets URL이 설정되지 않았습니다. 샘플 데이터를 반환합니다.');
    return getSampleBlindProducts();
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getBlinds`, {
      method: 'GET',
      mode: 'cors',
    });
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('블라인드 제품 로드 오류:', error);
    return getSampleBlindProducts();
  }
}

// Sheets에서 커튼 제품 목록 가져오기
export async function fetchCurtainProducts(): Promise<CurtainProduct[]> {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('Google Sheets URL이 설정되지 않았습니다. 샘플 데이터를 반환합니다.');
    return getSampleCurtainProducts();
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getCurtains`, {
      method: 'GET',
      mode: 'cors',
    });
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('커튼 제품 로드 오류:', error);
    return getSampleCurtainProducts();
  }
}

// ===== 견적서 저장 =====

export async function saveEstimate(estimate: Estimate): Promise<{ success: boolean; message: string }> {
  if (!GOOGLE_SCRIPT_URL) {
    return {
      success: false,
      message: 'Google Sheets 연동이 설정되지 않았습니다.',
    };
  }

  try {
    // Google Apps Script로 POST 요청
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({
        action: 'saveEstimate',
        data: estimate,
      }),
    });

    // 응답 확인
    if (response.ok) {
      try {
        const result = await response.json();
        return {
          success: result.success !== false,
          message: result.message || '견적 문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
        };
      } catch {
        // JSON 파싱 실패해도 요청은 성공한 것으로 처리
        return {
          success: true,
          message: '견적 문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
        };
      }
    } else {
      return {
        success: false,
        message: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      };
    }
  } catch (error) {
    console.error('견적서 저장 오류:', error);
    return {
      success: false,
      message: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

// ===== 샘플 데이터 (개발/테스트용) =====

function getSampleBlindProducts(): BlindProduct[] {
  return [
    {
      id: 'blind-001',
      category: 'roll',
      name: '베이직 롤블라인드',
      description: '심플하고 깔끔한 기본 롤블라인드',
      imageUrl: 'https://images.unsplash.com/photo-1585412459212-8def26f7d65a?w=400',
      priceType: 'area',
      price: 45000, // ㎡당
      minWidth: 30,   // cm
      maxWidth: 300,
      minHeight: 50,
      maxHeight: 300,
      colors: ['화이트', '아이보리', '그레이', '베이지'],
      motorOption: true,
      motorPrice: 80000,
      isActive: true,
    },
    {
      id: 'blind-002',
      category: 'wood',
      name: '프리미엄 우드블라인드',
      description: '고급 원목 우드블라인드',
      imageUrl: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=400',
      priceType: 'area',
      price: 85000,
      minWidth: 40,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 250,
      colors: ['내추럴', '월넛', '오크', '화이트'],
      motorOption: true,
      motorPrice: 120000,
      isActive: true,
    },
    {
      id: 'blind-003',
      category: 'zebra',
      name: '콤비 지브라블라인드',
      description: '채광 조절이 자유로운 콤비블라인드',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
      priceType: 'area',
      price: 55000,
      minWidth: 30,
      maxWidth: 280,
      minHeight: 50,
      maxHeight: 280,
      colors: ['화이트', '베이지', '그레이', '브라운'],
      motorOption: true,
      motorPrice: 90000,
      isActive: true,
    },
    {
      id: 'blind-004',
      category: 'honeycomb',
      name: '허니콤 블라인드',
      description: '단열 효과가 뛰어난 허니콤 구조',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400',
      priceType: 'area',
      price: 75000,
      minWidth: 30,
      maxWidth: 250,
      minHeight: 50,
      maxHeight: 250,
      colors: ['화이트', '크림', '라이트그레이'],
      motorOption: true,
      motorPrice: 100000,
      isActive: true,
    },
  ];
}

function getSampleCurtainProducts(): CurtainProduct[] {
  return [
    {
      id: 'curtain-001',
      category: 'blackout',
      name: '프리미엄 암막커튼',
      description: '99% 차광, 방음 효과',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      priceType: 'area',
      price: 65000,
      minWidth: 50,   // cm
      maxWidth: 500,
      minHeight: 100,
      maxHeight: 300,
      colors: ['네이비', '그레이', '베이지', '버건디'],
      liningOption: true,
      liningPrice: 25000,
      railTypes: ['single', 'double'],
      isActive: true,
    },
    {
      id: 'curtain-002',
      category: 'sheer',
      name: '쉬폰 쉬어커튼',
      description: '은은한 채광의 쉬폰 소재',
      imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400',
      priceType: 'area',
      price: 35000,
      minWidth: 50,
      maxWidth: 500,
      minHeight: 100,
      maxHeight: 300,
      colors: ['화이트', '아이보리', '라이트그레이'],
      liningOption: false,
      railTypes: ['single', 'double'],
      isActive: true,
    },
    {
      id: 'curtain-003',
      category: 'double',
      name: '이중커튼 세트',
      description: '암막 + 쉬어 이중 구성',
      imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
      priceType: 'area',
      price: 95000,
      minWidth: 50,
      maxWidth: 400,
      minHeight: 100,
      maxHeight: 280,
      colors: ['화이트+그레이', '아이보리+베이지', '그레이+네이비'],
      liningOption: true,
      liningPrice: 30000,
      railTypes: ['double'],
      isActive: true,
    },
    {
      id: 'curtain-004',
      category: 'linen',
      name: '내추럴 린넨커튼',
      description: '자연스러운 린넨 소재',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      priceType: 'area',
      price: 55000,
      minWidth: 50,
      maxWidth: 450,
      minHeight: 100,
      maxHeight: 280,
      colors: ['내추럴', '라이트베이지', '올리브'],
      liningOption: true,
      liningPrice: 20000,
      railTypes: ['single', 'double'],
      isActive: true,
    },
  ];
}
