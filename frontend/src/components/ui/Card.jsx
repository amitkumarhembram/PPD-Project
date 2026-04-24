const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-outline-variant/30 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
