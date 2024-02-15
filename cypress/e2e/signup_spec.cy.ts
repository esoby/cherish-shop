/// <reference types="cypress" />

describe("invalid inputs", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/signup");
    cy.get("#email").type("test@test.com");
    cy.get("#name").type("test");
    cy.get("#password").type("test123@@");
  });
  it("should display an error message when email is too short", () => {
    cy.get("#email").clear().type("h");
    cy.contains("회원가입").should("be.disabled");
  });

  it("should display an error message when email is invalid", () => {
    cy.get("#email").clear().type("testcom");
    cy.contains("회원가입").should("be.disabled");
  });

  it("should display an error message when password is too short", () => {
    cy.get("#password").clear().type("1234");
    cy.contains("회원가입").should("be.disabled");
  });
});
