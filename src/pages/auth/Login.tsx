import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import heroImage from "../../assets/hero-bg.jpg";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function getRedirectPath(role: String) {
    switch (role) {
      case "Admin":
        return "/admin";
      case "Manager":
        return "/manager";
      case "Staff":
        return "/staff";
      default:
        return "/home";
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axiosClient.post("/api/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      const payload = res.data?.data as
        | { token?: string; user?: { role?: string; [k: string]: unknown } }
        | undefined;
      const token = payload?.token;
      const user = payload?.user;

      if (!token || !user) {
        setMessage(res.data?.message || "Không tìm thấy token từ server");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", (user.role as string) ?? "");

      setMessage("Đăng nhập thành công");
      navigate(getRedirectPath(user.role as string), { replace: true });
    } catch (error: unknown) {
      console.log(error);
      const axiosErr = error as {
        response?: { data?: { message?: string } };
      };
      const errMsg =
        axiosErr?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.";
      setMessage(errMsg);
      setLoading(false);
    }
  }

  const isSuccess = message.toLowerCase().includes("thành công");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-cyan-950/70 to-amber-900/50" />
      <div className="auth-grid-pattern" />
      <div className="auth-float absolute -left-16 top-24 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="auth-float absolute -right-10 bottom-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="auth-enter-up hidden rounded-3xl border border-white/20 bg-white/10 p-8 text-white backdrop-blur-sm lg:block">
            <p className="inline-flex rounded-full border border-white/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
              Auto Wash Pro
            </p>
            <h2 className="mt-6 text-4xl font-semibold leading-tight">
              Quản lý lịch hẹn và vận hành dịch vụ rửa xe trong một nền tảng thống nhất.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-cyan-50/90">
              Theo dõi trạng thái xe theo thời gian thực, thanh toán linh hoạt và chăm sóc khách hàng chuyên nghiệp hơn mỗi ngày.
            </p>
          </div>

          <div className="auth-enter-up auth-glow w-full rounded-3xl border border-white/30 bg-white/90 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              ← Quay lại
            </button>

            <h1 className="text-3xl font-bold text-slate-900">Đăng nhập</h1>
            <p className="mt-2 text-sm text-slate-600">Chào mừng bạn quay trở lại hệ thống.</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-cyan-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-cyan-900 py-2.5 font-semibold text-white transition hover:from-slate-800 hover:to-cyan-800 disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-500"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              isSuccess ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {message}
          </p>
        )}

            <p className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-semibold text-cyan-700 hover:underline"
          >
            Đăng ký
          </Link>
        </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;