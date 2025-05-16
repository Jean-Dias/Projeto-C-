using Microsoft.EntityFrameworkCore;

namespace trabalho
{
    public class EstoqueContext : DbContext
    {
        public EstoqueContext(DbContextOptions<EstoqueContext> options) : base(options) { }

        public DbSet<Produto> Produtos => Set<Produto>();
        public DbSet<Fornecedor> Fornecedores => Set<Fornecedor>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configura relacionamento Produto -> Fornecedor (muitos para um)
            modelBuilder.Entity<Produto>()
                .HasOne(p => p.Fornecedor)
                .WithMany(f => f.Produtos)
                .HasForeignKey(p => p.FornecedorId)
                .OnDelete(DeleteBehavior.Cascade); // remove os produtos ao excluir o fornecedor

            // Garante que o CNPJ seja único
            modelBuilder.Entity<Fornecedor>()
                .HasIndex(f => f.Cnpj)
                .IsUnique();
        }
    }
}

