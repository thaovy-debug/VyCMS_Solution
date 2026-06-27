using System;
using System.Data.SqlClient;

class Program
{
    static void Main()
    {
        string connectionString = "Server=THAOVY\\SQLEXPRESS;Database=VyCMS_DB;Trusted_Connection=True;TrustServerCertificate=True";

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            Console.WriteLine("Connected successfully.");

            string sql = @"
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'MissingQuantity' AND Object_ID = Object_ID(N'OrderDetails'))
BEGIN
    ALTER TABLE OrderDetails ADD MissingQuantity INT NULL;
    ALTER TABLE OrderDetails ADD DamagedQuantity INT NULL;
    ALTER TABLE OrderDetails ADD DeliverableQuantity INT NULL;
    ALTER TABLE OrderDetails ADD IssueReason NVARCHAR(MAX) NULL;
    ALTER TABLE OrderDetails ADD IssueNote NVARCHAR(MAX) NULL;
    ALTER TABLE OrderDetails ADD IssueStatus NVARCHAR(MAX) NULL;
    ALTER TABLE OrderDetails ADD ReportedDate DATETIME2 NULL;
    ALTER TABLE OrderDetails ADD ReporterName NVARCHAR(MAX) NULL;
    ALTER TABLE OrderDetails ADD CustomerDecision NVARCHAR(MAX) NULL;
    ALTER TABLE OrderDetails ADD CustomerAgreedQuantity INT NULL;
    ALTER TABLE OrderDetails ADD CustomerContactMethod NVARCHAR(MAX) NULL;
    ALTER TABLE OrderDetails ADD CustomerFeedback NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE Name = N'OrderHistories')
BEGIN
    CREATE TABLE OrderHistories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        OrderId INT NOT NULL,
        Timestamp DATETIME2 NOT NULL,
        Action NVARCHAR(MAX) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        PerformedBy NVARCHAR(MAX) NOT NULL,
        FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE
    );
END
";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                command.ExecuteNonQuery();
                Console.WriteLine("SQL executed successfully.");
            }
        }
    }
}
