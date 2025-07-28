'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TransactionEditModal } from '@/components/TransactionEditModal';
import NewTransactionModal from '@/components/NewTransactionModal';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { TransactionAttachmentsModal } from '@/components/TransactionAttachmentsModal';

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
    dueDate: string | null;
    priority: string;
    status: string;
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

export default function TransactionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);
  
  const { data, isLoading, error } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
  });

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleShowDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleShowAttachments = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsAttachmentsModalOpen(true);
  };

  const handleSaveTransaction = async (updatedData: Partial<Transaction>) => {
    if (!selectedTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      // Refresh the transactions list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      // Update the selected transaction with the new data
      const { transaction: updatedTransaction } = await response.json();
      setSelectedTransaction(updatedTransaction);
      
    } catch (error) {
      console.error('Failed to save transaction:', error);
      throw error;
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error loading transactions
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage all your real estate transactions</p>
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
            >
              ← Back to Dashboard
            </Button>
            <Button 
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + New Transaction
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Transactions ({transactions.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {transaction.propertyAddress}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                        <span>Price: {formatCurrency(transaction.price)}</span>
                        {transaction.closingDate && (
                          <span>Closing: {formatDate(transaction.closingDate)}</span>
                        )}
                        {transaction.primaryAgent && (
                          <span>Agent: {transaction.primaryAgent.name || transaction.primaryAgent.email}</span>
                        )}
                        {transaction.tasks.length > 0 && (
                          <span>{transaction.tasks.length} pending tasks</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShowAttachments(transaction)}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      >
                        Attachments
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShowDetails(transaction)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first real estate transaction.
            </p>
            <Button 
              onClick={() => router.push('/transactions/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create First Transaction
            </Button>
          </div>
        )}

        {/* Modals */}
        <TransactionEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          transaction={selectedTransaction}
          onSave={handleSaveTransaction}
        />

        <NewTransactionModal
          isOpen={isNewTransactionModalOpen}
          onClose={() => setIsNewTransactionModalOpen(false)}
          redirectToTransactions={false}
        />

        <TransactionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          transaction={selectedTransaction}
        />

        <TransactionAttachmentsModal
          isOpen={isAttachmentsModalOpen}
          onClose={() => setIsAttachmentsModalOpen(false)}
          transaction={selectedTransaction}
          onTransactionUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
          }}
        />
      </div>
    </div>
  );
}
