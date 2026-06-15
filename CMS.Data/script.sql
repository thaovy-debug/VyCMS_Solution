BEGIN TRANSACTION;
GO

ALTER TABLE [Products] ADD [Colors] nvarchar(max) NULL;
GO

CREATE TABLE [Menus] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [Link] nvarchar(500) NOT NULL,
    [IsHidden] bit NOT NULL,
    [OrderIndex] int NOT NULL,
    CONSTRAINT [PK_Menus] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260612064417_AddMenuTable', N'8.0.23');
GO

COMMIT;
GO

