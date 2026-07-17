const { supabase } = require('../config/db');

class Category {
    static async create(categoryData) {
        try {
            const { data, error } = await supabase
                .from('Categories')
                .insert([{
                    CategoryID: categoryData.CategoryID,
                    CategoryName: categoryData.CategoryName
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(categoryId) {
        try {
            const { data, error } = await supabase
                .from('Categories')
                .select('*')
                .eq('CategoryID', categoryId)
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
                .from('Categories')
                .select('*')
                .order('CategoryName');
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async update(categoryId, categoryData) {
        try {
            const { data, error } = await supabase
                .from('Categories')
                .update({
                    CategoryName: categoryData.CategoryName
                })
                .eq('CategoryID', categoryId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(categoryId) {
        try {
            const { error } = await supabase
                .from('Categories')
                .delete()
                .eq('CategoryID', categoryId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Category;
