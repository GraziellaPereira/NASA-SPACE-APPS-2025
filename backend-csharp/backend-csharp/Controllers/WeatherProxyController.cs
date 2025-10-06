using System;
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
    // Endpoint principal: previsão, plots e recomendação
[HttpGet("cityinfo")]
public async Task<IActionResult> CityInfo(
 [FromQuery] string cidade,
 [FromQuery] string uf,
 [FromQuery] int mes,
 [FromQuery] int ano)
{
    // Lê a URL base da FastAPI da variável de ambiente
    var fastApiBaseUrl = Environment.GetEnvironmentVariable("FASTAPI_URL")
        ?? "http://localhost:8000"; // fallback para rodar localmente

    // Encode os parâmetros corretamente
    var cidadeEncoded = Uri.EscapeDataString(cidade);
    var ufEncoded = Uri.EscapeDataString(uf);

    // Monta as URLs completas
    var predictUrl = $"{fastApiBaseUrl}/predict?cidade={cidadeEncoded}&uf={ufEncoded}&mes={mes}&ano={ano}";
    var plotsUrl = $"{fastApiBaseUrl}/plots?cidade={cidadeEncoded}&uf={ufEncoded}&mes={mes}&ano={ano}";

    // Faz a requisição para FastAPI
    var predictResp = await _httpClient.GetAsync(predictUrl);
    if (!predictResp.IsSuccessStatusCode)
        return StatusCode((int)predictResp.StatusCode, await predictResp.Content.ReadAsStringAsync());
    var predictJson = await predictResp.Content.ReadAsStringAsync();

    var plotsResp = await _httpClient.GetAsync(plotsUrl);
    if (!plotsResp.IsSuccessStatusCode)
        return StatusCode((int)plotsResp.StatusCode, await plotsResp.Content.ReadAsStringAsync());
    var plotsJson = await plotsResp.Content.ReadAsStringAsync();

    var predictData = JsonSerializer.Deserialize<JsonElement>(predictJson);
    string recomendacao = GerarRecomendacao(predictData);

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
        try
        {
            // Use the correct property names from the Python API
            var temp = previsao.TryGetProperty("temperatura_media", out var tempElement)
                ? tempElement.GetDouble()
                : 25.0; // Default temperature if property is missing

            var chuva = previsao.TryGetProperty("chance_chuva", out var chuvaElement)
                ? chuvaElement.GetString() ?? "Média"
                : "Média"; // Default rain chance if property is missing

            if (chuva == "Muito Alta")
                return "Evite passeios ao ar livre, prefira museus e restaurantes.";
            if (temp > 28 && chuva == "Baixa")
                return "Aproveite praias e trilhas!";
            if (temp < 20)
                return "Prefira passeios culturais e gastronômicos.";
            return "Aproveite os pontos turísticos da cidade!";
        }
        catch (Exception)
        {
            return "Aproveite os pontos turísticos da cidade!";
        }
    }
}
