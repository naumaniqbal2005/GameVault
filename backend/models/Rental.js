const { supabase } = require('../config/db');

// Helper function to calculate rental status and days
const calculateRentalInfo = (rental) => {
    const dateIssued = new Date(rental.DateIssued);
    const dateDue = new Date(rental.DateDue);
    const dateReturned = rental.DateReturned ? new Date(rental.DateReturned) : null;
    
    const rentalDays = Math.ceil((dateDue - dateIssued) / (1000 * 60 * 60 * 24));
    const daysOverdue = dateReturned 
        ? Math.ceil((dateReturned - dateDue) / (1000 * 60 * 60 * 24))
        : Math.ceil((new Date() - dateDue) / (1000 * 60 * 60 * 24));
    
    let rentalStatus = 'ACTIVE';
    if (dateReturned) {
        rentalStatus = dateReturned <= dateDue ? 'ON TIME' : 'LATE';
    }
    
    return { rentalStatus, rentalDays, daysOverdue };
};

class Rental {
    static async create(rentalData) {
        try {
            // Create rental record
            const { data: rental, error: rentalError } = await supabase
                .from('Rentals')
                .insert([{
                    RentalID: rentalData.RentalID,
                    UserID: rentalData.UserID,
                    CopyID: rentalData.CopyID,
                    DateIssued: rentalData.DateIssued,
                    DateDue: rentalData.DateDue
                }])
                .select()
                .single();
            
            if (rentalError) throw rentalError;

            // Update digital copy availability
            const { error: updateError } = await supabase
                .from('DigitalCopies')
                .update({ Availability: 'Rented' })
                .eq('CopyID', rentalData.CopyID);
            
            if (updateError) throw updateError;

            return rental;
        } catch (error) {
            throw error;
        }
    }

    static async findById(rentalId) {
        try {
            const { data, error } = await supabase
                .from('Rentals')
                .select(`
                    *,
                    Users (FullName, Email),
                    DigitalCopies (GameID),
                    DigitalCopies!inner (Games (GameTitle, Platform, Genre))
                `)
                .eq('RentalID', rentalId)
                .single();
            
            if (error) throw error;
            
            // Transform the nested data structure
            const rental = {
                ...data,
                UserName: data.Users?.FullName,
                UserEmail: data.Users?.Email,
                GameTitle: data.DigitalCopies?.Games?.GameTitle,
                Platform: data.DigitalCopies?.Games?.Platform,
                Genre: data.DigitalCopies?.Games?.Genre,
                ...calculateRentalInfo(data)
            };
            
            return rental;
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const { data, error } = await supabase
                .from('Rentals')
                .select(`
                    *,
                    Users (FullName, Email),
                    DigitalCopies (GameID),
                    DigitalCopies!inner (Games (GameTitle, Platform, Genre))
                `)
                .eq('UserID', userId)
                .order('DateIssued', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(rental => ({
                ...rental,
                UserName: rental.Users?.FullName,
                UserEmail: rental.Users?.Email,
                GameTitle: rental.DigitalCopies?.Games?.GameTitle,
                Platform: rental.DigitalCopies?.Games?.Platform,
                Genre: rental.DigitalCopies?.Games?.Genre,
                ...calculateRentalInfo(rental)
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getActiveRentals(userId) {
        try {
            const { data, error } = await supabase
                .from('Rentals')
                .select(`
                    *,
                    Users (FullName, Email),
                    DigitalCopies (GameID),
                    DigitalCopies!inner (Games (GameTitle, Platform, Genre))
                `)
                .eq('UserID', userId)
                .is('DateReturned', null)
                .order('DateDue', { ascending: true });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(rental => ({
                ...rental,
                UserName: rental.Users?.FullName,
                UserEmail: rental.Users?.Email,
                GameTitle: rental.DigitalCopies?.Games?.GameTitle,
                Platform: rental.DigitalCopies?.Games?.Platform,
                Genre: rental.DigitalCopies?.Games?.Genre,
                ...calculateRentalInfo(rental)
            }));
        } catch (error) {
            throw error;
        }
    }

    static async returnGame(rentalId) {
        try {
            // Get rental details
            const { data: rental, error: rentalError } = await supabase
                .from('Rentals')
                .select('CopyID')
                .eq('RentalID', rentalId)
                .single();
            
            if (rentalError) throw rentalError;
            if (!rental) throw new Error('Rental not found');

            const copyId = rental.CopyID;

            // Update rental with return date
            const { error: updateError } = await supabase
                .from('Rentals')
                .update({ DateReturned: new Date() })
                .eq('RentalID', rentalId);
            
            if (updateError) throw updateError;

            // Update digital copy availability
            const { error: copyError } = await supabase
                .from('DigitalCopies')
                .update({ Availability: 'Available' })
                .eq('CopyID', copyId);
            
            if (copyError) throw copyError;

            return true;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const { data, error } = await supabase
                .from('Rentals')
                .select(`
                    *,
                    Users (FullName, Email),
                    DigitalCopies (GameID),
                    DigitalCopies!inner (Games (GameTitle, Platform, Genre))
                `)
                .order('DateIssued', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(rental => ({
                ...rental,
                UserName: rental.Users?.FullName,
                UserEmail: rental.Users?.Email,
                GameTitle: rental.DigitalCopies?.Games?.GameTitle,
                Platform: rental.DigitalCopies?.Games?.Platform,
                Genre: rental.DigitalCopies?.Games?.Genre,
                ...calculateRentalInfo(rental)
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getOverdueRentals() {
        try {
            const { data, error } = await supabase
                .from('Rentals')
                .select(`
                    *,
                    Users (FullName, Email),
                    DigitalCopies (GameID),
                    DigitalCopies!inner (Games (GameTitle, Platform, Genre))
                `)
                .is('DateReturned', null)
                .lt('DateDue', new Date().toISOString())
                .order('DateDue', { ascending: true });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(rental => ({
                ...rental,
                UserName: rental.Users?.FullName,
                UserEmail: rental.Users?.Email,
                GameTitle: rental.DigitalCopies?.Games?.GameTitle,
                Platform: rental.DigitalCopies?.Games?.Platform,
                Genre: rental.DigitalCopies?.Games?.Genre,
                rentalStatus: 'LATE',
                ...calculateRentalInfo(rental)
            }));
        } catch (error) {
            throw error;
        }
    }

    static async delete(rentalId) {
        try {
            // Get rental details before deletion
            const { data: rental, error: rentalError } = await supabase
                .from('Rentals')
                .select('CopyID')
                .eq('RentalID', rentalId)
                .single();
            
            if (rentalError) throw rentalError;
            if (!rental) return false;

            const copyId = rental.CopyID;

            // Update digital copy availability back to 'Available'
            const { error: copyError } = await supabase
                .from('DigitalCopies')
                .update({ Availability: 'Available' })
                .eq('CopyID', copyId);
            
            if (copyError) throw copyError;

            // Delete the rental record
            const { error: deleteError } = await supabase
                .from('Rentals')
                .delete()
                .eq('RentalID', rentalId);
            
            if (deleteError) throw deleteError;

            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Rental;
