import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  Gift,
  History,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { getErrorMessage } from "../../api/axiosClient";
import { formatMoney } from "../../components/customer/bookingUtils";
import customerApi from "../../services/customerApi";

type TierConfig = {
  TierName?: string | null;
  DiscountPercent?: number | string | null;
  PointMultiplier?: number | string | null;
};

type LoyaltyAccount = {
  CurrentPoints?: number | null;
  LifetimePoints?: number | null;
  tier_configs?: TierConfig | null;
};

type CustomerProfile = {
  CustomerID?: number;
  IsNewCustomer?: boolean;
  TotalSpent?: number | string | null;
  LoyaltyAccounts?: LoyaltyAccount[];
};

type Reward = {
  RewardID: number;
  RewardName: string;
  RequiredPoints: number;
  DiscountValue?: number | string | null;
  ValidDays?: number | null;
  Status?: string | null;
};

type RewardRedemption = {
  RedemptionID: number;
  RedeemedAt?: string | null;
  Status?: string | null;
  Rewards?: Reward | null;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Chua cap nhat";
  }

  return new Date(value).toLocaleDateString("vi-VN");
}

function Rewards() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loyalty = profile?.LoyaltyAccounts?.[0];
  const currentPoints = loyalty?.CurrentPoints || 0;
  const lifetimePoints = loyalty?.LifetimePoints || 0;
  const tierName = loyalty?.tier_configs?.TierName || "Thanh vien";

  const loadRewards = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const [profileRes, rewardsRes] = await Promise.all([
        customerApi.getProfile(),
        customerApi.getRewards(),
      ]);

      const nextProfile = profileRes.data.data as CustomerProfile;
      setProfile(nextProfile);
      setRewards(rewardsRes.data.data || []);

      if (nextProfile.CustomerID) {
        const redemptionRes = await customerApi.getRewardRedemptions(nextProfile.CustomerID);
        setRedemptions(redemptionRes.data.data || []);
      } else {
        setRedemptions([]);
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  async function redeemReward(reward: Reward) {
    if (!profile?.CustomerID) {
      setMessage("Ban can them xe de he thong tao ho so khach hang truoc khi doi qua.");
      return;
    }

    if (currentPoints < reward.RequiredPoints) {
      setMessage("Diem hien tai chua du de doi phan qua nay.");
      return;
    }

    const confirmed = window.confirm(`Doi ${reward.RequiredPoints} diem lay ${reward.RewardName}?`);

    if (!confirmed) {
      return;
    }

    try {
      setRedeemingId(reward.RewardID);
      setMessage("");

      await customerApi.redeemReward(reward.RewardID);
      await loadRewards();
      setMessage("Doi qua thanh cong. Phan qua da duoc them vao lich su cua ban.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setRedeemingId(null);
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
              Quay lai
            </button>

            <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                  <Gift className="h-4 w-4" />
                  Diem thuong
                </p>
                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Uu dai thanh vien
                </h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Xem diem hien co, hang thanh vien, danh sach phan qua va lich su doi thuong cua ban.
                </p>
              </div>

              <button
                type="button"
                onClick={loadRewards}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                <RefreshCcw className="h-4 w-4" />
                Tai lai
              </button>
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
              Dang tai diem thuong...
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-4">
                <StatCard
                  icon={<Wallet className="h-5 w-5" />}
                  label="Diem hien co"
                  value={String(currentPoints)}
                />
                <StatCard
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Diem tich luy"
                  value={String(lifetimePoints)}
                />
                <StatCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="Hang thanh vien"
                  value={tierName}
                />
                <StatCard
                  icon={<BadgePercent className="h-5 w-5" />}
                  label="Tong chi tieu"
                  value={formatMoney(profile?.TotalSpent || 0)}
                />
              </div>

              {!profile?.CustomerID && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  Ho so khach hang chua duoc tao. Hay dang ky xe dau tien de bat dau tich diem va doi qua.
                  <Link to="/register-car" className="ml-2 font-bold text-amber-900 underline">
                    Dang ky xe
                  </Link>
                </div>
              )}

              <section className="mt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                      Doi diem
                    </p>
                    <h2 className="text-xl font-bold text-slate-950">
                      Phan qua dang ap dung
                    </h2>
                  </div>
                </div>

                {rewards.length === 0 ? (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                    Chua co phan qua dang ap dung.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {rewards.map((reward) => {
                      const canRedeem = currentPoints >= reward.RequiredPoints && Boolean(profile?.CustomerID);

                      return (
                        <article
                          key={reward.RewardID}
                          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-950">
                                {reward.RewardName}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Hieu luc {reward.ValidDays || 30} ngay sau khi doi
                              </p>
                            </div>
                            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                              {reward.Status || "Active"}
                            </span>
                          </div>

                          <div className="mt-5 rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Gia tri uu dai</p>
                            <p className="mt-1 text-2xl font-bold text-sky-700">
                              {formatMoney(reward.DiscountValue || 0)}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="font-bold text-slate-950">
                              {reward.RequiredPoints} diem
                            </p>
                            <button
                              type="button"
                              disabled={!canRedeem || redeemingId === reward.RewardID}
                              onClick={() => redeemReward(reward)}
                              className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {redeemingId === reward.RewardID ? "Dang doi..." : "Doi qua"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                      Lich su
                    </p>
                    <h2 className="text-xl font-bold text-slate-950">
                      Qua da doi
                    </h2>
                  </div>
                </div>

                {redemptions.length === 0 ? (
                  <p className="mt-5 rounded-lg bg-slate-50 p-5 text-sm text-slate-600">
                    Ban chua doi phan qua nao.
                  </p>
                ) : (
                  <div className="mt-5 divide-y divide-slate-200">
                    {redemptions.map((item) => (
                      <div
                        key={item.RedemptionID}
                        className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-950">
                            {item.Rewards?.RewardName || "Phan qua"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Doi ngay {formatDate(item.RedeemedAt)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatMoney(item.Rewards?.DiscountValue || 0)}
                        </p>
                        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {item.Status || "UNUSED"}
                        </span>
                      </div>
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

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <p className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-sky-600">{icon}</span>
      {label}
    </p>
    <p className="mt-2 break-words text-2xl font-bold text-slate-950">{value}</p>
  </div>
);

export default Rewards;
