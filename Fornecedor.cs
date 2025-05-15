namespace trabalho
{
    public class Fornecedor
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cnpj { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;

        // Relacionamento: um fornecedor pode ter vários produtos
        public List<Produto> Produtos { get; set; } = new();
    }
}
