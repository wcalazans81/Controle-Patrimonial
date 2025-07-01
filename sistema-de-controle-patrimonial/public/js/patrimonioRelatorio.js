document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript carregado!");
    const btnMostrarBusca = document.getElementById("btnMostrarBusca_13");
    const campoBusca = document.getElementById("campoBusca_13");
    const btnBuscar = document.getElementById("btnBuscarPatrimonio_13");
       if (!btnMostrarBusca || !campoBusca || !btnBuscar) {
        console.error("Elementos de busca não encontrados!");
        return;
    }
    const btnFiltrar = document.getElementById("buscar_13");
    const btnLimpar = document.getElementById("limpar13");

    // Inicialmente esconde o input e botão buscar
    campoBusca.style.display = "none";
    btnBuscar.style.display = "none";

    // Ao clicar na lupa: mostra o campo de busca e botão buscar
    btnMostrarBusca.addEventListener("click", () => {
        console.log("Lupa clicada!");
        campoBusca.style.display = "block";
        btnBuscar.style.display = "inline-block";
        campoBusca.focus();
    });

    // Ao clicar no botão "Buscar"
    btnBuscar.addEventListener("click", () => {
        const termoBusca = campoBusca.value.trim().toLowerCase();

        if (termoBusca) {
            const cards = document.querySelectorAll(".card");
            let encontrado = false;

            cards.forEach(card => {
                const textoCompleto = card.innerText.toLowerCase();
                const contemTermo = textoCompleto.includes(termoBusca);

                card.classList.remove("border-success", "border-3");

                if (contemTermo) {
                    const npatrimonio = textoCompleto.includes("n° do patrimônio:") && textoCompleto.includes(termoBusca);
                    const descricao = textoCompleto.includes("descrição:") && textoCompleto.includes(termoBusca);

                    if (npatrimonio || descricao) {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                        card.classList.add("border", "border-success", "border-3");
                        encontrado = true;
                    }
                }
            });

            if (!encontrado) {
                alert("Patrimônio não encontrado.");
            }
        }

        // Limpa e esconde campo e botão buscar
        campoBusca.value = '';
        campoBusca.style.display = 'none';
        btnBuscar.style.display = 'none';
    });


    btnFiltrar.addEventListener("click", () => {
        const empresa = document.querySelector("input[name='empresaA']:checked").value;
        const destino = document.querySelector("input[name='destinoA']:checked").value;

        fetch(`/patrimonioRelatorio/filtro?empresa=${empresa}&destino=${destino}`)
            .then((res) => res.json())
            .then((data) => {
                mostrarResultados(data);
            });
    });

    btnLimpar.addEventListener("click", () => {
        document.getElementById("listaPatrimonios").innerHTML = "";
    });

});

function mostrarResultados(patrimonios) {
    const lista = document.getElementById("listaPatrimonios");
    lista.innerHTML = "";

    if (!patrimonios.length) {
        lista.innerHTML = "<p>Nenhum patrimônio encontrado.</p>";
        return;
    }

    patrimonios.forEach((patrimonio) => {
        const col = document.createElement("div");
        col.classList.add("col-12", "col-sm-10", "col-md-6", "col-lg-4", "mx-auto", "mb-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100", "w-auto", "shadow-sm", "border-0", "rounded-4", "bg-light");

        const dataFormatada = new Date(patrimonio.dataA).toLocaleDateString("pt-BR");

        card.innerHTML = `
            <div class="card-body p-3" >
                <p><strong>Andar:</strong> ${patrimonio.andarA}</p>
                <p><strong>N° do Patrimônio:</strong> ${patrimonio.NpatrimonioA}</p>
                <p><strong>Empresa:</strong> ${patrimonio.empresaA}</p>
                <p><strong>Nome:</strong> ${patrimonio.nomeA}</p>
                <p><strong>Setor:</strong> ${patrimonio.setorA}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Descrição:</strong> ${patrimonio.descricaoA}</p>
                <p><strong>Destino:</strong> ${patrimonio.destinoA}</p>
            </div>
        `;

        col.appendChild(card);
        lista.appendChild(col);
    });
}

function salvarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Captura título do relatório
    const titulo = document.getElementById("t1");
    if (titulo) {
        doc.setFontSize(18);
        doc.text(titulo.innerText, 10, 10);
    }

    // Captura subtítulo
    const subtitulo = document.getElementById("t2");
    if (subtitulo) {
        doc.setFontSize(14);
        doc.text(subtitulo.innerText, 10, 20);
    }

    // Captura os cards gerados dinamicamente
    const cards = document.querySelectorAll(".card-body");
    let y = 30; // Posição inicial no PDF

    cards.forEach((card) => {
        const textos = card.querySelectorAll("p");

        textos.forEach((p) => {
            doc.setFontSize(12);
            doc.text(p.innerText, 10, y);
            y += 8;
        });

        y += 10; // Adiciona espaço entre os cards
    });

    // Abre o PDF em uma nova aba
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
}
