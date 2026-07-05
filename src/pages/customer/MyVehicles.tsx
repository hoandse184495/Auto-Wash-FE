import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Car,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import axiosClient from "../../api/axiosClient";

type Vehicle = {
  VehicleID: number;
  LicensePlate: string;
  VehicleType?: string | null;
  Brand?: string | null;
  Model?: string | null;
  Color?: string | null;
  Status?: string | null;
  CreatedAt?: string | null;
};

type EditForm = {
  LicensePlate: string;
  VehicleType: string;
  Brand: string;
  Model: string;
  Color: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

function MyVehicles() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editForm, setEditForm] = useState<EditForm>({
    LicensePlate: "",
    VehicleType: "",
    Brand: "",
    Model: "",
    Color: "",
  });

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axiosClient.get("/api/vehicles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVehicles(res.data.data || []);
    } catch (error) {
      console.log(error);
      setMessage("Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadVehicles();
  }, [loadVehicles]);

  function formatDate(date?: string | null) {
    if (!date) {
      return "Chưa có";
    }

    return new Date(date).toLocaleDateString("vi-VN");
  }

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.VehicleID);
    setEditForm({
      LicensePlate: vehicle.LicensePlate || "",
      VehicleType: vehicle.VehicleType || "",
      Brand: vehicle.Brand || "",
      Model: vehicle.Model || "",
      Color: vehicle.Color || "",
    });

    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);

    setEditForm({
      LicensePlate: "",
      VehicleType: "",
      Brand: "",
      Model: "",
      Color: "",
    });

    setMessage("");
  }

  async function saveEdit(vehicleId: number) {
    try {
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!editForm.LicensePlate.trim()) {
        setMessage("Biển số xe không được để trống");
        return;
      }

      const dataToUpdate = {
        LicensePlate: editForm.LicensePlate.trim().toUpperCase(),
        VehicleType: editForm.VehicleType.trim(),
        Brand: editForm.Brand.trim(),
        Model: editForm.Model.trim(),
        Color: editForm.Color.trim(),
      };

      await axiosClient.put(`/api/vehicles/${vehicleId}`, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadVehicles();

      setEditingId(null);
      setMessage("Cập nhật thông tin xe thành công");
    } catch (error) {
      console.log(error);
      setMessage("Cập nhật thông tin xe thất bại");
    }
  }

  async function deleteVehicle(vehicleId: number) {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa xe này không?");

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      await axiosClient.delete(`/api/vehicles/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVehicles((currentVehicles) =>
        currentVehicles.filter((vehicle) => vehicle.VehicleID !== vehicleId),
      );
      setMessage("Xóa xe thành công");
    } catch (error) {
      console.log(error);
      setMessage("Xóa xe thất bại");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section className="bg-slate-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>

            <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                  <Car className="h-4 w-4" />
                  Phương tiện
                </p>

                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Thông tin xe
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Quản lý danh sách xe đã đăng ký, cập nhật thông tin phương
                  tiện và dùng lại khi đặt lịch rửa xe.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm text-slate-300">Tổng số xe</p>
                  <p className="mt-1 text-2xl font-bold">{vehicles.length}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm text-slate-300">Trạng thái</p>
                  <p className="mt-1 text-2xl font-bold">Đang quản lý</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                Danh sách
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Xe của tôi
              </h2>
            </div>

            <Link
              to="/register-car"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
            >
              <Plus className="h-5 w-5" />
              Đăng ký xe mới
            </Link>
          </div>

          {message && (
            <div className="mb-6 flex gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">Đang tải danh sách xe...</p>
            </div>
          )}

          {!loading && vehicles.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Car className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">
                Bạn chưa đăng ký xe nào
              </h3>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                Thêm xe đầu tiên để đặt lịch nhanh hơn và quản lý thông tin
                phương tiện trong hệ thống.
              </p>

              <Link
                to="/register-car"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                <Plus className="h-5 w-5" />
                Đăng ký xe ngay
              </Link>
            </div>
          )}

          {!loading && vehicles.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => {
                const isEditing = editingId === vehicle.VehicleID;

                return (
                  <article
                    key={vehicle.VehicleID}
                    className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-500">
                          Biển số xe
                        </p>

                        {isEditing ? (
                          <input
                            value={editForm.LicensePlate}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                LicensePlate: e.target.value,
                              })
                            }
                            className={`${inputClass} text-lg font-bold text-sky-700`}
                          />
                        ) : (
                          <h3 className="mt-1 break-words text-2xl font-bold text-sky-700">
                            {vehicle.LicensePlate}
                          </h3>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        {vehicle.Status || "Active"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm">
                      <VehicleField
                        label="Loại xe"
                        value={vehicle.VehicleType}
                        isEditing={isEditing}
                        editValue={editForm.VehicleType}
                        onChange={(value) =>
                          setEditForm({ ...editForm, VehicleType: value })
                        }
                      />

                      <VehicleField
                        label="Hãng xe"
                        value={vehicle.Brand}
                        isEditing={isEditing}
                        editValue={editForm.Brand}
                        onChange={(value) =>
                          setEditForm({ ...editForm, Brand: value })
                        }
                      />

                      <VehicleField
                        label="Model"
                        value={vehicle.Model}
                        isEditing={isEditing}
                        editValue={editForm.Model}
                        onChange={(value) =>
                          setEditForm({ ...editForm, Model: value })
                        }
                      />

                      <VehicleField
                        label="Màu xe"
                        value={vehicle.Color}
                        isEditing={isEditing}
                        editValue={editForm.Color}
                        onChange={(value) =>
                          setEditForm({ ...editForm, Color: value })
                        }
                      />

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="flex items-center gap-2 text-slate-500">
                          <CalendarDays className="h-4 w-4 text-sky-600" />
                          Ngày đăng ký
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatDate(vehicle.CreatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(vehicle.VehicleID)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                          >
                            <Save className="h-4 w-4" />
                            Lưu
                          </button>

                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            <X className="h-4 w-4" />
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(vehicle)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                            Chỉnh sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteVehicle(vehicle.VehicleID)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa xe
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

type VehicleFieldProps = {
  label: string;
  value?: string | null;
  isEditing: boolean;
  editValue: string;
  onChange: (value: string) => void;
};

const VehicleField = ({
  label,
  value,
  isEditing,
  editValue,
  onChange,
}: VehicleFieldProps) => {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-slate-500">{label}</p>

      {isEditing ? (
        <input
          value={editValue}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <p className="mt-1 font-semibold text-slate-900">
          {value || "Chưa cập nhật"}
        </p>
      )}
    </div>
  );
};

export default MyVehicles;
