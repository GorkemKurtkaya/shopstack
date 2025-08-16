"use client";

import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';

export default function Header() {
  return (
    <div className="bg-gray-800 text-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          {/* Contact Info */}
          <div className="flex items-center space-x-6 mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <PhoneOutlined className="text-blue-400" />
              <span>+90 (212) 555 0123</span>
            </div>
            <div className="flex items-center space-x-2">
              <MailOutlined className="text-blue-400" />
              <span>info@shopstack.com</span>
            </div>
          </div>

          {/* Location & Working Hours */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <EnvironmentOutlined className="text-blue-400" />
              <span>İstanbul, Türkiye</span>
            </div>
            <div className="text-gray-300">
              <span>Pazartesi - Cuma: 09:00 - 18:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
