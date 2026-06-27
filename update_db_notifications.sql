USE VyCMS_DB;

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'AdminReply' AND Object_ID = Object_ID(N'ProductReviews'))
BEGIN
    ALTER TABLE ProductReviews ADD AdminReply NVARCHAR(MAX) NULL;
    ALTER TABLE ProductReviews ADD ReplyDate DATETIME2(7) NULL;
END

IF NOT EXISTS(SELECT * FROM sys.tables WHERE Name = N'Notifications')
BEGIN
    CREATE TABLE Notifications (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CustomerId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        CreatedDate DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        Type NVARCHAR(50) NULL,
        RelatedId INT NULL,
        CONSTRAINT FK_Notifications_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE CASCADE
    );
END
