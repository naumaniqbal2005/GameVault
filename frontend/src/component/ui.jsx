import "./ui_style.css";

function Card({ style, shadowColor = "black", color = "white", height = "60px", width = "500px", ...props }) {
  return (
    <div
      style={{
        ...style,
        boxShadow: `5px 5px 0px 0px ${shadowColor}`,
        background: color,
        height,
        width,
        borderRadius: "12px", // camelCase
        padding: "20px",      // values as strings
        border : "2px solid black"
      }}
      {...props}
    />
  );
}

export { Card };
