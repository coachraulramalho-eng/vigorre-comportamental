/**
 * ============================================
 * VIGORRE ONE™ - DATA SYNC
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 15/07/2026
 * 
 * FUNCIONALIDADES:
 * - Sincronizar dados entre módulos
 * - Cache distribuído
 * - Atualização em tempo real
 * - Validação de dados
 * - Merge de dados
 * ============================================
 */

'use strict';

const DATA_SYNC_CONFIG = {
    syncInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    cacheTTL: 300000,
    tables: ['users', 'companies', 'participants', 'recruiters', 'consultants', 'wallets', 'creditTransactions']
};

class DataSync {
    
    constructor() {
        this.config = DATA_SYNC_CONFIG;
        this.cache = new Map();
        this.pendingSyncs = new Map();
        this.isSyncing = false;
        this.lastSync = null;
        this._init();
    }

    _init() {
        console.log('🔄 Inicializando Data Sync...');
        this._loadCache();
        setInterval(this.syncAll.bind(this), this.config.syncInterval);
        console.log('✅ Data Sync inicializado');
    }

    _loadCache() {
        try {
            var cached = JSON.parse(localStorage.getItem('vigorre_data_cache') || '{}');
            for (var key in cached) {
                this.cache.set(key, { data: cached[key], timestamp: Date.now() });
            }
            console.log('📦 Cache carregado:', this.cache.size, 'itens');
        } catch (error) { console.warn('⚠️ Erro ao carregar cache:', error); }
    }

    _saveCache() {
        try {
            var cached = {};
            for (var [key, value] of this.cache) { cached[key] = value.data; }
            localStorage.setItem('vigorre_data_cache', JSON.stringify(cached));
        } catch (error) { console.warn('⚠️ Erro ao salvar cache:', error); }
    }

    syncAll() {
        if (this.isSyncing) { console.log('⏳ Sync já em andamento...'); return; }
        this.isSyncing = true;
        console.log('🔄 Iniciando sincronização completa...');
        var tables = this.config.tables;
        var promises = [];
        for (var i = 0; i < tables.length; i++) {
            promises.push(this._syncTable(tables[i]));
        }
        Promise.all(promises).then(function() {
            this.lastSync = new Date();
            this.isSyncing = false;
            this._saveCache();
            console.log('✅ Sincronização completa finalizada');
            if (window.moduleConnector) { window.moduleConnector._emit('dataSynced', { timestamp: this.lastSync }); }
        }.bind(this)).catch(function(error) { this.isSyncing = false;
            console.error('❌ Erro na sincronização:', error); }.bind(this));
    }

    _syncTable(tableName) {
        return new Promise(function(resolve, reject) {
            try {
                console.log(`🔄 Sincronizando: ${tableName}`);
                var storageKey = 'vigorre_' + tableName;
                var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
                this.cache.set(tableName, { data: data, timestamp: Date.now() });
                resolve({ table: tableName, count: data.length });
            } catch (error) { console.error(`❌ Erro ao sincronizar ${tableName}:`, error);
                reject(error); }
        }.bind(this));
    }

    getData(table, forceRefresh) {
        try {
            if (!forceRefresh && this.cache.has(table)) {
                var cached = this.cache.get(table);
                var now = Date.now();
                if (now - cached.timestamp < this.config.cacheTTL) {
                    return { success: true, data: cached.data, fromCache: true };
                }
            }
            var storageKey = 'vigorre_' + table;
            var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            this.cache.set(table, { data: data, timestamp: Date.now() });
            return { success: true, data: data, fromCache: false };
        } catch (error) { console.error(`❌ Erro ao obter dados de ${table}:`, error); return { success: false,
                error: error.message }; }
    }

    updateData(table, data) {
        try {
            var storageKey = 'vigorre_' + table;
            var current = JSON.parse(localStorage.getItem(storageKey) || '[]');
            var merged = this._mergeData(current, data);
            localStorage.setItem(storageKey, JSON.stringify(merged));
            this.cache.set(table, { data: merged, timestamp: Date.now() });
            console.log(`📝 Dados atualizados: ${table}`);
            return { success: true, data: merged };
        } catch (error) { console.error(`❌ Erro ao atualizar dados de ${table}:`, error); return { success: false,
                error: error.message }; }
    }

    _mergeData(current, newData) {
        if (!Array.isArray(current)) { current = [current]; }
        if (!Array.isArray(newData)) { newData = [newData]; }
        var merged = current.slice();
        for (var i = 0; i < newData.length; i++) {
            var item = newData[i];
            var found = false;
            for (var j = 0; j < merged.length; j++) {
                if (merged[j].id === item.id) { merged[j] = { ...merged[j], ...item };
                    found = true; break; }
            }
            if (!found) { merged.push(item); }
        }
        return merged;
    }

    validate(table, data) {
        try {
            var errors = [];
            switch (table) {
                case 'users':
                    if (!data.email) errors.push('E-mail é obrigatório');
                    if (!data.name) errors.push('Nome é obrigatório');
                    if (data.email && !this._validateEmail(data.email)) { errors.push('E-mail inválido'); }
                    break;
                case 'companies':
                    if (!data.name) errors.push('Nome da empresa é obrigatório');
                    if (!data.cnpj) errors.push('CNPJ é obrigatório');
                    break;
                case 'participants':
                    if (!data.name) errors.push('Nome do participante é obrigatório');
                    if (!data.companyId) errors.push('Empresa é obrigatória');
                    break;
                default:
                    if (!data.id) errors.push('ID é obrigatório');
            }
            return { valid: errors.length === 0, errors: errors };
        } catch (error) { console.error('❌ Erro na validação:', error); return { valid: false, errors: [error
                    .message] }; }
    }

    _validateEmail(email) { var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return regex.test(email); }

    clearCache() { this.cache.clear();
        localStorage.removeItem('vigorre_data_cache');
        console.log('🧹 Cache limpo'); return { success: true }; }

    getStats() {
        var stats = { cacheSize: this.cache.size, lastSync: this.lastSync, isSyncing: this.isSyncing, tables: {} };
        for (var [key, value] of this.cache) {
            var data = value.data;
            stats.tables[key] = { count: Array.isArray(data) ? data.length : 1, timestamp: new Date(value.timestamp)
                    .toISOString() };
        }
        return stats;
    }
}

var dataSync = new DataSync();
window.dataSync = dataSync;

console.log('✅ VIGORRE ONE™ - Data Sync carregado com sucesso!');
console.log('🔄 Sincronização automática a cada:', DATA_SYNC_CONFIG.syncInterval / 1000, 'segundos');
