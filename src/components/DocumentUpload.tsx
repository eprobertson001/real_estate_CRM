'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onDocumentParsed?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  extractedData: any;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function DocumentUpload({ onDocumentParsed, onError }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      onError?.('Some files were skipped. Only PDF and Word documents are supported.');
    }

    for (const file of validFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    // Add file to state with uploading status
    const tempFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      extractedData: null,
      status: 'uploading'
    };
    
    setUploadedFiles(prev => [...prev, tempFile]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Update file status to success
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'success' as const, extractedData: result.extractedData }
              : f
          )
        );

        // Notify parent component of parsed data
        onDocumentParsed?.(result.extractedData);
      } else {
        // Update file status to error
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'error' as const, error: result.error }
              : f
          )
        );
        onError?.(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: 'error' as const, error: 'Network error occurred' }
            : f
        )
      );
      onError?.('Network error occurred while uploading');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              Upload Property Documents
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop PDF or Word documents, or click to browse
            </p>
          </div>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            onChange={handleFileSelect}
          />
          
          <Button
            type="button"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? 'Uploading...' : 'Browse Files'}
          </Button>
          
          <p className="text-xs text-gray-400">
            Supported formats: PDF, DOC, DOCX (Max 10MB per file)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Documents
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  
                  {file.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.name)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Data Preview */}
      {uploadedFiles.some(f => f.status === 'success' && f.extractedData) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Extracted Information
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 mb-2">
              ✅ Successfully extracted property information from documents:
            </p>
            {uploadedFiles
              .filter(f => f.status === 'success' && f.extractedData)
              .map((file, index) => (
                <div key={index} className="text-xs text-green-700 ml-4">
                  <strong>{file.name}:</strong> Found{' '}
                  {Object.keys(file.extractedData || {}).length} data fields
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
