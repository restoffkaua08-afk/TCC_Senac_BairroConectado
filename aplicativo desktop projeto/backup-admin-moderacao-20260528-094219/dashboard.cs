using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using MySql.Data.MySqlClient;
using System.Data;

namespace novatentativa_projeto
{
    public partial class dashboard : Form
    {
        public dashboard()
        {
            InitializeComponent();
        }

        private void dashboard_Load(object sender, EventArgs e)
        {
            CarregarChamados();
        }

        private void CarregarChamados()
        {
            string conexao = "server=localhost; database=projeto_integrador; uid=root; pwd=;";

            using (MySqlConnection conn = new MySqlConnection(conexao))
            {
                try
                {
                    conn.Open();

                    string sql = "SELECT id, titulo, descricao, localizacao, status FROM ocorrencias";

                    MySqlDataAdapter da = new MySqlDataAdapter(sql, conn);

                    DataTable dt = new DataTable();

                    da.Fill(dt);

                    gridChamados.DataSource = dt;
                    
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message);
                }
            }
        }



        private void btnAprovar_Click(object sender, EventArgs e)
        {


            {
                string conexao = "server=localhost; database= projeto_integrador; uid=root;pwd=;";

                int idChamado = Convert.ToInt32(gridChamados.CurrentRow.Cells["id"].Value);

                using (MySqlConnection conn = new MySqlConnection(conexao))
                {
                    conn.Open();

                    string sql = "UPDATE ocorrencias SET status='Aprovado' WHERE id=@id";

                    MySqlCommand cmd = new MySqlCommand(sql, conn);

                    cmd.Parameters.AddWithValue("@id", idChamado);

                    cmd.ExecuteNonQuery();

                    MessageBox.Show("Chamado aprovado!");

                    CarregarChamados();
                }

            }
        }

        private void btnReprovar_Click(object sender, EventArgs e)
        {

            string conexao = "server=localhost;database=projeto_integrador;uid=root;pwd=;";

            int idChamado = Convert.ToInt32(gridChamados.CurrentRow.Cells["id"].Value);

            using (MySqlConnection conn = new MySqlConnection(conexao))
            {
                conn.Open();

                string sql = "UPDATE ocorrencias SET status='Reprovado' WHERE id=@id";

                MySqlCommand cmd = new MySqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("@id", idChamado);

                cmd.ExecuteNonQuery();

                MessageBox.Show("Chamado reprovado!");

                CarregarChamados();

            }
        }

        private void gridChamados_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {

        }

        private void gridChamados2_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {

        }

        private void btnAprovar2_Click(object sender, EventArgs e)
        {
            {
                string conexao = "server=localhost;database=projeto_integrador;uid=root;pwd=;";

                int idChamado = Convert.ToInt32(gridChamados2.CurrentRow.Cells["id"].Value);

                using (MySqlConnection conn = new MySqlConnection(conexao))
                {
                    conn.Open();

                    string sql = "UPDATE ocorrencias SET status='Aprovado' WHERE id=@id";

                    MySqlCommand cmd = new MySqlCommand(sql, conn);

                    cmd.Parameters.AddWithValue("@id", idChamado);

                    cmd.ExecuteNonQuery();

                    MessageBox.Show("Chamado aprovado!");

                    CarregarChamados();
                }

            }
        }

        private void btnAprovar3_Click(object sender, EventArgs e)
        {
            {
                string conexao = "server=localhost;database=projeto_integrador;uid=root;pwd=;";

                int idChamado = Convert.ToInt32(gridChamados3.CurrentRow.Cells["id"].Value);

                using (MySqlConnection conn = new MySqlConnection(conexao))
                {
                    conn.Open();

                    string sql = "UPDATE ocorrencias SET status='Aprovado' WHERE id=@id";

                    MySqlCommand cmd = new MySqlCommand(sql, conn);

                    cmd.Parameters.AddWithValue("@id", idChamado);

                    cmd.ExecuteNonQuery();

                    MessageBox.Show("Chamado aprovado!");

                    CarregarChamados();
                }

            }
        }

        private void btnAprovar4_Click(object sender, EventArgs e)
        {
            {
                string conexao = "server=localhost;database=projeto_integrador;uid=root;pwd=;";

                int idChamado = Convert.ToInt32(gridChamados4.CurrentRow.Cells["id"].Value);

                using (MySqlConnection conn = new MySqlConnection(conexao))
                {
                    conn.Open();

                    string sql = "UPDATE ocorrencias SET status='Aprovado' WHERE id=@id";

                    MySqlCommand cmd = new MySqlCommand(sql, conn);

                    cmd.Parameters.AddWithValue("@id", idChamado);

                    cmd.ExecuteNonQuery();

                    MessageBox.Show("Chamado aprovado!");

                    CarregarChamados();
                }

            }
        }

        private void btnReprovar2_Click(object sender, EventArgs e)
        {

            string conexao = "server=localhost;database=projeto_integrador;uid=root;pwd=;";

            int idChamado = Convert.ToInt32(gridChamados2.CurrentRow.Cells["id"].Value);

            using (MySqlConnection conn = new MySqlConnection(conexao))
            {
                conn.Open();

                string sql = "UPDATE ocorrencias SET status='Reprovado' WHERE id=@id";

                MySqlCommand cmd = new MySqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("@id", idChamado);

                cmd.ExecuteNonQuery();

                MessageBox.Show("Chamado reprovado!");

                CarregarChamados();

            }
        }

        private void btnReprovar3_Click(object sender, EventArgs e)
        {

            string conexao = "server=localhost;database=projeto_integrador;uid=root;pwd=;";

            int idChamado = Convert.ToInt32(gridChamados3.CurrentRow.Cells["id"].Value);

            using (MySqlConnection conn = new MySqlConnection(conexao))
            {
                conn.Open();

                string sql = "UPDATE ocorrencias SET status='Reprovado' WHERE id=@id";

                MySqlCommand cmd = new MySqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("@id", idChamado);

                cmd.ExecuteNonQuery();

                MessageBox.Show("Chamado reprovado!");

                CarregarChamados();

            }
        }

        private void btnReprovar4_Click(object sender, EventArgs e)
        {

            string conexao = "server=localhost;database=projeto_integrador;uid=root;pwd=;";

            int idChamado = Convert.ToInt32(gridChamados4.CurrentRow.Cells["id"].Value);

            using (MySqlConnection conn = new MySqlConnection(conexao))
            {
                conn.Open();

                string sql = "UPDATE ocorrencias SET status='Reprovado' WHERE id=@id";

                MySqlCommand cmd = new MySqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("@id", idChamado);

                cmd.ExecuteNonQuery();

                MessageBox.Show("Chamado reprovado!");

                CarregarChamados();

            }
        }
    }



}
   
    

