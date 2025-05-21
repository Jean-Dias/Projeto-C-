const API_BASE_URL = 'http://localhost:5178';

// --- PRODUTOS ---

// Cadastrar produto
document.getElementById('form-produto').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Primeiro, precisamos encontrar o ID do fornecedor pelo nome
    const nomeFornecedor = document.getElementById('fornecedor').value;
    
    try {
        // Buscar fornecedores para encontrar o ID
        const respostaFornecedores = await fetch(`${API_BASE_URL}/fornecedores`);
        const fornecedores = await respostaFornecedores.json();
        
        const fornecedor = fornecedores.find(f => f.nome.toLowerCase() === nomeFornecedor.toLowerCase());
        
        if (!fornecedor) {
            alert('Fornecedor não encontrado. Cadastre o fornecedor primeiro.');
            return;
        }

        const produto = {
            nome: document.getElementById('nome').value,
            preco: parseFloat(document.getElementById('preco').value),
            quantidade: parseInt(document.getElementById('quantidade').value),
            fornecedorId: fornecedor.id // Usar o ID do fornecedor
        };

        const resposta = await fetch(`${API_BASE_URL}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });

        if (resposta.ok) {
            this.reset();
            carregarProdutos();
            alert('Produto cadastrado com sucesso!');
        } else {
            const erro = await resposta.text();
            alert('Erro ao cadastrar produto: ' + erro);
        }
    } catch (erro) {
        console.error('Erro ao cadastrar produto:', erro);
        alert('Erro ao cadastrar produto. Verifique o console para mais detalhes.');
    }
});

// Toggle para mostrar/ocultar lista de produtos
document.getElementById('btn-toggle-produtos').addEventListener('click', function() {
    const lista = document.getElementById('lista-produtos');
    if (lista.style.display === 'none') {
        lista.style.display = 'block';
        this.textContent = 'Ocultar Produtos';
        carregarProdutos(); // Carrega a lista atualizada quando exibida
    } else {
        lista.style.display = 'none';
        this.textContent = 'Mostrar Produtos';
    }
});

// Listar produtos com botões Editar e Excluir
async function carregarProdutos() {
    const lista = document.getElementById('lista-produtos');
    if (lista.style.display === 'none') return; // Não carrega se estiver oculto
    
    try {
        const resposta = await fetch(`${API_BASE_URL}/produtos`);
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        const produtos = await resposta.json();
        lista.innerHTML = '';

        if (produtos.length === 0) {
            lista.innerHTML = '<li>Nenhum produto cadastrado.</li>';
            return;
        }

        for (const p of produtos) {
            const item = document.createElement('li');
            item.textContent = `${p.nome} - R$ ${p.preco.toFixed(2)} (${p.quantidade}) | Fornecedor: ${p.fornecedor} `;

            // Botão editar
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.style.marginLeft = '10px';
            btnEditar.onclick = () => editarProduto(p);

            // Botão excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.style.marginLeft = '5px';
            btnExcluir.onclick = () => excluirProduto(p.id);

            item.appendChild(btnEditar);
            item.appendChild(btnExcluir);
            lista.appendChild(item);
        }
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        lista.innerHTML = '<li>Erro ao carregar produtos. Verifique se a API está rodando.</li>';
    }
}

// Excluir produto
async function excluirProduto(id) {
    if (!confirm('Quer mesmo excluir este produto?')) return;

    try {
        const resposta = await fetch(`${API_BASE_URL}/produtos/${id}`, { method: 'DELETE' });
        
        if (resposta.ok) {
            carregarProdutos();
            alert('Produto excluído com sucesso!');
        } else {
            const erro = await resposta.text();
            alert('Erro ao excluir produto: ' + erro);
        }
    } catch (erro) {
        console.error('Erro ao excluir produto:', erro);
        alert('Erro ao excluir produto. Verifique o console para mais detalhes.');
    }
}

// Editar produto: preenche formulário e altera submit para atualizar
async function editarProduto(produto) {
    document.getElementById('nome').value = produto.nome;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('quantidade').value = produto.quantidade;
    document.getElementById('fornecedor').value = produto.fornecedor;

    const form = document.getElementById('form-produto');
    const btnSubmit = form.querySelector('button[type="submit"]');
    const originalBtnText = btnSubmit.textContent;
    btnSubmit.textContent = 'Atualizar Produto';

    // Guardamos a função original de submit
    const originalSubmit = form.onsubmit;

    form.onsubmit = async function (e) {
        e.preventDefault();

        // Precisamos encontrar o ID do fornecedor pelo nome
        const nomeFornecedor = document.getElementById('fornecedor').value;
        
        try {
            // Buscar fornecedores para encontrar o ID
            const respostaFornecedores = await fetch(`${API_BASE_URL}/fornecedores`);
            const fornecedores = await respostaFornecedores.json();
            
            const fornecedor = fornecedores.find(f => f.nome.toLowerCase() === nomeFornecedor.toLowerCase());
            
            if (!fornecedor) {
                alert('Fornecedor não encontrado. Cadastre o fornecedor primeiro.');
                return;
            }

            const atualizado = {
                nome: document.getElementById('nome').value,
                preco: parseFloat(document.getElementById('preco').value),
                quantidade: parseInt(document.getElementById('quantidade').value),
                fornecedorId: fornecedor.id
            };

            const resposta = await fetch(`${API_BASE_URL}/produtos/${produto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(atualizado)
            });

            if (resposta.ok) {
                form.reset();
                // Restauramos a função original e o texto do botão
                form.onsubmit = originalSubmit;
                btnSubmit.textContent = originalBtnText;
                carregarProdutos();
                alert('Produto atualizado com sucesso!');
            } else {
                const erro = await resposta.text();
                alert('Erro ao atualizar produto: ' + erro);
            }
        } catch (erro) {
            console.error('Erro ao atualizar produto:', erro);
            alert('Erro ao atualizar produto. Verifique o console para mais detalhes.');
        }
    };
}

// --- FORNECEDORES ---

// Cadastrar fornecedor
document.getElementById('form-fornecedor').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fornecedor = {
        nome: document.getElementById('nome-fornecedor').value,
        cnpj: "", // Campo obrigatório no backend mas vazio por padrão
        telefone: document.getElementById('contato-fornecedor').value // Mapeando contato para telefone
    };

    try {
        const resposta = await fetch(`${API_BASE_URL}/fornecedores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fornecedor)
        });

        if (resposta.ok) {
            this.reset();
            carregarFornecedores();
            alert('Fornecedor cadastrado com sucesso!');
        } else {
            const erro = await resposta.text();
            alert('Erro ao cadastrar fornecedor: ' + erro);
        }
    } catch (erro) {
        console.error('Erro ao cadastrar fornecedor:', erro);
        alert('Erro ao cadastrar fornecedor. Verifique o console para mais detalhes.');
    }
});

// Toggle para mostrar/ocultar lista de fornecedores
document.getElementById('btn-toggle-fornecedores').addEventListener('click', function() {
    const lista = document.getElementById('lista-fornecedores');
    if (lista.style.display === 'none') {
        lista.style.display = 'block';
        this.textContent = 'Ocultar Fornecedores';
        carregarFornecedores(); // Carrega a lista atualizada quando exibida
    } else {
        lista.style.display = 'none';
        this.textContent = 'Mostrar Fornecedores';
    }
});

// Listar fornecedores com botões Editar e Excluir
async function carregarFornecedores() {
    const lista = document.getElementById('lista-fornecedores');
    if (lista.style.display === 'none') return; // Não carrega se estiver oculto
    
    try {
        const resposta = await fetch(`${API_BASE_URL}/fornecedores`);
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        const fornecedores = await resposta.json();
        lista.innerHTML = '';

        if (fornecedores.length === 0) {
            lista.innerHTML = '<li>Nenhum fornecedor cadastrado.</li>';
            return;
        }

        for (const f of fornecedores) {
            const item = document.createElement('li');
            item.textContent = `${f.nome} - Contato: ${f.telefone || 'N/A'} `;

            // Botão editar
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.style.marginLeft = '10px';
            btnEditar.onclick = () => editarFornecedor(f);

            // Botão excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.style.marginLeft = '5px';
            btnExcluir.onclick = () => excluirFornecedor(f.id);

            item.appendChild(btnEditar);
            item.appendChild(btnExcluir);
            lista.appendChild(item);
        }
    } catch (erro) {
        console.error('Erro ao carregar fornecedores:', erro);
        lista.innerHTML = '<li>Erro ao carregar fornecedores. Verifique se a API está rodando.</li>';
    }
}

// Excluir fornecedor
async function excluirFornecedor(id) {
    if (!confirm('Quer mesmo excluir este fornecedor?')) return;

    try {
        const resposta = await fetch(`${API_BASE_URL}/fornecedores/${id}`, { method: 'DELETE' });
        
        if (resposta.ok) {
            carregarFornecedores();
            alert('Fornecedor excluído com sucesso!');
        } else {
            const erro = await resposta.text();
            alert('Erro ao excluir fornecedor: ' + erro);
        }
    } catch (erro) {
        console.error('Erro ao excluir fornecedor:', erro);
        alert('Erro ao excluir fornecedor. Verifique o console para mais detalhes.');
    }
}

// Editar fornecedor
function editarFornecedor(fornecedor) {
    document.getElementById('nome-fornecedor').value = fornecedor.nome;
    document.getElementById('contato-fornecedor').value = fornecedor.telefone || '';

    const form = document.getElementById('form-fornecedor');
    const btnSubmit = form.querySelector('button[type="submit"]');
    const originalBtnText = btnSubmit.textContent;
    btnSubmit.textContent = 'Atualizar Fornecedor';

    // Guardamos a função original de submit
    const originalSubmit = form.onsubmit;

    form.onsubmit = async function (e) {
        e.preventDefault();

        const atualizado = {
            nome: document.getElementById('nome-fornecedor').value,
            cnpj: fornecedor.cnpj || "", // Mantém o CNPJ existente ou vazio
            telefone: document.getElementById('contato-fornecedor').value
        };

        try {
            const resposta = await fetch(`${API_BASE_URL}/fornecedores/${fornecedor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(atualizado)
            });

            if (resposta.ok) {
                form.reset();
                // Restauramos a função original e o texto do botão
                form.onsubmit = originalSubmit;
                btnSubmit.textContent = originalBtnText;
                carregarFornecedores();
                alert('Fornecedor atualizado com sucesso!');
            } else {
                const erro = await resposta.text();
                alert('Erro ao atualizar fornecedor: ' + erro);
            }
        } catch (erro) {
            console.error('Erro ao atualizar fornecedor:', erro);
            alert('Erro ao atualizar fornecedor. Verifique o console para mais detalhes.');
        }
    };
}

// --- INICIALIZAÇÃO ---

// Verificar conexão com a API quando a página carregar
window.addEventListener('load', async function() {
    try {
        // Tentamos fazer uma requisição simples para verificar se a API está online
        const resposta = await fetch(`${API_BASE_URL}/fornecedores`, { 
            method: 'GET',
            // Adicionamos um timeout para não esperar muito tempo
            signal: AbortSignal.timeout(5000)
        });
        
        if (resposta.ok) {
            console.log('Conexão com a API estabelecida com sucesso!');
        } else {
            console.warn('API respondeu com status:', resposta.status);
        }
    } catch (erro) {
        console.error('Erro ao conectar com a API:', erro);
        alert('Não foi possível conectar ao servidor da API. Verifique se o servidor está rodando em ' + API_BASE_URL);
    }
});