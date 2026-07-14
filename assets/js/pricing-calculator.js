/**
 * ============================================
 * VIGORRE ONE™ - PRICING CALCULATOR
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * CALCULADORA DE ROI:
 * - Cálculo de custo de contratação errada
 * - Economia com People Analytics
 * - Retorno sobre investimento
 * - Comparação de cenários
 * - Geração de relatório
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const PRICING_CONFIG = {
    // Custos médios (em R$)
    costs: {
        averageSalary: 5000, // Salário médio mensal
        hiringCost: 8000, // Custo de recrutamento e seleção
        trainingCost: 3000, // Custo de treinamento inicial
        turnoverCost: 15000, // Custo de turnover (substituição)
        lostProductivity: 20000, // Perda de produtividade anual
        talentLoss: 50000 // Perda de talento estratégico
    },
    
    // Taxas médias
    rates: {
        averageTurnover: 0.25, // 25% turnover anual
        hiringErrorRate: 0.30, // 30% de contratações erradas
        retentionImprovement: 0.15, // 15% melhora na retenção
        productivityImprovement: 0.20 // 20% melhora na produtividade
    }
};

// ============================================
// CLASSE PRICING CALCULATOR
// ============================================
class PricingCalculator {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = PRICING_CONFIG;
        this.results = null;
        this.init();
    }

    // ============================================
    // INICIALIZAR
    // ============================================
    init() {
        console.log('🧮 Calculadora de ROI inicializada');
        
        // Criar container da calculadora
        this.createCalculator();
    }

    // ============================================
    // CRIAR CALCULADORA
    // ============================================
    createCalculator() {
        var container = document.createElement('div');
        container.className = 'calculator-container';
        container.id = 'roi-calculator';
        container.innerHTML = `
            <div class="calculator-card glass">
                <h3>💰 Calcule seu ROI</h3>
                <p>Descubra quanto sua empresa pode economizar com People Analytics</p>
                
                <div class="calculator-form">
                    <div class="form-group">
                        <label>Número de colaboradores</label>
                        <input type="number" id="calcEmployees" value="50" min="1" max="10000" />
                    </div>
                    <div class="form-group">
                        <label>Turnover anual (%)</label>
                        <input type="number" id="calcTurnover" value="25" min="0" max="100" />
                    </div>
                    <div class="form-group">
                        <label>Salário médio (R$)</label>
                        <input type="number" id="calcSalary" value="5000" min="1000" step="100" />
                    </div>
                    <button class="btn btn-gold btn-block" onclick="pricingCalculator.calculate()">
                        Calcular Economia
                    </button>
                </div>
                
                <div class="calculator-results" id="calculatorResults" style="display:none;">
                    <div class="result-grid">
                        <div class="result-item">
                            <span class="result-label">Custo anual de turnover</span>
                            <span class="result-value" id="resultTurnoverCost">R$ 0</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Economia com retenção</span>
                            <span class="result-value highlight" id="resultRetentionSaving">R$ 0</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Economia com produtividade</span>
                            <span class="result-value highlight" id="resultProductivitySaving">R$ 0</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Economia total</span>
                            <span class="result-value premium" id="resultTotalSaving">R$ 0</span>
                        </div>
                    </div>
                    <div class="result-cta">
                        <p>Com a Vigorre One™, você pode economizar até <strong id="resultPercentage">0%</strong> dos custos com pessoas.</p>
                        <a href="#ofertas" class="btn btn-gold">Começar agora</a>
                    </div>
                </div>
            </div>
        `;
        
        // Inserir após a seção de dor
        var painSection = document.getElementById('pain');
        if (painSection) {
            painSection.parentNode.insertBefore(container, painSection.nextSibling);
        }
    }

    // ============================================
    // CALCULAR ROI
    // ============================================
    calculate() {
        var employees = parseInt(document.getElementById('calcEmployees').value) || 50;
        var turnoverRate = parseInt(document.getElementById('calcTurnover').value) / 100 || 0.25;
        var salary = parseInt(document.getElementById('calcSalary').value) || 5000;
        
        // Cálculos
        var annualSalary = salary * 13; // 13º salário
        var turnoverCost = employees * turnoverRate * (annualSalary * 0.5 + 5000);
        var retentionImprovement = turnoverCost * 0.25; // 25% melhora
        var productivityImprovement = (employees * annualSalary) * 0.15; // 15% melhora
        var totalSaving = retentionImprovement + productivityImprovement;
        var percentage = Math.round((totalSaving / (employees * annualSalary)) * 100);
        
        // Atualizar resultados
        document.getElementById('resultTurnoverCost').textContent = 
            'R$ ' + turnoverCost.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        
        document.getElementById('resultRetentionSaving').textContent = 
            'R$ ' + retentionImprovement.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        
        document.getElementById('resultProductivitySaving').textContent = 
            'R$ ' + productivityImprovement.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        
        document.getElementById('resultTotalSaving').textContent = 
            'R$ ' + totalSaving.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        
        document.getElementById('resultPercentage').textContent = percentage + '%';
        
        // Mostrar resultados
        document.getElementById('calculatorResults').style.display = 'block';
        
        // Animar números
        this.animateResults();
        
        // Track evento
        if (window.landingIntegration) {
            window.landingIntegration._trackEvent('roi_calculated', {
                employees: employees,
                turnoverRate: turnoverRate,
                salary: salary,
                totalSaving: totalSaving,
                percentage: percentage
            });
        }
    }

    // ============================================
    // ANIMAR RESULTADOS
    // ============================================
    animateResults() {
        var values = document.querySelectorAll('.result-value');
        values.forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(10px)';
            
            setTimeout(function() {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 300);
        });
    }
}

// ============================================
// EXPORTAR
// ============================================
var pricingCalculator = new PricingCalculator();
window.pricingCalculator = pricingCalculator;

console.log('✅ VIGORRE ONE™ - Pricing Calculator carregado com sucesso!');
