import { useState, useCallback } from 'react';
import type { ParsedLeadRow } from '../types/bulk-import.types';
import { parseCSVToLeads, getDemoLeadRows } from '../utils/csv-helper';
import { downloadStyledExcelTemplate, parseExcelFileBuffer } from '../utils/excel-helper';
import toast from 'react-hot-toast';

export interface UseCSVFileUploadProps {
  taxYear: number;
  onParsedSuccess: (rows: ParsedLeadRow[]) => void;
  onClear: () => void;
}

/**
 * Custom Hook dedicated to CSV / Excel File Drag & Drop, Parsing, and Template Downloading.
 */
export const useCSVFileUpload = ({
  taxYear,
  onParsedSuccess,
  onClear,
}: UseCSVFileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // Format file size in KB / MB
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Process and parse CSV or XLSX File content
  const processCSVFile = useCallback((selectedFile: File) => {
    const isExcel = selectedFile.name.toLowerCase().endsWith('.xlsx') || selectedFile.name.toLowerCase().endsWith('.xls');
    const isCSV = selectedFile.name.toLowerCase().endsWith('.csv');

    if (!isExcel && !isCSV) {
      toast.error('Please upload a valid .xlsx or .csv file');
      return;
    }

    setIsParsing(true);
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(formatFileSize(selectedFile.size));

    if (isExcel) {
      // Parse native Excel format using ExcelJS
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const parsed = await parseExcelFileBuffer(buffer, taxYear);

          if (parsed.length === 0) {
            toast.error('The selected Excel file contains no data rows');
            setIsParsing(false);
            return;
          }

          onParsedSuccess(parsed);
          toast.success(`Successfully parsed ${parsed.length} records from ${selectedFile.name}`);
        } catch (err) {
          console.error('Error parsing Excel file:', err);
          toast.error('Failed to parse Excel file. Please check column format.');
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read Excel file');
        setIsParsing(false);
      };

      reader.readAsArrayBuffer(selectedFile);
    } else {
      // Parse CSV text format
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = parseCSVToLeads(text, taxYear);

          if (parsed.length === 0) {
            toast.error('The selected CSV file contains no data rows');
            setIsParsing(false);
            return;
          }

          onParsedSuccess(parsed);
          toast.success(`Successfully parsed ${parsed.length} records from ${selectedFile.name}`);
        } catch (err) {
          console.error('Error parsing CSV:', err);
          toast.error('Failed to parse CSV file. Please check column format.');
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read CSV file');
        setIsParsing(false);
      };

      reader.readAsText(selectedFile);
    }
  }, [taxYear, onParsedSuccess]);

  // Drag & Drop event handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processCSVFile(droppedFile);
    }
  }, [processCSVFile]);

  // File input change handler (via Browse button)
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processCSVFile(selectedFile);
    }
    e.target.value = '';
  }, [processCSVFile]);

  // 1-Click Load Demo Data for Instant UI Preview
  const handleLoadDemoData = useCallback(() => {
    setIsParsing(true);
    setTimeout(() => {
      const demoData = getDemoLeadRows();
      setFile(new File([''], 'sample_tax_leads_2025.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      setFileName('sample_tax_leads_2025.xlsx');
      setFileSize('18.4 KB');
      onParsedSuccess(demoData);
      setIsParsing(false);
      toast.success(`Loaded ${demoData.length} sample lead records for preview`);
    }, 200);
  }, [onParsedSuccess]);

  // Download Styled Native Excel Template (.xlsx) with Emerald Green Header & Bold Font
  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadStyledExcelTemplate(taxYear);
      toast.success(`Excel template downloaded with Emerald Green header and bold styling!`);
    } catch (err) {
      console.error('Error downloading template:', err);
      toast.error('Failed to download Excel template');
    }
  }, [taxYear]);

  // Reset uploaded file state
  const handleClearFile = useCallback(() => {
    setFile(null);
    setFileName('');
    setFileSize('');
    onClear();
    toast.success('Import reset');
  }, [onClear]);

  return {
    file,
    fileName,
    fileSize,
    isDragOver,
    isParsing,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleLoadDemoData,
    handleDownloadTemplate,
    handleClearFile,
  };
};
