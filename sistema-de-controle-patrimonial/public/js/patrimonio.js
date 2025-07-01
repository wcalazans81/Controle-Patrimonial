document.addEventListener('DOMContentLoaded', function () {
    const linksProtegidos = document.querySelectorAll('.restriPatrimonio');
    const modal = new bootstrap.Modal(document.getElementById('senhaModal'));
    const senhaInput = document.getElementById('senhaInput');
    const senhaOk = document.getElementById('senhaOk');
    const toggleSenha = document.getElementById('toggleSenha');
    const iconeSenha = document.getElementById('iconeSenha');

    let senhaEsperada = '';
    let destino = '';

    // Mostrar/ocultar senha
    toggleSenha.addEventListener('click', () => {
        const tipoAtual = senhaInput.getAttribute('type');
        senhaInput.setAttribute('type', tipoAtual === 'password' ? 'text' : 'password');
        iconeSenha.classList.toggle('bi-eye');
        iconeSenha.classList.toggle('bi-eye-slash');
    });

    // Ao clicar em link protegido
    linksProtegidos.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            senhaEsperada = this.dataset.senha;
            destino = this.href;
            senhaInput.value = '';
            modal.show();
            setTimeout(() => senhaInput.focus(), 300);
        });
    });
    // ✅ Garante o foco quando o modal aparece
    document.getElementById('senhaModal').addEventListener('shown.bs.modal', () => {
        senhaInput.focus();
    });

    // Validar senha
    senhaOk.addEventListener('click', () => {
        const digitada = senhaInput.value;
        if (digitada === senhaEsperada) {
            modal.hide();
            window.location.href = destino;
        } else {
            alert('Senha incorreta!');
            senhaInput.value = '';
            senhaInput.focus();
        }
    });
      // ✅ Pressionar Enter também valida a senha
    senhaInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            senhaOk.click(); // Simula clique no botão OK
        }
    });
});

