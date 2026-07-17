const { supabase } = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        // Get total users
        const { count: totalUsers, error: usersError } = await supabase
            .from('Users')
            .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;

        // Get total games
        const { count: totalGames, error: gamesError } = await supabase
            .from('Games')
            .select('*', { count: 'exact', head: true });
        
        if (gamesError) throw gamesError;

        // Get active rentals
        const { count: activeRentals, error: activeRentalsError } = await supabase
            .from('Rentals')
            .select('*', { count: 'exact', head: true })
            .is('DateReturned', null);
        
        if (activeRentalsError) throw activeRentalsError;

        // Get total revenue
        const { data: revenueData, error: revenueError } = await supabase
            .from('Transactions')
            .select('Amount');
        
        if (revenueError) throw revenueError;
        
        const totalRevenue = revenueData.reduce((sum, t) => sum + (t.Amount || 0), 0);

        // Get total rentals
        const { count: totalRentals, error: totalRentalsError } = await supabase
            .from('Rentals')
            .select('*', { count: 'exact', head: true });
        
        if (totalRentalsError) throw totalRentalsError;

        // Get total purchases (from Transactions with CopyID)
        const { count: totalPurchases, error: totalPurchasesError } = await supabase
            .from('Transactions')
            .select('*', { count: 'exact', head: true })
            .not('CopyID', 'is', null);
        
        if (totalPurchasesError) throw totalPurchasesError;

        // Get available digital copies
        const { count: availableDigital, error: availableDigitalError } = await supabase
            .from('DigitalCopies')
            .select('*', { count: 'exact', head: true })
            .eq('Availability', 'Available');
        
        if (availableDigitalError) throw availableDigitalError;

        // Get available physical copies
        const { count: availablePhysical, error: availablePhysicalError } = await supabase
            .from('PhysicalCopies')
            .select('*', { count: 'exact', head: true })
            .eq('Availability', 'Available');
        
        if (availablePhysicalError) throw availablePhysicalError;

        // Get recent transactions (last 5)
        const { data: recentTransactions, error: recentError } = await supabase
            .from('Transactions')
            .select(`
                *,
                Users (FullName)
            `)
            .order('TransactionDate', { ascending: false })
            .limit(5);
        
        if (recentError) throw recentError;
        
        // Transform recent transactions
        const transformedTransactions = recentTransactions.map(t => ({
            ...t,
            UserName: t.Users?.FullName,
            TransactionType: t.RentalID ? 'Rental' : (t.CopyID ? 'Purchase' : 'Other')
        }));

        // Get overdue rentals
        const { count: overdueRentals, error: overdueError } = await supabase
            .from('Rentals')
            .select('*', { count: 'exact', head: true })
            .is('DateReturned', null)
            .lt('DateDue', new Date().toISOString());
        
        if (overdueError) throw overdueError;

        res.json({
            totalUsers: totalUsers || 0,
            totalGames: totalGames || 0,
            activeRentals: activeRentals || 0,
            totalRevenue: parseFloat(totalRevenue).toFixed(2),
            totalRentals: totalRentals || 0,
            totalPurchases: totalPurchases || 0,
            availableDigital: availableDigital || 0,
            availablePhysical: availablePhysical || 0,
            recentTransactions: transformedTransactions,
            overdueRentals: overdueRentals || 0
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardStats
};
