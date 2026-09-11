import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return <main className="min-h-screen flex items-center justify-center p-6"><Suspense fallback={<p>Memuat...</p>}><ResetPasswordForm /></Suspense></main>;
}
