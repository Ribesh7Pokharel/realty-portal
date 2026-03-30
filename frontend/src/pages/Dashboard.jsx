import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import PropertyCard from "../components/PropertyCard";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // "all" | "favourites"
  const { showToast, ToastEl } = useToast();

  const fetchProperties = useCallback(async () => {
    try {
      const data = await api.getProperties();
      setProperties(data.properties);
    } catch (err) {
      showToast("Failed to load properties.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const displayed = tab === "favourites"
    ? properties.filter((p) => p.is_favourite)
    : properties;

  const favCount = properties.filter((p) => p.is_favourite).length;

  return (
    <div style={styles.page}>
      <ToastEl />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>✦ Realty Portal</div>
          <div style={styles.userBar}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name}</span>
              <span style={styles.userRole}>{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Welcome bar */}
      <div style={styles.welcome}>
        <div style={styles.welcomeInner}>
          <h1 style={styles.welcomeTitle}>Welcome back, {user?.name?.split(" ")[0]}.</h1>
          <p style={styles.welcomeSub}>
            {favCount === 0
              ? "You haven't saved any properties yet. Start exploring below."
              : `You have ${favCount} saved propert${favCount === 1 ? "y" : "ies"}.`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <div style={styles.tabInner}>
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
            All Properties <Pill>{properties.length}</Pill>
          </TabBtn>
          <TabBtn active={tab === "favourites"} onClick={() => setTab("favourites")}>
            My Favourites <Pill gold>{favCount}</Pill>
          </TabBtn>
        </div>
      </div>

      {/* Grid */}
      <main style={styles.main}>
        {loading ? (
          <div style={styles.center}><div className="spinner" /></div>
        ) : displayed.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 48 }}>🏠</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", marginTop: 16 }}>
              {tab === "favourites" ? "No favourites yet" : "No properties found"}
            </h3>
            <p style={{ color: "#6b6560", marginTop: 8, fontSize: 14 }}>
              {tab === "favourites"
                ? "Click the heart on any property to save it here."
                : "Check back soon for new listings."}
            </p>
            {tab === "favourites" && (
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setTab("all")}>
                Browse Properties
              </button>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {displayed.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                showToast={showToast}
                onFavouriteChange={fetchProperties}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        border: "none",
        borderBottom: `2px solid ${active ? "#c9a84c" : "transparent"}`,
        background: "none",
        color: active ? "#1a1714" : "#6b6560",
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function Pill({ children, gold }) {
  return (
    <span style={{
      background: gold ? "#c9a84c20" : "#1a171410",
      color: gold ? "#9a7428" : "#4a4540",
      borderRadius: 100,
      padding: "1px 8px",
      fontSize: 12,
      fontWeight: 600,
    }}>
      {children}
    </span>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8f5f0" },
  header: {
    background: "#1a1714",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 0 rgba(255,255,255,0.05)",
  },
  headerInner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 32px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "Playfair Display, serif",
    fontSize: 18,
    color: "#c9a84c",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  userBar: { display: "flex", alignItems: "center", gap: 20 },
  userInfo: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  userName: { fontSize: 14, fontWeight: 600, color: "#f8f5f0" },
  userRole: {
    fontSize: 11,
    color: "#c9a84c",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 500,
  },
  welcome: {
    background: "#fff",
    borderBottom: "1px solid #e0d9d0",
    padding: "32px 0",
  },
  welcomeInner: { maxWidth: 1280, margin: "0 auto", padding: "0 32px" },
  welcomeTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: 32,
    color: "#1a1714",
    marginBottom: 8,
  },
  welcomeSub: { fontSize: 15, color: "#6b6560" },
  tabBar: {
    background: "#fff",
    borderBottom: "1px solid #e0d9d0",
    position: "sticky",
    top: 64,
    zIndex: 90,
  },
  tabInner: { maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 },
  main: { maxWidth: 1280, margin: "0 auto", padding: "40px 32px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 28,
  },
  center: { display: "flex", justifyContent: "center", padding: "80px 0" },
  empty: {
    textAlign: "center",
    padding: "80px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};
