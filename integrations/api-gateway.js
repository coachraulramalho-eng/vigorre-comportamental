/**
 * ============================================
 * VIGORRE ONE™ - API GATEWAY
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Centralização de todas as chamadas API
 * - Autenticação e autorização
 * - Rate limiting
 * - Logging
 * - Cache de respostas
 * - Fallback e retry
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const API_CONFIG = {
    baseUrl: process.env.VITE_API_URL || '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    rateLimit: {
        maxRequests: 100,
        windowMs: 60000 // 1 minuto
    },
    endpoints: {
        auth: {
            login: '/auth/login',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            reset: '/auth/reset-password'
        },
        users: {
            list: '/users',
            get: '/users/:id',
            create: '/users',
            update: '/users/:id',
            delete: '/users/:id'
        },
        companies: {
            list: '/companies',
            get: '/companies/:id',
            create: '/companies',
            update: '/companies/:id',
            delete: '/companies/:id'
        },
        participants: {
            list: '/participants',
            get: '/participants/:id',
            create: '/participants',
            update: '/participants/:id',
            delete: '/participants/:id'
        },
        wallets: {
            list: '/wallets',
            get: '/wallets/:id',
            create: '/wallets',
            update: '/wallets/:id',
            delete: '/wallets/:id',
            balance: '/wallets/:id/balance',
            credits: '/wallets/:id/credits'
        },
        credits: {
            list: '/credits',
            get: '/credits/:id',
            create: '/credits',
            update: '/credits/:id',
            delete: '/credits/:id',
            transfer: '/credits/transfer'
        },
        reports: {
            list: '/reports',
            get: '/reports/:id',
            create: '/reports',
            update: '/reports/:id',
            delete: '/reports/:id',
            export: '/reports/:id/export'
        },
        laudos: {
            list: '/laudos',
            get: '/laudos/:id',
            create: '/laudos',
            update: '/laudos/:id',
            delete: '/laudos/:id',
            sign: '/laudos/:id/sign',
            validate: '/laudos/:id/validate'
        }
    }
};

// ============================================
// CLASSE API GATEWAY
// ============================================
class ApiGateway {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = API_CONFIG;
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.requestCount = 0;
        this.requestWindowStart = Date.now();
        this._init();
    }

    // ============================================
    // INICIALIZAR
    // ============================================
    _init() {
        console.log('🌐 Inicializando API Gateway...');
        this._setupInterceptors();
        console.log('✅ API Gateway inicializado');
    }

    // ============================================
    // INTERCEPTADORES
    // ============================================
    _setupInterceptors() {
        // Request interceptor
        this._requestInterceptor = function(config) {
            // Adicionar token de autenticação
            var token = localStorage.getItem('vigorre_token');
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = 'Bearer ' + token;
            }
            
            // Adicionar timestamp
            config.headers = config.headers || {};
            config.headers['X-Request-Time'] = Date.now();
            
            return config;
        };
        
        // Response interceptor
        this._responseInterceptor = function(response) {
            // Log de resposta
            console.log(`📡 API Response: ${response.status} - ${response.config.url}`);
            return response;
        };
        
        // Error interceptor
        this._errorInterceptor = function(error) {
            console.error('❌ API Error:', error);
            
            // Tratar erro 401 (não autenticado)
            if (error.response && error.response.status === 401) {
                if (window.VigorreAuth) {
                    window.VigorreAuth.logout();
                }
            }
            
            return Promise.reject(error);
        };
    }

    // ============================================
    // VERIFICAR RATE LIMIT
    // ============================================
    _checkRateLimit() {
        var now = Date.now();
        if (now - this.requestWindowStart > this.config.rateLimit.windowMs) {
            this.requestCount = 0;
            this.requestWindowStart = now;
        }
        
        this.requestCount++;
        
        if (this.requestCount > this.config.rateLimit.maxRequests) {
            return { success: false, error: 'Rate limit excedido' };
        }
        
        return { success: true };
    }

    // ============================================
    // REQUISIÇÃO HTTP
    // ============================================
    request(method, endpoint, data, options) {
        return new Promise(function(resolve, reject) {
            try {
                // Verificar rate limit
                var rateCheck = this._checkRateLimit();
                if (!rateCheck.success) {
                    reject(new Error(rateCheck.error));
                    return;
                }
                
                // Verificar cache (GET apenas)
                var cacheKey = method + '_' + endpoint + '_' + JSON.stringify(data);
                if (method === 'GET' && this.cache.has(cacheKey)) {
                    var cached = this.cache.get(cacheKey);
                    if (Date.now() - cached.timestamp < this.config.cacheTTL) {
                        console.log(`📦 Cache hit: ${endpoint}`);
                        resolve(cached.data);
                        return;
                    }
                }
                
                // Simular chamada API (em produção, usar fetch/axios)
                console.log(`📡 API Request: ${method} ${endpoint}`);
                
                // Simular delay
                var delay = Math.random() * 500 + 200;
                setTimeout(function() {
                    var response = this._simulateResponse(method, endpoint, data);
                    
                    // Salvar em cache (GET apenas)
                    if (method === 'GET') {
                        this.cache.set(cacheKey, {
                            data: response,
                            timestamp: Date.now()
                        });
                    }
                    
                    resolve(response);
                }.bind(this), delay);
                
            } catch (error) {
                reject(error);
            }
        }.bind(this));
    }

    // ============================================
    // SIMULAR RESPOSTA (MOCK)
    // ============================================
    _simulateResponse(method, endpoint, data) {
        // Em produção, esta função seria removida e substituída pela chamada real à API
        var parts = endpoint.split('/');
        var resource = parts[1] || 'default';
        var id = parts[2];
        
        // Simular respostas com base no recurso
        var response = {
            success: true,
            data: null,
            message: 'Operação realizada com sucesso'
        };
        
        // Buscar dados do localStorage
        var storageKey = 'vigorre_' + resource;
        var storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        switch (method) {
            case 'GET':
                if (id) {
                    response.data = storedData.find(function(item) { return item.id === id; });
                    if (!response.data) {
                        response.success = false;
                        response.message = 'Registro não encontrado';
                    }
                } else {
                    response.data = storedData;
                }
                break;
                
            case 'POST':
                var newItem = { ...data, id: 'mock_' + Date.now() };
                storedData.push(newItem);
                localStorage.setItem(storageKey, JSON.stringify(storedData));
                response.data = newItem;
                break;
                
            case 'PUT':
                var updated = false;
                for (var i = 0; i < storedData.length; i++) {
                    if (storedData[i].id === id) {
                        storedData[i] = { ...storedData[i], ...data };
                        updated = true;
                        response.data = storedData[i];
                        break;
                    }
                }
                if (!updated) {
                    response.success = false;
                    response.message = 'Registro não encontrado';
                }
                localStorage.setItem(storageKey, JSON.stringify(storedData));
                break;
                
            case 'DELETE':
                var filtered = storedData.filter(function(item) { return item.id !== id; });
                if (filtered.length === storedData.length) {
                    response.success = false;
                    response.message = 'Registro não encontrado';
                } else {
                    localStorage.setItem(storageKey, JSON.stringify(filtered));
                    response.data = { deleted: id };
                }
                break;
                
            default:
                response.success = false;
                response.message = 'Método não suportado';
        }
        
        // Registrar em auditoria
        if (window.VigorreAuth) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user) {
                var auditData = {
                    userId: user.id,
                    userName: user.name || 'Sistema',
                    action: method + ' ' + endpoint,
                    description: JSON.stringify(data || {}),
                    severity: 'baixo'
                };
                
                try {
                    var logs = JSON.parse(localStorage.getItem('vigorre_audit_logs') || '[]');
                    logs.push({
                        id: 'A' + Date.now().toString(36).toUpperCase(),
                        ...auditData,
                        date: new Date().toLocaleString('pt-BR'),
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('vigorre_audit_logs', JSON.stringify(logs));
                } catch (e) {
                    console.warn('⚠️ Erro ao registrar auditoria:', e);
                }
            }
        }
        
        return response;
    }

    // ============================================
    // MÉTODOS HTTP
    // ============================================
    
    get(endpoint, options) {
        return this.request('GET', endpoint, null, options);
    }
    
    post(endpoint, data, options) {
        return this.request('POST', endpoint, data, options);
    }
    
    put(endpoint, data, options) {
        return this.request('PUT', endpoint, data, options);
    }
    
    delete(endpoint, options) {
        return this.request('DELETE', endpoint, null, options);
    }
    
    patch(endpoint, data, options) {
        return this.request('PATCH', endpoint, data, options);
    }

    // ============================================
    // ENDPOINTS ESPECÍFICOS
    // ============================================
    
    // Autenticação
    login(email, password) {
        return this.post(this.config.endpoints.auth.login, { email, password });
    }
    
    logout() {
        return this.post(this.config.endpoints.auth.logout);
    }
    
    refreshToken() {
        return this.post(this.config.endpoints.auth.refresh);
    }
    
    resetPassword(email) {
        return this.post(this.config.endpoints.auth.reset, { email });
    }
    
    // Usuários
    getUsers() {
        return this.get(this.config.endpoints.users.list);
    }
    
    getUser(id) {
        return this.get(this.config.endpoints.users.get.replace(':id', id));
    }
    
    createUser(data) {
        return this.post(this.config.endpoints.users.create, data);
    }
    
    updateUser(id, data) {
        return this.put(this.config.endpoints.users.update.replace(':id', id), data);
    }
    
    deleteUser(id) {
        return this.delete(this.config.endpoints.users.delete.replace(':id', id));
    }
    
    // Empresas
    getCompanies() {
        return this.get(this.config.endpoints.companies.list);
    }
    
    getCompany(id) {
        return this.get(this.config.endpoints.companies.get.replace(':id', id));
    }
    
    createCompany(data) {
        return this.post(this.config.endpoints.companies.create, data);
    }
    
    updateCompany(id, data) {
        return this.put(this.config.endpoints.companies.update.replace(':id', id), data);
    }
    
    deleteCompany(id) {
        return this.delete(this.config.endpoints.companies.delete.replace(':id', id));
    }
    
    // Participantes
    getParticipants() {
        return this.get(this.config.endpoints.participants.list);
    }
    
    getParticipant(id) {
        return this.get(this.config.endpoints.participants.get.replace(':id', id));
    }
    
    createParticipant(data) {
        return this.post(this.config.endpoints.participants.create, data);
    }
    
    updateParticipant(id, data) {
        return this.put(this.config.endpoints.participants.update.replace(':id', id), data);
    }
    
    deleteParticipant(id) {
        return this.delete(this.config.endpoints.participants.delete.replace(':id', id));
    }
    
    // Carteiras
    getWallets() {
        return this.get(this.config.endpoints.wallets.list);
    }
    
    getWallet(id) {
        return this.get(this.config.endpoints.wallets.get.replace(':id', id));
    }
    
    createWallet(data) {
        return this.post(this.config.endpoints.wallets.create, data);
    }
    
    updateWallet(id, data) {
        return this.put(this.config.endpoints.wallets.update.replace(':id', id), data);
    }
    
    deleteWallet(id) {
        return this.delete(this.config.endpoints.wallets.delete.replace(':id', id));
    }
    
    getWalletBalance(id) {
        return this.get(this.config.endpoints.wallets.balance.replace(':id', id));
    }
    
    getWalletCredits(id) {
        return this.get(this.config.endpoints.wallets.credits.replace(':id', id));
    }
    
    // Créditos
    getCredits() {
        return this.get(this.config.endpoints.credits.list);
    }
    
    getCredit(id) {
        return this.get(this.config.endpoints.credits.get.replace(':id', id));
    }
    
    createCredit(data) {
        return this.post(this.config.endpoints.credits.create, data);
    }
    
    updateCredit(id, data) {
        return this.put(this.config.endpoints.credits.update.replace(':id', id), data);
    }
    
    deleteCredit(id) {
        return this.delete(this.config.endpoints.credits.delete.replace(':id', id));
    }
    
    transferCredits(data) {
        return this.post(this.config.endpoints.credits.transfer, data);
    }

    // ============================================
    // LIMPAR CACHE
    // ============================================
    clearCache() {
        this.cache.clear();
        console.log('🧹 API Cache limpo');
        return { success: true };
    }

    // ============================================
    // OBTER ESTATÍSTICAS
    // ============================================
    getStats() {
        return {
            cacheSize: this.cache.size,
            requestCount: this.requestCount,
            requestWindowStart: new Date(this.requestWindowStart).toISOString(),
            pendingRequests: this.pendingRequests.size
        };
    }
}

// ============================================
// EXPORTAR
// ============================================
var apiGateway = new ApiGateway();
window.apiGateway = apiGateway;

console.log('✅ VIGORRE ONE™ - API Gateway carregado com sucesso!');
console.log('🌐 Endpoints disponíveis:', Object.keys(API_CONFIG.endpoints).length);
