using Microsoft.EntityFrameworkCore;
using trabalho;

var builder = WebApplication.CreateBuilder(args);

// Configura o banco SQLite
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

// GET - Todos os produtos
app.MapGet("/produtos", async (EstoqueContext db) =>
{
    try
    {
        var produtos = await db.Produtos.ToListAsync();
        return Results.Ok(produtos);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao buscar produtos: {ex.Message}");
    }
});

// GET - Produto por ID
app.MapGet("/produtos/{id}", async (int id, EstoqueContext db) =>
{
    try
    {
        var produto = await db.Produtos.FindAsync(id);
        return produto != null ? Results.Ok(produto) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao buscar produto: {ex.Message}");
    }
});

app.MapPost ("produtos", async (Produto produto, EstoqueContext db) => 
{
try 
{
    // adiciona um produto na tabelo protudos no banco de dados
    db.Produtos.Add(produto);

    // faz o sistema esperar salvar no banco de dados
    await db.SaveChangesAsync();
    // retorna status 200 ( ok ) e mostra o produto adicionado e id
    return Results.Ok($"/produtos/{produto.Id}");
}catch(Exception ex)
{
    // retorna uma mensagem de erro junto  caso nao seja possivel criar o produto e retorna status 201 (Created)
return Results.Problem($"Erro, problema ao criar produto: {ex.Message}", statusCode: 500);
}
});

app.MapDelete ("/produtos/{id}", async (int id, EstoqueContext db) => 
{
    try 
    {
        var produto = await db.Produtos.FindAsync(id);
        if (produto == null )
        return Results.NotFound();

        db.Produtos.Remove(produto);
        await db.SaveChangesAsync();
        return Results.Ok ($"Produto com id {id} removido com sucesso");
    }catch(Exception ex)
    {
        return Results.Problem($"Erro ao remover o produto: {ex.Message}", statusCode: 500);
    }
} );

app.Run();
