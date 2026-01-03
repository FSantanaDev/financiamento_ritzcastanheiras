document.addEventListener('DOMContentLoaded', function() {
    
    // --- Configuração do WhatsApp Float ---
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const phoneNumber = '5592999889392'; 
    const message = encodeURIComponent('Olá! Gostaria de mais informações sobre a documentação para crédito imobiliário.');

    if (whatsappBtn) {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        whatsappBtn.href = whatsappUrl;
    }

    // --- Alternar Informações SAC / Price ---
    const selectSistema = document.getElementById('sistema-amortizacao');
    const infoSac = document.getElementById('info-sac');
    const infoPrice = document.getElementById('info-price');

    if (selectSistema) {
        selectSistema.addEventListener('change', function() {
            if (this.value === 'sac') {
                infoSac.classList.remove('hidden');
                infoPrice.classList.add('hidden');
            } else {
                infoSac.classList.add('hidden');
                infoPrice.classList.remove('hidden');
            }
        });
    }

    // --- Máscaras de Input (Moeda) ---
    const currencyInputs = [document.getElementById('valor-imovel'), document.getElementById('valor-entrada')];

    currencyInputs.forEach(input => {
        if (!input) return;
        
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = (value / 100).toFixed(2) + '';
            value = value.replace('.', ',');
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            e.target.value = value === '0,00' ? '' : 'R$ ' + value;
        });
    });

    // --- Lógica do Simulador (SAC e Price) ---
    const formSimulator = document.getElementById('simulator-form');
    const resultBox = document.getElementById('result-box');
    const whatsappSimBtn = document.getElementById('whatsapp-sim-btn');

    if (formSimulator) {
        formSimulator.addEventListener('submit', function(e) {
            e.preventDefault();

            // 1. Obter valores
            const valorImovelStr = document.getElementById('valor-imovel').value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            const valorEntradaStr = document.getElementById('valor-entrada').value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            const prazoAnos = parseInt(document.getElementById('prazo-anos').value);
            const sistema = document.getElementById('sistema-amortizacao').value;

            const valorImovel = parseFloat(valorImovelStr) || 0;
            const valorEntrada = parseFloat(valorEntradaStr) || 0;
            const prazoMeses = prazoAnos * 12;
            const taxaJurosAnual = 0.105; // 10.5% a.a. (Exemplo)
            const taxaJurosMensal = taxaJurosAnual / 12;

            // 2. Validações básicas
            if (valorImovel <= 0) {
                alert('Por favor, insira um valor de imóvel válido.');
                return;
            }
            if (valorEntrada >= valorImovel) {
                alert('O valor da entrada deve ser menor que o valor do imóvel.');
                return;
            }

            const valorFinanciado = valorImovel - valorEntrada;
            let primeiraParcela = 0;
            let ultimaParcela = 0;
            let sistemaTexto = '';

            // 3. Cálculos
            if (sistema === 'sac') {
                sistemaTexto = 'SAC';
                // Amortização constante = (Valor Financiado) / Prazo
                const amortizacao = valorFinanciado / prazoMeses;

                // 1ª Parcela = Amortização + Juros sobre saldo devedor total
                const jurosPrimeira = valorFinanciado * taxaJurosMensal;
                primeiraParcela = amortizacao + jurosPrimeira;

                // Última Parcela = Amortização + Juros sobre 1 amortização (aprox)
                const jurosUltima = amortizacao * taxaJurosMensal;
                ultimaParcela = amortizacao + jurosUltima;

                // Exibir linha da última parcela
                document.getElementById('res-ultima').parentElement.style.display = 'flex';
                document.getElementById('res-primeira').previousElementSibling.innerText = '1ª Parcela (Estimada):';

            } else {
                sistemaTexto = 'Price';
                // Fórmula Price: PMT = PV * [ i * (1+i)^n ] / [ (1+i)^n - 1 ]
                const numerador = taxaJurosMensal * Math.pow(1 + taxaJurosMensal, prazoMeses);
                const denominador = Math.pow(1 + taxaJurosMensal, prazoMeses) - 1;
                
                primeiraParcela = valorFinanciado * (numerador / denominador);
                ultimaParcela = primeiraParcela; // Na Price é fixa

                // Ocultar linha da última parcela (pois é igual)
                document.getElementById('res-ultima').parentElement.style.display = 'none';
                document.getElementById('res-primeira').previousElementSibling.innerText = 'Parcela Mensal (Fixa):';
            }

            // 4. Exibir Resultados
            document.getElementById('res-financiado').innerText = formatCurrency(valorFinanciado);
            document.getElementById('res-primeira').innerText = formatCurrency(primeiraParcela);
            if (sistema === 'sac') {
                document.getElementById('res-ultima').innerText = formatCurrency(ultimaParcela);
            }

            // 5. Atualizar botão do WhatsApp com os dados da simulação
            let msgSimulacao = `Olá! Fiz uma simulação no site:\n` +
                `🏗️ Valor da Obra: ${formatCurrency(valorImovel)}\n` +
                `💰 Recursos Próprios: ${formatCurrency(valorEntrada)}\n` +
                `📅 Prazo: ${prazoAnos} anos\n` +
                `📊 Sistema: ${sistemaTexto}\n`;

            if (sistema === 'sac') {
                msgSimulacao += `📉 1ª Parcela: ${formatCurrency(primeiraParcela)}\n` +
                                `📉 Última Parcela: ${formatCurrency(ultimaParcela)}\n`;
            } else {
                msgSimulacao += `🔄 Parcela Fixa: ${formatCurrency(primeiraParcela)}\n`;
            }
            
            msgSimulacao += `Gostaria de saber mais detalhes!`;

            whatsappSimBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msgSimulacao)}`;

            // Mostrar caixa de resultado
            resultBox.classList.remove('hidden');
        });
    }

    // Função auxiliar para formatar moeda
    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // --- Animação de Scroll ---
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // entry.target.classList.add('fade-in'); // Se houver classe CSS
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));

    // --- Slideshow Hero ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            // Remove active da atual
            slides[currentSlide].classList.remove('active');
            
            // Próximo slide (loop)
            currentSlide = (currentSlide + 1) % slides.length;
            
            // Adiciona active na nova
            slides[currentSlide].classList.add('active');
        }, 8000); // Troca a cada 8 segundos
    }
});
