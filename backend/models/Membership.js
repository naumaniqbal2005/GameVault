const { poolPromise } = require('../config/db');

class MembershipTier {
    static async create(tierData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('TierID', require('mssql').Int, tierData.TierID)
                .input('TierName', require('mssql').VarChar(30), tierData.TierName)
                .input('DiscountPercent', require('mssql').Decimal(5, 2), tierData.DiscountPercent)
                .input('Description', require('mssql').VarChar(100), tierData.Description)
                .query(`
                    INSERT INTO MembershipTiers (TierID, TierName, DiscountPercent, Description)
                    VALUES (@TierID, @TierName, @DiscountPercent, @Description)
                    SELECT SCOPE_IDENTITY() as TierID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query('SELECT * FROM MembershipTiers ORDER BY DiscountPercent DESC');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async findById(tierId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('TierID', require('mssql').Int, tierId)
                .query('SELECT * FROM MembershipTiers WHERE TierID = @TierID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }
}

class UserMembership {
    static async create(membershipData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MembershipID', require('mssql').Int, membershipData.MembershipID)
                .input('UserID', require('mssql').Int, membershipData.UserID)
                .input('TierID', require('mssql').Int, membershipData.TierID)
                .input('StartDate', require('mssql').Date, membershipData.StartDate)
                .input('EndDate', require('mssql').Date, membershipData.EndDate)
                .input('Status', require('mssql').VarChar(20), membershipData.Status || 'Active')
                .query(`
                    INSERT INTO UserMemberships (MembershipID, UserID, TierID, StartDate, EndDate, Status)
                    VALUES (@MembershipID, @UserID, @TierID, @StartDate, @EndDate, @Status)
                    SELECT SCOPE_IDENTITY() as MembershipID
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
                    SELECT um.*, mt.TierName, mt.DiscountPercent, mt.Description
                    FROM UserMemberships um
                    JOIN MembershipTiers mt ON um.TierID = mt.TierID
                    WHERE um.UserID = @UserID AND um.Status = 'Active' AND um.EndDate >= GETDATE()
                    ORDER BY um.EndDate DESC
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async getUserMembershipHistory(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query(`
                    SELECT um.*, mt.TierName, mt.DiscountPercent
                    FROM UserMemberships um
                    JOIN MembershipTiers mt ON um.TierID = mt.TierID
                    WHERE um.UserID = @UserID
                    ORDER BY um.StartDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(membershipId, status) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MembershipID', require('mssql').Int, membershipId)
                .input('Status', require('mssql').VarChar(20), status)
                .query(`
                    UPDATE UserMemberships 
                    SET Status = @Status
                    WHERE MembershipID = @MembershipID
                `);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async findById(membershipId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MembershipID', require('mssql').Int, membershipId)
                .query(`
                    SELECT um.*, u.FullName as UserName, u.Email, mt.TierName
                    FROM UserMemberships um
                    JOIN Users u ON um.UserID = u.UserID
                    JOIN MembershipTiers mt ON um.TierID = mt.TierID
                    WHERE um.MembershipID = @MembershipID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(membershipId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MembershipID', require('mssql').Int, membershipId)
                .query(`
                    DELETE FROM UserMemberships 
                    WHERE MembershipID = @MembershipID
                `);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT um.*, u.FullName as UserName, u.Email, mt.TierName
                    FROM UserMemberships um
                    JOIN Users u ON um.UserID = u.UserID
                    JOIN MembershipTiers mt ON um.TierID = mt.TierID
                    ORDER BY um.StartDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { MembershipTier, UserMembership };
