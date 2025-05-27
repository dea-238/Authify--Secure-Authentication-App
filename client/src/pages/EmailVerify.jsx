import { useNavigate, Link } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const EmailVerify = () => {
  const inputRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const { getUserData, isLoggedIn, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleVerify = async () => {
    const otp = inputRef.current.map(i => i.value).join("");
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");

    setLoading(true);
    try {
      const res = await axios.post("/verify-otp", { otp });
      if (res.status === 200) {
        toast.success("OTP verified!");
        getUserData();
        navigate("/");
      }
    } catch {
      toast.error("Invalid / expired OTP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) navigate("/");
  }, [isLoggedIn, userData]);

  return (
    <div className="email-verify-container d-flex align-items-center justify-content-center vh-100"
         style={{ background: "linear-gradient(90deg, #6a5af9, #8268f9)" }}>
      <Link to="/" className="position-absolute top-0 start-0 p-4 d-flex gap-2 text-decoration-none">
        <img src={assets.logo} alt="logo" width={32} height={32}/>
        <span className="fs-4 fw-semibold text-light">Authify</span>
      </Link>

      <div className="p-5 rounded-4 shadow bg-white" style={{ width: 400 }}>
        <h4 className="text-center fw-bold mb-2">Verify Email</h4>
        <p className="text-center mb-4">Enter the 6-digit code sent to your email.</p>

        <div className="d-flex gap-2 mb-4 justify-content-between">
          {[...Array(6)].map((_, i) => (
            <input key={i} maxLength={1}
                   className="form-control text-center fs-4"
                   ref={el => (inputRef.current[i] = el)}/>
          ))}
        </div>

        <button className="btn btn-primary w-100 fw-semibold"
                disabled={loading}
                onClick={handleVerify}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
