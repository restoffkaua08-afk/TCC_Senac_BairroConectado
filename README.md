# Bairro Conectado

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:071A2B,45:0B5D6B,100:19B394&text=BAIRRO%20CONECTADO&fontColor=FFFFFF&fontSize=42&fontAlignY=38&animation=fadeIn&desc=TECNOLOGIA%20PARA%20PARTICIPA%C3%87%C3%83O%20COMUNIT%C3%81RIA&descAlignY=59&descSize=15" alt="Bairro Conectado"/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=20&duration=2800&pause=900&color=2DD4BF&center=true&vCenter=true&width=900&lines=Plataforma+Web+%2B+API+%2B+Aplicativo+Desktop;Registro+e+acompanhamento+de+ocorr%C3%AAncias;Node.js+%E2%80%A2+SQL+Server+%E2%80%A2+C%23;Projeto+de+Conclus%C3%A3o+de+Curso" alt="Tecnologias e propósito"/>

<br>

### Sistema integrado para registrar, acompanhar e administrar ocorrências comunitárias.

<br>

![Status](https://img.shields.io/badge/STATUS-EM%20DESENVOLVIMENTO-19B394?style=for-the-badge&labelColor=071A2B)
![Architecture](https://img.shields.io/badge/ARQUITETURA-MULTIPLATAFORMA-2DD4BF?style=for-the-badge&labelColor=071A2B)
![Type](https://img.shields.io/badge/PROJETO-TCC-5EEAD4?style=for-the-badge&labelColor=071A2B)

</div>

<br>

# `> PROJECT.OVERVIEW`

## Sobre o projeto

O **Bairro Conectado** é um projeto de conclusão de curso criado para aproximar moradores e administração comunitária por meio da tecnologia. A plataforma permite registrar ocorrências do bairro, consultar informações e acompanhar o tratamento de solicitações em diferentes interfaces.

A solução combina uma interface web, uma API em Node.js, persistência em SQL Server e um aplicativo administrativo desktop em C#. Essa divisão permite que moradores utilizem uma experiência acessível pelo navegador enquanto responsáveis pela administração trabalham em uma interface própria.

<br>

# `> CORE.TECH_STACK`

<div align="center">

### Linguagens

<img src="https://skillicons.dev/icons?i=js,cs,html,css&theme=dark" alt="JavaScript, C Sharp, HTML e CSS"/>

<br><br>

### Back-end e banco de dados

<img src="https://skillicons.dev/icons?i=nodejs,express,mysql&theme=dark" alt="Node.js, Express e SQL"/>

<br><br>

### Ferramentas

<img src="https://skillicons.dev/icons?i=git,github,vscode,visualstudio,npm&theme=dark" alt="Ferramentas de desenvolvimento"/>

</div>

> O ícone SQL representa a camada relacional. O ambiente principal do projeto utiliza Microsoft SQL Server LocalDB.

<br>

# `> SYSTEM.FEATURES`

## Funcionalidades identificadas

### Portal web

- autenticação de usuários;
- consulta e registro de ocorrências;
- perfil do usuário;
- navegação responsiva;
- integração com a API do sistema.

### API

- autenticação baseada em JWT;
- proteção de senhas com bcrypt;
- rotas de usuários e ocorrências;
- persistência e consulta de informações;
- configuração por variáveis de ambiente.

### Administração desktop

- aplicação Windows Forms em C#;
- visualização administrativa;
- acesso às informações do sistema;
- fluxo separado para responsáveis pela gestão.

### Banco de dados

- scripts de criação do banco;
- definição das tabelas principais;
- automação de configuração para SQL Server LocalDB.

<br>

# `> SYSTEM.ARCHITECTURE`

```text
Morador
   │
   ▼
Frontend Web ───────► API Node.js / Express
                           │
                           ▼
                    SQL Server LocalDB
                           ▲
                           │
                  Aplicativo Desktop C#
```

O frontend e o aplicativo administrativo utilizam a camada de serviços para centralizar autenticação, regras do sistema e persistência.

<br>

# `> PROJECT.STRUCTURE`

```text
TCC_Senac_BairroConectado/
├── frontend/                    # Portal utilizado pelos moradores
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── ocorrencias.html
│   └── perfil.html
├── backend/                     # API Node.js e regras da aplicação
│   ├── controllers/
│   ├── routes/
│   ├── data/
│   ├── database.js
│   └── server.js
├── aplicativo desktop projeto/ # Aplicação administrativa em C#
├── database/                    # Scripts e documentação do SQL Server
├── abrir-sistema-portatil.ps1
├── abrir-admin-desktop.ps1
└── README.md
```

<br>

# `> GETTING.STARTED`

## Pré-requisitos

- Node.js e npm;
- SQL Server LocalDB;
- PowerShell;
- Visual Studio com suporte a .NET para o aplicativo desktop.

## Instalação

```bash
git clone https://github.com/restoffkaua08-afk/TCC_Senac_BairroConectado.git
cd TCC_Senac_BairroConectado
cd backend
npm install
```

## Configuração

Copie o arquivo de exemplo e substitua os valores locais:

```powershell
Copy-Item .env.example .env
```

Nunca publique o arquivo `.env` ou credenciais reais.

## Banco de dados

Na raiz do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\database\setup-database.ps1
```

## Execução

API:

```bash
cd backend
npm start
```

Também estão disponíveis scripts PowerShell na raiz para iniciar os fluxos preparados para demonstração.

<br>

# `> ENVIRONMENT.CONFIG`

| Variável | Finalidade |
|---|---|
| `PORT` | Porta utilizada pela API |
| `JWT_SECRET` | Assinatura dos tokens de autenticação |
| `ADMIN_KEY` | Proteção de operações administrativas |

Use valores longos e exclusivos fora do ambiente de desenvolvimento.

<br>

# `> QUALITY.ASSURANCE`

O backend possui um comando de verificação sintática:

```bash
cd backend
npm run check
```

Antes de publicar alterações, valide também os fluxos de autenticação, cadastro e consulta de ocorrências nas duas interfaces.

<br>

# `> SECURITY`

- senhas processadas com bcrypt;
- autenticação baseada em JWT;
- segredos carregados por variáveis de ambiente;
- arquivos locais e bancos de desenvolvimento ignorados pelo Git;
- separação entre rotas públicas e administrativas.

> Este é um projeto acadêmico em evolução. Uma implantação pública exige revisão de autorização, CORS, armazenamento, logs e políticas de segurança.

<br>

# `> PROJECT.ROADMAP`

- [ ] automatizar testes da API;
- [ ] consolidar a persistência em um único ambiente;
- [ ] ampliar validações de entrada;
- [ ] documentar os endpoints;
- [ ] preparar estratégia de implantação;
- [ ] adicionar capturas atualizadas das interfaces.

<br>

# `> ENGINEERING.PRINCIPLES`

> **Uma comunidade conectada começa com informação acessível, confiável e bem organizada.**

<br>

# `> PROJECT.STATUS`

## 🚧 Desenvolvimento acadêmico

O projeto permanece disponível para evolução técnica, melhoria da experiência e consolidação das integrações.

<br>

# `> DEVELOPER`

## Kauã Restoff

### Desenvolvedor de Software

[![GitHub](https://img.shields.io/badge/GitHub-restoffkaua08--afk-181717?style=for-the-badge&logo=github)](https://github.com/restoffkaua08-afk)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Kauã%20Restoff-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/kau%C3%A3-restoff-2821163a0)

<div align="center">

## `BUILD • CONNECT • IMPROVE`

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=0:071A2B,45:0B5D6B,100:19B394" alt="Rodapé"/>

</div>
