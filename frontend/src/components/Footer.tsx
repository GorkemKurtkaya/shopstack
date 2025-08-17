"use client";

import Link from 'next/link';
import { GithubOutlined } from '@ant-design/icons';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ShopStack
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">Modern e-ticaret deneyimi. Güvenli ve hızlı alışveriş.</p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/GorkemKurtkaya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700"
              >
                <GithubOutlined />
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 ShopStack. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
