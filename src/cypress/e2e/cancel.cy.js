describe("Cancel Page", () => {
  it("should display the cancellation message when refunded is true", () => {
    cy.visit("/cancel?refunded=true");
  
    // Check if the refund confirmation message is displayed
    cy.contains("Order Cancelled Successfully").should("be.visible");
    cy.contains("Need Help?").should("be.visible");
    cy.contains("Return to Home").should("be.visible");
  });
  
  it("should display the payment cancellation message when refunded is false", () => {
    cy.visit("/cancel?refunded=false");
  
    // Check if the payment cancellation message is displayed
    cy.contains("Payment Cancelled").should("be.visible");
    cy.contains("Try Again").should("be.visible");
    cy.contains("Return to Home").should("be.visible");
  });
  
  it('should navigate to the home page when "Return to Home" is clicked', () => {
    cy.visit("/cancel?refunded=true");
  
    // Click the "Return to Home" button
    cy.contains("Return to Home").click();
  
    // Check if the URL is redirected to the home page
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });
});