
// Call this when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    if (window.location.pathname.includes('cart')) {
        onLoadCartNumbers();
    }
    displayCart();
    if (window.location.pathname.includes('home')) {
        FetchAllCardsData();
        onLoadCartNumbers();
    }
    if (window.location.pathname.includes('admin')) {
        displayOrders();
    }


    if (window.location.pathname.includes('edit-product')) {
        handleProductEdit();
    }

    if (window.location.pathname.includes('products')) {
        displayProductsAdmin();
    }
});

let cardData = [];

async function FetchAllCardsData() {
    try {
        let storedCards = localStorage.getItem('cards');

        if (storedCards) {
            const cardData = JSON.parse(storedCards);
            displayData(cardData);
        } else {
            const response = await fetch('cards.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status ${response.status}`);
            }

            const data = await response.json();
            localStorage.setItem('cards', JSON.stringify(data));
            displayData(data);
        }
    } catch (error) {
        console.error('failed to fech and store data:', error);
    }
}

//Hier mee zet je alle card data via de json file in de html
function displayData(data) {
    const boxItems = document.querySelector('.box-items');

    boxItems.innerHTML = "";

    data.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add('card');

        cardDiv.innerHTML = `
        <div class="cardInformation">
            <img src="${card.Image}" alt="image of the ${card.Name}">
            <div class="cardInformationBorder">
            <div>
                <h3>${card.Name}</h3>
            </div>
            <div class="powerHealth">
                <p>Power ${card.Power}</p>
                <p>health ${card.Health}</p>
            </div>
            <p>Price: ${card.Cost} blood points</p>
            <a class="add-cart"><span class="material-symbols-outlined" id="shopping_cart">
                add_shopping_cart
            </span></a>
        </div>
        </div>
        `;
        boxItems.appendChild(cardDiv);

        const cartButton = cardDiv.querySelector('.add-cart');
        cartButton.addEventListener('click', () => {
            cartNumbers(card);
            totalPrice(card);
        });
    });
}

//cartnumber next to the cart icon met localstorage
function onLoadCartNumbers() {
    let productNumbers = localStorage.getItem('cartNumbers');

    if (productNumbers) {
        document.querySelector('.cart span:nth-child(2)').textContent = productNumbers;
    }
}

function cartNumbers(product) {
    let productNumbers = localStorage.getItem('cartNumbers');
    productNumbers = parseInt(productNumbers);

    if (productNumbers) {
        localStorage.setItem('cartNumbers', productNumbers + 1);
        document.querySelector(".cart span:nth-child(2)").textContent = productNumbers + 1;
    } else {
        localStorage.setItem('cartNumbers', 1);
        document.querySelector(".cart span:nth-child(2)").textContent = 1;
    }
    setItems(product);
}

function setItems(product) {
    let cartItems = localStorage.getItem("productsInCart");
    cartItems = JSON.parse(cartItems);

    if (cartItems != null) {
        if (cartItems[product.Name] == undefined) {
            cartItems = {
                ...cartItems,
                [product.Name]: product
            }
        }
        cartItems[product.Name].inCart += 1;
    } else {
        product.inCart = 1;
        cartItems = {
            [product.Name]: product
        }
    }
    localStorage.setItem("productsInCart", JSON.stringify(cartItems));
}

function totalPrice(product) {
    let cardCost = localStorage.getItem('totalCost');

    if (cardCost != null) {
        cardCost = parseInt(cardCost);
        localStorage.setItem("totalCost", product.Cost + cardCost);
    } else {
        localStorage.setItem('totalCost', product.Cost);
    }
}

function displayCart() {
    let cartItems = localStorage.getItem("productsInCart");
    let shippingCost = 2;
    let cardCost = localStorage.getItem('totalCost');

    cardCost = parseFloat(cardCost);

    if (isNaN(cardCost)) {
        cardCost = 0;
    }

    let totalCost = cardCost + shippingCost;

    cartItems = JSON.parse(cartItems);
    let productContainer = document.querySelector(".products");

    if (cartItems && productContainer) {
        productContainer.innerHTML = '';
        Object.values(cartItems).map(item => {
            productContainer.innerHTML += `
            <div class="product">
                <div class="product-title">- ${item.Name} Card</div>
                <div class="price">${item.Cost} BP</div>
                <div class="quantity">${item.inCart}</div>
                <div class="total">${(item.inCart * item.Cost)} BP</div>
                <span onclick="deleteItem('${item.Name}') " class="material-symbols-outlined">
                    delete
                </span>
            </div>`;
        });
        if (cardCost > 0) {
            productContainer.innerHTML += `
        <div class="basketTotalContainer">
            <h4 class="basketTotalTitle">
                shipping cost
            </h4>
            <h4 class="basketTotal">
                2 BP
            </h4>
        </div>
        <div class="basketTotalContainer">
            <h4 class="basketTotalTitle">
                Basket Total
            </h4>
            <h4 class="basketTotal">
                ${totalCost} BP
            </h4>
        
        <div class="confirmOrder">
             <button onclick="saveOrders(); window.location.href='order-confirmation.html';">Pay</button>
        </div>
        </div>
        `
        } else {
            productContainer.innerHTML += `Did you forget something? <a href="index.html">buy here</a>`
        }
    }
}

function deleteItem(itemName) {
    let cartItems = JSON.parse(localStorage.getItem("productsInCart"));
    let totalCost = parseInt(localStorage.getItem("totalCost"));
    let cartNumbers = parseInt(localStorage.getItem("cartNumbers"));

    if (cartItems && cartItems[itemName]) {
        let item = cartItems[itemName];
        let itemCost = item.Cost * item.inCart;

        localStorage.setItem("cartNumbers", cartNumbers - item.inCart);
        localStorage.setItem("totalCost", totalCost - itemCost);

        delete cartItems[itemName];
        localStorage.setItem("productsInCart", JSON.stringify(cartItems));

        onLoadCartNumbers();
        displayCart();
    }
}

function saveOrders() {
    let products = JSON.parse(localStorage.getItem("productsInCart"));
    let totalCost = localStorage.getItem("totalCost");
    let currentTime = new Date().toLocaleString();
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    let newOrder = {
        totalPrice: totalCost,
        time: currentTime,
        items: products
    }

    orders.push(newOrder);

    localStorage.setItem('orders', JSON.stringify(orders));
}

function displayOrders() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let ordersContainer = document.querySelector(".orders");

    ordersContainer.innerHTML = '';

    orders.forEach(order => {
        let itemsHTML = Object.values(order.items).map(item =>
            `<div>- ${item.Name} (x${item.inCart})</div>`
        ).join('');

        ordersContainer.innerHTML += `
        <div class="order">
            <div class="order-id">Order-id: #${orders.indexOf(order) + 1}</div>
            <hr>
            
            
            <div class="order-total">Total: ${order.totalPrice} Blood Points</div>
            <hr>
            <div class="order-products"> ${itemsHTML}</div>
            <hr>
            <div class="order-time">Time: ${order.time}</div>
        </div>
        `;
    });
}

function displayProductsAdmin() {
    let getCards = localStorage.getItem("cards");
    getCards = JSON.parse(getCards);

    const showProducts = document.querySelector('.showProducts');

    if (!showProducts) {
        console.error('showProducts container not found.');
        return;
    }

    getCards.forEach((card, index) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('productCards');

        productDiv.innerHTML = `
        <div class="productCard">
            <div class="productCardId">#${index + 1}</div>
            <div class="productCardName">${card.Name}</div>
            <div class="productCardCost">${card.Cost}</div>
            <div class="productCardImg">${card.Image}</div>
            <a href="edit-product.html" onclick="setProductToEdit(${index})">
                <span class="material-symbols-outlined">edit</span>
            </a>
            <a onclick="deleteProduct(${index})">
                <span class="material-symbols-outlined">delete</span>
            </a>
        </div>`;

        showProducts.appendChild(productDiv);
    });
}

function deleteProduct(productId) {
    let products = document.querySelector('.showProducts');
    products.innerHTML = "";
    let getCards = JSON.parse(localStorage.getItem("cards"));

    getCards.splice(productId, 1);

    localStorage.setItem("cards", JSON.stringify(getCards));

    displayProductsAdmin();
}

window.addEventListener('storage', function (event) {
    if (event.key === 'cards') {
        let updatedCards = JSON.parse(localStorage.getItem('cards'));

        displayData(updatedCards);
    }
});

function setProductToEdit(productId) {
    localStorage.setItem('productToEdit', productId);
}

function handleProductEdit() {
    const productId = localStorage.getItem('productToEdit');

    if (!productId) {
        console.error('No product ID found in localStorage');
        return;
    }

    let getCards = JSON.parse(localStorage.getItem('cards'));
    let product = getCards[productId];

    document.getElementById('productName').value = product.Name;
    document.getElementById('productCost').value = product.Cost;

    const currentProductImage = document.getElementById('currentProductImage');
    currentProductImage.src = product.Image;

    const newProductImage = document.getElementById('NewProductImage');


    document.getElementById('editProductForm').addEventListener('submit', function (e) {
        e.preventDefault();

        product.Name = document.getElementById('productName').value;
        product.Cost = parseFloat(document.getElementById('productCost').value);

        if (!product.Name || isNaN(product.Cost)) {
            alert("Please fill out the whole form!");
            return;
        }

        if (product.Cost <= 0) {
            alert("please don't use negative numbers!");
            return;
        }

        if (newProductImage && newProductImage.files.length > 0) {
            const file = newProductImage.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                product.Image = event.target.result;
                saveProductChanges(productId, product, getCards);
            };
            reader.readAsDataURL(file);
        } else {
            saveProductChanges(productId, product, getCards);
        }
    });

    function saveProductChanges(productId, product, getCards) {
        getCards[productId] = product;
        localStorage.setItem('cards', JSON.stringify(getCards));

        window.location.href = 'products.html';
    }
}

async function resetJson() {
    try {
        const response = await fetch('cards.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status ${response.status}`);
        }
        const data = await response.json();
        localStorage.setItem('cards', JSON.stringify(data));
        const showProducts = document.querySelector('.showProducts');

        showProducts.innerHTML = "";
        displayProductsAdmin();
    } catch (error) {
        console.error('failed to fech and store data:', error);
    }
}

async function addNewProduct(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const cost = parseInt(document.getElementById('productCost').value);
    const power = parseInt(document.getElementById('productPower').value);
    const health = parseInt(document.getElementById('productHealth').value);
    const imageInput = document.getElementById('NewProductImage');

    console.log('Product added:', name, cost, imageInput);



    if ((!name || isNaN(cost) || isNaN(power) || isNaN(health) || imageInput.files.length === 0) || (cost <= 0 || power <= 0 || health <= 0)) {
        alert("Please fill out the form correctly!");
        return;
    }

    alert(`added ${name}`);

    window.location.href = 'products.html';

    const reader = new FileReader();
    reader.onload = function (event) {
        const newProduct = {
            "Image": event.target.result,
            "Name": name,
            "Power": power,
            "Health": health,
            "Cost": cost,
            "incart": 0
        };

        let cards = JSON.parse(localStorage.getItem('cards')) || [];

        cards.push(newProduct);

        localStorage.setItem('cards', JSON.stringify(cards));

        FetchAllCardsData(cards);

        document.getElementById('addProductForm').reset();
    };
    reader.readAsDataURL(imageInput.files[0]);
}

document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', addNewProduct);
    }
});




