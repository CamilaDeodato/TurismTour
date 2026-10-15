
const atracoes = [
  {
    nome: "Parque dos Saltos",
    categoria: "Natureza",
    icone: "🌊",
    descricao: "Área natural para apreciar o rio e as quedas-d'água."
  },
  {
    nome: "Passeios de rafting",
    categoria: "Aventura",
    icone: "🛶",
    descricao: "Atividade de aventura em rios com operadores especializados."
  },
  {
    nome: "Centro de Brotas",
    categoria: "Cultura",
    icone: "🏘️",
    descricao: "Explore o comércio local, a gastronomia e a cultura da cidade."
  },
  {
    nome: "Trilhas e cachoeiras",
    categoria: "Natureza",
    icone: "🌿",
    descricao: "Opções de contato com a natureza. Consulte regras e condições."
  },
  {
    nome: "Turismo de aventura",
    categoria: "Aventura",
    icone: "🧗",
    descricao: "Conheça atividades oferecidas por empresas locais."
  },
  {
    nome: "Cultura local",
    categoria: "Cultura",
    icone: "🎭",
    descricao: "Descubra eventos e experiências culturais da região."
  }
];

// Valores ilustrativos, não são contagens reais.
const ocupacao = [
  { nome: "Parque dos Saltos", percentual: 35 },
  { nome: "Área de aventura", percentual: 72 },
  { nome: "Centro turístico", percentual: 54 }
];

const listaAtracoes = document.getElementById("listaAtracoes");
const listaOcupacao = document.getElementById("listaOcupacao");

function mostrarAtracoes() {
  const busca = document.getElementById("busca")
    .value.toLowerCase().trim();

  const categoria = document.getElementById("filtroCategoria").value;

  const filtradas = atracoes.filter((atracao) => {
    const correspondeTexto =
      atracao.nome.toLowerCase().includes(busca) ||
      atracao.descricao.toLowerCase().includes(busca);

    const correspondeCategoria =
      categoria === "todos" || atracao.categoria === categoria;

    return correspondeTexto && correspondeCategoria;
  });

  if (filtradas.length === 0) {
    listaAtracoes.innerHTML =
      '<p>Nenhuma atração encontrada. Tente outra busca.</p>';
    return;
  }

  listaAtracoes.innerHTML = filtradas.map((atracao) => `
    <article class="cartao">
      <div class="icone-atracao">${atracao.icone}</div>
      <span class="categoria">${atracao.categoria}</span>
      <h3>${atracao.nome}</h3>
      <p>${atracao.descricao}</p>
    </article>
  `).join("");
}

function mostrarOcupacao() {
  listaOcupacao.innerHTML = ocupacao.map((local) => {
    let nivel = "Baixa";
    let classe = "baixo";

    if (local.percentual >= 70) {
      nivel = "Alta";
      classe = "alto";
    } else if (local.percentual >= 40) {
      nivel = "Moderada";
      classe = "moderado";
    }

    return `
      <article class="cartao">
        <div class="ocupacao-topo">
          <h3>${local.nome}</h3>
          <span class="percentual">${local.percentual}%</span>
        </div>
        <div class="barra">
          <span style="width: ${local.percentual}%"></span>
        </div>
        <p class="nivel ${classe}">Ocupação ${nivel}</p>
      </article>
    `;
  }).join("");
}

// Coordenadas aproximadas de Brotas, SP.
const latitude = -22.2795;
const longitude = -48.1251;

function descricaoClima(codigo) {
  if (codigo === 0) return "Céu limpo";
  if ([1, 2].includes(codigo)) return "Parcialmente nublado";
  if (codigo === 3) return "Nublado";
  if ([45, 48].includes(codigo)) return "Neblina";
  if ([51, 53, 55, 56, 57].includes(codigo)) return "Garoa";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) {
    return "Chuva";
  }
  if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "Neve";
  if ([95, 96, 99].includes(codigo)) return "Trovoadas";
  return "Condição variável";
}

async function atualizarClima() {
  const status = document.getElementById("statusClima");
  const botao = document.getElementById("atualizarClima");

  status.textContent = "Consultando dados meteorológicos...";
  botao.disabled = true;

  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.search = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    timezone: "America/Sao_Paulo"
  });

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Não foi possível consultar a API.");
    }

    const dados = await resposta.json();
    const clima = dados.current;

    document.getElementById("temperatura").textContent =
      Math.round(clima.temperature_2m);

    document.getElementById("condicao").textContent =
      descricaoClima(clima.weather_code);

    document.getElementById("sensacao").textContent =
      `Sensação térmica: ${Math.round(clima.apparent_temperature)} °C`;

    document.getElementById("umidade").textContent =
      `${clima.relative_humidity_2m}%`;

    document.getElementById("vento").textContent =
      `${clima.wind_speed_10m} km/h`;

    document.getElementById("chuva").textContent =
      `${clima.precipitation} mm`;

    status.textContent =
      `Dados meteorológicos atualizados. Referência: ${clima.time.replace("T", " ")}.`;
  } catch (erro) {
    console.error(erro);
    status.textContent =
      "Não foi possível carregar o clima. Verifique a internet e tente novamente.";
  } finally {
    botao.disabled = false;
  }
}

document.getElementById("busca")
  .addEventListener("input", mostrarAtracoes);

document.getElementById("filtroCategoria")
  .addEventListener("change", mostrarAtracoes);

document.getElementById("atualizarClima")
  .addEventListener("click", atualizarClima);

mostrarAtracoes();
mostrarOcupacao();
atualizarClima();
