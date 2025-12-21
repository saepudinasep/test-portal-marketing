import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ userData }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(userData || null);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    // Ambil user dari sessionStorage
    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem("userData"));
        if (storedUser) setUser(storedUser);
    }, [userData]);

    // Efek scroll (shadow)
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Redirect ke login bila belum login
    useEffect(() => {
        if (!user) {
            const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
            if (!isLoggedIn) navigate("/login");
        }
    }, [user, navigate]);

    // Flags
    const isHeadOffice = user?.cabang?.toLowerCase() === "kantor pusat";
    const isCMO = user?.akses === "CMO";
    const isMAO = user?.akses === "MAO";

    // === Build navItems berdasarkan role ===
    let navItems = [];

    if (isHeadOffice) {
        navItems = [
            { name: "Dashboard", path: "/dashboard" },
            {
                name: "Pelaporan Issue",
                submenu: [
                    { name: "Ticket", path: "/dashboard/ticket" },
                    { name: "Report", path: "/dashboard/report" },
                ],
            },
            {
                name: "Agency",
                submenu: [
                    { name: "Maintain", path: "/dashboard/maintance" },
                    { name: "Rekrut MA", path: "/dashboard/rekrutMA" },
                    { name: "Input Database", path: "/dashboard/leads" },
                ],
            },
            { name: "Visit Konsumen", path: "/dashboard/visiting" },
            { name: "Panduan", path: "/dashboard/panduan" },
            { name: "Setting", path: "/dashboard/setting" },
        ];
    } else if (isCMO) {
        navItems = [
            { name: "Dashboard", path: "/dashboard" },
            {
                name: "Pelaporan Issue",
                submenu: [
                    { name: "Ticket", path: "/dashboard/ticket" },
                    { name: "New Ticket", path: "/dashboard/ticket/new" },
                ],
            },
            { name: "Visit Konsumen", path: "/dashboard/visiting" },
            { name: "Cek Biro Kredit", path: "/dashboard/cekBiro" },
            { name: "Panduan", path: "/dashboard/panduan" },
            { name: "Setting", path: "/dashboard/setting" },
        ];
    } else if (isMAO) {
        navItems = [
            { name: "Dashboard", path: "/dashboard" },
            {
                name: "Pelaporan Issue",
                submenu: [
                    { name: "Ticket", path: "/dashboard/ticket" },
                    { name: "New Ticket", path: "/dashboard/ticket/new" },
                ],
            },
            {
                name: "Agency",
                submenu: [
                    { name: "Maintain", path: "/dashboard/maintance" },
                    { name: "Rekrut MA", path: "/dashboard/rekrutMA" },
                    { name: "Input Database", path: "/dashboard/leads" },
                ],
            },
            { name: "Cek Biro Kredit", path: "/dashboard/cekBiro" },
            { name: "Panduan", path: "/dashboard/panduan" },
            { name: "Setting", path: "/dashboard/setting" },
        ];
    } else {
        // Non-HO & bukan CMO/MAO
        navItems = [
            { name: "Dashboard", path: "/dashboard" },
            {
                name: "Pelaporan Issue",
                submenu: [
                    { name: "Ticket", path: "/dashboard/ticket" },
                    { name: "New Ticket", path: "/dashboard/ticket/new" },
                ],
            },
            {
                name: "Agency",
                submenu: [
                    { name: "Maintain", path: "/dashboard/maintance" },
                    { name: "Rekrut MA", path: "/dashboard/rekrutMA" },
                    { name: "Input Database", path: "/dashboard/leads" },
                ],
            },
            { name: "Visit Konsumen", path: "/dashboard/visiting" },
            { name: "Cek Biro Kredit", path: "/dashboard/cekBiro" },
            { name: "Panduan", path: "/dashboard/panduan" },
            { name: "Setting", path: "/dashboard/setting" },
        ];
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md ${isScrolled
                ? "bg-white/70 shadow-sm border-b border-gray-200"
                : "bg-white"
                }`}
        >
            <div className="flex justify-between items-center px-6 py-4 md:justify-center">
                {/* Logo (mobile) */}
                <div className="md:hidden">
                    <h1
                        className="text-blue-600 font-bold text-lg cursor-pointer"
                        onClick={() => navigate("/dashboard")}
                    >
                        WOM Finance
                    </h1>
                </div>

                {/* Toggle (mobile) */}
                <button
                    className="md:hidden text-gray-800 focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Desktop menu */}
                <ul className="hidden md:flex justify-center items-center gap-10">
                    {navItems.map((item) => (
                        <li key={item.name} className="relative group">
                            {!item.submenu ? (
                                <span
                                    onClick={() => navigate(item.path)}
                                    className={`cursor-pointer px-3 py-1.5 text-lg font-medium transition-all duration-200 ${isActive(item.path)
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-800 hover:text-blue-500 hover:border-b-2 hover:border-blue-300"
                                        }`}
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <>
                                    <button
                                        onClick={() =>
                                            setDropdownOpen(dropdownOpen === item.name ? null : item.name)
                                        }
                                        className="flex items-center gap-1 text-gray-800 hover:text-blue-600 font-medium text-lg"
                                    >
                                        {item.name}
                                        <ChevronDown
                                            size={18}
                                            className={`transition-transform ${dropdownOpen === item.name ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {dropdownOpen === item.name && (
                                            <motion.ul
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-48"
                                            >
                                                {item.submenu.map((sub) => (
                                                    <li
                                                        key={sub.path}
                                                        onClick={() => {
                                                            navigate(sub.path);
                                                            setDropdownOpen(null);
                                                        }}
                                                        className={`px-4 py-2 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${isActive(sub.path)
                                                            ? "bg-blue-100 text-blue-600 font-semibold"
                                                            : ""
                                                            }`}
                                                    >
                                                        {sub.name}
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col items-center gap-2 py-4 border-t border-gray-200 bg-white/95 md:hidden"
                    >
                        {navItems.map((item) => (
                            <li key={item.name} className="w-full text-center">
                                {!item.submenu ? (
                                    <div
                                        onClick={() => {
                                            navigate(item.path);
                                            setMenuOpen(false);
                                        }}
                                        className={`py-2 text-lg font-medium cursor-pointer ${isActive(item.path)
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-gray-800 hover:text-blue-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {item.name}
                                    </div>
                                ) : (
                                    <details className="group">
                                        <summary className="py-2 flex justify-center items-center gap-1 text-lg font-medium cursor-pointer text-gray-800 hover:text-blue-600 list-none">
                                            {item.name}
                                            <ChevronDown
                                                size={18}
                                                className="text-gray-600 group-open:rotate-180 transition-transform duration-200"
                                            />
                                        </summary>
                                        <ul className="flex flex-col gap-1">
                                            {item.submenu.map((sub) => (
                                                <li
                                                    key={sub.path}
                                                    onClick={() => {
                                                        navigate(sub.path);
                                                        setMenuOpen(false);
                                                    }}
                                                    className={`py-2 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${isActive(sub.path)
                                                        ? "text-blue-600 bg-blue-100 font-semibold"
                                                        : ""
                                                        }`}
                                                >
                                                    {sub.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </nav>
    );
}
