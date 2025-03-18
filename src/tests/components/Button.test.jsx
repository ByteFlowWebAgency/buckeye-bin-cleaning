import { render, screen } from "@testing-library/react";

import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders a button with default props", () => {
    render(<Button>Click Me</Button>);

    // Check if the button is rendered with default props
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-[#EB2323]"); // primary variant
    expect(button).toHaveClass("px-6 py-2"); // md size
    expect(button).toHaveClass("text-white"); // primary variant
    expect(button).toHaveClass("rounded-lg"); // baseStyles
  });

  it("renders a button with custom variant and size", () => {
    render(
      <Button variant="secondary" size="lg">
        Click Me
      </Button>
    );

    // Check if the button is rendered with custom variant and size
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("border-2 border-[#1E2875]"); // secondary variant
    expect(button).toHaveClass("px-8 py-3 text-lg"); // lg size
  });

  it("renders a button with custom className", () => {
    render(<Button className="custom-class">Click Me</Button>);

    // Check if the button is rendered with custom className
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("custom-class");
  });

  it("renders a link when href is provided", () => {
    render(<Button href="/about">Click Me</Button>);

    // Check if the link is rendered
    const link = screen.getByRole("link", { name: "Click Me" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
    expect(link).toHaveClass("bg-[#EB2323]"); // primary variant
    expect(link).toHaveClass("px-6 py-2"); // md size
  });

  it("renders a button with white variant", () => {
    render(<Button variant="white">Click Me</Button>);

    // Check if the button is rendered with white variant
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-transparent border-2 border-white"); // white variant
    expect(button).toHaveClass("text-white"); // white variant
  });

  it("renders a button with sm size", () => {
    render(<Button size="sm">Click Me</Button>);

    // Check if the button is rendered with sm size
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("px-4 py-2 text-sm"); // sm size
  });
});