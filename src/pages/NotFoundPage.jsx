import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🔍</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-base font-semibold text-slate-700 mb-2">Trang không tìm thấy</p>
        <p className="text-sm text-slate-500 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            as={Link}
            to="/"
            variant="primary"
            icon={<Home size={15} />}
          >
            Về trang chủ
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            icon={<ArrowLeft size={15} />}
          >
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
