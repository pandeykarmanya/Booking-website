const CollegeHeader = ({ logoSrc }) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#7a1c2e",
      padding: "10px 20px",
      gap: "16px",
    }}>

      <img
        src={logoSrc}
        alt="ITS Logo"
        style={{
          flexShrink: 0,
          height: "60px",
          width: "60px",
          borderRadius: "50%",
          objectFit: "contain",
          background: "#fff",
          border: "2px solid rgba(255,255,255,0.6)",
          padding: "2px",
        }}
      />

        <h1 style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#fff",
          margin: 0,
        }}>
          Enjoy your fast booking experience!
        </h1>

    </div>
  );
};

export default CollegeHeader;