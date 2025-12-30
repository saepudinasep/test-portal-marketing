import { Link } from "react-router-dom"; // ganti ke react-router-dom jika pakai React Router

export default function pageError() {
    return (
        <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-base font-semibold text-indigo-600">404</p>

                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                    Page not found
                </h1>

                <p className="mt-6 text-lg text-gray-500 sm:text-xl">
                    Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Kembali ke Dashboard
                    </Link>

                    <a
                        href="mailto:support@company.com"
                        className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                        Hubungi Support →
                    </a>
                </div>
            </div>
        </main>
    );
}
