using System.Text.RegularExpressions;
using MySql.Data.MySqlClient;

namespace novatentativa_projeto
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }


        private void txtEmail_KeyPress(object sender, KeyPressEventArgs e)
        {
            // Se o usuário apertar a tecla de espaço, o caractere é bloqueado
            if (char.IsWhiteSpace(e.KeyChar))
            {
                e.Handled = true;
            }
        }

        private void txtSenha_TextChanged(object sender, EventArgs e)
        {

            //deixar a senha oculta
            txtSenha.UseSystemPasswordChar = true;

            //limitar a quantidade de caracteres
            txtSenha.MaxLength = 12;

        }




        //estruturar de autenticação do login com o banco

        private void btnEntrar_Click(object sender, EventArgs e)
        {
            string conexao = "localhost; database= projeto_integrador;uid=root; pwd=;";

            using (MySqlConnection conn = new MySqlConnection(conexao))
            {
                try
                {
                    conn.Open();

                    string sql = "SELECT * FROM usuarios WHERE email=@email AND senha=@senha";

                    MySqlCommand cmd = new MySqlCommand(sql, conn);

                    cmd.Parameters.AddWithValue("@email", txtEmail.Text);
                    cmd.Parameters.AddWithValue("@senha", txtSenha.Text);

                    MySqlDataReader reader = cmd.ExecuteReader();

                    if (reader.HasRows)
                    {
                        MessageBox.Show("Login realizado!");

                        home tela = new home();
                        tela.Show();

                        this.Hide();
                    }
                    else
                    {
                        MessageBox.Show("Email ou senha inválidos");
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Erro: " + ex.Message);
                }
            }
        }


        private void btnCadastro_Click(object sender, EventArgs e)
        {
            
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {

        }

        private void panel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            home tela = new home();
            tela.Show();
            this.Hide();
        }
    }

}
