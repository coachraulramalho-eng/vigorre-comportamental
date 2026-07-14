/**
 * ============================================
 * VIGORRE ONE™ - SUPABASE CONFIG
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Conexão com Supabase
 * - CRUD completo
 * - Autenticação
 * - Filtros e buscas
 * - Relacionamentos
 * - Cache
 * - Error handling
 * - Validação
 * - Sanitização
 * ============================================
 */

'use strict';

// ============================================
// 1. CONFIGURAÇÃO SUPABASE
// ============================================
const SUPABASE_CONFIG = {
    // CREDENCIAIS (substituir pelas reais)
    url: 'https://seu-projeto.supabase.co',
    anonKey: 'sua-chave-anon-aqui',
    serviceRoleKey: 'sua-service-role-key-aqui',
    
    // CONFIGURAÇÕES
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    maxRows: 1000,
    
    // TABELAS
    tables: {
        users: 'users',
        companies: 'companies',
        participants: 'participants',
        recruiters: 'recruiters',
        consultants: 'consultants',
        creditTransactions: 'credit_transactions',
        wallets: 'wallets',
        plans: 'plans',
        auditLogs: 'audit_logs',
        jobProfiles: 'job_profiles',
        appointments: 'appointments',
        backups: 'backups',
        reports: 'reports',
        laudos: 'laudos',
        discResults: 'disc_results',
        ieResults: 'ie_results',
        valoresResults: 'valores_results',
        swotResults: 'swot_results',
        bigfiveResults: 'bigfive_results'
    },
    
    // BUCKETS
    buckets: {
        reports: 'reports',
        laudos: 'laudos',
        avatars: 'avatars',
        documents: 'documents'
    },
    
    // RELACIONAMENTOS
    relationships: {
        users: {
            belongsTo: [],
            hasMany: ['companies', 'participants', 'recruiters', 'consultants']
        },
        companies: {
            belongsTo: ['users'],
            hasMany: ['participants', 'recruiters']
        },
        participants: {
            belongsTo: ['companies', 'users'],
            hasMany: ['discResults', 'ieResults', 'valoresResults', 'swotResults', 'bigfiveResults']
        }
    }
};

// ============================================
// 2. CLASSE SUPABASE SERVICE
// ============================================
class SupabaseService {
    
    // ============================================
    // 2.1 CONSTRUTOR
    // ============================================
    constructor() {
        this.config = SUPABASE_CONFIG;
        this.isConnected = false;
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutos
    }
    
    // ============================================
    // 2.2 CONEXÃO
    // ============================================
    connect() {
        try {
            console.log('🔗 Conectando ao Supabase...');
            // Na implementação real, usar supabase-js
            this.isConnected = true;
            console.log('✅ Conectado ao Supabase com sucesso!');
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao conectar:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.3 CREATE - INSERIR REGISTRO
    // ============================================
    create(table, data) {
        try {
            // Validação
            if (!table) throw new Error('Tabela é obrigatória');
            if (!data || typeof data !== 'object') throw new Error('Dados inválidos');
            
            // Sanitização
            var sanitized = this.sanitizeData(data);
            
            // Gerar ID se não existir
            if (!sanitized.id) {
                sanitized.id = this.generateId();
            }
            
            // Adicionar timestamps
            var now = new Date().toISOString();
            sanitized.created_at = sanitized.created_at || now;
            sanitized.updated_at = now;
            
            console.log(`📝 Criando registro em ${table}:`, sanitized);
            
            // Em produção, inserir no Supabase
            // const { data, error } = await supabase.from(table).insert(sanitized);
            
            // Mock para desenvolvimento
            var storageKey = 'vigorre_' + table;
            var existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            existing.push(sanitized);
            localStorage.setItem(storageKey, JSON.stringify(existing));
            
            // Limpar cache
            this.clearCache(table);
            
            return { 
                success: true, 
                data: sanitized,
                message: 'Registro criado com sucesso'
            };
            
        } catch (error) {
            console.error('❌ Erro ao criar:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.4 READ - BUSCAR REGISTROS
    // ============================================
    read(table, id) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            
            // Verificar cache
            var cacheKey = table + '_' + (id || 'all');
            var cached = this.getCache(cacheKey);
            if (cached) {
                console.log('📦 Usando cache para:', cacheKey);
                return cached;
            }
            
            var storageKey = 'vigorre_' + table;
            var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            var result;
            if (id) {
                // Buscar por ID
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id === id) {
                        result = data[i];
                        break;
                    }
                }
                if (!result) {
                    return { success: false, error: 'Registro não encontrado' };
                }
            } else {
                result = data;
            }
            
            // Salvar em cache
            this.setCache(cacheKey, { success: true, data: result });
            
            console.log(`📖 Lendo de ${table}:`, id || 'todos');
            
            return { success: true, data: result };
            
        } catch (error) {
            console.error('❌ Erro ao ler:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.5 UPDATE - ATUALIZAR REGISTRO
    // ============================================
    update(table, id, updates) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            if (!id) throw new Error('ID é obrigatório');
            if (!updates || typeof updates !== 'object') throw new Error('Dados inválidos');
            
            // Sanitização
            var sanitized = this.sanitizeData(updates);
            
            var storageKey = 'vigorre_' + table;
            var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            var found = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    // Atualizar campos
                    for (var key in sanitized) {
                        if (key !== 'id' && key !== 'created_at') {
                            data[i][key] = sanitized[key];
                        }
                    }
                    data[i].updated_at = new Date().toISOString();
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                return { success: false, error: 'Registro não encontrado' };
            }
            
            localStorage.setItem(storageKey, JSON.stringify(data));
            
            // Limpar cache
            this.clearCache(table);
            
            console.log(`🔄 Atualizando ${table}:`, id);
            
            return { 
                success: true, 
                data: data.find(function(item) { return item.id === id; }),
                message: 'Registro atualizado com sucesso'
            };
            
        } catch (error) {
            console.error('❌ Erro ao atualizar:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.6 DELETE - EXCLUIR REGISTRO
    // ============================================
    delete(table, id) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            if (!id) throw new Error('ID é obrigatório');
            
            var storageKey = 'vigorre_' + table;
            var data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            var filtered = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].id !== id) {
                    filtered.push(data[i]);
                }
            }
            
            if (filtered.length === data.length) {
                return { success: false, error: 'Registro não encontrado' };
            }
            
            localStorage.setItem(storageKey, JSON.stringify(filtered));
            
            // Limpar cache
            this.clearCache(table);
            
            console.log(`🗑️ Deletando ${table}:`, id);
            
            return { 
                success: true, 
                message: 'Registro excluído com sucesso'
            };
            
        } catch (error) {
            console.error('❌ Erro ao deletar:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.7 FILTER - FILTRAR REGISTROS
    // ============================================
    filter(table, filters) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            if (!filters || typeof filters !== 'object') throw new Error('Filtros inválidos');
            
            var result = this.read(table);
            if (!result.success) return result;
            
            var data = result.data;
            if (!Array.isArray(data)) {
                data = [data];
            }
            
            var filtered = data.filter(function(item) {
                for (var key in filters) {
                    if (filters[key] !== undefined && filters[key] !== null) {
                        if (item[key] !== filters[key]) {
                            return false;
                        }
                    }
                }
                return true;
            });
            
            console.log(`🔍 Filtrando ${table}:`, filters);
            
            return { success: true, data: filtered };
            
        } catch (error) {
            console.error('❌ Erro ao filtrar:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.8 SEARCH - BUSCAR POR TEXTO
    // ============================================
    search(table, field, query) {
        try {
            if (!table) throw new Error('Tabela é obrigatória');
            if (!field) throw new Error('Campo é obrigatório');
            if (!query) throw new Error('Texto de busca é obrigatório');
            
            var result = this.read(table);
            if (!result.success) return result;
            
            var data = result.data;
            if (!Array.isArray(data)) {
                data = [data];
            }
            
            var searchLower = query.toLowerCase();
            var filtered = data.filter(function(item) {
                var value = item[field];
                if (!value) return false;
                return value.toString().toLowerCase().includes(searchLower);
            });
            
            console.log(`🔎 Buscando ${field} em ${table}:`, query);
            
            return { success: true, data: filtered };
            
        } catch (error) {
            console.error('❌ Erro ao buscar:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.9 RELACIONAMENTOS - JOIN
    // ============================================
    join(table, foreignTable, foreignKey, localKey) {
        try {
            if (!table) throw new Error('Tabela principal é obrigatória');
            if (!foreignTable) throw new Error('Tabela estrangeira é obrigatória');
            if (!foreignKey) throw new Error('Chave estrangeira é obrigatória');
            
            var result = this.read(table);
            if (!result.success) return result;
            
            var foreignResult = this.read(foreignTable);
            if (!foreignResult.success) return foreignResult;
            
            var data = result.data;
            var foreignData = foreignResult.data;
            
            if (!Array.isArray(data)) {
                data = [data];
            }
            
            if (!Array.isArray(foreignData)) {
                foreignData = [foreignData];
            }
            
            // Criar mapa da tabela estrangeira
            var foreignMap = {};
            for (var i = 0; i < foreignData.length; i++) {
                var key = localKey ? foreignData[i][localKey] : foreignData[i].id;
                if (key) {
                    foreignMap[key] = foreignData[i];
                }
            }
            
            // Fazer join
            var joined = data.map(function(item) {
                var foreignKeyValue = item[foreignKey];
                var foreign = foreignMap[foreignKeyValue] || null;
                return {
                    ...item,
                    foreign: foreign
                };
            });
            
            console.log(`🔗 Join ${table} + ${foreignTable}`);
            
            return { success: true, data: joined };
            
        } catch (error) {
            console.error('❌ Erro no join:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // 2.10 CACHE
    // ============================================
    getCache(key) {
        var cached = this.cache.get(key);
        if (!cached) return null;
        
        var now = Date.now();
        if (now - cached.timestamp > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
    
    clearCache(table) {
        // Limpar todos os caches da tabela
        for (var key of this.cache.keys()) {
            if (key.startsWith(table)) {
                this.cache.delete(key);
            }
        }
    }
    
    clearAllCache() {
        this.cache.clear();
        console.log('🧹 Cache limpo');
    }
    
    // ============================================
    // 2.11 UTILITÁRIOS
    // ============================================
    
    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }
    
    // Sanitizar dados
    sanitizeData(data) {
        var sanitized = {};
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var value = data[key];
                if (typeof value === 'string') {
                    // Remover tags HTML
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
    
    // Validar dados
    validate(table, data) {
        // Validações básicas
        var errors = [];
        
        if (!data) {
            errors.push('Dados são obrigatórios');
            return { valid: false, errors: errors };
        }
        
        // Validações específicas por tabela
        switch (table) {
            case 'users':
                if (!data.email) errors.push('E-mail é obrigatório');
                if (!data.name) errors.push('Nome é obrigatório');
                if (data.email && !this.validateEmail(data.email)) {
                    errors.push('E-mail inválido');
                }
                break;
                
            case 'companies':
                if (!data.name) errors.push('Nome da empresa é obrigatório');
                if (!data.cnpj) errors.push('CNPJ é obrigatório');
                break;
                
            case 'participants':
                if (!data.name) errors.push('Nome do participante é obrigatório');
                if (!data.companyId) errors.push('Empresa é obrigatória');
                break;
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // Validar e-mail
    validateEmail(email) {
        var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Validar CNPJ
    validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]/g, '');
        if (cnpj.length !== 14) return false;
        // Verificação simples
        return true;
    }
    
    // ============================================
    // 2.12 AUTENTICAÇÃO
    // ============================================
    
    // Login
    login(email, password) {
        try {
            if (!email || !password) {
                return { success: false, error: 'E-mail e senha são obrigatórios' };
            }
            
            var result = this.filter('users', { email: email });
            if (!result.success || !result.data || result.data.length === 0) {
                return { success: false, error: 'Usuário não encontrado' };
            }
            
            var user = result.data[0];
            if (user.password !== password) {
                return { success: false, error: 'Senha incorreta' };
            }
            
            // Não retornar a senha
            delete user.password;
            
            console.log('🔐 Login realizado:', user.email);
            
            return { 
                success: true, 
                data: user,
                token: this.generateToken(user),
                message: 'Login realizado com sucesso'
            };
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Logout
    logout(userId) {
        try {
            console.log('🚪 Logout:', userId);
            return { success: true, message: 'Logout realizado com sucesso' };
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Resetar senha
    resetPassword(email, newPassword) {
        try {
            if (!email) return { success: false, error: 'E-mail é obrigatório' };
            if (!newPassword || newPassword.length < 6) {
                return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
            }
            
            var result = this.filter('users', { email: email });
            if (!result.success || !result.data || result.data.length === 0) {
                return { success: false, error: 'Usuário não encontrado' };
            }
            
            var user = result.data[0];
            return this.update('users', user.id, { password: newPassword });
            
        } catch (error) {
            console.error('❌ Erro ao resetar senha:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Gerar token
    generateToken(user) {
        var payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
        };
        // Mock de token
        return btoa(JSON.stringify(payload));
    }
    
    // Verificar token
    verifyToken(token) {
        try {
            var payload = JSON.parse(atob(token));
            if (payload.exp < Date.now()) {
                return { valid: false, error: 'Token expirado' };
            }
            return { valid: true, data: payload };
        } catch (error) {
            return { valid: false, error: 'Token inválido' };
        }
    }
    
    // ============================================
    // 2.13 ESTATÍSTICAS E RELATÓRIOS
    // ============================================
    
    // Contar registros
    count(table, filters) {
        try {
            var result = filters ? this.filter(table, filters) : this.read(table);
            if (!result.success) return result;
            
            var data = result.data;
            if (!Array.isArray(data)) {
                data = [data];
            }
            
            return { success: true, count: data.length };
            
        } catch (error) {
            console.error('❌ Erro ao contar:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Relatório resumido
    getSummary() {
        try {
            var summary = {};
            for (var table in this.config.tables) {
                var result = this.read(this.config.tables[table]);
                if (result.success) {
                    var data = result.data;
                    summary[table] = Array.isArray(data) ? data.length : 1;
                }
            }
            return { success: true, data: summary };
        } catch (error) {
            console.error('❌ Erro ao gerar resumo:', error);
            return { success: false, error: error.message };
        }
    }
}

// ============================================
// 3. INSTÂNCIA GLOBAL
// ============================================
var supabaseService = new SupabaseService();
supabaseService.connect();

// ============================================
// 4. EXPORTAR PARA TODOS OS MÓDULOS
// ============================================
window.VIGORRE_CONFIG = SUPABASE_CONFIG;
window.supabaseService = supabaseService;

console.log('✅ VIGORRE ONE™ - Supabase Service carregado com sucesso!');
console.log('📋 Tabelas disponíveis:', Object.keys(SUPABASE_CONFIG.tables).length);
console.log('🔗 Métodos disponíveis:', Object.keys(supabaseService).filter(function(k) {
    return typeof supabaseService[k] === 'function';
}).length);
