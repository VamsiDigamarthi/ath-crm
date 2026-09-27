import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AppImageUploadProps {
  value?: File | File[] | string | string[] | null;
  onChange: (files: File | File[] | null) => void;
  multiple?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  maxSizeMB?: number;
  className?: string;
}

export const AppImageUpload: React.FC<AppImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  label,
  helperText,
  error,
  maxSizeMB = 2,
  className,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We maintain a list of previews
  // Each preview item is: { id: string, url: string, file?: File }
  const [previews, setPreviews] = useState<{ id: string; url: string; file?: File }[]>([]);

  // Sync previews whenever value changes
  useEffect(() => {
    if (!value) {
      setPreviews([]);
      return;
    }

    const processItem = (item: File | string): { id: string; url: string; file?: File } | null => {
      if (typeof item === 'string') {
        return { id: item, url: item };
      } else if (item instanceof File) {
        const url = URL.createObjectURL(item);
        return { id: `${item.name}-${item.size}-${item.lastModified}`, url, file: item };
      }
      return null;
    };

    let itemsToProcess: (File | string)[] = [];
    if (Array.isArray(value)) {
      itemsToProcess = value;
    } else {
      itemsToProcess = [value as File | string];
    }

    const newPreviews = itemsToProcess
      .map(processItem)
      .filter((item): item is { id: string; url: string; file?: File } => item !== null);

    setPreviews(newPreviews);

    // Cleanup object URLs on unmount or sync update
    return () => {
      newPreviews.forEach((p) => {
        if (p.file) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [value]);

  const validateFile = (file: File): boolean => {
    setLocalError(null);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Invalid file type. Please upload PNG, JPG, JPEG or WEBP.');
      return false;
    }

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setLocalError(`File size exceeds ${maxSizeMB}MB. Please select a smaller image.`);
      return false;
    }

    return true;
  };

  const handleFilesSelected = (selectedFileList: FileList) => {
    const selectedFiles = Array.from(selectedFileList);
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        // Stop processing on first validation failure (or report)
        return;
      }
    }

    if (validFiles.length === 0) return;

    if (multiple) {
      // Append to existing files if multiple
      const existingFiles = Array.isArray(value) ? (value as File[]).filter(item => item instanceof File) : [];
      // Combine files
      onChange([...existingFiles, ...validFiles]);
    } else {
      // Replace with single file
      onChange(validFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemove = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalError(null);

    if (multiple) {
      const remainingPreviews = previews.filter((p) => p.id !== idToRemove);
      const remainingFiles = remainingPreviews
        .map((p) => p.file || p.url)
        .filter((item): item is File | string => item !== undefined);
      
      // Cast back to File[] or string[]
      onChange(remainingFiles.length > 0 ? (remainingFiles as File[]) : null);
    } else {
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const activeError = error || localError;
  const defaultHelperText = multiple 
    ? `PNG, JPG or JPEG up to ${maxSizeMB}MB (Multiple selection enabled)`
    : `PNG, JPG or JPEG up to ${maxSizeMB}MB`;
  const resolvedHelperText = helperText || defaultHelperText;

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-semibold text-gray-700 font-sans tracking-wide">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Main Container */}
      <div className="w-full">
        {/* Scenario 1: Multiple file upload WITH existing previews */}
        {multiple && previews.length > 0 ? (
          <div className="w-full p-4 bg-white border border-slate-300 rounded-md shadow-2xs">
            {/* Grid display of previews */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {previews.map((preview) => (
                <div
                  key={preview.id}
                  className="relative group aspect-video rounded-md overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-2xs h-[90px]"
                >
                  <img
                    src={preview.url}
                    alt="Upload thumbnail"
                    className="max-h-[80px] w-auto object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover clear mask */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={(e) => handleRemove(preview.id, e)}
                      className="p-1.5 bg-white/90 hover:bg-white text-black rounded-full shadow-lg transition-transform scale-90 group-hover:scale-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add more trigger block */}
              <div
                onClick={triggerSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "aspect-video rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-emerald-600 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-700 h-[90px]",
                  isDragActive ? "border-emerald-600 bg-emerald-50/30 text-emerald-700 scale-[1.01]" : ""
                )}
                title="Add more files"
              >
                <Plus className="w-6 h-6 stroke-[1.8] mb-0.5" />
                <span className="text-[10px] font-bold tracking-wider font-sans">Add More</span>
              </div>
            </div>
          </div>
        ) : (
          /* Scenario 2: Single file preview OR empty multiple file dropzone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerSelect}
            className={cn(
              "w-full min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer transition-all duration-300 bg-white",
              isDragActive ? "border-emerald-600 bg-emerald-50/30 scale-[1.01]" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50",
              activeError ? "border-rose-400 bg-rose-50/10 focus-within:ring-rose-500/20" : ""
            )}
          >
            {previews.length > 0 ? (
              /* Single preview thumbnail container */
              <div className="relative group w-full flex items-center justify-center p-2">
                <div className="relative rounded-md overflow-hidden shadow-xs max-h-[140px] aspect-video border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <img
                    src={previews[0].url}
                    alt="Upload preview"
                    className="max-h-[120px] w-auto object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover clear mask */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-md">
                    <button
                      type="button"
                      onClick={(e) => handleRemove(previews[0].id, e)}
                      className="p-2 bg-white/90 hover:bg-white text-black rounded-full shadow-lg transition-transform scale-90 group-hover:scale-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Completely empty state dropzone */
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="w-5 h-5 stroke-[1.8]" />
                </div>
                <p className="text-sm font-bold text-black font-sans">
                  Drag & drop your {multiple ? 'images' : 'image'}, or <span className="text-[#16A34A] hover:text-[#15803D] underline">browse</span>
                </p>
                <p className="text-xs text-slate-600 mt-1 font-sans font-medium">
                  {resolvedHelperText}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {activeError && (
        <span className="text-xs text-rose-500 font-medium font-sans flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-0.5 duration-200">
          <AlertCircle className="w-3.5 h-3.5" />
          {activeError}
        </span>
      )}
    </div>
  );
};
