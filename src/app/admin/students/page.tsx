"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import { useAuthStore } from "@/store/authStore";
import {
  Users, Plus, Search, Eye, Edit2, Trash2, X,
  CheckCircle, UserPlus, Download, Loader2,
  GraduationCap, MapPin, Phone, Mail, Hash,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { studentService } from "@/services/student.service";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import type { ApiStudent, ApiUser } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────
type ModalMode = "add" | "edit" | "view" | "delete" | null;

interface AddForm {
  // User fields
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  // Student fields
  nis: string;
  classRoom: string;
  major: string;
  grade: string;
  address: string;
}

interface EditForm {
  nis: string;
  classRoom: string;
  major: string;
  grade: string;
  address: string;
}

const GRADE_OPTIONS = ["X", "XI", "XII"];
const MAJOR_OPTIONS = ["IPA", "IPS", "Bahasa", "Teknik", "Bisnis"];
const PAGE_SIZE = 10;

// ─── Sub-components ───────────────────────────────────────────
function Avatar({ name, size = 36, avatarUrl }: { name: string; size?: number; avatarUrl?: string }) {
  const initials = name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colors = ["#027E74","#0891B2","#7C3AED","#D97706","#DC2626","#059669"];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return avatarUrl ? (
    <img src={avatarUrl} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, background: color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "18px 20px",
      border: "1px solid var(--border)", borderTop: `3px solid ${accent ?? "var(--primary)"}`,
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ width: 42, height: 42, background: `${accent ?? "var(--primary)"}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={accent ?? "var(--primary)"} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function StudentsPage() {
  const { setSidebarOpen } = useAdmin();
  const { user: authUser } = useAuthStore();

  const [students, setStudents]   = useState<ApiStudent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua");
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState<ModalMode>(null);
  const [selected, setSelected]   = useState<ApiStudent | null>(null);

  const emptyAdd: AddForm = { firstName: "", lastName: "", email: "", password: "", phone: "", nis: "", classRoom: "", major: "IPA", grade: "X", address: "" };
  const [addForm, setAddForm]     = useState<AddForm>(emptyAdd);
  const [editForm, setEditForm]   = useState<EditForm>({ nis: "", classRoom: "", major: "", grade: "", address: "" });
  const [formError, setFormError] = useState("");

  // ── Fetch ──────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch {
      toast.error("Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Derived data ───────────────────────────────────────────
  const kelasOptions = useMemo(() => ["Semua", ...new Set(students.map(s => s.classRoom).filter(Boolean))], [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => {
      const name = `${s.user?.firstName ?? ""} ${s.user?.lastName ?? ""}`.toLowerCase();
      const matchSearch = name.includes(q) || s.nis.includes(q) || (s.user?.email ?? "").toLowerCase().includes(q);
      const matchKelas  = kelasFilter === "Semua" || s.classRoom === kelasFilter;
      return matchSearch && matchKelas;
    });
  }, [search, kelasFilter, students]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, kelasFilter]);

  // ── Modal helpers ──────────────────────────────────────────
  function openAdd() {
    setAddForm(emptyAdd);
    setFormError("");
    setModal("add");
  }

  function openEdit(s: ApiStudent) {
    setSelected(s);
    setEditForm({ nis: s.nis, classRoom: s.classRoom, major: s.major ?? "", grade: s.grade ?? "", address: s.address ?? "" });
    setFormError("");
    setModal("edit");
  }

  function openView(s: ApiStudent)   { setSelected(s); setModal("view"); }
  function openDelete(s: ApiStudent) { setSelected(s); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); setFormError(""); }

  // ── CRUD handlers ──────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim() || !addForm.password.trim() || !addForm.nis.trim() || !addForm.classRoom.trim()) {
      setFormError("Lengkapi semua field yang wajib diisi (*).");
      return;
    }
    setSaving(true);
    try {
      // Step 1: buat akun user terlebih dahulu
      const newUser: ApiUser = await userService.create({
        firstName: addForm.firstName.trim(),
        lastName:  addForm.lastName.trim(),
        email:     addForm.email.trim(),
        password:  addForm.password,
        phone:     addForm.phone.trim() || undefined,
        role:      "STUDENT",
      });
      // Step 2: buat profil siswa yang terhubung ke user
      const newStudent = await studentService.create({
        nis:       addForm.nis.trim(),
        classRoom: addForm.classRoom.trim(),
        major:     addForm.major || undefined,
        grade:     addForm.grade || undefined,
        address:   addForm.address.trim() || undefined,
        userId:    newUser.id,
      });
      setStudents(prev => [newStudent, ...prev]);
      toast.success("Siswa baru berhasil ditambahkan!");
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? "Gagal menambahkan siswa. Periksa data dan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setFormError("");
    setSaving(true);
    try {
      const updated = await studentService.update(selected.id, {
        nis:       editForm.nis.trim(),
        classRoom: editForm.classRoom.trim(),
        major:     editForm.major || undefined,
        grade:     editForm.grade || undefined,
        address:   editForm.address.trim() || undefined,
      });
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      toast.success("Data siswa berhasil diperbarui!");
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? "Gagal memperbarui data siswa.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await studentService.remove(selected.id);
      setStudents(prev => prev.filter(s => s.id !== selected.id));
      toast.success("Data siswa berhasil dihapus.");
      closeModal();
    } catch {
      toast.error("Gagal menghapus data siswa.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <Topbar title="Data Siswa" subtitle="Manajemen seluruh profil siswa aktif" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          <StatCard label="Total Siswa"    value={loading ? "—" : students.length}                                              sub="Semua terdaftar"      icon={Users}          accent="var(--primary)" />
          <StatCard label="Aktif"          value={loading ? "—" : students.length}                                              sub="Siswa aktif"          icon={CheckCircle}    accent="var(--success)" />
          <StatCard label="Total Kelas"    value={loading ? "—" : kelasOptions.length - 1}                                      sub="Kelas berbeda"        icon={GraduationCap}  accent="#7C3AED" />
          <StatCard label="Hasil Pencarian" value={loading ? "—" : filtered.length}                                             sub="Sesuai filter"        icon={Search}         accent="var(--warning)" />
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", background: "linear-gradient(to right, #fafbfc, #fff)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, NIS, atau email..."
                className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} />
            </div>
            <select value={kelasFilter} onChange={e => setKelasFilter(e.target.value)}
              className="form-input" style={{ fontSize: 13, cursor: "pointer", minWidth: 130 }}>
              {kelasOptions.map(k => <option key={k}>{k}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Download size={13} /> Export
              </button>
              <button onClick={openAdd} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <UserPlus size={14} /> Tambah Siswa
              </button>
            </div>
          </div>

          {/* Result info */}
          <div style={{ padding: "7px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> siswa
            </span>
            {search && <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>Filter aktif: "{search}"</span>}
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Siswa", "NIS", "Kelas", "Jurusan", "Status", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <Loader2 size={20} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                      <span>Memuat data siswa...</span>
                    </div>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <Users size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .25 }} />
                    <p style={{ fontWeight: 600 }}>Tidak ada siswa ditemukan</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Coba ubah kata kunci pencarian atau filter kelas</p>
                  </td></tr>
                ) : paginated.map((s, idx) => {
                  const name = `${s.user?.firstName ?? ""} ${s.user?.lastName ?? ""}`.trim() || "—";
                  const isEven = idx % 2 === 0;
                  return (
                    <tr key={s.id} style={{ background: isEven ? "#fff" : "#fafbfc", borderBottom: "1px solid var(--border)", transition: "background .12s" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-light)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isEven ? "#fff" : "#fafbfc")}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={name} size={34} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{name}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.user?.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{s.nis}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{s.classRoom || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#f1f5f9", color: "var(--text-muted)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{s.major || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--success-light)", color: "#065f46", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                          <CheckCircle size={10} /> Aktif
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => openView(s)} title="Detail" style={actionBtn}><Eye size={13} /></button>
                          <button onClick={() => openEdit(s)} title="Edit" style={actionBtn}><Edit2 size={13} /></button>
                          <button onClick={() => openDelete(s)} title="Hapus" style={{ ...actionBtn, color: "var(--danger)" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafbfc" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...pageBtn, opacity: page === 1 ? .4 : 1 }}><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)} style={{ ...pageBtn, background: p === page ? "var(--primary)" : "#fff", color: p === page ? "#fff" : "var(--text-body)", fontWeight: p === page ? 700 : 500 }}>{p}</button>
                );
              })}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ ...pageBtn, opacity: page === totalPages ? .4 : 1 }}><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ MODAL: TAMBAH SISWA ═══════════════════════════════ */}
      {modal === "add" && (
        <div style={overlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, #02635c 100%)", padding: "22px 24px", borderRadius: "12px 12px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>Tambah Siswa Baru</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Buat akun & profil siswa secara bersamaan</p>
                </div>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}><X size={18} /></button>
              </div>
            </div>

            <form onSubmit={handleAdd} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: "calc(90vh - 80px)" }}>

              {/* Section: Akun */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 6, height: 18, background: "var(--primary)", borderRadius: 3 }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Informasi Akun</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="form-label">Nama Depan *</label>
                    <input className="form-input" value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Budi" required />
                  </div>
                  <div>
                    <label className="form-label">Nama Belakang *</label>
                    <input className="form-input" value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Santoso" required />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input type="email" className="form-input" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: 34 }} placeholder="siswa@sekolah.sch.id" required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-input" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 karakter" required minLength={8} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">No. HP</label>
                    <div style={{ position: "relative" }}>
                      <Phone size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input className="form-input" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} style={{ paddingLeft: 34 }} placeholder="08xx-xxxx-xxxx (opsional)" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Profil Siswa */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 6, height: 18, background: "#7C3AED", borderRadius: 3 }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Profil Akademik</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="form-label">NIS *</label>
                    <div style={{ position: "relative" }}>
                      <Hash size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input className="form-input" value={addForm.nis} onChange={e => setAddForm(f => ({ ...f, nis: e.target.value }))} style={{ paddingLeft: 34, fontFamily: "monospace" }} placeholder="2024001001" required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Kelas *</label>
                    <input className="form-input" value={addForm.classRoom} onChange={e => setAddForm(f => ({ ...f, classRoom: e.target.value }))} placeholder="XI-IPA 1" required />
                  </div>
                  <div>
                    <label className="form-label">Jurusan</label>
                    <select className="form-input" value={addForm.major} onChange={e => setAddForm(f => ({ ...f, major: e.target.value }))}>
                      {MAJOR_OPTIONS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Tingkat</label>
                    <select className="form-input" value={addForm.grade} onChange={e => setAddForm(f => ({ ...f, grade: e.target.value }))}>
                      {GRADE_OPTIONS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Alamat</label>
                    <div style={{ position: "relative" }}>
                      <MapPin size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: 13, pointerEvents: "none" }} />
                      <textarea className="form-input" value={addForm.address} onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))} style={{ paddingLeft: 34, resize: "vertical" }} rows={2} placeholder="Jl. Contoh No. 1, Kota (opsional)" />
                    </div>
                  </div>
                </div>
              </div>

              {formError && (
                <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1.5, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <UserPlus size={14} />}
                  {saving ? "Menyimpan..." : "Tambah Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: EDIT SISWA ═════════════════════════════════ */}
      {modal === "edit" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", padding: "22px 24px", borderRadius: "12px 12px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>Edit Data Siswa</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>
                    {selected.user?.firstName} {selected.user?.lastName} — NIS {selected.nis}
                  </p>
                </div>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}><X size={18} /></button>
              </div>
            </div>

            <form onSubmit={handleEdit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--primary-light)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
                Hanya data profil akademik yang dapat diubah di sini. Data akun (nama, email) diubah via Pengaturan.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">NIS *</label>
                  <div style={{ position: "relative" }}>
                    <Hash size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input className="form-input" value={editForm.nis} onChange={e => setEditForm(f => ({ ...f, nis: e.target.value }))} style={{ paddingLeft: 34, fontFamily: "monospace" }} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Kelas *</label>
                  <input className="form-input" value={editForm.classRoom} onChange={e => setEditForm(f => ({ ...f, classRoom: e.target.value }))} placeholder="XI-IPA 1" required />
                </div>
                <div>
                  <label className="form-label">Jurusan</label>
                  <select className="form-input" value={editForm.major} onChange={e => setEditForm(f => ({ ...f, major: e.target.value }))}>
                    <option value="">— Pilih —</option>
                    {MAJOR_OPTIONS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tingkat</label>
                  <select className="form-input" value={editForm.grade} onChange={e => setEditForm(f => ({ ...f, grade: e.target.value }))}>
                    <option value="">— Pilih —</option>
                    {GRADE_OPTIONS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Alamat</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: 13, pointerEvents: "none" }} />
                    <textarea className="form-input" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} style={{ paddingLeft: 34, resize: "vertical" }} rows={2} />
                  </div>
                </div>
              </div>

              {formError && (
                <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>{formError}</div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Edit2 size={14} />}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: VIEW DETAIL ════════════════════════════════ */}
      {modal === "view" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 24, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
              <Avatar name={`${selected.user?.firstName ?? ""} ${selected.user?.lastName ?? ""}`} size={56} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  {selected.user?.firstName} {selected.user?.lastName}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{selected.user?.email}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <span style={{ background: "var(--success-light)", color: "#065f46", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>Aktif</span>
                  <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>STUDENT</span>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: Hash,          label: "NIS",      value: selected.nis },
                { icon: GraduationCap, label: "Kelas",    value: selected.classRoom || "—" },
                { icon: GraduationCap, label: "Jurusan",  value: selected.major    || "—" },
                { icon: GraduationCap, label: "Tingkat",  value: selected.grade    || "—" },
                { icon: Phone,         label: "No. HP",   value: selected.user?.phone || "—" },
                { icon: MapPin,        label: "Alamat",   value: selected.address  || "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <Icon size={14} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
              <button className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={() => openEdit(selected)}>
                <Edit2 size={13} /> Edit Data
              </button>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={closeModal}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE ════════════════════════════════════ */}
      {modal === "delete" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 400, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={26} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Siswa?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}>
              Data <strong>{selected.user?.firstName} {selected.user?.lastName}</strong> akan dihapus permanen.
            </p>
            <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 24 }}>
              Semua data terkait (prestasi, pembayaran, dll) juga akan terhapus otomatis.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Batal</button>
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

// ─── Style constants ──────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modalBox: React.CSSProperties = {
  width: "100%", maxWidth: 580, background: "#fff",
  borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,.18)",
  maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
};
const actionBtn: React.CSSProperties = {
  background: "none", border: "1px solid var(--border)", borderRadius: 6,
  padding: "5px 8px", cursor: "pointer", color: "var(--text-muted)",
  display: "flex", alignItems: "center", transition: "background .12s",
};
const pageBtn: React.CSSProperties = {
  minWidth: 32, height: 32, borderRadius: 6, border: "1px solid var(--border)",
  background: "#fff", color: "var(--text-body)", fontWeight: 600,
  fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};
