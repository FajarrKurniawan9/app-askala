"use client";
import { useState, useMemo, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { achievementService } from "@/services/portfolio.service";
import { uploadService } from "@/services/upload.service";
import { useAuthStore } from "@/store/authStore";
import type { ApiAchievement, AchievementType, AchievementLevel } from "@/lib/types";
import { toast } from "sonner";
import {
  Trophy, Plus, Search, Edit2, Trash2, X, Upload,
  CheckCircle, Calendar, Download, Eye, Loader2,
} from "lucide-react";

const CAT_COLOR: Record<string, string> = {
  AKADEMIK: "badge-primary", ORGANISASI: "badge-success",
  NON_AKADEMIK: "badge-warning",
};

const TYPES: AchievementType[] = ["AKADEMIK", "ORGANISASI", "NON_AKADEMIK"];
const LEVELS: AchievementLevel[] = ["SEKOLAH", "KABUPATEN", "PROVINSI", "NASIONAL", "INTERNASIONAL"];

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modal: React.CSSProperties = {
  width: "100%", maxWidth: 520, padding: 28, background: "#fff",
  borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,.15)",
  maxHeight: "90vh", overflowY: "auto", position: "relative",
};

const emptyForm = {
  title: "", type: "AKADEMIK" as AchievementType,
  level: "KABUPATEN" as AchievementLevel,
  position: "", organizer: "", date: "", description: "",
};

export default function AchievementsPage() {
  const { setSidebarOpen } = useStudent();
  const { studentProfileId } = useAuthStore();
  const [items, setItems] = useState<ApiAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AchievementType | "all">("all");
  const [lvlFilter, setLvlFilter] = useState<AchievementLevel | "all">("all");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selected, setSelected] = useState<ApiAchievement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [certFile, setCertFile] = useState<File | null>(null);

  // ── Fetch from backend — filter per student ────────────────
  useEffect(() => {
    if (!studentProfileId) { setLoading(false); return; }
    achievementService.getAll({ studentId: studentProfileId })
      .then(setItems)
      .catch(() => toast.error("Gagal memuat data prestasi."))
      .finally(() => setLoading(false));
  }, [studentProfileId]);

  const filtered = useMemo(() => items.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.organizer.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    const matchLvl = lvlFilter === "all" || a.level === lvlFilter;
    return matchSearch && matchType && matchLvl;
  }), [items, search, typeFilter, lvlFilter]);

  function openAdd() { setForm(emptyForm); setSelected(null); setModalMode("add"); }
  function openEdit(a: ApiAchievement) {
    setSelected(a);
    setForm({ title: a.title, type: a.type, level: a.level, position: a.position, organizer: a.organizer, date: a.date.split("T")[0], description: a.description ?? "" });
    setModalMode("edit");
  }
  function openDelete(a: ApiAchievement) { setSelected(a); setModalMode("delete"); }
  function openView(a: ApiAchievement) { setSelected(a); setModalMode("view"); }
  function close() { setModalMode(null); setSelected(null); setCertFile(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentProfileId) {
      toast.error("Profil siswa belum tersedia. Coba login ulang.");
      return;
    }
    setSaving(true);
    try {
      let certUrl: string | undefined;
      if (certFile) {
        const uploaded = await uploadService.uploadFile(certFile);
        certUrl = uploaded.fileUrl;
      }
      if (modalMode === "add") {
        const created = await achievementService.create({
          studentId: studentProfileId || "",
          title: form.title, type: form.type, level: form.level,
          position: form.position, organizer: form.organizer,
          date: new Date(form.date).toISOString(),
          description: form.description || undefined,
          certificateUrl: certUrl,
        });
        setItems(prev => [created, ...prev]);
        toast.success("Prestasi berhasil ditambahkan!");
      } else if (modalMode === "edit" && selected) {
        const updated = await achievementService.update(selected.id, {
          title: form.title, type: form.type, level: form.level,
          position: form.position, organizer: form.organizer,
          date: new Date(form.date).toISOString(),
          description: form.description || undefined,
          ...(certUrl && { certificateUrl: certUrl }),
        });
        setItems(prev => prev.map(a => a.id === selected.id ? updated : a));
        toast.success("Prestasi berhasil diperbarui!");
      }
      close();
    } catch {
      toast.error("Gagal menyimpan prestasi. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await achievementService.remove(selected.id);
      setItems(prev => prev.filter(a => a.id !== selected.id));
      toast.success("Prestasi dihapus.");
      close();
    } catch {
      toast.error("Gagal menghapus prestasi.");
    } finally {
      setSaving(false);
    }
  }

  const totalNasional = items.filter(a => a.level === "NASIONAL" || a.level === "INTERNASIONAL").length;
  const totalSertifikat = items.filter(a => a.certificateUrl).length;

  if (loading) return (
    <>
      <Topbar title="Prestasi Saya" subtitle="Kelola semua pencapaian akademik & non-akademik" role="student" setSidebarOpen={setSidebarOpen} />
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <Loader2 size={24} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "var(--text-muted)" }}>Memuat data prestasi...</span>
      </main>
    </>
  );

  // Profil siswa belum ter-resolve — biasanya karena seeder belum selesai atau akun baru dibuat
  if (!studentProfileId) return (
    <>
      <Topbar title="Prestasi Saya" subtitle="Kelola semua pencapaian akademik & non-akademik" role="student" setSidebarOpen={setSidebarOpen} />
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, background: "var(--warning-light, #fef9c3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Trophy size={28} color="#ca8a04" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Profil Siswa Belum Tersedia</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
            Data profil siswa belum berhasil dimuat. Ini bisa terjadi jika akun baru saja dibuat atau sesi login sudah habis.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { window.location.href = "/login"; }}
          >
            Login Ulang
          </button>
        </div>
      </main>
    </>
  );

  return (
    <>
      <Topbar title="Prestasi Saya" subtitle="Kelola semua pencapaian akademik & non-akademik" role="student" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
          {[
            { label: "Total Prestasi", value: items.length, color: "var(--primary)" },
            { label: "Tingkat Nasional+", value: totalNasional, color: "var(--danger)" },
            { label: "Bersertifikat", value: totalSertifikat, color: "var(--success)" },
            { label: "Tahun Ini", value: items.filter(a => a.date?.includes(new Date().getFullYear().toString())).length, color: "var(--warning)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-stat">
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 30, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input className="form-input" style={{ paddingLeft: 36, fontSize: 13 }}
              placeholder="Cari prestasi atau penyelenggara..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ fontSize: 13, maxWidth: 180, cursor: "pointer" }}
            value={typeFilter} onChange={e => setTypeFilter(e.target.value as AchievementType | "all")}>
            <option value="all">Semua Kategori</option>
            {TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select>
          <select className="form-input" style={{ fontSize: 13, maxWidth: 180, cursor: "pointer" }}
            value={lvlFilter} onChange={e => setLvlFilter(e.target.value as AchievementLevel | "all")}>
            <option value="all">Semua Tingkat</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => window.print()} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Download size={13} /> Export PDF
          </button>
          <button onClick={openAdd} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Plus size={14} /> Tambah Prestasi
          </button>
        </div>

        {/* Table */}
        <div className="card">
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Daftar Prestasi</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{filtered.length} dari {items.length} prestasi</span>
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Judul Prestasi</th><th>Tipe</th><th>Tingkat</th>
                  <th>Posisi</th><th>Penyelenggara</th><th>Tanggal</th>
                  <th>Sertifikat</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <Trophy size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .3 }} />
                    Belum ada prestasi. Tambahkan prestasi pertama Anda!
                  </td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Trophy size={14} color="var(--primary)" />
                        </div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4 }}>{a.title}</p>
                      </div>
                    </td>
                    <td><span className={`badge ${CAT_COLOR[a.type] ?? "badge-gray"}`}>{a.type.replace("_", " ")}</span></td>
                    <td><span className="badge badge-gray">{a.level}</span></td>
                    <td><span style={{ fontWeight: 600, fontSize: 13, color: "var(--primary)" }}>{a.position}</span></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.organizer}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{a.date?.split("T")[0]}</span>
                    </td>
                    <td>
                      {a.certificateUrl
                        ? <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={12} />Ada</span>
                        : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openView(a)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }} title="Lihat"><Eye size={13} /></button>
                        <button onClick={() => openEdit(a)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }} title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => openDelete(a)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }} title="Hapus"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div style={overlay} onClick={close}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{modalMode === "add" ? "Tambah Prestasi" : "Edit Prestasi"}</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Lengkapi informasi prestasi Anda</p>
              </div>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
              <div>
                <label className="form-label">Judul Prestasi *</label>
                <input className="form-input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Juara 1 Olimpiade Matematika" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Tipe / Kategori</label>
                  <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AchievementType }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tingkat</label>
                  <select className="form-input" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as AchievementLevel }))}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Posisi / Peringkat *</label>
                  <input className="form-input" required value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Juara 1" />
                </div>
                <div>
                  <label className="form-label">Tanggal *</label>
                  <input type="date" className="form-input" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Penyelenggara *</label>
                <input className="form-input" required value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} placeholder="Dinas Pendidikan" />
              </div>
              <div>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} placeholder="Ceritakan pencapaian Anda..." />
              </div>
              <label style={{ border: "2px dashed var(--border)", borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={e => setCertFile(e.target.files?.[0] ?? null)} />
                <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{certFile ? certFile.name : "Upload Sertifikat (opsional)"}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF, JPG, PNG — maks. 5MB</p>
                </div>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={close}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
                  {modalMode === "add" ? "Simpan Prestasi" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modalMode === "view" && selected && (
        <div style={overlay} onClick={close}>
          <div style={{ ...modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Detail Prestasi</h3>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, background: "var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trophy size={24} color="var(--primary)" />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{selected.title}</h4>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className={`badge ${CAT_COLOR[selected.type] ?? "badge-gray"}`}>{selected.type.replace("_", " ")}</span>
                  <span className="badge badge-gray">{selected.level}</span>
                  <span className="badge badge-primary">{selected.position}</span>
                  {selected.isVerified && <span className="badge badge-success"><CheckCircle size={10} /> Terverifikasi</span>}
                </div>
              </div>
            </div>
            {selected.description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.7 }}>{selected.description}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[["Penyelenggara", selected.organizer], ["Tanggal", selected.date?.split("T")[0]]].map(([l, v]) => (
                <div key={l}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{l}</p>
                  <p style={{ fontSize: 14 }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => openEdit(selected)}><Edit2 size={14} /> Edit</button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={close}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalMode === "delete" && selected && (
        <div style={overlay} onClick={close}>
          <div style={{ ...modal, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Prestasi?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              Prestasi <strong>&quot;{selected.title}&quot;</strong> akan dihapus secara permanen.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={close}>Batal</button>
              <button disabled={saving} className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null} Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
