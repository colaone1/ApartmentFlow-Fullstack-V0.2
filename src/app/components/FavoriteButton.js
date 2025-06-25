import { useEffect, useState } from "react";
export default function FavoriteButton({ apartmentId, isInitiallyFavorited, onClick }) {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);

  useEffect(() => {
    setIsFavorited(isInitiallyFavorited);
  }, [isInitiallyFavorited]);

  const handleClick = async () => {
    setIsFavorited(!isFavorited);
    if (onClick) await onClick(apartmentId);
  };

  return (
    <button onClick={handleClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: "1.5rem",
      }}>
      {isFavorited ? "💖" : "🤍"}
    </button>
  );
}
