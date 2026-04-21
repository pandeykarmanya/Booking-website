import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

// ── helpers ──────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

const statusColor = (s) =>
  s === "confirmed" ? "#166534" : s === "cancelled" ? "#991b1b" : "#92400e";

const statusBg = (s) =>
  s === "confirmed" ? "#dcfce7" : s === "cancelled" ? "#fee2e2" : "#fef3c7";

// ─────────────────────────────────────────────
// BookingFilterDownload
// ─────────────────────────────────────────────
const BookingFilterDownload = () => {
  const [filter, setFilter]       = useState("today");   // "today" | "custom"
  const [from, setFrom]           = useState(today());
  const [to, setTo]               = useState(today());
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError]         = useState("");
  const [fetched, setFetched]     = useState(false);

  // Build query params
  const buildParams = () =>
    filter === "today"
      ? "filter=today"
      : `filter=custom&from=${from}&to=${to}`;

  // Fetch bookings preview
  const handleFetch = async () => {
    setError("");
    if (filter === "custom" && from > to) {
      return setError("'From' date cannot be after 'To' date.");
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/bookings?${buildParams()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // ✅ Safe fallback in handleFetch
setBookings(data.data?.bookings || data.data || data.bookings || []);
      setFetched(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (filter === "custom" && from > to) {
      return setError("'From' date cannot be after 'To' date.");
    }
    setPdfLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API}/admin/bookings/download-pdf?${buildParams()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute(
        "download",
        `bookings-${filter === "today" ? "today" : `${from}_to_${to}`}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("PDF download failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>

      {/* ── Filter Card ── */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Booking Report</h2>

        {/* Filter type tabs */}
        <div style={styles.tabs}>
          {["today", "custom"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setFetched(false); setBookings([]); }}
              style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}
            >
              {f === "today" ? "Today's Bookings" : "Custom Date Range"}
            </button>
          ))}
        </div>

        {/* Date pickers — only for custom */}
        {filter === "custom" && (
          <div style={styles.dateRow}>
            <div style={styles.dateField}>
              <label style={styles.label}>From</label>
              <input
                type="date"
                value={from}
                max={today()}
                onChange={(e) => { setFrom(e.target.value); setFetched(false); }}
                style={styles.dateInput}
              />
            </div>
            <div style={styles.dateField}>
              <label style={styles.label}>To</label>
              <input
                type="date"
                value={to}
                max={today()}
                onChange={(e) => { setTo(e.target.value); setFetched(false); }}
                style={styles.dateInput}
              />
            </div>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {/* Action buttons */}
        <div style={styles.btnRow}>
          <button onClick={handleFetch} disabled={loading} style={styles.btnOutline}>
            {loading ? "Loading…" : "Preview Bookings"}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            style={styles.btnPrimary}
          >
            {pdfLoading ? (
              "Generating PDF…"
            ) : (
              <>
                <DownloadIcon />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Preview Table ── */}
      {fetched && (
        <div style={styles.card}>
          <div style={styles.tableHeader}>
            <span style={styles.tableTitle}>
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </span>
            {bookings.length > 0 && (
              <span style={styles.tableSub}>
                {filter === "today"
                  ? `Today — ${formatDate(new Date())}`
                  : `${formatDate(from)} → ${formatDate(to)}`}
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <div style={styles.empty}>
              <EmptyIcon />
              <p>No bookings found for this period.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Venue</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b._id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                      
                      {/* DATE */}
                      <td style={styles.td}>
                        {formatDate(b.date || b.Date)}
                      </td>
                
                      {/* USER */}
                      <td style={styles.td}>
                        {b.userId?.name || b.user?.name || b.studentName || "N/A"}
                      </td>
                
                      {/* VENUE */}
                      <td style={styles.td}>
                        {b.venueId?.name || b.venue?.name || b.venueName || "N/A"}
                      </td>
                
                      {/* TIME */}
                      <td style={styles.td}>
                        {b.startTime && b.endTime
                          ? `${b.startTime} - ${b.endTime}`
                          : b.timeSlot || "N/A"}
                      </td>
                
                      {/* STATUS */}
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            color: statusColor(b.status),
                            background: statusBg(b.status),
                          }}
                        >
                          {b.status || "pending"}
                        </span>
                      </td>
                
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Inline styles ──────────────────────────────
const styles = {
  wrapper:   { display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'DM Sans', sans-serif" },
  card:      { background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #f0e4e7" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#7a1c2e", margin: "0 0 18px" },

  tabs:      { display: "flex", gap: "8px", marginBottom: "18px" },
  tab:       { padding: "8px 18px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" },
  tabActive: { background: "#7a1c2e", color: "#fff", border: "1.5px solid #7a1c2e" },

  dateRow:   { display: "flex", gap: "16px", marginBottom: "18px", flexWrap: "wrap" },
  dateField: { display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: "160px" },
  label:     { fontSize: "13px", fontWeight: "600", color: "#374151" },
  dateInput: { padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "14px", color: "#1a1a2e", outline: "none", cursor: "pointer" },

  error:     { background: "#fee2e2", color: "#991b1b", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", marginBottom: "14px" },

  btnRow:    { display: "flex", gap: "12px", flexWrap: "wrap" },
  btnOutline: { padding: "10px 22px", borderRadius: "8px", border: "1.5px solid #7a1c2e", background: "#fff", color: "#7a1c2e", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  btnPrimary: { padding: "10px 22px", borderRadius: "8px", border: "none", background: "#7a1c2e", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },

  tableHeader: { display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px" },
  tableTitle:  { fontSize: "15px", fontWeight: "700", color: "#1a1a2e" },
  tableSub:    { fontSize: "12px", color: "#9ca3af" },

  empty: { textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" },

  table: { width: "100%", borderCollapse: "collapse", fontSize: "13.5px" },
  thead: { background: "#fdf2f4" },
  th:    { padding: "10px 14px", textAlign: "left", color: "#7a1c2e", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" },
  td:    { padding: "11px 14px", color: "#374151", borderBottom: "1px solid #f3f4f6" },
  trEven: { background: "#fff" },
  trOdd:  { background: "#fdfcfc" },

  bookingId: { fontFamily: "monospace", fontSize: "12px", background: "#f3e8eb", color: "#7a1c2e", padding: "2px 8px", borderRadius: "4px" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11.5px", fontWeight: "600", textTransform: "capitalize" },
};

// ── Mini icons ──────────────────────────────────
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block" }}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>
);

export default BookingFilterDownload;