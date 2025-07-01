document.addEventListener("DOMContentLoaded", function () {
    const formPatrimonio = document.getElementById("formPatrimonio");
    const btnSalvar = document.getElementById("salvar_10");

    btnSalvar.addEventListener("click", function (event) {
        event.preventDefault(); // Impede o envio padrão para verificar os dados antes
        if (formPatrimonio.checkValidity()) { // Verifica se todos os campos obrigatórios estão preenchidos
            formPatrimonio.submit(); // Envia o formulário
        } else {
            alert("Por favor, preencha todos os campos obrigatórios antes de salvar.");
        }
    });
});
