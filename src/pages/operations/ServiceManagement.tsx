import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { getErrorMessage } from "../../api/axiosClient";
import operationsService, { type ServicePayload, type WashService } from "../../services/operationsService";

const emptyForm: ServicePayload = {
  ServiceName: "", BasePrice: 0, Description: "", DurationMinutes: 30, Type: "Rửa xe", Status: "Active",
};

const money = (value: number | string) => `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} ₫`;

export default function ServiceManagement() {
  const [items, setItems] = useState<WashService[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<WashService | null>(null);
  const [form, setForm] = useState<ServicePayload>(emptyForm);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setMessage("");
    try { setItems(await operationsService.getServices()); }
    catch (error) { setMessage(getErrorMessage(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const filtered = useMemo(() => items.filter((item) => {
    const text = `${item.ServiceName} ${item.Type || ""} ${item.Description || ""}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "all" || item.Status === status);
  }), [items, query, status]);

  function showCreate() { setEditing(null); setForm(emptyForm); setOpen(true); setMessage(""); }
  function showEdit(item: WashService) {
    setEditing(item);
    setForm({ ServiceName: item.ServiceName, BasePrice: Number(item.BasePrice), Description: item.Description || "", DurationMinutes: item.DurationMinutes || 30, Type: item.Type || "", Status: item.Status });
    setOpen(true); setMessage("");
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.ServiceName.trim() || form.BasePrice <= 0) { setMessage("Tên dịch vụ và giá bán phải hợp lệ."); return; }
    setSaving(true); setMessage("");
    try {
      if (editing) await operationsService.updateService(editing.ServiceID, form);
      else await operationsService.createService(form);
      setOpen(false); await load();
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setSaving(false); }
  }
  async function remove(item: WashService) {
    if (!window.confirm(`Vô hiệu hóa dịch vụ “${item.ServiceName}”?`)) return;
    try { await operationsService.deleteService(item.ServiceID); await load(); }
    catch (error) { setMessage(getErrorMessage(error)); }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">Quản lý dịch vụ</h1><p className="mt-1 text-sm text-slate-500">Danh mục dịch vụ gốc dùng cho toàn hệ thống.</p></div>
      <div className="flex gap-2"><button onClick={() => void load()} className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" title="Tải lại"><RefreshCw size={18}/></button><button onClick={showCreate} className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white hover:bg-sky-700"><Plus size={18}/>Thêm dịch vụ</button></div>
    </div>
    {message && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}
    <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="relative min-w-64 flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm tên, loại dịch vụ..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-sky-500"/></label>
      <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5"><option value="all">Tất cả trạng thái</option><option value="Active">Đang hoạt động</option><option value="Inactive">Ngừng hoạt động</option></select>
    </div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3">Dịch vụ</th><th className="px-5 py-3">Giá gốc</th><th className="px-5 py-3">Thời lượng</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">
      {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Đang tải...</td></tr> : filtered.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Không có dịch vụ phù hợp.</td></tr> : filtered.map((item)=><tr key={item.ServiceID} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{item.ServiceName}</div><div className="mt-1 max-w-md text-xs text-slate-500">{item.Type || "Chưa phân loại"} · {item.Description || "Không có mô tả"}</div></td><td className="px-5 py-4 font-medium">{money(item.BasePrice)}</td><td className="px-5 py-4">{item.DurationMinutes || 0} phút</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.Status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.Status === "Active" ? "Hoạt động" : "Ngừng"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={()=>showEdit(item)} className="rounded-lg p-2 text-sky-600 hover:bg-sky-50" title="Sửa"><Edit3 size={17}/></button><button onClick={()=>void remove(item)} disabled={item.Status === "Inactive"} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30" title="Vô hiệu hóa"><Trash2 size={17}/></button></div></td></tr>)}
    </tbody></table></div></div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={submit} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{editing ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}</h2><button type="button" onClick={()=>setOpen(false)}><X size={22}/></button></div><div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">Tên dịch vụ<input required value={form.ServiceName} onChange={(e)=>setForm({...form,ServiceName:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"/></label>
      <label className="text-sm font-medium">Loại dịch vụ<input value={form.Type || ""} onChange={(e)=>setForm({...form,Type:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"/></label>
      <label className="text-sm font-medium">Giá gốc<input required min="1" type="number" value={form.BasePrice} onChange={(e)=>setForm({...form,BasePrice:Number(e.target.value)})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"/></label>
      <label className="text-sm font-medium">Thời lượng (phút)<input min="1" type="number" value={form.DurationMinutes || 0} onChange={(e)=>setForm({...form,DurationMinutes:Number(e.target.value)})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"/></label>
      <label className="text-sm font-medium sm:col-span-2">Mô tả<textarea rows={3} value={form.Description || ""} onChange={(e)=>setForm({...form,Description:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"/></label>
      {editing && <label className="text-sm font-medium">Trạng thái<select value={form.Status} onChange={(e)=>setForm({...form,Status:e.target.value as "Active"|"Inactive"})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"><option value="Active">Hoạt động</option><option value="Inactive">Ngừng</option></select></label>}
    </div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2">Hủy</button><button disabled={saving} className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu"}</button></div></form></div>}
  </div>;
}
