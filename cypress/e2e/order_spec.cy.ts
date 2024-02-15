/// <reference types="cypress" />

function initialize() {
  // 홈페이지 방문
  cy.visit("http://localhost:5173/");

  // 카테고리 페이지로 이동
  cy.contains("Category1").should("be.visible").click();

  cy.wait(6000);
  // 상품에 접근
  cy.contains("짱 기여운 가방").should("be.visible").click();

  // 상품 페이지가 제대로 로드되었는지 확인
  cy.contains("짱 기여운 가방");
}
describe("Order Test", () => {
  beforeEach(initialize);

  context("회원일 경우", () => {
    it("로그인 안 되어있을 경우 로그인", () => {
      cy.contains("LOGIN").then(() => {
        cy.contains("LOGIN").click();
        cy.wait(4000);
        cy.get("#email").type("zzz321@gmail.com");
        cy.get("#password").type("zzz321@@");
        cy.contains("로그인").click();
        cy.wait(15000);
        initialize();
      });
    });

    it("장바구니 상품 선택 후 결제", () => {
      cy.get("button").contains("장바구니").click();
      cy.contains("장바구니에 담은 상품 목록입니다.", { timeout: 10000 });

      // 상품이 추가되었는지 확인
      cy.contains("짱 기여운 가방");

      cy.wait(5000);
      // 최근 상품 체크
      cy.get("#chk-0").click();

      // 선택 상품 주문하기
      cy.wait(10000);
      cy.contains("선택 상품 주문하기").click();

      // 페이지 이동 후 로컬 스토리지 설정
      cy.window().then((win) => {
        win.localStorage.setItem(
          "checkedCartItems",
          JSON.stringify([
            {
              cartId: "WiGPizAOSTYo2rizDvln",
              productId: "JSWDqHUssOfCEJ9TZNTv",
              sellerId: "igearfxs2ENFqUarLOTK9fJmQir2",
              productName: "짱 기여운 가방",
              productImage: [
                "https://firebasestorage.googleapis.com/v0/b/e-commerce-platform-d1546.appspot.com/o/igearfxs2ENFqUarLOTK9fJmQir2%2FIMG_00891707206601685?alt=media&token=7fcd9f89-d1ef-4158-a93f-59ac74396f21",
              ],
              productPrice: 20000,
              cartQuantity: 1,
            },
          ])
        );
      });

      cy.wait(6000);

      // 로컬 스토리지 장바구니 정보 확인
      cy.window().its("localStorage.checkedCartItems").should("exist");

      // order 페이지 이동 확인
      cy.get("p")
        .contains("igearfxs2ENFqUarLOTK9fJmQir2")
        .then(() => {
          // 주문자 정보 입력 폼 채우기
          cy.get("#name").type("test");
          cy.get("#tel").type("01012341234");
          cy.get("#email").type("test@test.com");
          cy.get("#address").type("seoul");
          cy.get("#zipcode").type("12345");

          // 결제 버튼 클릭
          cy.contains("결제하기").click();
        });
    });
  });

  context("비회원일 경우", () => {
    it("로그인 되어있을 경우 로그아웃", () => {
      cy.contains("MYPAGE").then(() => {
        cy.contains("MYPAGE").click();
        cy.contains("로그아웃").click();

        initialize();
      });
    });

    it("장바구니 기능 이용 시 로그인", () => {
      cy.get("button").contains("장바구니").click();

      // 로그인 안 되어있을 땐 /signin으로 이동됨
      cy.contains("Sign in").then(() => {
        cy.wait(4000);
        cy.get("#email").type("zzz321@gmail.com");
        cy.get("#password").type("zzz321@@");
        cy.contains("로그인").click();
        cy.wait(15000);
        initialize();
      });
    });

    it("장바구니 상품 선택 후 결제", () => {
      cy.get("button").contains("장바구니").click();
      cy.contains("장바구니에 담은 상품 목록입니다.", { timeout: 10000 });

      // 상품이 추가되었는지 확인
      cy.contains("짱 기여운 가방");

      cy.wait(5000);
      // 최근 상품 체크
      cy.get("#chk-0").click();

      // 선택 상품 주문하기
      cy.wait(10000);
      cy.contains("선택 상품 주문하기").click();

      // 페이지 이동 후 로컬 스토리지 설정
      cy.window().then((win) => {
        win.localStorage.setItem(
          "checkedCartItems",
          JSON.stringify([
            {
              cartId: "WiGPizAOSTYo2rizDvln",
              productId: "JSWDqHUssOfCEJ9TZNTv",
              sellerId: "igearfxs2ENFqUarLOTK9fJmQir2",
              productName: "짱 기여운 가방",
              productImage: [
                "https://firebasestorage.googleapis.com/v0/b/e-commerce-platform-d1546.appspot.com/o/igearfxs2ENFqUarLOTK9fJmQir2%2FIMG_00891707206601685?alt=media&token=7fcd9f89-d1ef-4158-a93f-59ac74396f21",
              ],
              productPrice: 20000,
              cartQuantity: 1,
            },
          ])
        );
      });

      cy.wait(6000);

      // 로컬 스토리지 장바구니 정보 확인
      cy.window().its("localStorage.checkedCartItems").should("exist");

      // order 페이지 이동 확인
      cy.get("p")
        .contains("igearfxs2ENFqUarLOTK9fJmQir2")
        .then(() => {
          // 주문자 정보 입력 폼 채우기
          cy.get("#name").type("test");
          cy.get("#tel").type("01012341234");
          cy.get("#email").type("test@test.com");
          cy.get("#address").type("seoul");
          cy.get("#zipcode").type("12345");

          // 결제 버튼 클릭
          cy.contains("결제하기").click();
        });
    });
  });
});
