import {
  CalendarCheck,
  CarFront,
  CheckCircle2,
  Gift,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Navbar from "../components/Navbar";
import heroBg from "../assets/hero-bg.jpg";
import washingImage from "../assets/Washing.jpg";

const milestones = [
  {
    year: "2026",
    title: "Khởi tạo hệ thống",
    description:
      "Auto Wash Pro được xây dựng với mục tiêu hỗ trợ khách hàng đặt lịch rửa xe trực tuyến nhanh chóng và tiện lợi.",
    icon: Sparkles,
  },
  {
    year: "Giai đoạn 1",
    title: "Quản lý khách hàng và xe",
    description:
      "Khách hàng có thể đăng ký tài khoản, cập nhật thông tin cá nhân và quản lý danh sách xe của mình.",
    icon: Users,
  },
  {
    year: "Giai đoạn 2",
    title: "Đặt lịch rửa xe",
    description:
      "Khách hàng chọn chi nhánh, dịch vụ, ngày đặt lịch, khung giờ và theo dõi thông tin lịch hẹn.",
    icon: CalendarCheck,
  },
  {
    year: "Giai đoạn 3",
    title: "Điểm thưởng và ưu đãi",
    description:
      "Hệ thống hỗ trợ tích điểm, đổi điểm thưởng và áp dụng ưu đãi giảm giá trong quá trình đặt lịch.",
    icon: Gift,
  },
];

const branches = [
  "643/40 Đường Xô Viết Nghệ Tĩnh, Bình Thạnh, TP. Hồ Chí Minh",
  "Số 7 Đường D1, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh",
  "Số 1 Đường Lưu Hữu Phước, Phường Đông Hòa, TP. Hồ Chí Minh",
];

const values = [
  {
    title: "Trải nghiệm tiện lợi",
    description:
      "Khách hàng có thể đặt lịch mọi lúc, mọi nơi chỉ với vài thao tác đơn giản.",
    icon: CheckCircle2,
  },
  {
    title: "Quản lý rõ ràng",
    description:
      "Thông tin khách hàng, xe, chi nhánh, dịch vụ và lịch hẹn được quản lý tập trung.",
    icon: ShieldCheck,
  },
  {
    title: "Dịch vụ hiện đại",
    description:
      "Hệ thống hỗ trợ ưu đãi, điểm thưởng và thống kê để nâng cao chất lượng phục vụ.",
    icon: CarFront,
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        <section
          className="relative isolate overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat px-6 py-24 text-white sm:py-28 lg:py-32"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-slate-950/80 to-transparent" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100 shadow-sm backdrop-blur">
                <Route className="h-4 w-4" />
                Về Auto Wash Pro
              </p>

              <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                Nền tảng đặt lịch và quản lý rửa xe hiện đại
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Auto Wash Pro giúp khách hàng quản lý xe, lựa chọn dịch vụ,
                đặt lịch trực tuyến và sử dụng ưu đãi một cách nhanh chóng,
                minh bạch và tiện lợi.
              </p>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {["Nhanh chóng", "Minh bạch", "Dễ quản lý"].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 backdrop-blur"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/10 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur">
                <img
                  src={washingImage}
                  alt="Dịch vụ rửa xe Auto Wash Pro"
                  className="aspect-[4/3] w-full rounded object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                About us
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Giới thiệu về Auto Wash Pro
              </h2>

              <div className="mt-6 space-y-4 text-base leading-8 text-slate-600">
                <p>
                  Auto Wash Pro là hệ thống đặt lịch và quản lý dịch vụ rửa xe
                  trực tuyến, được xây dựng nhằm giúp khách hàng dễ dàng lựa
                  chọn chi nhánh, đăng ký xe, chọn dịch vụ, đặt lịch và theo dõi
                  thông tin cá nhân.
                </p>

                <p>
                  Bên cạnh trải nghiệm dành cho khách hàng, hệ thống còn hỗ trợ
                  cửa hàng quản lý khách hàng, phương tiện, dịch vụ, chi nhánh,
                  nhân viên và lịch đặt xe để vận hành chuyên nghiệp hơn.
                </p>
              </div>
            </div>

            <aside className="rounded-lg bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">
                Mission
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Sạch hơn, nhanh hơn, tiện lợi hơn
              </h3>

              <p className="mt-5 leading-8 text-slate-300">
                Sứ mệnh của Auto Wash Pro là mang đến trải nghiệm đặt lịch rửa
                xe đơn giản, minh bạch và phù hợp với nhu cầu của khách hàng
                hiện đại.
              </p>
            </aside>
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                Vision
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Tầm nhìn của hệ thống
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Auto Wash Pro hướng đến việc trở thành nền tảng quản lý và đặt
                lịch rửa xe tiện lợi, giúp khách hàng chủ động hơn trong việc
                chăm sóc phương tiện, đồng thời giúp cửa hàng tối ưu quy trình
                vận hành và nâng cao chất lượng dịch vụ.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {values.map(({ title, description, icon: Icon }) => (
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

                  <p className="mt-3 leading-7 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
                  Quá trình phát triển
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                  Hành trình xây dựng Auto Wash Pro
                </h2>
              </div>

              <p className="max-w-xl leading-7 text-slate-600">
                Hệ thống được phát triển theo từng giai đoạn, tập trung vào
                trải nghiệm đặt lịch, quản lý xe và các tiện ích chăm sóc khách
                hàng.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {milestones.map(({ year, title, description, icon: Icon }) => (
                <article
                  key={year}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                        {year}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-slate-950">
                        {title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-5 leading-7 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">
                Hệ thống chi nhánh
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Các chi nhánh của Auto Wash Pro
              </h2>

              <p className="mt-5 leading-8 text-slate-300">
                Mỗi chi nhánh được tổ chức để khách hàng dễ lựa chọn địa điểm
                phù hợp khi đặt lịch rửa xe.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {branches.map((branch, index) => (
                <article
                  key={branch}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-lg shadow-slate-950/20 backdrop-blur"
                >
                  <p className="text-lg font-bold text-sky-300">
                    Chi nhánh {index + 1}
                  </p>

                  <p className="mt-4 flex gap-2 leading-7 text-slate-200">
                    <MapPin className="mt-1 h-5 w-5 shrink-0 text-sky-300" />
                    <span>{branch}</span>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
