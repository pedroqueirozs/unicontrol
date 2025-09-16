import { UserFixture } from "../support/types";

describe("Teste de login", () => {
  let users: UserFixture;
  before(() => {
    cy.fixture("users.json").then((data) => {
      users = data;
    });
  });

  it("Deve fazer login com sucesso utilizando credenciais de um usuário válido e realizar o logout com segurança", () => {
    cy.visit("/");
    cy.get("#user_email").type(users.validUser.email);
    cy.get("#password").type(users.validUser.password);

    cy.contains("Entrar").click();

    cy.url().should("include", "/dashboard");

    cy.get("[data-cy='user-avatar']").click();
    cy.contains("Sair").click();
    cy.contains("Confirmar").click();
  });

  it("Deve mostrar uma mensagem de erro com um usuário inválido", () => {
    cy.visit("/");
    cy.get("#user_email").type(users.invalidUser.email);
    cy.get("#password").type(users.invalidUser.password);
    cy.contains("Entrar").click();

    cy.contains("Erro ao fazer login. Verifique suas credenciais").should(
      "be.visible"
    );
  });
  it("Deve mostrar erro ao tentar fazer login com campos vazios", () => {
    cy.visit("/");
    cy.contains("Entrar").click();
    cy.contains("span", "*").should("be.visible");
    cy.contains("span", "*").should("be.visible");
  });
});
