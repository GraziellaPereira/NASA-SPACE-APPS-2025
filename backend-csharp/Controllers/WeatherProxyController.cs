using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class WeatherProxyController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public WeatherProxyController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
    }

    // Endpoint principal: previsão, plots e recomendação
    [HttpGet("cityinfo")]
    public async Task<IActionResult> CityInfo(
        [FromQuery] string cidade,
        [FromQuery] string uf,
        [FromQuery] int mes,
        [FromQuery] int ano)
    {
        // Chama previsão
        var predictUrl = $"http://localhost:8000/predict?cidade={cidade}&uf={uf}&mes={mes}&ano={ano}";
        var predictResp = await _httpClient.GetAsync(predictUrl);
        if (!predictResp.IsSuccessStatusCode)
            return StatusCode((int)predictResp.StatusCode, await predictResp.Content.ReadAsStringAsync());
        var predictJson = await predictResp.Content.ReadAsStringAsync();

        // Chama plots
        var plotsUrl = $"http://localhost:8000/plots?cidade={cidade}&uf={uf}&mes={mes}&ano={ano}";
        var plotsResp = await _httpClient.GetAsync(plotsUrl);
        if (!plotsResp.IsSuccessStatusCode)
            return StatusCode((int)plotsResp.StatusCode, await plotsResp.Content.ReadAsStringAsync());
        var plotsJson = await plotsResp.Content.ReadAsStringAsync();

        // (Opcional) Lógica de recomendação baseada na previsão
        var predictData = JsonSerializer.Deserialize<JsonElement>(predictJson);
        string recomendacao = GerarRecomendacao(predictData);

        // Monta resposta única para o frontend
        return Ok(new
        {
            previsao = JsonDocument.Parse(predictJson).RootElement,
            plots = JsonDocument.Parse(plotsJson).RootElement,
            recomendacao
        });
    }

    // Função simples de recomendação (exemplo)
    private string GerarRecomendacao(JsonElement previsao)
    {
        var temp = previsao.GetProperty("temperatura_celsius").GetDouble();
        var chuva = previsao.GetProperty("chance_chuva").GetString();

        if (chuva == "Muito Alta")
            return "Evite passeios ao ar livre, prefira museus e restaurantes.";
        if (temp > 28 && chuva == "Baixa")
            return "Aproveite praias e trilhas!";
        if (temp < 20)
            return "Prefira passeios culturais e gastronômicos.";
        return "Aproveite os pontos turísticos da cidade!";
    }
}