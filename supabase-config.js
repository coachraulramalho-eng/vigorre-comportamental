/**
 * ============================================
 * VIGORRE ONE™ - SUPABASE CONFIG
 * ============================================
 * 
 * Configuração do cliente Supabase
 * ============================================
 */

var SUPABASE_CONFIG = {
    url: 'https://dfthdcnaqmqswidwgezj.supabase.co',
    anonKey: 'sb_publishable_bcLZGSu_wLmhcNOQmY3TLQ_yp3CHiZo',
    bucket: 'vigorre-files',
    tables: {
        users: 'users',
        companies: 'companies',
        recruiters: 'recruiters',
        participants: 'participants',
        tests: 'tests',
        reports: 'reports',
        laudos: 'laudos',
        credits: 'credits',
        transactions: 'transactions',
        audits: 'audits',
        jobProfiles: 'job_profiles'
    }
};

var supabaseInstance = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseInstance = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('✅ Supabase inicializado com sucesso!');
        return supabaseInstance;
    } else {
        console.warn('⚠️ Supabase não disponível (modo offline)');
        return null;
    }
}

var VigorreDB = {
    _data: {},

    get: function(key, defaultValue) {
        defaultValue = defaultValue || [];
        try {
            var data = localStorage.getItem('vigorre_' + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    set: function(key, value) {
        try {
            localStorage.setItem('vigorre_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    users: {
        get: function() { return VigorreDB.get('users', []); },
        set: function(data) { return VigorreDB.set('users', data); },
        find: function(id) {
            var users = this.get();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === id) return users[i];
            }
            return null;
        },
        findByEmail: function(email) {
            var users = this.get();
            for (var i = 0; i < users.length; i++) {
                if (users[i].email === email) return users[i];
            }
            return null;
        }
    },

    companies: {
        get: function() { return VigorreDB.get('companies', []); },
        set: function(data) { return VigorreDB.set('companies', data); },
        find: function(id) {
            var companies = this.get();
            for (var i = 0; i < companies.length; i++) {
                if (companies[i].id === id) return companies[i];
            }
            return null;
        }
    },

    participants: {
        get: function() { return VigorreDB.get('participants', []); },
        set: function(data) { return VigorreDB.set('participants', data); },
        find: function(id) {
            var participants = this.get();
            for (var i = 0; i < participants.length; i++) {
                if (participants[i].id === id) return participants[i];
            }
            return null;
        }
    },

    reports: {
        get: function() { return VigorreDB.get('reports', []); },
        set: function(data) { return VigorreDB.set('reports', data); },
        find: function(id) {
            var reports = this.get();
            for (var i = 0; i < reports.length; i++) {
                if (reports[i].id === id) return reports[i];
            }
            return null;
        }
    },

    laudos: {
        get: function() { return VigorreDB.get('laudos', []); },
        set: function(data) { return VigorreDB.set('laudos', data); },
        find: function(id) {
            var laudos = this.get();
            for (var i = 0; i < laudos.length; i++) {
                if (laudos[i].id === id) return laudos[i];
            }
            return null;
        }
    },

    credits: {
        get: function() { return VigorreDB.get('credits', []); },
        set: function(data) { return VigorreDB.set('credits', data); },
        find: function(id) {
            var credits = this.get();
            for (var i = 0; i < credits.length; i++) {
                if (credits[i].id === id) return credits[i];
            }
            return null;
        }
    },

    transactions: {
        get: function() { return VigorreDB.get('transactions', []); },
        set: function(data) { return VigorreDB.set('transactions', data); },
        find: function(id) {
            var transactions = this.get();
            for (var i = 0; i < transactions.length; i++) {
                if (transactions[i].id === id) return transactions[i];
            }
            return null;
        }
    },

    audits: {
        get: function() { return VigorreDB.get('audit_logs', []); },
        set: function(data) { return VigorreDB.set('audit_logs', data); },
        add: function(entry) {
            var logs = this.get();
            var newEntry = {
                id: 'aud_' + Date.now(),
                timestamp: new Date().toISOString()
            };
            for (var key in entry) {
                if (entry.hasOwnProperty(key)) {
                    newEntry[key] = entry[key];
                }
            }
            logs.push(newEntry);
            this.set(logs);
            return logs;
        }
    },

    jobProfiles: {
        get: function() { return VigorreDB.get('job_profiles', []); },
        set: function(data) { return VigorreDB.set('job_profiles', data); },
        find: function(id) {
            var profiles = this.get();
            for (var i = 0; i < profiles.length; i++) {
                if (profiles[i].id === id) return profiles[i];
            }
            return null;
        }
    },

    initSampleData: function() {
        var users = this.users.get();
        if (users.length === 0) {
            console.log('📦 Inicializando dados de exemplo...');
            this.users.set([
                {
                    id: 'usr_001',
                    name: 'Administrador Master',
                    email: 'master@vigorre.com',
                    password: 'adminvigor10',
                    role: 'master',
                    status: 'active',
                    phone: '(34) 99185-0735',
                    companyId: null,
                    credits: { DISC: 9999, IE: 9999, Valores: 9999, SWOT: 9999, BigFive: 9999, Laudo: 9999 },
                    permissions: ['*'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'usr_002',
                    name: 'Admin Staff',
                    email: 'admin@vigorre.com',
                    password: 'adminvigor10',
                    role: 'admin',
                    status: 'active',
                    phone: '(34) 99185-0736',
                    companyId: null,
                    credits: { DISC: 500, IE: 500, Valores: 500, SWOT: 500, BigFive: 500, Laudo: 100 },
                    permissions: ['admin.dashboard', 'admin.empresas', 'admin.recrutadores', 'admin.participantes'],
                    createdAt: '2024-01-15T00:00:00Z',
                    updatedAt: '2024-01-15T00:00:00Z'
                },
                {
                    id: 'usr_003',
                    name: 'João Silva',
                    email: 'recrutador@teste.com',
                    password: 'rec123',
                    role: 'recruiter',
                    status: 'active',
                    phone: '(11) 99999-9999',
                    companyId: 'comp_001',
                    credits: { DISC: 50, IE: 30, Valores: 20, SWOT: 15, BigFive: 10, Laudo: 5 },
                    permissions: ['recruiter.dashboard', 'recruiter.participantes', 'recruiter.creditos', 'recruiter.relatorios'],
                    createdAt: '2024-02-01T00:00:00Z',
                    updatedAt: '2024-02-01T00:00:00Z'
                },
                {
                    id: 'usr_004',
                    name: 'Ana Silva',
                    email: 'participante@teste.com',
                    password: 'part123',
                    role: 'participant',
                    status: 'active',
                    phone: '(11) 88888-8888',
                    companyId: 'comp_001',
                    credits: { DISC: 0, IE: 0, Valores: 0, SWOT: 0, BigFive: 0, Laudo: 0 },
                    permissions: ['participant.dashboard', 'participant.testes', 'participant.resultados'],
                    createdAt: '2024-03-01T00:00:00Z',
                    updatedAt: '2024-03-01T00:00:00Z'
                }
            ]);
            this.companies.set([
                {
                    id: 'comp_001',
                    name: 'TechCorp Solutions',
                    fantasy: 'TechCorp',
                    cnpj: '12.345.678/0001-90',
                    status: 'active',
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'comp_002',
                    name: 'InovaLab Brasil',
                    fantasy: 'InovaLab',
                    cnpj: '98.765.432/0001-10',
                    status: 'active',
                    createdAt: '2024-01-15T00:00:00Z'
                }
            ]);
            this.participants.set([
                {
                    id: 'part_001',
                    name: 'Ana Silva',
                    email: 'ana@techcorp.com',
                    companyId: 'comp_001',
                    status: 'active',
                    tests: ['DISC', 'BigFive', 'IE'],
                    completedTests: ['DISC'],
                    createdAt: '2024-03-01T00:00:00Z'
                },
                {
                    id: 'part_002',
                    name: 'Carlos Souza',
                    email: 'carlos@techcorp.com',
                    companyId: 'comp_001',
                    status: 'pending',
                    tests: ['DISC', 'IE'],
                    completedTests: [],
                    createdAt: '2024-03-10T00:00:00Z'
                }
            ]);
            this.credits.set([
                {
                    id: 'crd_001',
                    type: 'DISC',
                    status: 'available',
                    ownerId: 'usr_003',
                    ownerType: 'recruiter',
                    quantity: 50,
                    price: 49.90,
                    expiresAt: '2025-12-31T23:59:59Z',
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]);
            console.log('✅ Dados de exemplo inicializados com sucesso!');
        }
    }
};

var supabaseClient = initSupabase();

VigorreDB.initSampleData();

window.VigorreDB = VigorreDB;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.supabaseClient = supabaseClient;

console.log('📦 VigorreDB carregado com sucesso!');
console.log('👤 Usuários: ' + VigorreDB.users.get().length);
console.log('🏢 Empresas: ' + VigorreDB.companies.get().length);
console.log('👥 Participantes: ' + VigorreDB.participants.get().length);
console.log('💳 Créditos: ' + VigorreDB.credits.get().length);
