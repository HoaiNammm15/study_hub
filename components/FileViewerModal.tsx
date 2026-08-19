'use client';

import React from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon, Eye } from 'lucide-react';

interface FileViewerModalProps {
  file: {
    id: string;
    file_name: string;
    file_url: string;
  } | null;
  onClose: () => void;
}

export function FileViewerModal({ file, onClose }: FileViewerModalProps) {
  if (!file) return null;

  const fileUrl = file.file_url;
  const fileNameLower = file.file_name.toLowerCase();
  const isPdf = fileNameLower.endsWith('.pdf') || fileUrl.toLowerCase().includes('.pdf');
  const isImage =
    fileNameLower.endsWith('.png') ||
    fileNameLower.endsWith('.jpg') ||
    fileNameLower.endsWith('.jpeg') ||
    fileNameLower.endsWith('.webp') ||
    fileNameLower.endsWith('.gif');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] glass-panel rounded-2xl flex flex-col border border-gray-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80">
          <div className="flex items-center gap-3 truncate max-w-[70%]">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="text-base font-bold text-white truncate">{file.file_name}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-indigo-400" /> Trình xem trực tiếp tài liệu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              download={file.file_name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              Tải Xuống
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Mở tab mới"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-gray-950/90 p-4 overflow-auto flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=1`}
              className="w-full h-full rounded-xl border border-gray-800 bg-white"
              title={file.file_name}
            />
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={file.file_name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
            />
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Không thể xem trước định dạng này</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Định dạng tập tin này không hỗ trợ xem trực tiếp trên trình duyệt. Vui lòng tải về máy để xem.
                </p>
              </div>
              <a
                href={fileUrl}
                download={file.file_name}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg"
              >
                <Download className="w-4 h-4" /> Tải về máy ngay
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
