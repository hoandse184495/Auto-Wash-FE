import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function AdminProfile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr);
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = getUserFromStorage();
        const userId = user?.UserID || user?.userId;

        if (!token || !userId) {
          navigate("/login");
          return;
        }

        const res = await axiosClient.get(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.data;
        setFullName(data.FullName || "");
        setEmail(data.Email || "");
        setPhone(data.Phone || "");
        setEditForm({
          fullName: data.FullName || "",
          phone: data.Phone || "",
        });
      } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        setMessage(apiError.response?.data?.message || "Không thể tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      setMessage("");
      const token = localStorage.getItem("token");
      const user = getUserFromStorage();
      const userId = user?.UserID || user?.userId;

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      const payload = {
        FullName: editForm.fullName.trim(),
        Phone: editForm.phone.trim(),
      };

      await axiosClient.put(`/api/users/${userId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFullName(payload.FullName);
      setPhone(payload.Phone);
      setIsEditing(false);
      setMessage("Cập nhật hồ sơ thành công");

      const updatedUser = {
        ...user,
        FullName: payload.FullName,
        fullName: payload.FullName,
        Phone: payload.Phone,
        phone: payload.Phone,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-updated"));
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setMessage(apiError.response?.data?.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="px-6 py-10">
          <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              Đang tải thông tin hồ sơ...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <section className="bg-slate-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
              <UserRound className="h-4 w-4" />
              Hồ sơ quản trị
            </p>

            <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">Thông tin quản trị viên</h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Quản lý thông tin tài khoản và cập nhật hồ sơ cá nhân của bạn.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm text-slate-300">Tên hiện tại</p>
                  <p className="mt-1 text-2xl font-bold">{fullName || "Admin"}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm text-slate-300">Vai trò</p>
                  <p className="mt-1 text-2xl font-bold">Quản trị viên</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8">
          {message && (
            <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">Tài khoản</p>
                  <h2 className="text-xl font-bold text-slate-950">Thông tin tài khoản</h2>
                </div>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  Chỉnh sửa
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-bold text-slate-700">Họ và tên</label>
                    <input
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-bold text-slate-700">Số điện thoại</label>
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={updating}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      <Save className="h-4 w-4" />
                      {updating ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ fullName, phone });
                      }}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <InfoCard icon={<UserRound className="h-5 w-5" />} label="Họ và tên" value={fullName || "Chưa cập nhật"} />
                  <InfoCard icon={<Mail className="h-5 w-5" />} label="Email" value={email || "Chưa cập nhật"} />
                  <InfoCard icon={<Phone className="h-5 w-5" />} label="Số điện thoại" value={phone || "Chưa cập nhật"} />
                  <InfoCard icon={<ShieldCheck className="h-5 w-5" />} label="Vai trò" value="Admin" />
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard = ({ icon, label, value }: CardProps) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <p className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-sky-600">{icon}</span>
      {label}
    </p>
    <p className="mt-2 break-words font-semibold text-slate-950">{value}</p>
  </div>
);

export default AdminProfile;
