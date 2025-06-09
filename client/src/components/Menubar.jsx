import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Menubar = () => {
  const navigate = useNavigate();
  const { userData, setUserData, setIsLoggedIn } = useContext(AppContext);
  console.log(userData)
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`);
      setIsLoggedIn(false);
      setUserData(null);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const sendVerifyOtp = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/send-otp`);
      navigate("/email-verify");
      toast.success("OTP sent");
    } catch (err) {
      toast.error("Unable to send OTP");
    }
  };

  return (
    <nav className="navbar bg-white px-5 py-4 d-flex justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <img src={assets.logo_home} alt="logo" width={32} height={32} />
        <span className="fw-bold fs-4 text-dark">Authify</span>
      </div>

      {/* right side */}
      {userData ? (
        <div ref={ref} className="position-relative">
          <div className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: 40, height: 40, cursor: "pointer" }}
            onClick={() => setOpen(prev => !prev)}>
            {userData.name[0].toUpperCase()}
          </div>

          {open && (
            <div className="position-absolute shadow bg-white rounded p-2"
              style={{ right: 0, top: 50, zIndex: 100 }}>
              {!userData.isAccountVerified && (
                <div className="dropdown-item py-1 px-2" style={{ cursor: "pointer" }}
                  onClick={sendVerifyOtp}>
                  Verify email
                </div>
              )}
              <div className="dropdown-item py-1 px-2 text-danger"
                style={{ cursor: "pointer" }} onClick={logout}>
                Logout
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="btn btn-outline-dark rounded-pill px-3" onClick={() => navigate("/login")}>
          Login <i className="bi bi-arrow-right ms-2"></i>
        </div>
      )}
    </nav>
  );
};

export default Menubar;
