namespace novatentativa_projeto
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            txtEmail = new TextBox();
            txtSenha = new TextBox();
            btnEntrar = new Button();
            panel1 = new Panel();
            label2 = new Label();
            pictureBox1 = new PictureBox();
            button1 = new Button();
            panel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).BeginInit();
            SuspendLayout();
            // 
            // txtEmail
            // 
            txtEmail.AccessibleRole = AccessibleRole.OutlineButton;
            txtEmail.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            txtEmail.AutoCompleteMode = AutoCompleteMode.Append;
            txtEmail.ForeColor = Color.Gray;
            txtEmail.Location = new Point(70, 229);
            txtEmail.Multiline = true;
            txtEmail.Name = "txtEmail";
            txtEmail.PlaceholderText = "Digite seu email aqui...";
            txtEmail.Size = new Size(244, 27);
            txtEmail.TabIndex = 0;
            txtEmail.KeyPress += txtEmail_KeyPress;
            // 
            // txtSenha
            // 
            txtSenha.ForeColor = SystemColors.InactiveBorder;
            txtSenha.Location = new Point(70, 281);
            txtSenha.Multiline = true;
            txtSenha.Name = "txtSenha";
            txtSenha.PlaceholderText = "Digite sua senha aqui...";
            txtSenha.Size = new Size(244, 25);
            txtSenha.TabIndex = 1;
            txtSenha.TextChanged += txtSenha_TextChanged;
            // 
            // btnEntrar
            // 
            btnEntrar.BackColor = Color.SeaGreen;
            btnEntrar.Font = new Font("Segoe UI", 9.75F, FontStyle.Bold, GraphicsUnit.Point, 0);
            btnEntrar.ForeColor = SystemColors.ButtonHighlight;
            btnEntrar.Location = new Point(70, 341);
            btnEntrar.Name = "btnEntrar";
            btnEntrar.Size = new Size(130, 40);
            btnEntrar.TabIndex = 2;
            btnEntrar.Text = "Entrar";
            btnEntrar.UseVisualStyleBackColor = false;
            btnEntrar.Click += btnEntrar_Click;
            // 
            // panel1
            // 
            panel1.BackColor = SystemColors.ActiveCaption;
            panel1.Controls.Add(label2);
            panel1.Controls.Add(btnEntrar);
            panel1.Controls.Add(txtSenha);
            panel1.Controls.Add(txtEmail);
            panel1.Controls.Add(pictureBox1);
            panel1.ForeColor = SystemColors.ActiveCaption;
            panel1.Location = new Point(263, 1);
            panel1.Name = "panel1";
            panel1.Size = new Size(375, 485);
            panel1.TabIndex = 5;
            panel1.Paint += panel1_Paint;
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.BackColor = SystemColors.ActiveCaption;
            label2.Font = new Font("Cambria", 18F, FontStyle.Bold, GraphicsUnit.Point, 0);
            label2.ForeColor = SystemColors.ButtonHighlight;
            label2.Location = new Point(133, 155);
            label2.Name = "label2";
            label2.Size = new Size(105, 28);
            label2.TabIndex = 5;
            label2.Text = "ENTRAR";
            // 
            // pictureBox1
            // 
            pictureBox1.Image = (Image)resources.GetObject("pictureBox1.Image");
            pictureBox1.Location = new Point(123, 36);
            pictureBox1.Name = "pictureBox1";
            pictureBox1.Size = new Size(125, 103);
            pictureBox1.SizeMode = PictureBoxSizeMode.StretchImage;
            pictureBox1.TabIndex = 6;
            pictureBox1.TabStop = false;
            pictureBox1.Click += pictureBox1_Click;
            // 
            // button1
            // 
            button1.Location = new Point(74, 207);
            button1.Name = "button1";
            button1.Size = new Size(75, 23);
            button1.TabIndex = 6;
            button1.Text = "button1";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = SystemColors.ControlLightLight;
            ClientSize = new Size(800, 486);
            Controls.Add(button1);
            Controls.Add(panel1);
            Name = "Form1";
            Text = "Form1";
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private TextBox txtEmail;
        private TextBox txtSenha;
        private Button btnEntrar;
        private Panel panel1;
        private Label label2;
        private PictureBox pictureBox1;
        private Button button1;
    }
}
