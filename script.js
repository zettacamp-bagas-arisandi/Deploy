function purchaseBook(title, author, discount, tax, price, status) {

    // Amount of Discount
    let amDiscount = discount / 100 * price; 
    
    // Price after discount
    const priceDiscount = price - amDiscount;

    // Amount of Tax
    let amTax = tax / 100 * price;

    // Price after tax
    const priceTax = price + amTax;
    
    // Total price after tax and discount
    const totalPrice = price + amTax - amDiscount;


    // Show all data
    console.log("============================");
    console.log("Book Title: ", title);
    console.log("Author: ", author);
    console.log("Price: Rp.", price);
    console.log("On Sale: ", status);
    console.log("Discount: ", discount + "%");
    console.log("Amount of Discount: Rp.", amDiscount);
    console.log("Price after Disc: Rp.", priceDiscount);
    console.log("Tax: ", tax + "%");
    console.log("Amount of Tax: Rp.", amTax);
    console.log("Price after Tax: Rp.", priceTax)
    console.log("============================");
    console.log("Total Price After: Rp.", totalPrice);
    console.log("============================");
}

purchaseBook('Enigma 2', 'Sam', 10, 5, 5000, true);