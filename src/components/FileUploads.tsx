"use client";

import axios from "axios";
import {
  FileAudio,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
  Plus,
  X,
} from "lucide-react";
import React, { ChangeEvent, useRef } from "react";

type FileWithProgress = {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
};

function FileUploads() {
  const [files, setFiles] = React.useState<FileWithProgress[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: File[]) => {
    const nextFiles = newFiles.map((file) => ({
      file,
      id: file.name + Date.now(), // safer unique ID
      progress: 0,
      uploaded: false,
    }));

    setFiles((prev) => [...prev, ...nextFiles]);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files?.length) return;
    handleFiles(Array.from(e.target.files));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClearFiles = () => setFiles([]);

  const handleUploadFiles = async () => {
    if (files.length === 0 || uploading) return;

    setUploading(true);

    const uploadPromises = files.map(async (f) => {
      const formData = new FormData();
      formData.append("file", f.file);

      try {
        await axios.post("https://httpbin.org/post", formData, {
          onUploadProgress: (e) => {
            const percentCompleted = Math.round(
              (e.loaded * 100) / (e.total || 1)
            );
            setFiles((prev) =>
              prev.map((file) =>
                file.id === f.id
                  ? { ...file, progress: percentCompleted }
                  : file
              )
            );
          },
        });

        setFiles((prev) =>
          prev.map((file) =>
            file.id === f.id ? { ...file, uploaded: true, progress: 100 } : file
          )
        );
      } catch (err) {
        console.error("Upload error:", err);
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
  };

  const removeFile = () => setFiles([]);
  return (
    <div className="flex flex-col items-center p-4 min-h-screen w-full">
      <h1 className="text-2xl font-bold mb-4 text-center">File Uploads</h1>

      {/* ✅ Pass handleFiles here */}
      <DragAndDrop onDropFiles={handleFiles} />

      <div className="flex flex-col mt-5 sm:flex-row justify-center items-center sm:items-stretch gap-4 w-full max-w-4xl">
        <FileInput
          inputRef={inputRef}
          disabled={uploading}
          onFileSelect={handleFileSelect}
        />
        <ActionButtons
          disabled={files.length === 0 || uploading}
          onUpload={handleUploadFiles}
          onClear={removeFile}
        />
      </div>

      <div className="mt-6 w-full max-w-4xl">
        <FileList
          file={files}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          uploading={uploading}
        />
      </div>
    </div>
  );
}

function DragAndDrop({
  onDropFiles,
}: {
  onDropFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onDropFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      onDropFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col gap-2 w-full max-w-xl px-4 sm:px-0"
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
        id="fileUploadInput"
        multiple
      />

      <label
        htmlFor="fileUploadInput"
        className="text-[#CBCBCB] h-[150px] flex justify-center items-center w-full border-2 border-dashed border-[rgba(205,203,203,0.25)] p-2 rounded-md cursor-pointer text-center text-sm sm:text-base"
      >
        Click or Drop File Here
      </label>
    </div>
  );
}

function FileInput({
  inputRef,
  disabled,
  onFileSelect,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        multiple
        className="hidden"
        id="file-upload"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className="flex items-center justify-center gap-2 cursor-pointer border border-white/80 rounded-md bg-grayscale-700 px-6 py-2 hover:opacity-90 text-white w-full sm:w-auto"
      >
        <Plus size={18} />
        Select Files
      </label>
    </>
  );
}

function ActionButtons({
  disabled,
  onUpload,
  onClear,
}: {
  disabled: boolean;
  onUpload: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
      <button
        onClick={onUpload}
        disabled={disabled}
        className="flex cursor-pointer items-center justify-center gap-2 border border-white/80 rounded-md bg-grayscale-700 px-6 py-2 hover:opacity-90 text-white"
      >
        Upload
      </button>
      <button
        onClick={onClear}
        disabled={disabled}
        className="flex cursor-pointer items-center justify-center gap-2 border border-white/80 rounded-md bg-grayscale-700 px-6 py-2 hover:opacity-90 text-white"
      >
        Clear
      </button>
    </div>
  );
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType === "application/pdf") return FileText;
  return FileIcon;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

function FileList({
  file,
  onRemove,
  uploading,
}: {
  file: FileWithProgress[];
  onRemove: (id: string) => void;
  uploading: boolean;
}) {
  return (
    <ul className="space-y-3">
      {file.map((f) => (
        <li key={f.id}>
          <FileItem file={f} onRemove={onRemove} uploading={uploading} />
        </li>
      ))}
    </ul>
  );
}

function FileItem({
  file,
  onRemove,
  uploading,
}: {
  file: FileWithProgress;
  onRemove: (id: string) => void;
  uploading: boolean;
}) {
  const Icon = getFileIcon(file.file.type);

  return (
    <div className="rounded-lg border border-white/80 bg-black/60 shadow-sm p-3 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <Icon size={24} className="text-gray-300" />
          <div className="flex flex-col">
            <span className="text-md font-medium text-white break-all">
              {file.file.name}
            </span>
            <span className="text-xs text-gray-400">
              {formatFileSize(file.file.size)}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(file.id)}
          disabled={uploading}
          className="p-1 text-white/60 hover:text-white transition ml-auto"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-1 text-right text-xs text-gray-300">
        {file.uploaded ? "Completed" : `${Math.round(file.progress)}%`}
      </div>

      <ProgressBar progress={file.progress} />
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-[#363636] rounded-full h-1.5 mt-1">
      <div
        className="bg-white h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default FileUploads;
