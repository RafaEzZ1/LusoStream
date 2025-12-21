// pages/api/embed.js
export default function handler(req, res) {
  const { id } = req.query;

  // Aqui definimos todos os filmes disponíveis
  const STREAMING_MAP = {
    "1607": "https://mxdrop.to/e/7kj3d79la0ndqq", // A Bronx Tale
    // "OUTRO_ID": "OUTRO_LINK",
  };

  if (!STREAMING_MAP[id]) {
    return res.status(404).json({ error: "Filme não disponível" });
  }

  res.status(200).json({ url: STREAMING_MAP[id] });
}
