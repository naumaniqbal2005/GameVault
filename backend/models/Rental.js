const { poolPromise } = require('../config/db');

class Rental {
    static async create(rentalData) {
        try {
            const pool = await poolPromise;
            const transaction = pool.transaction();
            
            await transaction.begin();
            
            try {
                // Create rental record
                const rentalResult = await transaction.request()
                    .input('RentalID', require('mssql').Int, rentalData.RentalID)
                    .input('UserID', require('mssql').Int, rentalData.UserID)
                    .input('CopyID', require('mssql').Int, rentalData.CopyID)
                    .input('DateIssued', require('mssql').Date, rentalData.DateIssued)
                    .input('DateDue', require('mssql').Date, rentalData.DateDue)
                    .query(`
                        INSERT INTO Rentals (RentalID, UserID, CopyID, DateIssued, DateDue)
                        VALUES (@RentalID, @UserID, @CopyID, @DateIssued, @DateDue)
                        SELECT SCOPE_IDENTITY() as RentalID
                    `);

                // Update digital copy availability
                await transaction.request()
                    .input('CopyID', require('mssql').Int, rentalData.CopyID)
                    .query(`
                        UPDATE DigitalCopies 
                        SET Availability = 'Rented'
                        WHERE CopyID = @CopyID
                    `);

                await transaction.commit();
                return rentalResult.recordset[0];
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    static async findById(rentalId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('RentalID', require('mssql').Int, rentalId)
                .query(`
                    SELECT r.*, u.FullName as UserName, g.GameTitle, dc.CopyID
                    FROM Rentals r
                    JOIN Users u ON r.UserID = u.UserID
                    JOIN DigitalCopies dc ON r.CopyID = dc.CopyID
                    JOIN Games g ON dc.GameID = g.GameID
                    WHERE r.RentalID = @RentalID
                `);
            return result.recordset[0];
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
                    SELECT r.*, g.GameTitle, dc.CopyID
                    FROM Rentals r
                    JOIN DigitalCopies dc ON r.CopyID = dc.CopyID
                    JOIN Games g ON dc.GameID = g.GameID
                    WHERE r.UserID = @UserID
                    ORDER BY r.DateIssued DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getActiveRentals(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query(`
                    SELECT r.*, g.GameTitle, dc.CopyID
                    FROM Rentals r
                    JOIN DigitalCopies dc ON r.CopyID = dc.CopyID
                    JOIN Games g ON dc.GameID = g.GameID
                    WHERE r.UserID = @UserID AND r.DateReturned IS NULL
                    ORDER BY r.DateDue ASC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async returnGame(rentalId) {
        try {
            const pool = await poolPromise;
            const transaction = pool.transaction();
            
            await transaction.begin();
            
            try {
                // Get rental details
                const rentalResult = await transaction.request()
                    .input('RentalID', require('mssql').Int, rentalId)
                    .query('SELECT CopyID FROM Rentals WHERE RentalID = @RentalID');
                
                if (rentalResult.recordset.length === 0) {
                    throw new Error('Rental not found');
                }

                const copyId = rentalResult.recordset[0].CopyID;

                // Update rental with return date
                await transaction.request()
                    .input('RentalID', require('mssql').Int, rentalId)
                    .input('DateReturned', require('mssql').Date, new Date())
                    .query(`
                        UPDATE Rentals 
                        SET DateReturned = @DateReturned
                        WHERE RentalID = @RentalID
                    `);

                // Update digital copy availability
                await transaction.request()
                    .input('CopyID', require('mssql').Int, copyId)
                    .query(`
                        UPDATE DigitalCopies 
                        SET Availability = 'Available'
                        WHERE CopyID = @CopyID
                    `);

                await transaction.commit();
                return true;
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
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
                    FROM Rentals r
                    JOIN Users u ON r.UserID = u.UserID
                    JOIN DigitalCopies dc ON r.CopyID = dc.CopyID
                    JOIN Games g ON dc.GameID = g.GameID
                    ORDER BY r.DateIssued DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getOverdueRentals() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT r.*, u.FullName as UserName, u.Email, g.GameTitle
                    FROM Rentals r
                    JOIN Users u ON r.UserID = u.UserID
                    JOIN DigitalCopies dc ON r.CopyID = dc.CopyID
                    JOIN Games g ON dc.GameID = g.GameID
                    WHERE r.DateReturned IS NULL AND r.DateDue < GETDATE()
                    ORDER BY r.DateDue ASC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async delete(rentalId) {
        try {
            const pool = await poolPromise;
            const transaction = pool.transaction();
            
            await transaction.begin();
            
            try {
                // Get rental details before deletion
                const rentalResult = await transaction.request()
                    .input('RentalID', require('mssql').Int, rentalId)
                    .query('SELECT CopyID FROM Rentals WHERE RentalID = @RentalID');
                
                if (rentalResult.recordset.length === 0) {
                    await transaction.rollback();
                    return false;
                }

                const copyId = rentalResult.recordset[0].CopyID;

                // Update digital copy availability back to 'Available'
                await transaction.request()
                    .input('CopyID', require('mssql').Int, copyId)
                    .query(`
                        UPDATE DigitalCopies 
                        SET Availability = 'Available'
                        WHERE CopyID = @CopyID
                    `);

                // Delete the rental record
                const deleteResult = await transaction.request()
                    .input('RentalID', require('mssql').Int, rentalId)
                    .query('DELETE FROM Rentals WHERE RentalID = @RentalID');

                await transaction.commit();
                return deleteResult.rowsAffected[0] > 0;
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Rental;
