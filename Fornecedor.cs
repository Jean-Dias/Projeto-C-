// C:\Users\Guilherme\Projeto-C-\Fornecedor.cs
namespace trabalho
{
    public class Fornecedor
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cnpj { get; set; } = string.Empty;

        // Propriedade de navegação para a coleção de Produtos
        public ICollection<Produto> Produtos { get; set; } = new List<Produto>();
    }
}