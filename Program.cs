using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho;

var builder = WebApplication.CreateBuilder(args);

// Configura serviços
builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// Configura o DbContext para usar SQLite com o banco.db
builder.Services.AddDbContext<EstoqueContext>(options =>
    options.UseSqlite("Data Source=banco.db"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configura o pipeline de requisições
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();

// === Aplica migrações automaticamente na inicialização (somente em desenvolvimento) ===
// Isso garante que o banco de dados esteja sempre atualizado com o modelo.
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
        dbContext.Database.Migrate(); // Aplica migrações pendentes
    }
}
// ======================================================================

// ENDPOINTS PRODUTOS
app.MapGet("/produtos", async (EstoqueContext db) =>
{
    try
    {
        var produtos = await db.Produtos
            .Include(p => p.Fornecedor)
            .Select(p => new {
                p.Id,
                p.Nome,
                p.Preco,
                p.Quantidade,
                fornecedor = p.Fornecedor.Nome
            })
            .ToListAsync();
        return Results.Ok(produtos);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao listar produtos: {ex.Message}");
    }
});

app.MapGet("/produtos/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos
            .Include(p => p.Fornecedor)
            .Where(p => p.Id == id)
            .Select(p => new {
                p.Id,
                p.Nome,
                p.Preco,
                p.Quantidade,
                fornecedor = p.Fornecedor.Nome
            })
            .FirstOrDefaultAsync();

        return produto != null ? Results.Ok(produto) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao buscar produto por ID: {ex.Message}");
    }
});

app.MapPost("/produtos", async (Produto produto, EstoqueContext db) =>
{
    try
    {
        // Validações
        if (string.IsNullOrWhiteSpace(produto.Nome)) return Results.BadRequest("Nome é obrigatório.");
        if (produto.Preco < 0) return Results.BadRequest("Preço não pode ser negativo.");
        if (produto.Quantidade < 0) return Results.BadRequest("Quantidade não pode ser negativa.");

        // Verifica se fornecedor existe
        if (!await db.Fornecedores.AnyAsync(f => f.Id == produto.FornecedorId))
            return Results.BadRequest("Fornecedor não encontrado.");

        db.Produtos.Add(produto);
        await db.SaveChangesAsync();
        return Results.Created($"/produtos/{produto.Id}", produto);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao criar produto: {ex.Message}");
    }
});

app.MapPut("/produtos/{id}", async (int id, Produto input, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos.FindAsync(id);
        if (produto == null) return Results.NotFound();

        // Validações
        if (string.IsNullOrWhiteSpace(input.Nome)) return Results.BadRequest("Nome é obrigatório.");
        if (input.Preco < 0) return Results.BadRequest("Preço não pode ser negativo.");
        if (input.Quantidade < 0) return Results.BadRequest("Quantidade não pode ser negativa.");

        if (!await db.Fornecedores.AnyAsync(f => f.Id == input.FornecedorId))
            return Results.BadRequest("Fornecedor não encontrado.");

        produto.Nome = input.Nome;
        produto.Preco = input.Preco;
        produto.Quantidade = input.Quantidade;
        produto.FornecedorId = input.FornecedorId;

        await db.SaveChangesAsync();
        return Results.Ok(produto);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao atualizar produto: {ex.Message}");
    }
});

app.MapDelete("/produtos/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos.FindAsync(id);
        if (produto == null) return Results.NotFound();

        db.Produtos.Remove(produto);
        await db.SaveChangesAsync();
        return Results.Ok("Produto removido com sucesso.");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao remover produto: {ex.Message}");
    }
});

// ENDPOINTS FORNECEDORES
app.MapGet("/fornecedores", async (EstoqueContext db) =>
{
    try
    {
        return Results.Ok(await db.Fornecedores.ToListAsync());
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao listar fornecedores: {ex.Message}");
    }
});

app.MapPost("/fornecedores", async (Fornecedor fornecedor, EstoqueContext db) =>
{
    try
    {
        // Validações
        if (string.IsNullOrWhiteSpace(fornecedor.Nome)) return Results.BadRequest("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(fornecedor.Cnpj))
        {
            fornecedor.Cnpj = $"TEMP_{DateTime.Now.Ticks}"; // Gera CNPJ temporário se vazio
        }
        else if (await db.Fornecedores.AnyAsync(f => f.Cnpj == fornecedor.Cnpj))
        {
            return Results.Conflict("CNPJ já cadastrado para outro fornecedor.");
        }

        db.Fornecedores.Add(fornecedor);
        await db.SaveChangesAsync();
        return Results.Created($"/fornecedores/{fornecedor.Id}", fornecedor);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao criar fornecedor: {ex.Message}");
    }
});

app.MapPut("/fornecedores/{id}", async (int id, Fornecedor input, EstoqueContext db) =>
{
    try
    {
        var fornecedor = await db.Fornecedores.FindAsync(id);
        if (fornecedor == null) return Results.NotFound();

        // Validações
        if (string.IsNullOrWhiteSpace(input.Nome)) return Results.BadRequest("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(input.Cnpj)) return Results.BadRequest("CNPJ não pode ser vazio.");

        if (input.Cnpj != fornecedor.Cnpj && await db.Fornecedores.AnyAsync(f => f.Cnpj == input.Cnpj))
        {
            return Results.Conflict("CNPJ já cadastrado para outro fornecedor.");
        }

        fornecedor.Nome = input.Nome;
        fornecedor.Cnpj = input.Cnpj;

        await db.SaveChangesAsync();
        return Results.Ok(fornecedor);
    }
    catch (DbUpdateException ex) // Erro de atualização do BD, ex: integridade referencial
    {
        return Results.Problem($"Erro no BD ao remover fornecedor: {ex.Message}");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro geral ao remover fornecedor: {ex.Message}");
    }
});

app.MapDelete("/fornecedores/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var fornecedor = await db.Fornecedores.FindAsync(id);
        if (fornecedor == null) return Results.NotFound();

        db.Fornecedores.Remove(fornecedor);
        await db.SaveChangesAsync();
        return Results.Ok("Fornecedor removido com sucesso.");
    }
    catch (DbUpdateException ex) // Captura erro se, por exemplo, o fornecedor tem produtos associados
    {
        return Results.Problem($"Erro ao remover fornecedor. Detalhes: {ex.Message}");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro geral ao remover fornecedor: {ex.Message}");
    }
});

app.MapGet("/health", () => Results.Ok(new { status = "OK", time = DateTime.Now }));

app.Run();