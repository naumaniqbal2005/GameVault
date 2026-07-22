const { supabase } = require('../config/db');

class Transaction {
    static async create(transactionData) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    TransactionID: transactionData.TransactionID,
                    UserID: transactionData.UserID,
                    RentalID: transactionData.RentalID || null,
                    CopyID: transactionData.CopyID || null,
                    AdminID: transactionData.AdminID,
                    Amount: transactionData.Amount,
                    TransactionDate: transactionData.TransactionDate || new Date(),
                    DiscountApplied: transactionData.DiscountApplied || 0.00
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(transactionId) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    users (FullName)
                `)
                .eq('TransactionID', transactionId)
                .single();
            
            if (error) throw error;
            
            // Transform the nested data structure
            return {
                ...data,
                UserName: data.users?.FullName
            };
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('UserID', userId)
                .order('TransactionDate', { ascending: false });
            
            if (error) throw error;
            
            // Add transaction type
            return data.map(t => ({
                ...t,
                TransactionType: t.RentalID ? 'Rental' : (t.CopyID ? 'Purchase' : 'Other')
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    users (FullName)
                `)
                .order('TransactionDate', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure and add transaction type
            return data.map(t => ({
                ...t,
                UserName: t.users?.FullName,
                TransactionType: t.RentalID ? 'Rental' : (t.CopyID ? 'Purchase' : 'Other')
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getRentalTransactions() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    users (FullName),
                    rentals (CopyID),
                    rentals!inner (digitalcopies (GameID)),
                    digitalcopies!inner (games (GameTitle))
                `)
                .not('RentalID', 'is', null)
                .order('TransactionDate', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(t => ({
                ...t,
                UserName: t.users?.FullName,
                GameTitle: t.rentals?.digitalcopies?.games?.GameTitle
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getPurchaseTransactions() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    users (FullName),
                    physicalcopies (GameID),
                    physicalcopies!inner (games (GameTitle))
                `)
                .not('CopyID', 'is', null)
                .order('TransactionDate', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(t => ({
                ...t,
                UserName: t.users?.FullName,
                GameTitle: t.physicalcopies?.games?.GameTitle
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getTransactionStats(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('Amount, DiscountApplied, TransactionDate')
                .gte('TransactionDate', startDate)
                .lte('TransactionDate', endDate);
            
            if (error) throw error;
            
            const transactions = data || [];
            const totalTransactions = transactions.length;
            const totalRevenue = transactions.reduce((sum, t) => sum + (t.Amount || 0), 0);
            const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
            const totalDiscounts = transactions.reduce((sum, t) => sum + (t.DiscountApplied || 0), 0);
            
            return {
                TotalTransactions: totalTransactions,
                TotalRevenue: totalRevenue,
                AverageTransaction: averageTransaction,
                TotalDiscounts: totalDiscounts
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Transaction;
