using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho;

var builder = WebApplication.CreateBuilder(args);

// Configurar CORS - AllowAll
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddDbContext<EstoqueContext>(options =>
    options.UseSqlite("Data Source=produtos.db"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Usar CORS
app.UseCors("AllowAll");

// PRODUTOS

app.MapGet("/produtos", async (EstoqueContext db) =>
{
    try
    {
        var produtos = await db.Produtos
            .Include(p => p.Fornecedor)
            .Select(p => new
            {
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
        return Results.Problem($"Erro ao buscar produtos: {ex.Message}");
    }
});

app.MapGet("/produtos/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos
            .Include(p => p.Fornecedor)
            .Where(p => p.Id == id)
            .Select(p => new
            {
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
        return Results.Problem($"Erro ao buscar produto: {ex.Message}");
    }
});

app.MapPost("/produtos", async ([FromBody] Produto produto, EstoqueContext db) =>
{
    try
    {
        var fornecedorExiste = await db.Fornecedores.AnyAsync(f => f.Id == produto.FornecedorId);
        if (!fornecedorExiste)
            return Results.BadRequest("Fornecedor não encontrado.");

        db.Produtos.Add(produto);
        await db.SaveChangesAsync();
        return Results.Created($"/produtos/{produto.Id}", produto);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao criar produto: {ex.Message}", statusCode: 500);
    }
});

app.MapPut("/produtos/{id}", async (int id, [FromBody] Produto input, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos.FindAsync(id);
        if (produto == null) return Results.NotFound();

        var fornecedorExiste = await db.Fornecedores.AnyAsync(f => f.Id == input.FornecedorId);
        if (!fornecedorExiste)
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
        return Results.Problem($"Erro ao atualizar produto: {ex.Message}", statusCode: 500);
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
        return Results.Ok($"Produto com id {id} removido com sucesso");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao remover produto: {ex.Message}", statusCode: 500);
    }
});

// FORNECEDORES

app.MapGet("/fornecedores", async (EstoqueContext db) =>
{
    try
    {
        var fornecedores = await db.Fornecedores.ToListAsync();
        return Results.Ok(fornecedores);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao buscar fornecedores: {ex.Message}");
    }
});

app.MapGet("/fornecedores/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var fornecedor = await db.Fornecedores.FindAsync(id);
        return fornecedor != null ? Results.Ok(fornecedor) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao buscar fornecedor: {ex.Message}");
    }
});

app.MapPost("/fornecedores", async ([FromBody] Fornecedor fornecedor, EstoqueContext db) =>
{
    try
    {
        db.Fornecedores.Add(fornecedor);
        await db.SaveChangesAsync();
        return Results.Created($"/fornecedores/{fornecedor.Id}", fornecedor);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao criar fornecedor: {ex.Message}", statusCode: 500);
    }
});

app.MapPut("/fornecedores/{id}", async (int id, [FromBody] Fornecedor input, EstoqueContext db) =>
{
    try
    {
        var fornecedor = await db.Fornecedores.FindAsync(id);
        if (fornecedor == null) return Results.NotFound();

        fornecedor.Nome = input.Nome;
        fornecedor.Cnpj = input.Cnpj;
        fornecedor.Telefone = input.Telefone;

        await db.SaveChangesAsync();
        return Results.Ok(fornecedor);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao atualizar fornecedor: {ex.Message}", statusCode: 500);
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
        return Results.Ok($"Fornecedor com id {id} removido com sucesso");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao remover fornecedor: {ex.Message}", statusCode: 500);
    }
});

app.UseDefaultFiles(); // procura por index.html
app.UseStaticFiles();  // serve arquivos da pasta wwwroot

// Endpoint health check
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.Now }));

app.Run();
