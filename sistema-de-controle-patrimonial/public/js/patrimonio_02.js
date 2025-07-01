document.addEventListener("DOMContentLoaded", function () {
    const empresasValidas = ['AFFEMG', 'FUNDAFFEMG', 'FISCO CORRETORA', 'MAIS SABOR'];

    // === EVENTO BOTÃO "salvar_02" - Envia dados via fetch ===
    const btnSalvar00 = document.getElementById("salvar_02");
    if (btnSalvar00) {
        btnSalvar00.addEventListener("click", function (event) {
            event.preventDefault();

            let andar = document.querySelector("input[name='andar_02']").value.trim().toUpperCase();
            let patrimonio = document.querySelector("input[name='patrimonio_02']").value.trim().toUpperCase();
            let empresa = document.querySelector("input[name='empresa_02']").value.trim().toUpperCase();
            let nome = document.querySelector("input[name='nome_02']").value.trim().toUpperCase();
            let setor = document.querySelector("input[name='setor_02']").value.trim().toUpperCase();
            let descricao = document.querySelector("input[name='descricao_02']").value.trim().toUpperCase();
            let destino = document.querySelector("input[name='destino_02']:checked");

            if (!empresasValidas.includes(empresa)) {
                alert("Erro! A empresa deve ser AFFEMG, FUNDAFFEMG, FISCO CORRETORA ou MAIS SABOR.");
                return;
            }

            if (!andar || !patrimonio || !empresa || !nome || !setor || !descricao || !destino) {
                alert("Erro! Todos os campos devem ser preenchidos.");
                return;
            }

            destino = destino.value.toUpperCase();

            let dados = {
                andar_02: andar,
                Npatrimonio_02: patrimonio,
                empresa_02: empresa,
                nome_02: nome,
                setor_02: setor,
                descricao_02: descricao,
                destino_02: destino
            };

            const cards = document.querySelectorAll(".card");
            let patrimonioDuplicado = false;

            cards.forEach(card => {
                const textoCard = card.querySelector(".texto").innerText.toUpperCase();
                if (textoCard.includes(patrimonio)) {
                    patrimonioDuplicado = true;
                }
            });

            if (patrimonioDuplicado) {
                alert("Erro! Este número de patrimônio já está cadastrado.");
                return;
            }

            fetch("/cadastrar_02", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.sucesso) {
                        alert("Pedido salvo com sucesso!");
                        window.location.reload();
                    } else {
                        alert("Erro ao salvar os dados.");
                    }
                })
                .catch(error => {
                    console.error("Erro:", error);
                    alert("Erro ao salvar os dados.");
                });
        });
    }

    // === FUNÇÕES DE BUSCA NO CARD DE PATRIMÔNIO ===
    const btnMostrarBusca = document.getElementById("btnMostrarBusca_02");
    const campoBusca = document.getElementById("campoBusca_02");
    const btnBuscar = document.getElementById("btnBuscarPatrimonio_02");

    if (btnMostrarBusca && campoBusca && btnBuscar) {
        campoBusca.classList.add("d-none");
        btnBuscar.classList.add("d-none");

        btnMostrarBusca.addEventListener("click", function () {
            campoBusca.classList.toggle("d-none");
            btnBuscar.classList.toggle("d-none");
            campoBusca.focus();
        });

        btnBuscar.addEventListener("click", function () {
            const valorBusca = campoBusca.value.trim();
            if (!valorBusca) {
                alert("Digite um número de patrimônio para buscar.");
                return;
            }

            const cards = document.querySelectorAll(".card");
            let encontrado = false;

            cards.forEach(card => {
                const texto = card.querySelector(".texto").innerText.toUpperCase();
                if (texto.includes(valorBusca.toUpperCase())) {
                    card.scrollIntoView({ behavior: "smooth", block: "center" });
                    card.classList.add("border", "border-success", "border-3");
                    encontrado = true;
                } else {
                    card.classList.remove("border-success", "border-3");
                }
            });

            if (!encontrado) {
                alert("Patrimônio não encontrado.");
            }

            campoBusca.value = "";
            campoBusca.classList.add("d-none");
            btnBuscar.classList.add("d-none");
        });
    }

    // === DESTACAR "USO INDEFINIDO" COM BORDA VERMELHA SE MÊS ATUAL >= OUTUBRO, UMA VEZ POR ANO ===
    const cards = document.querySelectorAll(".card");

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    cards.forEach((card, index) => {
        const destinoTexto = card.querySelector(".texto").innerText.toUpperCase();
        const destinoIndefinido = destinoTexto.includes("USO INDEFINIDO");
        const keyCard = `cardIndefinidoOculto_${index}_${anoAtual}`;

        const jaClicadoEsteAno = localStorage.getItem(keyCard) === "true";

        if (destinoIndefinido && mesAtual >= 10 && !jaClicadoEsteAno) {
            card.style.border = "10px solid red";

            card.addEventListener("click", () => {
                card.style.border = "none";
                localStorage.setItem(keyCard, "true");
            }, { once: true });
        }
    });

     // === BOTÃO PARA SALVAR EM PDF ===
const btnSalvarPdf = document.getElementById("btnSalvarPdf_02");
if (btnSalvarPdf) {
    btnSalvarPdf.addEventListener("click", () => {
        // Criação do conteúdo para o PDF
        const titulo = document.querySelector("h1")?.innerText || "Relatório de Patrimônio";
        const data = new Date().toLocaleDateString("pt-BR");

        // Cria uma tabela com os dados dos cards
        const cards = document.querySelectorAll(".card");
        let tabelaHTML = `
            <h1>${titulo}</h1>
            <h3>${data}</h3>
            <table border="1" cellpadding="10" cellspacing="0" style="width:100%; border-collapse:collapse">
                <thead>
                    <tr>
                        <th>Conteúdo</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cards.forEach(card => {
            const texto = card.querySelector(".texto")?.innerText || "";
            tabelaHTML += `<tr><td>${texto}</td></tr>`;
        });

        tabelaHTML += `
                </tbody>
            </table>
        `;

        const opt = {
            margin: 0.5,
            filename: `relatorio_patrimonio_${data.replace(/\//g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(tabelaHTML).set(opt).outputPdf('bloburl').then(function (pdfUrl) {
            window.open(pdfUrl, '_blank');
        });
        
    });
}
});

