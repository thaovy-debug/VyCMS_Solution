BEGIN TRANSACTION;
GO

ALTER TABLE [Products] ADD [VariantStocks] nvarchar(max) NULL;
GO

ALTER TABLE [Customers] ADD [IsLocked] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

CREATE TABLE [ProductReviews] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [CustomerId] int NOT NULL,
    [OrderId] int NOT NULL,
    [Rating] int NOT NULL,
    [Comment] nvarchar(max) NULL,
    [ImageUrl] nvarchar(max) NULL,
    [CreatedDate] datetime2 NOT NULL,
    CONSTRAINT [PK_ProductReviews] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProductReviews_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ProductReviews_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ProductReviews_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ProductReviews_CustomerId] ON [ProductReviews] ([CustomerId]);
GO

CREATE INDEX [IX_ProductReviews_OrderId] ON [ProductReviews] ([OrderId]);
GO

CREATE INDEX [IX_ProductReviews_ProductId] ON [ProductReviews] ([ProductId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260626061311_AddProductReview', N'8.0.23');
GO

COMMIT;
GO

