"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import {
  Trophy, Search, Eye, Trash2, X, CheckCircle, XCircle,
  Loader2, ChevronLeft, ChevronRight, Award, Star, Shield,
} from "lucide-react";
import { achievementService } from "@/services/portfolio.service";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { mapAchievementType, mapAchievementLevel } from "@/lib/mappers";
import type { ApiAchievement, AchievementType, AchievementLevel } from "@/lib/types";

type ModalMode = "view" | "delete" | null;
type FilterType = "all" | AchievementType;
type FilterLevel = "all" | AchievementLevel;
const PAGE_SIZE = 12;

// ─── Type badge color map ─────────────────────────────────────
const TYPE_STYLE: Record<AchievementType, { bg: string; color: string }> = {
  AKADEMIK:     { bg: "#e0f2fe", color: "#0369a1" },
  ORGANISASI:   { bg: "#dcfce7", color: "#15803d" },
  NON_AKADEMIK: { bg: "#fef3c7", color: "#b45309" },
};

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)", borderTop: `3px solid ${accent}`, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: 42, height: 42, background: `${accent}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={accent} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAchievementsPage() {
  const { setSidebarOpen } = useAdmin();

  const [achievements, setAchievements] = useState<ApiAchievement[]>([]);
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter]   = useState<FilterType>("all");
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("all");
  const [verifyFilter, setVerifyFilter] = useState<"all" | "verified" | "unverified">("all");
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState<ModalMode>(null);
  const [selected, setSelected]   = useState<ApiAchievement | null>(null);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await achievementService.getAll();
      setAchievements(data);
    } catch {
      toast.error("Gagal memuat data prestasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return achievements.filter(a => {
      const studentName = a.student?.user ? `${a.student.user.firstName} ${a.student.user.lastName}`.toLowerCase() : "";
      const matchSearch  = a.title.toLowerCase().includes(q) || studentName.includes(q) || a.organizer.toLowerCase().includes(q);
      const matchType    = typeFilter === "all" || a.type === typeFilter;
      const matchLevel   = levelFilter === "all" || a.level === levelFilter;
      const matchVerify  = verifyFilter === "all" || (verifyFilter === "verified" ? a.isVerified : !a.isVerified);
      return matchSearch && matchType && matchLevel && matchVerify;
    });
  }, [search, typeFilter, levelFilter, verifyFilter, achievements]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, typeFilter, levelFilter, verifyFilter]);

  const verifiedCount   = achievements.filter(a => a.isVerified).length;
  const unverifiedCount = achievements.filter(a => !a.isVerified).length;

  // ── Toggle verify ──────────────────────────────────────────
  async function handleToggleVerify(a: ApiAchievement) {
    setActionLoading(true);
    try {
      const updated = await achievementService.update(a.id, { isVerified: !a.isVerified });
      setAchievements(prev => prev.map(x => x.id === updated.id ? updated : x));
      if (modal === "view" && selected?.id === a.id) setSelected(updated);
      toast.success(updated.isVerified ? "Prestasi berhasil diverifikasi!" : "Verifikasi berhasil dicabut.");
    } catch {
      toast.error("Gagal mengubah status verifikasi.");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      await achievementService.remove(selected.id);
      setAchievements(prev => prev.filter(a => a.id !== selected.id));
      toast.success("Prestasi berhasil dihapus.");
      setModal(null);
    } catch {
      toast.error("Gagal menghapus prestasi.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Prestasi Siswa" subtitle="Verifikasi dan kelola prestasi seluruh siswa" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          <StatCard label="Total Prestasi"   value={loading ? "—" : achievements.length} icon={Trophy}   accent="var(--primary)" />
          <StatCard label="Terverifikasi"    value={loading ? "—" : verifiedCount}        icon={Shield}   accent="var(--success)" />
          <StatCard label="Belum Diverifikasi" value={loading ? "—" : unverifiedCount}   icon={Star}     accent="var(--warning)" />
          <StatCard label="Hasil Filter"     value={loading ? "—" : filtered.length}      icon={Search}   accent="#7C3AED" />
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", background: "linear-gradient(to right,#fafbfc,#fff)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari judul, nama siswa, atau penyelenggara..."
                className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} />
            </div>

            {/* Type filter */}
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as FilterType)}
              className="form-input" style={{ fontSize: 13, cursor: "pointer", minWidth: 130 }}>
              <option value="all">Semua Tipe</option>
              <option value="AKADEMIK">Akademik</option>
              <option value="ORGANISASI">Organisasi</option>
              <option value="NON_AKADEMIK">Non-Akademik</option>
            </select>

            {/* Level filter */}
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value as FilterLevel)}
              className="form-input" style={{ fontSize: 13, cursor: "pointer", minWidth: 130 }}>
              <option value="all">Semua Level</option>
              <option value="SEKOLAH">Sekolah</option>
              <option value="KABUPATEN">Kabupaten</option>
              <option value="PROVINSI">Provinsi</option>
              <option value="NASIONAL">Nasional</option>
              <option value="INTERNASIONAL">Internasional</option>
            </select>

            {/* Verify filter */}
            <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {([["all","Semua"],["unverified","Belum"],["verified","Terverifikasi"]] as const).map(([v, lbl]) => (
                <button key={v} onClick={() => setVerifyFilter(v)} style={{
                  padding: "5px 12px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: verifyFilter === v ? "#fff" : "transparent",
                  color: verifyFilter === v ? "var(--primary)" : "var(--text-muted)",
                  border: verifyFilter === v ? "1px solid var(--border)" : "none",
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Info bar */}
          <div style={{ padding: "7px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> prestasi
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Prestasi", "Siswa", "Tipe", "Level", "Tanggal", "Status", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)" }}>
                      <Loader2 size={20} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                      <span>Memuat data prestasi...</span>
                    </div>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <Trophy size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .25 }} />
                    <p style={{ fontWeight: 600 }}>Tidak ada prestasi ditemukan</p>
                  </td></tr>
                ) : paginated.map((a, idx) => {
                  const isEven = idx % 2 === 0;
                  const studentName = a.student?.user ? `${a.student.user.firstName} ${a.student.user.lastName}` : "—";
                  const ts = TYPE_STYLE[a.type];
                  return (
                    <tr key={a.id} style={{ background: isEven ? "#fff" : "#fafbfc", borderBottom: "1px solid var(--border)", transition: "background .12s" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-light)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isEven ? "#fff" : "#fafbfc")}>
                      <td style={{ padding: "12px 16px", maxWidth: 220 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: ts.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Trophy size={16} color={ts.color} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{a.title}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.organizer}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{studentName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.student?.nis ?? ""}</p>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: ts.bg, color: ts.color, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{mapAchievementType(a.type)}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#f1f5f9", color: "var(--text-muted)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{mapAchievementLevel(a.level)}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {a.date ? a.date.split("T")[0] : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {a.isVerified ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--success-light)", color: "#065f46", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                            <CheckCircle size={10} /> Terverifikasi
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#92400e", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                            <XCircle size={10} /> Belum
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => { setSelected(a); setModal("view"); }} title="Detail" style={actionBtn}><Eye size={13} /></button>
                          <button
                            onClick={() => handleToggleVerify(a)}
                            disabled={actionLoading}
                            title={a.isVerified ? "Cabut verifikasi" : "Verifikasi"}
                            style={{ ...actionBtn, color: a.isVerified ? "var(--warning)" : "var(--success)" }}>
                            {a.isVerified ? <XCircle size={13} /> : <CheckCircle size={13} />}
                          </button>
                          <button onClick={() => { setSelected(a); setModal("delete"); }} title="Hapus" style={{ ...actionBtn, color: "var(--danger)" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafbfc" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong></span>
              <div style={{ display: "flex", gap: 4 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...pageBtn, opacity: page === 1 ? .4 : 1 }}><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return <button key={p} onClick={() => setPage(p)} style={{ ...pageBtn, background: p === page ? "var(--primary)" : "#fff", color: p === page ? "#fff" : "var(--text-body)", fontWeight: p === page ? 700 : 500 }}>{p}</button>;
                })}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ ...pageBtn, opacity: page === totalPages ? .4 : 1 }}><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: View Detail ─────────────────────────────────── */}
      {modal === "view" && selected && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ height: 5, background: `linear-gradient(90deg, ${TYPE_STYLE[selected.type].color}, var(--primary))`, borderRadius: "12px 12px 0 0" }} />
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, background: TYPE_STYLE[selected.type].bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trophy size={22} color={TYPE_STYLE[selected.type].color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{selected.title}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{selected.organizer}</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  ["Siswa",   selected.student?.user ? `${selected.student.user.firstName} ${selected.student.user.lastName}` : "—"],
                  ["NIS",     selected.student?.nis ?? "—"],
                  ["Tipe",    mapAchievementType(selected.type)],
                  ["Level",   mapAchievementLevel(selected.level)],
                  ["Posisi",  selected.position],
                  ["Tanggal", selected.date ? selected.date.split("T")[0] : "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{lbl}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{val}</p>
                  </div>
                ))}
              </div>

              {selected.description && (
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 4 }}>Deskripsi</p>
                  <p style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.6 }}>{selected.description}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleToggleVerify(selected)}
                  disabled={actionLoading}
                  className={selected.isVerified ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {actionLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : selected.isVerified ? <XCircle size={13} /> : <Award size={13} />}
                  {selected.isVerified ? "Cabut Verifikasi" : "Verifikasi Prestasi"}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setModal(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete ──────────────────────────────────────── */}
      {modal === "delete" && selected && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div style={{ ...modalBox, maxWidth: 400, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={26} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Prestasi?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              <strong>{selected.title}</strong> milik {selected.student?.user ? `${selected.student.user.firstName} ${selected.student.user.lastName}` : "siswa ini"} akan dihapus permanen.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} disabled={actionLoading} onClick={handleDelete}>
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                {actionLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalBox: React.CSSProperties = { width: "100%", maxWidth: 500, background: "#fff", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,.18)", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" };
const actionBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "background .12s" };
const pageBtn: React.CSSProperties = { minWidth: 32, height: 32, borderRadius: 6, border: "1px solid var(--border)", background: "#fff", color: "var(--text-body)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
