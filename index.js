const express = require('express');
const cors = require('cors'); // <-- IMPORTAR O CORS

const app = express();
const port = 3000;

const produtosRoutes = require('./routes/produtos');

app.use(cors()); // <-- USAR O CORS ANTES DAS ROTAS
app.use(express.json());

app.use('/produtos', produtosRoutes);

app.listen(port, () => {
  console.log(`API CJ-Roupas rodando em http://localhost:${port}`);
});
