import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  SprayCan,
  UserPlus,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axiosClient from "../api/axiosClient";
import heroBg from "../assets/hero-bg.jpg";
import washingImage from "../assets/Washing.jpg";

type Branch = {
  BranchID: number;
  BranchName: string;
  Address: string | null;
  Phone: string | null;
  Status: string | null;
};

const services = [
  {
    title: "Rửa xe máy",
    description:
      "Làm sạch nhanh, phù hợp cho nhu cầu sử dụng hằng ngày với quy trình gọn và ổn định.",
    icon: SprayCan,
  },
  {
    title: "Gói rửa tiêu chuẩn",
    description:
      "Quy trình làm sạch gọn gàng, dễ đặt lịch và phù hợp cho nhu cầu chăm sóc xe định kỳ.",
    icon: CheckCircle2,
  },
  {
    title: "Chăm sóc xe",
    description:
      "Hỗ trợ vệ sinh, chăm sóc và làm mới xe theo nhu cầu phát sinh tại từng chi nhánh.",
    icon: Sparkles,
  },
];

const steps = [
  {
    title: "Tạo tài khoản",
    description: "Đăng ký tài khoản khách hàng để sử dụng hệ thống.",
    icon: UserPlus,
  },
  {
    title: "Đăng ký xe",
    description: "Thêm biển số, loại xe, hãng xe và màu xe.",
    icon: Car,
  },
  {
    title: "Đặt lịch",
    description: "Chọn chi nhánh, dịch vụ, xe và khung giờ phù hợp.",
    icon: CalendarCheck,
  },
  {
    title: "Đến rửa xe",
    description: "Đến chi nhánh đúng giờ và theo dõi trạng thái dịch vụ.",
    icon: CheckCircle2,
  },
];

const reasons = [
  {
    title: "Đặt lịch tiện lợi",
    description:
      "Khách hàng có thể đặt lịch trước để giảm thời gian chờ tại cửa hàng.",
    icon: Clock3,
  },
  {
    title: "Quản lý xe rõ ràng",
    description:
      "Lưu danh sách xe và dùng lại thông tin nhanh chóng cho những lần đặt lịch sau.",
    icon: ShieldCheck,
  },
  {
    title: "Theo dõi lịch sử",
    description:
      "Hệ thống hỗ trợ lưu lịch sử đặt lịch và thông tin sử dụng dịch vụ.",
    icon: CalendarCheck,
  },
];

const HomePage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchMessage, setBranchMessage] = useState("");

  useEffect(() => {
    async function loadBranches() {
      try {
        setLoadingBranches(true);
        setBranchMessage("");

        const res = await axiosClient.get("/api/branches?status=Active");

        setBranches(res.data.data || []);
      } catch (error) {
        console.log(error);
        setBranchMessage("Không tải được danh sách chi nhánh");
      } finally {
        setLoadingBranches(false);
      }
    }

    loadBranches();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section
        className="relative isolate overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat px-6 py-24 text-white sm:py-28 lg:min-h-[calc(100vh-72px)] lg:py-32"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/35" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-slate-950/75 to-transparent" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Auto Wash Pro
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-normal sm:text-5xl lg:text-6xl">
              Đặt lịch rửa xe nhanh, quản lý xe dễ dàng
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Hệ thống giúp khách hàng đặt lịch rửa xe, quản lý thông tin xe,
              theo dõi lịch hẹn và sử dụng dịch vụ tại nhiều chi nhánh.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-300/35"
              >
                Tạo tài khoản
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                Đăng nhập để đặt lịch
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["Đặt lịch trước", "Nhiều chi nhánh", "Theo dõi lịch hẹn"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 backdrop-blur"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/10 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur">
              <img
                src={washingImage}
                alt="Nhân viên đang rửa xe tại Auto Wash Pro"
                className="aspect-[4/3] w-full rounded object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
              Dịch vụ
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Dịch vụ nổi bật
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Auto Wash Pro hỗ trợ nhiều dịch vụ chăm sóc xe cơ bản, phù hợp
              cho nhu cầu vệ sinh và làm mới xe hằng ngày.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                Quy trình
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Sử dụng đơn giản trong 4 bước
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-slate-600">
              Từ đăng ký xe đến theo dõi trạng thái dịch vụ, mọi thao tác được
              thiết kế để khách hàng đặt lịch nhanh và rõ ràng.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {steps.map(({ title, description, icon: Icon }, index) => (
              <article
                key={title}
                className="relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="absolute right-5 top-5 text-4xl font-black text-slate-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
              Lợi ích
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Vì sao chọn Auto Wash Pro?
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Trải nghiệm đặt lịch rõ ràng, lưu thông tin xe tiện lợi và hỗ trợ
              khách hàng theo dõi quá trình sử dụng dịch vụ tốt hơn.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {reasons.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-lg bg-slate-950 p-6 text-white shadow-lg shadow-slate-200"
              >
                <Icon className="h-7 w-7 text-sky-300" />
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">
                Hệ thống chi nhánh
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Chi nhánh hoạt động
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Auto Wash Pro hỗ trợ nhiều chi nhánh để khách hàng lựa chọn nơi
                rửa xe thuận tiện nhất.
              </p>

              <div className="mt-8">
                {loadingBranches && (
                  <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    Đang tải danh sách chi nhánh...
                  </p>
                )}

                {!loadingBranches && branchMessage && (
                  <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {branchMessage}
                  </p>
                )}

                {!loadingBranches &&
                  !branchMessage &&
                  branches.length === 0 && (
                    <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      Hiện chưa có chi nhánh hoạt động.
                    </p>
                  )}

                {!loadingBranches && branches.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {branches.map((branch) => (
                      <article
                        key={branch.BranchID}
                        className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-lg shadow-slate-950/20 backdrop-blur"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-bold text-white">
                            {branch.BranchName}
                          </h3>

                          <span className="shrink-0 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                            {branch.Status === "Active"
                              ? "Đang hoạt động"
                              : "Tạm ngưng"}
                          </span>
                        </div>

                        <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-300">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                          <span>
                            {branch.Address || "Chưa cập nhật địa chỉ"}
                          </span>
                        </p>

                        <p className="mt-2 flex gap-2 text-sm leading-6 text-slate-300">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                          <span>
                            {branch.Phone || "Chưa cập nhật số điện thoại"}
                          </span>
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="rounded-lg border border-white/10 bg-white p-8 text-slate-950 shadow-2xl shadow-slate-950/30">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                Bắt đầu
              </p>
              <h3 className="mt-3 text-2xl font-bold">
                Bắt đầu sử dụng ngay
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Tạo tài khoản để đăng ký xe, đặt lịch và quản lý thông tin cá
                nhân.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
                >
                  Đăng ký
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
                >
                  Đăng nhập
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-6 text-center text-sm text-slate-400">
        © 2026 Auto Wash Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
