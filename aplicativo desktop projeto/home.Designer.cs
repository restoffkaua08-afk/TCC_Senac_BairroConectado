namespace novatentativa_projeto
{
    partial class home
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
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
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(home));
            panel3 = new Panel();
            label6 = new Label();
            pictureBox1 = new PictureBox();
            label1 = new Label();
            pictureBox2 = new PictureBox();
            pictureBox3 = new PictureBox();
            pictureBox4 = new PictureBox();
            label5 = new Label();
            btnVisualizar = new Button();
            panel1 = new Panel();
            panel3.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox2).BeginInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox3).BeginInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox4).BeginInit();
            panel1.SuspendLayout();
            SuspendLayout();
            // 
            // panel3
            // 
            panel3.BackColor = SystemColors.ActiveCaption;
            panel3.Controls.Add(label6);
            panel3.Controls.Add(pictureBox1);
            panel3.Controls.Add(label1);
            panel3.Location = new Point(-3, 0);
            panel3.Name = "panel3";
            panel3.Size = new Size(804, 73);
            panel3.TabIndex = 1;
            // 
            // label6
            // 
            label6.AutoSize = true;
            label6.Font = new Font("Times New Roman", 14.25F, FontStyle.Regular, GraphicsUnit.Point, 0);
            label6.Location = new Point(148, 30);
            label6.Name = "label6";
            label6.Size = new Size(167, 21);
            label6.TabIndex = 2;
            label6.Text = "Olá, Seja bem vindo!";
            label6.Click += label6_Click;
            // 
            // pictureBox1
            // 
            pictureBox1.Image = (Image)resources.GetObject("pictureBox1.Image");
            pictureBox1.Location = new Point(34, 12);
            pictureBox1.Name = "pictureBox1";
            pictureBox1.Size = new Size(43, 39);
            pictureBox1.SizeMode = PictureBoxSizeMode.StretchImage;
            pictureBox1.TabIndex = 1;
            pictureBox1.TabStop = false;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Font = new Font("Times New Roman", 9F, FontStyle.Bold, GraphicsUnit.Point, 0);
            label1.ForeColor = SystemColors.ActiveCaptionText;
            label1.Location = new Point(36, 54);
            label1.Name = "label1";
            label1.Size = new Size(41, 15);
            label1.TabIndex = 5;
            label1.Text = "Home ";
            // 
            // pictureBox2
            // 
            pictureBox2.BackColor = Color.Plum;
            pictureBox2.Image = (Image)resources.GetObject("pictureBox2.Image");
            pictureBox2.Location = new Point(113, 76);
            pictureBox2.Name = "pictureBox2";
            pictureBox2.Size = new Size(47, 50);
            pictureBox2.SizeMode = PictureBoxSizeMode.StretchImage;
            pictureBox2.TabIndex = 2;
            pictureBox2.TabStop = false;
            pictureBox2.Click += pictureBox2_Click;
            // 
            // pictureBox3
            // 
            pictureBox3.BackColor = SystemColors.GradientActiveCaption;
            pictureBox3.Image = (Image)resources.GetObject("pictureBox3.Image");
            pictureBox3.Location = new Point(313, 76);
            pictureBox3.Name = "pictureBox3";
            pictureBox3.Size = new Size(53, 50);
            pictureBox3.SizeMode = PictureBoxSizeMode.StretchImage;
            pictureBox3.TabIndex = 3;
            pictureBox3.TabStop = false;
            // 
            // pictureBox4
            // 
            pictureBox4.BackColor = Color.SeaGreen;
            pictureBox4.Image = (Image)resources.GetObject("pictureBox4.Image");
            pictureBox4.Location = new Point(212, 76);
            pictureBox4.Name = "pictureBox4";
            pictureBox4.Size = new Size(56, 50);
            pictureBox4.SizeMode = PictureBoxSizeMode.StretchImage;
            pictureBox4.TabIndex = 4;
            pictureBox4.TabStop = false;
            // 
            // label5
            // 
            label5.AutoSize = true;
            label5.Font = new Font("Arial", 12F, FontStyle.Regular, GraphicsUnit.Point, 0);
            label5.Location = new Point(51, 37);
            label5.Name = "label5";
            label5.Size = new Size(416, 18);
            label5.TabIndex = 2;
            label5.Text = "Clique no botão abaixo para poder visualizar os chamados";
            label5.Click += label5_Click_2;
            // 
            // btnVisualizar
            // 
            btnVisualizar.BackColor = SystemColors.ActiveCaption;
            btnVisualizar.Location = new Point(201, 149);
            btnVisualizar.Name = "btnVisualizar";
            btnVisualizar.Size = new Size(93, 35);
            btnVisualizar.TabIndex = 4;
            btnVisualizar.Text = "Visualizar";
            btnVisualizar.UseVisualStyleBackColor = false;
            btnVisualizar.Click += btnVisualizar_Click;
            // 
            // panel1
            // 
            panel1.BackColor = SystemColors.ButtonFace;
            panel1.Controls.Add(label5);
            panel1.Controls.Add(btnVisualizar);
            panel1.Controls.Add(pictureBox3);
            panel1.Controls.Add(pictureBox2);
            panel1.Controls.Add(pictureBox4);
            panel1.Location = new Point(162, 103);
            panel1.Name = "panel1";
            panel1.Size = new Size(504, 234);
            panel1.TabIndex = 5;
            // 
            // home
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = SystemColors.ControlLight;
            ClientSize = new Size(800, 450);
            Controls.Add(panel3);
            Controls.Add(panel1);
            Name = "home";
            Text = "home";
            Load += home_Load_1;
            panel3.ResumeLayout(false);
            panel3.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).EndInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox2).EndInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox3).EndInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox4).EndInit();
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ResumeLayout(false);
        }

        #endregion
        private Panel panel3;
        private Label label1;
        private PictureBox pictureBox4;
        private PictureBox pictureBox3;
        private PictureBox pictureBox2;
        private PictureBox pictureBox1;
        private Label label6;
        private Label label5;
        private Button btnVisualizar;
        private Panel panel1;
    }
}