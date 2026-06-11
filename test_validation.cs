using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using CMS.Data.Entities;
using System.ComponentModel.DataAnnotations;

class Program {
    static void Main() {
        var model = new Product {
            Id = 19,
            Name = "Test",
            Price = 1000m,
            StockQuantity = 10,
            CategoryProductId = 1,
            Sizes = "S, M, L"
        };
        
        var context = new ValidationContext(model, serviceProvider: null, items: null);
        var results = new List<ValidationResult>();
        bool isValid = Validator.TryValidateObject(model, context, results, validateAllProperties: true);
        
        Console.WriteLine("IsValid: " + isValid);
        foreach (var r in results) {
            Console.WriteLine(r.ErrorMessage);
        }
    }
}
