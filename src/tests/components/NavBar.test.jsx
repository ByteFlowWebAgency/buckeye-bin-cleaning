import { render, screen, fireEvent } from "@testing-library/react";

import Navbar from "@/components/nav/Navbar";

describe("Navbar", () => {
  it("renders the Navbar correctly", () => {
    render(<Navbar />);

    // Check if the logo is rendered
    expect(screen.getByAltText("Buckeye Bin Cleaning Logo")).toBeInTheDocument();

    // Check if the menu button is rendered
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();

    // Check if the desktop navigation links are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Process")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("toggles the mobile menu", () => {
    render(<Navbar />);

    // Check if the mobile menu is initially closed
    expect(screen.queryByText("Home", { selector: "button.text-2xl" })).not.toBeInTheDocument();

    // Open the mobile menu
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    // Check if the mobile menu is open
    expect(screen.getByText("Home", { selector: "button.text-2xl" })).toBeInTheDocument();
    expect(screen.getByText("Process", { selector: "button.text-2xl" })).toBeInTheDocument();
    expect(screen.getByText("Services", { selector: "button.text-2xl" })).toBeInTheDocument();
    expect(screen.getByText("About Us", { selector: "button.text-2xl" })).toBeInTheDocument();
    expect(screen.getByText("Contact Us", { selector: "button.text-2xl" })).toBeInTheDocument();

    // Close the mobile menu
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    // Check if the mobile menu is closed
    expect(screen.queryByText("Home", { selector: "button.text-2xl" })).not.toBeInTheDocument();
  });

  it("scrolls to sections when links are clicked", () => {
    render(<Navbar />);

    // Mock the scrollIntoView function
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    // Click on the "Home" link
    fireEvent.click(screen.getByText("Home"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "Process" link
    fireEvent.click(screen.getByText("Process"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "Services" link
    fireEvent.click(screen.getByText("Services"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "About Us" link
    fireEvent.click(screen.getByText("About Us"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "Contact Us" link
    fireEvent.click(screen.getByText("Contact Us"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });
});