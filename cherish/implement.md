# 기능 구현 내용

### 💡 로그인 / 회원가입 구현

- **Firebase Authentication**를 통해 이메일 인증 회원가입 기능 구현, **구글 소셜 로그인** 구현
- **Context API**와 Firebase 인증 정보 리스너를 이용해 사용자 정보 전역 상태 관리
- **전자인증 가이드라인**에 따른 **유효성 검사** 구현
- input value 상태 값 관리의 복잡도를 줄이고자 **react-hook-form** 도입, register로 데이터를 관리함으로써 가독성을 향상시킴

### 💡 판매 상품 CRUD 구현

- 판매자 계정만 접근할 수 있는 상품 관리 페이지에서 상품 CRUD 기능 구현
- 등록 시 상품 정보는 Firestore, 이미지는 Cloud Storage에 저장하여 **최적화된 데이터 관리**
- 판매자별 등록 상품 조회 **페이지네이션**을 위해 **useInfiniteQuery로 무한 스크롤** 구현

### 💡 장바구니 CRUD 구현

- 윈도우 우측의 슬라이딩 드로어 형태로 장바구니 구현
- 장바구니 **DB 변화에 따라** 내비게이션 바의 수량 표시와 장바구니 아이템 내용의 **즉각적인 UI 반응을 제공**하고자 useMutation을 활용한 **Optimistic Update** 구현

### 💡 구매 및 결제 기능 구현

- **아임포트(포트원) 결제 SDK을 연동**해 가상 결제를 진행
- 장바구니에서 선택된 상품과 수량 정보를 **로컬 스토리지로 관리**한 후 구매 과정에 사용
- **안전한 재고 관리 트랜잭션**을 위해 **임시 재고 DB를 추가**로 구축하여 저장해두었다가 복구하는 방식 채택
- 상품 내역의 바로 구매 버튼으로 접근하여 단독 상품 주문 기능 구현
  - 주문서 정보를 받는 Modal 컴포넌트에 **Compound component 패턴**을 적용하여 재사용성을 높이고 편리하게 사용할 수 있도록 구현함

### 💡 E2E 테스트 코드 작성

- 커머스 서비스의 핵심인 **구매 프로세스에 대한 유저 플로우 및 서비스 로직 테스트**
- **Cypress 테스트 케이스**를 구성하여, 코드 수정 시마다 기능들이 예상대로 작동하는지 확인하는 용도로 사용

### 💡 사이트 배포

- **AWS S3, CloudFront**를 이용한 **https** 환경으로 배포
- **GitHub Actions**를 이용해 빌드 및 캐시 무효화 등 **배포 과정 자동화**