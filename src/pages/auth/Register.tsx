import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import heroImage from "../../assets/hero-bg.jpg";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{9,15}$/;

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  async function handleSendCode() {
    if (!email.trim()) {
      setMessage("Vui lòng nhập email trước");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setMessage("Email không hợp lệ");
      return;
    }

    try {
      await axiosClient.post("/api/auth/send-register-code", {
        email: email.trim(),
      });

      setIsCodeSent(true);
      setMessage("Mã xác minh đã được gửi đến email");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gửi mã xác minh thất bại");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      setMessage("Vui lòng nhập họ và tên");
      return;
    }

    if (!phone.trim()) {
      setMessage("Vui lòng nhập số điện thoại");
      return;
    }

    if (!phoneRegex.test(phone.trim())) {
      setMessage("Số điện thoại không hợp lệ");
      return;
    }

    if (!email.trim()) {
      setMessage("Vui lòng nhập email");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setMessage("Email không hợp lệ");
      return;
    }

    if (!password) {
      setMessage("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!isCodeSent) {
      setMessage("Vui lòng bấm gửi mã xác minh trước");
      return;
    }

    if (!code) {
      setMessage("Vui lòng nhập mã xác minh");
      return;
    }

    if (code.length !== 6) {
      setMessage("Mã xác minh phải có 6 số");
      return;
    }

    try {
      await axiosClient.post("/api/auth/register", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        code,
      });

      setMessage("Đăng ký thành công");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Đăng ký thất bại");
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
              Trải nghiệm đặt lịch nhanh, tích điểm tự động và theo dõi lịch sử dịch vụ liền mạch.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-cyan-50/90">
              Tạo tài khoản chỉ trong vài bước để sử dụng trọn bộ tiện ích dành cho khách hàng của hệ thống.
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

            <h1 className="text-3xl font-bold text-slate-900">Đăng ký</h1>
            <p className="mt-2 text-sm text-slate-600">Tạo tài khoản để bắt đầu sử dụng dịch vụ.</p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Họ và tên
            </label>

            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Số điện thoại
            </label>

            <input
              type="text"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsCodeSent(false);
                setCode("");
              }}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <button
            type="button"
            onClick={handleSendCode}
            className="w-full rounded-xl bg-slate-800 py-2.5 font-semibold text-white transition hover:bg-slate-900"
          >
            {isCodeSent ? "Gửi lại mã xác minh" : "Gửi mã xác minh"}
          </button>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mã xác minh
            </label>

            <input
              type="text"
              placeholder="Nhập mã 6 số"
              value={code}
              maxLength={6}
              onChange={(e) => {
                const onlyNumber = e.target.value.replace(/\D/g, "");
                setCode(onlyNumber);
              }}
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nhập lại mật khẩu
            </label>

            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-cyan-900 py-2.5 font-semibold text-white transition hover:from-slate-800 hover:to-cyan-800"
          >
            Đăng ký
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
          Đã có tài khoản?{" "}
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

export default Register;
