import { useEffect, useState } from "react";
import TicketTable from "../../components/TicketTable";
import { socket } from "../../utils/socket"; // 🔌 Tambahkan ini
import Swal from "sweetalert2";

export default function Ticket() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    const API_MAP = {
        "JABODEBEK": "https://script.google.com/macros/s/AKfycbzD5wzArS_glbdW3FQwu27hWHZ3OppIMbrHAoIz6eWJindnDW99azxbugYNKq_gyGN_OA/exec",
        "JABODEBEK 1": "https://script.google.com/macros/s/AKfycbzD5wzArS_glbdW3FQwu27hWHZ3OppIMbrHAoIz6eWJindnDW99azxbugYNKq_gyGN_OA/exec",
        "JABODEBEK 2": "https://script.google.com/macros/s/AKfycbzD5wzArS_glbdW3FQwu27hWHZ3OppIMbrHAoIz6eWJindnDW99azxbugYNKq_gyGN_OA/exec",
        "JABODEBEK 3": "https://script.google.com/macros/s/AKfycbzD5wzArS_glbdW3FQwu27hWHZ3OppIMbrHAoIz6eWJindnDW99azxbugYNKq_gyGN_OA/exec",

        "BANTEN": "https://script.google.com/macros/s/AKfycbwkrNAO62wS0OXdfLMkYiyXGJN6bHeTGW_N35dJ80Ihvcpl9g6JrDNwJ1mVpOOFEaalwg/exec",
        "BANTEN 1": "https://script.google.com/macros/s/AKfycbwkrNAO62wS0OXdfLMkYiyXGJN6bHeTGW_N35dJ80Ihvcpl9g6JrDNwJ1mVpOOFEaalwg/exec",
        "BANTEN 2": "https://script.google.com/macros/s/AKfycbwkrNAO62wS0OXdfLMkYiyXGJN6bHeTGW_N35dJ80Ihvcpl9g6JrDNwJ1mVpOOFEaalwg/exec",

        "JABAR": "https://script.google.com/macros/s/AKfycbyhnokKQuDKgYYxGwlrmT0iyF06WwUPJMCJn5j5jEN7h7osNoomyFW2tkU38vPmKECZ/exec",
        "JABAR 1": "https://script.google.com/macros/s/AKfycbyhnokKQuDKgYYxGwlrmT0iyF06WwUPJMCJn5j5jEN7h7osNoomyFW2tkU38vPmKECZ/exec",
        "JABAR 2": "https://script.google.com/macros/s/AKfycbyhnokKQuDKgYYxGwlrmT0iyF06WwUPJMCJn5j5jEN7h7osNoomyFW2tkU38vPmKECZ/exec",

        "JATIM": "https://script.google.com/macros/s/AKfycbxLbfnnxZ2IJ2-Ex3AeTKr-8r62MnCDcJ84RLukj8W5qvEMoephopN8kcu-dXtDacE/exec",
        "JATIM 1": "https://script.google.com/macros/s/AKfycbxLbfnnxZ2IJ2-Ex3AeTKr-8r62MnCDcJ84RLukj8W5qvEMoephopN8kcu-dXtDacE/exec",
        "JATIM 2": "https://script.google.com/macros/s/AKfycbxLbfnnxZ2IJ2-Ex3AeTKr-8r62MnCDcJ84RLukj8W5qvEMoephopN8kcu-dXtDacE/exec",
        "JATIM 3": "https://script.google.com/macros/s/AKfycbxLbfnnxZ2IJ2-Ex3AeTKr-8r62MnCDcJ84RLukj8W5qvEMoephopN8kcu-dXtDacE/exec",
        "JATIM 5": "https://script.google.com/macros/s/AKfycbxLbfnnxZ2IJ2-Ex3AeTKr-8r62MnCDcJ84RLukj8W5qvEMoephopN8kcu-dXtDacE/exec",

        "SULAWESI": "https://script.google.com/macros/s/AKfycbwUdi2zsHWeeDcKHVy3YkjrMojhQ6KZ_L66IgeXcHOUw_rzhE3kC6lihiRZt151BSm4/exec",
        "SULAWESI 1": "https://script.google.com/macros/s/AKfycbwUdi2zsHWeeDcKHVy3YkjrMojhQ6KZ_L66IgeXcHOUw_rzhE3kC6lihiRZt151BSm4/exec",
        "SULAWESI 2": "https://script.google.com/macros/s/AKfycbwUdi2zsHWeeDcKHVy3YkjrMojhQ6KZ_L66IgeXcHOUw_rzhE3kC6lihiRZt151BSm4/exec",

        "JATENGUT ": "https://script.google.com/macros/s/AKfycbzRC_eCEnQZWcgpu1K5bk7X2IKIyNTG_UuachpiFrjMfmpyi0C10yhCg-2JXSRYVrImjw/exec",
        "JATENGUT 1": "https://script.google.com/macros/s/AKfycbzRC_eCEnQZWcgpu1K5bk7X2IKIyNTG_UuachpiFrjMfmpyi0C10yhCg-2JXSRYVrImjw/exec",
        "JATENGUT 2": "https://script.google.com/macros/s/AKfycbzRC_eCEnQZWcgpu1K5bk7X2IKIyNTG_UuachpiFrjMfmpyi0C10yhCg-2JXSRYVrImjw/exec",

        "JATENGSEL ": "https://script.google.com/macros/s/AKfycbwTmBG10BIdiCG5cIAimREdpcG1LOsMujU5mxRbZ7wFCSaPz2R7-5Sttk25Znm-0tgqWA/exec",
        "JATENGSEL 1": "https://script.google.com/macros/s/AKfycbwTmBG10BIdiCG5cIAimREdpcG1LOsMujU5mxRbZ7wFCSaPz2R7-5Sttk25Znm-0tgqWA/exec",
        "JATENGSEL 2": "https://script.google.com/macros/s/AKfycbwTmBG10BIdiCG5cIAimREdpcG1LOsMujU5mxRbZ7wFCSaPz2R7-5Sttk25Znm-0tgqWA/exec",

        "SUMBAGUT ": "https://script.google.com/macros/s/AKfycbzLaKM81fBxmoI2k1JMOOsLpsFY0NaOBFfgm_dgTo-fuRZNLApxcE2SGNOKougFGmdz-g/exec",
        "SUMBAGUT 1": "https://script.google.com/macros/s/AKfycbzLaKM81fBxmoI2k1JMOOsLpsFY0NaOBFfgm_dgTo-fuRZNLApxcE2SGNOKougFGmdz-g/exec",
        "SUMBAGUT 2": "https://script.google.com/macros/s/AKfycbzLaKM81fBxmoI2k1JMOOsLpsFY0NaOBFfgm_dgTo-fuRZNLApxcE2SGNOKougFGmdz-g/exec",

        "SUMBAGSEL ": "https://script.google.com/macros/s/AKfycbxt1FaMBPX8WsCOKCPCASJR2AFN_ERWqJ7OH9E7feIqNLiwuftGHdqW8pcGQoAu7LLaog/exec",
        "SUMBAGSEL 1": "https://script.google.com/macros/s/AKfycbxt1FaMBPX8WsCOKCPCASJR2AFN_ERWqJ7OH9E7feIqNLiwuftGHdqW8pcGQoAu7LLaog/exec",
        "SUMBAGSEL 2": "https://script.google.com/macros/s/AKfycbxt1FaMBPX8WsCOKCPCASJR2AFN_ERWqJ7OH9E7feIqNLiwuftGHdqW8pcGQoAu7LLaog/exec",

        "KALIMANTAN": "https://script.google.com/macros/s/AKfycbz8Pnv8NA6LLAbspGZpq2JYy2dK3khdjAnrWIDZOiM0ykMblOnVn39QJniXYOqA0MAo/exec",

        "KANTOR PUSAT": "https://script.google.com/macros/s/AKfycbwt5mNdUUlcG5SRiGzupRRNWqcgmcGGW-PbzmA_G9hEE6_yKL5oCtAXSZMqs63TAzVmiA/exec",
    };

    const getApiUrl = (region) => {
        return API_MAP[region?.toUpperCase()] || null;
    };

    // Fungsi untuk ambil data tiket
    const fetchTickets = async (storedUser) => {
        try {
            const apiUrl = getApiUrl(storedUser?.region);

            if (!apiUrl) {
                console.error("API URL tidak ditemukan untuk region:", storedUser?.region);
                setTickets([]);
                return;
            }

            const res = await fetch(apiUrl);
            const json = await res.json();

            if (!json.data) {
                setTickets([]);
                return;
            }

            const mapped = json.data.map((row) => {
                const rawTimestamp = row["Timestamp"] ? new Date(row["Timestamp"]) : null;
                const createDate = rawTimestamp
                    ? rawTimestamp.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })
                    : "-";

                return {
                    ticketId: row["Ticket ID"] || "-",
                    createDate,
                    rawTimestamp,
                    errorSystem: row["Sub Kendala"] || "-",
                    status: row["Status Ticket"] || "-",
                    brand: row["Brand"] || "-",
                    region: row["Region"] || "-",
                    cabang: row["Cabang"] || "-",
                    nik: row["Created By (NIK)"] || "-",
                };
            });

            let filteredTickets = mapped;

            if (storedUser) {
                const akses = storedUser.akses?.toUpperCase();

                switch (akses) {
                    case "REGION":
                        filteredTickets = mapped.filter(
                            (t) =>
                                t.region?.toLowerCase() ===
                                storedUser.region?.toLowerCase()
                        );
                        break;
                    case "BRANCH":
                        filteredTickets = mapped.filter(
                            (t) =>
                                t.region?.toLowerCase() ===
                                storedUser.region?.toLowerCase() &&
                                t.cabang?.toLowerCase() ===
                                storedUser.cabang?.toLowerCase()
                        );
                        break;
                    case "SURVEYOR":
                        filteredTickets = mapped.filter(
                            (t) =>
                                t.region?.toLowerCase() ===
                                storedUser.region?.toLowerCase() &&
                                t.cabang?.toLowerCase() ===
                                storedUser.cabang?.toLowerCase() &&
                                t.brand?.toLowerCase() ===
                                storedUser.product?.toLowerCase()
                        );
                        break;
                    case "CMO":
                    case "MAO":
                        filteredTickets = mapped.filter(
                            (t) =>
                                t.nik?.toString().trim() ===
                                storedUser.nik?.toString().trim()
                        );
                        break;
                    case "HO":
                        filteredTickets = mapped;
                        break;
                    default:
                        filteredTickets = [];
                        break;
                }
            }

            filteredTickets.sort(
                (a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp)
            );

            setTickets(filteredTickets);
        } catch (error) {
            console.error("Gagal memuat tiket:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem("userData"));
        if (storedUser) setUserData(storedUser);

        fetchTickets(storedUser);

        // 🔌 Hubungkan ke socket.io
        socket.on("connect", () => {
            console.log("Terhubung ke socket.io:", socket.id);
        });

        // 🔔 Saat ada tiket baru / update
        socket.on("ticketUpdated", (data) => {
            console.log("Ticket update received:", data);
            Swal.fire("Update Ticket", data.message || "Tiket baru / update ditemukan", "info");
            fetchTickets(storedUser); // refresh data
        });

        // 🧹 Bersihkan listener saat komponen unmount
        return () => {
            socket.off("ticketUpdated");
        };
    }, []);

    if (loading)
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );

    return (
        <div className="p-4">
            <TicketTable
                tickets={tickets}
                userData={userData}
                openTicketDetail={(id) => console.log("Open Ticket", id)}
            />
        </div>
    );
}
