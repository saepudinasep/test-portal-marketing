import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function useSessionTimeout(timeout = 5 * 60 * 1000) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      sessionStorage.clear();

      Swal.fire({
        title: "Sesi Berakhir",
        text: "Sesi Anda berakhir karena tidak ada aktivitas selama 5 menit.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/");
      });
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
