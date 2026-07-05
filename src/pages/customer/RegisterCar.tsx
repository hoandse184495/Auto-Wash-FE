import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle2,
  ClipboardList,
  Palette,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import axiosClient from "../../api/axiosClient";

const registerCarSchema = z.object({
  LicensePlate: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập biển số xe")
    .min(5, "Biển số xe quá ngắn")
    .max(20, "Biển số xe quá dài")
    .regex(
      /^[A-Za-z0-9.\-\s]+$/,
      "Biển số chỉ được gồm chữ, số, dấu - hoặc dấu .",
    )
    .transform((value) => value.toUpperCase()),

  VehicleType: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập loại xe")
    .max(50, "Loại xe quá dài"),

  Brand: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập hãng xe")
    .max(50, "Hãng xe quá dài"),

  Model: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập model xe")
    .max(50, "Model quá dài"),

  Color: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập màu xe")
    .max(30, "Màu xe quá dài"),
});

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

function RegisterCar() {
  const navigate = useNavigate();

  const [bienSoXe, setBienSoXe] = useState("");
  const [loaiXe, setLoaiXe] = useState("");
  const [hangXe, setHangXe] = useState("");
  const [model, setModel] = useState("");
  const [mauXe, setMauXe] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    setMessage("");

    const formData = {
      LicensePlate: bienSoXe,
      VehicleType: loaiXe,
      Brand: hangXe,
      Model: model,
      Color: mauXe,
    };

    const result = registerCarSchema.safeParse(formData);

    if (!result.success) {
      setMessage(result.error.issues[0].message);
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Bạn cần đăng nhập để đăng ký xe");
        return;
      }

      await axiosClient.post("/api/vehicles", result.data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Đăng ký xe thành công");
      navigate("/customer/vehicles");
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string } };
      };

      console.log(apiError.response?.data || error);
      setMessage(apiError.response?.data?.message || "Đăng ký xe thất bại");
    } finally {
      setIsSubmitting(false);
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
              Quay lại
            </button>

            <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                  <Car className="h-4 w-4" />
                  Đăng ký phương tiện
                </p>

                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Đăng ký xe
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Thêm thông tin xe vào hệ thống để đặt lịch nhanh hơn và quản
                  lý phương tiện thuận tiện hơn.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 lg:min-w-[320px]">
                <p className="text-sm text-slate-300">Trạng thái</p>
                <p className="mt-1 text-2xl font-bold">Sẵn sàng thêm xe</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_380px]">
          <form
            onSubmit={handleRegister}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                  Thông tin xe
                </p>
                <h2 className="text-xl font-bold text-slate-950">
                  Nhập thông tin phương tiện
                </h2>
              </div>
            </div>

            {message && (
              <div className="mt-6 flex gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Biển số xe" required icon={<Tag className="h-4 w-4" />}>
                <input
                  placeholder="Ví dụ: 59F1-12345"
                  value={bienSoXe}
                  onChange={(e) => setBienSoXe(e.target.value)}
                  className={`${inputClass} uppercase`}
                />
              </Field>

              <Field label="Loại xe" required icon={<Car className="h-4 w-4" />}>
                <input
                  placeholder="Ví dụ: Xe máy"
                  value={loaiXe}
                  onChange={(e) => setLoaiXe(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Hãng xe" required icon={<ShieldCheck className="h-4 w-4" />}>
                <input
                  placeholder="Ví dụ: Honda, Yamaha"
                  value={hangXe}
                  onChange={(e) => setHangXe(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Model" required icon={<Sparkles className="h-4 w-4" />}>
                <input
                  placeholder="Ví dụ: Vision"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Màu xe" required icon={<Palette className="h-4 w-4" />}>
                <input
                  placeholder="Ví dụ: Đen"
                  value={mauXe}
                  onChange={(e) => setMauXe(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Plus className="h-5 w-5" />
                {isSubmitting ? "Đang đăng ký..." : "Đăng ký xe"}
              </button>

              <Link
                to="/customer/vehicles"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              >
                Xem xe của tôi
              </Link>
            </div>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg bg-slate-950 p-6 text-white shadow-lg shadow-slate-200">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-sky-300">
                <CheckCircle2 className="h-5 w-5" />
                Lưu ý
              </p>

              <h2 className="mt-4 text-2xl font-bold">
                Thông tin càng rõ, đặt lịch càng nhanh
              </h2>

              <div className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
                <p>
                  Biển số xe sẽ được tự động chuyển thành chữ in hoa sau khi
                  đăng ký.
                </p>
                <p>
                  Hãy nhập đúng loại xe, hãng xe, model và màu xe để nhân viên
                  dễ nhận diện khi bạn đến chi nhánh.
                </p>
                <p>
                  Sau khi thêm xe, bạn có thể quay lại trang đặt lịch và chọn xe
                  này cho lịch hẹn mới.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const Field = ({ label, required, icon, children }: FieldProps) => {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
        <span className="text-sky-600">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
};

export default RegisterCar;
