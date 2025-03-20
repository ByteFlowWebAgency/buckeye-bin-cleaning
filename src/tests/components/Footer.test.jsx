import { render, screen } from "@testing-library/react";

import Footer from "@/components/nav/Footer";

describe("Footer", () => {
  it("renders the Footer correctly", () => {
    render(<Footer />);

    // Check if the logo is rendered
    expect(screen.getByAltText("Buckeye Bin Cleaning Logo")).toBeInTheDocument();

    // Check if the quick links are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Process")).toBeInTheDocument();
    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();

    // Check if the contact information is rendered
    expect(screen.getByText("Tel: 440-781-5527")).toBeInTheDocument();
    expect(screen.getByText("Mail: Buckeyebincleaning@gmail.com")).toBeInTheDocument();

    // Check if the social media icon is rendered
    expect(screen.getByAltText("Facebook icon")).toBeInTheDocument();

    // Check if the footer text is rendered
    expect(screen.getByText("Terms of Use | Created By BYTEFLOW")).toBeInTheDocument();
    expect(screen.getByText("© 2025 | Buckeye Bin Cleaning | All Rights Reserved")).toBeInTheDocument();
  });

  it("scrolls to sections when links are clicked", () => {
    render(<Footer />);

    // Mock the scrollIntoView function
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    // Click on the "Home" link
    fireEvent.click(screen.getByText("Home"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "Process" link
    fireEvent.click(screen.getByText("Process"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "Service" link
    fireEvent.click(screen.getByText("Service"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "About Us" link
    fireEvent.click(screen.getByText("About Us"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    // Click on the "Contact Us" link
    fireEvent.click(screen.getByText("Contact Us"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });
});