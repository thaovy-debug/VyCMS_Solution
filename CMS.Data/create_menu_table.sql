CREATE TABLE [Menus] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [Link] nvarchar(500) NOT NULL,
    [IsHidden] bit NOT NULL,
    [OrderIndex] int NOT NULL,
    CONSTRAINT [PK_Menus] PRIMARY KEY ([Id])
);
GO
