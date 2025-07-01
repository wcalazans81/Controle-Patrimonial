document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", function (e) {
    const isInput = document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";
    if (e.key === "Enter" && isInput) {
      // Mostra o modal se estiver focado em input ou textarea
      const modal = new bootstrap.Modal(document.getElementById('enterActionModal'));
      modal.show();
    }
  });

  // Entrar: simula botão de submit visível (de login)
  document.getElementById("btnModalEntrar").addEventListener("click", () => {
    const btn = document.querySelector('button[type="submit"].btn-primary');
    if (btn) btn.click();
  });

  // Cadastrar: redireciona para rota de cadastro
  document.getElementById("btnModalCadastrar").addEventListener("click", () => {
    window.location.href = "/register";
  });

  // Recuperar senha: redireciona
  document.getElementById("btnModalRecuperar").addEventListener("click", () => {
    window.location.href = "/recuperar";
  });
});


/*document.addEventListener('DOMContentLoaded', () => {
  // Campo: Senha
  const toggleSenha = document.querySelector('#toggleSenha');
  const senhaInput = document.querySelector('#senhaInput');
  const iconeSenha = document.querySelector('#iconeSenha');

  if (toggleSenha && senhaInput && iconeSenha) {
    console.log('Toggle Senha clicado');
    toggleSenha.addEventListener('click', () => {
      const isPassword = senhaInput.type === 'password';
      senhaInput.type = isPassword ? 'text' : 'password';
      iconeSenha.classList.toggle('bi-eye', !isPassword);
      iconeSenha.classList.toggle('bi-eye-slash', isPassword);
    });
  }

  // Campo: Confirmar Senha
  const toggleConfirmarSenha = document.querySelector('#toggleConfirmarSenha');
  const confirmarSenhaInput = document.querySelector('#confirmarSenha');
  const iconeConfirmarSenha = document.querySelector('#iconeConfirmarSenha');

  if (toggleConfirmarSenha && confirmarSenhaInput && iconeConfirmarSenha) {
    toggleConfirmarSenha.addEventListener('click', () => {
      console.log('Toggle Confirmar Senha clicado');
      const isPassword = confirmarSenhaInput.type === 'password';
      confirmarSenhaInput.type = isPassword ? 'text' : 'password';
      iconeConfirmarSenha.classList.toggle('bi-eye', !isPassword);
      iconeConfirmarSenha.classList.toggle('bi-eye-slash', isPassword);
    });
  }
});*/

