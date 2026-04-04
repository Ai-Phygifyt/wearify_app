"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-wf-bg flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-xl bg-wf-primary flex items-center justify-center mx-auto mb-6">
          <span className="text-wf-bg text-2xl font-bold tracking-wider">W</span>
        </div>
        <h1 className="text-3xl font-extrabold text-wf-text mb-2">Wearify</h1>
        <p className="text-base text-wf-subtext mb-8">
          AI-powered virtual try-on platform for Indian saree retailers
        </p>
        <button
          onClick={() => router.push("/admin/login")}
          className="px-8 py-3 rounded-lg bg-wf-primary text-white text-sm font-semibold hover:bg-wf-primary/90 transition-colors cursor-pointer"
        >
          Go to Mission Control
        </button>
        <p className="text-xs text-wf-muted mt-10">
          Phygify Technoservices Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
