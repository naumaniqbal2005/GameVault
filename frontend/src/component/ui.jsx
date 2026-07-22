import "./ui_style.css";

function Card({ style, shadowColor = "black", color = "white", ...props }) {
  return (
    <div
      className="card"
      style={{
        ...style,
        boxShadow: `5px 5px 0px 0px ${shadowColor}`,
        background: color,
        height: "100px",
        width: "100px",
        borderRadius: "12px", // camelCase
        padding: "20px",      // values as strings
      }}
      {...props}
    />
  );
}

export { Card };
