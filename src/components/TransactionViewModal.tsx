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
}

interface TransactionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit: () => void;
}

export function TransactionViewModal({ isOpen, onClose, transaction, onEdit }: TransactionViewModalProps) {
  if (!transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_contract': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details" size="xl">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{transaction.propertyAddress}</h2>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status.replace('_', ' ')}
              </span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(transaction.price)}
              </span>
            </div>
          </div>
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
            Edit Transaction
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h3>
            <div className="space-y-2 text-sm">
              {transaction.propertyType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type:</span>
                  <span className="font-medium">{transaction.propertyType}</span>
                </div>
              )}
              {transaction.bedrooms && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrooms:</span>
                  <span className="font-medium">{transaction.bedrooms}</span>
                </div>
              )}
              {transaction.bathrooms && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bathrooms:</span>
                  <span className="font-medium">{transaction.bathrooms}</span>
                </div>
              )}
              {transaction.squareFootage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Square Footage:</span>
                  <span className="font-medium">{transaction.squareFootage.toLocaleString()} sq ft</span>
                </div>
              )}
              {transaction.lotSize && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Lot Size:</span>
                  <span className="font-medium">{transaction.lotSize}</span>
                </div>
              )}
              {transaction.yearBuilt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built:</span>
                  <span className="font-medium">{transaction.yearBuilt}</span>
                </div>
              )}
              {transaction.mlsNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">MLS Number:</span>
                  <span className="font-medium">{transaction.mlsNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sale Price:</span>
                <span className="font-medium">{formatCurrency(transaction.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission:</span>
                <span className="font-medium">{transaction.commissionPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission Amount:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(transaction.price * (transaction.commissionPercent / 100))}
                </span>
              </div>
              {transaction.earnestMoney && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Earnest Money:</span>
                  <span className="font-medium">{formatCurrency(transaction.earnestMoney)}</span>
                </div>
              )}
              {transaction.downPayment && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-medium">{formatCurrency(transaction.downPayment)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              {transaction.listingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed:</span>
                  <span className="font-medium">{formatDate(transaction.listingDate)}</span>
                </div>
              )}
              {transaction.contractDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Under Contract:</span>
                  <span className="font-medium">{formatDate(transaction.contractDate)}</span>
                </div>
              )}
              {transaction.closingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Closing Date:</span>
                  <span className="font-medium">{formatDate(transaction.closingDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(transaction.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Agent Information</h3>
            <div className="space-y-2 text-sm">
              {transaction.primaryAgent && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primary Agent:</span>
                    <span className="font-medium">
                      {transaction.primaryAgent.name || transaction.primaryAgent.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{transaction.primaryAgent.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Associated Tasks */}
        {transaction.tasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Associated Tasks ({transaction.tasks.length})</h3>
            <div className="space-y-3">
              {transaction.tasks.map((task) => (
                <div key={task.id} className="bg-white border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      {task.dueDate && (
                        <p className="text-sm text-gray-600">Due: {formatDate(task.dueDate)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
