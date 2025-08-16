"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // /admin'e geldiğinde otomatik olarak /admin/dashboard'a yönlendir
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Dashboard'a yönlendiriliyor...</p>
      </div>
    </div>
  );
}
