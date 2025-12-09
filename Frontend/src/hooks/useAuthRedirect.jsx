// useAuthRedirect.js  (لصفحة login بس)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
}
