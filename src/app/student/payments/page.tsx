"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Upload, CheckCircle, AlertCircle, Clock, Calendar, CreditCard, Eye, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const payments = [
  { id: 1, name: "Iuran OSIS — Juni 2026",    org: "OSIS",     amount: 50000,  status: "pending",  due: "30 Jun 2026" },
  { id: 2, name: "Iuran Paskibra — Mei 2026", org: "Paskibra", amount: 75000,  status: "paid",     due: "15 Mei 2026" },
  { id: 3, name: "Dana Kegiatan Pensi",        org: "OSIS",     amount: 100000, status: "rejected", due: "1 Jun 2026"  },
  { id: 4, name: "Iuran OSIS — Mei 2026",     org: "OSIS",     amount: 50000,  status: "paid",     due: "30 Mei 2026" },
  { id: 5, name: "Iuran KIR — Juni 2026",     org: "KIR",      amount: 30000,  status: "pending",  due: "25 Jun 2026" },
];

const statusConf: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending:  { label: "Menunggu", cls: "badge-danger",  icon: Clock },
  paid:     { label: "Lunas",    cls: "badge-success", icon: CheckCircle },
  rejected: { label: "Ditolak", cls: "badge-danger",  icon: AlertCircle },
};

export default function StudentPaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<"all"|"pending"|"paid"|"rejected">("all");
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number|null>(null);

  const filtered = payments.filter(p => filter === "all" || p.status === filter);
  const totalPending = payments.filter(p=>p.status==="pending").reduce((s,p)=>s+p.amount,0);
  const totalPaid    = payments.filter(p=>p.status==="paid").reduce((s,p)=>s+p.amount,0);

  return (
    <div style={{ display:"flex" }}>
      <Sidebar role="student" userName="Ahmad Rizky" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex:1 }}>
        <Topbar title="Pembayaran" subtitle="Tagihan iuran & riwayat pembayaran" role="student" setSidebarOpen={setSidebarOpen} />
        <main style={{ padding:24, display:"flex", flexDirection:"column", gap:24 }}>

          {/* Summary */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
            {[
              { label:"Tagihan Pending", value: formatCurrency(totalPending), cls:"card-stat-danger",  Icon: AlertCircle },
              { label:"Sudah Dibayar",   value: formatCurrency(totalPaid),    cls:"card-stat-success", Icon: CheckCircle },
              { label:"Total Tagihan",   value: `${payments.length} item`,    cls:"",                  Icon: CreditCard  },
            ].map(({label,value,cls,Icon})=>(
              <div key={label} className={`card-stat ${cls}`}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <p style={{ fontSize:11, color:"var(--text-muted)", fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:".04em" }}>{label}</p>
                    <p style={{ fontSize:20, fontWeight:800, color:"var(--text-primary)" }}>{value}</p>
                  </div>
                  <div style={{ width:38, height:38, background:"var(--primary-light)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={18} color="var(--primary)" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card">
            <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--border)", display:"flex", gap:4 }}>
              {(["all","pending","paid","rejected"] as const).map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{
                  padding:"6px 16px", borderRadius:6, fontWeight:600, fontSize:12, cursor:"pointer",
                  background: filter===f ? "#fff" : "transparent",
                  color: filter===f ? "var(--primary)" : "var(--text-muted)",
                  border: filter===f ? "1px solid var(--border)" : "none",
                }}>
                  {{all:"Semua",pending:"Pending",paid:"Lunas",rejected:"Ditolak"}[f]}
                </button>
              ))}
            </div>
            <div className="table-wrapper" style={{ border:"none", borderRadius:0 }}>
              <table>
                <thead>
                  <tr><th>Nama Tagihan</th><th>Org</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {filtered.map(p=>{
                    const conf = statusConf[p.status];
                    const Icon = conf.icon;
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight:500, color:"var(--text-primary)" }}>{p.name}</td>
                        <td><span className="badge badge-gray">{p.org}</span></td>
                        <td style={{ fontWeight:700 }}>{formatCurrency(p.amount)}</td>
                        <td><span style={{ display:"flex", alignItems:"center", gap:4, fontSize:13 }}><Calendar size={12} color="var(--text-muted)" />{p.due}</span></td>
                        <td><span className={`badge ${conf.cls}`}><Icon size={11}/>{conf.label}</span></td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            {(p.status==="pending"||p.status==="rejected") && (
                              <button className={`btn ${p.status==="rejected"?"btn-danger":"btn-primary"} btn-sm`}
                                style={{ display:"flex", alignItems:"center", gap:5 }}
                                onClick={()=>{setSelectedId(p.id);setModal(true);}}>
                                <Upload size={12}/> {p.status==="rejected"?"Ulang":"Upload"}
                              </button>
                            )}
                            <button className="btn btn-ghost btn-sm" style={{ display:"flex", alignItems:"center", gap:5 }}>
                              <Eye size={12}/> Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info */}
          <div style={{ background:"var(--primary-light)", border:"1px solid rgba(2,126,116,.2)", borderRadius:10, padding:"16px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
            <AlertCircle size={20} color="var(--primary)" style={{ flexShrink:0, marginTop:2 }} />
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"var(--primary)", marginBottom:4 }}>Cara Upload Bukti Pembayaran</p>
              <p style={{ fontSize:13, color:"var(--text-body)", lineHeight:1.6 }}>
                1. Klik tombol &quot;Upload&quot; pada tagihan Pending.<br/>
                2. Upload foto/screenshot bukti transfer (JPG, PNG, PDF — maks. 5MB).<br/>
                3. Tunggu verifikasi Admin (maks. 1×24 jam). Status akan otomatis berubah ke &quot;Lunas&quot;.
              </p>
            </div>
          </div>

        </main>
      </div>

      {/* Upload Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div className="card" style={{ width:"100%", maxWidth:460, padding:32, position:"relative" }}>
            <button onClick={()=>setModal(false)} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
              <X size={20}/>
            </button>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Upload Bukti Pembayaran</h3>
            <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>{payments.find(p=>p.id===selectedId)?.name}</p>
            <div style={{ border:"2px dashed var(--border)", borderRadius:10, padding:36, textAlign:"center", cursor:"pointer", marginBottom:20 }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="var(--primary)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="var(--border)"}>
              <div style={{ width:48, height:48, background:"var(--primary-light)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                <Upload size={22} color="var(--primary)"/>
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", marginBottom:4 }}>Klik untuk pilih file</p>
              <p style={{ fontSize:12, color:"var(--text-muted)" }}>JPG, PNG, PDF — Maks. 5MB</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={()=>setModal(false)}>Batal</button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={()=>setModal(false)}><Upload size={14}/> Kirim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
