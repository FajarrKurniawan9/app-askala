"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, Edit, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const transactions = [
  { id:1, type:"in",  title:"Iuran OSIS Juni",         org:"OSIS",     amount:500000,  date:"27 Mei 2026", by:"Budi Santoso" },
  { id:2, type:"out", title:"Beli Seragam Paskibra",    org:"Paskibra", amount:350000,  date:"25 Mei 2026", by:"Siti Rahmah"  },
  { id:3, type:"in",  title:"Iuran KIR Mei",            org:"KIR",      amount:150000,  date:"20 Mei 2026", by:"Budi Santoso" },
  { id:4, type:"out", title:"Konsumsi Rapat OSIS",      org:"OSIS",     amount:200000,  date:"18 Mei 2026", by:"Ahmad Rizky"  },
  { id:5, type:"in",  title:"Sumbangan Wali Murid",     org:"OSIS",     amount:1000000, date:"15 Mei 2026", by:"Budi Santoso" },
  { id:6, type:"out", title:"Dekorasi Pensi",            org:"OSIS",     amount:450000,  date:"10 Mei 2026", by:"Dian Safitri" },
];

const totalIn  = transactions.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
const totalOut = transactions.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
const balance  = totalIn - totalOut;

export default function TreasuryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<"all"|"in"|"out">("all");
  const [modal, setModal]   = useState(false);
  const [txType, setTxType] = useState<"in"|"out">("in");

  const filtered = transactions.filter(t => filter==="all" || t.type===filter);

  return (
    <div style={{ display:"flex" }}>
      <Sidebar role="admin" userName="Budi Santoso" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex:1 }}>
        <Topbar title="Kas Organisasi" subtitle="Pemasukan & pengeluaran kas sekolah" role="admin" userName="Budi Santoso" setSidebarOpen={setSidebarOpen} />

        <main style={{ padding:24, display:"flex", flexDirection:"column", gap:24 }}>

          {/* Summary */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
            {[
              { label:"Saldo Kas",      value: formatCurrency(balance),  cls:"card-stat",         Icon: DollarSign  },
              { label:"Total Masuk",    value: formatCurrency(totalIn),  cls:"card-stat-success",  Icon: TrendingUp  },
              { label:"Total Keluar",   value: formatCurrency(totalOut), cls:"card-stat-danger",   Icon: TrendingDown},
              { label:"Total Transaksi",value: `${transactions.length}`, cls:"card-stat",          Icon: DollarSign  },
            ].map(({label,value,cls,Icon})=>(
              <div key={label} className={cls} style={{ borderRadius:"var(--radius)", boxShadow:"var(--shadow-sm)", padding:"20px 24px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <p style={{ fontSize:11, color:"var(--text-muted)", fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:".04em" }}>{label}</p>
                    <p style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)", lineHeight:1.2 }}>{value}</p>
                  </div>
                  <div style={{ width:40, height:40, background:"var(--primary-light)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={18} color="var(--primary)" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card">
            <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", gap:4, background:"#f1f5f9", borderRadius:8, padding:4 }}>
                {(["all","in","out"] as const).map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{
                    padding:"6px 16px", borderRadius:6, fontWeight:600, fontSize:12, cursor:"pointer",
                    background: filter===f ? "#fff" : "transparent",
                    color: filter===f ? "var(--primary)" : "var(--text-muted)",
                    border: filter===f ? "1px solid var(--border)" : "none",
                  }}>
                    {{all:"Semua",in:"Pemasukan",out:"Pengeluaran"}[f]}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-outline btn-sm" onClick={()=>{setTxType("out");setModal(true);}} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <TrendingDown size={13}/> Catat Keluar
                </button>
                <button className="btn btn-primary btn-sm" onClick={()=>{setTxType("in");setModal(true);}} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <Plus size={13}/> Catat Masuk
                </button>
              </div>
            </div>

            <div className="table-wrapper" style={{ border:"none", borderRadius:0 }}>
              <table>
                <thead>
                  <tr><th>Judul</th><th>Organisasi</th><th>Jenis</th><th>Nominal</th><th>Tanggal</th><th>Dicatat Oleh</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(t=>(
                    <tr key={t.id}>
                      <td style={{ fontWeight:500, color:"var(--text-primary)" }}>{t.title}</td>
                      <td><span className="badge badge-primary">{t.org}</span></td>
                      <td>
                        {t.type==="in"
                          ? <span className="badge badge-success"><TrendingUp size={10}/>Masuk</span>
                          : <span className="badge badge-danger"><TrendingDown size={10}/>Keluar</span>}
                      </td>
                      <td style={{ fontWeight:700, color: t.type==="in" ? "var(--success)" : "var(--danger)" }}>
                        {t.type==="in" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ fontSize:13, color:"var(--text-muted)" }}>{t.date}</td>
                      <td style={{ fontSize:13 }}>{t.by}</td>
                      <td>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding:"5px 8px" }}><Edit size={13}/></button>
                          <button className="btn btn-ghost btn-sm" style={{ padding:"5px 8px", color:"var(--danger)" }}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Add Transaction Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div className="card" style={{ width:"100%", maxWidth:460, padding:32, position:"relative" }}>
            <button onClick={()=>setModal(false)} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
              <X size={20}/>
            </button>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>
              {txType==="in" ? "Catat Pemasukan Kas" : "Catat Pengeluaran Kas"}
            </h3>
            <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>Isi detail transaksi kas organisasi</p>

            <form style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label className="form-label">Judul Transaksi</label>
                <input type="text" className="form-input" placeholder="Contoh: Iuran OSIS Juni 2026" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label className="form-label">Organisasi</label>
                  <select className="form-input" style={{ cursor:"pointer" }}>
                    <option>OSIS</option>
                    <option>Paskibra</option>
                    <option>KIR</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Nominal (Rp)</label>
                  <input type="number" className="form-input" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="form-label">Tanggal</label>
                <input type="date" className="form-input" />
              </div>
              <div>
                <label className="form-label">Keterangan (opsional)</label>
                <textarea className="form-input" rows={3} placeholder="Detail tambahan..." style={{ resize:"vertical" }} />
              </div>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={()=>setModal(false)}>Batal</button>
                <button type="submit" className={`btn ${txType==="in"?"btn-primary":"btn-danger"}`} style={{ flex:1, justifyContent:"center" }} onClick={e=>{e.preventDefault();setModal(false);}}>
                  <Plus size={14}/> {txType==="in" ? "Simpan Pemasukan" : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
