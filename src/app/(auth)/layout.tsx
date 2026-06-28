import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Masuk",
    template: "%s | PondFlow",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500 text-white text-2xl font-bold mb-3 shadow-md">
            🐟
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PondFlow</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manajemen keuangan budidaya ikan
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
