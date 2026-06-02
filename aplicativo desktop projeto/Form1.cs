using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Newtonsoft.Json;

public partial class Form1 : Form
{
    private const string ApiBase = "http://localhost:3000/api";
    private const string PortalUrl = "http://localhost:3000/ocorrencias.html";

    private readonly HttpClient http = new HttpClient();

    private string adminKey = "";
    private string adminIdentificacao = "";

    private TextBox txtIdentificacao;
    private TextBox txtSenha;
    private Label lblLoginStatus;

    private ComboBox cmbFiltro;
    private DataGridView grid;

    private Label lblPendentes;
    private Label lblPublicadas;
    private Label lblRecusadas;
    private Label lblTotal;
    private Label lblStatus;

    private Button btnAtualizar;
    private Button btnAprovar;
    private Button btnRecusar;

    private List<Ocorrencia> ocorrencias = new List<Ocorrencia>();

    public Form1()
    {
        InitializeComponent();
        ConfigurarJanela();
        MostrarLogin();
    }

    private void ConfigurarJanela()
    {
        Text = "Bairro Conectado - Administração";
        WindowState = FormWindowState.Maximized;
        MinimumSize = new Size(1180, 740);
        BackColor = Color.FromArgb(241, 245, 249);
        Font = new Font("Segoe UI", 10F);
    }

    private void MostrarLogin()
    {
        Controls.Clear();

        var root = new Panel();
        root.Dock = DockStyle.Fill;
        root.BackColor = Color.FromArgb(15, 23, 42);
        root.Padding = new Padding(32);

        var wrapper = new TableLayoutPanel();
        wrapper.Dock = DockStyle.Fill;
        wrapper.ColumnCount = 3;
        wrapper.RowCount = 3;
        wrapper.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
        wrapper.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 460));
        wrapper.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
        wrapper.RowStyles.Add(new RowStyle(SizeType.Percent, 50));
        wrapper.RowStyles.Add(new RowStyle(SizeType.Absolute, 430));
        wrapper.RowStyles.Add(new RowStyle(SizeType.Percent, 50));

        var card = new Panel();
        card.Dock = DockStyle.Fill;
        card.BackColor = Color.White;
        card.Padding = new Padding(34);

        var titulo = new Label();
        titulo.Text = "Painel Administrativo";
        titulo.ForeColor = Color.FromArgb(15, 23, 42);
        titulo.Font = new Font("Segoe UI", 25F, FontStyle.Bold);
        titulo.Dock = DockStyle.Top;
        titulo.Height = 48;

        var subtitulo = new Label();
        subtitulo.Text = "Entre para validar, aprovar e recusar ocorrências enviadas pelos moradores.";
        subtitulo.ForeColor = Color.FromArgb(71, 85, 105);
        subtitulo.Font = new Font("Segoe UI", 10.5F);
        subtitulo.Dock = DockStyle.Top;
        subtitulo.Height = 58;

        var lblId = CriarLabelCampo("Número de identificação");
        txtIdentificacao = CriarInput(false);
        txtIdentificacao.PlaceholderText = "Ex: ADMIN-001";

        var lblSenha = CriarLabelCampo("Senha de acesso");
        txtSenha = CriarInput(true);
        txtSenha.PlaceholderText = "Digite a senha administrativa";

        var btnEntrar = new Button();
        btnEntrar.Text = "Entrar no painel";
        btnEntrar.Height = 48;
        btnEntrar.Dock = DockStyle.Top;
        btnEntrar.BackColor = Color.FromArgb(37, 99, 235);
        btnEntrar.ForeColor = Color.White;
        btnEntrar.FlatStyle = FlatStyle.Flat;
        btnEntrar.FlatAppearance.BorderSize = 0;
        btnEntrar.Font = new Font("Segoe UI", 11F, FontStyle.Bold);
        btnEntrar.Cursor = Cursors.Hand;
        btnEntrar.Click += async delegate { await TentarLoginAsync(); };

        lblLoginStatus = new Label();
        lblLoginStatus.Text = "Backend esperado: http://localhost:3000";
        lblLoginStatus.ForeColor = Color.FromArgb(100, 116, 139);
        lblLoginStatus.Dock = DockStyle.Top;
        lblLoginStatus.Height = 48;
        lblLoginStatus.TextAlign = ContentAlignment.MiddleCenter;

        card.Controls.Add(lblLoginStatus);
        card.Controls.Add(btnEntrar);
        card.Controls.Add(Espaco(18));
        card.Controls.Add(txtSenha);
        card.Controls.Add(lblSenha);
        card.Controls.Add(Espaco(12));
        card.Controls.Add(txtIdentificacao);
        card.Controls.Add(lblId);
        card.Controls.Add(Espaco(18));
        card.Controls.Add(subtitulo);
        card.Controls.Add(titulo);

        wrapper.Controls.Add(card, 1, 1);
        root.Controls.Add(wrapper);
        Controls.Add(root);

        AcceptButton = btnEntrar;
        txtIdentificacao.Focus();
    }

    private Label CriarLabelCampo(string texto)
    {
        var label = new Label();
        label.Text = texto;
        label.Dock = DockStyle.Top;
        label.Height = 28;
        label.ForeColor = Color.FromArgb(30, 41, 59);
        label.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
        label.TextAlign = ContentAlignment.BottomLeft;
        return label;
    }

    private TextBox CriarInput(bool senha)
    {
        var input = new TextBox();
        input.Dock = DockStyle.Top;
        input.Height = 38;
        input.BorderStyle = BorderStyle.FixedSingle;
        input.Font = new Font("Segoe UI", 12F);
        input.UseSystemPasswordChar = senha;
        return input;
    }

    private Control Espaco(int altura)
    {
        return new Panel { Dock = DockStyle.Top, Height = altura, BackColor = Color.Transparent };
    }

    private async Task TentarLoginAsync()
    {
        string identificacao = (txtIdentificacao.Text ?? "").Trim();
        string senha = (txtSenha.Text ?? "").Trim();

        if (string.IsNullOrWhiteSpace(identificacao) || string.IsNullOrWhiteSpace(senha))
        {
            lblLoginStatus.Text = "Informe identificação e senha.";
            lblLoginStatus.ForeColor = Color.FromArgb(185, 28, 28);
            return;
        }

        adminIdentificacao = identificacao;
        adminKey = senha;
        lblLoginStatus.Text = "Verificando acesso administrativo...";
        lblLoginStatus.ForeColor = Color.FromArgb(37, 99, 235);

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, ApiBase + "/admin/ocorrencias?status=todas");
            request.Headers.Add("X-Admin-Key", adminKey);
            var response = await http.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception(ExtrairMensagemErro(json));

            ConstruirPainel();
            await CarregarOcorrenciasAsync();
        }
        catch (Exception ex)
        {
            lblLoginStatus.Text = "Acesso negado ou backend offline.";
            lblLoginStatus.ForeColor = Color.FromArgb(185, 28, 28);
            MessageBox.Show(
                ex.Message + "\n\nVerifique se o backend Node está rodando em http://localhost:3000 e se a senha é a mesma ADMIN_KEY do arquivo .env.",
                "Erro no login administrativo",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private void ConstruirPainel()
    {
        Controls.Clear();

        var main = new TableLayoutPanel();
        main.Dock = DockStyle.Fill;
        main.BackColor = Color.FromArgb(241, 245, 249);
        main.Padding = new Padding(24);
        main.RowCount = 4;
        main.ColumnCount = 1;
        main.RowStyles.Add(new RowStyle(SizeType.Absolute, 92));
        main.RowStyles.Add(new RowStyle(SizeType.Absolute, 92));
        main.RowStyles.Add(new RowStyle(SizeType.Absolute, 68));
        main.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

        main.Controls.Add(CriarHeader(), 0, 0);
        main.Controls.Add(CriarResumo(), 0, 1);
        main.Controls.Add(CriarToolbar(), 0, 2);
        main.Controls.Add(CriarGrid(), 0, 3);

        Controls.Add(main);
        AcceptButton = null;
    }

    private Control CriarHeader()
    {
        var header = new TableLayoutPanel();
        header.Dock = DockStyle.Fill;
        header.ColumnCount = 4;
        header.RowCount = 1;
        header.BackColor = Color.FromArgb(15, 23, 42);
        header.Padding = new Padding(20, 14, 20, 14);
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 160));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 150));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 120));

        var bloco = new Panel();
        bloco.Dock = DockStyle.Fill;

        var titulo = new Label();
        titulo.Text = "Administração de ocorrências";
        titulo.Dock = DockStyle.Top;
        titulo.Height = 32;
        titulo.Font = new Font("Segoe UI", 18F, FontStyle.Bold);
        titulo.ForeColor = Color.White;

        lblStatus = new Label();
        lblStatus.Text = "Operador: " + adminIdentificacao;
        lblStatus.Dock = DockStyle.Top;
        lblStatus.Height = 24;
        lblStatus.ForeColor = Color.FromArgb(203, 213, 225);

        bloco.Controls.Add(lblStatus);
        bloco.Controls.Add(titulo);

        var btnAbrirSite = CriarBotao("Abrir site", Color.White, Color.FromArgb(15, 23, 42));
        btnAbrirSite.Click += delegate
        {
            Process.Start(new ProcessStartInfo { FileName = PortalUrl, UseShellExecute = true });
        };

        btnAtualizar = CriarBotao("Atualizar", Color.FromArgb(37, 99, 235), Color.White);
        btnAtualizar.Click += async delegate { await CarregarOcorrenciasAsync(); };

        var btnSair = CriarBotao("Sair", Color.FromArgb(51, 65, 85), Color.White);
        btnSair.Click += delegate
        {
            adminKey = "";
            adminIdentificacao = "";
            ocorrencias.Clear();
            MostrarLogin();
        };

        header.Controls.Add(bloco, 0, 0);
        header.Controls.Add(btnAbrirSite, 1, 0);
        header.Controls.Add(btnAtualizar, 2, 0);
        header.Controls.Add(btnSair, 3, 0);

        return header;
    }

    private Control CriarResumo()
    {
        var table = new TableLayoutPanel();
        table.Dock = DockStyle.Fill;
        table.ColumnCount = 4;
        table.RowCount = 1;
        table.Margin = new Padding(0, 14, 0, 10);

        for (int i = 0; i < 4; i++)
            table.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 25));

        lblPendentes = CriarResumoCard(table, "Pendentes", 0, Color.FromArgb(234, 179, 8));
        lblPublicadas = CriarResumoCard(table, "Publicadas", 1, Color.FromArgb(22, 163, 74));
        lblRecusadas = CriarResumoCard(table, "Recusadas", 2, Color.FromArgb(220, 38, 38));
        lblTotal = CriarResumoCard(table, "Total", 3, Color.FromArgb(37, 99, 235));

        return table;
    }

    private Label CriarResumoCard(TableLayoutPanel table, string titulo, int coluna, Color cor)
    {
        var panel = new Panel();
        panel.Dock = DockStyle.Fill;
        panel.BackColor = Color.White;
        panel.Padding = new Padding(16, 10, 16, 10);
        panel.Margin = new Padding(coluna == 0 ? 0 : 8, 0, coluna == 3 ? 0 : 8, 0);

        var borda = new Panel();
        borda.Width = 6;
        borda.Dock = DockStyle.Left;
        borda.BackColor = cor;

        var lbl = new Label();
        lbl.Text = titulo.ToUpperInvariant();
        lbl.ForeColor = Color.FromArgb(100, 116, 139);
        lbl.Font = new Font("Segoe UI", 8.5F, FontStyle.Bold);
        lbl.Dock = DockStyle.Top;
        lbl.Height = 22;

        var valor = new Label();
        valor.Text = "0";
        valor.ForeColor = Color.FromArgb(15, 23, 42);
        valor.Font = new Font("Segoe UI", 24F, FontStyle.Bold);
        valor.Dock = DockStyle.Fill;

        panel.Controls.Add(valor);
        panel.Controls.Add(lbl);
        panel.Controls.Add(borda);

        table.Controls.Add(panel, coluna, 0);
        return valor;
    }

    private Control CriarToolbar()
    {
        var bar = new TableLayoutPanel();
        bar.Dock = DockStyle.Fill;
        bar.BackColor = Color.White;
        bar.Padding = new Padding(14);
        bar.ColumnCount = 4;
        bar.RowCount = 1;
        bar.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        bar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 220));
        bar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 150));
        bar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 150));

        var titulo = new Label();
        titulo.Text = "Fila de moderação";
        titulo.ForeColor = Color.FromArgb(15, 23, 42);
        titulo.Font = new Font("Segoe UI", 14F, FontStyle.Bold);
        titulo.Dock = DockStyle.Fill;
        titulo.TextAlign = ContentAlignment.MiddleLeft;

        cmbFiltro = new ComboBox();
        cmbFiltro.DropDownStyle = ComboBoxStyle.DropDownList;
        cmbFiltro.Items.AddRange(new object[] { "Pendentes", "Publicadas", "Recusadas", "Todas" });
        cmbFiltro.SelectedIndex = 0;
        cmbFiltro.Dock = DockStyle.Fill;
        cmbFiltro.SelectedIndexChanged += async delegate { await CarregarOcorrenciasAsync(); };

        btnAprovar = CriarBotao("Aprovar", Color.FromArgb(22, 101, 52), Color.White);
        btnAprovar.Click += async delegate { await AprovarSelecionadaAsync(); };

        btnRecusar = CriarBotao("Recusar", Color.FromArgb(153, 27, 27), Color.White);
        btnRecusar.Click += async delegate { await RecusarSelecionadaAsync(); };

        bar.Controls.Add(titulo, 0, 0);
        bar.Controls.Add(cmbFiltro, 1, 0);
        bar.Controls.Add(btnAprovar, 2, 0);
        bar.Controls.Add(btnRecusar, 3, 0);

        return bar;
    }

    private Control CriarGrid()
    {
        grid = new DataGridView();
        grid.Dock = DockStyle.Fill;
        grid.Margin = new Padding(0, 10, 0, 0);
        grid.BackgroundColor = Color.White;
        grid.BorderStyle = BorderStyle.None;
        grid.AllowUserToAddRows = false;
        grid.AllowUserToDeleteRows = false;
        grid.ReadOnly = true;
        grid.MultiSelect = false;
        grid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
        grid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
        grid.RowHeadersVisible = false;
        grid.EnableHeadersVisualStyles = false;
        grid.ColumnHeadersHeight = 44;
        grid.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(15, 23, 42);
        grid.ColumnHeadersDefaultCellStyle.ForeColor = Color.White;
        grid.ColumnHeadersDefaultCellStyle.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
        grid.DefaultCellStyle.Font = new Font("Segoe UI", 10F);
        grid.DefaultCellStyle.SelectionBackColor = Color.FromArgb(219, 234, 254);
        grid.DefaultCellStyle.SelectionForeColor = Color.FromArgb(15, 23, 42);
        grid.AlternatingRowsDefaultCellStyle.BackColor = Color.FromArgb(248, 250, 252);
        grid.RowTemplate.Height = 42;

        grid.Columns.Add("Id", "Id");
        grid.Columns.Add("Titulo", "Título");
        grid.Columns.Add("Bairro", "Bairro");
        grid.Columns.Add("Categoria", "Categoria");
        grid.Columns.Add("Prioridade", "Prioridade");
        grid.Columns.Add("Status", "Status");

        var visualizar = new DataGridViewButtonColumn();
        visualizar.Name = "Visualizar";
        visualizar.HeaderText = "Ação";
        visualizar.Text = "Visualizar";
        visualizar.UseColumnTextForButtonValue = true;
        visualizar.FlatStyle = FlatStyle.Flat;
        grid.Columns.Add(visualizar);

        grid.Columns["Id"].Visible = false;
        grid.Columns["Titulo"].FillWeight = 210;
        grid.Columns["Bairro"].FillWeight = 110;
        grid.Columns["Categoria"].FillWeight = 110;
        grid.Columns["Prioridade"].FillWeight = 90;
        grid.Columns["Status"].FillWeight = 90;
        grid.Columns["Visualizar"].FillWeight = 85;

        grid.CellContentClick += async delegate (object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0) return;

            if (grid.Columns[e.ColumnIndex].Name == "Visualizar")
            {
                var item = ObterOcorrenciaDaLinha(e.RowIndex);
                if (item != null) await AbrirJanelaOcorrenciaAsync(item);
            }
        };

        grid.CellDoubleClick += async delegate (object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0) return;
            var item = ObterOcorrenciaDaLinha(e.RowIndex);
            if (item != null) await AbrirJanelaOcorrenciaAsync(item);
        };

        return grid;
    }

    private Button CriarBotao(string texto, Color fundo, Color corTexto)
    {
        var btn = new Button();
        btn.Text = texto;
        btn.Dock = DockStyle.Fill;
        btn.Margin = new Padding(8, 0, 0, 0);
        btn.BackColor = fundo;
        btn.ForeColor = corTexto;
        btn.FlatStyle = FlatStyle.Flat;
        btn.FlatAppearance.BorderSize = 0;
        btn.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
        btn.Cursor = Cursors.Hand;
        return btn;
    }

    private string FiltroAtual()
    {
        if (cmbFiltro == null) return "pendente";

        switch (cmbFiltro.SelectedIndex)
        {
            case 1: return "aberta";
            case 2: return "recusada";
            case 3: return "todas";
            default: return "pendente";
        }
    }

    private async Task CarregarOcorrenciasAsync()
    {
        try
        {
            if (btnAtualizar != null) btnAtualizar.Enabled = false;
            if (lblStatus != null) lblStatus.Text = "Carregando ocorrências...";

            var request = new HttpRequestMessage(HttpMethod.Get, ApiBase + "/admin/ocorrencias?status=" + Uri.EscapeDataString(FiltroAtual()));
            request.Headers.Add("X-Admin-Key", adminKey);

            var response = await http.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception(ExtrairMensagemErro(json));

            var data = JsonConvert.DeserializeObject<AdminResponse>(json);
            ocorrencias = data != null && data.Ocorrencias != null ? data.Ocorrencias : new List<Ocorrencia>();

            AtualizarResumo(data != null ? data.Resumo : null);
            RenderizarGrid();

            if (lblStatus != null)
                lblStatus.Text = "Operador: " + adminIdentificacao + " | Última atualização: " + DateTime.Now.ToString("HH:mm:ss");
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.Message, "Erro ao carregar ocorrências", MessageBoxButtons.OK, MessageBoxIcon.Error);
            if (lblStatus != null) lblStatus.Text = "Erro de conexão.";
        }
        finally
        {
            if (btnAtualizar != null) btnAtualizar.Enabled = true;
        }
    }

    private string ExtrairMensagemErro(string json)
    {
        try
        {
            var erro = JsonConvert.DeserializeObject<ApiError>(json);
            if (erro != null && !string.IsNullOrWhiteSpace(erro.Message)) return erro.Message;
        }
        catch { }

        return "Erro ao comunicar com o backend.";
    }

    private void AtualizarResumo(Resumo resumo)
    {
        if (resumo == null) resumo = new Resumo();

        lblPendentes.Text = resumo.Pendentes.ToString();
        lblPublicadas.Text = resumo.Publicadas.ToString();
        lblRecusadas.Text = resumo.Recusadas.ToString();
        lblTotal.Text = resumo.Total.ToString();
    }

    private void RenderizarGrid()
    {
        grid.Rows.Clear();

        foreach (var item in ocorrencias)
        {
            grid.Rows.Add(item.Id, item.Titulo, item.Bairro, item.Categoria, PrioridadeTexto(item.Prioridade), StatusTexto(item.Status));
        }

        if (grid.Rows.Count > 0) grid.Rows[0].Selected = true;
    }

    private Ocorrencia Selecionada()
    {
        if (grid.SelectedRows.Count == 0) return null;
        return ObterOcorrenciaDaLinha(grid.SelectedRows[0].Index);
    }

    private Ocorrencia ObterOcorrenciaDaLinha(int rowIndex)
    {
        if (rowIndex < 0 || rowIndex >= grid.Rows.Count) return null;

        string id = Convert.ToString(grid.Rows[rowIndex].Cells["Id"].Value);

        foreach (var item in ocorrencias)
        {
            if (item.Id == id || item.MongoId == id) return item;
        }

        return null;
    }

    private async Task AbrirJanelaOcorrenciaAsync(Ocorrencia item)
    {
        using (var modal = new Form())
        {
            modal.Text = "Visualizar ocorrência";
            modal.StartPosition = FormStartPosition.CenterParent;
            modal.Size = new Size(1080, 720);
            modal.MinimumSize = new Size(940, 620);
            modal.BackColor = Color.FromArgb(241, 245, 249);

            var root = new TableLayoutPanel();
            root.Dock = DockStyle.Fill;
            root.Padding = new Padding(22);
            root.ColumnCount = 1;
            root.RowCount = 3;
            root.RowStyles.Add(new RowStyle(SizeType.Absolute, 70));
            root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            root.RowStyles.Add(new RowStyle(SizeType.Absolute, 66));

            var titulo = new Label();
            titulo.Text = item.Titulo ?? "Ocorrência";
            titulo.Dock = DockStyle.Fill;
            titulo.Font = new Font("Segoe UI", 20F, FontStyle.Bold);
            titulo.ForeColor = Color.FromArgb(15, 23, 42);
            titulo.TextAlign = ContentAlignment.MiddleLeft;

            var conteudo = new TableLayoutPanel();
            conteudo.Dock = DockStyle.Fill;
            conteudo.ColumnCount = 2;
            conteudo.RowCount = 1;
            conteudo.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 45));
            conteudo.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 55));

            var boxImagem = new Panel();
            boxImagem.Dock = DockStyle.Fill;
            boxImagem.BackColor = Color.White;
            boxImagem.Padding = new Padding(14);
            boxImagem.Margin = new Padding(0, 0, 14, 0);

            var pictureModal = new PictureBox();
            pictureModal.Dock = DockStyle.Fill;
            pictureModal.BackColor = Color.FromArgb(226, 232, 240);
            pictureModal.SizeMode = PictureBoxSizeMode.Zoom;
            pictureModal.Image = TentarCarregarImagem(item.Foto ?? item.Imagem);

            if (pictureModal.Image == null)
            {
                pictureModal.Paint += delegate (object sender, PaintEventArgs e)
                {
                    string texto = "Imagem indisponível";
                    using (var brush = new SolidBrush(Color.FromArgb(100, 116, 139)))
                    using (var font = new Font("Segoe UI", 13F, FontStyle.Bold))
                    {
                        var size = e.Graphics.MeasureString(texto, font);
                        e.Graphics.DrawString(texto, font, brush,
                            (pictureModal.Width - size.Width) / 2,
                            (pictureModal.Height - size.Height) / 2);
                    }
                };
            }

            boxImagem.Controls.Add(pictureModal);

            var info = new RichTextBox();
            info.Dock = DockStyle.Fill;
            info.ReadOnly = true;
            info.BorderStyle = BorderStyle.None;
            info.BackColor = Color.White;
            info.ForeColor = Color.FromArgb(15, 23, 42);
            info.Font = new Font("Segoe UI", 11F);
            info.Text = MontarTextoDetalhes(item);
            info.Margin = new Padding(0);

            conteudo.Controls.Add(boxImagem, 0, 0);
            conteudo.Controls.Add(info, 1, 0);

            var rodape = new FlowLayoutPanel();
            rodape.Dock = DockStyle.Fill;
            rodape.FlowDirection = FlowDirection.RightToLeft;
            rodape.Padding = new Padding(0, 14, 0, 0);

            var btnFechar = CriarBotaoModal("Fechar", Color.FromArgb(51, 65, 85), Color.White);
            btnFechar.Click += delegate { modal.Close(); };
            rodape.Controls.Add(btnFechar);

            if (item.Status == "pendente")
            {
                var btnModalRecusar = CriarBotaoModal("Recusar", Color.FromArgb(153, 27, 27), Color.White);
                btnModalRecusar.Click += async delegate
                {
                    string motivo = SolicitarMotivoRecusa();
                    if (motivo == null) return;
                    if (string.IsNullOrWhiteSpace(motivo)) motivo = "Ocorrência recusada pela administração.";
                    if (await EnviarModeracaoAsync(item.Id, "recusar", motivo)) modal.Close();
                };

                var btnModalAprovar = CriarBotaoModal("Aprovar", Color.FromArgb(22, 101, 52), Color.White);
                btnModalAprovar.Click += async delegate
                {
                    if (MessageBox.Show("Aprovar e publicar esta ocorrência?", "Confirmar aprovação", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
                    if (await EnviarModeracaoAsync(item.Id, "aprovar", null)) modal.Close();
                };

                rodape.Controls.Add(btnModalRecusar);
                rodape.Controls.Add(btnModalAprovar);
            }

            root.Controls.Add(titulo, 0, 0);
            root.Controls.Add(conteudo, 0, 1);
            root.Controls.Add(rodape, 0, 2);
            modal.Controls.Add(root);

            modal.ShowDialog(this);
            await CarregarOcorrenciasAsync();
        }
    }

    private Button CriarBotaoModal(string texto, Color fundo, Color corTexto)
    {
        var btn = new Button();
        btn.Text = texto;
        btn.Width = 130;
        btn.Height = 42;
        btn.Margin = new Padding(10, 0, 0, 0);
        btn.BackColor = fundo;
        btn.ForeColor = corTexto;
        btn.FlatStyle = FlatStyle.Flat;
        btn.FlatAppearance.BorderSize = 0;
        btn.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
        btn.Cursor = Cursors.Hand;
        return btn;
    }

    private string MontarTextoDetalhes(Ocorrencia item)
    {
        return
            "ID: " + (item.Id ?? "") + "\n\n" +
            "STATUS\n" + StatusTexto(item.Status) + "\n\n" +
            "PRIORIDADE\n" + PrioridadeTexto(item.Prioridade) + "\n\n" +
            "CATEGORIA\n" + (item.Categoria ?? "Não informado") + "\n\n" +
            "BAIRRO\n" + (item.Bairro ?? "Não informado") + "\n\n" +
            "ENDEREÇO\n" + (item.Endereco ?? "Não informado") + "\n\n" +
            "DESCRIÇÃO\n" + (item.Descricao ?? "") + "\n\n" +
            "ORIENTAÇÃO\n" +
            "Aprove somente se a ocorrência tiver relação com o bairro, descrição compreensível e imagem adequada. Caso contrário, use Recusar e informe o motivo.";
    }

    private Image TentarCarregarImagem(string value)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            if (value.StartsWith("data:image/svg", StringComparison.OrdinalIgnoreCase)) return null;

            if (value.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            {
                int comma = value.IndexOf(',');
                if (comma < 0) return null;

                byte[] bytes = Convert.FromBase64String(value.Substring(comma + 1));
                using (var ms = new MemoryStream(bytes))
                using (var img = Image.FromStream(ms))
                {
                    return new Bitmap(img);
                }
            }

            if (value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || value.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                byte[] bytes = http.GetByteArrayAsync(value).GetAwaiter().GetResult();
                using (var ms = new MemoryStream(bytes))
                using (var img = Image.FromStream(ms))
                {
                    return new Bitmap(img);
                }
            }
        }
        catch { }

        return null;
    }

    private async Task AprovarSelecionadaAsync()
    {
        var item = Selecionada();

        if (item == null)
        {
            MessageBox.Show("Selecione uma ocorrência.", "Atenção", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        if (item.Status != "pendente")
        {
            MessageBox.Show("Somente ocorrências pendentes podem ser aprovadas.", "Atenção", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        if (MessageBox.Show("Aprovar e publicar esta ocorrência?", "Confirmar aprovação", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;

        await EnviarModeracaoAsync(item.Id, "aprovar", null);
    }

    private async Task RecusarSelecionadaAsync()
    {
        var item = Selecionada();

        if (item == null)
        {
            MessageBox.Show("Selecione uma ocorrência.", "Atenção", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        if (item.Status != "pendente")
        {
            MessageBox.Show("Somente ocorrências pendentes podem ser recusadas.", "Atenção", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        string motivo = SolicitarMotivoRecusa();
        if (motivo == null) return;
        if (string.IsNullOrWhiteSpace(motivo)) motivo = "Ocorrência recusada pela administração.";

        await EnviarModeracaoAsync(item.Id, "recusar", motivo);
    }

    private async Task<bool> EnviarModeracaoAsync(string id, string acao, string motivo)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, ApiBase + "/admin/ocorrencias/" + Uri.EscapeDataString(id) + "/" + acao);
            request.Headers.Add("X-Admin-Key", adminKey);

            string payload = motivo == null ? "{}" : JsonConvert.SerializeObject(new { motivo = motivo });
            request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

            var response = await http.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode) throw new Exception(ExtrairMensagemErro(json));

            MessageBox.Show(acao == "aprovar" ? "Ocorrência aprovada e publicada." : "Ocorrência recusada.", "Moderação concluída", MessageBoxButtons.OK, MessageBoxIcon.Information);
            await CarregarOcorrenciasAsync();
            return true;
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.Message, "Erro na moderação", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return false;
        }
    }

    private string SolicitarMotivoRecusa()
    {
        using (var form = new Form())
        using (var box = new TextBox())
        using (var ok = new Button())
        using (var cancel = new Button())
        {
            form.Text = "Motivo da recusa";
            form.Size = new Size(620, 320);
            form.StartPosition = FormStartPosition.CenterParent;
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.MaximizeBox = false;
            form.MinimizeBox = false;
            form.BackColor = Color.FromArgb(241, 245, 249);

            var label = new Label();
            label.Text = "Informe o motivo da recusa:";
            label.Dock = DockStyle.Top;
            label.Height = 42;
            label.Padding = new Padding(16, 14, 16, 0);
            label.Font = new Font("Segoe UI", 10F, FontStyle.Bold);

            box.Multiline = true;
            box.Dock = DockStyle.Top;
            box.Height = 160;
            box.Font = new Font("Segoe UI", 10.5F);
            box.Text = "Conteúdo inválido, ofensivo, sem relação com o bairro ou com imagem inadequada.";

            var footer = new FlowLayoutPanel();
            footer.Dock = DockStyle.Bottom;
            footer.Height = 62;
            footer.FlowDirection = FlowDirection.RightToLeft;
            footer.Padding = new Padding(12);

            ok.Text = "Recusar";
            ok.DialogResult = DialogResult.OK;
            ok.Width = 120;
            ok.Height = 36;
            ok.BackColor = Color.FromArgb(153, 27, 27);
            ok.ForeColor = Color.White;
            ok.FlatStyle = FlatStyle.Flat;
            ok.FlatAppearance.BorderSize = 0;

            cancel.Text = "Cancelar";
            cancel.DialogResult = DialogResult.Cancel;
            cancel.Width = 120;
            cancel.Height = 36;

            footer.Controls.Add(ok);
            footer.Controls.Add(cancel);

            form.Controls.Add(footer);
            form.Controls.Add(box);
            form.Controls.Add(label);

            form.AcceptButton = ok;
            form.CancelButton = cancel;

            return form.ShowDialog(this) == DialogResult.OK ? box.Text : null;
        }
    }

    private string StatusTexto(string status)
    {
        if (status == "aberta") return "Publicada";
        if (status == "recusada") return "Recusada";
        return "Pendente";
    }

    private string PrioridadeTexto(string prioridade)
    {
        if (prioridade == "baixa") return "Baixa";
        if (prioridade == "alta") return "Alta";
        if (prioridade == "urgente") return "Urgente";
        return "Média";
    }

    protected override void OnFormClosed(FormClosedEventArgs e)
    {
        http.Dispose();
        base.OnFormClosed(e);
    }

    public class AdminResponse
    {
        [JsonProperty("ocorrencias")]
        public List<Ocorrencia> Ocorrencias { get; set; }

        [JsonProperty("resumo")]
        public Resumo Resumo { get; set; }
    }

    public class Resumo
    {
        [JsonProperty("pendentes")]
        public int Pendentes { get; set; }

        [JsonProperty("publicadas")]
        public int Publicadas { get; set; }

        [JsonProperty("recusadas")]
        public int Recusadas { get; set; }

        [JsonProperty("total")]
        public int Total { get; set; }
    }

    public class Ocorrencia
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("_id")]
        public string MongoId { get; set; }

        [JsonProperty("titulo")]
        public string Titulo { get; set; }

        [JsonProperty("descricao")]
        public string Descricao { get; set; }

        [JsonProperty("categoria")]
        public string Categoria { get; set; }

        [JsonProperty("bairro")]
        public string Bairro { get; set; }

        [JsonProperty("endereco")]
        public string Endereco { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; }

        [JsonProperty("prioridade")]
        public string Prioridade { get; set; }

        [JsonProperty("foto")]
        public string Foto { get; set; }

        [JsonProperty("imagem")]
        public string Imagem { get; set; }
    }

    public class ApiError
    {
        [JsonProperty("message")]
        public string Message { get; set; }
    }
}
