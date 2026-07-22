const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        try {
            // Hash password before storing
            const hashedPassword = await bcrypt.hash(userData.Password, 10);
            
            // Generate a unique UserID
            const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            
            console.log('Attempting to insert user:', { UserID: userId, Email: userData.Email });
            
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    UserID: userId,
                    FullName: userData.FullName,
                    Email: userData.Email,
                    Password: hashedPassword,
                    AccountStatus: userData.AccountStatus || 'Active',
                    isAdmin: userData.isAdmin || false
                }])
                .select();
            
            if (error) {
                console.error('Insert error:', error);
                throw error;
            }
            
            console.log('Insert successful, data:', data);
            
            // Return the user data with the password (for token generation)
            return {
                UserID: userId,
                FullName: userData.FullName,
                Email: userData.Email,
                Password: hashedPassword,
                AccountStatus: userData.AccountStatus || 'Active',
                isAdmin: userData.isAdmin || false
            };
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    static async findById(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('UserID', userId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            console.log('Finding user by email:', email);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('Email', email)
                .maybeSingle();
            
            if (error) {
                console.error('FindByEmail error:', error);
                throw error;
            }
            
            console.log('FindByEmail result:', data);
            return data;
        } catch (error) {
            console.error('FindByEmail catch:', error);
            throw error;
        }
    }

    static async update(userId, userData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    FullName: userData.FullName,
                    Email: userData.Email,
                    AccountStatus: userData.AccountStatus,
                    isAdmin: userData.isAdmin
                })
                .eq('UserID', userId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('FullName');
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('UserID', userId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;
