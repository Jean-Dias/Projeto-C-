using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
namespace trabalho
{
     class EstoqueContext : DbContext
{
    public EstoqueContext(DbContextOptions<EstoqueContext> options) : base(options) { }

    public DbSet<Produto> Produtos => Set<Produto>();
}

}