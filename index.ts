import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParse from "cookie-parser";
import routerEcoponto from "./Routes/EcopontoRoutes.js";
import routerLixeira from "./Routes/LixeiraRoutes.js";
//importar as rotas


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true,
}));

app.use(express.json());
app.use(cookieParse());

app.use("/ecopontos", routerEcoponto);
app.use("/lixeiras", routerLixeira);
//incluir rotas
app.listen(PORT, ()=>{
    console.log `Servidor rodando na porta ${PORT}`;
});
