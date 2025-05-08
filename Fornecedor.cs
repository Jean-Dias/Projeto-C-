using System;
using System.Collections.Generic;

namespace trabalho
{
    public class Fornecedor
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Cnpj { get; set; }
        public string Telefone { get; set; }

        // A lista de produtos relacionados ao fornecedor
        public List<Produto> Produtos { get; set; }
    }
}
