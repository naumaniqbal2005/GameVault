const { supabase } = require('../config/db');

class Review {
    static async create(reviewData) {
        try {
            const { data, error } = await supabase
                .from('Reviews')
                .insert([{
                    ReviewID: reviewData.ReviewID,
                    UserID: reviewData.UserID,
                    GameID: reviewData.GameID,
                    RentalID: reviewData.RentalID,
                    Rating: reviewData.Rating,
                    ReviewText: reviewData.ReviewText
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(reviewId) {
        try {
            const { data, error } = await supabase
                .from('Reviews')
                .select(`
                    *,
                    Users (FullName),
                    Games (GameTitle)
                `)
                .eq('ReviewID', reviewId)
                .single();
            
            if (error) throw error;
            
            // Transform the nested data structure
            return {
                ...data,
                UserName: data.Users?.FullName,
                GameTitle: data.Games?.GameTitle
            };
        } catch (error) {
            throw error;
        }
    }

    static async findByGameId(gameId) {
        try {
            const { data, error } = await supabase
                .from('Reviews')
                .select(`
                    *,
                    Users (FullName)
                `)
                .eq('GameID', gameId)
                .order('ReviewID', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(review => ({
                ...review,
                UserName: review.Users?.FullName
            }));
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const { data, error } = await supabase
                .from('Reviews')
                .select(`
                    *,
                    Games (GameTitle)
                `)
                .eq('UserID', userId)
                .order('ReviewID', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(review => ({
                ...review,
                GameTitle: review.Games?.GameTitle
            }));
        } catch (error) {
            throw error;
        }
    }

    static async update(reviewId, reviewData) {
        try {
            const { data, error } = await supabase
                .from('Reviews')
                .update({
                    Rating: reviewData.Rating,
                    ReviewText: reviewData.ReviewText
                })
                .eq('ReviewID', reviewId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(reviewId) {
        try {
            const { error } = await supabase
                .from('Reviews')
                .delete()
                .eq('ReviewID', reviewId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async getAverageRating(gameId) {
        try {
            const { data, error } = await supabase
                .from('Reviews')
                .select('Rating')
                .eq('GameID', gameId);
            
            if (error) throw error;
            
            const reviews = data || [];
            const averageRating = reviews.length > 0 
                ? reviews.reduce((sum, r) => sum + r.Rating, 0) / reviews.length 
                : 0;
            
            return {
                AverageRating: averageRating,
                ReviewCount: reviews.length
            };
        } catch (error) {
            throw error;
        }
    }

    static async canUserReview(userId, gameId) {
        try {
            // Get rentals that have been returned for this user and game
            const { data: rentals, error: rentalError } = await supabase
                .from('Rentals')
                .select(`
                    RentalID,
                    DigitalCopies (GameID)
                `)
                .eq('UserID', userId)
                .not('DateReturned', 'is', null);
            
            if (rentalError) throw rentalError;
            
            // Filter rentals for the specific game
            const gameRentals = rentals.filter(r => r.DigitalCopies?.GameID === gameId);
            
            if (gameRentals.length === 0) return false;
            
            // Check if user has already reviewed this game
            const { data: existingReviews, error: reviewError } = await supabase
                .from('Reviews')
                .select('RentalID')
                .eq('UserID', userId)
                .eq('GameID', gameId);
            
            if (reviewError) throw reviewError;
            
            // Check if there are any rentals that haven't been reviewed yet
            const reviewedRentalIds = existingReviews.map(r => r.RentalID);
            const unreviewedRentals = gameRentals.filter(r => !reviewedRentalIds.includes(r.RentalID));
            
            return unreviewedRentals.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const { data, error } = await supabase
                .from('Reviews')
                .select(`
                    *,
                    Users (FullName),
                    Games (GameTitle)
                `)
                .order('ReviewID', { ascending: false });
            
            if (error) throw error;
            
            // Transform the nested data structure
            return data.map(review => ({
                ...review,
                UserName: review.Users?.FullName,
                GameTitle: review.Games?.GameTitle
            }));
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Review;
