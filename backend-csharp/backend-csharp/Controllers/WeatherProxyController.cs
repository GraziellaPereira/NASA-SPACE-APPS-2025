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
    [HttpGet("cityinfo")]
    public async Task<IActionResult> CityInfo(
     [FromQuery] string cidade,
     [FromQuery] string uf,
     [FromQuery] int mes,
     [FromQuery] int ano)
    {
        // Encode os parâmetros corretamente!
        var cidadeEncoded = Uri.EscapeDataString(cidade);
        var ufEncoded = Uri.EscapeDataString(uf);

        // Chama previsão
        var predictUrl = $"http://localhost:8000/predict?cidade={cidadeEncoded}&uf={ufEncoded}&mes={mes}&ano={ano}";
        var predictResp = await _httpClient.GetAsync(predictUrl);
        if (!predictResp.IsSuccessStatusCode)
            return StatusCode((int)predictResp.StatusCode, await predictResp.Content.ReadAsStringAsync());
        var predictJson = await predictResp.Content.ReadAsStringAsync();

        // Chama plots
        var plotsUrl = $"http://localhost:8000/plots?cidade={cidadeEncoded}&uf={ufEncoded}&mes={mes}&ano={ano}";
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

    // Função de recomendação aprimorada (textos e classificações em inglês)
    private string GerarRecomendacao(JsonElement previsao)
    {
        try
        {
            var temp = previsao.TryGetProperty("temperatura_media", out var tempElement)
                ? tempElement.GetDouble()
                : 25.0;

            var chuva = previsao.TryGetProperty("chance_chuva", out var chuvaElement)
                ? chuvaElement.GetString() ?? "Moderate"
                : "Moderate";

            string recomendacao = "";

            // Temperatura
            if (temp < 18)
                recomendacao += "Expect colder weather — pack warm clothes, jackets, and enjoy cozy cafés, museums, or indoor attractions. ";
            else if (temp >= 18 && temp <= 25)
                recomendacao += "Mild weather — perfect for city walks, cultural experiences, and local gastronomy. ";
            else if (temp > 25 && temp <= 32)
                recomendacao += "Warm and pleasant — great for beaches, outdoor activities, and nature trips. ";
            else if (temp > 32)
                recomendacao += "Hot weather — wear light clothing, use sunscreen, stay hydrated, and avoid long exposure to direct sunlight. ";

            // Classificação de chuva (em inglês)
            if (chuva.Equals("Very High", StringComparison.OrdinalIgnoreCase))
                recomendacao += "Heavy rainfall expected — avoid outdoor trips and focus on indoor places like museums, restaurants, or shopping centers.";
            else if (chuva.Equals("High", StringComparison.OrdinalIgnoreCase))
                recomendacao += "High chance of rain — carry an umbrella or raincoat and plan flexible indoor activities.";
            else if (chuva.Equals("Moderate", StringComparison.OrdinalIgnoreCase))
                recomendacao += "Moderate chance of rain — check the forecast before going out and have indoor alternatives ready.";
            else if (chuva.Equals("Low", StringComparison.OrdinalIgnoreCase))
                recomendacao += "Low chance of rain — perfect conditions for outdoor adventures, sightseeing, and hiking.";
            else
                recomendacao += "Weather looks stable — enjoy the city and its attractions!";

            return recomendacao;
        }
        catch (Exception)
        {
            return "Enjoy the city and its main attractions!";
        }
    }
}
