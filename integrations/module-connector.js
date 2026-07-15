/**
 * ============================================
 * VIGORRE ONE™ - MODULE CONNECTOR
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 15/07/2026
 * 
 * FUNCIONALIDADES:
 * - Conectar todos os módulos do sistema
 * - Gerenciar dependências entre módulos
 * - Roteamento entre módulos
 * - Comunicação entre módulos
 * - Sincronização de estado
 * ============================================
 */

'use strict';

const MODULE_CONFIG = {
    modules: {
        admin: { name: 'Admin', path: '/admin/', icon: '📊', version: '1.0.0',
            dependencies: ['auth', 'supabase', 'carteira', 'credito'] },
        recruiter: { name: 'Recrutador', path: '/recrutador/', icon: '🎯', version: '1.0.0',
            dependencies: ['auth', 'supabase', 'carteira', 'credito'] },
        participant: { name: 'Participante', path: '/participante/', icon: '👤', version: '1.0.0',
            dependencies: ['auth', 'supabase'] },
        company: { name: 'Empresa', path: '/empresa/', icon: '🏢', version: '1.0.0',
            dependencies: ['auth', 'supabase', 'carteira', 'credito'] },
        consultant: { name: 'Consultor', path: '/consultor/', icon: '📊', version: '1.0.0',
            dependencies: ['auth', 'supabase', 'carteira', 'credito', 'relatorio'] },
        financeiro: { name: 'Centro Financeiro', path: '/admin/financeiro/', icon: '💰', version: '1.0.0',
            dependencies: ['auth', 'supabase', 'carteira', 'credito'] }
    },
    routes: {
        admin: {
            dashboard: '/admin/dashboard.html',
            empresas: '/admin/empresas/',
            recrutadores: '/admin/recrutadores/',
            participantes: '/admin/participantes/',
            creditos: '/admin/creditos/',
            relatorios: '/admin/relatorios/',
            jobProfile: '/admin/job-profile/index.html',
            financeiro: '/admin/financeiro/index.html',
            agenda: '/admin/agenda/calendario.html',
            backup: '/admin/backup/backup-completo.html',
            bi: '/admin/bi/dashboard.html',
            usuarios: '/admin/usuarios/'
        },
        recruiter: {
            dashboard: '/recrutador/dashboard.html',
            empresas: '/recrutador/empresas/',
            participantes: '/recrutador/participantes/',
            creditos: '/recrutador/creditos/',
            relatorios: '/recrutador/relatorios/',
            laudos: '/recrutador/laudos/',
            agenda: '/recrutador/agenda/calendario.html'
        },
        participant: {
            dashboard: '/participante/dashboard.html',
            testes: '/participante/testes/',
            resultados: '/participante/resultados/',
            laudo: '/participante/laudo/'
        },
        company: {
            dashboard: '/empresa/dashboard.html',
            colaboradores: '/empresa/colaboradores/',
            avaliacoes: '/empresa/avaliacoes/',
            relatorios: '/empresa/relatorios/',
            jobProfile: '/empresa/job-profile/index.html'
        },
        consultant: {
            dashboard: '/consultor/dashboard.html',
            clientes: '/consultor/clientes/',
            avaliacoes: '/consultor/avaliacoes/',
            relatorios: '/consultor/relatorios/',
            laudos: '/consultor/laudos/',
            creditos: '/consultor/creditos/',
            agenda: '/consultor/agenda/calendario.html',
            faturamento: '/consultor/faturamento/'
        }
    }
};

class ModuleConnector {
    
    constructor() {
        this.config = MODULE_CONFIG;
        this.modules = {};
        this.connections = new Map();
        this.listeners = new Map();
        this.isReady = false;
    }

    init() {
        try {
            console.log('🔌 Inicializando Module Connector...');
            this._registerModules();
            this._establishConnections();
            this._setupEventListeners();
            this.isReady = true;
            console.log('✅ Module Connector inicializado com sucesso!');
            console.log('📋 Módulos conectados:', Object.keys(this.modules).length);
            return { success: true };
        } catch (error) { console.error('❌ Erro ao inicializar Module Connector:', error); return { success: false,
                error: error.message }; }
    }

    _registerModules() {
        for (var key in this.config.modules) {
            var moduleConfig = this.config.modules[key];
            this.modules[key] = { id: key, ...moduleConfig, status: 'registered', connected: false, listeners: [] };
            console.log(`📦 Módulo registrado: ${key} (${moduleConfig.name})`);
        }
    }

    _establishConnections() {
        var moduleKeys = Object.keys(this.modules);
        for (var i = 0; i < moduleKeys.length; i++) {
            var key = moduleKeys[i];
            var module = this.modules[key];
            var depsOk = true;
            for (var j = 0; j < module.dependencies.length; j++) {
                var dep = module.dependencies[j];
                if (!this._checkDependency(dep)) { depsOk = false;
                    console.warn(`⚠️ Módulo ${key} depende de ${dep} não disponível`); }
            }
            if (depsOk) { module.connected = true;
                module.status = 'connected';
                this.connections.set(key, { status: 'connected' });
                console.log(`🔗 Módulo ${key} conectado`); }
        }
    }

    _checkDependency(dep) {
        var services = { 'auth': window.VigorreAuth, 'supabase': window.supabaseService, 'carteira': window
                .carteiraService, 'credito': window.creditoService, 'relatorio': window.relatorioService,
            'laudo': window.laudoService };
        return !!services[dep];
    }

    _setupEventListeners() {
        if (window.VigorreAuth) {
            var originalLogin = window.VigorreAuth.login;
            if (originalLogin) {
                window.VigorreAuth.login = function(email, password) {
                    var result = originalLogin.call(this, email, password);
                    if (result && result.success) { this._emit('userLoggedIn', result.user); }
                    return result;
                }.bind(this);
            }
        }
        var originalAddCredits = window.carteiraService?.adicionarCredito;
        if (originalAddCredits) {
            window.carteiraService.adicionarCredito = function(id, tipo, quantidade, descricao) {
                var result = originalAddCredits.call(this, id, tipo, quantidade, descricao);
                if (result && result.success) { this._emit('creditsAdded', { walletId: id, tipo: tipo,
                        quantidade: quantidade }); }
                return result;
            }.bind(this);
        }
    }

    _emit(event, data) {
        if (this.listeners.has(event)) {
            var callbacks = this.listeners.get(event);
            for (var i = 0; i < callbacks.length; i++) {
                try { callbacks[i](data); } catch (error) { console.error('❌ Erro ao executar listener:', error); }
            }
        }
    }

    on(event, callback) { if (!this.listeners.has(event)) { this.listeners.set(event, []); }
        this.listeners.get(event).push(callback);
        console.log(`👂 Listener adicionado para: ${event}`); }

    off(event, callback) {
        if (this.listeners.has(event)) {
            var callbacks = this.listeners.get(event);
            var index = callbacks.indexOf(callback);
            if (index !== -1) { callbacks.splice(index, 1);
                console.log(`👂 Listener removido para: ${event}`); }
        }
    }

    navigate(module, page) {
        try {
            if (!this.config.routes[module]) { return { success: false, error: 'Módulo não encontrado: ' + module }; }
            var route = this.config.routes[module][page];
            if (!route) { return { success: false, error: 'Página não encontrada: ' + page }; }
            console.log(`🔄 Navegando para: ${module} → ${page} (${route})`);
            window.location.href = route;
            return { success: true };
        } catch (error) { console.error('❌ Erro ao navegar:', error); return { success: false, error: error
                .message }; }
    }

    getRoute(module, page) {
        try { if (!this.config.routes[module]) { return null; } return this.config.routes[module][page] || null; } catch { return null; }
    }

    getCurrentModule() {
        try {
            var path = window.location.pathname;
            var moduleKeys = Object.keys(this.config.routes);
            for (var i = 0; i < moduleKeys.length; i++) {
                var key = moduleKeys[i];
                var routes = this.config.routes[key];
                var routeKeys = Object.keys(routes);
                for (var j = 0; j < routeKeys.length; j++) {
                    var route = routes[routeKeys[j]];
                    if (path.indexOf(route) !== -1) { return { module: key, page: routeKeys[j] }; }
                }
            }
            return null;
        } catch (error) { console.error('❌ Erro ao obter módulo atual:', error); return null; }
    }

    syncState(data) {
        try {
            console.log('🔄 Sincronizando estado:', data);
            localStorage.setItem('vigorre_state', JSON.stringify(data));
            this._emit('stateSynced', data);
            return { success: true };
        } catch (error) { console.error('❌ Erro ao sincronizar estado:', error); return { success: false, error: error
                .message }; }
    }

    getState() {
        try { var state = JSON.parse(localStorage.getItem('vigorre_state') || '{}'); return { success: true,
                data: state }; } catch { return { success: true, data: {} }; }
    }

    isModuleConnected(moduleId) { var module = this.modules[moduleId]; return module ? module.connected : false; }

    getModuleStatus() {
        var status = {};
        for (var key in this.modules) {
            var module = this.modules[key];
            status[key] = { name: module.name, status: module.status, connected: module.connected };
        }
        return status;
    }

    reconnect() { console.log('🔄 Reiniciando conexões...'); this.connections.clear(); this._establishConnections(); return { success: true }; }
}

var moduleConnector = new ModuleConnector();
window.moduleConnector = moduleConnector;

setTimeout(function() { moduleConnector.init(); }, 100);

console.log('✅ VIGORRE ONE™ - Module Connector carregado com sucesso!');
console.log('📋 Módulos disponíveis:', Object.keys(MODULE_CONFIG.modules).join(', '));
