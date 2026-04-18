# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

블라인드/커튼 견적 시스템 - Next.js 기반 프론트엔드 애플리케이션
- **관리자**: Google Sheets에서 제품 데이터 관리 (이미지, 가격, 옵션)
- **고객용**: 제품 선택 → 사이즈/옵션 입력 → 견적서 생성 → Sheets 저장

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

## Architecture

```
src/
├── app/
│   └── page.tsx              # 메인 페이지 (3단계 플로우: 선택→확인→저장)
├── components/
│   ├── ProductSelector.tsx   # 제품 목록 (카드/리스트 뷰 전환)
│   ├── ProductCard.tsx       # 제품 카드 컴포넌트
│   ├── ProductList.tsx       # 제품 리스트 컴포넌트
│   ├── ProductOptionModal.tsx # 사이즈/옵션 입력 모달
│   ├── EstimateTable.tsx     # 견적 항목 테이블
│   ├── EstimateSummary.tsx   # 견적 요약 (설치비, 할인, 총액)
│   └── CustomerForm.tsx      # 고객 정보 입력
├── lib/
│   ├── googleSheets.ts       # Google Sheets API (제품 조회, 견적 저장)
│   ├── priceCalculator.ts    # 가격 계산 (고정가/면적 기준)
│   └── utils.ts              # 유틸리티 (포맷, ID 생성)
└── types/
    └── estimate.ts           # TypeScript 타입 정의
```

## Key Types

- `BlindProduct` / `CurtainProduct`: 제품 정보 (Sheets에서 로드)
- `EstimateItem`: 선택된 견적 항목 (사이즈, 옵션, 가격 포함)
- `Estimate`: 전체 견적서 (고객정보 + 항목 + 총액)
- `PriceType`: `'fixed'` (고정가) | `'area'` (㎡당 가격)

## Google Sheets 구조

3개 시트로 구성:
- **블라인드**: 제품 목록 (ID, 카테고리, 이미지URL, 가격, 색상, 전동옵션 등)
- **커튼**: 제품 목록 (ID, 카테고리, 이미지URL, 가격, 색상, 안감옵션, 레일타입 등)
- **견적내역**: 저장된 견적 데이터

### 설정 방법
1. Google Sheets 생성 → 확장 프로그램 → Apps Script
2. `google-apps-script.js` 내용 붙여넣기
3. `initializeSheets()` 함수 실행 (시트 자동 생성)
4. 배포 → 새 배포 → 웹 앱 (모든 사용자 접근)
5. `.env.local`에 `NEXT_PUBLIC_GOOGLE_SCRIPT_URL=배포URL` 설정

## 가격 계산 로직

- `priceType: 'fixed'` → 고정 가격
- `priceType: 'area'` → `가격 × (가로mm/1000) × (세로mm/1000)`
- 옵션 추가: 전동(블라인드), 안감(커튼)

## Styling

Tailwind CSS v4. 블라인드=파란색, 커튼=보라색 배지로 구분.
