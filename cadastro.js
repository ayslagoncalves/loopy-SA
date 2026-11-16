/* =========================================================
   Loopy · cadastro.js
   Validação do formulário de cadastro e persistência em
   localStorage.
   ========================================================= */
(function () {
  'use strict';

  // Para onde ir depois do cadastro (conforme o fluxo do projeto)
  var PROXIMA_PAGINA = 'descobrir.html';

  var form = document.getElementById('formCadastro');
  var campoNome = document.getElementById('nome');
  var campoEmail = document.getElementById('email');
  var campoSenha = document.getElementById('senha');
  var campoNasc = document.getElementById('nascimento');
  var erroNasc = document.getElementById('erroNascimento');

  // Não permite escolher datas futuras no calendário
  campoNasc.max = new Date().toISOString().split('T')[0];

  /** Marca/desmarca o campo como inválido */
  function marcar(campo, valido) {
    campo.classList.toggle('is-invalid', !valido);
    return valido;
  }

  /** Calcula a idade (em anos completos) a partir de "AAAA-MM-DD" */
  function calcularIdade(isoData) {
    var partes = isoData.split('-').map(Number);
    var hoje = new Date();
    var idade = hoje.getFullYear() - partes[0];
    var fezAniversario =
      hoje.getMonth() + 1 > partes[1] ||
      (hoje.getMonth() + 1 === partes[1] && hoje.getDate() >= partes[2]);
    return fezAniversario ? idade : idade - 1;
  }

  /* ---------- Validações individuais ---------- */
  function validarNome() {
    return marcar(campoNome, campoNome.value.trim().length >= 2);
  }

  function validarEmail() {
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campoEmail.value.trim());
    return marcar(campoEmail, ok);
  }

  function validarSenha() {
    return marcar(campoSenha, campoSenha.value.length >= 8);
  }

  function validarNascimento() {
    var valor = campoNasc.value;
    if (!valor) {
      erroNasc.textContent = 'Informe sua data de nascimento.';
      return marcar(campoNasc, false);
    }
    var idade = calcularIdade(valor);
    if (idade < 18) {
      erroNasc.textContent = 'Você precisa ter 18 anos ou mais para criar uma conta.';
      return marcar(campoNasc, false);
    }
    if (idade > 120) {
      erroNasc.textContent = 'Informe uma data de nascimento válida.';
      return marcar(campoNasc, false);
    }
    return marcar(campoNasc, true);
  }

  // Limpa o erro assim que a pessoa volta a digitar
  [
    [campoNome, validarNome],
    [campoEmail, validarEmail],
    [campoSenha, validarSenha],
    [campoNasc, validarNascimento]
  ].forEach(function (par) {
    par[0].addEventListener('input', function () {
      if (par[0].classList.contains('is-invalid')) par[1]();
    });
  });

  /* ---------- Envio ---------- */
  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    // Executa todas as validações (sem curto-circuito) para exibir todos os erros
    var resultados = [validarNome(), validarEmail(), validarSenha(), validarNascimento()];
    if (resultados.indexOf(false) !== -1) {
      var primeiroErro = form.querySelector('.is-invalid');
      if (primeiroErro) primeiroErro.focus();
      return;
    }

    var genero = form.querySelector('input[name="genero"]:checked');

    // Guarda o usuário (apenas para o protótipo; senha nunca deve ser salva assim em produção)
    var usuario = {
      nome: campoNome.value.trim(),
      email: campoEmail.value.trim().toLowerCase(),
      senha: campoSenha.value,
      nascimento: campoNasc.value,
      genero: genero ? genero.value : 'Outro'
    };

    try {
      localStorage.setItem('loopy:usuario', JSON.stringify(usuario));
      localStorage.setItem('loopy:logado', 'true');
    } catch (e) {
      /* localStorage indisponível: segue o fluxo mesmo assim */
    }

    window.location.href = PROXIMA_PAGINA;
  });
})();