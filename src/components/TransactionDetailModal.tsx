'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  status: string;
  propertyAddress: string;
  price: number;
  commissionPercent: number;
  closingDate: string | null;
  contractDate: string | null;
  listingDate: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFootage: number | null;
  lotSize: string | null;
  yearBuilt: number | null;
  mlsNumber: string | null;
  earnestMoney: number | null;
  downPayment: number | null;
  loanAmount: number | null;
  primaryAgent: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  // Comprehensive intake form fields
  city?: string;
  state?: string;
  zipCode?: string;
  book?: string;
  page?: string;
  county?: string;
  heatZones?: string;
  hotWater?: string;
  sewerUtilities?: string;
  features?: string;
  approxLivingAreaTotal?: string;
  gradeSchool?: string;
  middleSchool?: string;
  highSchool?: string;
  disclosures?: string;
  assessed?: number;
  tax?: number;
  listPrice?: number;
  transactionType?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  [key: string]: any;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_contract': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Complete Transaction Details">
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{transaction.propertyAddress}</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                {transaction.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Property Price:</span>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(transaction.price)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Commission:</span>
                <p className="text-xl font-semibold text-blue-600">{transaction.commissionPercent}%</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Expected Commission:</span>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(transaction.price * (transaction.commissionPercent / 100))}
                </p>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Property Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="font-medium text-gray-600">Property Address *:</span>
                <p className="text-gray-900">{transaction.propertyAddress || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">City *:</span>
                <p className="text-gray-900">{transaction.city || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">State *:</span>
                <p className="text-gray-900">{transaction.state || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">ZIP Code *:</span>
                <p className="text-gray-900">{transaction.zipCode || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Property Type:</span>
                <p className="text-gray-900">{transaction.propertyType || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Year Built:</span>
                <p className="text-gray-900">{transaction.yearBuilt || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Book:</span>
                <p className="text-gray-900">{transaction.book || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Page:</span>
                <p className="text-gray-900">{transaction.page || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">County:</span>
                <p className="text-gray-900">{transaction.county || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Heat Zones:</span>
                <p className="text-gray-900">{transaction.heatZones || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Hot Water:</span>
                <p className="text-gray-900">{transaction.hotWater || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Sewer Utilities:</span>
                <p className="text-gray-900">{transaction.sewerUtilities || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Features:</span>
                <p className="text-gray-900">{transaction.features || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Living Area (sqft):</span>
                <p className="text-gray-900">
                  {transaction.approxLivingAreaTotal 
                    ? `${transaction.approxLivingAreaTotal} sq ft`
                    : transaction.squareFootage 
                    ? `${transaction.squareFootage.toLocaleString()} sq ft`
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Grade School:</span>
                <p className="text-gray-900">{transaction.gradeSchool || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Middle School:</span>
                <p className="text-gray-900">{transaction.middleSchool || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">High School:</span>
                <p className="text-gray-900">{transaction.highSchool || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Disclosures:</span>
                <p className="text-gray-900">{transaction.disclosures || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Assessed Value:</span>
                <p className="text-gray-900">{transaction.assessed ? formatCurrency(transaction.assessed) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Annual Tax:</span>
                <p className="text-gray-900">{transaction.tax ? formatCurrency(transaction.tax) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">List Price:</span>
                <p className="text-gray-900">{(transaction.listPrice || transaction.price) ? formatCurrency(transaction.listPrice || transaction.price) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Transaction Type:</span>
                <p className="text-gray-900">{transaction.transactionType || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">MLS Number:</span>
                <p className="text-gray-900">{transaction.mlsNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Bedrooms:</span>
                <p className="text-gray-900">{transaction.bedrooms || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Bathrooms:</span>
                <p className="text-gray-900">{transaction.bathrooms || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Lot Size:</span>
                <p className="text-gray-900">{transaction.lotSize || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="font-medium text-gray-600">List Price:</span>
                <p className="text-xl font-bold text-blue-600">
                  {(transaction.listPrice || transaction.price) ? formatCurrency(transaction.listPrice || transaction.price) : 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Sale Price:</span>
                <p className="text-xl font-bold text-green-600">{transaction.price ? formatCurrency(transaction.price) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Earnest Money:</span>
                <p className="text-gray-900">{transaction.earnestMoney ? formatCurrency(transaction.earnestMoney) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Down Payment:</span>
                <p className="text-gray-900">{transaction.downPayment ? formatCurrency(transaction.downPayment) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Loan Amount:</span>
                <p className="text-gray-900">{transaction.loanAmount ? formatCurrency(transaction.loanAmount) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Commission Rate:</span>
                <p className="text-gray-900">{transaction.commissionPercent ? `${transaction.commissionPercent}%` : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Commission:</span>
                <p className="text-xl font-bold text-blue-600">
                  {(transaction.price && transaction.commissionPercent) 
                    ? formatCurrency(transaction.price * (transaction.commissionPercent / 100))
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="font-medium text-gray-600">Client Name:</span>
                <p className="text-gray-900">{transaction.clientName || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Client Email:</span>
                <p className="text-gray-900">{transaction.clientEmail || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Client Phone:</span>
                <p className="text-gray-900">{transaction.clientPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transaction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                  {transaction.status ? transaction.status.replace('_', ' ').toUpperCase() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Expected Closing Date:</span>
                <p className="text-gray-900 font-semibold">{transaction.closingDate ? formatDate(transaction.closingDate) : 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Notes:</span>
                <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                  {transaction.notes || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {transaction.listingDate && (
                <div>
                  <span className="font-medium text-gray-600">Listing Date:</span>
                  <p className="text-gray-900">{formatDate(transaction.listingDate)}</p>
                </div>
              )}
              {transaction.contractDate && (
                <div>
                  <span className="font-medium text-gray-600">Contract Date:</span>
                  <p className="text-gray-900">{formatDate(transaction.contractDate)}</p>
                </div>
              )}
              {transaction.closingDate && (
                <div>
                  <span className="font-medium text-gray-600">Expected Closing Date:</span>
                  <p className="text-gray-900 font-semibold">{formatDate(transaction.closingDate)}</p>
                </div>
              )}
            </div>
            {transaction.closingDate && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-800">
                    {new Date(transaction.closingDate) > new Date() 
                      ? `Closing in ${Math.ceil((new Date(transaction.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                      : 'Transaction has closed'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Agent Information */}
          {transaction.primaryAgent && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Primary Agent
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p className="text-gray-900">{transaction.primaryAgent.name || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{transaction.primaryAgent.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {transaction.tasks && transaction.tasks.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Associated Tasks ({transaction.tasks.length})
              </h3>
              <div className="space-y-3">
                {transaction.tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          task.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Transaction ID:</span>
                <p className="text-gray-900 font-mono">{transaction.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-900">{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Updated:</span>
                <p className="text-gray-900">{formatDate(transaction.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
