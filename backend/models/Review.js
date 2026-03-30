const { poolPromise } = require('../config/db');

class Review {
    static async create(reviewData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('ReviewID', require('mssql').Int, reviewData.ReviewID)
                .input('UserID', require('mssql').Int, reviewData.UserID)
                .input('GameID', require('mssql').Int, reviewData.GameID)
                .input('RentalID', require('mssql').Int, reviewData.RentalID)
                .input('Rating', require('mssql').Int, reviewData.Rating)
                .input('ReviewText', require('mssql').Text, reviewData.ReviewText)
                .query(`
                    INSERT INTO Reviews (ReviewID, UserID, GameID, RentalID, Rating, ReviewText)
                    VALUES (@ReviewID, @UserID, @GameID, @RentalID, @Rating, @ReviewText)
                    SELECT SCOPE_IDENTITY() as ReviewID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(reviewId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('ReviewID', require('mssql').Int, reviewId)
                .query(`
                    SELECT r.*, u.FullName as UserName, g.GameTitle
                    FROM Reviews r
                    JOIN Users u ON r.UserID = u.UserID
                    JOIN Games g ON r.GameID = g.GameID
                    WHERE r.ReviewID = @ReviewID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByGameId(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT r.*, u.FullName as UserName
                    FROM Reviews r
                    JOIN Users u ON r.UserID = u.UserID
                    WHERE r.GameID = @GameID
                    ORDER BY r.ReviewID DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query(`
                    SELECT r.*, g.GameTitle
                    FROM Reviews r
                    JOIN Games g ON r.GameID = g.GameID
                    WHERE r.UserID = @UserID
                    ORDER BY r.ReviewID DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async update(reviewId, reviewData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('ReviewID', require('mssql').Int, reviewId)
                .input('Rating', require('mssql').Int, reviewData.Rating)
                .input('ReviewText', require('mssql').Text, reviewData.ReviewText)
                .query(`
                    UPDATE Reviews 
                    SET Rating = @Rating, ReviewText = @ReviewText
                    WHERE ReviewID = @ReviewID
                `);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(reviewId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('ReviewID', require('mssql').Int, reviewId)
                .query('DELETE FROM Reviews WHERE ReviewID = @ReviewID');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAverageRating(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT AVG(CAST(Rating as FLOAT)) as AverageRating, COUNT(*) as ReviewCount
                    FROM Reviews
                    WHERE GameID = @GameID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async canUserReview(userId, gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT r.RentalID
                    FROM Rentals r
                    JOIN DigitalCopies dc ON r.CopyID = dc.CopyID
                    WHERE r.UserID = @UserID AND dc.GameID = @GameID AND r.DateReturned IS NOT NULL
                    EXCEPT
                    SELECT RentalID FROM Reviews WHERE UserID = @UserID AND GameID = @GameID
                `);
            return result.recordset.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT r.*, u.FullName as UserName, g.GameTitle
                    FROM Reviews r
                    JOIN Users u ON r.UserID = u.UserID
                    JOIN Games g ON r.GameID = g.GameID
                    ORDER BY r.ReviewID DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Review;
