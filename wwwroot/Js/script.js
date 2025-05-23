const API_BASE_URL = 'http://localhost:5178';

// Função helper para requisições
async function fazerRequisicao(url, opcoes = {}) {
    try {
        const resposta = await fetch(url, opcoes);
        return { ok: resposta.ok, data: resposta.ok ? await resposta.json() : await resposta.text() };
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        return { ok: false, data: 'Erro de conexão' };
    }
}

// Função para buscar fornecedor por nome
async function buscarFornecedorPorNome(nome) {
    const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/fornecedores`);
    if (!ok) return null;
    return data.find(f => f.nome.toLowerCase() === nome.toLowerCase());
}

// Função genérica para toggle de listas
function criarToggle(btnId, listaId, textoMostrar, textoOcultar, funcaoCarregar) {
    document.getElementById(btnId).addEventListener('click', function() {
        const lista = document.getElementById(listaId);
        const mostrar = lista.style.display === 'none';
        lista.style.display = mostrar ? 'block' : 'none';
        this.textContent = mostrar ? textoOcultar : textoMostrar;
        if (mostrar) funcaoCarregar();
    });
}

// --- PRODUTOS ---
document.getElementById('form-produto').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const fornecedor = await buscarFornecedorPorNome(document.getElementById('fornecedor').value);
    if (!fornecedor) {
        alert('Fornecedor não encontrado. Cadastre o fornecedor primeiro.');
        return;
    }

    const produto = {
        nome: document.getElementById('nome').value,
        preco: parseFloat(document.getElementById('preco').value),
        quantidade: parseInt(document.getElementById('quantidade').value),
        fornecedorId: fornecedor.id
    };

    const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
    });

    if (ok) {
        this.reset();
        carregarProdutos();
        alert('Produto cadastrado com sucesso!');
    } else {
        alert('Erro ao cadastrar produto: ' + data);
    }
});

criarToggle('btn-toggle-produtos', 'lista-produtos', 'Mostrar Produtos', 'Ocultar Produtos', carregarProdutos);

async function carregarProdutos() {
    const lista = document.getElementById('lista-produtos');
    if (lista.style.display === 'none') return;
    
    const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/produtos`);
    
    if (!ok) {
        lista.innerHTML = '<li>Erro ao carregar produtos.</li>';
        return;
    }

    lista.innerHTML = data.length === 0 ? '<li>Nenhum produto cadastrado.</li>' : 
        data.map(p => {
            const item = document.createElement('li');
            item.innerHTML = `${p.nome} - R$ ${p.preco.toFixed(2)} (${p.quantidade}) | Fornecedor: ${p.fornecedor} 
                <button onclick="editarProduto(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="margin-left: 10px">Editar</button>
                <button onclick="excluirProduto(${p.id})" style="margin-left: 5px">Excluir</button>`;
            return item.outerHTML;
        }).join('');
}

async function excluirProduto(id) {
    if (!confirm('Quer mesmo excluir este produto?')) return;

    const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/produtos/${id}`, { method: 'DELETE' });
    
    if (ok) {
        carregarProdutos();
        alert('Produto excluído com sucesso!');
    } else {
        alert('Erro ao excluir produto: ' + data);
    }
}

async function editarProduto(produto) {
    // Preenche o formulário
    document.getElementById('nome').value = produto.nome;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('quantidade').value = produto.quantidade;
    document.getElementById('fornecedor').value = produto.fornecedor;

    const form = document.getElementById('form-produto');
    const btnSubmit = form.querySelector('button[type="submit"]');
    
    btnSubmit.textContent = 'Atualizar Produto';
    btnSubmit.onclick = async function(e) {
        e.preventDefault();

        const fornecedor = await buscarFornecedorPorNome(document.getElementById('fornecedor').value);
        if (!fornecedor) {
            alert('Fornecedor não encontrado.');
            return;
        }

        const atualizado = {
            nome: document.getElementById('nome').value,
            preco: parseFloat(document.getElementById('preco').value),
            quantidade: parseInt(document.getElementById('quantidade').value),
            fornecedorId: fornecedor.id
        };

        const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/produtos/${produto.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(atualizado)
        });

        if (ok) {
            form.reset();
            btnSubmit.textContent = 'Cadastrar Produto';
            btnSubmit.onclick = null; // Remove este handler
            carregarProdutos();
            alert('Produto atualizado com sucesso!');
        } else {
            alert('Erro ao atualizar produto: ' + data);
        }
    };
}

// --- FORNECEDORES ---
document.getElementById('form-fornecedor').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fornecedor = {
        nome: document.getElementById('nome-fornecedor').value,
        cnpj: `TEMP_${Date.now()}`, // Gerar CNPJ único temporário
        telefone: document.getElementById('contato-fornecedor').value
    };

    const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/fornecedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fornecedor)
    });

    if (ok) {
        this.reset();
        carregarFornecedores();
        alert('Fornecedor cadastrado com sucesso!');
    } else {
        alert('Erro ao cadastrar fornecedor: ' + data);
    }
});

criarToggle('btn-toggle-fornecedores', 'lista-fornecedores', 'Mostrar Fornecedores', 'Ocultar Fornecedores', carregarFornecedores);

async function carregarFornecedores() {
    const lista = document.getElementById('lista-fornecedores');
    if (lista.style.display === 'none') return;
    
    const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/fornecedores`);
    
    if (!ok) {
        lista.innerHTML = '<li>Erro ao carregar fornecedores.</li>';
        return;
    }

    lista.innerHTML = data.length === 0 ? '<li>Nenhum fornecedor cadastrado.</li>' : 
        data.map(f => `<li>${f.nome} - Contato: ${f.telefone || 'N/A'} 
            <button onclick="editarFornecedor(${JSON.stringify(f).replace(/"/g, '&quot;')})" style="margin-left: 10px">Editar</button>
            <button onclick="excluirFornecedor(${f.id})" style="margin-left: 5px">Excluir</button>
        </li>`).join('');
}

async function excluirFornecedor(id) {
    if (!confirm('Quer mesmo excluir este fornecedor?')) return;

    const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/fornecedores/${id}`, { method: 'DELETE' });
    
    if (ok) {
        carregarFornecedores();
        alert('Fornecedor excluído com sucesso!');
    } else {
        alert('Erro ao excluir fornecedor: ' + data);
    }
}

function editarFornecedor(fornecedor) {
    document.getElementById('nome-fornecedor').value = fornecedor.nome;
    document.getElementById('contato-fornecedor').value = fornecedor.telefone || '';

    const form = document.getElementById('form-fornecedor');
    const btnSubmit = form.querySelector('button[type="submit"]');
    
    btnSubmit.textContent = 'Atualizar Fornecedor';
    btnSubmit.onclick = async function(e) {
        e.preventDefault();

        const atualizado = {
            nome: document.getElementById('nome-fornecedor').value,
            cnpj: fornecedor.cnpj || `TEMP_${Date.now()}`, // Mantém CNPJ original ou gera novo
            telefone: document.getElementById('contato-fornecedor').value
        };

        const { ok, data } = await fazerRequisicao(`${API_BASE_URL}/fornecedores/${fornecedor.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(atualizado)
        });

        if (ok) {
            form.reset();
            btnSubmit.textContent = 'Cadastrar Fornecedor';
            btnSubmit.onclick = null; // Remove este handler
            carregarFornecedores();
            alert('Fornecedor atualizado com sucesso!');
        } else {
            alert('Erro ao atualizar fornecedor: ' + data);
        }
    };
}

// Verificar conexão com API
window.addEventListener('load', async function() {
    const { ok } = await fazerRequisicao(`${API_BASE_URL}/fornecedores`);
    if (ok) {
        console.log('API conectada!');
    } else {
        alert('Erro ao conectar com a API. Verifique se o servidor está rodando.');
    }
});