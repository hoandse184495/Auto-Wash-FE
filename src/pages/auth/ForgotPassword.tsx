import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import heroImage from "../../assets/hero-bg.jpg";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("/api/auth/forgot-password/send-code", {
        email: email.trim(),
      });

      setMessage(res.data?.message || "Mã xác minh đã được gửi đến email");
      setStep(2);
    } catch (error: any) {
      console.log(error.response?.data || error);
      setMessage(
        error.response?.data?.message || "Gửi mã xác minh thất bại"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!code.trim()) {
      setMessage("Vui lòng nhập mã xác minh");
      return;
    }

    if (!newPassword) {
      setMessage("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("/api/auth/forgot-password/reset", {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });

      setMessage(res.data?.message || "Đặt lại mật khẩu thành công");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error: any) {
      console.log(error.response?.data || error);
      setMessage(
        error.response?.data?.message || "Đặt lại mật khẩu thất bại"
      );
    } finally {
      setLoading(false);
    }
  }

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
              Khôi phục tài khoản nhanh chóng để tiếp tục đặt lịch và quản lý dịch vụ.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-cyan-50/90">
              Nhập email đã đăng ký, xác minh OTP và đặt mật khẩu mới trong vài bước an toàn.
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

            <h1 className="text-3xl font-bold text-slate-900">Quên mật khẩu</h1>

            <p className="mt-2 text-sm text-slate-600">
              {step === 1
                ? "Nhập email để nhận mã xác minh"
                : "Nhập mã OTP và mật khẩu mới"}
            </p>

            {step === 1 && (
              <form onSubmit={handleSendCode} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-cyan-900 py-2.5 font-semibold text-white transition hover:from-slate-800 hover:to-cyan-800 disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-500"
            >
              {loading ? "Đang gửi mã..." : "Gửi mã xác minh"}
            </button>
          </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div className="rounded-xl bg-cyan-50 p-3 text-sm text-cyan-700">
              Mã xác minh đã gửi đến:{" "}
                  <span className="font-semibold">{email}</span>
                </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mã xác minh
              </label>

              <input
                type="text"
                placeholder="Nhập mã 6 số"
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mật khẩu mới
              </label>

              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu mới
              </label>

              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-cyan-900 py-2.5 font-semibold text-white transition hover:from-slate-800 hover:to-cyan-800 disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-500"
            >
              {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(1)}
              className="w-full rounded-xl border border-slate-300 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Đổi email
            </button>
          </form>
            )}

            {message && (
              <p
                className={`mt-4 text-center text-sm ${
                  message.includes("thành công") || message.includes("đã được gửi")
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {message}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              Nhớ mật khẩu rồi?{" "}
              <Link
                to="/login"
                className="font-semibold text-cyan-700 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;