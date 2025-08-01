'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import DocumentUpload from '@/components/DocumentUpload';
import DataConflictResolver, { detectDataConflicts } from '@/components/DataConflictResolver';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectToTransactions?: boolean;
}

type InputMethod = 'manual' | 'import' | 'pdf' | 'document';

const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  redirectToTransactions = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentData, setDocumentData] = useState<Record<string, any>>({});
  const [mlsData, setMlsData] = useState<Record<string, any>>({});
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleMethodSelect = (method: InputMethod) => {
    setSelectedMethod(method);
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setDocumentData({});
    setMlsData({});
    setShowConflictResolver(false);
    setConflicts([]);
    onClose();
  };

  const handleDocumentParsed = (data: Record<string, any>) => {
    setDocumentData(prevData => ({ ...prevData, ...data }));
  };

  const handleMlsDataReceived = (data: Record<string, any>) => {
    setMlsData(data);
    
    // Check for conflicts between MLS and document data
    if (Object.keys(documentData).length > 0) {
      const detectedConflicts = detectDataConflicts(data, documentData);
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        setShowConflictResolver(true);
      }
    }
  };

  const handleConflictResolution = (resolvedData: Record<string, any>) => {
    // Merge resolved data with other non-conflicting data
    const mergedData = { ...mlsData, ...documentData, ...resolvedData };
    setShowConflictResolver(false);
    
    // Proceed to manual form with pre-filled data
    // You can pass this data to the ManualTransactionForm component
    setSelectedMethod('manual');
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      {/* FORCE TEST - Should ALWAYS be visible */}
      <div className="bg-red-500 text-white p-4 rounded text-center">
        <h1 className="text-xl font-bold">🚨 COMPONENT UPDATE TEST v3.0 - {new Date().toLocaleTimeString()} 🚨</h1>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Transaction</h2>
        <p className="text-gray-600">Choose how you'd like to add your transaction data</p>
      </div>

      <div className="grid gap-4">
        {/* Manual Input Option */}
        <button
          onClick={() => handleMethodSelect('manual')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Manual Input</h3>
              <p className="text-gray-600">Enter transaction details manually using our form</p>
            </div>
          </div>
        </button>

        {/* Data Import Option */}
        <button
          onClick={() => handleMethodSelect('import')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left group"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Import Data</h3>
              <p className="text-gray-600">Import from MLS, CSV, or other data sources</p>
            </div>
          </div>
        </button>

        {/* Document Upload Option */}
        <button
          onClick={() => handleMethodSelect('document')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left group"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Documents - UPDATED v3.0</h3>
              <p className="text-gray-600">Upload PDF or Word documents to auto-extract property data</p>
              <p className="text-red-600 text-sm font-bold">🔧 Parse Document Testing Active</p>
            </div>
          </div>
        </button>

        {/* PDF Upload Option - Direct Access */}
        <button
          onClick={() => handleMethodSelect('pdf')}
          className="p-6 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left group"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">🔧 PDF Upload (DEBUG)</h3>
              <p className="text-gray-600">Direct access to PDF upload with Parse Document testing</p>
              <p className="text-green-600 text-sm font-bold">✅ Debug version with enhanced state tracking</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderManualForm = () => {
    // Merge document and MLS data for prefilling
    const mergedData = { ...documentData, ...mlsData };
    
    return (
      <ManualTransactionForm 
        onBack={handleBack}
        onClose={handleClose}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          if (redirectToTransactions) {
            router.push('/transactions');
          }
          handleClose();
        }}
        prefilledData={mergedData}
      />
    );
  };

  const renderImportForm = () => (
    <ImportTransactionForm 
      onBack={handleBack}
      onClose={handleClose}
      onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        if (redirectToTransactions) {
          router.push('/transactions');
        }
        handleClose();
      }}
    />
  );

  const renderPdfUpload = () => (
    <PdfUploadForm 
      onBack={handleBack}
      onClose={handleClose}
      onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        if (redirectToTransactions) {
          router.push('/transactions');
        }
        handleClose();
      }}
    />
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upload Property Documents</h2>
          <p className="text-gray-600">Upload contracts, agreements, or other property documents to auto-extract data</p>
        </div>
        <Button onClick={handleBack} variant="outline" size="sm">
          ← Back to Options
        </Button>
      </div>

      <DocumentUpload
        onDocumentParsed={handleDocumentParsed}
        onError={(error) => {
          console.error('Document upload error:', error);
        }}
      />

      {Object.keys(documentData).length > 0 && (
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Next Steps
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Great! We've extracted property information from your documents. 
              You can now search for MLS data to get additional details, or proceed directly to the form.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setSelectedMethod('import')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get MLS Data
              </Button>
              <Button
                onClick={() => setSelectedMethod('manual')}
                variant="outline"
              >
                Proceed to Form
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" title="New Transaction">
        {!selectedMethod && renderMethodSelection()}
        {selectedMethod === 'manual' && renderManualForm()}
        {selectedMethod === 'import' && renderImportForm()}
        {selectedMethod === 'pdf' && renderPdfUpload()}
        {selectedMethod === 'document' && renderDocumentUpload()}
      </Modal>

      {/* Data Conflict Resolver Modal */}
      {showConflictResolver && (
        <DataConflictResolver
          conflicts={conflicts}
          onResolve={handleConflictResolution}
          onCancel={() => setShowConflictResolver(false)}
        />
      )}
    </>
  );
};

// Manual Transaction Form Component
const ManualTransactionForm: React.FC<{
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
  prefilledData?: Record<string, any>;
}> = ({ onBack, onClose, onSuccess, prefilledData = {} }) => {
  // Debug: Log what data we received
  console.log('ManualTransactionForm received prefilledData:', prefilledData);
  console.log('PrefilledData keys:', Object.keys(prefilledData));
  console.log('PrefilledData address fields:', {
    address: prefilledData.address,
    city: prefilledData.city,
    state: prefilledData.state,
    zipCode: prefilledData.zipCode,
    propertyAddress: prefilledData.propertyAddress
  });

  const [formData, setFormData] = useState({
    address: prefilledData.address || prefilledData.propertyAddress || '',
    city: prefilledData.city || '',
    state: prefilledData.state || '',
    zipCode: prefilledData.zipCode || '',
    propertyType: prefilledData.propertyType || 'Single Family - Detached',
    yearBuilt: prefilledData.yearBuilt || '',
    book: prefilledData.book || '',
    page: prefilledData.page || '',
    county: prefilledData.county || '',
    heatZones: prefilledData.heatZones || '',
    hotWater: prefilledData.hotWater || '',
    sewerUtilities: prefilledData.sewerUtilities || '',
    features: prefilledData.features || '',
    approxLivingAreaTotal: prefilledData.squareFootage || prefilledData.approxLivingAreaTotal || '',
    bedrooms: prefilledData.bedrooms || '',
    bathrooms: prefilledData.bathrooms || '',
    mlsNumber: prefilledData.mlsNumber || '',
    lotSize: prefilledData.lotSize || '',
    yearBuilt: prefilledData.yearBuilt || '',
    listingDate: prefilledData.listingDate || '',
    gradeSchool: prefilledData.gradeSchool || '',
    middleSchool: prefilledData.middleSchool || '',
    highSchool: prefilledData.highSchool || '',
    disclosures: prefilledData.disclosures || '',
    assessed: prefilledData.assessed || '',
    tax: prefilledData.tax || '',
    listPrice: prefilledData.price || prefilledData.listPrice || prefilledData.purchasePrice || '',
    transactionType: prefilledData.transactionType || 'Sale',
    salePrice: prefilledData.price || prefilledData.salePrice || prefilledData.purchasePrice || '',
    clientName: prefilledData.clientName || prefilledData.buyerName || '',
    clientEmail: prefilledData.clientEmail || '',
    clientPhone: prefilledData.clientPhone || '',
    status: prefilledData.status || 'Active',
    closingDate: prefilledData.closingDate || '',
    notes: prefilledData.mlsNumber ? `Parsed from PDF - MLS: ${prefilledData.mlsNumber}` : (prefilledData.notes || '')
  });

  console.log('Form initialized with data:', formData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          listPrice: formData.listPrice ? parseFloat(formData.listPrice) : null,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          closingDate: formData.closingDate ? new Date(formData.closingDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manual Transaction Entry</h2>
          <p className="text-gray-600">Enter the transaction details below</p>
        </div>
        <Button onClick={onBack} variant="outline" size="sm">
          ← Back to Options
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Property Type</option>
                <option value="Single Family - Detached">Single Family - Detached</option>
                <option value="Single Family - Attached">Single Family - Attached</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Condo">Condo</option>
                <option value="Co-op">Co-op</option>
                <option value="Multi-Family">Multi-Family</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <input
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book
              </label>
              <input
                type="text"
                name="book"
                value={formData.book}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page
              </label>
              <input
                type="text"
                name="page"
                value={formData.page}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County
              </label>
              <input
                type="text"
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heat Zones
              </label>
              <input
                type="text"
                name="heatZones"
                value={formData.heatZones}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hot Water
              </label>
              <input
                type="text"
                name="hotWater"
                value={formData.hotWater}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sewer Utilities
              </label>
              <input
                type="text"
                name="sewerUtilities"
                value={formData.sewerUtilities}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Living Area (sqft)
              </label>
              <input
                type="number"
                name="approxLivingAreaTotal"
                value={formData.approxLivingAreaTotal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade School
              </label>
              <input
                type="text"
                name="gradeSchool"
                value={formData.gradeSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle School
              </label>
              <input
                type="text"
                name="middleSchool"
                value={formData.middleSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                High School
              </label>
              <input
                type="text"
                name="highSchool"
                value={formData.highSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disclosures
              </label>
              <textarea
                name="disclosures"
                value={formData.disclosures}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessed Value
              </label>
              <input
                type="number"
                name="assessed"
                value={formData.assessed}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Tax
              </label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Price
              </label>
              <input
                type="number"
                name="listPrice"
                value={formData.listPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sale">Sale</option>
                <option value="Purchase">Purchase</option>
                <option value="Lease">Lease</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Price
              </label>
              <input
                type="number"
                name="listPrice"
                value={formData.listPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Phone
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Closing Date
              </label>
              <input
                type="date"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this transaction..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// MLS Search Form Component
const MLSSearchForm: React.FC<{
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onBack, onClose, onSuccess }) => {
  const [searchData, setSearchData] = useState({
    mls: '1773438' // Default from your example
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [rawApiData, setRawApiData] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.mls) {
      alert('Please enter an MLS number');
      return;
    }

    await performSearch(searchData.mls);
  };

  const handleTestSearch = async () => {
    await performSearch('1773438'); // Use hardcoded test MLS
  };

  const performSearch = async (mlsToUse: string) => {
    console.log('=== SEARCHING WITH MLS ===', mlsToUse);
    
    setIsSearching(true);
    setSearchResults(null);
    setRawApiData(null);
    setShowEditForm(false);

    try {
      const response = await fetch('/api/mls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mls: mlsToUse }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to search MLS data');
      }

      console.log('=== API RESPONSE ===', result);
      setSearchResults(result.data);
      setRawApiData(result.rawData);
      console.log('Raw API Data:', result.rawData); // For debugging
    } catch (error) {
      console.error('MLS Search Error:', error);
      alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleEditData = () => {
    setShowEditForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zillow MLS Property Search</h2>
          <p className="text-gray-600">Enter an MLS number to fetch property details from Zillow</p>
        </div>
        <Button onClick={onBack} variant="outline" size="sm">
          ← Back to Import Options
        </Button>
      </div>

      {!showEditForm ? (
        <>
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MLS Number Search</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MLS Number *
                  </label>
                  <input
                    type="text"
                    name="mls"
                    value={searchData.mls}
                    onChange={handleInputChange}
                    required
                    placeholder="1773438"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: 1773438 (specific MLS listing)
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Fetch Property Data'}
                </Button>
              </div>
            </div>
          </form>

          {/* API Test Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900">Zillow MLS Property API Test</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Uses the exact same format as your Python example: GET /propertyByMls?mls=1773438
                </p>
                <Button 
                  onClick={handleTestSearch}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={isSearching}
                >
                  {isSearching ? 'Testing API...' : 'Test with Default MLS (1773438)'}
                </Button>
              </div>
            </div>
          </div>

          {/* Search Results Preview */}
          {searchResults && rawApiData && (
            <div className="bg-white border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Property Data Retrieved!</h3>
                  <p className="text-gray-600">Preview the property details below, then edit and create transaction</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">Zillow Property API Success</span>
                </div>
              </div>

              {/* Property Data Display */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Property Details Preview:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Address:</span> {rawApiData.address?.streetAddress || rawApiData.streetAddress || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">City:</span> {rawApiData.address?.city || rawApiData.city || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">State:</span> {rawApiData.address?.state || rawApiData.state || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">ZIP Code:</span> {rawApiData.address?.zipcode || rawApiData.zipcode || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Property Type:</span> {rawApiData.propertyTypeDimension || rawApiData.propertyType || rawApiData.homeType || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Year Built:</span> {rawApiData.yearBuilt || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">County:</span> {rawApiData.county || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">ZPID:</span> {rawApiData.zpid || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> {rawApiData.price ? `$${rawApiData.price.toLocaleString()}` : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Zestimate:</span> {rawApiData.zestimate ? `$${rawApiData.zestimate.toLocaleString()}` : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Bedrooms:</span> {rawApiData.bedrooms || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Bathrooms:</span> {rawApiData.bathrooms || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Living Area:</span> {rawApiData.livingArea ? `${rawApiData.livingArea.toLocaleString()} sqft` : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Assessed Value:</span> {rawApiData.resoFacts?.taxAssessedValue ? `$${rawApiData.resoFacts.taxAssessedValue.toLocaleString()}` : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Annual Tax:</span> {rawApiData.resoFacts?.taxAnnualAmount ? `$${rawApiData.resoFacts.taxAnnualAmount.toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Schools:</span> 
                    {rawApiData.schools?.length > 0 
                      ? rawApiData.schools.map((school: any) => `${school.name} (${school.level})`).join(', ')
                      : 'N/A'
                    }
                  </div>
                  <div>
                    <span className="font-medium">Year Built:</span> {rawApiData.yearBuilt || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Lot Size:</span> {rawApiData.lotAreaValue ? `${rawApiData.lotAreaValue.toLocaleString()} sqft` : 'N/A'}
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    View Complete Property API Response (for debugging)
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(rawApiData, null, 2)}
                  </pre>
                </details>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => {
                    setSearchResults(null);
                    setRawApiData(null);
                  }}
                  variant="outline"
                >
                  Search Again
                </Button>
                <Button onClick={handleEditData}>
                  Edit & Create Transaction
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <MLSEditForm 
          searchResults={searchResults}
          rawApiData={rawApiData}
          onBack={() => setShowEditForm(false)}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
};

// MLS Edit Form Component - Shows data in editable form like manual input
const MLSEditForm: React.FC<{
  searchResults: any;
  rawApiData: any;
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ searchResults, rawApiData, onBack, onClose, onSuccess }) => {
  // Extract meaningful data from the raw API response with fallbacks
  const getPropertyInfo = () => {
    const address = rawApiData?.address || {};
    return {
      streetAddress: address.streetAddress || rawApiData?.streetAddress || rawApiData?.formattedChip || '',
      city: address.city || rawApiData?.city || '',
      state: address.state || rawApiData?.state || '',
      zipCode: address.zipcode || rawApiData?.zipcode || ''
    };
  };

  const getPrice = () => {
    return rawApiData?.price || 
           rawApiData?.zestimate || 
           rawApiData?.rentZestimate ||
           searchResults?.price || '';
  };

  const propertyInfo = getPropertyInfo();
  const price = getPrice();

  const [formData, setFormData] = useState({
    address: propertyInfo.streetAddress || 'Property Address',
    city: propertyInfo.city,
    state: propertyInfo.state,
    zipCode: propertyInfo.zipCode,
    propertyType: rawApiData?.propertyTypeDimension || rawApiData?.propertyType || rawApiData?.homeType || 'Single Family - Detached',
    yearBuilt: rawApiData?.yearBuilt?.toString() || '',
    book: '',
    page: '',
    county: rawApiData?.county || '',
    heatZones: Array.isArray(rawApiData?.resoFacts?.heating) ? rawApiData.resoFacts.heating.join(', ') : '',
    hotWater: '',
    sewerUtilities: Array.isArray(rawApiData?.resoFacts?.sewer) ? rawApiData.resoFacts.sewer.join(', ') : rawApiData?.resoFacts?.sewer || '',
    features: [
      ...(Array.isArray(rawApiData?.resoFacts?.exteriorFeatures) ? rawApiData.resoFacts.exteriorFeatures : []),
      ...(Array.isArray(rawApiData?.resoFacts?.interiorFeatures) ? rawApiData.resoFacts.interiorFeatures : []),
      ...(Array.isArray(rawApiData?.resoFacts?.flooring) ? rawApiData.resoFacts.flooring : [])
    ].filter(Boolean).join(', ') || '',
    approxLivingAreaTotal: rawApiData?.livingArea?.toString() || rawApiData?.resoFacts?.livingArea || '',
    gradeSchool: rawApiData?.schools?.find((s: any) => s.level === 'Primary' || s.level === 'Elementary')?.name || '',
    middleSchool: rawApiData?.schools?.find((s: any) => s.level === 'Middle')?.name || '',
    highSchool: rawApiData?.schools?.find((s: any) => s.level === 'High')?.name || '',
    disclosures: '',
    assessed: rawApiData?.resoFacts?.taxAssessedValue?.toString() || '',
    tax: rawApiData?.resoFacts?.taxAnnualAmount?.toString() || rawApiData?.taxHistory?.[0]?.taxPaid?.toString() || '',
    listPrice: rawApiData?.price?.toString() || rawApiData?.zestimate?.toString() || price.toString(),
    transactionType: 'Sale',
    salePrice: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    status: 'Active',
    closingDate: '',
    notes: `Property imported from MLS #${rawApiData?.mlsid || searchResults?.mlsNumber || 'Unknown'} - ${propertyInfo.streetAddress || 'Unknown Property'}`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          listPrice: formData.listPrice ? parseFloat(formData.listPrice) : null,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          closingDate: formData.closingDate ? new Date(formData.closingDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Property Transaction Data</h2>
          <p className="text-gray-600">Review and edit the imported property data before creating transaction</p>
        </div>
        <Button onClick={onBack} variant="outline" size="sm">
          ← Back to Search Results
        </Button>
      </div>

      {/* Imported Data Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900">Data Imported from Zillow MLS Property API</h4>
            <p className="text-sm text-blue-700 mt-1">
              Property data for MLS #{rawApiData?.mlsid || searchResults?.mlsNumber || 'Unknown'} ({rawApiData?.address?.streetAddress || rawApiData?.formattedChip || 'Unknown Property'}) has been pre-filled. Edit any fields as needed.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter specific property address"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pre-filled with property address from Zillow data
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
                <option value="Multi-Family">Multi-Family</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <input
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book
              </label>
              <input
                type="text"
                name="book"
                value={formData.book}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page
              </label>
              <input
                type="text"
                name="page"
                value={formData.page}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County
              </label>
              <input
                type="text"
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heat Zones
              </label>
              <input
                type="text"
                name="heatZones"
                value={formData.heatZones}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hot Water
              </label>
              <input
                type="text"
                name="hotWater"
                value={formData.hotWater}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sewer Utilities
              </label>
              <input
                type="text"
                name="sewerUtilities"
                value={formData.sewerUtilities}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Living Area (sqft)
              </label>
              <input
                type="number"
                name="approxLivingAreaTotal"
                value={formData.approxLivingAreaTotal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade School
              </label>
              <input
                type="text"
                name="gradeSchool"
                value={formData.gradeSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle School
              </label>
              <input
                type="text"
                name="middleSchool"
                value={formData.middleSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                High School
              </label>
              <input
                type="text"
                name="highSchool"
                value={formData.highSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disclosures
              </label>
              <textarea
                name="disclosures"
                value={formData.disclosures}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessed Value
              </label>
              <input
                type="number"
                name="assessed"
                value={formData.assessed}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Tax
              </label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sale">Sale</option>
                <option value="Purchase">Purchase</option>
                <option value="Lease">Lease</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Price
              </label>
              <input
                type="number"
                name="listPrice"
                value={formData.listPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pre-filled with price from Zillow MLS: {price ? `$${price.toLocaleString()}` : 'No price data available'}
                <br />
                Sources: Property Price, Zestimate, Rent Zestimate
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Phone
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Closing Date
              </label>
              <input
                type="date"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this transaction..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Transaction...' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Import Transaction Form Component
const ImportTransactionForm: React.FC<{
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onBack, onClose, onSuccess }) => {
  const [importType, setImportType] = useState<'mls' | 'csv' | 'api' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImportTypeSelect = (type: 'mls' | 'csv' | 'api') => {
    setImportType(type);
  };

  const renderMLSSearch = () => (
    <MLSSearchForm 
      onBack={() => setImportType(null)}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Import Transaction Data</h2>
          <p className="text-gray-600">Choose your data source</p>
        </div>
        <Button onClick={onBack} variant="outline" size="sm">
          ← Back to Options
        </Button>
      </div>

      {!importType ? (
        <div className="grid gap-4">
          <button
            onClick={() => handleImportTypeSelect('mls')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Import</h3>
            <p className="text-gray-600">Import property data directly from Zillow property listings</p>
          </button>
          
          <button
            onClick={() => handleImportTypeSelect('csv')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Upload</h3>
            <p className="text-gray-600">Upload transaction data from a CSV file</p>
          </button>
          
          <button
            onClick={() => handleImportTypeSelect('api')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API Integration</h3>
            <p className="text-gray-600">Connect to external real estate platforms</p>
          </button>
        </div>
      ) : importType === 'mls' ? (
        renderMLSSearch()
      ) : (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {importType === 'csv' && 'CSV File Upload'}
            {importType === 'api' && 'API Integration'}
          </h3>
          <p className="text-gray-600 mb-6">
            This feature is coming soon! We're working on seamless integrations to make data import effortless.
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={() => setImportType(null)} variant="outline">
              ← Back to Import Options
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// PDF Upload Form Component - Enhanced with proper upload flow
const PdfUploadForm: React.FC<{
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onBack, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, any> | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const queryClient = useQueryClient();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadSuccess(false);
      setUploadError(null);
      setParseError(null);
      setParseSuccess(false);
      setParsedData(null);
      setShowForm(false);
    } else {
      setUploadError('Please select a PDF file.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    console.log('=== STARTING UPLOAD ===');
    setDebugInfo('Starting upload...');
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false); // Reset explicitly
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('transactionId', 'new');
      formData.append('type', 'CONTRACT');

      console.log('FormData constructed:', {
        fileName: file.name,
        fileSize: file.size,
        transactionId: formData.get('transactionId'),
        type: formData.get('type')
      });

      setDebugInfo('Sending request...');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      setDebugInfo(`Response received: ${response.status}`);

      const result = await response.json();
      console.log('=== UPLOAD RESPONSE ===', result);

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('=== SETTING SUCCESS STATE ===');
      setDebugInfo('Upload successful! Setting state...');
      setUploadSuccess(true);
      setUploadError(null);
      
      console.log('Upload success state set:', true);
      
      // Store any parsed data from the upload
      if (result.parsedData) {
        setParsedData(result.parsedData);
        console.log('Parsed data from upload:', result.parsedData);
      }

      setDebugInfo(`Success! File uploaded. ParseData: ${result.parsedData ? 'Yes' : 'No'}`);

    } catch (error) {
      console.error('=== UPLOAD ERROR ===', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
      console.log('=== UPLOAD COMPLETE ===');
    }
  };

  const handleParseDocument = async () => {
    if (!file) return;

    setIsParsing(true);
    setParseError(null);
    setParseSuccess(false);

    try {
      // Create FormData for parsing
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Document parsing failed');
      }

      console.log('Parse successful:', result);
      setParsedData(result.extractedData || {});
      setParseSuccess(true);
      setParseError(null);

      console.log('Parsed data stored:', result.extractedData);
      console.log('Parsed data keys:', Object.keys(result.extractedData || {}));

      // Don't auto-show form, let user click "Continue to Transaction Form"
      // setShowForm(true);

    } catch (error) {
      console.error('Parse error:', error);
      setParseError(error instanceof Error ? error.message : 'Failed to parse document');
      setParseSuccess(false);
    } finally {
      setIsParsing(false);
    }
  };

  const handleRetry = () => {
    setFile(null);
    setUploadSuccess(false);
    setUploadError(null);
    setParseError(null);
    setParseSuccess(false);
    setParsedData(null);
    setShowForm(false);
  };

  const handleNewDocument = () => {
    handleRetry();
  };

  // If showing form, render the manual form with pre-filled data
  if (showForm) {
    return (
      <ManualTransactionForm
        onBack={() => setShowForm(false)}
        onClose={onClose}
        onSuccess={onSuccess}
        prefilledData={parsedData || {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upload PDF Document - v2.0 UPDATED</h2>
          <p className="text-gray-600">Upload contracts, agreements, or other property documents to auto-extract data</p>
        </div>
        <Button onClick={onBack} variant="outline" size="sm">
          ← Back to Options
        </Button>
      </div>

      {/* ALWAYS VISIBLE DEBUG SECTION */}
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded p-4 text-sm">
        <strong>🐛 DEBUG INFO:</strong><br/>
        Debug: {debugInfo}<br/>
        uploading: {isUploading ? 'true' : 'false'}<br/>
        uploadSuccess: {uploadSuccess ? 'true' : 'false'}<br/>
        uploadError: {uploadError || 'none'}<br/>
        file: {file?.name || 'none'}<br/>
        parseSuccess: {parseSuccess ? 'true' : 'false'}
        
        <div className="mt-2 space-x-2">
          <button 
            onClick={() => setUploadSuccess(true)}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Force Success
          </button>
          <button 
            onClick={() => setUploadSuccess(false)}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Reset Success
          </button>
        </div>
      </div>

      {/* TEST PARSE SECTION - Should always show when uploadSuccess is true */}
      {uploadSuccess && (
        <div className="bg-red-200 border-2 border-red-500 rounded p-4">
          <h3 className="text-lg font-bold text-red-800">🚨 PARSE DOCUMENT SECTION TEST 🚨</h3>
          <p className="text-red-700">This section should appear when uploadSuccess = true</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
            TEST PARSE DOCUMENT BUTTON
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadSuccess
            ? 'border-green-500 bg-green-50'
            : uploadError
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploadError ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-red-900">Upload Failed</p>
              <p className="text-red-700">{uploadError}</p>
            </div>
            <Button onClick={handleRetry} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : uploadSuccess ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-900">Upload Successful</p>
              <p className="text-green-700">{file?.name} has been uploaded successfully</p>
              <p className="text-sm text-green-600 mt-2">✅ Ready for document parsing</p>
            </div>
          </div>
        ) : file ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{file.name}</p>
              <p className="text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button onClick={() => setFile(null)} variant="outline" size="sm">
              Remove File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Drop your PDF here, or click to browse
              </p>
              <p className="text-gray-600">
                Supports contracts, purchase agreements, and other real estate documents
              </p>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="pdf-upload-input"
            />
            <button
              type="button"
              onClick={() => document.getElementById('pdf-upload-input')?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && !uploadSuccess && !uploadError && (
        <div className="flex justify-center">
          <Button 
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </div>
      )}

      {/* Parse Document Section */}
      {uploadSuccess && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-blue-900">Ready for Document Parsing</h3>
            </div>
            <p className="text-blue-700">
              Click "Parse Document" to automatically extract property information, prices, dates, and client details from your uploaded document.
            </p>
            
            {parseError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-700">⚠️ {parseError}</p>
                <p className="text-sm text-red-600 mt-1">
                  This PDF might be image-based or doesn't contain recognizable real estate data patterns.
                </p>
                <div className="mt-2 space-x-2">
                  <Button onClick={handleParseDocument} size="sm" variant="outline">
                    Retry Parsing
                  </Button>
                  <Button onClick={handleNewDocument} size="sm" variant="outline">
                    Upload New Document
                  </Button>
                  <Button 
                    onClick={() => setShowForm(true)} 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue Manually
                  </Button>
                </div>
              </div>
            )}

            {parseSuccess && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-700">✅ Document parsed successfully! Extracted {Object.keys(parsedData || {}).length} fields.</p>
              </div>
            )}
            
            <Button 
              onClick={handleParseDocument}
              disabled={isParsing || parseSuccess}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isParsing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Parsing Document...
                </>
              ) : parseSuccess ? (
                '✅ Parsing Complete'
              ) : (
                'Parse Document'
              )}
            </Button>

            {parseSuccess && (
              <div className="pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-600 mb-3">Parsed data will be pre-filled in the transaction form</p>
                <Button 
                  onClick={() => {
                    console.log('Continue to form clicked, parsedData:', parsedData);
                    console.log('ParsedData keys:', Object.keys(parsedData || {}));
                    setShowForm(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue to Transaction Form
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button onClick={onClose} variant="outline" disabled={isUploading || isParsing}>
          Cancel
        </Button>
        {!uploadSuccess && !file && (
          <Button onClick={onBack} variant="outline">
            Back to Options
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewTransactionModal;
