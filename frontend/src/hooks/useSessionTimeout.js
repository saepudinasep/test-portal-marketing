import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useSessionTimeout(timeout = 5 * 60 * 1000) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      sessionStorage.clear();
      alert("Sesi Anda berakhir karena tidak ada aktivitas selama 5 menit.");
      navigate("/");
    }, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, []);

  return { resetTimer };
}
