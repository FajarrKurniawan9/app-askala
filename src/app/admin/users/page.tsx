"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import {
  Users, Search, Eye, Trash2, X, Loader2,
  ShieldCheck, GraduationCap, UserRound,
  ChevronLeft, ChevronRight, Mail, Phone, Calendar,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import type { ApiUser, Role } from "@/lib/types";

type ModalMode = "view" | "delete" | null;
type FilterRole = "all" | "ADMIN" | "STUDENT" | "PARENT" | "TEACHER";
const PAGE_SIZE = 12;

// Swagger menunjukkan backend juga punya role TEACHER
const ROLE_CFG: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  ADMIN:   { label: "Admin",     bg: "#fee2e2", color: "#dc2626", icon: ShieldCheck },
  STUDENT: { label: "Siswa",     bg: "#e0f2fe", color: "#0369a1", icon: GraduationCap },
  PARENT:  { label: "Orang Tua", bg: "#dcfce7", color: "#15803d", icon: UserRound },
  TEACHER: { label: "Guru",      bg: "#fef3c7", color: "#b45309", icon: ShieldCheck },
};

function UserAvatar({ name, role, size = 36 }: { name: string; role: string; size?: number }) {
  const cfg = ROLE_CFG[role] ?? ROLE_CFG["STUDENT"];
  const { color, bg } = cfg;
  const initials = name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, fontWeight: 800, fontSize: size * 0.3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${color}20` }}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) {
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

export default function UsersPage() {
  const { setSidebarOpen } = useAdmin();

  const [users, setUsers]         = useState<ApiUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState<ModalMode>(null);
  const [selected, setSelected]   = useState<ApiUser | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      toast.error("Gagal memuat data user.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchSearch = name.includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [search, roleFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const adminCount   = users.filter(u => u.role === "ADMIN").length;
  const studentCount = users.filter(u => u.role === "STUDENT").length;
  const parentCount  = users.filter(u => u.role === "PARENT").length;

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await userService.remove(selected.id);
      setUsers(prev => prev.filter(u => u.id !== selected.id));
      toast.success("Akun user berhasil dihapus.");
      setModal(null);
    } catch {
      toast.error("Gagal menghapus akun. Mungkin ada data terkait yang harus dihapus terlebih dahulu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Manajemen User" subtitle="Kelola semua akun yang terdaftar di sistem" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          <StatCard label="Total User"   value={loading ? "—" : users.length}    icon={Users}         accent="var(--primary)" />
          <StatCard label="Admin"        value={loading ? "—" : adminCount}       icon={ShieldCheck}   accent="var(--danger)" />
          <StatCard label="Siswa"        value={loading ? "—" : studentCount}     icon={GraduationCap} accent="#0369a1" />
          <StatCard label="Orang Tua"    value={loading ? "—" : parentCount}      icon={UserRound}     accent="var(--success)" />
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", background: "linear-gradient(to right,#fafbfc,#fff)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau email..." className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {([["all","Semua"],["ADMIN","Admin"],["STUDENT","Siswa"],["PARENT","Orang Tua"]] as [FilterRole, string][]).map(([v, lbl]) => (
                <button key={v} onClick={() => setRoleFilter(v)} style={{
                  padding: "5px 12px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: roleFilter === v ? "#fff" : "transparent",
                  color: roleFilter === v ? "var(--primary)" : "var(--text-muted)",
                  border: roleFilter === v ? "1px solid var(--border)" : "none",
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: "7px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> user</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["User", "Email", "Role", "No. HP", "Bergabung", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)" }}>
                      <Loader2 size={20} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} /><span>Memuat data user...</span>
                    </div>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <Users size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .25 }} />
                    <p style={{ fontWeight: 600 }}>Tidak ada user ditemukan</p>
                  </td></tr>
                ) : paginated.map((u, idx) => {
                  const name = `${u.firstName} ${u.lastName}`.trim();
                  const cfg = ROLE_CFG[u.role] ?? ROLE_CFG["STUDENT"];
                  const isEven = idx % 2 === 0;
                  return (
                    <tr key={u.id} style={{ background: isEven ? "#fff" : "#fafbfc", borderBottom: "1px solid var(--border)", transition: "background .12s" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-light)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isEven ? "#fff" : "#fafbfc")}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <UserAvatar name={name} role={u.role} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{name}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>ID #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <cfg.icon size={10} /> {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{u.phone || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => { setSelected(u); setModal("view"); }} title="Detail" style={actionBtn}><Eye size={13} /></button>
                          <button onClick={() => { setSelected(u); setModal("delete"); }} title="Hapus" style={{ ...actionBtn, color: "var(--danger)" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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

      {/* View Modal */}
      {modal === "view" && selected && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div style={{ ...modalBox, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 5, background: `linear-gradient(90deg, ${ROLE_CFG[selected.role].color}, var(--primary))`, borderRadius: "12px 12px 0 0" }} />
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <UserAvatar name={`${selected.firstName} ${selected.lastName}`} role={selected.role} size={56} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{selected.firstName} {selected.lastName}</h3>
                  <span style={{ background: ROLE_CFG[selected.role].bg, color: ROLE_CFG[selected.role].color, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600, marginTop: 4, display: "inline-block" }}>{ROLE_CFG[selected.role].label}</span>
                </div>
                <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: Mail,     label: "Email",     value: selected.email },
                  { icon: Phone,    label: "No. HP",    value: selected.phone || "Belum diisi" },
                  { icon: Calendar, label: "Bergabung", value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: "flex", gap: 10, alignItems: "center", background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
                    <Icon size={14} color="var(--primary)" />
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)" }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 20, width: "100%", justifyContent: "center" }} onClick={() => setModal(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && selected && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div style={{ ...modalBox, maxWidth: 400, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={26} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Akun?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}>
              Akun <strong>{selected.firstName} {selected.lastName}</strong> ({selected.email}) akan dihapus permanen.
            </p>
            <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 24 }}>
              ⚠️ Semua profil terkait (student/parent) dan datanya akan ikut terhapus secara cascade.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} disabled={saving} onClick={handleDelete}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                {saving ? "Menghapus..." : "Ya, Hapus"}
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
const actionBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" };
const pageBtn: React.CSSProperties = { minWidth: 32, height: 32, borderRadius: 6, border: "1px solid var(--border)", background: "#fff", color: "var(--text-body)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
