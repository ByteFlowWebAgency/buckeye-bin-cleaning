const Section = ({ children, className = "", bgColor = "bg-white", id }) => {
    const backgroundClass = bgColor === "none" ? "" : bgColor;
  
    return (
      <section id={id} className={`py-10 ${backgroundClass} ${className}`}>
        <div className="container mx-auto px-2 max-w-6xl">{children}</div>
      </section>
    );
  };
  
  export default Section;