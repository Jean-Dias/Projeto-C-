using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

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

app.UseCors("AllowAll");

// Helper para tratamento de erros
async Task<IResult> ExecutarComTratamento<T>(Func<Task<T>> funcao)
{
    try { return Results.Ok(await funcao()); }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}"); }
}

// PRODUTOS
app.MapGet("/produtos", async (EstoqueContext db) =>
    await ExecutarComTratamento(async () =>
        await db.Produtos.Include(p => p.Fornecedor)
            .Select(p => new { p.Id, p.Nome, p.Preco, p.Quantidade, fornecedor = p.Fornecedor.Nome })
            .ToListAsync()));

app.MapGet("/produtos/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos.Include(p => p.Fornecedor)
            .Where(p => p.Id == id)
            .Select(p => new { p.Id, p.Nome, p.Preco, p.Quantidade, fornecedor = p.Fornecedor.Nome })
            .FirstOrDefaultAsync();
        return produto != null ? Results.Ok(produto) : Results.NotFound();
    }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}"); }
});

app.MapPost("/produtos", async ([FromBody] Produto produto, EstoqueContext db) =>
{
    try
    {
        if (!await db.Fornecedores.AnyAsync(f => f.Id == produto.FornecedorId))
            return Results.BadRequest("Fornecedor não encontrado.");
        
        db.Produtos.Add(produto);
        await db.SaveChangesAsync();
        return Results.Created($"/produtos/{produto.Id}", produto);
    }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}", statusCode: 500); }
});

app.MapPut("/produtos/{id}", async (int id, [FromBody] Produto input, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos.FindAsync(id);
        if (produto == null) return Results.NotFound();
        
        if (!await db.Fornecedores.AnyAsync(f => f.Id == input.FornecedorId))
            return Results.BadRequest("Fornecedor não encontrado.");

        produto.Nome = input.Nome;
        produto.Preco = input.Preco;
        produto.Quantidade = input.Quantidade;
        produto.FornecedorId = input.FornecedorId;

        await db.SaveChangesAsync();
        return Results.Ok(produto);
    }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}", statusCode: 500); }
});

app.MapDelete("/produtos/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos.FindAsync(id);
        if (produto == null) return Results.NotFound();

        db.Produtos.Remove(produto);
        await db.SaveChangesAsync();
        return Results.Ok($"Produto removido com sucesso");
    }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}"); }
});

// FORNECEDORES
app.MapGet("/fornecedores", async (EstoqueContext db) =>
    await ExecutarComTratamento(async () => await db.Fornecedores.ToListAsync()));

app.MapGet("/fornecedores/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var fornecedor = await db.Fornecedores.FindAsync(id);
        return fornecedor != null ? Results.Ok(fornecedor) : Results.NotFound();
    }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}"); }
});

app.MapPost("/fornecedores", async ([FromBody] Fornecedor fornecedor, EstoqueContext db) =>
{
    try
    {
        // Se CNPJ estiver vazio, gerar um único baseado no timestamp
        if (string.IsNullOrEmpty(fornecedor.Cnpj))
            fornecedor.Cnpj = $"TEMP_{DateTime.Now.Ticks}";
            
        db.Fornecedores.Add(fornecedor);
        await db.SaveChangesAsync();
        return Results.Created($"/fornecedores/{fornecedor.Id}", fornecedor);
    }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}", statusCode: 500); }
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
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}", statusCode: 500); }
});

app.MapDelete("/fornecedores/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var fornecedor = await db.Fornecedores.FindAsync(id);
        if (fornecedor == null) return Results.NotFound();

        db.Fornecedores.Remove(fornecedor);
        await db.SaveChangesAsync();
        return Results.Ok($"Fornecedor removido com sucesso");
    }
    catch (Exception ex) { return Results.Problem($"Erro: {ex.Message}"); }
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.Now }));

app.Run();