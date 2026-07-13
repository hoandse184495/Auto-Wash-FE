import { useState, useEffect } from "react";
import {
  CalendarClock,
  Edit,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  Trash2,
  X,
  Check,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

interface Staff {
  UserID: number;
  FullName: string;
  Email: string;
  Phone: string;
  Role: string;
  Status: string;
  CreatedAt: string;
}

interface RegisterFormData {
  Password: string;
  ConfirmPassword: string;
  FullName: string;
  Email: string;
  Phone: string;
}

interface ShiftOption {
  ShiftID: number;
  ShiftName: string;
  StartTime: string;
  EndTime: string;
  Status: string;
}

interface ShiftFormData {
  ShiftName: string;
  StartTime: string;
  EndTime: string;
  Status: "Active" | "Inactive";
}

interface StaffScheduleItem {
  ScheduleID: number;
  UserID?: number;
  ShiftID?: number;
  WorkDate: string;
  Status: string;
  Users?: {
    FullName?: string;
    Phone?: string;
    BranchID?: number;
  };
  Shifts?: {
    ShiftName?: string;
    StartTime?: string;
    EndTime?: string;
  };
}

interface ScheduleFormData {
  UserID: string;
  WorkDate: string;
  ShiftID: string;
}

const emptyScheduleForm: ScheduleFormData = {
  UserID: "",
  WorkDate: "",
  ShiftID: "",
};

const emptyShiftForm: ShiftFormData = {
  ShiftName: "",
  StartTime: "",
  EndTime: "",
  Status: "Active",
};

const ManagerStaffManagement = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [scheduleList, setScheduleList] = useState<StaffScheduleItem[]>([]);
  const [shiftList, setShiftList] = useState<ShiftOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<RegisterFormData>({
    Password: "",
    ConfirmPassword: "",
    FullName: "",
    Email: "",
    Phone: "",
  });
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>(emptyScheduleForm);
  const [editingSchedule, setEditingSchedule] = useState<StaffScheduleItem | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftOption | null>(null);
  const [shiftForm, setShiftForm] = useState<ShiftFormData>(emptyShiftForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState<number | null>(null);
  const [shiftError, setShiftError] = useState("");
  const [shiftSuccess, setShiftSuccess] = useState("");
  const [isSavingShift, setIsSavingShift] = useState(false);
  const [deletingShiftId, setDeletingShiftId] = useState<number | null>(null);
  const [scheduleDateFilter, setScheduleDateFilter] = useState(() => new Date().toISOString().substring(0, 10));

  const branchId = getCurrentBranchId();

  useEffect(() => {
    fetchStaffList();
    fetchShifts();
    fetchSchedules();
  }, []);

  function getCurrentBranchId() {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      return Number(user?.branchId ?? user?.BranchID ?? 0) || null;
    } catch {
      return null;
    }
  }

  const fetchStaffList = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params: Record<string, string | number> = { Role: "Staff" };
      if (branchId) {
        params.BranchID = branchId;
      }
      const response = await axiosClient.get("/api/users", { // GET /api/users?Role=Staff
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStaffList(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching staff:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShifts = async () => {
    setLoadingShifts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get("/api/shifts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setShiftList(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching shifts:", err);
    } finally {
      setLoadingShifts(false);
    }
  };

  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get("/api/staff-schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setScheduleList(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.FullName || !formData.Password) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (formData.Password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (formData.Password !== formData.ConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }

    if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      setError("Email không hợp lệ");
      return false;
    }

    if (formData.Phone && !/^[0-9]{10,11}$/.test(formData.Phone)) {
      setError("Số điện thoại phải có 10-11 chữ số");
      return false;
    }

    return true;
  };

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.FullName) {
      setError("Vui lòng điền họ và tên");
      return;
    }

    if (!editingStaff && !formData.Password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    if (!editingStaff && !validateForm()) return;

    if (editingStaff && formData.Password && formData.Password !== formData.ConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const payload: Record<string, string> = {
        FullName: formData.FullName,
        Email: formData.Email,
        Phone: formData.Phone,
      };

      if (formData.Password) {
        payload.Password = formData.Password;
      }

      const response = editingStaff
        ? await axiosClient.put(`/api/users/${editingStaff.UserID}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axiosClient.post(
            "/api/users",
            {
              ...payload,
              Password: formData.Password,
              Role: "Staff",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

      if (response.data.success) {
        setSuccess(editingStaff ? "Cập nhật nhân viên thành công!" : "Đăng ký nhân viên thành công!");
        setFormData({
          Password: "",
          ConfirmPassword: "",
          FullName: "",
          Email: "",
          Phone: "",
        });

        setTimeout(() => {
          setIsModalOpen(false);
          setEditingStaff(null);
          setSuccess("");
          fetchStaffList();
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (editingStaff ? "Đã xảy ra lỗi khi cập nhật nhân viên" : "Đã xảy ra lỗi khi đăng ký nhân viên")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateStaffModal = () => {
    setEditingStaff(null);
    setFormData({
      Password: "",
      ConfirmPassword: "",
      FullName: "",
      Email: "",
      Phone: "",
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditStaffModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      Password: "",
      ConfirmPassword: "",
      FullName: staff.FullName || "",
      Email: staff.Email || "",
      Phone: staff.Phone || "",
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (staff: Staff) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên ${staff.FullName} không?`)) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.delete(`/api/users/${staff.UserID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess("Xóa nhân viên thành công!");
        fetchStaffList();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi xóa nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateScheduleModal = () => {
    setEditingSchedule(null);
    setScheduleForm(emptyScheduleForm);
    setScheduleError("");
    setScheduleSuccess("");
    setIsScheduleModalOpen(true);
  };

  const openEditScheduleModal = (schedule: StaffScheduleItem) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      UserID: String(schedule.UserID || ""),
      WorkDate: String(schedule.WorkDate || "").substring(0, 10),
      ShiftID: String(schedule.ShiftID || ""),
    });
    setScheduleError("");
    setScheduleSuccess("");
    setIsScheduleModalOpen(true);
  };

  const handleScheduleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({ ...prev, [name]: value }));
    setScheduleError("");
  };

  const validateScheduleForm = () => {
    if (!scheduleForm.UserID) {
      setScheduleError("Vui lòng chọn nhân viên");
      return false;
    }

    if (!scheduleForm.WorkDate) {
      setScheduleError("Vui lòng chọn ngày làm việc");
      return false;
    }

    if (!scheduleForm.ShiftID) {
      setScheduleError("Vui lòng chọn ca làm việc");
      return false;
    }

    return true;
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateScheduleForm()) return;

    setIsSavingSchedule(true);
    setScheduleError("");
    setScheduleSuccess("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        UserID: Number(scheduleForm.UserID),
        WorkDate: scheduleForm.WorkDate,
        ShiftID: Number(scheduleForm.ShiftID),
      };

      if (editingSchedule) {
        await axiosClient.put(
          `/api/staff-schedules/${editingSchedule.ScheduleID}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setScheduleSuccess("Cập nhật lịch làm việc thành công!");
      } else {
        await axiosClient.post("/api/staff-schedules", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScheduleSuccess("Xếp lịch làm việc thành công!");
      }

      setTimeout(() => {
        setIsScheduleModalOpen(false);
        setEditingSchedule(null);
        setScheduleForm(emptyScheduleForm);
        setScheduleSuccess("");
        fetchSchedules();
      }, 1000);
    } catch (err: any) {
      setScheduleError(
        err.response?.data?.message || "Đã xảy ra lỗi khi lưu lịch làm việc"
      );
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch làm việc này không?")) {
      return;
    }

    setDeletingScheduleId(scheduleId);
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/api/staff-schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSchedules();
    } catch (err: any) {
      setScheduleError(
        err.response?.data?.message || "Đã xảy ra lỗi khi xóa lịch làm việc"
      );
    } finally {
      setDeletingScheduleId(null);
    }
  };

  const openCreateShiftModal = () => {
    setEditingShift(null);
    setShiftForm(emptyShiftForm);
    setShiftError("");
    setShiftSuccess("");
    setIsShiftModalOpen(true);
  };

  const openEditShiftModal = (shift: ShiftOption) => {
    setEditingShift(shift);
    setShiftForm({
      ShiftName: shift.ShiftName || "",
      StartTime: shift.StartTime ? String(shift.StartTime).substring(0, 16) : "",
      EndTime: shift.EndTime ? String(shift.EndTime).substring(0, 16) : "",
      Status: (shift.Status as "Active" | "Inactive") || "Active",
    });
    setShiftError("");
    setShiftSuccess("");
    setIsShiftModalOpen(true);
  };

  const handleShiftInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShiftForm((prev) => ({ ...prev, [name]: value }));
    setShiftError("");
  };

  const formatInputDateTime = (value: string) => {
    if (!value) return "";
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    return normalized.substring(0, 16);
  };

  const validateShiftForm = () => {
    if (!shiftForm.ShiftName.trim()) {
      setShiftError("Vui lòng nhập tên ca làm việc");
      return false;
    }

    if (!shiftForm.StartTime || !shiftForm.EndTime) {
      setShiftError("Vui lòng chọn giờ bắt đầu và giờ kết thúc");
      return false;
    }

    if (new Date(shiftForm.StartTime) >= new Date(shiftForm.EndTime)) {
      setShiftError("Giờ kết thúc phải lớn hơn giờ bắt đầu");
      return false;
    }

    return true;
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShiftForm()) return;

    setIsSavingShift(true);
    setShiftError("");
    setShiftSuccess("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ShiftName: shiftForm.ShiftName.trim(),
        StartTime: new Date(shiftForm.StartTime).toISOString(),
        EndTime: new Date(shiftForm.EndTime).toISOString(),
        ...(editingShift ? { Status: shiftForm.Status } : {}),
      };

      if (editingShift) {
        await axiosClient.put(`/api/shifts/${editingShift.ShiftID}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShiftSuccess("Cập nhật ca làm việc thành công!");
      } else {
        await axiosClient.post("/api/shifts", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShiftSuccess("Thêm ca làm việc thành công!");
      }

      setTimeout(() => {
        setIsShiftModalOpen(false);
        setEditingShift(null);
        setShiftForm(emptyShiftForm);
        setShiftSuccess("");
        fetchShifts();
      }, 1000);
    } catch (err: any) {
      setShiftError(err.response?.data?.message || "Đã xảy ra lỗi khi lưu ca làm việc");
    } finally {
      setIsSavingShift(false);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa ca làm việc này không?")) {
      return;
    }

    setDeletingShiftId(shiftId);
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/api/shifts/${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchShifts();
    } catch (err: any) {
      setShiftError(err.response?.data?.message || "Đã xảy ra lỗi khi xóa ca làm việc");
    } finally {
      setDeletingShiftId(null);
    }
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      (staff.FullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.Email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Hoạt động
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
        Không hoạt động
      </span>
    );
  };

  const formatTime = (value?: string | null) => {
    if (!value) return "--:--";
    const text = String(value);
    if (text.includes("T")) return text.substring(11, 16);
    return text.substring(0, 5);
  };

  const formatDateTimeInputValue = (value?: string | null) => {
    if (!value) return "";
    return formatInputDateTime(String(value));
  };

  const formatWorkDate = (value: string) => {
    return new Date(value).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const selectedScheduleDate = scheduleDateFilter || new Date().toISOString().substring(0, 10);
  const selectedSchedules = scheduleList
    .filter((schedule) => String(schedule.WorkDate).substring(0, 10) === selectedScheduleDate)
    .sort((left, right) => {
      const leftShift = left.Shifts?.StartTime || "";
      const rightShift = right.Shifts?.StartTime || "";
      return leftShift.localeCompare(rightShift);
    });
  const activeShiftOptions = shiftList.filter((shift) => shift.Status === "Active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý Nhân viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý tài khoản nhân viên tại chi nhánh của bạn
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openCreateScheduleModal}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            <CalendarClock size={18} />
            Xếp Lịch Làm Việc
          </button>

          <button
            onClick={openCreateStaffModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Đăng ký Nhân viên
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy nhân viên nào
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.UserID}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                          {(staff.FullName || "?").charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {staff.FullName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {staff.Email || "Chưa cập nhật"}
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {staff.Phone || "Chưa cập nhật"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        <Shield size={12} />
                        {staff.Role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(staff.Status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(staff.CreatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditStaffModal(staff)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                          title="Sửa nhân viên"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff)}
                          disabled={isLoading}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Xóa nhân viên"
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

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-500">
            Hiển thị {filteredStaff.length} trong {staffList.length} nhân viên
          </p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50" disabled>
              Trước
            </button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Staff Schedule Management */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Quản lý Lịch làm việc</h2>
            <p className="mt-1 text-sm text-slate-500">
              Xếp lịch cho nhân viên, xem các ca đã được phân công và chỉnh sửa/xóa khi cần.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <CalendarClock size={16} className="text-slate-400" />
              <input
                type="date"
                value={scheduleDateFilter}
                onChange={(e) => setScheduleDateFilter(e.target.value || new Date().toISOString().substring(0, 10))}
                className="bg-transparent text-sm text-slate-700 outline-none"
                title="Lọc theo ngày"
              />
            </div>

            <button
              onClick={openCreateScheduleModal}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Xếp lịch mới
            </button>
          </div>
        </div>

        {scheduleError && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {scheduleError}
          </div>
        )}

        {scheduleSuccess && (
          <div className="mx-6 mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Check size={16} />
            {scheduleSuccess}
          </div>
        )}

        <div className="space-y-4 p-6">
          {loadingSchedules ? (
            <div className="py-8 text-center text-sm text-slate-500">Đang tải lịch làm việc...</div>
          ) : selectedSchedules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Không có lịch làm việc vào ngày {formatWorkDate(selectedScheduleDate)}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {formatWorkDate(selectedScheduleDate)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedSchedules.length} lịch làm việc
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  Mặc định: hôm nay
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Nhân viên</th>
                      <th className="px-6 py-4">Ca làm việc</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSchedules.map((schedule) => (
                      <tr key={schedule.ScheduleID} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-800">
                              {schedule.Users?.FullName || "Chưa cập nhật"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {schedule.Users?.Phone || "Chưa cập nhật"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <p className="font-medium text-slate-800">
                            {schedule.Shifts?.ShiftName || "Chưa cập nhật"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatTime(schedule.Shifts?.StartTime)} - {formatTime(schedule.Shifts?.EndTime)}
                          </p>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(schedule.Status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openEditScheduleModal(schedule)}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                              title="Sửa lịch"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.ScheduleID)}
                              disabled={deletingScheduleId === schedule.ScheduleID}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Xóa lịch"
                            >
                              {deletingScheduleId === schedule.ScheduleID ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingSchedule ? "Cập nhật lịch làm việc" : "Xếp lịch làm việc"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {editingSchedule
                    ? "Chỉ thay đổi ngày, ca hoặc hệ số"
                    : "Chọn nhân viên, ngày và ca để xếp lịch"}
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 p-5">
              {scheduleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {scheduleError}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nhân viên <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="UserID"
                    value={scheduleForm.UserID}
                    onChange={handleScheduleInputChange}
                    disabled={Boolean(editingSchedule)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
                  >
                    <option value="">
                      {editingSchedule ? "Không thể đổi nhân viên" : "Chọn nhân viên"}
                    </option>
                    {staffList.map((staff) => (
                      <option key={staff.UserID} value={staff.UserID}>
                        {staff.FullName} - {staff.Phone || "Chưa cập nhật"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Ngày làm việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="WorkDate"
                    value={scheduleForm.WorkDate}
                    onChange={handleScheduleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Ca làm việc <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ShiftID"
                    value={scheduleForm.ShiftID}
                    onChange={handleScheduleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">
                      {loadingShifts ? "Đang tải ca..." : "Chọn ca làm việc"}
                    </option>
                    {activeShiftOptions.map((shift) => (
                      <option key={shift.ShiftID} value={shift.ShiftID}>
                        {shift.ShiftName} ({formatTime(shift.StartTime)} - {formatTime(shift.EndTime)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingSchedule}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {isSavingSchedule ? "Đang lưu..." : editingSchedule ? "Cập nhật" : "Xếp lịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Management */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Quản lý Ca làm việc</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tạo, chỉnh sửa và ẩn ca làm việc dùng cho xếp lịch nhân viên.
            </p>
          </div>

          <button
            onClick={openCreateShiftModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Ca mới
          </button>
        </div>

        {shiftError && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {shiftError}
          </div>
        )}

        {shiftSuccess && (
          <div className="mx-6 mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Check size={16} />
            {shiftSuccess}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Tên ca</th>
                <th className="px-6 py-4">Giờ bắt đầu</th>
                <th className="px-6 py-4">Giờ kết thúc</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingShifts ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Đang tải ca làm việc...
                  </td>
                </tr>
              ) : shiftList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Chưa có ca làm việc nào
                  </td>
                </tr>
              ) : (
                shiftList.map((shift) => (
                  <tr key={shift.ShiftID} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{shift.ShiftName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatTime(shift.StartTime)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatTime(shift.EndTime)}</td>
                    <td className="px-6 py-4">
                      {shift.Status === "Active" ? (
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
                          onClick={() => openEditShiftModal(shift)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                          title="Sửa ca"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.ShiftID)}
                          disabled={deletingShiftId === shift.ShiftID}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Xóa ca"
                        >
                          {deletingShiftId === shift.ShiftID ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingShift ? "Cập nhật ca làm việc" : "Tạo ca làm việc"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {editingShift
                    ? "Chỉnh sửa thông tin ca hoặc trạng thái hoạt động"
                    : "Tạo ca mới cho việc xếp lịch nhân viên"}
                </p>
              </div>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleShiftSubmit} className="space-y-4 p-5">
              {shiftError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {shiftError}
                </div>
              )}

              {shiftSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <Check size={16} />
                  {shiftSuccess}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tên ca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ShiftName"
                    value={shiftForm.ShiftName}
                    onChange={handleShiftInputChange}
                    placeholder="Ví dụ: Ca sáng"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="StartTime"
                    value={formatDateTimeInputValue(shiftForm.StartTime)}
                    onChange={handleShiftInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="EndTime"
                    value={formatDateTimeInputValue(shiftForm.EndTime)}
                    onChange={handleShiftInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Trạng thái
                  </label>
                  <select
                    name="Status"
                    value={shiftForm.Status}
                    onChange={handleShiftInputChange}
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
                  onClick={() => setIsShiftModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingShift}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isSavingShift ? "Đang lưu..." : editingShift ? "Cập nhật" : "Tạo ca"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingStaff ? "Cập nhật Nhân viên" : "Đăng ký Nhân viên mới"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {editingStaff
                    ? "Chỉnh sửa thông tin nhân viên tại chi nhánh của bạn"
                    : "Tạo tài khoản cho nhân viên tại chi nhánh của bạn"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRegisterStaff} className="p-5 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600 flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại (10-11 số)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mật khẩu {editingStaff ? "(để trống nếu không đổi)" : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleInputChange}
                  placeholder={editingStaff ? "Bỏ trống nếu không đổi mật khẩu" : "Ít nhất 6 ký tự"}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Xác nhận mật khẩu {editingStaff ? "(chỉ khi đổi mật khẩu)" : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="ConfirmPassword"
                  value={formData.ConfirmPassword}
                  onChange={handleInputChange}
                  placeholder={editingStaff ? "Nhập lại mật khẩu mới nếu có" : "Nhập lại mật khẩu"}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    editingStaff ? "Cập nhật" : "Đăng ký"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerStaffManagement;
