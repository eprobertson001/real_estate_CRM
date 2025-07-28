'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  propertyAddress: string;
  [key: string]: any;
}

interface DocumentFile {
  id: string;
  title: string;
  type: string;
  originalName: string;
  size: number;
  mimeType: string;
  filePath: string;
  parsedData?: string;
  createdAt: string;
  uploadedBy: {
    name: string | null;
    email: string;
  };
}

interface TransactionAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onTransactionUpdate: () => void;
}

export function TransactionAttachmentsModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onTransactionUpdate 
}: TransactionAttachmentsModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showParsedData, setShowParsedData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch documents for this transaction
  const { data: documents = [], isLoading } = useQuery<DocumentFile[]>({
    queryKey: ['transaction-documents', transaction?.id],
    queryFn: async () => {
      if (!transaction?.id) return [];
      const response = await fetch(`/api/transactions/${transaction.id}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const result = await response.json();
      return result.documents || [];
    },
    enabled: !!transaction?.id && isOpen,
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !transaction) return;

    const file = files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF, Word document, or Excel file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setParsedData(null);
    setShowParsedData(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('transactionId', transaction.id);
      formData.append('type', getDocumentType(file.name));

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          
          // Show parsed data if available
          if (result.parsedData && Object.keys(result.parsedData).length > 0) {
            setParsedData(result.parsedData);
            setShowParsedData(true);
          }

          // Refresh documents list
          queryClient.invalidateQueries({ queryKey: ['transaction-documents', transaction.id] });
          
          // Refresh transaction data if it was updated
          if (result.transactionUpdated) {
            onTransactionUpdate();
          }
          
          setIsUploading(false);
          setUploadProgress(0);
          
          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          const errorText = xhr.responseText;
          let errorMessage = 'Upload failed';
          
          try {
            const errorResult = JSON.parse(errorText);
            errorMessage = errorResult.error || errorResult.details || 'Upload failed';
          } catch (e) {
            errorMessage = `Upload failed with status ${xhr.status}`;
          }
          
          console.error('Upload failed:', errorMessage, 'Full response:', errorText);
          throw new Error(errorMessage);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('POST', '/api/documents/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to upload document: ${errorMessage}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getDocumentType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        if (filename.toLowerCase().includes('contract')) return 'CONTRACT';
        if (filename.toLowerCase().includes('disclosure')) return 'DISCLOSURE';
        if (filename.toLowerCase().includes('inspection')) return 'INSPECTION';
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'DOCUMENT';
      case 'xls':
      case 'xlsx':
        return 'SPREADSHEET';
      default:
        return 'OTHER';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateFilename = (filename: string, maxLength: number = 40): string => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const maxNameLength = maxLength - (extension ? extension.length + 4 : 3); // Account for "..." and extension
    
    if (extension) {
      return `${nameWithoutExt.substring(0, maxNameLength)}...${extension}`;
    } else {
      return `${filename.substring(0, maxLength - 3)}...`;
    }
  };

  const handleView = async (doc: DocumentFile) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      if (!response.ok) throw new Error('Failed to load document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in a new tab for viewing
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('View error:', error);
      alert('Failed to view document');
    }
  };

  const handleCancel = async (doc: DocumentFile) => {
    if (!confirm(`Are you sure you want to remove "${doc.originalName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove document');
      }

      // Refresh documents list (stays in the modal)
      queryClient.invalidateQueries({ queryKey: ['transaction-documents', transaction?.id] });
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove document');
    }
  };

  if (!transaction) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" title={`Attachments - ${transaction.propertyAddress}`}>
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Supported formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Documents will be automatically parsed for transaction information
                </p>
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleFileSelect}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? 'Uploading...' : 'Select Files to Upload'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="bg-white rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Attached Documents ({documents.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading documents...</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate" title={doc.originalName}>
                            {truncateFilename(doc.originalName)}
                          </h4>
                          <div className="text-sm text-gray-500 flex flex-wrap items-center gap-1">
                            <span className="truncate">{doc.type}</span>
                            <span className="flex-shrink-0">•</span>
                            <span className="flex-shrink-0">{formatFileSize(doc.size)}</span>
                            <span className="flex-shrink-0">•</span>
                            <span className="flex-shrink-0">Uploaded {formatDate(doc.createdAt)}</span>
                            <span className="flex-shrink-0">•</span>
                            <span className="truncate">by {doc.uploadedBy.name || doc.uploadedBy.email}</span>
                          </div>
                          {doc.parsedData && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Data Parsed
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(doc)}
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(doc)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">No documents uploaded</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Upload your first document to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Parsed Data Modal */}
      {showParsedData && parsedData && (
        <Modal
          isOpen={showParsedData}
          onClose={() => setShowParsedData(false)}
          size="lg"
          title="Document Data Parsed Successfully"
        >
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-800">Information Extracted</h3>
                  <p className="text-sm text-green-700 mt-1">
                    The following information was found in the document and has been added to the transaction (without overwriting existing data):
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Extracted Data:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(parsedData).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <p className="text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowParsedData(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
