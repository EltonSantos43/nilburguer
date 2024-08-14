const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const nameClientInput = document.getElementById("nameclient");
const checkoutBtn = document.getElementById("checkout-btn");
const addressWarn = document.getElementById("address-warn");
const nameClientWarn = document.getElementById("nameclient-warn");

// Função para obter o carrinho do localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Função para salvar o carrinho no localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Atualiza o carrinho com os dados do localStorage
let cart = getCart();

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

menu.addEventListener("click", function (event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        addToCart(name, price);
    }
});

// Função para adicionar no carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }

    saveCart(cart);
    updateCartModal();
}

// Atualiza o carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    let totalQuantity = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>

                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `;

        total += item.price * item.quantity;
        totalQuantity += item.quantity;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = totalQuantity;
}

// Função para remover o item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");

        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }

        saveCart(cart);
        updateCartModal();
    }
}

nameClientInput.addEventListener("input", function (event) {
    let inputValue = event.target.value;

    if (inputValue !== "") {
        nameClientInput.classList.remove("border-red-500");
        nameClientWarn.classList.add("hidden");
    }
});

addressInput.addEventListener("input", function (event) {
    let inputValue = event.target.value;

    if (inputValue !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// Finalizar pedido
checkoutBtn.addEventListener("click", function () {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Desculpe, o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #2f2e30, #f03813)",
            },
        }).showToast();
        return;
    }

    if (cart.length === 0) return;

    if (nameClientInput.value.trim() === "") {
        nameClientWarn.classList.remove("hidden");
        nameClientInput.classList.add("border-red-500");
        return;
    } else {
        nameClientWarn.classList.add("hidden");
        nameClientInput.classList.remove("border-red-500");
    }

    if (addressInput.value.trim() === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    } else {
        addressWarn.classList.add("hidden");
        addressInput.classList.remove("border-red-500");
    }

    const optionalText = document.getElementById("optional").value.trim();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    const deliveryCharge = 5.00;
    const totalWithFee = (parseFloat(total) + deliveryCharge).toFixed(2);

    const cartItems = cart.map((item) => {
        return `${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price.toFixed(2)}`;
    }).join("%0A");

    let whatsappMessage = `Nome: ${nameClientInput.value}%0AEndereço: ${addressInput.value}`;
    if (optionalText !== "") {
        whatsappMessage += `%0AOpcionais: ${optionalText}`;
    }
    whatsappMessage += `%0A%0A${cartItems}%0A%0ATotal: R$ ${total}%0ATaxa de entrega: R$ ${deliveryCharge}%0ATotal com taxa: R$ ${totalWithFee}`;

    const phone = "5511993909028";
    window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, "_blank");

    cart = [];
    saveCart(cart);
    updateCartModal();
});

// Verificar a hora e manipular o card horario
function checkRestaurantOpen() {
    const data = new Date();
    const hour = data.getHours() + data.getMinutes() / 60;
    const dayWeek = data.getDay();

    const operation = [
        { day: 0, initial: null, final: null },
        { day: 1, initial: null, final: null },
        { day: 2, initial: 18.5, final: 22 },
        { day: 3, initial: 18.5, final: 22 },
        { day: 4, initial: 18.5, final: 22 },
        { day: 5, initial: 18.5, final: 24 },
        { day: 6, initial: 18.5, final: 24 }
    ];

    for (const period of operation) {
        if (dayWeek === period.day) {
            if (period.initial === null && period.final === null) {
                return false;
            }
            return hour >= period.initial && hour < period.final;
        }
    }
    return false;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}
