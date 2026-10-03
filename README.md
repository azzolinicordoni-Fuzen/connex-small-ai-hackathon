# Connex Small AI – Hackathon

1. Estrutura Geral da Plataforma

A plataforma deve ter:
	•	Landing Page institucional
	•	Página de cadastro
	•	Página de login
	•	Validação de e-mail
	•	Recuperação de senha
	•	Painel do usuário
	•	Sistema de conexões (igual ao LinkedIn)
	•	Feed de publicações
	•	Chat interno
	•	Gerenciador de projetos áreas
	•	Planos (gratuito e premium)
	•	Dashboard administrativo

Design moderno, limpo, com UX fluida e navegação intuitiva.

⸻

2. Tipos de Usuários / Agentes

No cadastro, o usuário deve escolher seu tipo:
	1.	Proprietário de terra
	2.	Engenheiro
	3.	Desenvolvedor de projetos
	4.	Certificadora
	5.	Banco ou fundo de investimento
	6.	Projetos já prontos
	7.	Outros agentes

Cada tipo terá questionários específicos, com campos próprios.

⸻

3. Funcionalidades Específicas por Módulo

3.1. Módulo de Cadastro e Autenticação
	•	Cadastro com escolha do tipo de agente
	•	Formulários específicos por categoria
	•	Upload de fotos, vídeos e documentos
	•	Login seguro (JWT ou equivalente)
	•	Validação por e-mail
	•	Recuperação de senha
	•	Perfil público e privado
	•	Edição e atualização de dados

⸻

3.2. Módulo de Áreas e Projetos (Apenas para proprietários e desenvolvedores)
	•	Cadastro de múltiplas áreas/projetos
	•	Upload de documentos, imagens e vídeos
	•	Inserção de informações técnicas
	•	Georreferenciamento (mapa)
	•	Indicação do tipo de projeto (ex: soja, floresta, pecuária etc.)
	•	Sugestão automática de agentes próximos e projetos similares

⸻

3.3. Módulo de Conexões (igual LinkedIn)
	•	Página de descoberta de agentes
	•	Filtros por:
	•	localização
	•	tipo de agente
	•	área de interesse
	•	Botão Conectar
	•	Sugestões automáticas de conexões relacionadas
	•	Perfis com e-mail, telefone e WhatsApp
	•	Chat interno entre usuários
	•	Possibilidade de integração com WhatsApp

⸻

3.4. Feed de Publicações
	•	Usuários podem postar:
	•	artigos
	•	notícias
	•	atualizações
	•	fotos
	•	Comentários e curtidas
	•	Filtros por categoria de conteúdo

⸻

3.5. Planos e Assinaturas
	•	Plano gratuito com acesso básico
	•	Plano premium com:
	•	mais conexões por mês
	•	maior visibilidade
	•	mais uploads
	•	mais áreas cadastradas
	•	Integração com gateway de pagamento
	•	Gestão de ativação, renovação e inadimplência

⸻

3.6. Módulo Administrativo

Dashboard completo com:
	•	número de agentes por tipo
	•	conexões feitas
	•	projetos cadastrados
	•	métricas de uso
	•	moderação de conteúdo
	•	gestão de planos, pagamentos e usuários
	•	exportação de dados

⸻

4. Exigências Técnicas
	•	Sistema totalmente responsivo
	•	Banco de dados robusto
	•	Backend seguro
	•	Interface moderna e intuitiva
	•	Performance otimizada

⸻

5. Entrega Final Esperada

Quero que você gere todo o sistema completo, incluindo:
	•	Estrutura de banco de dados
	•	Backend
	•	Frontend
	•	APIs
	•	Fluxos de autenticação
	•	Páginas de usuário
	•	Chat
	•	Feed
	•	Módulo administrativo
	•	Landing page

⸻

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c67738c2-bbb4-4c32-8f64-cbbd46c30d87).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
