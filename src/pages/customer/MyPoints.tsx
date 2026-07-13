import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { getErrorMessage } from "../../api/axiosClient";
import customerApi from "../../services/customerApi";

type PointsSummary = {
  currentPoints?: number | string | null;
  lifetimePoints?: number | string | null;
  totalSpent?: number | string | null;
  tierName?: string | null;
  pointMultiplier?: number | string | null;
  pointsExpiryDate?: string | null;
  isNewCustomer?: boolean;
};

type LegacyProfile = {
  CustomerID?: number;
  TotalSpent?: number | string | null;
  PointsExpiryDate?: string | null;
  LoyaltyAccounts?: Array<{
    CurrentPoints?: number | null;
    LifetimePoints?: number | null;
    PointExpiryDate?: string | null;
    tier_configs?: {
      TierName?: string | null;
      PointMultiplier?: number | string | null;
    } | null;
  }>;
};

function formatMoney(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatPoints(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDateVi(value?: string | null) {
  if (!value) {
    return "Chưa có dữ liệu";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chưa có dữ liệu";
  }

  return date.toLocaleDateString("vi-VN");
}

function getEndOfCurrentYearIso() {
  return new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
}

function mapLegacyProfileToSummary(profile: LegacyProfile | null | undefined): PointsSummary {
  const loyalty = profile?.LoyaltyAccounts?.[0];

  return {
    currentPoints: Number(loyalty?.CurrentPoints || 0),
    lifetimePoints: Number(loyalty?.LifetimePoints || 0),
    totalSpent: Number(profile?.TotalSpent || 0),
    tierName: loyalty?.tier_configs?.TierName || "Thành viên",
    pointMultiplier: Number(loyalty?.tier_configs?.PointMultiplier || 1),
    pointsExpiryDate:
      loyalty?.PointExpiryDate || profile?.PointsExpiryDate || getEndOfCurrentYearIso(),
    isNewCustomer: !profile?.CustomerID,
  };
}

function MyPoints() {
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPointsSummary() {
      try {
        setLoading(true);
        setMessage("");

        const res = await customerApi.getPointsSummary();
        setPointsSummary(res.data.data || null);
      } catch (error) {
        const status =
          error && typeof error === "object" && "response" in error
            ? Number((error as { response?: { status?: number } }).response?.status)
            : 0;

        if (status === 404) {
          try {
            const legacyRes = await customerApi.getProfile();
            const mapped = mapLegacyProfileToSummary(legacyRes.data.data as LegacyProfile);
            setPointsSummary(mapped);
            setMessage("Hệ thống đang dùng API cũ, dữ liệu điểm đã được tải tạm thời.");
          } catch (legacyError) {
            setMessage(getErrorMessage(legacyError));
          }
        } else {
          setMessage(getErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    }

    loadPointsSummary();
  }, []);

  const currentPoints = Number(pointsSummary?.currentPoints || 0);
  const lifetimePoints = Number(pointsSummary?.lifetimePoints || 0);
  const tierName = pointsSummary?.tierName || "Thành viên";
  const pointMultiplier = Number(pointsSummary?.pointMultiplier || 1);
  const totalSpent = Number(pointsSummary?.totalSpent || 0);
  const pointsExpiryDateRaw = pointsSummary?.pointsExpiryDate;
  const isNewCustomer = Boolean(pointsSummary?.isNewCustomer);

  const progress = useMemo(() => {
    if (lifetimePoints <= 0) {
      return 0;
    }

    const value = (currentPoints / lifetimePoints) * 100;
    return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  }, [currentPoints, lifetimePoints]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section className="bg-slate-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                  Bảng điểm thành viên
                </p>
                <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Điểm của tôi</h1>
                <p className="mt-3 max-w-2xl text-slate-200">
                  Theo dõi điểm thưởng, hạng thành viên và tổng chi tiêu của bạn trên một màn hình tổng quan.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                <ShieldCheck className="h-4 w-4" />
                Hạng hiện tại: {tierName}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-12 pt-8">
          {message && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              Đang tải thông tin điểm...
            </div>
          ) : (
            <>
              <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Thẻ thành viên
                      </p>
                      <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">{tierName}</h2>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#0b549f]">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Thông tin thành viên</p>
                    <p className="mt-1 text-base font-semibold text-slate-800">Tài khoản của bạn đang hoạt động bình thường</p>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#0b549f] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <p>{formatPoints(currentPoints)} điểm khả dụng</p>
                    <p>{formatPoints(lifetimePoints)} điểm tích lũy</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Hết hạn điểm: <span className="font-semibold text-slate-800">{formatDateVi(pointsExpiryDateRaw)}</span>
                  </p>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Hệ số tích điểm hiện tại: <span className="font-bold text-slate-900">x{pointMultiplier}</span>
                  </div>

                  {isNewCustomer && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      Bạn chưa có hồ sơ khách hàng. Hãy đăng ký xe để bắt đầu tích điểm.
                      <Link to="/register-car" className="ml-2 font-bold underline">
                        Đăng ký xe
                      </Link>
                    </div>
                  )}
                </article>

                <aside className="space-y-4">
                  <StatCard
                    icon={<Wallet className="h-5 w-5" />}
                    label="Tổng chi tiêu"
                    value={formatMoney(totalSpent)}
                  />
                  <StatCard
                    icon={<Sparkles className="h-5 w-5" />}
                    label="Điểm thưởng hiện có"
                    value={formatPoints(currentPoints)}
                  />
                  <StatCard
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Hạng thành viên"
                    value={tierName}
                  />

                  <Link
                    to="/customer/bookings"
                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Lịch sử giao dịch</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">Xem lịch hẹn của bạn</p>
                  </Link>
                </aside>
              </section>

              <section className="mt-6 grid gap-4 md:grid-cols-3">
                <StatCard
                  icon={<Wallet className="h-5 w-5" />}
                  label="Điểm hiện có"
                  value={formatPoints(currentPoints)}
                />
                <StatCard
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Tổng điểm tích lũy"
                  value={formatPoints(lifetimePoints)}
                />
                <StatCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="Hệ số tích điểm"
                  value={`x${pointMultiplier}`}
                />
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-[#0b549f]">{icon}</span>
      {label}
    </p>
    <p className="mt-2 break-words text-2xl font-bold text-slate-950">{value}</p>
  </div>
);

export default MyPoints;
