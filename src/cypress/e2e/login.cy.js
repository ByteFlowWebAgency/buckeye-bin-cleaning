describe("Login Page", () => {
  it("should render the login form", () => {
    cy.visit("/admin/login");

    // Check if the login form is rendered
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.contains("Sign In").should("be.visible");
  });

  it("should handle login form submission", () => {
    cy.visit("/admin/login");

    // Fill in the form
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password");

    // Submit the form
    cy.contains("Sign In").click();

    // Check if the user is redirected to the admin dashboard
    cy.url().should("include", "/admin");
  });

  it("should display an error message for invalid credentials", () => {
    cy.visit("/admin/login");

    // Fill in the form with invalid credentials
    cy.get('input[name="email"]').type("invalid@example.com");
    cy.get('input[name="password"]').type("wrongpassword");

    // Submit the form
    cy.contains("Sign In").click();

    // Check if an error message is displayed
    cy.contains("Invalid email or password").should("be.visible");
  });
});
