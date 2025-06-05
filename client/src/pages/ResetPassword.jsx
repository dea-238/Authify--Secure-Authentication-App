import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useContext, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";

const ResetPassword = () => {
  const inputRef = useRef([]);
  const navigate   = useNavigate();
  const [email, setEmail]           = useState("");
  const [newPassword, setNewPass]   = useState("");
  const [otp, setOtp]               = useState("");
  const [step, setStep]             = useState(0); // 0=email, 1=otp, 2=new pass
  const [loading, setLoading]       = useState(false);

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/send-reset-otp?email=${email}`);
      if (res.status === 200) {
        toast.success("OTP sent!");
        setStep(1);
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally { setLoading(false); }
  };

  const verifyOtp = () => {
    const val = inputRef.current.map(i => i.value).join("");
    if (val.length !== 6) return toast.error("Enter full OTP");
    setOtp(val);
    setStep(2);
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
  email,
  otp,
  newPassword
});
      if (res.status === 200) {
        toast.success("Password reset!");
        navigate("/login");
      }
    } catch {
      toast.error("Reset failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100"
         style={{ background: "linear-gradient(90deg, #6a5af9, #8268f9)" }}>
      <Link to="/" className="position-absolute top-0 start-0 p-4 d-flex gap-2 text-decoration-none">
        <img src={assets.logo} alt="logo" width={32} height={32}/>
        <span className="fs-4 fw-semibold text-light">Authify</span>
      </Link>

      {/* Step 0 – ask email */}
      {step === 0 && (
        <form onSubmit={onSubmitEmail} className="bg-white p-5 rounded-4" style={{ width: 400 }}>
          <h4 className="text-center mb-3">Reset Password</h4>
          <input className="form-control mb-4"
                 type="email" placeholder="Email"
                 value={email} onChange={e => setEmail(e.target.value)} required/>
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* Step 1 – enter OTP */}
      {step === 1 && (
        <div className="bg-white p-5 rounded-4" style={{ width: 400 }}>
          <h4 className="text-center mb-3">Enter OTP</h4>
          <div className="d-flex gap-2 mb-4">
            {[...Array(6)].map((_, i) => (
              <input key={i} maxLength={1} className="form-control text-center fs-4"
                     ref={el => (inputRef.current[i] = el)}/>
            ))}
          </div>
          <button className="btn btn-primary w-100" disabled={loading} onClick={verifyOtp}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}

      {/* Step 2 – new password */}
      {step === 2 && (
        <form onSubmit={submitNewPassword} className="bg-white p-5 rounded-4" style={{ width: 400 }}>
          <h4 className="text-center mb-3">New Password</h4>
          <input className="form-control mb-4"
                 type="password" placeholder="New password"
                 value={newPassword} onChange={e => setNewPass(e.target.value)} required/>
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
