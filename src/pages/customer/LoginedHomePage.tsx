import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Phone,
  Sparkles,
  SprayCan,
  UserRound,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import axiosClient from "../../api/axiosClient";
import heroBg from "../../assets/hero-bg.jpg";

type Branch = {
  BranchID: number;
  BranchName: string;
  Address: string | null;
  Phone: string | null;
  Status: string | null;
};

const quickActions = [
  {
    title: "Đặt lịch",
    description: "Chọn chi nhánh, dịch vụ, xe và khung giờ rửa xe.",
    to: "/booking",
    icon: CalendarCheck,
  },
  {
    title: "Đăng ký xe",
    description: "Thêm xe mới vào tài khoản để đặt lịch nhanh hơn.",
    to: "/register-car",
    icon: Car,
  },
  {
    title: "Xe của tôi",
    description: "Xem, chỉnh sửa hoặc xóa thông tin xe đã đăng ký.",
    to: "/customer/vehicles",
    icon: ClipboardList,
  },
  {
    title: "Hồ sơ",
    description: "Xem thông tin cá nhân và dữ liệu khách hàng.",
    to: "/customer/profile",
    icon: UserRound,
  },
];

const bookingSteps = [
  {
    title: "Kiểm tra xe đã đăng ký",
    description: "Nếu chưa có xe, hãy thêm xe trước khi đặt lịch.",
  },
  {
    title: "Chọn chi nhánh và dịch vụ",
    description: "Chọn nơi rửa xe, dịch vụ cần dùng và phương tiện của bạn.",
  },
  {
    title: "Chọn khung giờ còn trống",
    description: "Hệ thống sẽ hiển thị các slot còn khả dụng để bạn chọn.",
  },
  {
    title: "Đến chi nhánh đúng giờ",
    description: "Nhân viên sẽ kiểm tra xe và cập nhật trạng thái xử lý.",
  },
];

const tips = [
  {
    title: "Bạn mới dùng hệ thống?",
    description: "Hãy đăng ký xe trước, sau đó quay lại đặt lịch.",
  },
  {
    title: "Muốn tiết kiệm thời gian?",
    description: "Đặt lịch trước để cửa hàng chuẩn bị slot phù hợp.",
  },
  {
    title: "Có nhiều xe?",
    description: "Bạn có thể lưu nhiều xe trong mục Xe của tôi.",
  },
];

const services = [
  {
    title: "Rửa xe máy",
    description: "Dịch vụ nhanh, phù hợp cho nhu cầu vệ sinh hằng ngày.",
    icon: SprayCan,
  },
  {
    title: "Gói rửa tiêu chuẩn",
    description: "Quy trình làm sạch gọn gàng, dễ đặt lịch và dễ theo dõi.",
    icon: CheckCircle2,
  },
  {
    title: "Chăm sóc xe",
    description: "Thêm dịch vụ phát sinh khi xe cần chăm sóc kỹ hơn.",
    icon: Sparkles,
  },
];

function getUserName() {
  const userString = localStorage.getItem("user");

  if (!userString) {
    return "Khách hàng";
  }

  try {
    const user = JSON.parse(userString);
    return (
      user.fullName || user.FullName || user.email || user.Email || "Khách hàng"
    );
  } catch {
    return "Khách hàng";
  }
}

const LoginedHomePage = () => {
  const userName = getUserName();

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section
        className="relative isolate overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat px-6 py-20 text-white sm:py-24"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/35" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />

        <div className="mx-auto max-w-7xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Xin chào
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                {userName}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Bạn có thể đặt lịch rửa xe, quản lý xe đã đăng ký và xem thông
                tin cá nhân ngay trong hệ thống Auto Wash Pro.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-300/35"
                >
                  Đặt lịch rửa xe
                </Link>

                <Link
                  to="/customer/vehicles"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/30"
                >
                  Xem xe của tôi
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Trạng thái</p>
                <p className="mt-1 font-bold text-white">Sẵn sàng đặt lịch</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Chi nhánh</p>
                <p className="mt-1 font-bold text-white">
                  {branches.length > 0 ? `${branches.length} đang hoạt động` : "Đang cập nhật"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Gợi ý</p>
                <p className="mt-1 font-bold text-white">Đặt lịch trước giờ cao điểm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <section className="grid gap-5 md:grid-cols-4">
            {quickActions.map(({ title, description, to, icon: Icon }) => (
              <Link
                key={title}
                to={to}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-bold text-slate-950">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </Link>
            ))}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.42fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                    Quy trình
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Quy trình đặt lịch
                  </h2>
                </div>
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Đặt lịch ngay
                </Link>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {bookingSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-lg bg-slate-950 p-6 text-white shadow-xl shadow-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-300">
                    Hôm nay
                  </p>
                  <h2 className="text-xl font-bold">Gợi ý nhanh</h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {tips.map((tip) => (
                  <div
                    key={tip.title}
                    className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                  >
                    <p className="font-semibold">{tip.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {tip.description}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                  Dịch vụ
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Dịch vụ thường dùng
                </h2>
                <p className="mt-2 text-slate-600">
                  Một số dịch vụ cơ bản khách hàng thường chọn khi đặt lịch.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {services.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                  Chi nhánh
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Thông tin chi nhánh
                </h2>
                <p className="mt-2 text-slate-600">
                  Danh sách chi nhánh đang hoạt động được lấy trực tiếp từ
                  database.
                </p>
              </div>
            </div>

            <div className="mt-6">
              {loadingBranches && (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Đang tải danh sách chi nhánh...
                </p>
              )}

              {!loadingBranches && branchMessage && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {branchMessage}
                </p>
              )}

              {!loadingBranches && !branchMessage && branches.length === 0 && (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Hiện chưa có chi nhánh hoạt động.
                </p>
              )}

              {!loadingBranches && branches.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  {branches.map((branch) => (
                    <article
                      key={branch.BranchID}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-bold text-slate-950">
                          {branch.BranchName}
                        </p>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          {branch.Status === "Active"
                            ? "Đang hoạt động"
                            : "Tạm ngưng"}
                        </span>
                      </div>

                      <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <span>{branch.Address || "Chưa cập nhật địa chỉ"}</span>
                      </p>

                      <p className="mt-3 flex gap-2 text-sm font-semibold text-slate-800">
                        <Phone className="h-4 w-4 shrink-0 text-sky-600" />
                        <span>{branch.Phone || "Chưa cập nhật"}</span>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-950 px-6 py-6 text-center text-sm text-slate-400">
        © 2026 Auto Wash Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginedHomePage;
