import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Filter,
  Phone,
  ReceiptText,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import {
  addServicesToBookingItem,
  fetchBranchPaymentInfo,
  createTransactionFromBooking,
  fetchBranchServices,
  fetchTodayBookings,
  flattenStaffBookings,
  formatDate,
  getDisplayStatus,
  formatMoney,
  formatTime,
  generateInvoice,
  getNextStatus,
  getServicesText,
  getStatusClass,
  getStatusLabel,
  getTodayInputValue,
  payTransactionManual,
  updateBookingItemStatus,
} from "./staffOperations";
import type {
  BranchPaymentInfo,
  BranchServiceOption,
  StaffFlatItem,
  StaffInvoice,
  StaffTransaction,
} from "./staffOperations";

const statuses = [
  { value: "all", label: "Tất cả" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "CheckedIn", label: "Đã check-in" },
  { value: "InProgress", label: "Đang rửa" },
  { value: "AwaitingPayment", label: "Chờ thanh toán" },
  { value: "Completed", label: "Hoàn thành" },
];

function priceOf(service: BranchServiceOption) {
  return service.ActualPrice ?? service.PriceOverride ?? service.BasePrice ?? 0;
}

const StaffBookings = () => {
  const [items, setItems] = useState<StaffFlatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingDate, setBookingDate] = useState(getTodayInputValue());
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<StaffFlatItem | null>(null);
  const [serviceOptions, setServiceOptions] = useState<BranchServiceOption[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [isServicePanelOpen, setIsServicePanelOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState<StaffFlatItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [paymentTransaction, setPaymentTransaction] = useState<StaffTransaction | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<StaffInvoice | null>(null);
  const [paymentBranchInfo, setPaymentBranchInfo] = useState<BranchPaymentInfo | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [bookingDate]);

  async function loadBookings() {
    try {
      setIsLoading(true);
      setMessage("");
      const bookings = await fetchTodayBookings({ bookingDate });
      setItems(flattenStaffBookings(bookings));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được lịch hẹn");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(item: StaffFlatItem, status: string) {
    try {
      setIsUpdating(true);
      setMessage("");
      await updateBookingItemStatus(item.bookingItemId, status);
      setSelectedItem(null);
      await loadBookings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại");
    } finally {
      setIsUpdating(false);
    }
  }

  async function openServicePanel(item: StaffFlatItem) {
    try {
      setSelectedItem(item);
      setSelectedServiceIds([]);
      setIsServicePanelOpen(true);
      setMessage("");
      const services = await fetchBranchServices(item.branchId);
      setServiceOptions(services);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được dịch vụ chi nhánh");
    }
  }

  async function handleAddServices() {
    if (!selectedItem || selectedServiceIds.length === 0) {
      setMessage("Vui lòng chọn ít nhất một dịch vụ phát sinh");
      return;
    }

    try {
      setIsUpdating(true);
      setMessage("");
      await addServicesToBookingItem(selectedItem.bookingItemId, selectedServiceIds);
      setIsServicePanelOpen(false);
      setSelectedServiceIds([]);
      setSelectedItem(null);
      await loadBookings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Thêm dịch vụ thất bại");
    } finally {
      setIsUpdating(false);
    }
  }

  async function openPaymentPanel(item: StaffFlatItem) {
    try {
      setIsPaymentLoading(true);
      setMessage("");
      setSelectedItem(null);
      setIsServicePanelOpen(false);
      setPaymentItem(item);
      setPaymentInvoice(null);
      setPaymentTransaction(null);
      setPaymentBranchInfo(null);
      setPaymentMethod("CASH");

      const [transaction, branchInfo] = await Promise.all([
        createTransactionFromBooking(item.bookingGroupId),
        fetchBranchPaymentInfo(item.branchId),
      ]);
      setPaymentTransaction(transaction);
      setPaymentBranchInfo(branchInfo);
    } catch (error) {
      setPaymentItem(null);
      setPaymentTransaction(null);
      setPaymentBranchInfo(null);
      setMessage(error instanceof Error ? error.message : "Không tạo được giao dịch thanh toán");
    } finally {
      setIsPaymentLoading(false);
    }
  }

  async function handleManualPayment() {
    if (!paymentTransaction) {
      return;
    }

    try {
      setIsPaymentLoading(true);
      setMessage("");
      const paidTransaction = await payTransactionManual(
        paymentTransaction.TransactionID,
        paymentMethod
      );
      setPaymentTransaction(paidTransaction);

      const invoice = await generateInvoice(paidTransaction.TransactionID);
      setPaymentInvoice(invoice);
      await loadBookings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Thanh toán hoặc xuất hóa đơn thất bại");
    } finally {
      setIsPaymentLoading(false);
    }
  }

  function closePaymentPanel() {
    setPaymentItem(null);
    setPaymentTransaction(null);
    setPaymentInvoice(null);
    setPaymentBranchInfo(null);
    setIsPaymentLoading(false);
  }

  function toggleService(serviceId: number) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  }

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const displayStatus = getDisplayStatus(item);
      const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;
      const matchesSearch =
        !keyword ||
        item.bookingCode.toLowerCase().includes(keyword) ||
        item.customerName.toLowerCase().includes(keyword) ||
        item.customerPhone.includes(searchTerm) ||
        item.licensePlate.toLowerCase().includes(keyword) ||
        item.vehicleName.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [items, searchTerm, statusFilter]);

  const stats = {
    total: items.length,
    waiting: items.filter((item) => item.status === "Pending").length,
    active: items.filter(
      (item) => item.status === "CheckedIn" || item.status === "InProgress"
    ).length,
    completed: items.filter((item) => getDisplayStatus(item) === "Completed").length,
  };

  const nextAction = selectedItem ? getNextStatus(selectedItem.status) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Đặt lịch</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi xe trong ngày, cập nhật trạng thái, thêm dịch vụ phát sinh và thu tại quầy.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SummaryCard icon={<CalendarCheck />} label="Tổng xe" value={stats.total} />
        <SummaryCard icon={<Clock3 />} label="Chờ xử lý" value={stats.waiting} />
        <SummaryCard icon={<Car />} label="Đang vận hành" value={stats.active} />
        <SummaryCard icon={<CheckCircle2 />} label="Hoàn thành" value={stats.completed} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative">
          <CalendarCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={bookingDate}
            onChange={(event) => setBookingDate(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 lg:w-52"
          />
        </div>

        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm mã booking, khách hàng, SĐT, biển số..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 lg:w-56"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Booking</th>
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Xe</th>
                <th className="px-5 py-4">Dịch vụ</th>
                <th className="px-5 py-4">Giờ</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Chưa có xe phù hợp
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.bookingItemId} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm font-semibold text-blue-600">{item.bookingCode}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.bookingDate)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{item.customerName}</p>
                      <p className="text-xs text-slate-500">{item.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono font-semibold text-slate-800">{item.licensePlate}</p>
                      <p className="text-xs text-slate-500">{item.vehicleName}</p>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-sm text-slate-600">{getServicesText(item)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{formatTime(item.startTime)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(getDisplayStatus(item))}`}
                      >
                        {getStatusLabel(getDisplayStatus(item))}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
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

      {selectedItem && !isServicePanelOpen && (
        <DetailModal
          item={selectedItem}
          isUpdating={isUpdating}
          nextAction={nextAction}
          onClose={() => setSelectedItem(null)}
          onNext={() => nextAction && handleStatusUpdate(selectedItem, nextAction.status)}
          onAddServices={() => openServicePanel(selectedItem)}
          onPayment={() => openPaymentPanel(selectedItem)}
        />
      )}

      {selectedItem && isServicePanelOpen && (
        <ServiceModal
          item={selectedItem}
          services={serviceOptions}
          selectedServiceIds={selectedServiceIds}
          isUpdating={isUpdating}
          onToggle={toggleService}
          onClose={() => {
            setIsServicePanelOpen(false);
            setSelectedServiceIds([]);
          }}
          onSubmit={handleAddServices}
        />
      )}

      {paymentItem && (
        <PaymentModal
          item={paymentItem}
          transaction={paymentTransaction}
          invoice={paymentInvoice}
          branchInfo={paymentBranchInfo}
          method={paymentMethod}
          isLoading={isPaymentLoading}
          onMethodChange={setPaymentMethod}
          onClose={closePaymentPanel}
          onPay={handleManualPayment}
        />
      )}
    </div>
  );
};

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function DetailModal({
  item,
  isUpdating,
  nextAction,
  onClose,
  onNext,
  onAddServices,
  onPayment,
}: {
  item: StaffFlatItem;
  isUpdating: boolean;
  nextAction: { label: string; status: string } | null;
  onClose: () => void;
  onNext: () => void;
  onAddServices: () => void;
  onPayment: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-800">Chi tiết xe</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Info label="Booking" value={item.bookingCode} />
          <Info label="Trạng thái" value={getStatusLabel(getDisplayStatus(item))} />
          <Info label="Khách hàng" value={item.customerName} icon={<User size={14} />} />
          <Info label="Số điện thoại" value={item.customerPhone} icon={<Phone size={14} />} />
          <Info label="Biển số" value={item.licensePlate} icon={<Car size={14} />} />
          <Info label="Xe" value={item.vehicleName} />
          <Info label="Ngày hẹn" value={formatDate(item.bookingDate)} />
          <Info label="Giờ hẹn" value={formatTime(item.startTime)} />
          <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
            <p className="text-xs text-slate-500">Dịch vụ</p>
            <p className="mt-1 font-medium text-slate-800">{getServicesText(item)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onAddServices}
            disabled={item.status === "Completed"}
            className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
          >
            Thêm dịch vụ
          </button>
          {item.status === "Completed" && (
            <button
              type="button"
              onClick={onPayment}
              className="flex-1 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Thanh toán
            </button>
          )}
          {nextAction && (
            <button
              type="button"
              onClick={onNext}
              disabled={isUpdating}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            >
              {isUpdating ? "Đang cập nhật..." : nextAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentModal({
  item,
  transaction,
  invoice,
  branchInfo,
  method,
  isLoading,
  onMethodChange,
  onClose,
  onPay,
}: {
  item: StaffFlatItem;
  transaction: StaffTransaction | null;
  invoice: StaffInvoice | null;
  branchInfo: BranchPaymentInfo | null;
  method: "CASH" | "BANK_TRANSFER";
  isLoading: boolean;
  onMethodChange: (method: "CASH" | "BANK_TRANSFER") => void;
  onClose: () => void;
  onPay: () => void;
}) {
  const isPaid = transaction?.Status === "Paid" || Boolean(invoice);
  const bankName = String(import.meta.env.VITE_DEFAULT_BANK_NAME || "BIDV");
  const bankBinRaw = String(import.meta.env.VITE_DEFAULT_BANK_BIN || "970418");
  const defaultBankAccountRaw = String(import.meta.env.VITE_DEFAULT_BANK_ACCOUNT || "8816928535");
  const accountOwner = String(import.meta.env.VITE_DEFAULT_ACCOUNT_OWNER || "Nguyễn Đức Hòa");
  const bankBin = (bankBinRaw.match(/\d{6}/)?.[0] || "970418").trim();
  const branchBankAccount = (branchInfo?.BankAccount || "").replace(/\D/g, "");
  const defaultBankAccount = defaultBankAccountRaw.replace(/\D/g, "");
  const bankAccount = defaultBankAccount || branchBankAccount;
  const transferAmount = Math.max(0, Math.round(Number(transaction?.FinalAmount || 0)));
  const transferContent = `${item.bookingCode}-${transaction?.TransactionID || ""}`;
  const [isQrImageError, setIsQrImageError] = useState(false);

  useEffect(() => {
    setIsQrImageError(false);
  }, [bankBin, bankAccount, transferAmount, transferContent]);

  const qrUrl =
    bankAccount && transferAmount > 0
      ? `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact2.png?amount=${transferAmount}&addInfo=${encodeURIComponent(transferContent)}`
      : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Thanh toán và xuất hóa đơn</h2>
            <p className="text-sm text-slate-500">
              {item.bookingCode} - {item.licensePlate}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Khách hàng" value={item.customerName} icon={<User size={14} />} />
            <Info label="Số điện thoại" value={item.customerPhone} icon={<Phone size={14} />} />
            <Info label="Dịch vụ" value={getServicesText(item)} />
            <Info label="Trạng thái xe" value={getStatusLabel(getDisplayStatus(item))} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {isLoading && !transaction ? (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                Đang tạo giao dịch thanh toán...
              </div>
            ) : transaction ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Mã giao dịch</p>
                    <p className="font-mono text-sm font-semibold text-slate-800">
                      #{transaction.TransactionID}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <AmountBox label="Tạm tính" value={transaction.Subtotal} />
                  <AmountBox label="Giảm giá" value={transaction.DiscountAmount} />
                  <AmountBox label="Cần thu" value={transaction.FinalAmount} strong />
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Chưa có giao dịch.</p>
            )}
          </div>

          {!invoice && transaction && transaction.Status !== "Paid" && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Phương thức thu tại quầy</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <PaymentOption
                  active={method === "CASH"}
                  title="Tiền mặt"
                  description="Nhân viên xác nhận đã thu tiền mặt"
                  onClick={() => onMethodChange("CASH")}
                />
                <PaymentOption
                  active={method === "BANK_TRANSFER"}
                  title="Chuyển khoản"
                  description="Nhân viên xác nhận khách đã chuyển khoản"
                  onClick={() => onMethodChange("BANK_TRANSFER")}
                />
              </div>

              {method === "BANK_TRANSFER" && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">QR chuyển khoản</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Khách quét QR để chuyển khoản đúng số tiền. Sau khi nhận được tiền, bấm xác nhận thanh toán.
                  </p>

                  {qrUrl && !isQrImageError ? (
                    <div className="mt-3 grid gap-4 sm:grid-cols-[150px_1fr] sm:items-start">
                      <img
                        src={qrUrl}
                        alt="QR chuyển khoản"
                        className="h-36 w-36 rounded-lg border border-slate-200 bg-white p-2"
                        onLoad={() => setIsQrImageError(false)}
                        onError={() => setIsQrImageError(true)}
                      />
                      <div className="space-y-2 rounded-lg bg-white p-3 text-sm text-slate-700">
                        <p>
                          <span className="font-semibold">Ngân hàng:</span> {bankName}
                        </p>
                        <p>
                          <span className="font-semibold">Số tài khoản:</span> {bankAccount}
                        </p>
                        <p>
                          <span className="font-semibold">Chủ tài khoản:</span> {accountOwner}
                        </p>
                        <p>
                          <span className="font-semibold">Chi nhánh:</span> {branchInfo?.BranchName || "Chưa cập nhật"}
                        </p>
                        <p>
                          <span className="font-semibold">Số tiền:</span> {formatMoney(transferAmount)} đ
                        </p>
                        <p>
                          <span className="font-semibold">Nội dung:</span> {transferContent}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      {!bankAccount ? (
                        <p>Chưa có thông tin tài khoản nhận tiền của chi nhánh. Vui lòng cấu hình BankAccount để hiển thị QR.</p>
                      ) : (
                        <>
                          <p>Không tải được ảnh QR từ VietQR. Vui lòng kiểm tra lại BIN hoặc số tài khoản.</p>
                          <p className="break-all text-xs text-amber-700">URL QR: {qrUrl}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {invoice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2 text-emerald-600">
                  <ReceiptText size={18} />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800">Đã xuất hóa đơn thành công</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Mã hóa đơn: {invoice.InvoiceNo || `#${invoice.InvoiceID}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
          {!invoice && transaction && transaction.Status !== "Paid" && (
            <button
              type="button"
              onClick={onPay}
              disabled={isLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            >
              <CreditCard size={16} />
              {isLoading
                ? "Đang xử lý..."
                : method === "BANK_TRANSFER"
                  ? "Hoàn thành thanh toán"
                  : "Xác nhận thanh toán"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AmountBox({
  label,
  value,
  strong,
}: {
  label: string;
  value?: number | string | null;
  strong?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold ${strong ? "text-blue-700" : "text-slate-800"}`}>
        {formatMoney(value)} đ
      </p>
    </div>
  );
}

function PaymentOption({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
          : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
      }`}
    >
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </button>
  );
}

function ServiceModal({
  item,
  services,
  selectedServiceIds,
  isUpdating,
  onToggle,
  onClose,
  onSubmit,
}: {
  item: StaffFlatItem;
  services: BranchServiceOption[];
  selectedServiceIds: number[];
  isUpdating: boolean;
  onToggle: (serviceId: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Thêm dịch vụ phát sinh</h2>
            <p className="text-sm text-slate-500">
              {item.licensePlate} - {item.bookingCode}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">
          {services.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
              Chi nhánh chưa có dịch vụ khả dụng
            </p>
          ) : (
            services.map((service) => (
              <label
                key={service.ServiceID}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div>
                  <p className="font-semibold text-slate-800">{service.ServiceName}</p>
                  <p className="text-sm text-slate-500">
                    {Number(priceOf(service)).toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedServiceIds.includes(service.ServiceID)}
                  onChange={() => onToggle(service.ServiceID)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600"
                />
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isUpdating || selectedServiceIds.length === 0}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            {isUpdating ? "Đang thêm..." : "Thêm dịch vụ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 flex items-center gap-1 font-medium text-slate-800">
        {icon}
        {value}
      </p>
    </div>
  );
}

export default StaffBookings;
