const API_URL = "http://localhost:3000/produtos";

// ==================== Carregar todos os produtos ====================
function loadProducts() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => console.error("Erro ao carregar produtos:", error));
}

// ==================== Renderizar produtos na tela ====================
function renderProducts(produtos) {
    const produtosDiv = document.getElementById("produtos");
    produtosDiv.innerHTML = "";

    if (produtos.length === 0) {
        produtosDiv.innerHTML = "<p>Nenhum produto encontrado.</p>";
        return;
    }

    produtos.forEach(produto => {
        const produtoDiv = document.createElement("div");
        produtoDiv.classList.add("produto-item");

      const tamanhos = Array.isArray(produto.tamanhos) && produto.tamanhos.length > 0
    ? produto.tamanhos.join(", ")
    : "Tamanho não disponível";


       produtoDiv.innerHTML = `
    <img src="${produto.imagem}" alt="${produto.nome}" style="width: 100px;">
    <h3 class="produto-nome">${produto.nome}</h3>
    <p><strong>Categoria:</strong> ${produto.categoria || "Sem categoria"}</p>
    <p><strong>Tamanhos:</strong> ${tamanhos}</p>
    <p class="produto-preco"><strong>Preço:</strong> ${produto.preco}</p>
`;


        produtosDiv.appendChild(produtoDiv);
    });
}

// ==================== Função para remover acentos ====================
function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, "").trim();
}

// ==================== Dados de sugestões e sinônimos ====================
const suggestions = ["Camiseta", "Moleton", "Jaqueta", "Calça", "Shorts", "Tenis", "Camisa", "Calçado", "Sapato"];

const sinonimos = {
    "camiseta": ["camiseta", "camisa", "blusa", "regata"],
    "tenis": ["tenis", "sapatenis", "calcado", "calçado","sapato"],
    "calça": ["calca", "calça" ],
    "moleton": ["moleton", "blusa de frio"],
};

// ==================== Buscar produtos ====================
function buscarProdutos() {
     // Limpa filtros ativos
  document.getElementById("filtroCategoria").selectedIndex = 0;
  document.getElementById("filtroTamanho").selectedIndex = 0;
  document.getElementById("filtroPreco").selectedIndex = 0;

    const searchBox = document.getElementById('search-box');
    const inputOriginal = searchBox.value.trim();
    const input = removerAcentos(inputOriginal.toLowerCase());
    const produtosDiv = document.getElementById("produtos");

    if (input === "") return;

    // Verifica sinônimos
    let termosBusca = [input];
    for (let chave in sinonimos) {
        if (sinonimos[chave].includes(input)) {
            termosBusca = sinonimos[chave];
            break;
        }
    }

    // Monta query params com os termos de busca (ex: ?q=camisa&q=blusa)
    const queryParams = new URLSearchParams();
    termosBusca.forEach(termo => queryParams.append("q", termo));

    fetch(`${API_URL}?${queryParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
            atualizarHistorico(inputOriginal);
        searchBox.value = "";
            fecharModalPesquisa();
        })
        .catch(error => console.error("Erro ao buscar produtos:", error));
}

// ==================== Sugestões ao digitar ====================
function buscarSugestao() {
    const input = removerAcentos(document.getElementById('search-box').value.toLowerCase());
    const suggestionsBox = document.getElementById('suggestions');

    let matchingSuggestions = suggestions.filter(item =>
        removerAcentos(item.toLowerCase()).includes(input)
    );

    suggestionsBox.innerHTML = '';

    if (matchingSuggestions.length > 0) {
        matchingSuggestions.forEach(suggestion => {
            let suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = suggestion;
            suggestionItem.onclick = () => selecionarSugestao(suggestion);
            suggestionsBox.appendChild(suggestionItem);
        });

        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
}

// ==================== Selecionar sugestão ====================
function selecionarSugestao(word) {
    document.getElementById("search-box").value = word;
    buscarProdutos();
}

// ==================== Histórico ====================
function atualizarHistorico(term) {
    let historico = JSON.parse(localStorage.getItem('historicoPesquisa')) || [];
    if (term && !historico.includes(term)) {
        historico.unshift(term);
        if (historico.length > 10) historico.pop();
        localStorage.setItem('historicoPesquisa', JSON.stringify(historico));
    }
    exibirHistorico();
}

function removerDoHistorico(term) {
    let historico = JSON.parse(localStorage.getItem('historicoPesquisa')) || [];
    historico = historico.filter(item => item !== term);
    localStorage.setItem('historicoPesquisa', JSON.stringify(historico));
    exibirHistorico();
}

function exibirHistorico() {
    const historico = JSON.parse(localStorage.getItem('historicoPesquisa')) || [];
    const historicoLista = document.getElementById('history-list');
    const searchHistory = document.getElementById("search-history");

    historicoLista.innerHTML = '';

    historico.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2', 'bg-light', 'p-2', 'rounded');

        const span = document.createElement('span');
        span.textContent = item;
        span.style.cursor = "pointer";
        span.onclick = () => selecionarSugestao(item);

        const btnRemove = document.createElement('button');
        btnRemove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        btnRemove.classList.add('btn', 'btn-sm', 'btn-link', 'text-danger', 'p-0', 'ms-2');
        btnRemove.onclick = (e) => {
            e.stopPropagation();
            removerDoHistorico(item);
        };

        li.appendChild(span);
        li.appendChild(btnRemove);
        historicoLista.appendChild(li);
    });

    searchHistory.style.display = historico.length > 0 ? "block" : "none";
}

// ==================== Fechar Modal ====================
function fecharModalPesquisa() {
    const modal = document.getElementById("searchModal");
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
}

// ==================== Filtros por categoria, tamanho e preço ====================
document.addEventListener("DOMContentLoaded", function () {
    const categoriaSelect = document.getElementById("filtroCategoria");
    const tamanhoSelect = document.getElementById("filtroTamanho");
    const precoSelect = document.getElementById("filtroPreco");
 const searchBox = document.getElementById("search-box");

    searchBox.addEventListener("input", buscarSugestao); // sugestões ao digitar

    searchBox.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // evitar submit se tiver form
            buscarProdutos();
        }
    });
    function carregarProdutos() {
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                renderProducts(data);
            })
            .catch(error => console.error("Erro ao carregar produtos:", error));
    }

    function atualizarLista() {
        const categoriaSelecionada = categoriaSelect.value.trim();
        const tamanhoSelecionado = tamanhoSelect.value.trim();
        const precoSelecionado = precoSelect.value.trim();

        const queryParams = new URLSearchParams();

        if (categoriaSelecionada) queryParams.append("categoria", categoriaSelecionada);
        if (tamanhoSelecionado) queryParams.append("tamanho", tamanhoSelecionado);
        if (precoSelecionado) queryParams.append("preco", precoSelecionado);

        fetch(`${API_URL}?${queryParams.toString()}`)
            .then(response => response.json())
            .then(data => renderProducts(data))
            .catch(error => console.error("Erro ao filtrar produtos:", error));
    }

    categoriaSelect.addEventListener("change", atualizarLista);
    tamanhoSelect.addEventListener("change", atualizarLista);
    precoSelect.addEventListener("change", atualizarLista);

    
});



// ==================== Eventos ====================
document.getElementById("search-box").addEventListener("input", buscarSugestao);

document.getElementById("search-box").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        buscarProdutos();
    }
});


// Fechar sugestões ao clicar fora
document.addEventListener('click', function (event) {
    const suggestionsBox = document.getElementById('suggestions');
    if (!event.target.closest('.modal-body') && !event.target.closest('#search-box')) {
        suggestionsBox.style.display = 'none';
    }
});

function pegarSugestao() {
  fetch('http://localhost:3000/produtos/sugestao')
    .then(response => response.json())
    .then(produto => {
      const sugestaoDiv = document.getElementById('sugestao');

      sugestaoDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; margin-top: 20px;">
          <p style="font-size: 18px; font-weight: bold; color: #7f4f24; margin-bottom: 10px; text-align: center;">
            Aqui está a sugestão ideal para você:
          </p>
          <div class="produto-item" style="width: 300px; min-width: auto; margin: 0;">
            <img src="${produto.imagem}" alt="${produto.nome}" />
            <div class="produto-nome">${produto.nome}</div>
            <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error('Erro ao buscar sugestão:', error);
      document.getElementById('sugestao').innerHTML = '<p>Não foi possível carregar a sugestão.</p>';
    });
}



