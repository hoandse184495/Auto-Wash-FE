import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  Clock3,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { getErrorMessage } from "../../api/axiosClient";
import { formatMoney } from "../../components/customer/bookingUtils";
import type { Branch, Service } from "../../components/customer/bookingTypes";
import customerApi from "../../services/customerApi";

type Promotion = {
  PromotionID: number;
  PromotionName: string;
  DiscountType?: string | null;
  DiscountValue?: number | string | null;
  StartDate?: string | null;
  EndDate?: string | null;
  BranchID?: number | null;
  UsageLimit?: number | null;
  Status?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Khong gioi han";
  }

  return new Date(value).toLocaleDateString("vi-VN");
}

function formatDiscount(promotion: Promotion) {
  if (promotion.DiscountType === "PERCENTAGE") {
    return `${Number(promotion.DiscountValue || 0)}%`;
  }

  return formatMoney(promotion.DiscountValue || 0);
}

function ServicesPromotions() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBranch = branches.find(
    (branch) => branch.BranchID === Number(selectedBranchId),
  );

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setMessage("");

        const [branchRes, promotionRes] = await Promise.all([
          customerApi.getBranches(),
          customerApi.getActivePromotions(),
        ]);

        const nextBranches = branchRes.data.data || [];
        setBranches(nextBranches);
        setPromotions(promotionRes.data.data || []);

        if (nextBranches.length > 0) {
          setSelectedBranchId(String(nextBranches[0].BranchID));
        }
      } catch (error) {
        setMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadServices() {
      if (!selectedBranchId) {
        setServices([]);
        return;
      }

      try {
        setLoadingServices(true);
        setMessage("");

        const res = await customerApi.getBranchServices(Number(selectedBranchId));
        setServices(res.data.data || []);
      } catch (error) {
        setMessage(getErrorMessage(error));
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [selectedBranchId]);

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
              Quay lai
            </button>

            <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                  <ShoppingBag className="h-4 w-4" />
                  Dich vu va uu dai
                </p>
                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Bang gia theo chi nhanh
                </h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Chon chi nhanh de xem dich vu dang mo ban, gia thuc te va cac khuyen mai dang hoat dong.
                </p>
              </div>

              <Link
                to="/booking"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Dat lich
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8">
          {message && (
            <div className="mb-6 flex gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              Dang tai dich vu...
            </div>
          ) : (
            <>
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                      Chi nhanh
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      Chon noi rua xe
                    </h2>
                  </div>

                  <select
                    value={selectedBranchId}
                    onChange={(event) => setSelectedBranchId(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 lg:max-w-md"
                  >
                    {branches.map((branch) => (
                      <option key={branch.BranchID} value={branch.BranchID}>
                        {branch.BranchName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBranch && (
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <InfoBox
                      icon={<MapPin className="h-4 w-4" />}
                      label="Dia chi"
                      value={selectedBranch.Address || "Chua cap nhat"}
                    />
                    <InfoBox
                      icon={<Clock3 className="h-4 w-4" />}
                      label="Gio mo cua"
                      value={`${selectedBranch.OpenTime?.substring(11, 16) || "--:--"} - ${selectedBranch.CloseTime?.substring(11, 16) || "--:--"}`}
                    />
                    <InfoBox
                      icon={<Sparkles className="h-4 w-4" />}
                      label="Trang thai"
                      value={selectedBranch.Status || "Active"}
                    />
                  </div>
                )}
              </section>

              <section className="mt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                      Dich vu
                    </p>
                    <h2 className="text-xl font-bold text-slate-950">
                      Dich vu tai chi nhanh
                    </h2>
                  </div>
                </div>

                {loadingServices && (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                    Dang tai danh sach dich vu...
                  </div>
                )}

                {!loadingServices && services.length === 0 && (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                    Chi nhanh nay chua co dich vu active.
                  </div>
                )}

                {!loadingServices && services.length > 0 && (
                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((service) => (
                      <article
                        key={service.BranchServiceID}
                        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-950">
                              {service.ServiceName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {service.Type || "Dich vu rua xe"}
                            </p>
                          </div>
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                            {service.DurationMinutes || 0} phut
                          </span>
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                          {service.Description || "Chua co mo ta chi tiet."}
                        </p>

                        <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
                          <div>
                            <p className="text-sm text-slate-500">Gia thuc te</p>
                            <p className="mt-1 text-2xl font-bold text-sky-700">
                              {formatMoney(service.ActualPrice)}
                            </p>
                          </div>
                          <Link
                            to="/booking"
                            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            Chon
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <BadgePercent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                      Khuyen mai
                    </p>
                    <h2 className="text-xl font-bold text-slate-950">
                      Uu dai dang chay
                    </h2>
                  </div>
                </div>

                {promotions.length === 0 ? (
                  <p className="mt-5 rounded-lg bg-slate-50 p-5 text-sm text-slate-600">
                    Hien chua co khuyen mai dang hoat dong.
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {promotions.map((promotion) => (
                      <article
                        key={promotion.PromotionID}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-slate-950">
                              {promotion.PromotionName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Ap dung den {formatDate(promotion.EndDate)}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            {promotion.Status || "Active"}
                          </span>
                        </div>

                        <p className="mt-4 text-3xl font-bold text-sky-700">
                          {formatDiscount(promotion)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {promotion.BranchID ? "Ap dung cho mot chi nhanh cu the" : "Ap dung toan he thong"}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

type InfoBoxProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const InfoBox = ({ icon, label, value }: InfoBoxProps) => (
  <div className="rounded-lg bg-slate-50 p-4">
    <p className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-sky-600">{icon}</span>
      {label}
    </p>
    <p className="mt-1 font-semibold text-slate-950">{value}</p>
  </div>
);

export default ServicesPromotions;
