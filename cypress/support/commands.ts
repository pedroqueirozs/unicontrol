/// <reference types="cypress" />

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/");
  cy.get("#user_email").type(email);
  cy.get("#password").type(password);
  cy.contains("Entrar").click();
  cy.url().should("include", "/dashboard");
});
