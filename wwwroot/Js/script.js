// Configuração da API
const API = 'http://localhost:5178';
let produtos = [];
let fornecedores = [];
let idFornecedorEditando = null; // Variável para controlar o ID do fornecedor em edição
let idProdutoEditando = null;   // Variável para controlar o ID do produto em edição

// Função simples para fazer requisições
async function api(url, dados = null, metodo = 'GET') {
    try {
        const config = {
            method: metodo,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (dados) {
            config.body = JSON.stringify(dados);
        }
        
        const resp = await fetch(API + url, config);
        if (!resp.ok) { // Adicionado para logar erros HTTP
            const errorText = await resp.text();
            console.error(`Erro HTTP ${resp.status} na API para ${url}:`, errorText);
            return null;
        }
        return await resp.json();
    } catch (e) {
        console.error('Erro geral na função API:', e);
        return null;
    }
}

// FUNÇÕES PARA PRODUTOS
document.getElementById('form-produto').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Buscar fornecedor pelo nome
    const fornNome = document.getElementById('fornecedor').value;
    const forn = fornecedores.find(f => 
        f.nome.toLowerCase() === fornNome.toLowerCase()
    );
    
    if (!forn) {
        alert('Fornecedor não encontrado! Cadastre o fornecedor primeiro.');
        return;
    }

    const produtoDados = { 
        nome: document.getElementById('nome').value,
        preco: parseFloat(document.getElementById('preco').value),
        quantidade: parseInt(document.getElementById('quantidade').value),
        fornecedorId: forn.id
    };

    let result = null;
    let metodoApi = 'POST';
    let urlApi = '/produtos';
    let mensagemSucesso = '✅ Produto salvo com sucesso!';
    let mensagemErro = '❌ Erro ao salvar produto!';

    if (idProdutoEditando) { 
        metodoApi = 'PUT'; 
        urlApi = `/produtos/${idProdutoEditando}`; 
        mensagemSucesso = '✅ Produto atualizado com sucesso!';
        mensagemErro = '❌ Erro ao atualizar produto!';
    }

    result = await api(urlApi, produtoDados, metodoApi);

    if (result) {
        form.reset(); 
        carregarProdutos(); 
        
        idProdutoEditando = null;
        const btnSubmit = document.querySelector('#form-produto button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.textContent = 'Cadastrar Produto'; 
            btnSubmit.classList.remove('btn-update'); 
        }
        alert(mensagemSucesso);
    } else {
        alert(mensagemErro);
    }
};

// Toggle para mostrar/ocultar produtos
document.getElementById('btn-toggle-produtos').onclick = () => {
    const lista = document.getElementById('lista-produtos');
    const btn = document.getElementById('btn-toggle-produtos');
    
    if (lista.classList.contains('hidden')) {
        lista.classList.remove('hidden');
        btn.textContent = 'Ocultar Produtos';
        carregarProdutos();
    } else {
        lista.classList.add('hidden');
        btn.textContent = 'Mostrar Produtos';
    }
};

// Carregar produtos da API
async function carregarProdutos() {
    produtos = await api('/produtos') || [];
    mostrarProdutos(produtos);
}

// Exibir produtos na lista
function mostrarProdutos(lista) {
    const ul = document.getElementById('lista-produtos');
    
    if (lista.length === 0) {
        ul.innerHTML = '<li><span>Nenhum produto encontrado</span></li>';
        return;
    }
    
    ul.innerHTML = lista.map(p => `
        <li>
            <span>
                <strong>${p.nome}</strong> - 
                R$ ${p.preco.toFixed(2)} 
                (${p.quantidade} unidades) | 
                Fornecedor: ${p.fornecedor}
            </span>
            <div>
                <button class="btn-edit" onclick="editarProduto(${p.id})">Editar</button>
                <button class="btn-delete" onclick="excluirProduto(${p.id})">Excluir</button>
            </div>
        </li>
    `).join('');
}

// Pesquisa de produtos em tempo real
document.getElementById('search-produto').oninput = (e) => {
    const termo = e.target.value.toLowerCase();
    const listaProdutosElement = document.getElementById('lista-produtos');
    const btnToggleProdutos = document.getElementById('btn-toggle-produtos');

    if (listaProdutosElement.classList.contains('hidden')) {
        listaProdutosElement.classList.remove('hidden');
        btnToggleProdutos.textContent = 'Ocultar Produtos'; 
    }

    const filtrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        (p.fornecedor && p.fornecedor.toLowerCase().includes(termo))
    );
    mostrarProdutos(filtrados);
};

// FUNÇÕES PARA FORNECEDORES
document.getElementById('form-fornecedor').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const fornecedorDados = { 
        nome: document.getElementById('nome-fornecedor').value,
        // CAMPO 'TELEFONE' REMOVIDO AQUI
        cnpj: document.getElementById('cnpj-fornecedor').value || `TEMP_${Date.now()}`
    };

    let result = null;
    let metodoApi = 'POST';
    let urlApi = '/fornecedores';
    let mensagemSucesso = '✅ Fornecedor salvo com sucesso!';
    let mensagemErro = '❌ Erro ao salvar fornecedor!';

    if (idFornecedorEditando) { 
        metodoApi = 'PUT'; 
        urlApi = `/fornecedores/${idFornecedorEditando}`; 
        mensagemSucesso = '✅ Fornecedor atualizado com sucesso!';
        mensagemErro = '❌ Erro ao atualizar fornecedor!';
    }

    result = await api(urlApi, fornecedorDados, metodoApi);

    if (result) {
        form.reset(); 
        carregarFornecedores(); 
        
        idFornecedorEditando = null;
        const btnSubmit = document.querySelector('#form-fornecedor button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.textContent = 'Cadastrar Fornecedor'; 
            btnSubmit.classList.remove('btn-update'); 
        }
        alert(mensagemSucesso);
    } else {
        alert(mensagemErro);
    }
};

// Toggle para mostrar/ocultar fornecedores
document.getElementById('btn-toggle-fornecedores').onclick = () => {
    const lista = document.getElementById('lista-fornecedores');
    const btn = document.getElementById('btn-toggle-fornecedores');
    
    if (lista.classList.contains('hidden')) {
        lista.classList.remove('hidden');
        btn.textContent = 'Ocultar Fornecedores';
        carregarFornecedores();
    } else {
        lista.classList.add('hidden');
        btn.textContent = 'Mostrar Fornecedores';
    }
};

// Carregar fornecedores da API
async function carregarFornecedores() {
    fornecedores = await api('/fornecedores') || [];
    mostrarFornecedores(fornecedores);
}

// Exibir fornecedores na lista
function mostrarFornecedores(lista) {
    const ul = document.getElementById('lista-fornecedores');
    
    if (lista.length === 0) {
        ul.innerHTML = '<li><span>Nenhum fornecedor encontrado</span></li>';
        return;
    }
    
    ul.innerHTML = lista.map(f => `
        <li>
            <span>
                <strong>${f.nome}</strong> - 
                CNPJ: ${f.cnpj}
            </span>
            <div>
                <button class="btn-edit" onclick="editarFornecedor(${f.id})">Editar</button>
                <button class="btn-delete" onclick="excluirFornecedor(${f.id})">Excluir</button>
            </div>
        </li>
    `).join('');
}

// Pesquisa de fornecedores em tempo real
document.getElementById('search-fornecedor').oninput = (e) => {
    const termo = e.target.value.toLowerCase();
    const listaFornecedoresElement = document.getElementById('lista-fornecedores');
    const btnToggleFornecedores = document.getElementById('btn-toggle-fornecedores');

    if (listaFornecedoresElement.classList.contains('hidden')) {
        listaFornecedoresElement.classList.remove('hidden');
        btnToggleFornecedores.textContent = 'Ocultar Fornecedores';
    }

    const filtrados = fornecedores.filter(f => 
        f.nome.toLowerCase().includes(termo) || 
        (f.cnpj && f.cnpj.toLowerCase().includes(termo)) // 'f.telefone' REMOVIDO DA LÓGICA DE PESQUISA
    );
    mostrarFornecedores(filtrados);
};

// FUNÇÕES DE EXCLUSÃO
async function excluirProduto(id) {
    if (confirm('🗑️ Tem certeza que deseja excluir este produto?')) {
        const resp = await fetch(`${API}/produtos/${id}`, { method: 'DELETE' });
        if (resp.ok) {
            carregarProdutos();
            alert('✅ Produto excluído com sucesso!');
        } else {
            alert('❌ Erro ao excluir produto!');
        }
    }
}

async function excluirFornecedor(id) {
    if (confirm('🗑️ Tem certeza que deseja excluir este fornecedor?')) {
        const resp = await fetch(`${API}/fornecedores/${id}`, { method: 'DELETE' });
        if (resp.ok) {
            carregarFornecedores();
            alert('✅ Fornecedor excluído com sucesso!');
        } else {
            alert('❌ Erro ao excluir fornecedor!');
        }
    }
}

// FUNÇÕES DE EDIÇÃO (implementação real)
async function editarProduto(id) {
    idProdutoEditando = id; 
    const produtoParaEditar = produtos.find(p => p.id === id);

    if (produtoParaEditar) {
        document.getElementById('nome').value = produtoParaEditar.nome;
        document.getElementById('preco').value = produtoParaEditar.preco;
        document.getElementById('quantidade').value = produtoParaEditar.quantidade;
        document.getElementById('fornecedor').value = produtoParaEditar.fornecedor; 

        const btnSubmit = document.querySelector('#form-produto button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.textContent = 'Atualizar Produto';
            btnSubmit.classList.add('btn-update'); 
        }
        alert('Produto pronto para edição! Altere os campos e clique em "Atualizar Produto".');
    } else {
        alert('Produto não encontrado para edição.');
    }
}

async function editarFornecedor(id) {
    idFornecedorEditando = id; 
    const fornecedorParaEditar = fornecedores.find(f => f.id === id);

    if (fornecedorParaEditar) {
        document.getElementById('nome-fornecedor').value = fornecedorParaEditar.nome;
        // CAMPO 'TELEFONE' REMOVIDO AQUI AO PREENCHER
        document.getElementById('cnpj-fornecedor').value = fornecedorParaEditar.cnpj;

        const btnSubmit = document.querySelector('#form-fornecedor button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.textContent = 'Atualizar Fornecedor';
            btnSubmit.classList.add('btn-update'); 
        }
        alert('Fornecedor pronto para edição! Altere os campos e clique em "Atualizar Fornecedor".');
    } else {
        alert('Fornecedor não encontrado para edição.');
    }
}

// INICIALIZAÇÃO
window.onload = async () => {
    fornecedores = await api('/fornecedores') || [];
    produtos = await api('/produtos') || []; 

    if (fornecedores) { 
        console.log('✅ API conectada com sucesso!');
    } else {
        alert('❌ Erro ao conectar com a API. Verifique se o servidor está rodando.');
    }
};