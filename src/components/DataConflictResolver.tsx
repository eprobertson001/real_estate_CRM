'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, Database, Check, X } from 'lucide-react';

interface DataConflict {
  field: string;
  label: string;
  mlsValue: any;
  documentValue: any;
  selectedValue?: any;
}

interface DataConflictResolverProps {
  conflicts: DataConflict[];
  onResolve: (resolvedData: Record<string, any>) => void;
  onCancel: () => void;
}

export default function DataConflictResolver({ 
  conflicts, 
  onResolve, 
  onCancel 
}: DataConflictResolverProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, any>>({});

  const handleValueSelect = (field: string, value: any, source: 'mls' | 'document') => {
    setSelectedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResolveAll = () => {
    const resolvedData: Record<string, any> = {};
    
    conflicts.forEach(conflict => {
      if (selectedValues[conflict.field] !== undefined) {
        resolvedData[conflict.field] = selectedValues[conflict.field];
      } else {
        // Default to MLS value if no selection made
        resolvedData[conflict.field] = conflict.mlsValue;
      }
    });

    onResolve(resolvedData);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">No data</span>;
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return String(value);
  };

  const allConflictsResolved = conflicts.every(conflict => 
    selectedValues[conflict.field] !== undefined
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Data Conflicts Detected
            </h2>
            <p className="text-sm text-gray-600">
              Some information from your documents conflicts with MLS data. 
              Please choose which values to keep.
            </p>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="space-y-6">
          {conflicts.map((conflict, index) => (
            <div key={conflict.field} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {conflict.label}
                </h3>
                <span className="text-sm text-gray-500">
                  Field: {conflict.field}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MLS Value */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedValues[conflict.field] === conflict.mlsValue
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleValueSelect(conflict.field, conflict.mlsValue, 'mls')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        MLS Data
                      </span>
                    </div>
                    {selectedValues[conflict.field] === conflict.mlsValue && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatValue(conflict.mlsValue)}
                  </div>
                </div>

                {/* Document Value */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedValues[conflict.field] === conflict.documentValue
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleValueSelect(conflict.field, conflict.documentValue, 'document')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Document Data
                      </span>
                    </div>
                    {selectedValues[conflict.field] === conflict.documentValue && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatValue(conflict.documentValue)}
                  </div>
                </div>
              </div>

              {/* Selection Status */}
              <div className="mt-3 text-xs text-gray-500">
                {selectedValues[conflict.field] !== undefined ? (
                  <span className="text-green-600">
                    ✓ Selection made
                  </span>
                ) : (
                  <span className="text-amber-600">
                    ⚠ Please select a value (defaults to MLS if unselected)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
          <div className="text-sm text-gray-600">
            <p>
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected • {' '}
              {Object.keys(selectedValues).length} resolved • {' '}
              {conflicts.length - Object.keys(selectedValues).length} will use MLS defaults
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleResolveAll}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {allConflictsResolved ? 'Apply Selected Values' : 'Apply All (Use MLS Defaults)'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to detect conflicts between two data objects
export function detectDataConflicts(
  mlsData: Record<string, any>, 
  documentData: Record<string, any>,
  fieldMappings: Record<string, string> = {}
): DataConflict[] {
  const conflicts: DataConflict[] = [];
  
  // Default field mappings if not provided
  const defaultMappings: Record<string, string> = {
    address: 'Property Address',
    purchasePrice: 'Purchase Price',
    listPrice: 'List Price',
    propertyType: 'Property Type',
    yearBuilt: 'Year Built',
    county: 'County',
    buyerName: 'Buyer Name',
    sellerName: 'Seller Name',
    closingDate: 'Closing Date',
    mlsNumber: 'MLS Number',
    commission: 'Commission',
    ...fieldMappings
  };

  Object.keys(documentData).forEach(field => {
    const mlsValue = mlsData[field];
    const documentValue = documentData[field];
    
    // Only flag as conflict if both values exist and are different
    if (
      mlsValue !== undefined && 
      documentValue !== undefined &&
      mlsValue !== null &&
      documentValue !== null &&
      mlsValue !== '' &&
      documentValue !== '' &&
      String(mlsValue).toLowerCase() !== String(documentValue).toLowerCase()
    ) {
      conflicts.push({
        field,
        label: defaultMappings[field] || field,
        mlsValue,
        documentValue
      });
    }
  });

  return conflicts;
}
