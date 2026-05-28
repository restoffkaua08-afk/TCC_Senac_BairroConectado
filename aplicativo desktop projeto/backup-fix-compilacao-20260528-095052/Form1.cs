using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Newtonsoft.Json;

namespace novatentativa_projeto
{
    public partial class Form1 : Form
    {
        private const string ApiBase = "http://localhost:3000/api";
        private readonly HttpClient http = new HttpClient();

        private TextBox txtAdminKey;
        private ComboBox cmbFiltro;
        private DataGridView grid;
        private PictureBox picture;
        private TextBox txtDetalhes;
        private Label lblPendentes;
        private Label lblPublicadas;
        private Label lblRecusadas;
        private Label lblTotal;
        private Label lblStatus;
        private Button btnAprovar;
        private Button btnRecusar;
        private Button btnAtualizar;

        private List<Ocorrencia> ocorrencias = new List<Ocorrencia>();

        public Form1()
        {
            InitializeComponent();
            ConstruirInterface();
            Load += async delegate { await CarregarOcorrenciasAsync(); };
        }

        private void ConstruirInterface()
        {
            Text = "Bairro Conectado - Administração de Ocorrências";
            WindowState = FormWindowState.Maximized;
            MinimumSize = new Size(1180, 720);
            BackColor = Color.FromArgb(244, 247, 251);
            Font = new Font("Segoe UI", 10F);

            Controls.Clear();

            var root = new TableLayoutPanel();
            root.Dock = DockStyle.Fill;
            root.ColumnCount = 2;
            root.RowCount = 1;
            root.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 300));
            root.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            Controls.Add(root);

            root.Controls.Add(CriarSidebar(), 0, 0);
            root.Controls.Add(CriarMain(), 1, 0);
        }

        private Control CriarSidebar()
        {
            var panel = new Panel();
            panel.Dock = DockStyle.Fill;
            panel.BackColor = Color.FromArgb(15, 23, 42);
            panel.Padding = new Padding(24);

            var titulo = new Label();
            titulo.Text = "Bairro\nConectado";
            titulo.ForeColor = Color.White;
            titulo.Font = new Font("Segoe UI", 25F, FontStyle.Bold);
            titulo.Dock = DockStyle.Top;
            titulo.Height = 96;

            var subtitulo = new Label();
            subtitulo.Text = "Painel desktop administrativo";
            subtitulo.ForeColor = Color.FromArgb(203, 213, 225);
            subtitulo.Dock = DockStyle.Top;
            subtitulo.Height = 36;

            var fluxo = new Label();
            fluxo.Text =
                "Fluxo do sistema:\n\n" +
                "1. O morador cadastra a ocorrência.\n\n" +
                "2. Ela entra como pendente.\n\n" +
                "3. O administrador confere imagem, texto e localização.\n\n" +
                "4. Se aprovar, a ocorrência aparece no site.\n\n" +
                "5. Se recusar, fica bloqueada.";
            fluxo.ForeColor = Color.FromArgb(226, 232, 240);
            fluxo.BackColor = Color.FromArgb(30, 41, 59);
            fluxo.Padding = new Padding(16);
            fluxo.Dock = DockStyle.Top;
            fluxo.Height = 330;

            var abrirSite = new Button();
            abrirSite.Text = "Abrir portal público";
            abrirSite.Height = 46;
            abrirSite.Dock = DockStyle.Bottom;
            abrirSite.BackColor = Color.White;
            abrirSite.ForeColor = Color.FromArgb(15, 23, 42);
            abrirSite.FlatStyle = FlatStyle.Flat;
            abrirSite.FlatAppearance.BorderSize = 0;
            abrirSite.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            abrirSite.Click += delegate
            {
                try
                {
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "http://localhost:3000/ocorrencias.html",
                        UseShellExecute = true
                    });
                }
                catch { }
            };

            panel.Controls.Add(abrirSite);
            panel.Controls.Add(fluxo);
            panel.Controls.Add(subtitulo);
            panel.Controls.Add(titulo);

            return panel;
        }

        private Control CriarMain()
        {
            var main = new TableLayoutPanel();
            main.Dock = DockStyle.Fill;
            main.Padding = new Padding(28);
            main.RowCount = 5;
            main.ColumnCount = 1;
            main.RowStyles.Add(new RowStyle(SizeType.Absolute, 170));
            main.RowStyles.Add(new RowStyle(SizeType.Absolute, 96));
            main.RowStyles.Add(new RowStyle(SizeType.Absolute, 72));
            main.RowStyles.Add(new RowStyle(SizeType.Percent, 62));
            main.RowStyles.Add(new RowStyle(SizeType.Percent, 38));

            main.Controls.Add(CriarHero(), 0, 0);
            main.Controls.Add(CriarResumo(), 0, 1);
            main.Controls.Add(CriarToolbar(), 0, 2);
            main.Controls.Add(CriarGrid(), 0, 3);
            main.Controls.Add(CriarDetalhes(), 0, 4);

            return main;
        }

        private Control CriarHero()
        {
            var hero = new Panel();
            hero.Dock = DockStyle.Fill;
            hero.BackColor = Color.FromArgb(15, 23, 42);
            hero.Padding = new Padding(26);
            hero.Margin = new Padding(0, 0, 0, 16);

            var titulo = new Label();
            titulo.Text = "Validação de ocorrências";
            titulo.ForeColor = Color.White;
            titulo.Font = new Font("Segoe UI", 28F, FontStyle.Bold);
            titulo.Dock = DockStyle.Top;
            titulo.Height = 56;

            var texto = new Label();
            texto.Text = "Revise as solicitações enviadas pelos moradores antes de publicar no portal. Evita imagens indevidas, textos ofensivos e registros sem relação com o bairro.";
            texto.ForeColor = Color.FromArgb(219, 234, 254);
            texto.Dock = DockStyle.Top;
            texto.Height = 48;

            var linha = new FlowLayoutPanel();
            linha.Dock = DockStyle.Bottom;
            linha.Height = 42;
            linha.FlowDirection = FlowDirection.LeftToRight;
            linha.WrapContents = false;

            var lbl = new Label();
            lbl.Text = "Código admin:";
            lbl.ForeColor = Color.White;
            lbl.Width = 105;
            lbl.Height = 32;
            lbl.TextAlign = ContentAlignment.MiddleLeft;
            lbl.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);

            txtAdminKey = new TextBox();
            txtAdminKey.Width = 260;
            txtAdminKey.UseSystemPasswordChar = true;
            txtAdminKey.Text = "bairro-admin-2026";

            lblStatus = new Label();
            lblStatus.Text = "Backend: http://localhost:3000";
            lblStatus.ForeColor = Color.FromArgb(203, 213, 225);
            lblStatus.Width = 390;
            lblStatus.Height = 32;
            lblStatus.TextAlign = ContentAlignment.MiddleLeft;

            linha.Controls.Add(lbl);
            linha.Controls.Add(txtAdminKey);
            linha.Controls.Add(lblStatus);

            hero.Controls.Add(linha);
            hero.Controls.Add(texto);
            hero.Controls.Add(titulo);

            return hero;
        }

        private Control CriarResumo()
        {
            var table = new TableLayoutPanel();
            table.Dock = DockStyle.Fill;
            table.ColumnCount = 4;
            table.RowCount = 1;
            table.Margin = new Padding(0, 0, 0, 16);

            for (int i = 0; i < 4; i++)
                table.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 25));

            lblPendentes = CriarResumoCard(table, "Pendentes", 0);
            lblPublicadas = CriarResumoCard(table, "Publicadas", 1);
            lblRecusadas = CriarResumoCard(table, "Recusadas", 2);
            lblTotal = CriarResumoCard(table, "Total", 3);

            return table;
        }

        private Label CriarResumoCard(TableLayoutPanel table, string titulo, int coluna)
        {
            var panel = new Panel();
            panel.Dock = DockStyle.Fill;
            panel.BackColor = Color.White;
            panel.Padding = new Padding(16);
            panel.Margin = new Padding(coluna == 0 ? 0 : 8, 0, coluna == 3 ? 0 : 8, 0);

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

            table.Controls.Add(panel, coluna, 0);
            return valor;
        }

        private Control CriarToolbar()
        {
            var bar = new TableLayoutPanel();
            bar.Dock = DockStyle.Fill;
            bar.BackColor = Color.White;
            bar.Padding = new Padding(16);
            bar.ColumnCount = 5;
            bar.RowCount = 1;
            bar.Margin = new Padding(0, 0, 0, 16);

            bar.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            bar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 210));
            bar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 130));
            bar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 170));
            bar.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 140));

            var titulo = new Label();
            titulo.Text = "Solicitações de ocorrências";
            titulo.ForeColor = Color.FromArgb(15, 23, 42);
            titulo.Font = new Font("Segoe UI", 16F, FontStyle.Bold);
            titulo.Dock = DockStyle.Fill;
            titulo.TextAlign = ContentAlignment.MiddleLeft;

            cmbFiltro = new ComboBox();
            cmbFiltro.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbFiltro.Items.AddRange(new object[] { "Pendentes", "Publicadas", "Recusadas", "Todas" });
            cmbFiltro.SelectedIndex = 0;
            cmbFiltro.Dock = DockStyle.Fill;
            cmbFiltro.SelectedIndexChanged += async delegate { await CarregarOcorrenciasAsync(); };

            btnAtualizar = CriarBotao("Atualizar", Color.FromArgb(15, 23, 42), Color.White);
            btnAtualizar.Click += async delegate { await CarregarOcorrenciasAsync(); };

            btnAprovar = CriarBotao("Aprovar", Color.FromArgb(22, 101, 52), Color.White);
            btnAprovar.Click += async delegate { await AprovarSelecionadaAsync(); };

            btnRecusar = CriarBotao("Recusar", Color.FromArgb(153, 27, 27), Color.White);
            btnRecusar.Click += async delegate { await RecusarSelecionadaAsync(); };

            bar.Controls.Add(titulo, 0, 0);
            bar.Controls.Add(cmbFiltro, 1, 0);
            bar.Controls.Add(btnAtualizar, 2, 0);
            bar.Controls.Add(btnAprovar, 3, 0);
            bar.Controls.Add(btnRecusar, 4, 0);

            return bar;
        }

        private Control CriarGrid()
        {
            grid = new DataGridView();
            grid.Dock = DockStyle.Fill;
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
            grid.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(15, 23, 42);
            grid.ColumnHeadersDefaultCellStyle.ForeColor = Color.White;
            grid.ColumnHeadersDefaultCellStyle.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            grid.DefaultCellStyle.SelectionBackColor = Color.FromArgb(219, 234, 254);
            grid.DefaultCellStyle.SelectionForeColor = Color.FromArgb(15, 23, 42);
            grid.RowTemplate.Height = 36;

            grid.Columns.Add("Id", "Id");
            grid.Columns.Add("Titulo", "Título");
            grid.Columns.Add("Bairro", "Bairro");
            grid.Columns.Add("Categoria", "Categoria");
            grid.Columns.Add("Prioridade", "Prioridade");
            grid.Columns.Add("Status", "Status");
            grid.Columns["Id"].Visible = false;

            grid.SelectionChanged += delegate { MostrarDetalhesSelecionado(); };

            return grid;
        }

        private Control CriarDetalhes()
        {
            var split = new SplitContainer();
            split.Dock = DockStyle.Fill;
            split.Orientation = Orientation.Vertical;
            split.SplitterDistance = 320;
            split.BackColor = Color.FromArgb(244, 247, 251);
            split.Margin = new Padding(0, 16, 0, 0);

            picture = new PictureBox();
            picture.Dock = DockStyle.Fill;
            picture.BackColor = Color.FromArgb(226, 232, 240);
            picture.SizeMode = PictureBoxSizeMode.Zoom;

            txtDetalhes = new TextBox();
            txtDetalhes.Dock = DockStyle.Fill;
            txtDetalhes.Multiline = true;
            txtDetalhes.ReadOnly = true;
            txtDetalhes.ScrollBars = ScrollBars.Vertical;
            txtDetalhes.BackColor = Color.White;
            txtDetalhes.BorderStyle = BorderStyle.None;
            txtDetalhes.Font = new Font("Segoe UI", 10.5F);

            split.Panel1.Controls.Add(picture);
            split.Panel2.Controls.Add(txtDetalhes);

            return split;
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
                lblStatus.Text = "Carregando...";

                var request = new HttpRequestMessage(
                    HttpMethod.Get,
                    ApiBase + "/admin/ocorrencias?status=" + Uri.EscapeDataString(FiltroAtual())
                );

                request.Headers.Add("X-Admin-Key", txtAdminKey.Text.Trim());

                var response = await http.SendAsync(request);
                var json = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new Exception(ExtrairMensagemErro(json));

                var data = JsonConvert.DeserializeObject<AdminResponse>(json);

                ocorrencias = data != null && data.Ocorrencias != null
                    ? data.Ocorrencias
                    : new List<Ocorrencia>();

                AtualizarResumo(data != null ? data.Resumo : null);
                RenderizarGrid();

                lblStatus.Text = "Conectado. Última atualização: " + DateTime.Now.ToString("HH:mm:ss");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Erro ao carregar ocorrências", MessageBoxButtons.OK, MessageBoxIcon.Error);
                lblStatus.Text = "Erro de conexão.";
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
                if (erro != null && !string.IsNullOrWhiteSpace(erro.Message))
                    return erro.Message;
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
                grid.Rows.Add(
                    item.Id,
                    item.Titulo,
                    item.Bairro,
                    item.Categoria,
                    item.Prioridade,
                    StatusTexto(item.Status)
                );
            }

            if (grid.Rows.Count > 0)
                grid.Rows[0].Selected = true;

            MostrarDetalhesSelecionado();
        }

        private Ocorrencia Selecionada()
        {
            if (grid.SelectedRows.Count == 0) return null;

            string id = Convert.ToString(grid.SelectedRows[0].Cells["Id"].Value);

            foreach (var item in ocorrencias)
            {
                if (item.Id == id || item.MongoId == id)
                    return item;
            }

            return null;
        }

        private void MostrarDetalhesSelecionado()
        {
            var item = Selecionada();

            if (item == null)
            {
                txtDetalhes.Text = "Nenhuma ocorrência selecionada.";
                picture.Image = null;
                return;
            }

            txtDetalhes.Text =
                "TÍTULO:\r\n" + (item.Titulo ?? "") + "\r\n\r\n" +
                "DESCRIÇÃO:\r\n" + (item.Descricao ?? "") + "\r\n\r\n" +
                "CATEGORIA: " + (item.Categoria ?? "Não informado") + "\r\n" +
                "BAIRRO: " + (item.Bairro ?? "Não informado") + "\r\n" +
                "ENDEREÇO: " + (item.Endereco ?? "Não informado") + "\r\n" +
                "PRIORIDADE: " + (item.Prioridade ?? "Não informado") + "\r\n" +
                "STATUS: " + StatusTexto(item.Status) + "\r\n\r\n" +
                "AÇÃO ESPERADA:\r\n" +
                "Aprovar somente se o texto e a imagem forem adequados e a ocorrência fizer sentido para o bairro.";

            picture.Image = TentarCarregarImagem(item.Foto ?? item.Imagem);
        }

        private Image TentarCarregarImagem(string value)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(value)) return null;

                if (value.StartsWith("data:image/svg", StringComparison.OrdinalIgnoreCase))
                    return null;

                if (value.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
                {
                    int comma = value.IndexOf(',');
                    if (comma < 0) return null;

                    string base64 = value.Substring(comma + 1);
                    byte[] bytes = Convert.FromBase64String(base64);

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

            if (MessageBox.Show("Aprovar e publicar esta ocorrência?", "Confirmar aprovação", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
                return;

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

            if (string.IsNullOrWhiteSpace(motivo))
                motivo = "Ocorrência recusada pela administração.";

            await EnviarModeracaoAsync(item.Id, "recusar", motivo);
        }

        private async Task EnviarModeracaoAsync(string id, string acao, string motivo)
        {
            try
            {
                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    ApiBase + "/admin/ocorrencias/" + Uri.EscapeDataString(id) + "/" + acao
                );

                request.Headers.Add("X-Admin-Key", txtAdminKey.Text.Trim());

                string payload = motivo == null
                    ? "{}"
                    : JsonConvert.SerializeObject(new { motivo = motivo });

                request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                var response = await http.SendAsync(request);
                var json = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new Exception(ExtrairMensagemErro(json));

                MessageBox.Show(
                    acao == "aprovar" ? "Ocorrência aprovada e publicada." : "Ocorrência recusada.",
                    "Moderação concluída",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );

                await CarregarOcorrenciasAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Erro na moderação", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                form.Size = new Size(540, 280);
                form.StartPosition = FormStartPosition.CenterParent;
                form.FormBorderStyle = FormBorderStyle.FixedDialog;
                form.MaximizeBox = false;
                form.MinimizeBox = false;

                var label = new Label();
                label.Text = "Informe o motivo da recusa:";
                label.Dock = DockStyle.Top;
                label.Height = 38;
                label.Padding = new Padding(14, 12, 14, 0);

                box.Multiline = true;
                box.Dock = DockStyle.Top;
                box.Height = 130;
                box.Text = "Conteúdo inválido, ofensivo, sem relação com o bairro ou com imagem inadequada.";

                var footer = new FlowLayoutPanel();
                footer.Dock = DockStyle.Bottom;
                footer.Height = 55;
                footer.FlowDirection = FlowDirection.RightToLeft;
                footer.Padding = new Padding(10);

                ok.Text = "Recusar";
                ok.DialogResult = DialogResult.OK;
                ok.Width = 110;

                cancel.Text = "Cancelar";
                cancel.DialogResult = DialogResult.Cancel;
                cancel.Width = 110;

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
}
