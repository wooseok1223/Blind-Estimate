/**
 * Google Apps Script - 블라인드/커튼 견적 시스템
 *
 * 관리자용 간편 버전:
 * - 이미지: Google Drive에 업로드 후 공유 링크만 붙여넣기
 * - 제품 정보: 시트에 직접 입력
 */

// ===== 설정 =====
const SHEET_BLINDS = '블라인드';
const SHEET_CURTAINS = '커튼';
const SHEET_ESTIMATES = '견적내역';

// ===== GET 요청 처리 =====
function doGet(e) {
  const action = e.parameter.action;

  try {
    if (action === 'getBlinds') {
      return jsonResponse({ success: true, products: getBlindProducts() });
    } else if (action === 'getCurtains') {
      return jsonResponse({ success: true, products: getCurtainProducts() });
    } else {
      return jsonResponse({ success: true, message: 'API 정상 작동 중' });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

// ===== POST 요청 처리 =====
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'saveEstimate') {
      saveEstimate(body.data);
      return jsonResponseWithCors({ success: true, message: '견적서가 저장되었습니다.' });
    }

    return jsonResponseWithCors({ success: false, message: '알 수 없는 action' });
  } catch (error) {
    return jsonResponseWithCors({ success: false, message: error.toString() });
  }
}

// CORS 헤더 포함 응답
function jsonResponseWithCors(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== Google Drive 링크를 이미지 URL로 변환 =====
function convertDriveLink(link) {
  if (!link) return '';

  // 이미 직접 이미지 URL인 경우
  if (link.startsWith('http') && !link.includes('drive.google.com')) {
    return link;
  }

  // Google Drive 공유 링크 변환
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/open?id=FILE_ID
  // -> https://lh3.googleusercontent.com/d/FILE_ID (CORS 문제 없음)

  let fileId = '';

  if (link.includes('/file/d/')) {
    const match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) fileId = match[1];
  } else if (link.includes('id=')) {
    const match = link.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) fileId = match[1];
  }

  if (fileId) {
    // lh3.googleusercontent.com 형식은 CORS 문제 없이 브라우저에서 직접 로드 가능
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return link;
}

// ===== 블라인드 제품 가져오기 =====
function getBlindProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_BLINDS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const products = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // 제품명이 없으면 스킵

    products.push({
      id: 'blind-' + i,
      category: row[1] || 'roll',
      name: row[0],  // A열: 제품명
      description: row[2] || '',
      imageUrl: convertDriveLink(row[3]),  // D열: 이미지 링크
      priceType: row[4] || 'area',
      price: Number(row[5]) || 0,
      minWidth: Number(row[6]) || undefined,
      maxWidth: Number(row[7]) || undefined,
      minHeight: Number(row[8]) || undefined,
      maxHeight: Number(row[9]) || undefined,
      colors: row[10] ? String(row[10]).split(',').map(c => c.trim()) : [],
      motorOption: row[11] === 'Y' || row[11] === true || row[11] === 'y',
      motorPrice: Number(row[12]) || 0,
      isActive: row[13] !== 'N' && row[13] !== 'n',  // 기본값 Y
    });
  }

  return products;
}

// ===== 커튼 제품 가져오기 =====
function getCurtainProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CURTAINS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const products = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    products.push({
      id: 'curtain-' + i,
      category: row[1] || 'blackout',
      name: row[0],
      description: row[2] || '',
      imageUrl: convertDriveLink(row[3]),
      priceType: row[4] || 'area',
      price: Number(row[5]) || 0,
      minWidth: Number(row[6]) || undefined,
      maxWidth: Number(row[7]) || undefined,
      minHeight: Number(row[8]) || undefined,
      maxHeight: Number(row[9]) || undefined,
      colors: row[10] ? String(row[10]).split(',').map(c => c.trim()) : [],
      liningOption: row[11] === 'Y' || row[11] === true || row[11] === 'y',
      liningPrice: Number(row[12]) || 0,
      railTypes: row[13] ? String(row[13]).split(',').map(r => r.trim()) : ['single', 'double'],
      isActive: row[14] !== 'N' && row[14] !== 'n',
    });
  }

  return products;
}

// ===== 견적서 저장 =====
function saveEstimate(estimate) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ESTIMATES);

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_ESTIMATES);
    addEstimateHeaders(sheet);
  }

  if (sheet.getLastRow() === 0) {
    addEstimateHeaders(sheet);
  }

  const items = estimate.items || [];
  const timestamp = new Date().toLocaleString('ko-KR');
  const estimateId = estimate.id ? estimate.id.slice(0, 8).toUpperCase() : 'N/A';
  const customerName = estimate.customer ? estimate.customer.name : '';
  const customerPhone = estimate.customer ? estimate.customer.phone : '';
  const customerAddress = estimate.customer ? estimate.customer.address : '';
  const totalAmount = estimate.totalAmount || 0;
  const notes = estimate.notes || '';

  // 견적 항목이 없는 경우
  if (items.length === 0) {
    const row = [
      estimateId,
      timestamp,
      customerName,
      customerPhone,
      customerAddress,
      '-',
      '-',
      '(항목 없음)',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      notes,
      totalAmount,
    ];
    sheet.appendRow(row);
    return;
  }

  // 견적 항목 저장
  items.forEach((item, index) => {
    const row = [
      index === 0 ? estimateId : '',
      index === 0 ? timestamp : '',
      index === 0 ? customerName : '',
      index === 0 ? customerPhone : '',
      index === 0 ? customerAddress : '',
      index + 1,
      item.productType === 'blind' ? '블라인드' : '커튼',
      item.productName || '',
      item.room || '',
      item.width || '',
      item.height || '',
      item.color || '',
      item.quantity || 1,
      item.unitPrice || 0,
      item.totalPrice || 0,
      index === 0 ? notes : (item.memo || ''),
      index === 0 ? totalAmount : '',
    ];
    sheet.appendRow(row);
  });
}

// ===== 견적내역 헤더 =====
function addEstimateHeaders(sheet) {
  const headers = [
    '견적번호', '작성일시', '고객명', '연락처', '주소',
    '순번', '카테고리', '제품명', '설치위치', '가로(cm)', '세로(cm)',
    '색상', '수량', '단가', '금액', '메모', '총금액'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a90d9');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

// ===== 시트 초기화 (최초 1회 실행) =====
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 블라인드 시트
  let blindSheet = ss.getSheetByName(SHEET_BLINDS);
  if (!blindSheet) {
    blindSheet = ss.insertSheet(SHEET_BLINDS);
  } else {
    blindSheet.clear();
  }

  const blindHeaders = [
    '제품명', '종류', '설명', '이미지링크', '가격방식', '가격',
    '최소가로', '최대가로', '최소세로', '최대세로',
    '색상옵션', '전동가능', '전동추가금', '판매중'
  ];
  blindSheet.getRange(1, 1, 1, blindHeaders.length).setValues([blindHeaders]);
  blindSheet.getRange(1, 1, 1, blindHeaders.length).setFontWeight('bold');
  blindSheet.getRange(1, 1, 1, blindHeaders.length).setBackground('#2196F3');
  blindSheet.getRange(1, 1, 1, blindHeaders.length).setFontColor('#ffffff');
  blindSheet.setFrozenRows(1);

  // 블라인드 샘플 데이터 (2개)
  const blindSamples = [
    ['베이직 롤블라인드', 'roll', '심플하고 깔끔한 기본 롤블라인드',
     'https://drive.google.com/file/d/1T5VROWbdD24bIoKKQ3r0bpy6RiBaP7mj/view?usp=sharing',
     'area', 45000, 300, 3000, 500, 3000,
     '화이트, 아이보리, 그레이, 베이지', 'Y', 80000, 'Y'],
    ['프리미엄 우드블라인드', 'wood', '고급 원목 소재의 우드블라인드',
     'https://drive.google.com/file/d/1NVLk2qA9gSV_l7OcrE8ejhtKJuDx_dul/view?usp=sharing',
     'area', 85000, 400, 2400, 600, 2500,
     '내추럴, 월넛, 오크, 화이트', 'Y', 120000, 'Y']
  ];
  blindSheet.getRange(2, 1, blindSamples.length, blindHeaders.length).setValues(blindSamples);

  // 열 너비 조정
  blindSheet.setColumnWidth(1, 150);
  blindSheet.setColumnWidth(3, 200);
  blindSheet.setColumnWidth(4, 300);
  blindSheet.setColumnWidth(11, 150);

  // 커튼 시트
  let curtainSheet = ss.getSheetByName(SHEET_CURTAINS);
  if (!curtainSheet) {
    curtainSheet = ss.insertSheet(SHEET_CURTAINS);
  } else {
    curtainSheet.clear();
  }

  const curtainHeaders = [
    '제품명', '종류', '설명', '이미지링크', '가격방식', '가격',
    '최소가로', '최대가로', '최소세로', '최대세로',
    '색상옵션', '안감가능', '안감추가금', '레일타입', '판매중'
  ];
  curtainSheet.getRange(1, 1, 1, curtainHeaders.length).setValues([curtainHeaders]);
  curtainSheet.getRange(1, 1, 1, curtainHeaders.length).setFontWeight('bold');
  curtainSheet.getRange(1, 1, 1, curtainHeaders.length).setBackground('#9C27B0');
  curtainSheet.getRange(1, 1, 1, curtainHeaders.length).setFontColor('#ffffff');
  curtainSheet.setFrozenRows(1);

  // 커튼 샘플 데이터 (2개)
  const curtainSamples = [
    ['프리미엄 암막커튼', 'blackout', '99% 차광, 방음 효과',
     'https://drive.google.com/file/d/13MnZNl5ZHP15LqRdVAO9j0CU9gT_cenh/view?usp=sharing',
     'area', 65000, '', '', '', '',
     '네이비, 그레이, 베이지, 버건디', 'Y', 25000, 'single, double', 'Y'],
    ['쉬폰 쉬어커튼', 'sheer', '은은한 채광의 쉬폰 소재',
     'https://drive.google.com/file/d/1v92fvGedKkYz7N7HjNB-djim-OCwyViu/view?usp=sharing',
     'area', 35000, '', '', '', '',
     '화이트, 아이보리, 라이트그레이', 'N', 0, 'single, double', 'Y']
  ];
  curtainSheet.getRange(2, 1, curtainSamples.length, curtainHeaders.length).setValues(curtainSamples);

  curtainSheet.setColumnWidth(1, 150);
  curtainSheet.setColumnWidth(3, 200);
  curtainSheet.setColumnWidth(4, 300);
  curtainSheet.setColumnWidth(11, 150);

  // 견적내역 시트
  let estimateSheet = ss.getSheetByName(SHEET_ESTIMATES);
  if (!estimateSheet) {
    estimateSheet = ss.insertSheet(SHEET_ESTIMATES);
    addEstimateHeaders(estimateSheet);
  }

  // 안내 시트
  let guideSheet = ss.getSheetByName('사용법');
  if (!guideSheet) {
    guideSheet = ss.insertSheet('사용법');
  } else {
    guideSheet.clear();
  }

  guideSheet.getRange('A1').setValue('📌 블라인드/커튼 견적 시스템 사용법');
  guideSheet.getRange('A1').setFontSize(16).setFontWeight('bold');

  guideSheet.getRange('A3').setValue('✅ 제품 추가 방법');
  guideSheet.getRange('A3').setFontWeight('bold');
  guideSheet.getRange('A4').setValue('1. "블라인드" 또는 "커튼" 시트로 이동');
  guideSheet.getRange('A5').setValue('2. 새 행에 제품 정보 입력');
  guideSheet.getRange('A6').setValue('3. 저장하면 자동 반영됨');

  guideSheet.getRange('A8').setValue('📷 이미지 추가 방법');
  guideSheet.getRange('A8').setFontWeight('bold');
  guideSheet.getRange('A9').setValue('1. Google Drive에 이미지 업로드');
  guideSheet.getRange('A10').setValue('2. 이미지 우클릭 → "공유" → "링크 복사"');
  guideSheet.getRange('A11').setValue('3. "이미지링크" 열에 붙여넣기');

  guideSheet.getRange('A13').setValue('📝 종류 옵션');
  guideSheet.getRange('A13').setFontWeight('bold');
  guideSheet.getRange('A14').setValue('블라인드: roll, wood, vertical, venetian, honeycomb, zebra');
  guideSheet.getRange('A15').setValue('커튼: blackout, sheer, double, linen, velvet');

  guideSheet.getRange('A17').setValue('💰 가격방식');
  guideSheet.getRange('A17').setFontWeight('bold');
  guideSheet.getRange('A18').setValue('area = 면적당 가격 (가로x세로 ㎡ 기준)');
  guideSheet.getRange('A19').setValue('fixed = 고정 가격 (개당)');

  guideSheet.setColumnWidth(1, 500);
}

// ===== 유틸리티 =====
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
