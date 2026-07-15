/**
 * ============================================
 * VIGORRE ONE™ - EVENT BUS
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 15/07/2026
 * 
 * FUNCIONALIDADES:
 * - Pub/Sub entre módulos
 * - Eventos assíncronos
 * - Filtros de eventos
 * - Prioridade de eventos
 * - Persistência de eventos
 * - Log de eventos
 * ============================================
 */

'use strict';

const EVENT_BUS_CONFIG = {
    maxListeners: 50,
    maxEvents: 1000,
    persistEvents: true,
    eventLogging: true,
    eventTypes: {
        USER: { LOGGED_IN: 'user:logged_in', LOGGED_OUT: 'user:logged_out', UPDATED: 'user:updated',
            CREATED: 'user:created', DELETED: 'user:deleted' },
        COMPANY: { CREATED: 'company:created', UPDATED: 'company:updated', DELETED: 'company:deleted' },
        PARTICIPANT: { CREATED: 'participant:created', UPDATED: 'participant:updated', DELETED: 'participant:deleted',
            COMPLETED_TEST: 'participant:completed_test' },
        WALLET: { CREATED: 'wallet:created', UPDATED: 'wallet:updated', DELETED: 'wallet:deleted',
            BALANCE_CHANGED: 'wallet:balance_changed' },
        CREDIT: { ADDED: 'credit:added', REMOVED: 'credit:removed', TRANSFERRED: 'credit:transferred' },
        REPORT: { GENERATED: 'report:generated', EXPORTED: 'report:exported', DELETED: 'report:deleted' },
        LAUDO: { GENERATED: 'laudo:generated', SIGNED: 'laudo:signed', DELIVERED: 'laudo:delivered',
            VALIDATED: 'laudo:validated' },
        SYSTEM: { READY: 'system:ready', ERROR: 'system:error', WARNING: 'system:warning', INFO: 'system:info' }
    }
};

class EventBus {
    
    constructor() {
        this.config = EVENT_BUS_CONFIG;
        this.listeners = new Map();
        this.events = [];
        this.eventCount = 0;
        this._init();
    }

    _init() {
        console.log('📡 Inicializando Event Bus...');
        this._loadPersistedEvents();
        console.log('✅ Event Bus inicializado');
    }

    _loadPersistedEvents() {
        try {
            if (this.config.persistEvents) {
                var persisted = JSON.parse(localStorage.getItem('vigorre_events') || '[]');
                this.events = persisted.slice(-this.config.maxEvents);
                console.log('📦 Eventos carregados:', this.events.length);
            }
        } catch (error) { console.warn('⚠️ Erro ao carregar eventos:', error); }
    }

    _saveEvents() {
        try {
            if (this.config.persistEvents) {
                var eventsToSave = this.events.slice(-this.config.maxEvents);
                localStorage.setItem('vigorre_events', JSON.stringify(eventsToSave));
            }
        } catch (error) { console.warn('⚠️ Erro ao salvar eventos:', error); }
    }

    _logEvent(event, data) {
        if (!this.config.eventLogging) return;
        var logEntry = { id: 'E' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), event: event,
            data: data, timestamp: new Date().toISOString() };
        console.log(`📡 Evento: ${event}`, data);
        this.events.push(logEntry);
        this.eventCount++;
        this._saveEvents();
    }

    emit(event, data) {
        try {
            this._logEvent(event, data);
            if (this.listeners.has(event)) {
                var callbacks = this.listeners.get(event);
                var asyncCallbacks = [];
                var syncCallbacks = [];
                for (var i = 0; i < callbacks.length; i++) {
                    var cb = callbacks[i];
                    if (cb.async) { asyncCallbacks.push(cb); } else { syncCallbacks.push(cb); }
                }
                for (var j = 0; j < syncCallbacks.length; j++) {
                    try { syncCallbacks[j](data); } catch (error) { console.error('❌ Erro no callback síncrono:',
                            error); }
                }
                for (var k = 0; k < asyncCallbacks.length; k++) {
                    setTimeout(function(callback) { try { callback(data); } catch (error) { console.error(
                                '❌ Erro no callback assíncrono:', error); } }, 0, asyncCallbacks[k]);
                }
            }
            if (window.moduleConnector) { window.moduleConnector._emit(event, data); }
            return { success: true };
        } catch (error) { console.error('❌ Erro ao emitir evento:', error); return { success: false, error: error
                .message }; }
    }

    on(event, callback, options) {
        try {
            if (!this.listeners.has(event)) { this.listeners.set(event, []); }
            var callbacks = this.listeners.get(event);
            if (callbacks.length >= this.config.maxListeners) {
                console.warn(`⚠️ Número máximo de listeners para ${event} excedido`);
                return { success: false, error: 'Max listeners exceeded' };
            }
            var listener = { callback: callback, async: options && options.async || false, once: options && options
                    .once || false, priority: options && options.priority || 0 };
            callbacks.push(listener);
            callbacks.sort(function(a, b) { return b.priority - a.priority; });
            console.log(`👂 Listener adicionado para: ${event}`);
            return { success: true };
        } catch (error) { console.error('❌ Erro ao adicionar listener:', error); return { success: false, error: error
                .message }; }
    }

    once(event, callback, options) { return this.on(event, callback, { ...options, once: true }); }

    off(event, callback) {
        try {
            if (this.listeners.has(event)) {
                var callbacks = this.listeners.get(event);
                var newCallbacks = [];
                for (var i = 0; i < callbacks.length; i++) {
                    if (callbacks[i].callback !== callback) { newCallbacks.push(callbacks[i]); }
                }
                if (newCallbacks.length === 0) { this.listeners.delete(event); } else { this.listeners.set(event,
                        newCallbacks); }
                console.log(`👂 Listener removido para: ${event}`);
                return { success: true };
            }
            return { success: false, error: 'Evento não encontrado' };
        } catch (error) { console.error('❌ Erro ao remover listener:', error); return { success: false, error: error
                .message }; }
    }

    removeAllListeners(event) {
        try {
            if (event) { this.listeners.delete(event);
                console.log(`👂 Todos os listeners removidos para: ${event}`); } else { this.listeners.clear();
                console.log('👂 Todos os listeners removidos'); }
            return { success: true };
        } catch (error) { console.error('❌ Erro ao remover listeners:', error); return { success: false, error: error
                .message }; }
    }

    waitFor(event, timeout) {
        return new Promise(function(resolve, reject) {
            var timer = null;
            var callback = function(data) {
                if (timer) { clearTimeout(timer); }
                this.off(event, callback);
                resolve(data);
            }.bind(this);
            this.once(event, callback);
            if (timeout) {
                timer = setTimeout(function() { this.off(event, callback);
                    reject(new Error('Timeout aguardando evento: ' + event)); }.bind(this), timeout);
            }
        }.bind(this));
    }

    getEvents(filter) {
        try {
            var events = this.events;
            if (filter) {
                if (filter.event) { events = events.filter(function(e) { return e.event === filter.event; }); }
                if (filter.startDate) { events = events.filter(function(e) { return new Date(e.timestamp) >=
                        new Date(filter.startDate); }); }
                if (filter.endDate) { events = events.filter(function(e) { return new Date(e.timestamp) <= new Date(
                        filter.endDate); }); }
            }
            return { success: true, data: events };
        } catch (error) { console.error('❌ Erro ao obter eventos:', error); return { success: false, error: error
                .message }; }
    }

    clearHistory() { this.events = [];
        this.eventCount = 0;
        localStorage.removeItem('vigorre_events');
        console.log('🧹 Histórico de eventos limpo'); return { success: true }; }

    getStats() {
        var stats = { totalEvents: this.eventCount, eventsInMemory: this.events.length, listeners: {},
            eventsByType: {} };
        for (var [key, value] of this.listeners) { stats.listeners[key] = value.length; }
        for (var i = 0; i < this.events.length; i++) {
            var event = this.events[i].event;
            stats.eventsByType[event] = (stats.eventsByType[event] || 0) + 1;
        }
        return stats;
    }
}

var eventBus = new EventBus();
window.eventBus = eventBus;

console.log('✅ VIGORRE ONE™ - Event Bus carregado com sucesso!');
console.log('📡 Eventos disponíveis:', Object.keys(EVENT_BUS_CONFIG.eventTypes).length);
