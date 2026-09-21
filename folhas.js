/* ============================================================
   ESQUELETO DA FOLHA VIVA — as folhas.

   ⚠️ ESTE ARQUIVO É A CASCA. As folhas (`f01`, `f02`, …) se escrevem abaixo, e
   cada uma nasce de um VERBO impresso numa folha de papel colhida. O crivo —
   comando VERBATIM e veredito de cada uma das trinta — vai em
   `_sequencias/POTE-<assunto>.md`, e é DELE que sai o roteiro.

   ⚠️ A POSIÇÃO É A IDENTIDADE: a folha da posição 7 usa o pote `p7`, grava os
      ids `n7_*` e fala `p7enun`. Não há segunda lista para desencontrar.

   O QUE JÁ VEM PRONTO AQUI (clonar destas peças, não reescrever):
     · `faixa` · `enunciado` · `item` · `fechaItem` · `nomeSecreto`
     · `opcoes` (a fileira de escolhas, com arrastar de brinde)
     · `puxavel` (arrastar com mouse, dedo e caneta — três lições pagas dentro)
     · `gavetas` (classificar em colunas, nas duas portas)
     · `montaLigar` (ligar com linha curva)
     · o teclado (`abreCruz`/`digitaCruz`/`confereCruz`/`rolaParaCruz`)
     · navegação, boletim, relatório do professor, dossiê, retomar 55 min
   ============================================================ */

var livro = document.getElementById("livro"), PAGEL = [], TIRAS = [];
/* ⚠️⚠️ AS FOLHAS DE LIGAR SE DECLARAM AQUI, e o número errado quebra DUAS
   folhas de uma vez — medido no `_rima1`, que estava no ar: a folha que liga
   NUNCA fechava (a criança ligava tudo e continuava faltando) e a folha
   apontada por engano FECHAVA SOZINHA, sem ninguém tocar nela. São as únicas
   cujos ids não nascem de `n<pi>_`, e sim dentro do `montaLigar`
   (`l<pi>g<i>_<chave>`). Conferir com `node _qa/conta_folha.js <pasta>`. */
var LIGAR = [14];
/* a cor da faixa por BLOCO da escada, não por folha: a criança vê que o assunto
   mudou. Uma entrada por folha, de c1 a c5.
   BLOCO A (1-5) a boca abre · BLOCO B (6-8) letra não é sílaba ·
   BLOCO C (9-14) as quatro gavetas · BLOCO D (15-20) mexer nas sílabas ·
   BLOCO E (21-25) achar a sílaba · BLOCO F (26-29) contar e ouvir ·
   BLOCO G (30-32) a palavra na frase · BLOCO H (33-35) escrever e levar. */
var CORES = ["c1", "c1", "c1", "c1", "c1",
             "c2", "c2", "c2",
             "c3", "c3", "c3", "c3", "c3", "c3",
             "c4", "c4", "c4", "c4", "c4", "c4",
             "c5", "c5", "c5", "c5", "c5",
             "c1", "c1", "c1", "c1",
             "c2", "c2", "c2",
             "c3", "c3", "c3"];


function faixa(d, i, titulo){ d.appendChild(el("div", "faixa", '<div class="num">' + i + '</div><h2>' + titulo + '</h2>')); }
function aoAbrir(d, fn){ if(!d._aoAbrir) d._aoAbrir = []; d._aoAbrir.push(fn); }
/* ---------- O ALTO-FALANTE ----------
   Regra da casa: tudo o que a criança PRECISA LER tem que poder ser OUVIDO.
   O desenho do botão é CSS puro: nada de emoji (vira quadradinho nos PCs da
   escola). */
function botaoSom(rot, aoTocar, cls){
  var b = el("button", cls || "som");
  b.innerHTML = '<i class="cone"></i><i class="onda o1"></i><i class="onda o2"></i>';
  b.setAttribute("aria-label", rot || "Ouvir");
  b.onclick = function(ev){ ev.stopPropagation(); sPasso(); aoTocar(); };
  return b;
}
function enunciado(d, pi, texto, chave){
  var cx = el("div", "enunlin");
  cx.appendChild(el("div", "enun", texto));
  cx.appendChild(botaoSom("Ouvir o que a folha pede", function(){ falar(chave); }));
  d.appendChild(cx);
}
function item(n){ return el("div", "item", n ? '<span class="n">' + n + '.</span>' : ""); }
function fechaItem(d, box, id){
  if(ST.resp[id]) box.className = "item feito";
  box.setAttribute("data-qa", "item-" + id);
  d.appendChild(box);
}
/* ⚠️ A RESPOSTA NÃO PODE APARECER ANTES DE A CRIANÇA RESPONDER. A palavra não
   some: fica INVISÍVEL (`visibility`, para o espaço ficar guardado e a folha não
   pular) e aparece no instante do acerto. É o que o `_qa/resposta_impressa.py`
   mede. */
function nomeSecreto(txt, id){
  var b = el("b", "segredo" + (ST.resp[id] ? " revelado" : ""), txt);
  b.setAttribute("data-nome", id);
  return b;
}
function chaveQuadro(w){ return String(w).toLowerCase().replace(/[^a-z]/g, ""); }

/* ⚠️⚠️ TODA SÍLABA QUE A CRIANÇA TOCA FALA POR AQUI, E POR NENHUM OUTRO
   CAMINHO. O sintetizador não lê SOM, lê PALAVRA: dê "SA" a ele e ele soletra
   "esse-á" — foi isso que o Marcos ouviu em SAPO (16/set/2026). O pedaço é
   RECORTADO de dentro da gravação da palavra inteira (`silabas.json` +
   `_padrao/silabas_voz.py`, no `entregar.yml`), e o `SILMAP` diz de qual
   palavra veio cada um.
   ⚠️ Não há reserva sintetizada: faltando o recorte, o app diz a palavra
      inteira. Reserva sintetizada seria o defeito voltando calado. */
function falaDaSilaba(sb){
  return function(){ falarSilaba(null, 0, String(sb).toUpperCase()); };
}

/* ---------- fileira de opções (a peça que mais se repete) ----------
   `soltarEm` (opcional) liga o ARRASTAR: a criança pode puxar a peça até o
   alvo em vez de só tocar nela. AS DUAS PORTAS, SEMPRE — no PC da escola ela
   usa o mouse e arrastar é o gesto natural; no celular, tocar é. */
function opcoes(pai, pi, id, lista, certa, cls, falaCerto, falaDica, aoAcertar, soltarEm){
  registra(id, pi, certa);
  var box = el("div", "ops"), feito = !!ST.resp[id];
  function responde(o, b){
    if(ST.resp[id]) return;
    /* ⚠️ `fala` pode ser uma FUNÇÃO: é assim que a opção que é uma SÍLABA diz o
       PEDAÇO recortado da palavra, em vez de a voz soletrar "esse-á". */
    sPasso(); if(o.fala) (typeof o.fala === "function" ? o.fala() : falar(o.fala));
    if(o.v === certa){
      b.className = "op" + (cls ? " " + cls : "") + " certa";
      if(aoAcertar) aoAcertar(b);
      setTimeout(function(){ acertou(id, falaCerto); }, aoAcertar ? 620 : 240);
    } else {
      b.className = "op" + (cls ? " " + cls : "") + " erro";
      setTimeout(function(){ b.className = "op" + (cls ? " " + cls : ""); }, 500);
      errou(id, falaDica);
    }
  }
  lista.forEach(function(o){
    var b = el("button", "op" + (cls ? " " + cls : "") + (feito && o.v === certa ? " certa" : ""), o.rot);
    b.setAttribute("data-qa", "op-" + id + "-" + o.v);
    b.setAttribute("aria-label", o.aria || o.v);
    b.onclick = function(){ if(b._arrastou){ b._arrastou = false; return; } responde(o, b); };
    if(soltarEm) puxavel(b, soltarEm, function(){ responde(o, b); });
    /* ⚠️ O ALTO-FALANTE DA RESPOSTA, e ele é DISCRETO e vem ANTES da escolha.
       Pergunta do Marcos (20/set/2026): *"a atividade tem áudio para ajudar os
       que não sabem ler? O alto-falante discreto para clicar caso o estudante
       queira ouvir"*. A resposta era NÃO: a opção tinha `fala`, mas o motor só
       a tocava DEPOIS do clique — ou seja, a criança tinha de ESCOLHER para
       ouvir, e aí já tinha respondido. O portão `1o` media a metade errada
       (cobrava o campo `fala` existir, não a criança poder ouvir antes).
       ⚠️ Botão IRMÃO, nunca dentro do outro: botão dentro de botão é HTML
       inválido e o clique vaza para a resposta. O `botaoSom` já faz
       `stopPropagation`. */
    if(o.fala){
      var w = el("div", "opw" + (cls && cls.indexOf("frase") > -1 ? " larga" : ""));
      w.appendChild(b);
      w.appendChild(botaoSom("Ouvir esta resposta",
        (function(f){ return function(){ falar(f); }; })(o.fala), "som somop"));
      box.appendChild(w);
    } else {
      box.appendChild(b);
    }
  });
  pai.appendChild(box);
}

/* ---------- PUXAR uma peça até um alvo (mouse, dedo e caneta) ----------
   ⚠️ Pointer Events e não mouse+touch separados: no celular o navegador dispara
   eventos de mouse FANTASMA depois do toque, e foi assim que o arrastar já
   quebrou duas vezes nesta casa.
   ⚠️ E nada de `preventDefault` no início: isso mataria o toque. Só depois de o
   dedo ANDAR 8 px é que vira arrasto — antes disso continua sendo um toque
   normal e o `onclick` responde igual. */
var PUXA = null;

function puxavel(bt, alvos, aoSoltar){
  if(!alvos.push) alvos = [alvos];
  bt.style.touchAction = "none";
  bt.addEventListener("pointerdown", function(ev){
    if(ev.button && ev.button !== 0) return;
    PUXA = {bt: bt, alvos: alvos, aoSoltar: aoSoltar,
            x0: ev.clientX, y0: ev.clientY,
            lx: ev.clientX, ly: ev.clientY,
            andando: false, fantasma: null};
  });
}
/* ⚠️⚠️ TRÊS LIÇÕES PAGAS AQUI, e nenhuma delas dava erro na tela — o arrasto
   simplesmente não acontecia:
   1. ouvir o `pointermove` no PRÓPRIO botão: só o primeiro movimento chegava.
      O padrão certo é ouvir no DOCUMENTO — o dedo precisa poder SAIR de cima da
      peça, que é justamente o que ele faz ao levá-la.
   2. o navegador FUNDE os movimentos: num teste com oito passos chegou UM
      `pointermove`. Quem manda é a SOLTURA, não a contagem de movimentos.
   3. o `pointercancel` chega ANTES do `pointerup` e vem com clientX/clientY
      = 0,0 — quem usasse a coordenada dele concluiria que a criança soltou no
      canto da tela. Por isso o último ponto REAL fica guardado. */
function _puxaAnda(ev){
  var P = PUXA; if(!P) return;
  P.lx = ev.clientX; P.ly = ev.clientY;
  var dx = ev.clientX - P.x0, dy = ev.clientY - P.y0;
  if(!P.andando){
    if(dx * dx + dy * dy < 64) return;
    P.andando = true; P.bt._arrastou = true;
    var f = P.bt.cloneNode(true);
    f.className = "fantasma " + P.bt.className;
    var r = P.bt.getBoundingClientRect();
    f.style.width = r.width + "px"; f.style.height = r.height + "px";
    f._ox = r.left; f._oy = r.top;
    document.body.appendChild(f); P.fantasma = f;
    P.bt.className = P.bt.className + " puxada";
  }
  if(ev.cancelable) ev.preventDefault();
  P.fantasma.style.left = (P.fantasma._ox + dx) + "px";
  P.fantasma.style.top = (P.fantasma._oy + dy) + "px";
  P.alvos.forEach(function(a){
    a.className = a.className.replace(/ ?perto/, "") + (sobre(ev, a) ? " perto" : "");
  });
}
function _puxaSolta(ev){
  var P = PUXA; if(!P) return;
  PUXA = null;
  P.alvos.forEach(function(a){ a.className = a.className.replace(/ ?perto/, ""); });
  P.bt.className = P.bt.className.replace(/ ?puxada/, "");
  if(P.fantasma && P.fantasma.parentNode) P.fantasma.parentNode.removeChild(P.fantasma);
  var px = ev.clientX, py = ev.clientY;
  if(!px && !py){ px = P.lx; py = P.ly; }
  var onde = {clientX: px, clientY: py};
  var andou = (px - P.x0) * (px - P.x0) + (py - P.y0) * (py - P.y0) >= 64;
  if(!andou) return;
  P.bt._arrastou = true;
  var i;
  for(i = 0; i < P.alvos.length; i++){
    if(sobre(onde, P.alvos[i])){ P.aoSoltar(P.alvos[i], i); break; }
  }
  setTimeout(function(){ P.bt._arrastou = false; }, 60);
}
document.addEventListener("dragstart", function(ev){ ev.preventDefault(); });
document.addEventListener("pointermove", _puxaAnda);
document.addEventListener("pointerup", _puxaSolta);
document.addEventListener("pointercancel", _puxaSolta);
function sobre(ev, alvo){
  var r = alvo.getBoundingClientRect(), m = 14;
  return ev.clientX >= r.left - m && ev.clientX <= r.right + m &&
         ev.clientY >= r.top - m && ev.clientY <= r.bottom + m;
}

function monta(){
  livro.innerHTML = ""; PAGEL = []; RESP = {}; TIRAS = [];
  /* ⚠️ UMA ENTRADA POR FOLHA, na ordem, começando pela capa `f0`. */
  var caps = [f0, f01, f02, f03, f04, f05, f06, f07, f08, f09, f10, f11, f12,
              f13, f14, f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, f25,
              f26, f27, f28, f29, f30, f31, f32, f33, f34, f35], i;
  for(i = 0; i < caps.length; i++){
    var d = el("div", "pagina" + (i > 0 ? " " + CORES[i - 1] : "")); d.setAttribute("data-pag", i);
    caps[i](d, i);
    if(i > 0) d.appendChild(el("div", "carimbo", "FOLHA<br>PRONTA"));
    livro.appendChild(d); PAGEL.push(d);
  }
}

/* ---------- capa ----------
   A capa não é enfeite: é a primeira coisa que a criança vê, e é ela que diz
   "isto aqui é um lugar bom". O tema sai do PROBLEMA do caderno.
   ⚠️ CAPA CLONADA = TROCAR A CENA, SEMPRE. Numa capa herdada desta casa ficou um
      `img()` de outra atividade: o app abria com um quadradinho vazio e um 404
      no console, e nenhum portão de texto viu. */
function f0(d){
  /* CAPA COM IDENTIDADE PRÓPRIA — gerada por _padrao/identidade_capa.py (editar lá).
     Cena: o armário: as gavetas abrindo com uma sílaba em cada. O título entra letra a letra (desliza), palavra por palavra
     (nowrap, para não quebrar no meio); as figuras são as do próprio caderno. */
  var c = el("div", "capa"), nome = "Aprendendo a separar as palavras em sílabas", k, letras = "", pos = 0;
  var V = typeof VIMG !== "undefined" ? VIMG : 2;
  nome.split(" ").forEach(function(pal, w){
    var s = "";
    for(k = 0; k < pal.length; k++, pos++){
      s += '<span class="lt" style="animation-delay:' + (0.05 * pos).toFixed(2) + 's">' + pal.charAt(k) + '</span>';
    }
    pos++;
    letras += (w ? '<span class="cpesp"></span>' : '') + '<span class="cptpal">' + s + '</span>';
  });
  c.innerHTML =
    '<div class="ceu"></div>' + '<h1 class="titu">' + letras + '</h1>' +
    '<div class="sub">Português &middot; 2º ano &middot; 35 folhas sobre a SÍLABA</div>' +
    '<div class="cena">' + '<div class="gav" style="animation-delay:0.00s">' + '<img class="capfig" draggable="false" onload="naoAmplia(this)" src="img/gv_gato.png?v=' + V + '" alt="">' + '<span class="rt">GA</span>' + '<i class="puxa"></i></div>' + '<div class="gav" style="animation-delay:0.40s">' + '<img class="capfig" draggable="false" onload="naoAmplia(this)" src="img/gv_vaca.png?v=' + V + '" alt="">' + '<span class="rt">VA</span>' + '<i class="puxa"></i></div>' + '<div class="gav" style="animation-delay:0.80s">' + '<img class="capfig" draggable="false" onload="naoAmplia(this)" src="img/gv_porco.png?v=' + V + '" alt="">' + '<span class="rt">POR</span>' + '<i class="puxa"></i></div>' + '<div class="gav" style="animation-delay:1.20s">' + '<img class="capfig" draggable="false" onload="naoAmplia(this)" src="img/gv_rato.png?v=' + V + '" alt="">' + '<span class="rt">RA</span>' + '<i class="puxa"></i></div>' + '</div>' +
    '<div class="chamada">Escreva o seu nome ali embaixo e toque em <b>Começar</b>.</div>';
  d.appendChild(c);
}
function gavetas(d, pi, gk, pede){
  faixa(d, pi, NOMES[pi - 1]);
  var G = GAV[gk];
  enunciado(d, pi, pede, "p" + pi + "enun");
  var cols = el("div", "colunas"), caixas = {}, listaC = [];
  G.cols.forEach(function(C){
    var c = el("div", "coluna");
    var t = el("div", "ctit", C.n);
    t.setAttribute("data-alvo", "1");
    /* ⚠️ o alvo é COMPARTILHADO pela folha inteira, então ele se declara no
       nível da página — e com o número da folha no nome, porque as 22 folhas
       moram no mesmo HTML e o jogador da banca busca por `document.querySelector`. */
    c.setAttribute("data-qa", "alvo-gav" + pi + "_" + C.k);
    t.appendChild(botaoSom("Ouvir a regra desta gaveta", function(){ falar("gav_" + gk + "_" + C.k); }));
    c.appendChild(t);
    var dentro = el("div", "cdentro");
    c.appendChild(dentro);
    c._v = C.k; c._dentro = dentro;
    caixas[C.k] = c; listaC.push(c);
    cols.appendChild(c);
  });
  d.appendChild(cols);
  var banco = el("div", "figbanco"), marcada = null;
  ST.folha["p" + pi].forEach(function(n, i){
    var P = G.pal[n], id = "n" + pi + "_" + i;
    registra(id, pi, ">gav" + pi + "_" + P.c);
    var b = el("button", "op pal" + (ST.resp[id] ? " usada" : ""), P.p);
    b.setAttribute("aria-label", P.p);
    b.setAttribute("data-qa", "item-" + id);
    /* a palavra escrita é a PEÇA que a criança pega, não a resposta entregue */
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) caixas[P.c]._dentro.appendChild(el("span", "fdentro", P.p));
    function larga(col){
      if(ST.resp[id]) return;
      if(col._v === P.c){
        b.className = "op pal usada";
        col._dentro.appendChild(el("span", "fdentro", P.p));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + n);
      } else {
        col.className = "coluna erro";
        setTimeout(function(){ col.className = "coluna"; }, 500);
        errou(id, "dica" + pi + "_" + n);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar("diz2_" + gk + "_" + n);
      if(marcada === b){ b.className = "op pal"; marcada = null; return; }
      if(marcada) marcada.className = "op pal";
      b.className = "op pal marcada"; marcada = b;
    };
    puxavel(b, listaC, function(col){ larga(col); });
    banco.appendChild(b);
  });
  listaC.forEach(function(col){
    col.onclick = function(){
      if(!marcada){ sPasso(); falar("toque_palavra"); return; }
      marcada._larga(col);
    };
  });
  d.appendChild(banco);
}

/* ============================================================
   AS FOLHAS — escrever daqui para baixo, uma função por folha.

   O MOLDE de uma folha de escolher:

     function f01(d, pi){
       faixa(d, pi, NOMES[pi - 1]);
       enunciado(d, pi, "O que a criança tem de fazer.", "p" + pi + "enun");
       ST.folha["p" + pi].forEach(function(k, i){
         var D = MEUDADO[k], id = "n" + pi + "_" + i, box = item(i + 1);
         // … desenhar a peça …
         opcoes(box, pi, id, lista, certa, "pal",
                "certo" + pi + "_" + k, "dica" + pi + "_" + k);
         fechaItem(d, box, id);
       });
     }

   ⚠️ E CADA PEÇA TEM DE SER ALCANÇÁVEL PELO JOGADOR DA BANCA, senão a folha sai
      como dívida e ninguém a mede. Os contratos, em `_qa/joga_folha.js`:
        `esc-<id>`            → campo de teclado
        `op-<id>-<valor>`     → uma escolha
        `item-<id>` + `>gav`  → pegar a peça e largar na gaveta
        `pinta-<id>-<x>` + `data-lapis="<x>"` e o estojo `lapis-<x>` → pintar
        `cp-<id>-a` / `cp-<id>-z` → as duas pontas da palavra no caça-palavras
        `conferir-<id>`       → marque vários e confirme
   ============================================================ */
/* ---------- o teclado da palavra: uma por vez, letra a letra ----------
   ⚠️ UMA PEÇA SÓ PARA A CRUZADINHA (22) E PARA O REESCREVA (19). As duas
   escrevem palavra letra a letra; escrever dois teclados seria arrumar lugar
   para um segundo defeito. O que muda entre elas é só o rótulo da tarja —
   daí o `E.rot`. */
var CRUZ = null;
/* ---------- ROLAR A PALAVRA PARA CIMA DO TECLADO ----------
   ⚠️⚠️ O TECLADO TAPAVA A ATIVIDADE, e o Marcos viu no celular (15/set/2026):
      *"ele preenche a tela e não dá para ver a atividade"*. Medido: na
      cruzadinha de 360x640 o teclado ocupava 368 px de 640 e a grade ficava
      INTEIRA por baixo dele — a criança escrevia às cegas.
   ⚠️ E A REGRA TEM DOIS DEGRAUS, porque medir só um não bastou:
      1. se a PALAVRA inteira cabe na faixa que sobra, ela sobe inteira;
      2. se não cabe (palavra em pé, tela de 320x568 — medido), sobe a CASINHA
         QUE ESTÁ SENDO ESCRITA, centrada na faixa. É o que um campo de texto
         faz: mantém à vista a letra que a pessoa está digitando.
   Por isso ela é chamada duas vezes: ao abrir o teclado e a cada letra.
   ⚠️⚠️ E ELA ATENDE OS DOIS TECLADOS DA CASA, o que é a lição paga aqui
      (15/set/2026): há dois desenhos de teclado nos cadernos de folha viva —
      o da CRUZADINHA, que escreve numa fila de casinhas (`CRUZ.E.cels`), e o
      da SÍLABA/PALAVRA, que escreve numa quadra só (`ATIVA.q`). Eu escrevi
      esta função ancorada no primeiro e a enfiei nos dezoito cadernos pelo
      `function abreCruz(` — que só existe em TRÊS. Nos outros quinze ficou a
      CHAMADA sem a função: `setTimeout(rolaParaCruz, 60)` estourava
      ReferenceError e matava o resto de `ativa()`, que era justamente quem
      escrevia a dica e falava com a criança. O teclado abria mudo.
      O `node --check` não vê isso (a sintaxe está perfeita); quem vê é o
      `_qa/funcoes.py`, o portão "função que não existe" — que eu não rodei. */
function rolaParaCruz(){
  /* ⚠️ VAZIA DE PROPÓSITO, e ela fica aqui em vez de sumir. Enquanto o
     teclado era uma barra fixa nossa, esta função levava a palavra para
     a faixa que sobrava acima dele. Agora quem abre é o teclado do
     aparelho, e o navegador já rola a página sozinho para o campo com
     foco. Apagá-la quebraria as chamadas que ainda existem por aí. */
}
function abreCruz(E, pi){
  /* ⚠️ SEM BARRA FIXA, SEM ROLAGEM FORÇADA. O teclado da casa era fixo no pé da
     tela e tapava a palavra que a criança escrevia — daí existir o `comtec` e o
     `rolaParaCruz`. Agora quem abre é o teclado do APARELHO, que o próprio
     navegador já trata: ele rola a página para deixar o campo com foco à vista.
     Foi por isso que as duas peças saíram daqui juntas. */
  /* ⚠️ Toque na casinha dispara o `onclick` da casinha E o da grade: a mesma
     palavra pede para abrir duas vezes. Se já está aberta, só devolve o foco —
     fechar e reabrir era o que apagava a letra e (antes do conserto acima)
     estourava. */
  if(CRUZ && CRUZ.E === E){ try{ TECIN && TECIN.focus(); }catch(e){} return; }
  if(CRUZ) fechaCruz();
  CRUZ = {E: E, val: "", pi: pi};
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista ativa";
  pintaCruz();
  var grade = E.cels && E.cels[0] ? E.cels[0].parentNode : null;
  var c = poeCampoSobre(grade);
  c.value = "";
  c.setAttribute("maxlength", String(E.aceita ? E.cels.length : E.w.length));
  c.setAttribute("aria-label", E.rot || "Escreva a palavra");
  try{ c.focus({preventScroll: false}); }catch(e){ c.focus(); }
  falar("escreva");
}
function fechaCruz(){
  /* ⚠️⚠️ LIÇÃO PAGA — "O ALUNO NÃO CONSEGUIA DIGITAR" (Marcos, 18/set/2026, na
     folha 8 d'A Fábrica de Nomes). Aqui estava `CRUZ = null; pintaCruz();` — e
     `pintaCruz` começa lendo `CRUZ.E`. Estourava TypeError toda vez que se
     fechava a caneta. Como a casinha E a grade tinham `onclick`, um toque na
     casinha chamava `abreCruz` duas vezes: a segunda fechava a primeira, o
     fecho estourava, e o `abreCruz` morria ANTES de reabrir. Resultado: a
     criança tocava, nada abria, digitava e nada acontecia — sem erro na tela.
     O jogador da banca não pegou porque clicava na GRADE (um `onclick` só);
     agora ele clica na CASINHA, como a criança. Aqui: pintar com o E guardado
     ANTES de zerar, e nunca ler CRUZ depois de zerá-lo. */
  if(!CRUZ) return;
  var E = CRUZ.E;
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista";
  CRUZ = null;
  if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
  limpaCruz(E);
}
function limpaCruz(E){
  (E && E.cels || []).forEach(function(c){
    if(!c || c.className.indexOf(" ok") > -1) return;
    var n = c.querySelector(".cn");
    c.textContent = ""; if(n) c.appendChild(n);
    c.className = "ccel viva";
  });
}
function pintaCruz(){
  if(!CRUZ) return;                       /* nunca ler CRUZ.E sem CRUZ */
  var E = CRUZ.E, v = CRUZ.val;
  E.cels.forEach(function(c, i){
    if(!c) return;
    var n = c.querySelector(".cn");
    c.textContent = v.charAt(i) || "";
    if(n) c.appendChild(n);
    c.className = "ccel viva" + (i === v.length ? " ativa" : "");
  });
}
function digitaCruz(ch){
  if(!CRUZ) return;
  sTecla();
  var E = CRUZ.E;
  /* ⚠️ NA FOLHA DE PRODUÇÃO O TAMANHO NÃO É O DO GABARITO: as palavras aceitas
     têm tamanhos diferentes, e o teto é a maior delas (`E.cels.length`). E ela
     NÃO se confere sozinha ao encher — a criança é que diz quando acabou, no
     botão OK. Conferir sozinho recusaria "GATO" no meio de "GATOS". */
  var teto = E.aceita ? E.cels.length : E.w.length;
  if(ch === "ap") CRUZ.val = CRUZ.val.slice(0, -1);
  else if(ch === "ok"){ confereCruz(); return; }
  else { if(CRUZ.val.length >= teto) return; CRUZ.val += ch; }
  pintaCruz(); rolaParaCruz();
  if(!E.aceita && CRUZ.val.length >= E.w.length) setTimeout(confereCruz, 380);
}
/* ⚠️⚠️ O ACENTO NÃO PODE REPROVAR QUEM ACERTOU A PALAVRA (ordem do Marcos,
   15/set/2026, com a turma na sala: *"faça que tanto com o sem dê certo"*).
   O gabarito de BACTERIAS estava sem acento e o teclado da tela TEM os acentos:
   a criança que escrevia BACTÉRIAS — que é o certo em português — era recusada,
   e ficava olhando para uma palavra certa marcada como errada. O contrário
   também acontecia, em caderno cujo gabarito vinha acentuado.
   ⚠️ E ONDE O ACENTO É O CONTEÚDO, ele continua contando: a folha declara
      `exigeAcento` e aí a comparação é letra por letra, acento incluído. */
function semAcento(s){
  s = String(s || "").toUpperCase();
  var de = "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ", para = "AAAAAEEEEIIIIOOOOOUUUUC", i, o = "";
  for(i = 0; i < s.length; i++){
    var n = de.indexOf(s.charAt(i));
    o += n > -1 ? para.charAt(n) : s.charAt(i);
  }
  return o;
}
function mesmaPalavra(a, b, exigeAcento){
  if(exigeAcento) return String(a).toUpperCase() === String(b).toUpperCase();
  return semAcento(a) === semAcento(b);
}
function confereCruz(){
  if(!CRUZ || !CRUZ.val) return;
  var E = CRUZ.E, pi = CRUZ.pi;
  /* ⚠️⚠️ A FOLHA DE PRODUÇÃO (34) ACEITA MUITAS RESPOSTAS, e sem isto ela seria
     uma armadilha: a criança escreveria uma palavra CERTA e o app diria que
     está errada. Quando `E.aceita` existe, vale qualquer palavra da lista —
     e a que fica escrita nas casas é a que ELA escreveu, não a do gabarito.
     ⚠️ E o gabarito continua existindo (`E.w` = a primeira da lista), porque é
        ele que o jogador da banca digita. */
  var vale = E.aceita
    ? E.aceita.some(function(w){ return mesmaPalavra(CRUZ.val, w, E.exigeAcento); })
    : mesmaPalavra(CRUZ.val, E.w, E.exigeAcento);
  var escrita = E.aceita ? CRUZ.val : E.w;
  if(vale){
    E.cels.forEach(function(c, i){
      if(!c) return;
      var n = c.querySelector(".cn");
      c.textContent = escrita.charAt(i); if(n) c.appendChild(n);
      c.className = "ccel viva" + (i < escrita.length ? " ok" : "");
    });
    if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista feita";
    CRUZ = null;
    if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
    acertou(E.id, "certo" + pi + "_" + E.k);
  } else {
    CRUZ.val = ""; pintaCruz();
    errou(E.id, "dica" + pi + "_" + E.k);
  }
}
function montaLigar(caixa, pi, tag, pares, pagina){
  var box = el("div", "ligar"), ce = el("div", "col"), cd = el("div", "col");
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "linhas");
  box.appendChild(ce); box.appendChild(cd); box.appendChild(svg); caixa.appendChild(box);
  var ordem = baralha(pares.map(function(_, i){ return i; }));
  var E = {}, D = {}, marcada = null;
  pares.forEach(function(P){ registra("l" + pi + tag + "_" + P.k, pi, P.k); });
  function centro(e, lado){
    var r = e.getBoundingClientRect(), b = box.getBoundingClientRect();
    return {x: (lado === "e" ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top};
  }
  function linha(a, b2, cor){
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var dx = Math.max(28, Math.abs(b2.x - a.x) * 0.45);
    var dd = "M" + a.x + "," + a.y + " C" + (a.x + dx) + "," + a.y + " " +
             (b2.x - dx) + "," + b2.y + " " + b2.x + "," + b2.y;
    var halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    halo.setAttribute("d", dd); halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "#ffffff"); halo.setAttribute("stroke-width", 11);
    halo.setAttribute("stroke-linecap", "round");
    var l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", dd); l.setAttribute("fill", "none");
    l.setAttribute("stroke", cor); l.setAttribute("stroke-width", 6);
    l.setAttribute("stroke-linecap", "round");
    g.appendChild(halo); g.appendChild(l);
    [a, b2].forEach(function(p){
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 6);
      c.setAttribute("fill", cor); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", 2.5);
      g.appendChild(c);
    });
    svg.appendChild(g); return g;
  }
  function desmarca(){ if(marcada) marcada.el.className = marcada.el.className.replace(" marcada", ""); marcada = null; }
  function redesenha(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    for(var k in E) if(ST.lig["l" + pi + tag + "_" + k]) linha(centro(E[k].el, "e"), centro(D[k].el, "d"), "#15a34a");
  }
  aoAbrir(pagina, redesenha);
  window.addEventListener("resize", function(){ if(pagina.className.indexOf("viva") > -1) redesenha(); });
  function fecha(Re, Rd){
    var id = "l" + pi + tag + "_" + Re.k;
    if(Rd.k === Re.k){
      ST.lig[id] = 1; tentativa(id, true); ST.resp[id] = 1; salvar();
      Re.el.className += " feita"; Rd.el.className += " feita"; desmarca(); redesenha(); sCerto();
      falar(Re.fc); setTimeout(function(){ confereFolha(pi); }, 850);
    } else {
      tentativa(id, false); sErro();
      Rd.el.className += " treme";
      setTimeout(function(){ Rd.el.className = Rd.el.className.replace(" treme", ""); }, 500);
      falar(ST.tent[id].erros >= 2 ? Re.dica : "quase");
      if(ST.tent[id].erros >= 2 && D[Re.k].el.className.indexOf("feita") < 0) D[Re.k].el.className += " mostra";
    }
  }
  pares.forEach(function(P){
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.esq);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-e-" + P.k);
    e.setAttribute("aria-label", P.ariaE);
    var R = {k: P.k, el: e, fc: P.fc, dica: P.dica};
    E[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; sPasso(); falar(P.fe);
    });
    e.onkeydown = function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; falar(P.fe); } };
    ce.appendChild(e);
  });
  ordem.forEach(function(j){
    var P = pares[j];
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.dir);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-d-" + P.k);
    e.setAttribute("aria-label", P.ariaD);
    var R = {k: P.k, el: e}; D[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault();
      if(marcada) fecha(marcada, R); else { sPasso(); falar(P.fd); falarDepois("ligue", 900); }
    });
    e.onkeydown = function(ev){ if((ev.key === "Enter" || ev.key === " ") && marcada){ ev.preventDefault(); fecha(marcada, R); } };
    cd.appendChild(e);
  });
}

/* ---------- o teclado da tela, e o teclado DE VERDADE ----------
   ⚠️⚠️ O ALFABETO ESTAVA INCOMPLETO, E ISSO TRANCAVA A CRIANÇA (15/set/2026).
   Faltavam K, W e Y — e, pior, faltavam Ê, Â, Ã, Ô, Õ, À e Ü. Quem tentasse
   escrever PÊSSEGO no teclado da tela ou no teclado de verdade ficava com
   "PSSEGO": a tecla não existia, a letra não entrava, e a folha NUNCA FECHAVA.
   Não havia erro nenhum no console; a criança só tentava de novo até desistir.
   Medido com o navegador de verdade, letra por letra, antes deste conserto.
   ⚠️ Quem fecha esta família agora é o portão `_qa/teclado.py`: ele confere que
      o alfabeto tem as 26 letras e os treze acentos do português, e que o
      teclado da tela e o filtro do teclado de verdade usam o MESMO alfabeto —
      porque dois alfabetos diferentes é o mesmo defeito com uma porta só.
   ⚠️ REGRA DAS DUAS PORTAS (Marcos, ago/2026): *"seria interessante se o aluno
   além de teclar no teclado virtual funcionasse se ele tocasse no teclado de
   verdade, as duas opções"*. No PC da escola tem teclado e a criança vai
   digitar; no celular, não tem. Nunca só uma porta. */
/* ============================================================
   O TECLADO DO APARELHO — substitui o teclado de 41 teclas da casa.

   ⭐ ORDEM DO MARCOS (15/set/2026): *"pode remover o teclado das atividades,
      melhor digitar com teclado normal"*. O nosso ocupava 53% de um celular de
      640 px, e mesmo redistribuído para 4 fileiras ainda comia 40%.

   ⚠️ O QUE ELE RESOLVE E O QUE NÃO RESOLVE, dito por inteiro: no PC da escola o
      teclado físico já funcionava (as duas portas são regra da casa desde
      ago/2026) — o campo abaixo não muda nada lá. Ele existe pelo CELULAR, que
      não tem teclado físico: sem um campo de verdade para focar, o aparelho não
      abre teclado nenhum e a criança fica trancada.
   ============================================================ */
var TECIN = null;
function campoTeclado(){
  if(TECIN) return TECIN;
  TECIN = document.createElement("input");
  TECIN.id = "tecIn";
  TECIN.type = "text";
  TECIN.setAttribute("autocomplete", "off");
  TECIN.setAttribute("autocorrect", "off");
  TECIN.setAttribute("autocapitalize", "characters");
  TECIN.setAttribute("spellcheck", "false");
  TECIN.setAttribute("aria-label", "Escreva a palavra");
  TECIN.setAttribute("inputmode", "text");
  /* ⚠️ O EVENTO É `input`, NÃO `keydown`: no celular o teclado do sistema não
     dispara keydown com a letra (ele "compõe" o texto), e um caderno que só
     ouvisse keydown seria mudo justamente no aparelho para o qual este campo
     existe. */
  TECIN.addEventListener("input", function(){
    if(!CRUZ) return;
    var v = (TECIN.value || "").toUpperCase();
    var teto = CRUZ.E.aceita ? CRUZ.E.cels.length : CRUZ.E.w.length;
    if(v.length > teto) v = v.slice(0, teto);
    CRUZ.val = v; TECIN.value = v;
    pintaCruz();
    if(!CRUZ.E.aceita && CRUZ.val.length >= CRUZ.E.w.length) setTimeout(confereCruz, 380);
  });
  TECIN.addEventListener("keydown", function(ev){
    if(ev.key === "Enter"){ ev.preventDefault(); confereCruz(); }
    else if(ev.key === "Escape"){ fechaCruz(); }
  });
  /* ⚠️⚠️ PERDER O FOCO NÃO FECHA MAIS A PALAVRA (18/set/2026). Aqui havia um
     `blur -> fechaCruz()`. Medido no navegador com o gesto da criança: ela toca
     na casinha, toca em "Ouvir a frase" para escutar de novo (o que a folha
     CONVIDA a fazer) e o foco vai para o botão — a palavra fechava, e o que ela
     digitava em seguida caía no vazio. No PC a digitação nem precisa do foco
     (o teclado é ouvido no documento); no celular, tocar de novo na casinha
     devolve o foco e reabre o teclado do aparelho. Então o blur não faz nada. */
  document.body.appendChild(TECIN);
  return TECIN;
}
function poeCampoSobre(grade){
  var c = campoTeclado();
  if(grade && grade.parentNode){
    if(c.parentNode !== grade) grade.appendChild(c);
    c.style.left = "0"; c.style.top = "0";
    c.style.width = "100%"; c.style.height = "100%";
  }
  return c;
}
/* ⚠️ A FILEIRA DE LETRAS TAMBÉM OUVE O TECLADO DE VERDADE — as duas portas são
   regra da casa, e no PC da escola a criança vai digitar. `ATIVO_LETRAS` é a
   fileira que está esperando letra. */
var ATIVO_LETRAS = null;
document.addEventListener("keydown", function(ev){
  if(ATIVO_LETRAS && !CRUZ){
    var t = (ev.key || "").toUpperCase();
    if(t.length === 1){ ev.preventDefault(); ATIVO_LETRAS(t); return; }
    if(ev.key === "Backspace"){ ev.preventDefault(); ATIVO_LETRAS("ap"); return; }
    if(ev.key === "Enter"){ ev.preventDefault(); ATIVO_LETRAS("ok"); return; }
  }
  if(document.activeElement && document.activeElement.id === "nomeIn") return;
  var k = (ev.key || "").toUpperCase();
  /* ⭐ DIGITAR SEM TER CLICADO ABRE A PRIMEIRA PALAVRA VAZIA DA FOLHA
     (18/set/2026, "o aluno não conseguia digitar"). As DUAS PORTAS valem para
     o gesto também: no PC, o teclado tem de funcionar sem clique. */
  if(!CRUZ && k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){
    var alvo = null, todos = document.querySelectorAll('.pagina.viva [data-qa^="esc-"]');
    for(var i = 0; i < todos.length && !alvo; i++){
      var idq = todos[i].getAttribute("data-qa").slice(4);
      if(!ST.resp[idq]) alvo = todos[i];
    }
    if(alvo){ alvo.click(); }
  }
  if(!CRUZ) return;
  if(k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){ ev.preventDefault(); digitaCruz(k); }
  else if(ev.key === "Backspace"){ ev.preventDefault(); digitaCruz("ap"); }
  else if(ev.key === "Enter"){ ev.preventDefault(); digitaCruz("ok"); }
  else if(ev.key === "Escape"){ fechaCruz(); }
});

/* ---------- folha pronta e navegação ---------- */
function idsDaPagina(pi){
  /* ⚠️⚠️ ISTO JÁ MENTIU DUAS VEZES NESTA CASA. Antes, cada folha gravava `n6_0`
     à mão e esta função dizia à mão que a página 6 tinha ids `n6_`. Eram DOIS
     lugares a combinar, os dois sintaticamente corretos, e quando a ordem das
     folhas mudava o relatório saía ZERO com a folha toda respondida — sem erro
     nenhum no console. Agora o id NASCE DA POSIÇÃO e aqui se lê a mesma
     posição; a única forma diferente é o LIGAR, que se declara na constante. */
  var ids = [], i, k, L = (ST.folha["p" + pi] || []);
  if(LIGAR.indexOf(pi) > -1){
    for(i = 0; i < L.length; i++)
      for(k = 0; k < L[i].length; k++) ids.push("l" + pi + "g" + i + "_" + L[i][k]);
    return ids;
  }
  for(i = 0; i < L.length; i++) ids.push("n" + pi + "_" + i);
  return ids;
}
function pendentes(pi){
  var ids = idsDaPagina(pi), n = 0, i;
  for(i = 0; i < ids.length; i++) if(!ST.resp[ids[i]]) n++;
  return n;
}
function confereFolha(pi){
  if(pendentes(pi) > 0 || ST.prontas[pi]) return;
  ST.prontas[pi] = 1; salvar();
  PAGEL[pi].className += " pronta"; sFesta(); confete(24);
  if(pi < PAGEL.length - 1){ falar("folhaPronta"); setTimeout(function(){ if(ST.pag === pi) vaiPara(pi + 1); }, 2400); }
  else setTimeout(fim, 1400);
  atualizaNav();
}
function espelhaNome(t){
  var i = document.getElementById("nomeIn"); if(i && i.value !== t) i.value = t;
}
function vaiPara(pi){
  calar(); fechaCruz();
  document.getElementById("barraCapa").className = pi === 0 ? "aberta" : "";
  if(pi === 0) espelhaNome(ST.nome || "");
  document.getElementById("fim").style.display = "none";
  document.getElementById("retomar").style.display = "none";
  document.getElementById("nav").style.display = pi === 0 ? "none" : "flex";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  ST.pag = pi; salvar();
  /* ⚠️ GUARDA DO ESQUELETO VAZIO: enquanto o caderno ainda não tem folha
     nenhuma, o "Começar" pede a folha 1 e `PAGEL[1]` não existe — estourava
     `TypeError` e o portão do boot reprovava. Não é defeito do caderno em
     construção; é o esqueleto tendo de abrir limpo ANTES de ter conteúdo, que é
     justamente o que torna o pré-voo útil no primeiro minuto. Num caderno com
     folhas esta guarda nunca dispara. */
  var d = PAGEL[pi];
  if(!d){ atualizaNav(); return; }
  d.className += " viva";
  if(pi > 0) window.scrollTo(0, 0);
  if(d._aoAbrir) for(var z = 0; z < d._aoAbrir.length; z++) (function(fn){ setTimeout(fn, 60); })(d._aoAbrir[z]);
  atualizaNav();
  falarDepois(pi === 0 ? "capa" : "p" + pi + "enun", 280);
}
function atualizaNav(){
  var pi = ST.pag, total = PAGEL.length;
  document.getElementById("pg").textContent = pi === 0 ? "Capa" : "Folha " + pi + " de " + (total - 1);
  var feitas = 0, k; for(k in ST.prontas) feitas++;
  document.getElementById("progI").style.width = (feitas / (total - 1) * 100) + "%";
  document.getElementById("bAnt").disabled = pi === 0;
  var prox = document.getElementById("bProx");
  prox.style.visibility = pi === 0 ? "hidden" : "visible";
  var pend = pi > 0 ? pendentes(pi) : 0;
  prox.innerHTML = pi === total - 1 ? (pend ? "Faltam " + pend : "Ver o resultado")
    : (pend ? "Faltam " + pend + '<i class="seta dir"></i>' : 'Próxima<i class="seta dir"></i>');
  prox.className = pend ? "bt cinza" : "bt verde";
  document.getElementById("navTxt").textContent = pi === 0 ? "" : NOMES[pi - 1];
}

/* ---------- fim: boletim, medalha e relatório ---------- */
/* ⭐⭐ O FECHO A QUALQUER MOMENTO.
   O Marcos fixou a sequência em no mínimo 20 folhas (o piso era 25 e ele o
   baixou em 14/set/2026, por velocidade de produção). Este caderno tem 22, e o
   número saiu do inventário de verbos do `POTE`, não de uma meta. Só que a
   criança DEVAGAR leva bem mais nas mesmas 22 folhas — ela não termina. Se o boletim, o parecer e a
   medalha só existissem DEPOIS da última folha, quem mais precisa do elogio
   seria a única a nunca vê-lo.
   ⚠️ E o boletim conta só o que ela TENTOU. Folha que ela não chegou a abrir
      aparece como "ainda não" — jamais como 0 de 6. */
function fim(){
  /* ⭐⭐ AVISA O CONTROLE DA SALA QUE ESTA CRIANÇA TERMINOU.
     Pedido do Marcos (15/set/2026): *"preciso que essas atividades sequências
     didáticas me avisem quando termino no painel de atividades, aquele que tem
     o controle da sala, assim como as atividades que fazíamos antes"*.

     ⚠️ E ELAS NÃO AVISAVAM POR CAMINHO NENHUM — conferido no código do
     laboratório antes de escrever isto. A tela do aluno (`_lab/index.html`)
     reconhece o fim de DOIS jeitos, e a folha viva escapava dos dois:
       1. A ESPIADA — ela olha dentro do quadro e procura a MEDALHA do fim pela
          CLASSE `.medal`. A folha viva chama a dela de `#medalha`, por id, e
          portanto a espiada nunca a via;
       2. O AVISO — o motor manda `postMessage({eduverse:"terminou"})` ao chegar
          no fim. A folha viva não mandava nada, porque nasceu sem essa peça.
     Agora ela manda o aviso aqui, e a medalha ganhou também a classe `medal`
     no HTML: dois caminhos, um cobrindo o buraco do outro, que é a razão pela
     qual o laboratório tem os dois.

     ⚠️ FORA DO LABORATÓRIO NÃO HÁ PAI NENHUM ESCUTANDO e a linha não faz nada —
     por isso ela é segura em qualquer lugar (em casa, no celular, aberta
     direto pelo link). O `try` existe para o caso de a janela de cima ser de
     outro domínio, quando o navegador recusa a leitura de `window.parent`. */
  try{ if(window.parent && window.parent !== window)
         window.parent.postMessage({eduverse: "terminou"}, "*"); }catch(e){}
  calar();
  var abertas = 0, naoAbertas = [], pp;
  for(pp = 1; pp <= NOMES.length; pp++){
    var idp = idsDaPagina(pp), algum = false, z;
    for(z = 0; z < idp.length; z++) if(ST.tent[idp[z]]) { algum = true; break; }
    if(algum) abertas++; else naoAbertas.push(pp);
  }
  var completo = naoAbertas.length === 0;
  var tf = document.getElementById("fimTit");
  if(tf) tf.textContent = completo ? "Caderno completo!" : "O seu boletim de hoje";
  var bv = document.getElementById("bVoltar");
  if(bv) bv.style.display = completo ? "none" : "";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  document.getElementById("nav").style.display = "none";
  var f = document.getElementById("fim"); f.style.display = "block";
  var tot = 0, prim = 0, pi;
  for(pi = 1; pi <= NOMES.length; pi++){
    var ids = idsDaPagina(pi);
    for(var j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(!t) continue;
      tot++;
      if(t.erros === 0 && t.ok) prim++;
    }
  }
  var pc = tot ? prim / tot : 0;
  var cheias = pc >= .85 ? 3 : pc >= .6 ? 2 : 1, est = "", ke;
  for(ke = 0; ke < 3; ke++)
    est += '<img src="img/gv_selo' + (ke < cheias ? "" : "_off") + '.png?v=' + VIMG + '" alt="" draggable="false">';
  document.getElementById("estrelas").innerHTML = est;
  document.getElementById("estrelas").setAttribute("aria-label", cheias + " de 3 estrelas");
  var bar = document.getElementById("barras"); bar.innerHTML = "";
  for(pi = 1; pi <= NOMES.length; pi++){
    (function(pi){
      var ids = idsDaPagina(pi), p = 0, nt = 0, j;
      for(j = 0; j < ids.length; j++){
        var tt = ST.tent[ids[j]];
        if(tt) nt++;
        if(tt && tt.erros === 0 && tt.ok) p++;
      }
      if(nt === 0){
        bar.appendChild(el("div", "barra naoabriu",
          "<span>" + NOMES[pi - 1] + "</span><div class='tr'></div><b>ainda não</b>"));
        return;
      }
      var b = el("div", "barra", "<span>" + NOMES[pi - 1] + "</span><div class='tr'><i></i></div><b>" + p + "/" + nt + "</b>");
      bar.appendChild(b);
      setTimeout(function(){ b.querySelector("i").style.width = (nt ? p / nt * 100 : 0) + "%"; }, 400);
    })(pi);
  }
  /* ⭐ O PARECER DA CRIANÇA. O currículo de Blumenau diz que a avaliação orienta
     *"o professor E O ESTUDANTE acerca de quais objetivos foram alcançados"*, e
     que *"mostrar o que sabe ou o que não sabe é pertinente, faz parte do
     crescimento e não da exclusão"*. Então ela vê o que já sabe — na linguagem
     dela, sem número, sem a palavra "errou" e sem porcentagem.
     ⚠️ A ORDEM IMPORTA: primeiro o que ela JÁ SABE; o "vale treinar" vem depois
     e no máximo dois, senão a lista vira boletim de defeitos. */
  var jaSabe = [], treinar = [], q;
  for(q = 0; q < OBJETIVOS.length; q++){
    var Oq = OBJETIVOS[q], mq = mede(Oq.f);
    if(mq.tot === 0 || !mq.tent) continue;
    var pcq = Math.round(100 * mq.prim / mq.tent);
    (pcq >= 75 ? jaSabe : treinar).push(pcq >= 75 ? Oq.ok : Oq.n.toLowerCase());
  }
  var txt = "";
  if(jaSabe.length) txt = "Você já " + jaSabe.slice(0, 3).join("; ") + ".";
  else txt = "Você começou a reparar que o mesmo som pode se escrever de cinco jeitos — e isso é o principal!";
  if(treinar.length) txt += " Vale treinar mais: " + treinar.slice(0, 2).join(" e ") + ".";
  if(!completo)
    txt = "você fez " + abertas + " de " + NOMES.length + " folhas hoje — e olhe o "
        + "que já dá para ver: " + txt.charAt(0).toLowerCase() + txt.slice(1);
  /* ⚠️ SEM NOME, SEM PREFIXO. Com o prefixo fixo saía "Você, você já…" para a
     criança que não escreve o nome na capa — que é justamente a que mais precisa
     que a tela fale direito com ela. */
  var quem = (ST.nome || "").replace(/^\s+|\s+$/g, "");
  document.getElementById("resumo").innerHTML = quem
    ? "<b>" + esch(quem) + "</b>, " + txt.charAt(0).toLowerCase() + txt.slice(1)
    : txt.charAt(0).toUpperCase() + txt.slice(1);
  sFesta(); confete(40); falar("fim");
}
(function(){
  var m = document.getElementById("medalha"), t = null;
  function segura(){ t = setTimeout(function(){ abreRelatorio(); }, 2000); }
  function larga(){ if(t){ clearTimeout(t); t = null; } }
  m.addEventListener("pointerdown", segura);
  m.addEventListener("pointerup", larga);
  m.addEventListener("pointerleave", larga);
  m.addEventListener("pointercancel", larga);
})();

/* ============================================================
   O QUE A ATIVIDADE MEDE — e como isso vira PARECER e NOTA

   ⚠️ A NOTA FICA COM O PROFESSOR. A Instrução Normativa SEMED nº 1/2017, art.
   3º, citada no currículo de Blumenau, manda avaliar *"com preponderância dos
   aspectos qualitativos sobre os quantitativos"*. O parecer vai para a criança;
   o número fica só aqui.
   ⚠️ E NÃO SE CONTA TUDO IGUAL: acerto de primeira vale 1,0 e acerto com ajuda
   vale 0,6 — o relatório mostra os dois lado a lado, para o professor ver a
   nota E o esforço que ela custou. O critério sai impresso por exigência da
   mesma Instrução (*"a exposição de critérios utilizados"*).
   ============================================================ */
var PESO_PRIMEIRA = 1.0, PESO_COM_AJUDA = 0.6;

/* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os nomes
   e as folhas não baterem um a um. Os números são POSIÇÕES de folha: mudou a
   ordem, mudam aqui e no `curriculo.json`, no mesmo commit. *//* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os
   nomes e as folhas não baterem um a um, e também se alguma folha de trabalho
   ficar sem objetivo que a meça. Os números são POSIÇÕES de folha.
   Ex.: {n: "Distinguir X de Y", f: [1, 2, 3],
         ok:  "faz o que o objetivo pede, em palavras do professor",
         nao: "o que ainda não faz — sem a palavra 'errou'"}  */
var OBJETIVOS = [
  /* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, e o portão 0b9 reprova
     se divergirem — nome por nome e folha por folha. É ela que o relatório do
     professor mede, e é ela que o dossiê mostra ao lado da habilidade citada. */
  {n: "Sentir a sílaba: contar quantas vezes a boca abre", f: [1, 2, 26]},
  {n: "Separar a palavra em sílabas, e ver a vogal dentro de cada uma", f: [3, 4, 5]},
  {n: "Não confundir letra com sílaba", f: [6, 7, 8, 27]},
  {n: "Classificar a palavra pelo número de sílabas", f: [9, 10, 11, 12, 13, 14, 28, 29, 35]},
  {n: "Mexer nas sílabas: tirar, pôr e trocar para formar palavras", f: [15, 16, 17, 18, 19, 20, 33]},
  {n: "Achar a sílaba certa no meio de muitas, e escrever a palavra inteira", f: [21, 22, 23, 24, 25]},
  {n: "Separar as palavras dentro da frase e do texto", f: [30, 31, 32]},
  {n: "Escrever a própria palavra com o número de sílabas pedido", f: [34]}
];

function mede(folhas){
  var prim = 0, ajuda = 0, tot = 0, tentados = 0, k, j;
  for(k = 0; k < folhas.length; k++){
    var ids = idsDaPagina(folhas[k]);
    tot += ids.length;
    for(j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(t) tentados++;
      if(!t || !t.ok) continue;
      if(t.erros === 0) prim++; else ajuda++;
    }
  }
  return {prim: prim, ajuda: ajuda, tot: tot, tent: tentados,
          pontos: prim * PESO_PRIMEIRA + ajuda * PESO_COM_AJUDA,
          pc: tot ? Math.round(100 * prim / tot) : 0};
}

function abreRelatorio(){
  var r = document.getElementById("relatorio");
  var linhas = "", domina = [], retomar = [], k;
  var pontos = 0, total = 0, primG = 0, ajudaG = 0, tentG = 0;
  var naoAlcancou = [];
  var folhasFeitas = 0, fz;
  for(fz = 1; fz <= NOMES.length; fz++){
    var idf = idsDaPagina(fz), tocou = false, y;
    for(y = 0; y < idf.length; y++) if(ST.tent[idf[y]]) { tocou = true; break; }
    if(tocou) folhasFeitas++;
  }
  var inteiro = folhasFeitas >= NOMES.length;

  for(k = 0; k < OBJETIVOS.length; k++){
    var O = OBJETIVOS[k], m = mede(O.f);
    pontos += m.pontos; total += m.tot; primG += m.prim; ajudaG += m.ajuda;
    tentG += m.tent;
    /* ⚠️⚠️ O QUE DECIDE É O QUE ELA FEZ. Antes, num caderno não terminado, o
       objetivo cujas folhas ela nem alcançou entrava em "retomar" com 0% — e o
       parecer dizia "precisa retomar" de uma criança que tinha ido bem no que
       deu tempo de fazer. Um julgamento errado com cara de medida, contra a
       criança. Objetivo não tocado não entra em lista nenhuma. */
    var pcObj = m.tent ? Math.round(100 * m.prim / m.tent) : -1;
    if(pcObj < 0) naoAlcancou.push(O.n.toLowerCase());
    else if(pcObj >= 75) domina.push(O.ok);
    else retomar.push(O.n.toLowerCase() + " (" + pcObj + "%)");
    var pcf = m.tent ? Math.round(100 * m.prim / m.tent) : 0;
    linhas += "<tr><td>" + esch(O.n) + "</td><td>" + m.prim + "/" + m.tot +
      "</td><td><b>" + m.pc + "%</b></td><td>" +
      (m.tent ? "<b>" + pcf + "%</b> <small>(" + m.prim + "/" + m.tent + ")</small>"
              : "<small>não fez</small>") + "</td><td>" + m.ajuda + "</td></tr>";
  }

  /* ⚠️ A NOTA DE UM CADERNO NÃO TERMINADO SE MEDE NO QUE FOI FEITO. Dividir
     pelos itens que ela nunca viu dá uma nota que não fala dela — fala do
     relógio. Com o caderno completo, os dois denominadores são o mesmo número. */
  var baseNota = inteiro ? total : tentG;
  var nota = baseNota ? Math.round(100 * pontos / baseNota) / 10 : 0;
  var pc = baseNota ? Math.round(100 * primG / baseNota) : 0;
  var conceito = !baseNota ? "Sem dados" :
    nota >= 8.5 ? "Dominou" : nota >= 6 ? "Está construindo" : "Precisa retomar";
  if(!inteiro) conceito += " (parcial)";

  var nome = esch(ST.nome || "O aluno");
  var parecer = nome + " ";
  if(domina.length && !retomar.length && !naoAlcancou.length)
    parecer += "domina os objetivos avaliados: " + domina.join("; ") + ".";
  else if(domina.length)
    parecer += "já " + domina.join("; ") + ". Ainda precisa retomar: " + retomar.join(", ") + ".";
  else
    parecer += "está começando a perceber que letras diferentes fazem o mesmo som. Nenhum " +
      "objetivo chegou a 75% de acerto de primeira — vale retomar ORALMENTE, ditando cinco " +
      "palavras por dia e perguntando POR QUE se escreve com aquela letra, antes de voltar " +
      "à tela. A regra dita em voz alta fixa mais do que a palavra copiada dez vezes.";
  if(naoAlcancou.length)
    parecer += " Ainda não chegou a fazer (a aula acabou antes): " + naoAlcancou.join(", ") + ".";

  var h = "<b>Relatório do professor</b> &mdash; " + nome + " &middot; " +
    Math.round((Date.now() - (ST.inicio || Date.now())) / 60000) + " min" +
    "<div class='notao'><span class='nn'>" + nota.toFixed(1).replace(".", ",") + "</span>" +
    "<span class='nl'><b>" + conceito + "</b><br>" + primG + " de " + baseNota +
    " de primeira (" + pc + "%)<br>" + ajudaG + " com ajuda</span></div>" +
    "<p class='parecer'>" + parecer + "</p>" +
    (inteiro ? "" :
      "<p class='avisoparcial'><b>Caderno não terminado:</b> " + folhasFeitas +
      " de " + NOMES.length + " folhas. A coluna <b>%</b> conta o caderno inteiro; " +
      "a coluna <b>do que fez</b> conta só o que a criança chegou a responder — " +
      "é esta que diz como ela foi.</p>") +
    "<table><tr><th>Objetivo</th><th>De primeira</th><th>%</th>" +
    "<th>do que fez</th><th>Com ajuda</th></tr>" + linhas + "</table>" +
    "<p class='comonota'>Nota de 0 a 10: acerto de primeira vale 1,0 e acerto com ajuda vale 0,6. " +
    "A criança não vê este número — ele fica só aqui.</p>" +
    "<p class='comonota'><b>O que este caderno NÃO mede:</b> várias das folhas de papel que " +
    "deram origem a ele terminam em <b>&ldquo;copie no seu caderno&rdquo;</b> e " +
    "<b>&ldquo;classifique no caderno&rdquo;</b> &mdash; e a tela não corrige o que a criança " +
    "escreve à mão. O que dá para medir aqui é reconhecer, marcar e escrever com o teclado. " +
    "<b>A cópia e o ditado no papel continuam sendo do professor</b>, e a folha 22 existe para " +
    "isso: a criança sai daqui com o quadro de regras dela para copiar no caderno.</p>";
  r.innerHTML = h; r.style.display = "block"; sPasso();
}
function esch(t){
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- retomar, chave mestra e a partida ---------- */
var CHAVE_MESTRA = "1275@";
function abreMenuProf(){
  var cx = document.getElementById("mpFolhas");
  if(!cx.childNodes.length){
    var mk = function(rot, alvo){
      var b = el("button", null, rot);
      b.onclick = function(){ fechaMenuProf(); vaiPara(alvo); };
      cx.appendChild(b);
    };
    mk("Capa", 0);
    /* ⚠️ `NOMES.length` e não um número cravado: com "10" escrito aqui, um
       caderno de 25 folhas mostrava só as dez primeiras no menu do professor —
       e as quinze restantes ficavam sem como conferir. */
    for(var k = 1; k <= NOMES.length; k++) mk(k + ". " + NOMES[k - 1], k);
  }
  calar(); document.getElementById("menuProf").className = "aberto";
}
function fechaMenuProf(){ document.getElementById("menuProf").className = ""; }
document.getElementById("mpFechar").onclick = fechaMenuProf;
document.getElementById("menuProf").onclick = function(ev){ if(ev.target === this) fechaMenuProf(); };
document.getElementById("nomeIn").oninput = function(){
  if(this.value.indexOf(CHAVE_MESTRA) > -1){ this.value = ST.nome || ""; abreMenuProf(); return; }
  ST.nome = this.value.slice(0, 24); espelhaNome(ST.nome); salvar();
};
document.getElementById("nomeIn").onkeydown = function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); this.blur(); } };
document.getElementById("bComecar").onclick = function(){ ac(); sPasso(); if(!ST.inicio) ST.inicio = Date.now(); vaiPara(1); };
document.getElementById("bAnt").onclick = function(){ sPasso(); vaiPara(Math.max(0, ST.pag - 1)); };
document.getElementById("bProx").onclick = function(){
  sPasso();
  if(ST.pag === PAGEL.length - 1 && pendentes(ST.pag) === 0) return fim();
  vaiPara(Math.min(PAGEL.length - 1, ST.pag + 1));
};
document.getElementById("bOuvir").onclick = function(){ ac(); if(ultimaFala) falar(ultimaFala); };
document.getElementById("bVoz").onclick = function(){
  vozLigada = !vozLigada; this.className = vozLigada ? "zap" : "zap off";
  if(!vozLigada) calar(); else falar("vozOn");
};
document.getElementById("bRever").onclick = function(){ sPasso(); vaiPara(1); };
document.getElementById("bRecomecar").onclick = function(){
  sPasso(); try{ localStorage.removeItem(CHAVE_LS); }catch(e){}
  ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
  monta(); vaiPara(0); falarDepois("novoCaderno", 400);
};
document.getElementById("bContinuar").onclick = function(){ ac(); sPasso(); vaiPara(ST.pag || 1); };
document.getElementById("bZerar").onclick = function(){ document.getElementById("bRecomecar").onclick(); };

(function boot(){
  var velho = carregar();
  if(velho && velho.folha){
    ST = velho;
    if(!ST.resp) ST.resp = {}; if(!ST.lig) ST.lig = {}; if(!ST.tent) ST.tent = {}; if(!ST.prontas) ST.prontas = {};
    /* ⚠️ TRAVA 2 — A REDE DE SEGURANÇA. Se montar a partir da memória estourar
       por qualquer motivo que eu não previ, o caderno joga a memória fora e
       abre LIMPO. Perder o "continuar de onde parou" é ruim; ficar com uma tela
       morta a aula toda é muito pior. */
    try{ monta(); }
    catch(erroMemoria){
      try{ localStorage.removeItem(CHAVE_LS); }catch(e3){}
      ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
      monta(); vaiPara(0); return;
    }
    document.getElementById("retomar").style.display = "block";
    document.getElementById("retTxt").textContent =
      (ST.nome ? ST.nome + ", você" : "Você") + " parou na folha " + (ST.pag || 1) + ": " + NOMES[(ST.pag || 1) - 1] + ".";
    document.getElementById("nav").style.display = "none";
  } else {
    ST.folha = novaFolha(); monta(); vaiPara(0);
  }
})();

/*<dossie-js>*/
/* ============================================================
   DOSSIÊ PEDAGÓGICO — o que o PROFESSOR vê quando abre a atividade

   ⭐ PEDIDO DO MARCOS (set/2026): *"preciso que quando um professor olhe e
      analise a atividade ele veja que está ótima"*.

   O buraco que isto fecha: o parecer pedagógico de cada caderno existia — mas
   morava num arquivo `.md` DENTRO DO REPOSITÓRIO, que nenhum professor abre.
   Quem olhava a atividade via um joguinho bonito e não tinha como saber se
   aquilo estava alinhado ao currículo da rede. Agora o alinhamento está DENTRO
   da atividade, a um toque — e a qualquer momento, não só no fim.

   ⚠️ E não é texto solto: cada habilidade citada aqui vem do
   `<pasta>/curriculo.json`, e o portão `_qa/pedagogo_curriculo.py` reprova se a frase
   citada não existir, palavra por palavra, no `_curriculo/blumenau.txt`, ou se
   os objetivos do relatório e os do currículo não baterem um a um. Citação de
   currículo é a única coisa que o professor NÃO tem como conferir sozinho sem
   abrir 440 páginas de PDF — por isso ela é medida.

   Abre por dois caminhos: o botão no menu do professor (chave mestra 1275@,
   vale a qualquer hora) e o botão dentro do relatório, no fim.

   Este arquivo é a FONTE: `python3 _padrao/dossie_professor.py <pasta>` injeta o CSS, o
   trecho de tela e este código no caderno. Não editar a cópia injetada.
   ============================================================ */
function dossieCita(s){
  var m = String(s || "").match(/[“"]([^”"]+)[”"]/);
  return m ? m[1] : String(s || "");
}
function dossieHTML(){
  var C = (typeof CURRICULO === "object" && CURRICULO) ? CURRICULO : null;
  if(!C) return "<p>Este caderno ainda não declarou o currículo.</p>";
  var h = "", k, o;
  h += "<p class='dfonte'><b>" + esch(C.componente) + " &middot; " + C.ano +
       "º ano.</b> " + esch(C.rede) + ". As habilidades abaixo estão " +
       "<b>copiadas do documento oficial, palavra por palavra</b> &mdash; nenhuma " +
       "foi reescrita nem resumida.</p>";
  h += "<table><tr><th>O que a atividade mede</th><th>Folhas</th>" +
       "<th>Habilidade do currículo da rede</th></tr>";
  for(k = 0; k < C.objetivos.length; k++){
    o = C.objetivos[k];
    h += "<tr><td>" + esch(o.objetivo) + "</td><td>" + o.folhas.join(", ") +
         "</td><td>&ldquo;" + esch(dossieCita(o.habilidade)) + "&rdquo;" +
         "<span class='dobj'>" + esch(o.pratica) + " &middot; " +
         esch(o.objeto) + "</span></td></tr>";
  }
  h += "</table>";

  h += "<p class='dsub'><b>A escada didática</b> &mdash; uma folha por degrau, e " +
       "nenhuma repete o gesto da anterior:</p><ol class='descada'>";
  for(k = 0; k < NOMES.length; k++) h += "<li>" + esch(NOMES[k]) + "</li>";
  h += "</ol>";

  h += "<p class='dsub'><b>Como a criança é avaliada</b></p>" +
       "<p class='dtxt'>O relatório do professor (no fim, segurando a medalha por " +
       "2 segundos) traz, por objetivo: quantos itens ela acertou <b>de primeira</b>, " +
       "quantos precisou de ajuda e a porcentagem. A partir de 75% de acerto de " +
       "primeira o objetivo conta como dominado. Sai também um parecer em palavras " +
       "&mdash; do jeito que se escreve no bimestral &mdash; e uma nota de 0 a 10 " +
       "que <b>a criança não vê</b>. Dentro da atividade não há nota, nem ranking, " +
       "nem a palavra &ldquo;errou&rdquo;: o erro responde na hora e diz o que " +
       "olhar, e a ajuda cresce a cada tentativa (dica &rarr; apoio concreto &rarr; " +
       "revelar).</p>";

  if(C.evidencia && C.evidencia.length){
    h += "<p class='dsub'><b>O que foi medido antes de publicar</b></p><ul class='dev'>";
    for(k = 0; k < C.evidencia.length; k++) h += "<li>" + esch(C.evidencia[k]) + "</li>";
    h += "</ul>";
  }
  return h;
}
function abreDossie(){
  var cx = document.getElementById("dsCorpo");
  if(!cx) return;
  if(typeof calar === "function") calar();
  cx.innerHTML = dossieHTML();
  document.getElementById("dossie").className = "aberto";
  cx.scrollTop = 0;
}
function fechaDossie(){ document.getElementById("dossie").className = ""; }
(function(){
  var b = document.getElementById("bDossie"), f = document.getElementById("dsFechar"),
      cx = document.getElementById("dossie");
  if(b) b.onclick = function(){ fechaMenuProf(); abreDossie(); };
  if(f) f.onclick = fechaDossie;
  if(cx) cx.onclick = function(ev){ if(ev.target === this) fechaDossie(); };

  /* o segundo caminho: o botão nasce DENTRO do relatório, quando ele abre.
     Fica ali e não na tela final porque o relatório é a parte que a criança
     não vê — e o dossiê é conversa de adulto. */
  if(typeof abreRelatorio === "function"){
    var antes = abreRelatorio;
    abreRelatorio = function(){
      antes.apply(this, arguments);
      var r = document.getElementById("relatorio");
      if(r && !r.querySelector(".bdossie")){
        var bt = document.createElement("button");
        bt.className = "bt bdossie";
        bt.textContent = "Dossiê pedagógico (currículo da rede)";
        bt.onclick = abreDossie;
        r.appendChild(bt);
      }
    };
  }
}());
/*</dossie-js>*/

/* ⭐ o botão "Terminar" e o "Voltar para o caderno" — ver o comentário do fim() */
(function(){
  var bt = document.getElementById("bTerminar");
  if(bt) bt.onclick = function(){
    var falta = 0, pz;
    for(pz = 1; pz <= NOMES.length; pz++) falta += pendentes(pz);
    if(falta && !confirm("Quer fechar o caderno e ver o seu boletim?\n\nVocê pode voltar depois e continuar de onde parou."))
      return;
    fim();
  };
  var bv = document.getElementById("bVoltar");
  if(bv) bv.onclick = function(){
    document.getElementById("fim").style.display = "none";
    vaiPara(ST.pag || 1);
  };
})();

/* ============================================================
   AS PEÇAS NOVAS DESTE CADERNO — quatro, e cada uma nasceu de um VERBO que as
   89 folhas de papel pedem e que a casa ainda não tinha. Elas entram no
   `_padrao/INTERATIVIDADES-FOLHA.md` no mesmo commit.
   ============================================================ */

/* ---------- PEÇA 1: BOLINHAS + PRONTO (contar) ----------
   Clonada do `_fra1` folha 4, que é onde ela já passou pelo Marcos. O que muda
   aqui é o que se conta: lá eram PALAVRAS da frase, aqui são SÍLABAS da palavra.
   ⚠️ AS BOLINHAS PINTAM SEMPRE DA ESQUERDA PARA A DIREITA — a criança de sete
      anos não conta buraco no meio da fila (lição paga no `_fra1`).
   ⚠️ E O ITEM NÃO FECHA NO CLIQUE DA BOLINHA: fecha no "Pronto". É o contrato
      `pronto-<id>` do `_qa/joga_folha.js`, e é dela a decisão de conferir. */
function filaBolinhas(box, id, quantas, pi, fCerto, fDica, aoFechar){
  var fila = el("div", "bolinhas"), feito = !!ST.resp[id];
  var marc = feito ? quantas : 0, bols = [], k;
  for(k = 0; k < 6; k++){
    (function(k){
      var b = el("button", "bolinha" + (feito && k < quantas ? " cheia" : ""), "");
      b.setAttribute("data-qa", "bol-" + id + "-" + k);
      b.setAttribute("aria-label", "bolinha " + (k + 1));
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso();
        marc = (k < marc) ? k : k + 1;
        for(var j = 0; j < bols.length; j++)
          bols[j].className = "bolinha" + (j < marc ? " cheia" : "");
      };
      fila.appendChild(b); bols.push(b);
    })(k);
  }
  box.appendChild(fila);
  var pr = el("button", "bt verde pronto", "Pronto");
  pr.setAttribute("data-qa", "pronto-" + id);
  pr.onclick = function(){
    if(ST.resp[id]) return;
    if(marc === quantas){
      acertou(id, fCerto); box.className = "item feito";
      if(aoFechar) aoFechar();
    } else {
      sErro(); fila.className = "bolinhas erro";
      setTimeout(function(){ fila.className = "bolinhas"; }, 480);
      errou(id, fDica);
    }
  };
  if(feito) pr.style.display = "none";
  box.appendChild(pr);
}

/* ---------- PEÇA 2: CORTAR A PALAVRA (separar em sílabas) ----------
   As folhas de papel dão as caixinhas já contadas e mandam ESCREVER a sílaba em
   cada uma (a33, a72, a79: *"LEIA E SEPARE AS SÍLABAS"*). Na tela o gesto que
   sobra igual é melhor: a criança toca no LUGAR onde a palavra se parte, e vê a
   tesourinha cair ali.
   ⚠️ O ALVO É A FRESTA, NÃO A LETRA — e ela precisa ter 40 px de toque (portão
      `4b`), senão o dedo de sete anos erra. Daí a fresta ser larga e o
      quadradinho da letra, estreito.
   ⚠️ CONTRATO DO JOGADOR: cada fresta publica `op-<id>-g<n>` e a resposta
      declarada é a lista das frestas certas ("g2 g4"). */
function cortaPalavra(box, id, pi, palavra, cortes, fCerto, fDica){
  var feito = !!ST.resp[id];
  registra(id, pi, cortes.map(function(n){ return "g" + n; }).join(" "));
  var lin = el("div", "cortar"), achados = {}, n;
  for(n = 0; n < palavra.length; n++){
    lin.appendChild(el("span", "clt", palavra.charAt(n)));
    if(n < palavra.length - 1){
      (function(pos){
        var certo = cortes.indexOf(pos) > -1;
        var f = el("button", "fresta" + (feito && certo ? " cortada" : ""), "");
        f.setAttribute("aria-label", "cortar depois da letra " + palavra.charAt(pos - 1));
        f.setAttribute("data-qa", certo ? "op-" + id + "-g" + pos : "no-" + id + "-" + pos);
        f.onclick = function(){
          if(ST.resp[id]) return;
          sPasso();
          if(!certo){
            f.className = "fresta nao";
            setTimeout(function(){ f.className = "fresta"; }, 420);
            errou(id, fDica); return;
          }
          if(achados["g" + pos]) return;
          achados["g" + pos] = 1; f.className = "fresta cortada";
          var quantas = 0, q;
          for(q in achados) if(achados.hasOwnProperty(q)) quantas++;
          if(quantas === cortes.length){ acertou(id, fCerto); box.className = "item feito"; }
          else sPasso();
        };
        lin.appendChild(f);
      })(n + 1);
    }
  }
  box.appendChild(lin);
}

/* ---------- PEÇA 3: MARCAR VÁRIOS + CONFERIR ----------
   Das folhas que mandam *"PINTE AS SÍLABAS QUE FORMAM O NOME DAS FIGURAS"*
   (a12, a28, a53, a65). A criança marca quantas quiser e só depois confirma —
   e é isso que deixa ela se corrigir, que numa folha de sete anos vale mais que
   acertar de primeira.
   ⚠️ CONTRATO: as peças certas publicam `op-<id>-<chave>`, e o botão de fechar,
      `conferir-<id>`. */
function marqueConfira(box, id, pi, pecas, fCerto, fDica){
  var feito = !!ST.resp[id], marcadas = {}, bts = [];
  registra(id, pi, pecas.filter(function(p){ return p.ok; })
                        .map(function(p){ return p.k; }).join(" "));
  var cx = el("div", "sils");
  pecas.forEach(function(P){
    var b = el("button", "sil" + (feito && P.ok ? " ok" : ""), P.t);
    b.setAttribute("aria-label", P.t);
    b.setAttribute("data-qa", (P.ok ? "op-" : "no-") + id + "-" + P.k);
    b.onclick = function(){
      if(ST.resp[id]) return;
      sPasso();
      /* ⭐ a peça diz o que está escrito nela ao ser tocada — aqui nada
         interrompe, porque a conferência só acontece no botão Conferir. */
      if(P.fala) P.fala();
      if(marcadas[P.k]){ delete marcadas[P.k]; b.className = "sil"; }
      else { marcadas[P.k] = 1; b.className = "sil marcada"; }
    };
    cx.appendChild(b); bts.push({b: b, P: P});
  });
  box.appendChild(cx);
  var cf = el("button", "bt verde pronto", "Conferir");
  cf.setAttribute("data-qa", "conferir-" + id);
  cf.onclick = function(){
    if(ST.resp[id]) return;
    var certo = true;
    bts.forEach(function(x){ if(!!marcadas[x.P.k] !== !!x.P.ok) certo = false; });
    if(certo){
      bts.forEach(function(x){ if(x.P.ok) x.b.className = "sil ok"; });
      acertou(id, fCerto); box.className = "item feito"; cf.style.display = "none";
    } else {
      sErro(); cx.className = "sils erro";
      setTimeout(function(){ cx.className = "sils"; }, 480);
      errou(id, fDica);
    }
  };
  if(feito) cf.style.display = "none";
  box.appendChild(cf);
}

/* ---------- PEÇA 4: PINTAR PELA LEGENDA ----------
   Da a35 (*"Pinte a flor de acordo com a legenda"*) e da a29 (*"Circule as
   palavras da quadrinha conforme a legenda"*). São DOIS toques: primeiro a
   canetinha do estojo, depois a pétala.
   ⚠️ CONTRATO: o estojo publica `lapis-<cor>` e cada alvo publica
      `pinta-<id>-<n>` mais `data-lapis="<cor>"`. Sem isso o jogador da banca
      pinta tudo com a primeira cor e acusa a folha de não fechar. */
var LAPIS = null;
function estojo(d, cores){
  var cx = el("div", "estojo");
  cores.forEach(function(C){
    var b = el("button", "cnt cnt-" + C.k, C.n);
    b.setAttribute("data-qa", "lapis-" + C.k);
    b.setAttribute("aria-label", "canetinha " + C.n);
    b.onclick = function(){
      sPasso(); LAPIS = C.k;
      var t = cx.querySelectorAll(".cnt"), i;
      for(i = 0; i < t.length; i++) t[i].className = t[i].className.replace(" pega", "");
      b.className += " pega";
      falar("lapis_" + C.k);
    };
    cx.appendChild(b);
  });
  d.appendChild(cx);
  return cx;
}
function pintavel(el2, id, pi, cor, fCerto, fDica, box){
  el2.setAttribute("data-qa", "pinta-" + id + "-0");
  el2.setAttribute("data-lapis", cor);
  if(ST.resp[id]) el2.className += " pin pin-" + cor;
  el2.onclick = function(){
    if(ST.resp[id]) return;
    if(!LAPIS){ sPasso(); falar("pegue_lapis"); return; }
    sPasso();
    if(LAPIS === cor){
      el2.className += " pin pin-" + cor;
      acertou(id, fCerto); if(box) box.className = "item feito";
    } else {
      el2.className += " sacode";
      setTimeout(function(){ el2.className = el2.className.replace(" sacode", ""); }, 420);
      errou(id, fDica);
    }
  };
}

/* ============================================================
   AS 35 FOLHAS. Cada uma diz de qual folha de papel nasceu e o comando
   impresso VERBATIM. O crivo inteiro está em `_sequencias/POTE-SIL2.md`.
   ============================================================ */

/* ===== BLOCO A — A BOCA ABRE (1 a 5) ===== */

/* 1 e 2 — BATA PALMA
   ⭐ Da a78, e o comando não é o do exercício: é a NOTA AO PROFESSOR impressa no
      rodapé dela, VERBATIM: *"peça aos alunos que leiam as palavras em voz alta
      e batam palmas, todas as vezes que abrirem a boca para falar uma sílaba"*.
      É a chave didática do caderno inteiro — a sílaba não se explica, se SENTE.
      Por isso ela é a folha 1, e por isso o botão de ouvir vem antes de tudo.
   ⚠️ A 2 é o par da 1 (estratégia do Marcos, 15/set) e o que sobe é a palavra:
      de uma e duas sílabas para três e quatro. A tela é a mesma de propósito —
      o que a criança tem de sentir é que o gesto serve para palavra comprida. */
function f01(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque no alto-falante e diga a palavra em voz alta. " +
            "Pinte <b>uma bolinha</b> cada vez que a boca abrir.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var B = BAT[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, String(B.s.length));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", B.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("diz_" + k); }));
    box.appendChild(lin);
    filaBolinhas(box, id, B.s.length, pi, "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f02(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora as palavras são maiores. Diga em voz alta e pinte " +
            "<b>uma bolinha</b> para cada vez que a boca abre.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var B = BAT[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, String(B.s.length));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", B.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("diz_" + k); }));
    box.appendChild(lin);
    filaBolinhas(box, id, B.s.length, pi, "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* 3 e 4 — ONDE A PALAVRA SE PARTE
   Da a72, VERBATIM: *"Separe as sílabas de cada palavra."*, e da a33/b37,
   VERBATIM: *"LEIA E SEPARE AS SÍLABAS:"*.
   ⭐ A 3 traz as QUATRO PALAVRAS MAIS FÁCEIS das 89 folhas (maçã, pipa, sapo,
      pato) — é a primeira vez que a criança corta, e não se começa difícil.
   ⭐ A 4 sobe e traz o que o currículo nomeia por extenso: CCV (BLUSA, PLANTA,
      TRIGO) e CVC (PORTA, CARTA), que quase nenhuma folha colhida cobre. */
function f03(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Diga a palavra devagar. Toque na <b>fresta</b> onde ela se " +
            "parte em dois pedaços.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = COR[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Escute e depois corte."));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("cor_" + k); }));
    box.appendChild(lin);
    cortaPalavra(box, id, pi, C.p, C.g, "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f04(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Estas são mais difíceis. Algumas se partem em <b>três</b> " +
            "pedaços — toque em todas as frestas.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = COR[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Escute e depois corte."));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("cor_" + k); }));
    box.appendChild(lin);
    cortaPalavra(box, id, pi, C.p, C.g, "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* 5 — TODA SÍLABA TEM UMA VOGAL
   ⭐ BLOCO NOVO, DECLARADO. Nenhuma das 89 folhas pede isto, e a habilidade do
      2º ano de Blumenau diz com todas as letras: *"…identificando que existem
      vogais em todas as sílabas."* Currículo pede, papel não cobre: entra
      declarado (regra do `SEQUENCIAS-DIDATICAS.md §2`).
   ⭐ E ELA FECHA O BLOCO A com a descoberta: a boca abre porque tem uma vogal
      ali. A criança bateu palma quatro folhas seguidas; agora vê o porquê. */
function f05(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Em cada pedaço há <b>uma vogal</b> — é ela que faz a boca " +
            "abrir. Toque na vogal de cada pedaço.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var V = VOG[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var alvos = [], cx = el("div", "cortar");
    V.s.forEach(function(sb, n){
      var cxs = el("span", "pedaco"), t;
      for(t = 0; t < sb.length; t++){
        (function(t, n){
          var certa = (t === V.v[n]);
          var b = el("button", "clt lt" + (ST.resp[id] && certa ? " vogal" : ""), sb.charAt(t));
          b.setAttribute("aria-label", "letra " + sb.charAt(t));
          /* ⚠️⚠️ O NOME DA PECA ERRADA NAO PODE TERMINAR IGUAL AO DA CERTA.
             Eu publiquei `no-<id>-s0` para as letras erradas e `op-<id>-s0`
             para a certa — e o jogador da banca acha a peca pelo FINAL do
             nome, entao ele clicava numa errada e a folha nunca fechava.
             O defeito nao era da folha: era do nome que eu dei. As erradas
             agora terminam em `-x<silaba>-<letra>`, que nunca colide. */
          b.setAttribute("data-qa", certa ? ("op-" + id + "-s" + n)
                                          : ("no-" + id + "-x" + n + "-" + t));
          if(certa) alvos.push("s" + n);
          b.onclick = function(){
            if(ST.resp[id]) return;
            sPasso();
            if(!certa){
              b.className = "clt lt nao";
              setTimeout(function(){ b.className = "clt lt"; }, 420);
              errou(id, "dica" + pi + "_" + k); return;
            }
            if(b.className.indexOf("vogal") > -1) return;
            b.className = "clt lt vogal";
            var feitos = cx.querySelectorAll(".vogal").length;
            if(feitos === V.s.length){ acertou(id, "certo" + pi + "_" + k); box.className = "item feito"; }
          };
          cxs.appendChild(b);
        })(t, n);
      }
      cx.appendChild(cxs);
      if(n < V.s.length - 1) cx.appendChild(el("span", "tra", "-"));
    });
    registra(id, pi, alvos.join(" "));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Ouça os pedaços."));
    lin.appendChild(botaoSom("Ouvir", function(){ falar("vog_" + k); }));
    box.appendChild(lin);
    box.appendChild(cx);
    fechaItem(d, box, id);
  });
}

/* ===== BLOCO B — LETRA NÃO É SÍLABA (6 a 8) ===== */

/* 6 e 7 — CONTAR LETRAS E CONTAR SÍLABAS
   Da a07 (*"SEPARE OS NOMES DOS ANIMAIS EM SÍLABAS E RESPONDA AS PERGUNTAS"* —
   quantas letras? quantas sílabas?), da a73 e, sobretudo, da a61, VERBATIM:
   *"SEPARE EM CADA QUADRO, AS LETRAS E AS SÍLABAS DAS PALAVRAS"*.
   ⭐ A a61 É A MELHOR DAS 89 PARA ISTO porque mostra a mesma palavra em DUAS
      LINHAS: a criança vê que uma tem mais caixas que a outra. É o nó do
      degrau, e é por isso que a 7 mostra as duas linhas lado a lado. */
function f06(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Quantas <b>letras</b> tem a palavra? E quantas " +
            "<b>sílabas</b>? Repare: o número não é o mesmo.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var L = LET[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", L.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("let_" + k); }));
    box.appendChild(lin);
    box.appendChild(el("div", "ajuda", "Quantas <b>sílabas</b>?"));
    var ops = [];
    [1, 2, 3, 4].forEach(function(n){
      ops.push({v: String(n), rot: String(n), aria: String(n) + " sílabas",
                fala: "num_" + n});
    });
    opcoes(box, pi, id, ops, String(L.S), "num",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto(L.p + " tem " + L.L + " letras e " +
                                                 L.S + (L.S === 1 ? " sílaba." : " sílabas."), id));
                       box.appendChild(x); });
    fechaItem(d, box, id);
  });
}
function f07(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "A mesma palavra em duas linhas: em cima as <b>letras</b>, " +
            "embaixo as <b>sílabas</b>. Quantas caixas tem a linha de baixo?",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var L = LET[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", L.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("let_" + k); }));
    box.appendChild(lin);
    var duas = el("div", "duaslinhas"), t;
    var lA = el("div", "linhacx");
    for(t = 0; t < L.L; t++) lA.appendChild(el("span", "cxl", L.p.charAt(t)));
    duas.appendChild(el("div", "rotlin", "letras"));
    duas.appendChild(lA);
    var lB = el("div", "linhacx");
    for(t = 0; t < L.S; t++) lB.appendChild(el("span", "cxs2", ""));
    duas.appendChild(el("div", "rotlin", "sílabas"));
    duas.appendChild(lB);
    box.appendChild(duas);
    var ops = [];
    [1, 2, 3, 4].forEach(function(n){
      ops.push({v: String(n), rot: String(n), aria: String(n) + " sílabas",
                fala: "num_" + n});
    });
    opcoes(box, pi, id, ops, String(L.S), "num",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* 8 — QUAL ESTÁ SEPARADA CERTO
   Da a16, item 3, VERBATIM: *"Marque a alternativa em que a palavra MACARRÃO
   está separada corretamente."*
   ⭐ FECHA O BLOCO B, e por um motivo: até aqui a criança cortou e contou; agora
      ela JULGA o corte de outra pessoa, que é um degrau acima de fazer o seu. */
function f08(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Três jeitos de partir a mesma palavra. Só <b>um</b> está " +
            "certo — qual?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var Q = QZ[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", Q.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("qz_" + k); }));
    box.appendChild(lin);
    var ops = Q.ops.map(function(t, n){
      return {v: "o" + n, rot: t, aria: t, fala: "qzop_" + k + "_" + n};
    });
    opcoes(box, pi, id, ops, "o" + Q.r, "pal",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ===== BLOCO C — O ARMÁRIO DAS QUATRO GAVETAS (9 a 14) ===== */

/* 9 a 12 — AS GAVETAS
   ⭐ O ARMÁRIO VEM DA b16, que desenha exatamente isto: um móvel com gavetas e
      um banco de palavras de ROUPA para guardar em cada uma. É dela que sai o
      nome do caderno — a gaveta deixa de ser metáfora de professor e vira um
      lugar onde a criança guarda coisa.
   ⚠️ AS QUATRO VÊM COLADAS (regra do Marcos contra o *"isso eu já fiz"*), e o
      que sobe NÃO é a tela, é o apoio que some:
        9  duas gavetas só (1 e 2 sílabas), para o gesto entrar;
        10 as quatro de uma vez;
        11 as palavras são ROUPA — o armário da b16, com PIJAMINHA e SAPATEIRA,
           que obrigam a contar até quatro e cinco;
        12 material escolar, e a CALCULADORA tem CINCO sílabas: é onde "4 ou
           mais" deixa de ser "exatamente 4".
   ⚠️ AS DUAS PORTAS, sempre: arrastar a palavra até a gaveta (PC da escola) e
      tocar na palavra e depois na gaveta (celular). Já vem do `gavetas()`. */
function f09(d, pi){ gavetas(d, pi,  "gA",
  "Diga a palavra e bata palma. Guarde cada uma na gaveta do número de " +
  "palmas que você bateu."); }
function f10(d, pi){ gavetas(d, pi,  "gB",
  "Agora o armário tem <b>quatro</b> gavetas. A última é das palavras mais " +
  "compridas: <b>4 ou mais</b> palmas."); }
function f11(d, pi){ gavetas(d, pi,  "gC",
  "Este é o armário de <b>roupa</b>. Guarde cada peça na gaveta certa."); }
function f12(d, pi){ gavetas(d, pi,  "gD",
  "E este é o da <b>mochila</b>. Atenção: uma delas tem <b>cinco</b> " +
  "sílabas — e cinco também é <b>4 ou mais</b>."); }

/* 13 — PINTE A FLOR PELA LEGENDA
   Da a35, VERBATIM: *"Pinte a flor de acordo com a legenda:"*
   ⭐ MESMO CONTEÚDO, OUTRO GESTO — e é de propósito: depois de quatro folhas
      arrastando palavra para gaveta, a criança pega a canetinha. É o que
      impede o *"isso eu já fiz"* sem trocar o que ela está aprendendo.
   ⚠️ NA FOLHA DE PAPEL A LEGENDA VEM FORA DE ORDEM (mono, poli, dis, tris).
      Aqui ela vai em ordem: a ordem é parte do que a criança está aprendendo. */
function f13(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Pegue uma canetinha e pinte a pétala da cor certa, " +
            "conforme a legenda.", "p" + pi + "enun");
  estojo(d, [{k: "m", n: "1 sílaba"}, {k: "d", n: "2 sílabas"},
             {k: "t", n: "3 sílabas"}, {k: "p", n: "4 ou mais"}]);
  var flor = el("div", "flor");
  ST.folha["p" + pi].forEach(function(k, i){
    var F = FLOR[k], id = "n" + pi + "_" + i;
    registra(id, pi, F.c);
    var pet = el("button", "petala", F.p);
    pet.setAttribute("aria-label", F.p);
    pintavel(pet, id, pi, F.c, "certo" + pi + "_" + k, "dica" + pi + "_" + k, null);
    flor.appendChild(pet);
  });
  d.appendChild(flor);
  d.appendChild(el("div", "ajuda cent", "Pinte todas as pétalas."));
}

/* 14 — LIGUE A PALAVRA À SUA GAVETA
   Da a15, item 2, VERBATIM: *"Ligue as figuras conforme a classificação
   silábica de seus nomes."*
   ⭐ FECHA O BLOCO C e é a prova de que a criança já tem os quatro nomes na
      cabeça: aqui ela não escolhe entre opções nem arrasta para uma gaveta com
      o nome escrito grande — ela LIGA, e a linha que ela desenha é a resposta.
   ⚠️ ESTA É A ÚNICA FOLHA DE LIGAR DO CADERNO, e por isso `var LIGAR = [14]` lá
      em cima. Número errado ali quebra DUAS folhas de uma vez — a que liga
      nunca fecha, e a apontada por engano fecha sozinha (medido no `_rima1`). */
function f14(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque numa palavra da esquerda e depois na gaveta dela, " +
            "à direita.", "p" + pi + "enun");
  var grupo = ST.folha["p" + pi][0];
  var pares = grupo.map(function(k){
    return {k: k,
            esq: '<span class="rotop">' + LIGA[k].p + "</span>",
            dir: LIGA[k].c,
            ariaE: LIGA[k].p, ariaD: LIGA[k].c,
            fe: "lig_" + k, fd: "ligc_" + k,
            fc: "certo" + pi + "_" + k, dica: "dica" + pi + "_" + k};
  });
  var cx = el("div", "");
  montaLigar(cx, pi, "g0", pares, d);
  d.appendChild(cx);
}

/* ===== BLOCO D — MEXER NAS SÍLABAS (15 a 20) ===== */

/* 15 e 16 — MONTE A PALAVRA
   Da a56, VERBATIM: *"Ordene as sílabas e forme o nome das figuras:"*, e da
   a42, VERBATIM: *"Organize as sílabas para formar as palavras."*
   ⭐ AQUI VIRA O JOGO: até a folha 14 a criança SEPARAVA; daqui em diante ela
      JUNTA. É a mesma peça vista do outro lado, e é o que o currículo pede
      quando diz *"remover e substituir sílabas… para criar novas palavras"*.
   ⚠️ A 16 é o par da 15 e sobe: quatro e cinco sílabas (NADADORA, CHOCOLATE).
   ⚠️ CONTRATO DO JOGADOR: a resposta declarada é a ORDEM das sílabas, e cada
      botão publica `op-<id>-<posição na palavra>`. */
function montaOrdenar(d, pi, fonte){
  ST.folha["p" + pi].forEach(function(k, i){
    var O = fonte[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var certo = [], n;
    for(n = 0; n < O.s.length; n++) certo.push("s" + n);
    registra(id, pi, certo.join(" "));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Ouça a palavra e monte-a."));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("ord_" + k); }));
    box.appendChild(lin);
    var vaga = el("div", "vagas"), feitas = 0;
    var cxs = [], t;
    for(t = 0; t < O.s.length; t++){
      var c = el("span", "cxs2" + (ST.resp[id] ? " cheia" : ""),
                 ST.resp[id] ? O.r.split("").length && "" : "");
      cxs.push(c); vaga.appendChild(c);
    }
    if(ST.resp[id]) vaga.innerHTML = '<span class="cxs2 cheia">' +
      O.s.slice(0).join('</span><span class="cxs2 cheia">') + "</span>";
    box.appendChild(vaga);
    var cx = el("div", "sils");
    baralha(O.s.map(function(sb, n){ return {sb: sb, n: n}; })).forEach(function(P){
      /* ⚠️ a posição CERTA da sílaba na palavra é a ordem em que ela aparece no
         gabarito, não a ordem em que ela está desenhada — daí o `P.n`. */
      var b = el("button", "sil", P.sb);
      b.setAttribute("aria-label", P.sb);
      b.setAttribute("data-qa", "op-" + id + "-s" + P.n);
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso();
        /* ⭐ o pedaço FALA ao ser tocado — é como a criança confere se aquele é
           mesmo o som que ela está procurando. Sem isto a folha vira adivinha
           para quem ainda não lê. */
        falaDaSilaba(P.sb)();
        if(P.n !== feitas){
          b.className = "sil nao";
          setTimeout(function(){ b.className = "sil"; }, 420);
          errou(id, "dica" + pi + "_" + k); return;
        }
        b.className = "sil usada";
        cxs[feitas].innerHTML = P.sb; cxs[feitas].className = "cxs2 cheia";
        feitas++;
        if(feitas === O.s.length){ acertou(id, "certo" + pi + "_" + k); box.className = "item feito"; }
      };
      cx.appendChild(b);
    });
    box.appendChild(cx);
    fechaItem(d, box, id);
  });
}
function f15(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "As sílabas se embaralharam. Toque nelas <b>na ordem</b> " +
            "para a palavra voltar.", "p" + pi + "enun");
  montaOrdenar(d, pi, ORD);
}
function f16(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora são palavras compridas. Diga a palavra baixinho " +
            "antes de começar — ajuda a achar o primeiro pedaço.", "p" + pi + "enun");
  montaOrdenar(d, pi, ORD);
}

/* 17, 18 e 19 — A SÍLABA QUE FALTA
   ⭐ AS TRÊS JUNTAS COBREM O QUE O CURRÍCULO NOMEIA POR EXTENSO: *"…remover e
      substituir sílabas INICIAIS, MEDIAIS ou FINAIS para criar novas
      palavras."* Uma folha para cada posição, coladas, nessa ordem.
   17 — da a03, VERBATIM: *"QUE SÍLABA ESTÁ FALTANDO? COMPLETE."* (a do começo)
   18 — da a23, VERBATIM: *"RECORTE E COLE AS SÍLABAS CORRETAS QUE ESTÃO
        FALTANDO EM CADA PALAVRA"*. ⭐ É A ÚNICA DAS 89 QUE PEDE A DO MEIO, e
        sem ela o degrau ficaria pela metade.
   19 — da a08, item 3, VERBATIM: *"LIGUE CADA FIGURA À SUA SÍLABA FINAL."* */
function montaFalta(d, pi, ondeFala){
  ST.folha["p" + pi].forEach(function(k, i){
    var F = FAL[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande",
      (F.a ? '<span class="pd">' + F.a + "</span>" : "") +
      '<i class="lacuna"></i>' +
      (F.z ? '<span class="pd">' + F.z + "</span>" : "")));
    lin.appendChild(botaoSom("Ouvir a palavra inteira", function(){ falar(ondeFala + "_" + k); }));
    box.appendChild(lin);
    var ops = baralha(F.ops.map(function(sb){
      return {v: sb.toLowerCase(), rot: sb, aria: sb, fala: falaDaSilaba(sb)};
    }));
    opcoes(box, pi, id, ops, F.r.toLowerCase(), "pal",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto(F.q, id)); box.appendChild(x); });
    fechaItem(d, box, id);
  });
}
function f17(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Falta o pedaço do <b>começo</b>. Ouça a palavra inteira e " +
            "escolha.", "p" + pi + "enun");
  montaFalta(d, pi, "fal");
}
function f18(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora falta o pedaço do <b>meio</b> — o mais difícil de " +
            "ouvir. Diga a palavra devagar.", "p" + pi + "enun");
  montaFalta(d, pi, "fal");
}
function f19(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "E agora falta o pedaço do <b>fim</b>.", "p" + pi + "enun");
  montaFalta(d, pi, "fal");
}

/* 20 — UMA SÍLABA, TRÊS PALAVRAS
   Da a58, VERBATIM: *"JUNTE AS SÍLABAS E FORME PALAVRAS."*, e a folha faz sair
   TRÊS palavras de uma sílaba só: BA → BALA, BATATA, BANANA.
   ⭐ FECHA O BLOCO D com a ideia grande dele: a sílaba não pertence a uma
      palavra — é uma peça solta que serve em muitos lugares. É a diferença
      entre decorar palavras e entender como elas são feitas.
   ⚠️ TRÊS POSIÇÕES DO POTE POR ITEM não: aqui o pote lista as SÍLABAS INICIAIS
      (w1..w4) e cada uma é um item com três encaixes. Quem conta é o pote. */
function f20(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Um pedaço só serve para <b>três</b> palavras. Junte-o a " +
            "cada final e veja o que aparece.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var J = JUN[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var alvos = [], n;
    for(n = 0; n < J.f.length; n++) alvos.push("j" + n);
    registra(id, pi, alvos.join(" "));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", '<span class="pd forte">' + J.i + "</span>"));
    lin.appendChild(botaoSom("Ouvir o pedaço", falaDaSilaba(J.i)));
    box.appendChild(lin);
    var cx = el("div", "juntas"), feitos = 0;
    J.f.forEach(function(fim, n){
      var linha = el("div", "juntalin");
      var b = el("button", "sil" + (ST.resp[id] ? " usada" : ""), J.i + " + " + fim);
      b.setAttribute("aria-label", J.i + " mais " + fim);
      b.setAttribute("data-qa", "op-" + id + "-j" + n);
      var saida = el("span", "saida", ST.resp[id] ? J.r[n] : "");
      b.onclick = function(){
        if(ST.resp[id] || b.className.indexOf("usada") > -1) return;
        sPasso(); b.className = "sil usada"; saida.innerHTML = J.r[n];
        falar("junr_" + k + "_" + n);
        feitos++;
        if(feitos === J.f.length){ acertou(id, "certo" + pi + "_" + k); box.className = "item feito"; }
      };
      linha.appendChild(b);
      linha.appendChild(el("span", "seta", "&rarr;"));
      linha.appendChild(saida);
      cx.appendChild(linha);
    });
    box.appendChild(cx);
    fechaItem(d, box, id);
  });
}

/* ===== BLOCO E — ACHAR A SÍLABA (21 a 25) ===== */

/* 21 e 22 — ACHE AS SÍLABAS DA PALAVRA
   Da a12, VERBATIM: *"PINTE AS SÍLABAS QUE FORMAM O NOME DAS FIGURAS."*, e o
   par sobe com a a53 (onze sílabas distratoras por item) e a a65 (distratores
   ENTRELAÇADOS: ABACATE escondido dentro de ABACAXI).
   ⭐ A criança marca quantas quiser e só depois confirma — é isso que deixa ela
      se corrigir, e numa folha de sete anos isso vale mais que acertar de
      primeira (dificuldade desejável, Bjork). */
function montaMarcar(d, pi){
  ST.folha["p" + pi].forEach(function(k, i){
    var M = MAR[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", M.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("mar_" + k); }));
    box.appendChild(lin);
    var pecas = [];
    M.g.forEach(function(sb, n){ pecas.push({k: "g" + n, t: sb, ok: 1, fala: falaDaSilaba(sb)}); });
    M.d.forEach(function(sb, n){ pecas.push({k: "d" + n, t: sb, ok: 0, fala: falaDaSilaba(sb)}); });
    marqueConfira(box, id, pi, baralha(pecas),
                  "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f21(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Marque <b>só</b> os pedaços que formam a palavra. Depois " +
            "toque em Conferir.", "p" + pi + "enun");
  montaMarcar(d, pi);
}
function f22(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora há muitos pedaços parecidos. Diga a palavra devagar " +
            "e ache os certos.", "p" + pi + "enun");
  montaMarcar(d, pi);
}

/* 23 — O CAÇA-PALAVRAS DE SÍLABAS
   Da a60, VERBATIM: *"ENCONTRE NO CAÇA-PALAVRAS DE SÍLABAS O NOME DAS CORES E
   PINTE"*.
   ⭐ É DE SÍLABAS, NÃO DE LETRAS — cada casa da grade é uma sílaba inteira. É o
      único assim das 89 folhas, e é exatamente o que este degrau treina: ler
      por blocos em vez de soletrar.
   ⚠️ CONTRATO DO JOGADOR: a palavra se acha tocando na PRIMEIRA e na ÚLTIMA
      casa dela, declaradas como `cp-<id>-a` e `cp-<id>-z`. */
function f23(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Aqui cada casa é uma <b>sílaba</b>. Ache o nome de cada " +
            "cor: toque na <b>primeira</b> casa e depois na <b>última</b>.",
            "p" + pi + "enun");
  var alvo = {}, cels = {};
  var g = el("div", "cpgrade");
  CACA.grade.forEach(function(lin, y){
    var l = el("div", "cplin");
    lin.forEach(function(sb, x){
      var b = el("button", "cpcel", sb);
      b.setAttribute("aria-label", sb);
      cels[y + "," + x] = b;
      l.appendChild(b);
    });
    g.appendChild(l);
  });
  d.appendChild(g);
  var lista = el("div", "cplista");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = CACA.pal[k], id = "n" + pi + "_" + i;
    registra(id, pi, "cpa cpz");
    var rot = el("div", "cprot" + (ST.resp[id] ? " achada" : ""), C.p);
    rot.appendChild(botaoSom("Ouvir a palavra", function(){ falar("caca_" + k); }));
    lista.appendChild(rot);
    var ca = cels[C.a[0] + "," + C.a[1]], cz = cels[C.z[0] + "," + C.z[1]];
    ca.setAttribute("data-qa", "cp-" + id + "-a");
    cz.setAttribute("data-qa", "cp-" + id + "-z");
    function marca(){
      var y = C.a[0], x;
      for(x = C.a[1]; x <= C.z[1]; x++) cels[y + "," + x].className = "cpcel achada";
      rot.className = "cprot achada";
    }
    if(ST.resp[id]) marca();
    var passo = 0;
    [ca, cz].forEach(function(cel, n){
      cel.addEventListener("click", function(){
        if(ST.resp[id]) return;
        sPasso();
        if(n === 0){ passo = 1; cel.className = "cpcel pega"; return; }
        if(passo !== 1){ falar("caca_toque"); return; }
        marca(); acertou(id, "certo" + pi + "_" + k);
      });
    });
  });
  d.appendChild(lista);
}

/* 24 — A TRILHA DO PATO
   Da a29, item 4, VERBATIM: *"Leve o pato à lagoa, pintando a trilha em que só
   há palavras trissílabas."*
   ⭐ GESTO QUE SÓ ELA PEDE NAS 89 FOLHAS: a criança não julga uma palavra de
      cada vez, apresentada sozinha — ela escolhe um CAMINHO, e cada passo só
      existe porque o anterior deu certo. É a única folha do caderno em que
      errar custa o passo, e é por isso que ela vem depois de vinte e três.
   ⚠️ E ela é UMA FOLHA DE CINCO ITENS, não cinco folhas: o pote lista os
      passos, e a folha só fecha quando o pato chega. */
function f24(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Leve o pato até a lagoa. Em cada passo, toque só na " +
            "palavra de <b>3 sílabas</b>.", "p" + pi + "enun");
  var tri = el("div", "trilha");
  ST.folha["p" + pi].forEach(function(k, i){
    var P = null, n;
    for(n = 0; n < TRI.passos.length; n++) if(TRI.passos[n].c === k) P = TRI.passos[n];
    var id = "n" + pi + "_" + i;
    var certa = null;
    P.ops.forEach(function(o, j){ if(o.ok) certa = "t" + j; });
    registra(id, pi, certa);
    var passo = el("div", "passo" + (ST.resp[id] ? " andado" : ""));
    passo.appendChild(el("div", "pnum", "passo " + (i + 1)));
    var cx = el("div", "sils");
    P.ops.forEach(function(o, j){
      var b = el("button", "sil larga" + (ST.resp[id] && o.ok ? " ok" : ""), o.p);
      b.setAttribute("aria-label", o.p);
      b.setAttribute("data-qa", (o.ok ? "op-" : "no-") + id + "-t" + j);
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso(); falar("pal_" + chaveQuadro(o.p));
        if(o.ok){ b.className = "sil larga ok"; passo.className = "passo andado";
                  acertou(id, "certo" + pi + "_" + k); }
        else { b.className = "sil larga nao";
               setTimeout(function(){ b.className = "sil larga"; }, 420);
               errou(id, "dica" + pi + "_" + k); }
      };
      cx.appendChild(b);
    });
    passo.appendChild(cx);
    tri.appendChild(passo);
  });
  d.appendChild(tri);
  d.appendChild(el("div", "ajuda cent", "A lagoa está no fim da trilha."));
}

/* 25 — ESCREVA O NOME DA FIGURA
   Da a36, item 1, VERBATIM: *"Escreva os nomes de cada figura."*, com um
   quadradinho por letra.
   ⭐ FECHA O BLOCO E, e é a primeira vez no caderno que a criança ESCREVE. Até
      aqui ela escolheu, marcou, cortou e montou com peças prontas; agora a
      palavra sai da cabeça dela para o teclado.
   ⚠️ AS DUAS PORTAS (regra do Marcos): o teclado da tela e o teclado de
      verdade. Já vem do `abreCruz`.
   ⚠️ AS FIGURAS SÃO RECORTADAS DA a64, que é a melhor mina das 89 (traço
      colorido plano, fundo branco). Nada gerado por IA — regra de 14/set. */
function f25(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Olhe a figura e monte o nome dela: as letras estão " +
            "embaralhadas ali embaixo. No computador dá para digitar.",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = CRZ[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, C.r);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "figcx", img(C.f, "fig", C.d)));
    lin.appendChild(botaoSom("Ouvir a dica", function(){ falar("crz_" + k); }));
    box.appendChild(lin);
    var grade = el("div", "cruz uma"), cels = [], t;
    grade.setAttribute("data-qa", "esc-" + id);
    for(t = 0; t < C.r.length; t++){
      var c = el("button", "ccel viva" + (ST.resp[id] ? " ok" : ""),
                 ST.resp[id] ? C.r.charAt(t) : "");
      c.setAttribute("aria-label", "Casa da palavra");
      cels.push(c); grade.appendChild(c);
    }
    box.appendChild(grade);
    /* ⭐ A FILEIRA DE LETRAS EMBARALHADAS, no lugar do teclado de 41 teclas
       (ideia do Marcos, 15/set): ela cabe numa linha horizontal, e o desafio
       desta folha é ESCREVER o nome do bicho — não escolher entre grafias
       parecidas. Nas folhas de ortografia do 5º ano ela daria a resposta, e
       por isso lá o caminho continua sendo o teclado do aparelho. */
    var teclar = fileiraLetras(box, id, pi, C.r, cels,
                               "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    /* a outra porta: tocar na grade marca este item como o ativo, e o teclado
       de verdade passa a escrever nele */
    grade.onclick = function(){ if(!ST.resp[id]) ATIVO_LETRAS = teclar; };
    fechaItem(d, box, id);
  });
}

/* ===== BLOCO F — CONTAR E OUVIR (26 a 29) ===== */

/* 26 e 27 — CONTE E MARQUE
   Da a39, VERBATIM: *"Separe as sílabas usando os quadradinhos que precisar."*,
   e da a73, VERBATIM: *"LEIA AS PALAVRAS E ESCREVA NOS QUADROS, QUANTAS LETRAS
   E SÍLABAS TÊM CADA UMA."*
   ⭐ REVISÃO ESPAÇADA, e é de propósito (Roediger/Bjork): o bater-palma da
      folha 1 volta aqui, na folha 26, depois de vinte e quatro folhas de outra
      coisa. Voltar ao que já se sabe DEPOIS de esquecer um pouco é o que fixa —
      e a criança percebe sozinha que agora é fácil.
   ⚠️ A 27 traz de volta o par letra × sílaba do bloco B, e é o único lugar do
      caderno em que uma folha reusa o pote de outra (`p27` = `p6`). */
function f26(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Lembra do começo? Diga a palavra e pinte <b>uma bolinha</b> " +
            "para cada palma.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = CON[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, String(C.n));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", C.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("con_" + k); }));
    box.appendChild(lin);
    filaBolinhas(box, id, C.n, pi, "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f27(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "E lembra que letra não é sílaba? Diga quantas " +
            "<b>sílabas</b> tem cada palavra.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var L = LET[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", L.p));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("let_" + k); }));
    box.appendChild(lin);
    box.appendChild(el("div", "ajuda", "Esta palavra tem <b>" + L.L +
                                       " letras</b>. E quantas sílabas?"));
    var ops = [];
    [1, 2, 3, 4].forEach(function(n){
      ops.push({v: String(n), rot: String(n), aria: String(n) + " sílabas",
                fala: "num_" + n});
    });
    opcoes(box, pi, id, ops, String(L.S), "num",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* 28 e 29 — O DITADO
   Da a01 e da b12, VERBATIM: *"ESCREVA AS PALAVRAS DITADAS PELA PROFESSORA NO
   ESPAÇO CORRETO."*
   ⭐⭐ AQUI A VOZ É A TAREFA, não o apoio — e é a folha que mais aproveita o
      motor desta casa. A palavra NÃO aparece escrita: a criança ouve, conta as
      sílabas de cabeça e escolhe a gaveta. Ela só vê a palavra depois de
      responder. A professora que fez a folha de papel já fazia isso em sala;
      na tela, a voz é a professora.
   ⚠️ E ELA SÓ EXISTE PORQUE TODA OPÇÃO TEM ALTO-FALANTE (portão 1o) — numa
      folha em que nada está escrito, o botão mudo seria sorteio puro.
   ⚠️ A 29 é o par da 28 e sobe de DUAS gavetas para QUATRO. */
function montaDitado(d, pi, cols){
  ST.folha["p" + pi].forEach(function(k, i){
    var D2 = DIT[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Toque para ouvir a palavra. " +
                                       "Ela não está escrita!"));
    lin.appendChild(botaoSom("Ouvir a palavra ditada", function(){ falar("dit_" + k); }));
    box.appendChild(lin);
    var ops = cols.map(function(C){
      return {v: C.k, rot: C.n, aria: C.n, fala: "gavn_" + C.k};
    });
    opcoes(box, pi, id, ops, D2.c, "pal",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto("A palavra era " + D2.p + ".", id));
                       box.appendChild(x); });
    fechaItem(d, box, id);
  });
}
function f28(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora é ditado. Ouça a palavra, conte as palmas <b>de " +
            "cabeça</b> e escolha a gaveta.", "p" + pi + "enun");
  montaDitado(d, pi, [{k: "m", n: "1 sílaba"}, {k: "d", n: "2 sílabas"}]);
}
function f29(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "O ditado das <b>quatro</b> gavetas. Ouça quantas vezes " +
            "quiser.", "p" + pi + "enun");
  montaDitado(d, pi, [{k: "m", n: "1 sílaba"}, {k: "d", n: "2 sílabas"},
                      {k: "t", n: "3 sílabas"}, {k: "p", n: "4 ou mais"}]);
}

/* ===== BLOCO G — A PALAVRA NA FRASE E NO TEXTO (30 a 32) ===== */

/* 30 — A FRASE QUE VEIO GRUDADA
   ⭐ BLOCO NOVO, DECLARADO. Nenhuma das 89 folhas traz isto, e a habilidade do
      2º ano diz: *"Segmentar corretamente as palavras ao escrever FRASES E
      TEXTOS."* Todas as folhas colhidas trabalham a palavra SOLTA — e é
      justamente ao escrever a frase que a criança de sete anos gruda
      "aboladogato". Currículo pede, papel não cobre: entra declarado (§2).
   ⚠️ O GESTO É O MESMO DAS FOLHAS 3 E 4 (cortar), e isso é de propósito: ela já
      sabe cortar palavra em sílaba; agora corta FRASE em palavra, e vê que é o
      mesmo gesto num tamanho maior. */
function f30(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Estas frases vieram sem espaço nenhum. Toque nas " +
            "<b>frestas</b> para separar as palavras.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var F = FRAS[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Ouça a frase."));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("fra_" + k); }));
    box.appendChild(lin);
    cortaPalavra(box, id, pi, F.t, F.g, "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* 31 — ACHE A PALAVRA NO TEXTO
   Da a05, item 5, VERBATIM: *"Leia o texto abaixo… Retire do texto uma palavra:
   Monossílaba…"*, e da a66, item 1: *"Retire dessa tirinha duas palavras
   dissílabas."*
   ⭐ O TEXTO É *"O CHAPÉU DA TARTARUGA"*, da a80, e vem INTEIRO porque é o único
      das 89 que é narrativa própria, curta e sem marca registrada. A criança já
      classifica palavra solta há vinte folhas; aqui ela tem de ACHAR a palavra
      dentro de um texto de verdade, que é onde a palavra mora.
   ⚠️ A RESPOSTA É UMA LISTA, não uma palavra: há muitas certas em cada linha, e
      recusar a que a criança achou seria o pior defeito possível aqui. */
function f31(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Leia a história. Depois ache no texto a palavra que cada " +
            "pergunta pede.", "p" + pi + "enun");
  var cx = el("div", "textocx"), bts = [];
  TXT.linhas.forEach(function(ln, y){
    var l = el("div", "textolin");
    ln.split(" ").forEach(function(w, x){
      var pura = w.replace(/[^A-ZÀ-Ü]/g, "");
      var b = el("button", "tp", w);
      b.setAttribute("aria-label", pura);
      b._pal = pura;
      l.appendChild(b);
      l.appendChild(document.createTextNode(" "));
      bts.push(b);
    });
    cx.appendChild(l);
  });
  var lerTudo = el("div", "enunlin");
  lerTudo.appendChild(el("div", "ajuda", "Ouça a história inteira."));
  lerTudo.appendChild(botaoSom("Ouvir a história", function(){ falar("txt_tudo"); }));
  d.appendChild(lerTudo);
  d.appendChild(cx);
  /* a primeira pergunta ainda sem resposta — é ela que o toque responde */
  function aberta(){
    var L = ST.folha["p" + pi], n;
    for(n = 0; n < L.length; n++)
      if(!ST.resp["n" + pi + "_" + n]) return "n" + pi + "_" + n;
    return null;
  }
  ST.folha["p" + pi].forEach(function(k, i){
    var P = TXT.pede[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, "w" + i);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "enun", "Ache " + P.q + " e toque nela no texto."));
    lin.appendChild(botaoSom("Ouvir o que se pede", function(){ falar("txtq_" + k); }));
    box.appendChild(lin);
    /* ⚠️ o alvo do jogador é UMA palavra declarada da lista — a primeira que
       existe no texto —, mas a criança pode tocar em QUALQUER uma das certas. */
    var primeira = null;
    bts.forEach(function(b){
      if(!primeira && P.alvo.indexOf(b._pal) > -1) primeira = b;
    });
    if(primeira) primeira.setAttribute("data-qa", "op-" + id + "-w" + i);
    bts.forEach(function(b){
      b.addEventListener("click", function(){
        if(ST.resp[id]) return;
        /* ⚠️⚠️ AQUI EU CHAMEI `pendentes(pi).indexOf(...)` E ELE DEVOLVE UM
           NÚMERO, não uma lista — `TypeError` a cada toque no texto, e o
           jogador da banca pegou. O que eu queria era outra coisa: as quatro
           perguntas dividem o MESMO texto, então um toque tem de responder a
           PRIMEIRA pergunta ainda aberta, senão a mesma palavra responderia as
           quatro de uma vez. É o que o `aberta()` faz. */
        if(aberta() !== id) return;
        sPasso(); falar("pal_" + chaveQuadro(b._pal));
        if(P.alvo.indexOf(b._pal) > -1){
          b.className = "tp achada"; acertou(id, "certo" + pi + "_" + k);
          box.className = "item feito";
        } else {
          b.className = "tp nao";
          setTimeout(function(){ b.className = "tp"; }, 420);
          errou(id, "dica" + pi + "_" + k);
        }
      });
    });
    fechaItem(d, box, id);
  });
}

/* 32 — AS QUATRO CORES NA CANTIGA
   Da a29, item 6, VERBATIM: *"Circule as palavras da quadrinha conforme a
   legenda."*
   ⭐ O SEGUNDO TEXTO DO CADERNO, e de propósito é um VERSO: na cantiga o ritmo
      já marca a sílaba sozinho — a criança canta e a batida faz o trabalho. É a
      ponte entre "contar com a mão" e "ouvir sem contar".
   ⚠️ A QUADRINHA É DE DOMÍNIO PÚBLICO (cantiga popular brasileira). */
function f32(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Cante baixinho e pinte cada palavra da cor do número de " +
            "sílabas dela.", "p" + pi + "enun");
  estojo(d, [{k: "m", n: "1 sílaba"}, {k: "d", n: "2 sílabas"}]);
  /* ⚠️⚠️ CADA PALAVRA É UM ITEM, e isto foi conserto (15/set/2026): eu tinha
     feito o item ser a CLASSE inteira ("todas as de 1 sílaba"), e aí o contrato
     do jogador — que aponta UMA peça por item — nunca fechava a folha. A flor da
     folha 13 já fazia certo; aqui é a mesma peça, na mesma casa. E para a
     criança também ficou melhor: ela vê cada palavra fechar, não um item só que
     só acende no fim. */
  var cx = el("div", "cantiga"), pos = 0, L = ST.folha["p" + pi];
  CANT.versos.forEach(function(vs){
    var l = el("div", "cantlin");
    vs.forEach(function(w){
      var id = L[pos] ? "n" + pi + "_" + pos : null;
      pos++;
      var cl = CANT.gab[w];
      var b = el("button", "tp grande", w);
      b.setAttribute("aria-label", w);
      if(id){
        registra(id, pi, cl);
        pintavel(b, id, pi, cl, "certo" + pi + "_" + cl, "dica" + pi + "_" + cl, null);
      }
      l.appendChild(b);
    });
    cx.appendChild(l);
  });
  d.appendChild(cx);
  d.appendChild(el("div", "ajuda cent",
    "Pinte <b>todas</b> as palavras: as de 1 sílaba e as de 2."));
}
/* ===== BLOCO H — ESCREVER E LEVAR (33 a 35) ===== */

/* 33 — O BANCO DE SÍLABAS
   Da a62, VERBATIM: *"QUEBRE A CABEÇA — Forme com as sílabas abaixo: 5 palavras
   dissílabas; 5 trissílabas e polissílabas."*
   ⭐ É A FOLHA 15 AO CONTRÁRIO: lá as sílabas eram da palavra e vinham
      embaralhadas; aqui elas são de MUITAS palavras, misturadas, e a criança
      tem de escolher quais servem. É a última folha de montagem, e a mais
      aberta delas. */
function f33(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Neste banco há sílabas de <b>várias</b> palavras. Monte a " +
            "que se pede, tocando nos pedaços na ordem.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var B = BANCO.pal[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var certo = [], n;
    for(n = 0; n < B.s.length; n++) certo.push("s" + n);
    registra(id, pi, certo.join(" "));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Monte uma palavra de <b>" + B.s.length +
                                       " sílabas</b>. Ouça qual é."));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("ban_" + k); }));
    box.appendChild(lin);
    var vaga = el("div", "vagas"), cxs = [], t, feitas = 0;
    for(t = 0; t < B.s.length; t++){
      var c = el("span", "cxs2" + (ST.resp[id] ? " cheia" : ""),
                 ST.resp[id] ? B.s[t] : "");
      cxs.push(c); vaga.appendChild(c);
    }
    box.appendChild(vaga);
    var cx = el("div", "sils"), usados = {};
    /* ⚠️ o banco é o MESMO para todos os itens da folha (é isso que a folha de
       papel faz), então cada sílaba certa aparece uma vez e as outras são
       distratoras de verdade — de outras palavras, não inventadas. */
    baralha(BANCO.sil.slice(0)).forEach(function(sb){
      var pos = -1, q;
      for(q = 0; q < B.s.length; q++) if(B.s[q] === sb && !usados[q]) { pos = q; break; }
      var b = el("button", "sil", sb);
      b.setAttribute("aria-label", sb);
      b.setAttribute("data-qa", (pos >= 0 ? "op-" + id + "-s" + pos
                                          : "no-" + id + "-" + chaveQuadro(sb)));
      if(pos >= 0) usados[pos] = 1;
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso();
        falaDaSilaba(sb)();
        if(pos !== feitas){
          b.className = "sil nao";
          setTimeout(function(){ b.className = "sil"; }, 420);
          errou(id, "dica" + pi + "_" + k); return;
        }
        b.className = "sil usada";
        cxs[feitas].innerHTML = sb; cxs[feitas].className = "cxs2 cheia";
        feitas++;
        if(feitas === B.s.length){ acertou(id, "certo" + pi + "_" + k); box.className = "item feito"; }
      };
      cx.appendChild(b);
    });
    box.appendChild(cx);
    fechaItem(d, box, id);
  });
}

/* 34 — O DESAFIO: ESCREVA A SUA PALAVRA
   Da a48, VERBATIM: *"PARA COMPLETAR A TABELA, ESCREVA UMA PALAVRA COM A
   QUANTIDADE DE LETRAS PEDIDA. COLOQUE UMA SÍLABA EM CADA QUADRADINHO."*
   ⭐⭐ É O FECHO DE VERDADE, e é PRODUÇÃO: depois de trinta e três folhas
      julgando a palavra dos outros, a criança escreve a DELA, dentro de duas
      restrições (a categoria e o número de sílabas). É aqui que se vê se ela
      entendeu — escolher entre três opções não prova nada disso.
   ⚠️ A FOLHA DE PAPEL ERRA: o enunciado dela diz LETRAS onde a tabela pede
      SÍLABAS. Corrigido aqui, e o erro está registrado no POTE.
   ⚠️ O GABARITO É UMA LISTA de palavras aceitas, não uma palavra: numa folha de
      produção, recusar a palavra certa da criança seria o pior defeito
      possível. O contrato do jogador pede UMA declarada — vai a primeira. */
function f34(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora é a sua vez de inventar. Escreva uma palavra que " +
            "sirva para cada pedido.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var X = DESA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, X.ok[0]);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "enun", "Escreva " + X.q + "."));
    lin.appendChild(botaoSom("Ouvir o pedido", function(){ falar("des_" + k); }));
    box.appendChild(lin);
    var grade = el("div", "cruz uma livre"), cels = [], t;
    grade.setAttribute("data-qa", "esc-" + id);
    var mx = 0;
    X.ok.forEach(function(w){ if(w.length > mx) mx = w.length; });
    for(t = 0; t < mx; t++){
      var c = el("button", "ccel viva" + (ST.resp[id] ? " ok" : ""),
                 ST.resp[id] ? (X.ok[0].charAt(t) || "") : "");
      c.setAttribute("aria-label", "Casa da palavra");
      cels.push(c); grade.appendChild(c);
    }
    /* ⚠️ `E.aceita` é o que faz esta folha ser de PRODUÇÃO: o teclado da casa
       compara com `E.w`, e aqui qualquer palavra da lista vale. */
    var E = {k: k, w: X.ok[0], aceita: X.ok, id: id, cels: cels, n: i + 1,
             rot: "Escreva a sua palavra", bt: el("span", "pista oculta", "")};
    cels.forEach(function(c){ c.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); }; });
    grade.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); };
    box.appendChild(grade);
    fechaItem(d, box, id);
  });
}

/* 35 — O CARTAZ QUE VOCÊ LEVA
   Da b27, que é a única das 89 folhas com definição E exemplo de cada uma,
   curtinho.
   ⭐⭐ O CONCEITO VEM POR ÚLTIMO, e isso é a LEI da casa (`EDUVERSE-FILOSOFIA.md`,
      Portão 0): a criança passou trinta e quatro folhas contando sílabas com a
      boca e com a mão — só agora ela recebe as quatro palavras que dão nome ao
      que ela já sabe fazer. Se este cartaz viesse na folha 1, seria aula de
      decorar nome difícil, e é exatamente assim que a maioria das folhas de
      papel começa.
   ⭐ E O CARTAZ NÃO CHEGA PRONTO: ela o monta, arrastando um exemplo para cada
      linha. O cartaz que ela leva para o caderno é o que ela construiu. */
function f35(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Você já sabe fazer tudo isto. Agora monte o cartaz: " +
            "leve cada palavra para a linha do número de sílabas dela.", "p" + pi + "enun");
  var cart = el("div", "cartaz"), linhas = {};
  CART.linhas.forEach(function(L){
    var l = el("div", "cartlin");
    var t = el("div", "cartit");
    t.innerHTML = "<b>" + L.t + "</b><span>" + L.d + "</span>";
    t.appendChild(botaoSom("Ouvir", function(){ falar("cart_" + L.k); }));
    l.appendChild(t);
    var alvo = el("div", "cartalvo");
    alvo.setAttribute("data-alvo", "1");
    alvo.setAttribute("data-qa", "alvo-cart" + pi + "_" + L.k);
    alvo.appendChild(el("span", "cartex", L.e));
    l.appendChild(alvo);
    l._v = L.k; l._dentro = alvo;
    linhas[L.k] = l;
    cart.appendChild(l);
  });
  d.appendChild(cart);
  var banco = el("div", "figbanco"), marcada = null, listaC = [];
  CART.linhas.forEach(function(L){ listaC.push(linhas[L.k]); });
  ST.folha["p" + pi].forEach(function(k, i){
    var X = CART.exem[k], id = "n" + pi + "_" + i;
    registra(id, pi, ">cart" + pi + "_" + X.c);
    var b = el("button", "op pal" + (ST.resp[id] ? " usada" : ""), X.p);
    b.setAttribute("aria-label", X.p);
    b.setAttribute("data-qa", "item-" + id);
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) linhas[X.c]._dentro.appendChild(el("span", "fdentro", X.p));
    function larga(l){
      if(ST.resp[id]) return;
      if(l._v === X.c){
        b.className = "op pal usada";
        l._dentro.appendChild(el("span", "fdentro", X.p));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + k);
      } else {
        l.className = "cartlin erro";
        setTimeout(function(){ l.className = "cartlin"; }, 500);
        errou(id, "dica" + pi + "_" + k);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar("pal_" + chaveQuadro(X.p));
      if(marcada === b){ b.className = "op pal"; marcada = null; return; }
      if(marcada) marcada.className = "op pal";
      b.className = "op pal marcada"; marcada = b;
    };
    puxavel(b, listaC, function(l){ larga(l); });
    banco.appendChild(b);
  });
  listaC.forEach(function(l){
    l.onclick = function(){
      if(!marcada){ sPasso(); falar("toque_palavra"); return; }
      marcada._larga(l);
    };
  });
  d.appendChild(banco);
}

/* ============================================================
   A FILEIRA DE LETRAS EMBARALHADAS — ideia do Marcos, 15/set/2026:
   *"ou somente colocar as letras das palavras selecionadas, embaralhadas… daí
   ocupa menos espaço e pode ser tudo na horizontal"*.

   ⭐ E ELE TEM RAZÃO NA CONTA: a fileira tem ~50 px contra os 253 px do teclado
      redistribuído (e 336 px do que estava no ar). Numa tela de 640 é 8% contra
      53% — é outra atividade.

   ⭐ E ELA É FIEL AO PAPEL: várias das 89 folhas colhidas pedem exatamente isto
      (*"Ordene as sílabas e forme o nome das figuras"*, a56; *"RECORTE AS
      SÍLABAS E COLE"*, a06). O gesto existe na folha impressa.

   ⚠️⚠️ ONDE ELA NÃO PODE ENTRAR, e isto é o mais importante deste comentário:
      em folha de ORTOGRAFIA as letras SÃO a pergunta. Numa folha que mede se a
      palavra tem Ç ou C, pôr o Ç na fileira É DAR A RESPOSTA — a folha deixa de
      medir o que existe para medir. O mesmo vale para o H mudo, e para o S/SS.
      Por isso esta peça entra na folha 25 (escrever o nome da figura, onde o
      desafio é ESCREVER, não escolher entre grafias parecidas) e NÃO entra nos
      cadernos de ortografia do 5º ano, que continuam com o teclado do aparelho.

   ⚠️ E O TECLADO DE VERDADE CONTINUA VALENDO em cima dela: as duas portas são
      regra da casa, e a criança do PC pode simplesmente digitar.
   ⚠️ CONTRATO DO JOGADOR: cada letra publica `aria-label="Letra X"`, que é a
      porta que o `_qa/joga_folha.js` usa quando a tecla não existe no teclado
      emulado (Ç, vogal acentuada).
   ============================================================ */
function fileiraLetras(box, id, pi, palavra, cels, fCerto, fDica){
  var val = "", feito = !!ST.resp[id];
  function pinta(){
    cels.forEach(function(c, i){
      c.textContent = feito ? palavra.charAt(i) : (val.charAt(i) || "");
      c.className = "ccel viva" + (feito ? " ok" : (val.charAt(i) ? " cheia" : ""));
    });
  }
  function confere(){
    if(mesmaPalavra(val, palavra)){
      feito = true; pinta();
      cx.className = "letrasfila pronta";
      acertou(id, fCerto); box.className = "item feito";
    } else {
      val = ""; pinta();
      cx.className = "letrasfila erro";
      setTimeout(function(){ cx.className = "letrasfila"; }, 480);
      bts.forEach(function(x){ x.b.className = "letrabt"; x.usada = false; });
      errou(id, fDica);
    }
  }
  var cx = el("div", "letrasfila"), bts = [];
  /* ⚠️ AS LETRAS REPETIDAS APARECEM REPETIDAS (RATO tem um A; VOVÓ tem dois O):
     dar uma letra só para duas posições deixaria a palavra impossível de
     montar — foi o defeito que o jogador pegou no banco de sílabas, e a lição
     serve igual aqui. */
  baralha(palavra.split("")).forEach(function(L, n){
    var b = el("button", "letrabt", L);
    b.setAttribute("aria-label", "Letra " + L);
    b.setAttribute("data-qa", "ltr-" + id + "-" + n);
    var reg = {b: b, L: L, usada: false};
    b.onclick = function(){
      if(feito || reg.usada) return;
      sTecla();
      reg.usada = true; b.className = "letrabt usada";
      val += L; pinta();
      if(val.length >= palavra.length) setTimeout(confere, 320);
    };
    cx.appendChild(b); bts.push(reg);
  });
  var ap = el("button", "letrabt apagar", "apagar");
  ap.setAttribute("aria-label", "Apagar a última letra");
  ap.onclick = function(){
    if(feito || !val.length) return;
    sTecla();
    var ult = val.charAt(val.length - 1), i;
    val = val.slice(0, -1);
    for(i = bts.length - 1; i >= 0; i--)
      if(bts[i].usada && bts[i].L === ult){ bts[i].usada = false; bts[i].b.className = "letrabt"; break; }
    pinta();
  };
  cx.appendChild(ap);
  box.appendChild(cx);
  pinta();
  /* a outra porta: o teclado de verdade escreve na mesma fileira */
  box._digita = function(ch){
    if(feito) return;
    if(ch === "ap"){ ap.onclick(); return; }
    if(ch === "ok"){ if(val.length) confere(); return; }
    var i;
    for(i = 0; i < bts.length; i++)
      if(!bts[i].usada && mesmaPalavra(bts[i].L, ch)){ bts[i].b.onclick(); return; }
  };
  return box._digita;
}
