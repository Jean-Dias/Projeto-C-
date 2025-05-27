// C:\Users\Guilherme\Projeto-C-\Produto.cs
namespace trabalho
{
    public class Produto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public int Quantidade { get; set; }

        public int FornecedorId { get; set; }

        // Propriedade de navegação para incluir o fornecedor no EF
        public Fornecedor Fornecedor { get; set; } = null!;
    }
}