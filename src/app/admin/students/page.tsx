"use client";
import { useState, useMemo, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAuthStore } from "@/store/authStore";
import {
  Users, Plus, Search, Eye, Edit2, Trash2,
  X, CheckCircle, UserPlus, Download, Trophy,
  BookOpen, Award, Calendar, ExternalLink,
} from "lucide-react";
import { studentService } from "@/services/student.service";
import { toast } from "sonner";
import type { ApiStudent } from "@/lib/types";

type ModalMode = "add" | "edit" | "view" | "delete" | "portfolio" | null;

const CAT_COLOR: Record<string, string> = {
  Akademik: "badge-primary", Organisasi: "badge-success",
  "Non-Akademik": "badge-warning", Olahraga: "badge-danger", Seni: "badge-warning",
};

function Avatar({ name, bg = "var(--primary)", color = "#fff", size = 36 }: { name: string; bg?: string; color?: string; size?: number }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function StudentsPage() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("Semua");
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<ApiStudent | null>(null);
  const [form, setForm] = useState({ nis: "", kelas: "X-IPA 1", jurusan: "IPA", address: "" });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const kelasOptions = useMemo(() => {
    return ["Semua", ...new Set(students.map(s => s.kelas))];
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        s.nis.includes(search) ||
        s.user?.email?.toLowerCase().includes(search.toLowerCase());
      const matchKelas = kelas === "Semua" || s.kelas === kelas;
      return matchSearch && matchKelas;
    });
  }, [search, kelas, students]);

  function openModal(mode: ModalMode, student?: ApiStudent) {
    setSelected(student ?? null);
    if (mode === "edit" && student) {
      setForm({ nis: student.nis, kelas: student.kelas, jurusan: student.jurusan ?? "IPA", address: student.address ?? "" });
    }
    if (mode === "add") {
      setForm({ nis: "", kelas: "X-IPA 1", jurusan: "IPA", address: "" });
    }
    setModal(mode);
  }

  function closeModal() { setModal(null); setSelected(null); }

  const handleDelete = async (id: string) => {
    try {
      await studentService.remove(id);
      toast.success("Siswa dihapus");
      setStudents(students.filter(s => s.id !== id));
      closeModal();
    } catch {
      toast.error("Gagal menghapus siswa");
    }
  };

  return (
    <>
      <Topbar title="Data Siswa" subtitle="Kelola data seluruh siswa aktif" role="admin" userName="Budi Santoso" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stat Summary ──────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14 }}>
          {[
            { label: "Total Siswa", value: students.length, cls: "", icon: Users },
            { label: "Siswa Terdata", value: students.length, cls: "card-stat-success", icon: CheckCircle },
            { label: "Loading", value: loading ? "..." : "Selesai", cls: "", icon: X },
            { label: "Total Kelas", value: kelasOptions.length - 1, cls: "", icon: Users },
          ].map(({ label, value, cls, icon: Icon }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                </div>
                <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ────────────────────────────────────── */}
        <div className="card">
          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, NIS, atau email..."
                className="form-input" style={{ paddingLeft: 36, fontSize: 13 }}
              />
            </div>

            {/* Kelas Filter */}
            <div style={{ position: "relative" }}>
              <select value={kelas} onChange={e => setKelas(e.target.value)}
                className="form-input" style={{ paddingRight: 32, fontSize: 13, cursor: "pointer", minWidth: 130 }}>
                {kelasOptions.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Download size={13} /> Export
              </button>
              <button onClick={() => openModal("add")} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <UserPlus size={14} /> Tambah Siswa
              </button>
            </div>
          </div>

          {/* Result count */}
          <div style={{ padding: "8px 20px", background: "#fafbfc", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan <strong>{filtered.length}</strong> dari <strong>{students.length}</strong> siswa</span>
          </div>

          {/* Table */}
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Siswa</th><th>NIS</th><th>Kelas</th><th>Jurusan</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    Memuat data...
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <Users size={32} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                    Tidak ada siswa yang ditemukan
                  </td></tr>
                ) : filtered.map(s => {
                  const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim() || "N/A";
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={name} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{name}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.user?.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{s.nis}</td>
                      <td><span className="badge badge-primary">{s.kelas}</span></td>
                      <td><span className="badge badge-gray">{s.jurusan || "N/A"}</span></td>
                      <td>
                        <span className="badge badge-success"><CheckCircle size={10} />Aktif</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button onClick={() => openModal("view", s)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }} title="Lihat Detail"><Eye size={13} /></button>
                          <button onClick={() => openModal("edit", s)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }} title="Edit"><Edit2 size={13} /></button>
                          <button onClick={() => openModal("delete", s)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }} title="Hapus"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination (UI only) */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Halaman 1 dari 125</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,"...",125].map((p, i) => (
                <button key={i} style={{
                  minWidth: 32, height: 32, borderRadius: 6, border: "1px solid var(--border)",
                  background: p === 1 ? "var(--primary)" : "#fff",
                  color: p === 1 ? "#fff" : "var(--text-body)", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Modals ──────────────────────────────────────────────── */}

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div style={overlayStyle} onClick={closeModal}>
          <div className="card" style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{modal === "add" ? "Tambah Siswa Baru" : "Edit Data Siswa"}</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Lengkapi formulir di bawah ini</p>
              </div>
              <button onClick={closeModal} style={closeBtn}><X size={18} /></button>
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={e => { e.preventDefault(); closeModal(); }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">NIS *</label>
                  <input className="form-input" value={form.nis} onChange={e => setForm(f => ({ ...f, nis: e.target.value }))} placeholder="2024001001" required />
                </div>
                <div>
                  <label className="form-label">Kelas *</label>
                  <select className="form-input" value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))}>
                    {kelasOptions.filter(k => k !== "Semua").map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Jurusan</label>
                  <select className="form-input" value={form.jurusan} onChange={e => setForm(f => ({ ...f, jurusan: e.target.value }))}>
                    <option>IPA</option><option>IPS</option><option>Bahasa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Alamat</label>
                <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Jl. Contoh No. 1, Kota" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  <Plus size={14} /> {modal === "add" ? "Tambah Siswa" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {modal === "view" && selected && (
        <div style={overlayStyle} onClick={closeModal}>
          <div className="card" style={{ ...modalStyle, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Detail Siswa</h3>
              <button onClick={closeModal} style={closeBtn}><X size={18} /></button>
            </div>
            {selected.user && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
                  <Avatar name={`${selected.user.firstName} ${selected.user.lastName}`} size={56} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{selected.user.firstName} {selected.user.lastName}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.user.email}</p>
                    <span className="badge badge-success" style={{ marginTop: 4 }}>Aktif</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    ["NIS", selected.nis],
                    ["Kelas", selected.kelas],
                    ["Jurusan", selected.jurusan || "—"],
                    ["No. HP", selected.user.phone || "—"],
                    ["Alamat", selected.address || "—"],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 2 }}>{lbl}</p>
                      <p style={{ fontSize: 14, color: "var(--text-primary)" }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn btn-outline" style={{ flex: 1, minWidth: 100 }} onClick={() => { setModal("edit"); setForm({ nis: selected.nis, kelas: selected.kelas, jurusan: selected.jurusan ?? "IPA", address: selected.address ?? "" }); }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="btn btn-ghost" style={{ padding: "10px 14px" }} onClick={closeModal}><X size={16} /></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Read-Only Modal - DISABLED */}
      {/*
      {modal === "portfolio" && selected && (
        // Portfolio functionality will be implemented in detail page
      )}
      */}

      {/* Delete Confirm Modal */}
      {modal === "delete" && selected && (
        <div style={overlayStyle} onClick={closeModal}>
          <div className="card" style={{ ...modalStyle, maxWidth: 420, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Siswa?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              Data <strong>{selected.name}</strong> (NIS: {selected.nis}) akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={closeModal}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modalStyle: React.CSSProperties = {
  width: "100%", maxWidth: 560, padding: 28, position: "relative",
  maxHeight: "90vh", overflowY: "auto",
};
const closeBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "var(--text-muted)", padding: 4, borderRadius: 6,
  display: "flex", alignItems: "center",
};
