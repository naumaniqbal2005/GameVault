const { supabase } = require('../config/db');

class Game {
    static async create(gameData) {
        try {
            const { data, error } = await supabase
                .from('games')
                .insert([{
                    GameID: gameData.GameID,
                    GameTitle: gameData.GameTitle,
                    Platform: gameData.Platform,
                    Genre: gameData.Genre,
                    CategoryID: gameData.CategoryID,
                    PhysicalPrice: gameData.PhysicalPrice,
                    DigitalRentalPrice: gameData.DigitalRentalPrice
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(gameId) {
        try {
            const { data, error } = await supabase
                .from('games')
                .select(`
                    *,
                    categories (CategoryName)
                `)
                .eq('GameID', gameId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async getAll(filters = {}) {
        try {
            let query = supabase
                .from('games')
                .select(`
                    *,
                    categories (CategoryName)
                `);
            
            if (filters.category) {
                query = query.eq('CategoryID', filters.category);
            }
            
            if (filters.platform) {
                query = query.ilike('Platform', `%${filters.platform}%`);
            }
            
            if (filters.genre) {
                query = query.ilike('Genre', `%${filters.genre}%`);
            }
            
            if (filters.search) {
                query = query.ilike('GameTitle', `%${filters.search}%`);
            }
            
            query = query.order('GameTitle');
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async update(gameId, gameData) {
        try {
            const { data, error } = await supabase
                .from('games')
                .update({
                    GameTitle: gameData.GameTitle,
                    Platform: gameData.Platform,
                    Genre: gameData.Genre,
                    CategoryID: gameData.CategoryID,
                    PhysicalPrice: gameData.PhysicalPrice,
                    DigitalRentalPrice: gameData.DigitalRentalPrice
                })
                .eq('GameID', gameId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(gameId) {
        try {
            const { error } = await supabase
                .from('games')
                .delete()
                .eq('GameID', gameId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailablePhysicalCopiesByCopyId(copyId) {
        try {
            const { data, error } = await supabase
                .from('physicalcopies')
                .select(`
                    *,
                    games (GameTitle, Platform, Genre, PhysicalPrice)
                `)
                .eq('CopyID', copyId)
                .eq('Availability', 'Available')
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailablePhysicalCopies(gameId) {
        try {
            const { data, error } = await supabase
                .from('physicalcopies')
                .select('*')
                .eq('GameID', gameId)
                .eq('Availability', 'Available');
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailableDigitalCopiesByCopyId(copyId) {
        try {
            const { data, error } = await supabase
                .from('digitalcopies')
                .select(`
                    *,
                    games (GameTitle, Platform, Genre)
                `)
                .eq('CopyID', copyId)
                .eq('Availability', 'Available')
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailableDigitalCopies(gameId) {
        try {
            const { data, error } = await supabase
                .from('digitalcopies')
                .select('*')
                .eq('GameID', gameId)
                .eq('Availability', 'Available');
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Game;
