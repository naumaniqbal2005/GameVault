const { supabase } = require('../config/db');

class PhysicalCopy {
    static async create(copyData) {
        try {
            // Generate a unique CopyID
            const { data: maxData } = await supabase
                .from('physicalcopies')
                .select('CopyID')
                .order('CopyID', { ascending: false })
                .limit(1)
                .single();
            
            const newCopyId = maxData ? maxData.CopyID + 1 : 1;
            
            const { data, error } = await supabase
                .from('physicalcopies')
                .insert([{
                    CopyID: newCopyId,
                    GameID: copyData.GameID,
                    CopyCondition: copyData.CopyCondition,
                    Availability: copyData.Availability
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByGameId(gameId) {
        try {
            const { data, error } = await supabase
                .from('physicalcopies')
                .select('*')
                .eq('GameID', gameId);
            
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findAvailable(gameId) {
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
}

module.exports = PhysicalCopy;
