using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace trabalho
{
    public class Produto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public int Quantidade { get; set; }
        public float Preco { get; set; }

        // Adicionando a referência para o Fornecedor
        public int FornecedorId { get; set; } 
        public Fornecedor Fornecedor { get; set; } // Navegação para o Fornecedor
    }
}