describe("Success Page", () => {
  it("should display the success message when sessionId is missing", () => {
    cy.visit("/success");

    // Check if the success message is displayed
    cy.contains("Thank You for Your Order!").should("be.visible");
    cy.contains("Return to Home").should("be.visible");
  });

  it("should display the order details when sessionId is present", () => {
    cy.visit("/success?session_id=123");

    // Mock the API response for order details
    cy.intercept("GET", "/api/order-details?session_id=123", {
      statusCode: 200,
      body: {
        success: true,
        orderDetails: {
          servicePlan: "Monthly Service",
          name: "John Doe",
          address: "123 Main St, Parma, OH",
          dayOfPickup: "Monday",
          timeOfPickup: "Morning",
          amount: 30,
        },
      },
    });

    // Check if the order details are displayed
    cy.contains("Order Confirmed!").should("be.visible");
    cy.contains("Monthly Service").should("be.visible");
    cy.contains("John Doe").should("be.visible");
    cy.contains("123 Main St, Parma, OH").should("be.visible");
    cy.contains("Monday, Morning").should("be.visible");
    cy.contains("$30").should("be.visible");
  });

  it("should handle order cancellation", () => {
    cy.visit("/success?session_id=123");

    // Mock the API response for order details
    cy.intercept("GET", "/api/order-details?session_id=123", {
      statusCode: 200,
      body: {
        success: true,
        orderDetails: {
          servicePlan: "Monthly Service",
          name: "John Doe",
          address: "123 Main St, Parma, OH",
          dayOfPickup: "Monday",
          timeOfPickup: "Morning",
          amount: 30,
        },
      },
    });

    // Mock the API response for order cancellation
    cy.intercept("POST", "/api/cancel-order", {
      statusCode: 200,
      body: {
        success: true,
      },
    });

    // Click the "Cancel Order" button
    cy.contains("Cancel Order").click();

    // Check if the confirmation dialog is displayed
    cy.contains("Cancel your order?").should("be.visible");

    // Confirm the cancellation
    cy.contains("Yes, cancel my order").click();

    // Check if the user is redirected to the cancel page
    cy.url().should("include", "/cancel?refunded=true");
  });
});
