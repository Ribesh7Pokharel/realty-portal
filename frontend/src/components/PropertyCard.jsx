import { useState } from "react";
import { api } from "../api";

function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}

export default function PropertyCard({ property, onFavouriteChange, showToast }) {
  const [loading, setLoading] = useState(false);
  const [isFav, setIsFav] = useState(!!property.is_favourite);

  async function toggleFavourite() {
    if (loading) return;
    setLoading(true);
    try {
      if (isFav) {
        await api.removeFavourite(property.id);
        setIsFav(false);
        showToast("Removed from favourites", "default");
      } else {
        await api.addFavourite(property.id);
        setIsFav(true);
        showToast("Added to favourites ✦", "success");
      }
      onFavouriteChange?.();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.imageWrap}>
        <img
          src={property.image_url}
          alt={property.title}
          style={styles.image}
          onError={(e) => (e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600")}
        />
        <button
          onClick={toggleFavourite}
          disabled={loading}
          style={{ ...styles.heartBtn, color: isFav ? "#c9a84c" : "#fff" }}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>
      <div style={styles.body}>
        <div style={styles.price}>{formatPrice(property.price)}</div>
        <h3 style={styles.title}>{property.title}</h3>
        <p style={styles.address}>📍 {property.address}</p>
        <div style={styles.meta}>
          <span>🛏 {property.bedrooms} bed</span>
          <span>🚿 {property.bathrooms} bath</span>
          <span>📐 {property.area_sqft.toLocaleString()} sqft</span>
        </div>
        {property.description && <p style={styles.desc}>{property.description}</p>}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 2px 16px rgba(26,23,20,0.07)",
    border: "1px solid #e0d9d0",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
  },
  imageWrap: { position: "relative", height: 200, overflow: "hidden", flexShrink: 0 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(26,23,20,0.45)",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(4px)",
  },
  body: { padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  price: { fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "#1a1714" },
  title: { fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 600, color: "#1a1714" },
  address: { fontSize: 13, color: "#6b6560" },
  meta: { display: "flex", gap: 16, fontSize: 13, color: "#4a4540", fontWeight: 500, flexWrap: "wrap" },
  desc: { fontSize: 13, color: "#6b6560", lineHeight: 1.6, marginTop: 4 },
};
