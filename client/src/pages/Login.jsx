import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { AppConstants } from "../util/constants.js";

const Login = () => {
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const { setIsLoggedIn, getUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isCreateAccount) {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/register`, {
  name,
  email,
  password,
});
        if (res.status === 201) {
          toast.success("Account created successfully.");
          navigate("/");
        }
      } else {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, {
  email,
  password,
});
        if (res.status === 200) {
          setIsLoggedIn(true);
          getUserData();
          navigate("/");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-relative min-vh-100 d-flex justify-content-center align-items-center"
         style={{ background: "linear-gradient(90deg, #6a5af9, #8268f9)" }}>
      {/* brand */}
      <div className="position-absolute top-0 start-0 p-4 d-flex gap-2">
        <img src={assets.logo} alt="logo" width={32} height={32}/>
        <span className="fs-4 fw-bold text-light">Authify</span>
      </div>

      {/* form card */}
      <div className="card p-4" style={{ maxWidth: 400, width: "100%" }}>
        <h2 className="text-center mb-4">
          {isCreateAccount ? "Create Account" : "Login"}
        </h2>

        <form onSubmit={onSubmitHandler}>
          {isCreateAccount && (
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input className="form-control"
                     value={name}
                     onChange={e => setName(e.target.value)}
                     required/>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control"
                   type="email"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   required/>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control"
                   type="password"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   required/>
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Loading..." :
              isCreateAccount ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="text-center mt-3">
          {isCreateAccount ? (
            <>Already have an account?{" "}
              <span className="text-decoration-underline"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsCreateAccount(false)}>
                Login here
              </span>
            </>
          ) : (
            <>Don't have an account?{" "}
              <span className="text-decoration-underline"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsCreateAccount(true)}>
                Sign up
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
