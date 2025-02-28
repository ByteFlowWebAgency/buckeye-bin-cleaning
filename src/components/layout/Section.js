const Section = ({ children, className = "", id }) => {
  return (
    <section id={id} className={`py-10 ${className}`}>
      <div className="container mx-auto px-2 max-w-7xl">{children}</div>
    </section>
  );
};

export default Section;
