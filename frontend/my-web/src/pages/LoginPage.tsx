import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import IvertoLogo from "../components/IvertoLogo";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#E31B54]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#E31B54]/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 p-2">
              <IvertoLogo size={48} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                iverto<span className="text-[#E31B54]">.ai</span>
              </h1>
              <p className="text-white/50 text-sm">Smart School Monitoring</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Real-time Student<br />
            <span className="text-[#E31B54]">Recognition System</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            AI-powered CCTV monitoring with instant student identification, attendance tracking, and secure access control.
          </p>

          <div className="mt-12 flex gap-8">
            <StatItem value="500+" label="Students" />
            <StatItem value="24/7" label="Monitoring" />
            <StatItem value="99.2%" label="Accuracy" />
          </div>

          {/* Floating logo watermark */}
          <div className="absolute bottom-8 right-8 opacity-[0.04]">
            <IvertoLogo size={200} />
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center p-1.5">
              <IvertoLogo size={28} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              iverto<span className="text-[#E31B54]">.ai</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm modal-enter">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#E31B54] focus:ring-2 focus:ring-[#E31B54]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#E31B54] focus:ring-2 focus:ring-[#E31B54]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#E31B54] text-white text-sm font-semibold hover:bg-[#c7174a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#E31B54]/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="space-y-2">
              <CredRow role="Admin" email="admin@school.com" pass="admin123" onFill={() => { setEmail("admin@school.com"); setPassword("admin123"); }} />
              <CredRow role="Staff" email="staff@school.com" pass="staff123" onFill={() => { setEmail("staff@school.com"); setPassword("staff123"); }} />
              <CredRow role="Parent" email="parent@school.com" pass="parent123" onFill={() => { setEmail("parent@school.com"); setPassword("parent123"); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-white/40 text-sm">{label}</p>
    </div>
  );
}

function CredRow({ role, email, pass, onFill }: { role: string; email: string; pass: string; onFill: () => void }) {
  return (
    <button onClick={onFill} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#E31B54] bg-[#E31B54]/10 px-2 py-0.5 rounded-md">{role}</span>
        <span className="text-xs text-gray-500">{email}</span>
      </div>
      <span className="text-[10px] text-gray-400 group-hover:text-[#E31B54] transition-colors">Click to fill</span>
    </button>
  );
}
