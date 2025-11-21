import { useEffect, useState } from "react";
import TicketTable from "../../components/TicketTable";
import { socket } from "../../utils/socket"; // 🔌 Tambahkan ini
import Swal from "sweetalert2";

export default function Ticket() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    const API_URL =
        "https://script.google.com/macros/s/AKfycbxQ9ZpBhykc5-_HyMZG7J3lVh-JboZDrJsci0QJDW1IO0GCXZfdvrnQElbA4_N0A_HQ3g/exec";

    // Fungsi untuk ambil data tiket
    const fetchTickets = async (storedUser) => {
        try {
            const res = await fetch(API_URL);
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
                    errorSystem: row["Kendala System"] || "-",
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
