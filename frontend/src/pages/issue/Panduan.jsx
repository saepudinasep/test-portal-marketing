import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Panduan() {
    const [faqList, setFaqList] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        // Ganti URL ini dengan URL Apps Script kamu yang sudah dipublish
        fetch("https://script.google.com/macros/s/AKfycbztmtKSvOIcEq5ZEHLy483IAt1KCmPyfhY31tI-LL46hhuHABD3ILVItk8tnAWSQn7gdw/exec")
            .then((res) => res.json())
            .then((data) => {
                setFaqList(data.data || []);
            })
            .catch((err) => console.error("Error fetching FAQ:", err));
    }, []);

    return (
        <div className="w-full px-4 md:px-10 mt-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg p-6">
                <h2
                    className="text-center font-bold text-2xl uppercase mb-6"
                    style={{ letterSpacing: "1px", color: "#2b3990" }}
                >
                    Panduan
                </h2>

                {/* Daftar FAQ */}
                <div>
                    {faqList.length === 0 ? (
                        <p className="text-center text-gray-500">Belum ada panduan.</p>
                    ) : (
                        faqList.map((faq, index) => {
                            const isLink = /^https?:\/\//.test(faq.Text || "");
                            const isOpen = openIndex === index;

                            return (
                                <div
                                    key={index}
                                    className="border-b border-gray-300 py-3 transition-all duration-200"
                                >
                                    {/* Header FAQ */}
                                    <div
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() =>
                                            setOpenIndex(isOpen ? null : index)
                                        }
                                    >
                                        <h5 className="font-semibold text-gray-800 text-lg">
                                            {faq.Title}
                                        </h5>
                                        {isOpen ? (
                                            <ChevronUp className="text-gray-700" size={20} />
                                        ) : (
                                            <ChevronDown className="text-gray-700" size={20} />
                                        )}
                                    </div>

                                    {/* Konten */}
                                    {isOpen && (
                                        <div className="mt-3 text-gray-700 text-sm">
                                            {isLink ? (
                                                <a
                                                    href={faq.Text}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline break-all"
                                                >
                                                    {faq.Text}
                                                </a>
                                            ) : (
                                                <p className="mb-0">{faq.Text}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
