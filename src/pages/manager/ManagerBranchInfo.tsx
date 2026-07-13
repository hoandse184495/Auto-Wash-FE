import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import axiosClient, { getErrorMessage } from "../../api/axiosClient";
import branchConfigService from "../../services/branchConfigService";
import branchServiceAssignmentService, {
  type BranchServiceAssignment,
  type BranchServicePayload,
  type BranchServiceUpdatePayload,
  type ServiceCatalogItem,
} from "../../services/branchServiceAssignmentService";

interface BranchInfo {
  branchID: number;
  branchName: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
  status: string;
}

type BranchApiData = Partial<Record<
  | "BranchID"
  | "BranchName"
  | "Address"
  | "Phone"
  | "OpenTime"
  | "CloseTime"
  | "BankAccount"
  | "Status",
  string | number | null | undefined
>>;

interface ConfigFormState {
  SlotDuration: number;
  TotalWashBays: number;
  BufferMinutes: number;
  MaxCarsPerBooking: number;
  CancelWindowHours: number;
}

interface BranchServiceFormState {
  ServiceID: string;
  Status: "Active" | "Inactive";
  PriceOverride: string;
}

const defaultConfig: ConfigFormState = {
  SlotDuration: 30,
  TotalWashBays: 2,
  BufferMinutes: 5,
  MaxCarsPerBooking: 2,
  CancelWindowHours: 24,
};

const emptyBranchServiceForm: BranchServiceFormState = {
  ServiceID: "",
  Status: "Active",
  PriceOverride: "",
};

const ManagerBranchInfo = () => {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [configForm, setConfigForm] = useState<ConfigFormState>(defaultConfig);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [branchServices, setBranchServices] = useState<BranchServiceAssignment[]>([]);
  const [serviceCatalog] = useState<ServiceCatalogItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [isServiceSaving, setIsServiceSaving] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [serviceMessage, setServiceMessage] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingBranchService, setEditingBranchService] = useState<BranchServiceAssignment | null>(null);
  const [branchServiceForm, setBranchServiceForm] = useState<BranchServiceFormState>(emptyBranchServiceForm);

  const branchId = useMemo(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const rawBranchId = user?.branchId ?? user?.BranchID;
    return Number(rawBranchId || 0) || null;
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!branchId) {
      setError("Không tìm thấy chi nhánh của tài khoản hiện tại.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const [branchRes, configRes] = await Promise.all([
        axiosClient.get(`/api/branches/${branchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        branchConfigService.getConfig(branchId),
      ]);

      if (branchRes.data?.success) {
        const data = branchRes.data.data as BranchApiData;
        const normalizedBranch = {
          branchID: Number(data.BranchID || branchId),
          branchName: String(data.BranchName || ""),
          address: String(data.Address || ""),
          phone: String(data.Phone || ""),
          openTime: String(data.OpenTime || ""),
          closeTime: String(data.CloseTime || ""),
          status: String(data.Status || ""),
        };

        setBranchInfo(normalizedBranch);
      }

      if (configRes) {
        setConfigForm({
          SlotDuration: Number(configRes.SlotDuration) || defaultConfig.SlotDuration,
          TotalWashBays: Number(configRes.TotalWashBays) || defaultConfig.TotalWashBays,
          BufferMinutes: Number(configRes.BufferMinutes) || defaultConfig.BufferMinutes,
          MaxCarsPerBooking:
            Number(configRes.MaxCarsPerBooking) || defaultConfig.MaxCarsPerBooking,
          CancelWindowHours:
            Number(configRes.CancelWindowHours) || defaultConfig.CancelWindowHours,
        });
      } else {
        setConfigForm(defaultConfig);
      }

      setIsEditingConfig(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranchServices = async () => {
    if (!branchId) return;

    setIsServiceLoading(true);
    setServiceError("");

    try {
      const list = await branchServiceAssignmentService.getAssignedServices(branchId);
      setBranchServices(list);
    } catch (err) {
      setServiceError(getErrorMessage(err));
    } finally {
      setIsServiceLoading(false);
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigForm((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  };


  const handleSaveConfig = async () => {
    if (!branchId) return;

    setIsSavingConfig(true);
    setError("");
    setMessage("");

    try {
      await branchConfigService.upsertConfig({
        BranchID: branchId,
        ...configForm,
      });

      setIsEditingConfig(false);
      setMessage("Đã lưu cấu hình dịch vụ.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSavingConfig(false);
    }
  };

  const openCreateServiceModal = () => {
    setEditingBranchService(null);
    setBranchServiceForm(emptyBranchServiceForm);
    setServiceError("");
    setServiceMessage("");
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (item: BranchServiceAssignment) => {
    setEditingBranchService(item);
    setBranchServiceForm({
      ServiceID: String(item.ServiceID),
      Status: (item.Status as "Active" | "Inactive") || "Active",
      PriceOverride: item.PriceOverride !== null && item.PriceOverride !== undefined ? String(item.PriceOverride) : "",
    });
    setServiceError("");
    setServiceMessage("");
    setIsServiceModalOpen(true);
  };

  const handleBranchServiceInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBranchServiceForm((prev) => ({ ...prev, [name]: value }));
    setServiceError("");
  };

  const validateBranchServiceForm = () => {
    if (!editingBranchService && !branchServiceForm.ServiceID) {
      setServiceError("Vui lòng chọn dịch vụ");
      return false;
    }

    if (branchServiceForm.PriceOverride) {
      const price = Number(branchServiceForm.PriceOverride);
      if (!Number.isFinite(price) || price <= 0) {
        setServiceError("Giá override phải lớn hơn 0");
        return false;
      }
    }

    return true;
  };

  const handleBranchServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBranchServiceForm()) return;

    setIsServiceSaving(true);
    setServiceError("");
    setServiceMessage("");

    try {
      const payloadBase = {
        PriceOverride: branchServiceForm.PriceOverride ? Number(branchServiceForm.PriceOverride) : null,
        Status: branchServiceForm.Status,
      };

      if (editingBranchService) {
        await branchServiceAssignmentService.updateAssignment(
          editingBranchService.BranchServiceID,
          payloadBase as BranchServiceUpdatePayload
        );
        setServiceMessage("Cập nhật dịch vụ thành công!");
      } else {
        const payload: BranchServicePayload = {
          BranchID: branchId!,
          ServiceID: Number(branchServiceForm.ServiceID),
          ...payloadBase,
        };
        await branchServiceAssignmentService.createAssignment(payload);
        setServiceMessage("Gán dịch vụ thành công!");
      }

      setTimeout(() => {
        setIsServiceModalOpen(false);
        setEditingBranchService(null);
        setBranchServiceForm(emptyBranchServiceForm);
        setServiceMessage("");
        fetchBranchServices();
      }, 1000);
    } catch (err) {
      setServiceError(getErrorMessage(err));
    } finally {
      setIsServiceSaving(false);
    }
  };

  const handleDeleteBranchService = async (item: BranchServiceAssignment) => {
    if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ ${item.Services?.ServiceName || "này"} không?`)) {
      return;
    }

    setIsServiceLoading(true);
    try {
      await branchServiceAssignmentService.deleteAssignment(item.BranchServiceID);
      setServiceMessage("Xóa dịch vụ thành công!");
      await fetchBranchServices();
    } catch (err) {
      setServiceError(getErrorMessage(err));
    } finally {
      setIsServiceLoading(false);
    }
  };

  if (isLoading && !branchInfo) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!branchInfo) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Không có thông tin chi nhánh</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            <Settings2 size={14} />
            Cấu hình chi nhánh
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">Thông tin Chi nhánh</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Dữ liệu hiển thị sẵn, chỉ bật nhập liệu khi bấm Chỉnh sửa.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Settings2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Thông tin chi nhánh</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Tên chi nhánh" value={branchInfo.branchName} />
          <InfoCard label="Địa chỉ" value={branchInfo.address || "Chưa cập nhật"} />
          <InfoCard label="Số điện thoại" value={branchInfo.phone || "Chưa cập nhật"} />
          <InfoCard label="Giờ mở cửa" value={formatTime(branchInfo.openTime)} />
          <InfoCard label="Giờ đóng cửa" value={formatTime(branchInfo.closeTime)} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Cấu hình dịch vụ</h2>
             
            </div>
          </div>

          {!isEditingConfig ? (
            <button
              onClick={() => setIsEditingConfig(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditingConfig(false);
                  fetchData();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Save size={16} />
                {isSavingConfig ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ConfigField
            label="Thời lượng mỗi slot (phút)"
            value={configForm.SlotDuration}
            isEditing={isEditingConfig}
            name="SlotDuration"
            onChange={handleConfigChange}
          />
          <ConfigField
            label="Số khu rửa xe"
            value={configForm.TotalWashBays}
            isEditing={isEditingConfig}
            name="TotalWashBays"
            onChange={handleConfigChange}
          />
          <ConfigField
            label="Thời gian đệm (phút)"
            value={configForm.BufferMinutes}
            isEditing={isEditingConfig}
            name="BufferMinutes"
            onChange={handleConfigChange}
          />
          <ConfigField
            label="Tối đa xe mỗi booking"
            value={configForm.MaxCarsPerBooking}
            isEditing={isEditingConfig}
            name="MaxCarsPerBooking"
            onChange={handleConfigChange}
          />
          <ConfigField
            label="Giờ được hủy trước"
            value={configForm.CancelWindowHours}
            isEditing={isEditingConfig}
            name="CancelWindowHours"
            onChange={handleConfigChange}
          />
        </div>

      </section>

      {false && (
      <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Settings2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">CRUD Dịch vụ rửa xe</h2>
              <p className="text-sm text-slate-500">Gán dịch vụ vào chi nhánh, chỉnh sửa giá override và ẩn dịch vụ khi cần</p>
            </div>
          </div>

          <button
            onClick={openCreateServiceModal}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            <Plus size={16} />
            Gán dịch vụ mới
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
            placeholder="Tìm theo tên dịch vụ..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {serviceError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serviceError}
          </div>
        )}

        {serviceMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {serviceMessage}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Dịch vụ</th>
                <th className="px-6 py-4">Giá gốc</th>
                <th className="px-6 py-4">Giá override</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isServiceLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Đang tải dịch vụ...</td>
                </tr>
              ) : branchServices.filter((item) =>
                  (item.Services?.ServiceName || "").toLowerCase().includes(serviceSearch.toLowerCase())
                ).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Chưa có dịch vụ nào được gán cho chi nhánh
                  </td>
                </tr>
              ) : (
                branchServices
                  .filter((item) =>
                    (item.Services?.ServiceName || "").toLowerCase().includes(serviceSearch.toLowerCase())
                  )
                  .map((item) => (
                    <tr key={item.BranchServiceID} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{item.Services?.ServiceName || "Chưa cập nhật"}</p>
                          <p className="text-xs text-slate-500">{item.Services?.Description || "Không có mô tả"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatMoney(Number(item.Services?.BasePrice || 0))}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.PriceOverride !== null && item.PriceOverride !== undefined
                          ? formatMoney(Number(item.PriceOverride))
                          : "Không override"}
                      </td>
                      <td className="px-6 py-4">
                        {item.Status === "Active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Không hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditServiceModal(item)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                            title="Sửa dịch vụ"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBranchService(item)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingBranchService ? "Cập nhật dịch vụ rửa xe" : "Gán dịch vụ rửa xe"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {editingBranchService
                    ? "Chỉnh sửa giá override hoặc trạng thái dịch vụ của chi nhánh"
                    : "Chọn dịch vụ có sẵn để gán vào chi nhánh hiện tại"}
                </p>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBranchServiceSubmit} className="space-y-4 p-5">
              {serviceError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {serviceError}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Dịch vụ gốc <span className="text-red-500">*</span></label>
                  <select
                    name="ServiceID"
                    value={branchServiceForm.ServiceID}
                    onChange={handleBranchServiceInputChange}
                    disabled={Boolean(editingBranchService)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
                  >
                    <option value="">Chọn dịch vụ</option>
                    {serviceCatalog.map((service) => (
                      <option key={service.ServiceID} value={service.ServiceID}>
                        {service.ServiceName} - {formatMoney(Number(service.BasePrice || 0))}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Giá override</label>
                  <input
                    type="number"
                    name="PriceOverride"
                    min={0}
                    step={1000}
                    value={branchServiceForm.PriceOverride}
                    onChange={handleBranchServiceInputChange}
                    placeholder="Để trống nếu dùng giá gốc"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Trạng thái</label>
                  <select
                    name="Status"
                    value={branchServiceForm.Status}
                    onChange={handleBranchServiceInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isServiceSaving}
                  className="flex-1 rounded-lg bg-amber-600 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {isServiceSaving ? "Đang lưu..." : editingBranchService ? "Cập nhật" : "Gán dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ConfigField({
  label,
  name,
  value,
  onChange,
  isEditing,
}: {
  label: string;
  name: keyof ConfigFormState;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      {isEditing ? (
        <input
          type="number"
          min={0}
          name={name}
          value={value}
          onChange={onChange}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      ) : (
        <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
      )}
    </div>
  );
}

function formatTime(value: string | null | undefined) {
  if (!value) return "Chưa cập nhật";
  const text = String(value);
  if (text.includes("T")) return text.substring(11, 16);
  return text.substring(0, 5);
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default ManagerBranchInfo;
