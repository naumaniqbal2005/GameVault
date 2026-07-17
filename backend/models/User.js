const { supabase } = require('../config/db');

class User {
    static async create(userData) {
        try {
            const { data, error } = await supabase
                .from('Users')
                .insert([{
                    UserID: userData.UserID,
                    FullName: userData.FullName,
                    Email: userData.Email,
                    AccountStatus: userData.AccountStatus || 'Active',
                    isAdmin: userData.isAdmin || false
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(userId) {
        try {
            const { data, error } = await supabase
                .from('Users')
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
            const { data, error } = await supabase
                .from('Users')
                .select('*')
                .eq('Email', email)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async update(userId, userData) {
        try {
            const { data, error } = await supabase
                .from('Users')
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
                .from('Users')
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
                .from('Users')
                .delete()
                .eq('UserID', userId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
