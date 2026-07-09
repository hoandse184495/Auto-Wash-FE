import axiosClient, { getErrorMessage } from "../../api/axiosClient";

export type StaffItemStatus =
  | "Pending"
  | "CheckedIn"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type StaffServiceLineItem = {
  Services?: {
    ServiceName?: string;
  };
};

export type StaffBookingItem = {
  BookingItemID: number;
  Status: StaffItemStatus | string;
  CheckInAt?: string | null;
  WashStartAt?: string | null;
  CompletedAt?: string | null;
  Vehicles?: {
    LicensePlate?: string;
    Brand?: string | null;
    Model?: string | null;
  };
  ServiceLineItems?: StaffServiceLineItem[];
};

export type StaffBooking = {
  BookingGroupID: number;
  BookingCode?: string;
  BranchID: number;
  BookingDate: string;
  StartTime: string;
  Status?: string;
  Customers?: {
    Users?: {
      FullName?: string;
      Phone?: string;
    };
  };
  BookingItems?: StaffBookingItem[];
};

export type StaffFlatItem = {
  bookingGroupId: number;
  bookingItemId: number;
  bookingCode: string;
  branchId: number;
  bookingDate: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  vehicleName: string;
  serviceNames: string[];
  status: StaffItemStatus | string;
  checkInAt?: string | null;
  washStartAt?: string | null;
  completedAt?: string | null;
};

export type BranchServiceOption = {
  ServiceID: number;
  ServiceName: string;
  BasePrice?: number | string;
  PriceOverride?: number | string | null;
  ActualPrice?: number | string | null;
};

export type StaffTransaction = {
  TransactionID: number;
  BookingGroupID?: number | null;
  CustomerID: number;
  Subtotal?: number | string | null;
  DiscountAmount?: number | string | null;
  FinalAmount?: number | string | null;
  Status?: string | null;
  CreatedAt?: string | null;
};

export type StaffInvoice = {
  InvoiceID: number;
  TransactionID: number;
  InvoiceNo?: string | null;
  IssuedAt?: string | null;
  Status?: string | null;
};

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getUserFromStorage() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function formatTime(value: string | null | undefined) {
  if (!value) {
    return "--:--";
  }

  const text = String(value);

  if (text.includes("T")) {
    return text.substring(11, 16);
  }

  return text.substring(0, 5);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "--/--/----";
  }

  return new Date(value).toLocaleDateString("vi-VN");
}

export function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return amount.toLocaleString("vi-VN");
}

export function getServicesText(item: Pick<StaffFlatItem, "serviceNames">) {
  if (!item.serviceNames.length) {
    return "Chưa có dịch vụ";
  }

  return item.serviceNames.join(", ");
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    Pending: "Chờ xử lý",
    CheckedIn: "Đã check-in",
    InProgress: "Đang rửa",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
  };

  return labels[status] || status;
}

export function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    CheckedIn: "bg-blue-100 text-blue-700",
    InProgress: "bg-purple-100 text-purple-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return classes[status] || "bg-slate-100 text-slate-700";
}

export function getNextStatus(status: string) {
  if (status === "Pending") {
    return { label: "Check-in", status: "CheckedIn" };
  }

  if (status === "CheckedIn") {
    return { label: "Bắt đầu rửa", status: "InProgress" };
  }

  if (status === "InProgress") {
    return { label: "Hoàn thành", status: "Completed" };
  }

  return null;
}

export function flattenStaffBookings(bookings: StaffBooking[]): StaffFlatItem[] {
  const flattened = bookings.flatMap((booking) => {
    const customerName = booking.Customers?.Users?.FullName || "Chưa có tên";
    const customerPhone = booking.Customers?.Users?.Phone || "Chưa có SĐT";
    const items = booking.BookingItems || [];

    return items.map((item) => {
      const serviceNames =
        item.ServiceLineItems?.map((line) => line.Services?.ServiceName).filter(
          (name): name is string => Boolean(name)
        ) || [];

      const brand = item.Vehicles?.Brand || "";
      const model = item.Vehicles?.Model || "";

      return {
        bookingGroupId: booking.BookingGroupID,
        bookingItemId: item.BookingItemID,
        bookingCode:
          booking.BookingCode ||
          `BG-${booking.BookingGroupID}-${item.BookingItemID}`,
        branchId: booking.BranchID,
        bookingDate: booking.BookingDate,
        startTime: booking.StartTime,
        customerName,
        customerPhone,
        licensePlate: item.Vehicles?.LicensePlate || "Chưa có biển số",
        vehicleName: [brand, model].filter(Boolean).join(" ") || "Chưa cập nhật",
        serviceNames,
        status: item.Status || "Pending",
        checkInAt: item.CheckInAt,
        washStartAt: item.WashStartAt,
        completedAt: item.CompletedAt,
      };
    });
  });

  const statusPriority: Record<string, number> = {
    Cancelled: 0,
    Pending: 1,
    Confirmed: 2,
    CheckedIn: 3,
    InProgress: 4,
    Completed: 5,
  };

  const deduped = new Map<string, StaffFlatItem>();

  for (const item of flattened) {
    const vehicleKey = item.licensePlate.trim().toUpperCase() || `VID-${item.bookingItemId}`;
    const dateKey = item.bookingDate ? new Date(item.bookingDate).toISOString().slice(0, 10) : "NO_DATE";
    const timeKey = item.startTime ? formatTime(item.startTime) : "NO_TIME";
    const key = [item.branchId, item.customerPhone, dateKey, timeKey, vehicleKey].join("|");

    const current = deduped.get(key);
    if (!current) {
      deduped.set(key, item);
      continue;
    }

    const currentPriority = statusPriority[current.status] ?? 0;
    const candidatePriority = statusPriority[item.status] ?? 0;

    if (candidatePriority > currentPriority) {
      deduped.set(key, item);
      continue;
    }

    if (candidatePriority === currentPriority && item.bookingItemId > current.bookingItemId) {
      deduped.set(key, item);
    }
  }

  return Array.from(deduped.values());
}

export async function fetchTodayBookings(params?: {
  customerName?: string;
  status?: string;
  bookingDate?: string;
}) {
  try {
    const response = await axiosClient.get("/api/staff-operations/today-bookings", {
      params,
      headers: authHeaders(),
    });

    return (response.data.data || []) as StaffBooking[];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateBookingItemStatus(
  bookingItemId: number,
  status: string
) {
  try {
    await axiosClient.patch(
      `/api/staff-operations/booking-items/${bookingItemId}/status`,
      { status },
      { headers: authHeaders() }
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function addServicesToBookingItem(
  bookingItemId: number,
  serviceIds: number[]
) {
  try {
    await axiosClient.post(
      `/api/staff-operations/booking-items/${bookingItemId}/add-services`,
      { serviceIds },
      { headers: authHeaders() }
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchBranchServices(branchId: number) {
  try {
    const response = await axiosClient.get(`/api/branches/${branchId}/services`);
    return (response.data.data || []) as BranchServiceOption[];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createTransactionFromBooking(bookingGroupId: number) {
  try {
    const response = await axiosClient.post(
      `/api/transactions/from-booking/${bookingGroupId}`,
      {},
      { headers: authHeaders() }
    );

    return response.data.data as StaffTransaction;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function payTransactionManual(
  transactionId: number,
  method: "CASH" | "BANK_TRANSFER"
) {
  try {
    const response = await axiosClient.post(
      `/api/transactions/${transactionId}/pay-manual`,
      { method },
      { headers: authHeaders() }
    );

    return response.data.data as StaffTransaction;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function generateInvoice(transactionId: number) {
  try {
    const response = await axiosClient.post(
      `/api/invoices/generate/${transactionId}`,
      {},
      { headers: authHeaders() }
    );

    return response.data.data as StaffInvoice;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
