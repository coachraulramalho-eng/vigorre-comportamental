/* ============================================================
   VIGORRE ONE™ - SUPABASE CONFIG (HÍBRIDO)
   - Mantém SupabaseService (CRUD local/offline)
   - Adiciona getSupabaseClient() para conexão real
============================================================ */
'use strict';

// ============================================
// CONFIG REAL
// ============================================
const SUPABASE_REAL_CONFIG = {
    url: 'https://dfthdcnaqmqswidwgezj.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdGhkY25hcW1xc3dpZHdnZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDU3MDksImV4cCI6MjA5NTAyMTcwOX0.ysTxq3RLw6E-7HrKsvAN2DGoTRYNNCVHXYKG0y6aFIQ'
};

// ============================================
// CLIENT REAL (se disponível)
// ============================================
window.getSupabaseClient = function () {
    try {
        if (typeof window.supabase === 'undefined' || !window.supabase) return null;
        if (!window.__vgSupabaseClient) {
            window.__vgSupabaseClient = window.supabase.createClient(
                SUPABASE_REAL_CONFIG.url,
                SUPABASE_REAL_CONFIG.anonKey
            );
        }
        return window.__vgSupabaseClient;
    } catch (e) {
        return null;
    }
};

// ============================================
// CONFIG LOCAL / MOCK
// ============================================
const SUPABASE_CONFIG = {
    url: SUPABASE_REAL_CONFIG.url,
    anonKey: SUPABASE_REAL_CONFIG.anonKey,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    maxRows: 1000,
    cacheTTL: 300000,
    tables: {
        users: 'users',
        companies: 'companies',
        participants: 'participants',
        recruiters: 'recruiters',
        consultants: 'consultants',
        wallets: 'wallets',
        creditTransactions: 'credit_transactions',
        plans: 'plans',
        discResults: 'disc_results',
        ieResults: 'ie_results',
        valoresResults: 'valores_results',
        swotResults: 'swot_results',
        bigfiveResults: 'bigfive_results',
        competenciasResults: 'competencias_results',
        liderancaResults: 'lideranca_results',
        potencialResults: 'potencial_results',
        fitCulturalResults: 'fit_cultural_results',
        reports: 'reports',
        laudos: 'laudos',
        jobProfiles: 'job_profiles',
        appointments: 'appointments',
        backups: 'backups',
        auditLogs: 'audit_logs'
    },
    buckets: {
        reports: 'reports',
        laudos: 'laudos',
        avatars: 'avatars',
        documents: 'documents',
        profiles: 'profiles'
    }
};

// ============================================
// SERVICE (mantém API antiga)
// ============================================
class SupabaseService {
    constructor() {
        this.config = SUPABASE_CONFIG;
        this.isConnected = false;
        this.mode = 'mock';
        this.cache = new Map();
        this.cacheTTL = this.config.cacheTTL || 300000;
    }

    connect() {
        this.isConnected = true;
        this.mode = window.getSupabaseClient() ? 'real' : 'mock';
        return { success: true, mode: this.mode };
    }

    getTableName(key) {
        return this.config.tables[key] || key;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }

    sanitizeData(data) {
        var sanitized = {};
        for (var key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                var value = data[key];
                if (typeof value === 'string') {
                    sanitized[key] = value.replace(/<[^>]*>/g, '');
                } else if (typeof value === 'object' && value !== null) {
                    sanitized[key] = JSON.parse(JSON.stringify(value));
                } else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }

    create(table, data) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            if (!data || typeof data !== 'object') throw new Error('Dados inválidos');
            var tableName = this.getTableName(table);
            var sanitized = this.sanitizeData(data);
            if (!sanitized.id) sanitized.id = this.generateId();
            var now = new Date().toISOString();
            sanitized.created_at = sanitized.created_at || now;
            sanitized.updated_at = now;
            var storageKey = 'vigorre_' + tableName;
            var existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            existing.push(sanitized);
            localStorage.setItem(storageKey, JSON.stringify(existing));
            this.clearCache(tableName);
            return { success: true, data: sanitized };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    read(table, id) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            var tableName = this.getTableName(table);
            var cacheKey = tableName + '_' + (id || 'all');
            var cached = this.getCache(cacheKey);
            if (cached) return cached;
            var storageKey = 'vigorre_' + tableName;
            var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            var result;
            if (id) {
                result = data.find(function (item) { return item.id === id; });
                if (!result) return { success: false, error: 'Registro não encontrado' };
            } else {
                result = data;
            }
            var response = { success: true, data: result };
            this.setCache(cacheKey, response);
            return response;
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    update(table, id, updates) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            if (!id) throw new Error('ID é obrigatório');
            var tableName = this.getTableName(table);
            var storageKey = 'vigorre_' + tableName;
            var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            var found = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    var sanitized = this.sanitizeData(updates);
                    for (var key in sanitized) {
                        if (key !== 'id' && key !== 'created_at') data[i][key] = sanitized[key];
                    }
                    data[i].updated_at = new Date().toISOString();
                    found = true;
                    break;
                }
            }
            if (!found) return { success: false, error: 'Registro não encontrado' };
            localStorage.setItem(storageKey, JSON.stringify(data));
            this.clearCache(tableName);
            return { success: true, data: data.find(function (item) { return item.id === id; }) };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    delete(table, id) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            if (!id) throw new Error('ID é obrigatório');
            var tableName = this.getTableName(table);
            var storageKey = 'vigorre_' + tableName;
            var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            var filtered = data.filter(function (item) { return item.id !== id; });
            if (filtered.length === data.length) return { success: false, error: 'Registro não encontrado' };
            localStorage.setItem(storageKey, JSON.stringify(filtered));
            this.clearCache(tableName);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    filter(table, filters) {
        try {
            var result = this.read(table);
            if (!result.success) return result;
            var data = Array.isArray(result.data) ? result.data : [result.data];
            var filtered = data.filter(function (item) {
                for (var key in filters) {
                    if (filters[key] !== undefined && filters[key] !== null) {
                        if (item[key] !== filters[key]) return false;
                    }
                }
                return true;
            });
            return { success: true, data: filtered };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    getCache(key) {
        var cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }

    setCache(key, data) {
        this.cache.set(key, { data: data, timestamp: Date.now() });
    }

    clearCache(table) {
        for (var key of this.cache.keys()) {
            if (key.indexOf(table) === 0) this.cache.delete(key);
        }
    }
}

// ============================================
// INSTÂNCIA GLOBAL
// ============================================
var supabaseService = new SupabaseService();
supabaseService.connect();

window.VIGORRE_CONFIG = SUPABASE_CONFIG;
window.supabaseService = supabaseService;

console.log('✅ VIGORRE ONE™ - Supabase Config carregado | Modo:', supabaseService.mode);
