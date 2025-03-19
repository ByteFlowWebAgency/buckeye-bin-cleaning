import Link from "next/link";

const variants = {
  primary: "bg-[#EB2323] text-white hover:bg-red-800",
  secondary: "border-2 border-[#1E2875] text-[#1E2875] hover:bg-red-50",
  white: "bg-transparent border-2 border-white text-white hover:bg-white/10",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2",
  lg: "px-8 py-3 text-lg",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg transition-colors font-medium focus:outline-none";

  const classes = `${ baseStyles } ${ variants[variant] } ${ sizes[size] } ${ className }`;

  if (href) {
    return (
      <Link href={ href } className={ classes } { ...props }>
        { children }
      </Link>
    );
  }

  return (
    <button className={ classes } { ...props }>
      { children }
    </button>
  );
};

Button.variants = variants;
Button.sizes = sizes;

export default Button;