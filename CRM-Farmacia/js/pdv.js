/**
 * PDV (Point of Sale) page script
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  if (!auth.isLoggedIn()) {
    window.location.href = "index.html"
    return
  }

  // State variables
  let cart = []
  let selectedProduct = null
  let selectedCartItem = null
  let selectedClient = null
  let productToAddWithAllergy = null

  // DOM Elements
  const productSearch = document.getElementById("pdv-product-search")
  const productsList = document.getElementById("pdv-products-list")
  const productsCount = document.getElementById("pdv-products-count")
  const cartItems = document.getElementById("pdv-cart-items")
  const subtotalEl = document.getElementById("pdv-subtotal")
  const discountEl = document.getElementById("pdv-discount")
  const totalEl = document.getElementById("pdv-total")
  const checkoutBtn = document.getElementById("pdv-checkout-btn")
  const clearCartBtn = document.getElementById("pdv-clear-cart-btn")
  const clientInfo = document.getElementById("pdv-client-info")
  const clientSearchBtn = document.getElementById("pdv-client-search-btn")
  const clientSearchModal = document.getElementById("client-search-modal")
  const clientSearchInput = document.getElementById("client-search-input")
  const clientSearchResults = document.getElementById("client-search-results")
  const pdvClock = document.getElementById("pdv-clock")
  const exitBtn = document.getElementById("pdv-exit-button")
  const barcodeBtn = document.getElementById("pdv-barcode-btn")
  const pdvUserName = document.getElementById("pdv-user-name")

  // Modals
  const exitModal = document.getElementById("exit-fullscreen-modal")
  const checkoutModal = document.getElementById("checkout-modal")
  const allergyModal = document.getElementById("allergy-warning-modal")
  const helpModal = document.getElementById("help-modal")

  // Set user info
  const currentUser = auth.getCurrentUser()
  pdvUserName.textContent = currentUser.nome

  // Start clock
  startClock()

  // Focus product search on load
  productSearch.focus()

  // Event listeners for PDV page
  setupEventListeners()

  // Keyboard shortcuts
  setupKeyboardShortcuts()

  // Initialize PDV
  function initPDV() {
    updateCart()
    updateTotals()
  }

  // Start real-time clock
  function startClock() {
    updateClock()
    setInterval(updateClock, 1000)
  }

  function updateClock() {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const seconds = now.getSeconds().toString().padStart(2, "0")
    pdvClock.textContent = `${hours}:${minutes}:${seconds}`
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search products
    productSearch.addEventListener("input", handleProductSearch)

    // Double click to add product
    productsList.addEventListener("dblclick", (e) => {
      const productElement = e.target.closest(".pdv-product-item")
      if (productElement) {
        const productId = productElement.dataset.id
        const product = db.getById("produtos", productId)
        if (product) {
          addToCart(product)
        }
      }
    })

    // Product click (select)
    productsList.addEventListener("click", (e) => {
      const productElement = e.target.closest(".pdv-product-item")
      if (productElement) {
        // Update selected product
        const productId = productElement.dataset.id
        selectProduct(productId)

        // Add click animation
        productElement.classList.add("clicked")
        setTimeout(() => {
          productElement.classList.remove("clicked")
        }, 300)
      }
    })

    // Cart item click (select)
    cartItems.addEventListener("click", (e) => {
      const cartItemElement = e.target.closest(".pdv-cart-item")
      if (cartItemElement) {
        // Update selected cart item
        const index = Number.parseInt(cartItemElement.dataset.index)
        selectCartItem(index)
      }
    })

    // Client search button
    clientSearchBtn.addEventListener("click", openClientSearch)

    // Discount input
    discountEl.addEventListener("input", () => {
      updateTotals()
    })

    // Checkout button
    checkoutBtn.addEventListener("click", openCheckoutModal)

    // Clear cart button
    clearCartBtn.addEventListener("click", () => {
      if (cart.length > 0) {
        if (confirm("Deseja limpar o carrinho?")) {
          clearCart()
        }
      }
    })

    // Client search modal events
    setupClientSearchModal()

    // Checkout modal events
    setupCheckoutModal()

    // Allergy warning modal events
    setupAllergyModal()

    // Help modal events
    setupHelpModal()

    // Barcode button
    barcodeBtn.addEventListener("click", () => {
      const barcode = prompt("Digite o código de barras do produto")
      if (barcode) {
        searchProductByBarcode(barcode)
      }
    })

    // Exit button
    exitBtn.addEventListener("click", handleExit)
  }

  // Setup keyboard shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Prevent shortcuts when inside input fields except for some specific keys
      if (
        document.activeElement.tagName === "INPUT" &&
        !["Escape", "F1", "F2", "F3", "F4", "F5", "F8"].includes(e.key)
      ) {
        return
      }

      switch (e.key) {
        case "F1": // Help
          e.preventDefault()
          openHelpModal()
          break

        case "F2": // Client search
          e.preventDefault()
          openClientSearch()
          break

        case "F3": // Product search
          e.preventDefault()
          productSearch.focus()
          break

        case "F4": // Barcode
          e.preventDefault()
          const barcode = prompt("Digite o código de barras do produto")
          if (barcode) {
            searchProductByBarcode(barcode)
          }
          break

        case "F5": // Refresh
          e.preventDefault()
          location.reload()
          break

        case "F6": // Discount
          e.preventDefault()
          discountEl.focus()
          break

        case "F7": // Remove selected item
          e.preventDefault()
          if (selectedCartItem !== null) {
            removeCartItem(selectedCartItem)
          }
          break

        case "F8": // Checkout
          e.preventDefault()
          if (cart.length > 0) {
            openCheckoutModal()
          }
          break

        case "Escape": // Cancel current operation
          e.preventDefault()
          if (document.querySelector(".modal.active")) {
            closeAllModals()
          } else {
            productSearch.value = ""
            handleProductSearch()
            productSearch.focus()
          }
          break

        case "+": // Increase quantity
          e.preventDefault()
          if (selectedCartItem !== null) {
            incrementCartItemQuantity(selectedCartItem)
          }
          break

        case "-": // Decrease quantity
          e.preventDefault()
          if (selectedCartItem !== null) {
            decrementCartItemQuantity(selectedCartItem)
          }
          break
      }
    })
  }

  // Handle product search
  function handleProductSearch() {
    const query = productSearch.value.trim()

    if (query === "") {
      productsList.innerHTML = `
        <div class="pdv-empty-message">
          Busque um produto pelo nome ou código de barras
        </div>
      `
      productsCount.textContent = "0 produtos"
      return
    }

    const products = db.search("produtos", query, ["nome", "codigoBarras", "grupo"])

    if (products.length > 0) {
      let html = ""

      products.forEach((product) => {
        const lowStock = product.quantidadeDisponivel <= product.quantidadeMinima
        const outOfStock = product.quantidadeDisponivel <= 0

        html += `
          <div class="pdv-product-item ${outOfStock ? "disabled" : ""}" data-id="${product.id}">
            <div class="pdv-product-info">
              <div class="pdv-product-name">${product.nome}</div>
              <div class="pdv-product-detail">
                <span>${product.grupo || "Sem grupo"}</span>
                ${product.necessitaReceita ? '<span class="badge badge-danger">Requer Receita</span>' : ""}
              </div>
            </div>
            <div class="pdv-product-right">
              <div class="pdv-product-price">R$ ${product.preco.toFixed(2)}</div>
              <div class="pdv-product-stock ${lowStock ? "low" : ""}">
                ${outOfStock ? "Indisponível" : `${product.quantidadeDisponivel} unid.`}
              </div>
            </div>
          </div>
        `
      })

      productsList.innerHTML = html
      productsCount.textContent = `${products.length} produto${products.length !== 1 ? "s" : ""}`
    } else {
      productsList.innerHTML = `
        <div class="pdv-empty-message">
          Nenhum produto encontrado para "${query}"
        </div>
      `
      productsCount.textContent = "0 produtos"
    }
  }

  // Search product by barcode
  function searchProductByBarcode(barcode) {
    const products = db.search("produtos", barcode, ["codigoBarras"])

    if (products.length > 0) {
      const product = products[0]
      addToCart(product)

      // Show feedback
      showToast(`Produto "${product.nome}" adicionado ao carrinho`, "success")

      // Clear search
      productSearch.value = ""
      handleProductSearch()
    } else {
      showToast("Código de barras não encontrado", "error")
    }
  }

  // Select product
  function selectProduct(productId) {
    // Remove selected class from all products
    document.querySelectorAll(".pdv-product-item").forEach((item) => {
      item.classList.remove("selected")
    })

    // Add selected class to the clicked product
    const productElement = document.querySelector(`.pdv-product-item[data-id="${productId}"]`)
    if (productElement) {
      productElement.classList.add("selected")
      selectedProduct = productId
    }
  }

  // Select cart item
  function selectCartItem(index) {
    // Remove selected class from all cart items
    document.querySelectorAll(".pdv-cart-item").forEach((item) => {
      item.classList.remove("selected")
    })

    // Add selected class to the clicked cart item
    const cartItemElement = document.querySelector(`.pdv-cart-item[data-index="${index}"]`)
    if (cartItemElement) {
      cartItemElement.classList.add("selected")
      selectedCartItem = index
    }
  }

  // Add product to cart
  function addToCart(product) {
    // Check if product is in stock
    if (product.quantidadeDisponivel <= 0) {
      showToast("Produto sem estoque disponível", "error")
      return
    }

    // Check if client has allergy to this product
    if (selectedClient && selectedClient.alergias) {
      const alergias = selectedClient.alergias.toLowerCase()
      const produtoNome = product.nome.toLowerCase()
      const produtoGrupo = (product.grupo || "").toLowerCase()

      if (alergias.includes(produtoNome) || (produtoGrupo && alergias.includes(produtoGrupo))) {
        // Show allergy warning
        productToAddWithAllergy = product
        openAllergyWarningModal(product)
        return
      }
    }

    // Check if product is already in cart
    const existingItemIndex = cart.findIndex((item) => item.id === product.id)

    if (existingItemIndex !== -1) {
      // Increment quantity if already in cart
      if (cart[existingItemIndex].quantidade < product.quantidadeDisponivel) {
        cart[existingItemIndex].quantidade++
        showToast(`Quantidade de "${product.nome}" aumentada`, "success")
      } else {
        showToast("Quantidade máxima disponível em estoque", "warning")
      }
    } else {
      // Add new item to cart
      cart.push({
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        quantidade: 1,
        necessitaReceita: product.necessitaReceita,
      })
      showToast(`"${product.nome}" adicionado ao carrinho`, "success")
    }

    // Update UI
    updateCart()
    updateTotals()

    // Focus back on search
    productSearch.focus()
  }

  // Update cart UI
  function updateCart() {
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="pdv-empty-message">
          Nenhum item no carrinho
        </div>
      `
      clearCartBtn.disabled = true
      checkoutBtn.disabled = true
    } else {
      let html = ""

      cart.forEach((item, index) => {
        const product = db.getById("produtos", item.id)
        const subtotal = item.preco * item.quantidade

        html += `
          <div class="pdv-cart-item" data-index="${index}">
            <div class="pdv-cart-item-info">
              <div class="pdv-cart-item-name">
                ${item.nome}
                ${item.necessitaReceita ? '<span class="badge badge-danger">Receita</span>' : ""}
              </div>
              <div class="pdv-cart-item-price">R$ ${item.preco.toFixed(2)} × ${item.quantidade}</div>
            </div>
            <div class="pdv-cart-item-actions">
              <div class="pdv-cart-item-quantity">
                <button class="pdv-quantity-btn" onclick="pdv.decrementCartItemQuantity(${index})">-</button>
                <input type="text" class="pdv-quantity-input" value="${item.quantidade}" readonly>
                <button class="pdv-quantity-btn" onclick="pdv.incrementCartItemQuantity(${index})">+</button>
              </div>
              <div class="pdv-cart-item-total">R$ ${subtotal.toFixed(2)}</div>
              <button class="btn btn-sm btn-outline text-danger" onclick="pdv.removeCartItem(${index})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `
      })

      cartItems.innerHTML = html
      clearCartBtn.disabled = false
      checkoutBtn.disabled = false
    }
  }

  // Increment cart item quantity
  function incrementCartItemQuantity(index) {
    const item = cart[index]
    const product = db.getById("produtos", item.id)

    if (item.quantidade < product.quantidadeDisponivel) {
      item.quantidade++
      updateCart()
      updateTotals()

      // Select the updated cart item
      selectCartItem(index)
    } else {
      showToast("Quantidade máxima disponível em estoque", "warning")
    }
  }

  // Decrement cart item quantity
  function decrementCartItemQuantity(index) {
    const item = cart[index]

    if (item.quantidade > 1) {
      item.quantidade--
      updateCart()
      updateTotals()

      // Select the updated cart item
      selectCartItem(index)
    } else {
      removeCartItem(index)
    }
  }

  // Remove cart item
  function removeCartItem(index) {
    const item = cart[index]

    // Remove the item from cart
    cart.splice(index, 1)

    // Show feedback
    showToast(`"${item.nome}" removido do carrinho`, "success")

    // Update UI
    updateCart()
    updateTotals()

    // Reset selected cart item
    selectedCartItem = null
  }

  // Clear cart
  function clearCart() {
    cart = []
    selectedCartItem = null
    updateCart()
    updateTotals()
    showToast("Carrinho limpo", "success")
  }

  // Update totals
  function updateTotals() {
    const subtotal = cart.reduce((total, item) => total + item.preco * item.quantidade, 0)
    const discount = Number.parseFloat(discountEl.value) || 0
    const total = Math.max(0, subtotal - discount)

    subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`
    totalEl.textContent = `R$ ${total.toFixed(2)}`

    // Also update checkout modal if open
    document.getElementById("checkout-subtotal").textContent = `R$ ${subtotal.toFixed(2)}`
    document.getElementById("checkout-discount").textContent = `R$ ${discount.toFixed(2)}`
    document.getElementById("checkout-total").textContent = `R$ ${total.toFixed(2)}`
  }

  // Setup client search modal
  function setupClientSearchModal() {
    // Close buttons
    document.getElementById("close-client-modal").addEventListener("click", () => {
      clientSearchModal.classList.remove("active")
    })

    document.getElementById("cancel-client-search").addEventListener("click", () => {
      clientSearchModal.classList.remove("active")
    })

    // Search input
    clientSearchInput.addEventListener("input", function () {
      const query = this.value.trim()

      if (query === "") {
        clientSearchResults.innerHTML = `
          <div class="pdv-empty-message">
            Digite para buscar um cliente
          </div>
        `
        return
      }

      const clients = db.search("clientes", query, ["nome", "telefone"])

      if (clients.length > 0) {
        let html = ""

        clients.forEach((client) => {
          const hasAllergy = client.alergias && client.alergias.trim() !== ""

          html += `
            <div class="client-item" data-id="${client.id}">
              <div class="client-info">
                <div class="client-name">${client.nome}</div>
                <div class="client-contact">
                  <span><i class="fas fa-phone"></i> ${client.telefone}</span>
                  ${hasAllergy ? `<span class="client-alert"><i class="fas fa-exclamation-triangle"></i> Alergias</span>` : ""}
                </div>
              </div>
              <button class="btn btn-sm btn-primary select-client-btn">Selecionar</button>
            </div>
          `
        })

        clientSearchResults.innerHTML = html

        // Add event listeners to select buttons
        document.querySelectorAll(".select-client-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const clientItem = this.closest(".client-item")
            const clientId = clientItem.dataset.id
            selectClient(clientId)
          })
        })

        // Add event listeners for double click
        document.querySelectorAll(".client-item").forEach((item) => {
          item.addEventListener("dblclick", function () {
            const clientId = this.dataset.id
            selectClient(clientId)
          })
        })
      } else {
        clientSearchResults.innerHTML = `
          <div class="pdv-empty-message">
            Nenhum cliente encontrado para "${query}"
          </div>
        `
      }
    })
  }

  // Open client search modal
  function openClientSearch() {
    clientSearchModal.classList.add("active")
    clientSearchInput.value = ""
    clientSearchInput.focus()
    clientSearchResults.innerHTML = `
      <div class="pdv-empty-message">
        Digite para buscar um cliente
      </div>
    `
  }

  // Select client
  function selectClient(clientId) {
    const client = db.getById("clientes", clientId)

    if (client) {
      selectedClient = client

      // Update client info UI
      const hasAllergy = client.alergias && client.alergias.trim() !== ""

      clientInfo.innerHTML = `
        <div class="pdv-client-data">
          <div class="pdv-client-name">${client.nome}</div>
          <div class="pdv-client-phone"><i class="fas fa-phone"></i> ${client.telefone}</div>
          ${
            hasAllergy
              ? `
            <div class="pdv-client-alert">
              <i class="fas fa-exclamation-triangle"></i>
              Alergias: ${client.alergias}
            </div>
          `
              : ""
          }
        </div>
      `

      // Close the modal
      clientSearchModal.classList.remove("active")

      // Show feedback
      showToast(`Cliente "${client.nome}" selecionado`, "success")
    }
  }

  // Setup checkout modal
  function setupCheckoutModal() {
    // Close buttons
    document.getElementById("close-checkout-modal").addEventListener("click", () => {
      checkoutModal.classList.remove("active")
    })

    document.getElementById("cancel-checkout").addEventListener("click", () => {
      checkoutModal.classList.remove("active")
    })

    // Payment method selection
    document.querySelectorAll(".payment-method-option").forEach((option) => {
      option.addEventListener("click", function () {
        // Remove selected class from all options
        document.querySelectorAll(".payment-method-option").forEach((opt) => {
          opt.classList.remove("selected")
        })

        // Add selected class to clicked option
        this.classList.add("selected")

        // Show/hide cash payment section based on payment method
        const paymentMethod = this.dataset.method
        const cashPaymentSection = document.getElementById("cash-payment-section")

        if (paymentMethod === "dinheiro") {
          cashPaymentSection.style.display = "block"
        } else {
          cashPaymentSection.style.display = "none"
        }
      })
    })

    // Payment amount input
    const paymentAmountInput = document.getElementById("payment-amount")
    paymentAmountInput.addEventListener("input", updateChange)

    // Confirm checkout button
    document.getElementById("confirm-checkout").addEventListener("click", finalizeOrder)
  }

  // Open checkout modal
  function openCheckoutModal() {
    // Reset modal state
    document.querySelectorAll(".payment-method-option").forEach((opt) => {
      opt.classList.remove("selected")
    })

    // Select dinheiro by default
    document.querySelector(".payment-method-option[data-method='dinheiro']").classList.add("selected")
    document.getElementById("cash-payment-section").style.display = "block"

    // Set default payment amount to total
    const total = Number.parseFloat(totalEl.textContent.replace("R$ ", ""))
    document.getElementById("payment-amount").value = total.toFixed(2)

    // Clear notes
    document.getElementById("payment-notes").value = ""

    // Update totals
    document.getElementById("checkout-subtotal").textContent = subtotalEl.textContent
    document.getElementById("checkout-discount").textContent =
      `R$ ${Number.parseFloat(discountEl.value || 0).toFixed(2)}`
    document.getElementById("checkout-total").textContent = totalEl.textContent

    // Update change
    updateChange()

    // Show modal
    checkoutModal.classList.add("active")
    document.getElementById("payment-amount").focus()
  }

  // Update change amount
  function updateChange() {
    const total = Number.parseFloat(document.getElementById("checkout-total").textContent.replace("R$ ", ""))
    const paymentAmount = Number.parseFloat(document.getElementById("payment-amount").value) || 0
    const change = Math.max(0, paymentAmount - total)

    document.getElementById("payment-change").textContent = `R$ ${change.toFixed(2)}`
  }

  // Setup allergy warning modal
  function setupAllergyModal() {
    // Close buttons
    document.getElementById("close-allergy-modal").addEventListener("click", () => {
      allergyModal.classList.remove("active")
      productToAddWithAllergy = null
    })

    document.getElementById("cancel-allergy-add").addEventListener("click", () => {
      allergyModal.classList.remove("active")
      productToAddWithAllergy = null
    })

    // Confirm add despite allergy
    document.getElementById("confirm-allergy-add").addEventListener("click", () => {
      if (productToAddWithAllergy) {
        // Add to cart ignoring allergy warning
        const product = productToAddWithAllergy

        // Check if product is already in cart
        const existingItemIndex = cart.findIndex((item) => item.id === product.id)

        if (existingItemIndex !== -1) {
          // Increment quantity if already in cart
          if (cart[existingItemIndex].quantidade < product.quantidadeDisponivel) {
            cart[existingItemIndex].quantidade++
          }
        } else {
          // Add new item to cart
          cart.push({
            id: product.id,
            nome: product.nome,
            preco: product.preco,
            quantidade: 1,
            necessitaReceita: product.necessitaReceita,
          })
        }

        // Update UI
        updateCart()
        updateTotals()

        // Reset and close modal
        allergyModal.classList.remove("active")
        productToAddWithAllergy = null
      }
    })
  }

  // Open allergy warning modal
  function openAllergyWarningModal(product) {
    document.getElementById("allergy-product-name").textContent = product.nome
    allergyModal.classList.add("active")
  }

  // Setup help modal
  function setupHelpModal() {
    // Close button
    document.getElementById("close-help-modal").addEventListener("click", () => {
      helpModal.classList.remove("active")
    })

    document.getElementById("close-help").addEventListener("click", () => {
      helpModal.classList.remove("active")
    })
  }

  // Open help modal
  function openHelpModal() {
    helpModal.classList.add("active")
  }

  // Finalize order
  function finalizeOrder() {
    // Get payment details
    const paymentMethod = document.querySelector(".payment-method-option.selected").dataset.method
    const subtotal = Number.parseFloat(subtotalEl.textContent.replace("R$ ", ""))
    const discount = Number.parseFloat(discountEl.value) || 0
    const total = Number.parseFloat(totalEl.textContent.replace("R$ ", ""))
    const notes = document.getElementById("payment-notes").value

    let paymentAmount = 0
    let change = 0

    if (paymentMethod === "dinheiro") {
      paymentAmount = Number.parseFloat(document.getElementById("payment-amount").value) || 0
      change = Math.max(0, paymentAmount - total)

      // Validate payment amount
      if (paymentAmount < total) {
        showToast("O valor recebido é menor que o total da venda", "error")
        return
      }
    } else {
      paymentAmount = total
    }

    // Create sale object
    const sale = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      cliente: selectedClient
        ? {
            id: selectedClient.id,
            nome: selectedClient.nome,
            telefone: selectedClient.telefone,
          }
        : null,
      itens: cart.map((item) => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade,
      })),
      subTotal: subtotal,
      desconto: discount,
      valorTotal: total,
      metodoPagamento: paymentMethod,
      valorRecebido: paymentAmount,
      troco: change,
      observacoes: notes,
      vendedor: {
        id: auth.getCurrentUser().id,
        nome: auth.getCurrentUser().nome,
      },
    }

    // Save sale to database
    const vendas = db.getAll("vendas")
    vendas.push(sale)
    localStorage.setItem("vendas", JSON.stringify(vendas))

    // Update product stock
    const produtos = db.getAll("produtos")

    cart.forEach((item) => {
      const produtoIndex = produtos.findIndex((p) => p.id === item.id)

      if (produtoIndex !== -1) {
        produtos[produtoIndex].quantidadeDisponivel -= item.quantidade
        produtos[produtoIndex].quantidadeVendida = (produtos[produtoIndex].quantidadeVendida || 0) + item.quantidade
      }
    })

    localStorage.setItem("produtos", JSON.stringify(produtos))

    // If payment method is cash, add to cash movements
    if (paymentMethod === "dinheiro") {
      const movimento = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        tipo: "entrada",
        valor: total,
        descricao: `Venda #${sale.id}`,
        formaPagamento: "dinheiro",
        vendaId: sale.id,
      }

      const movimentacoes = db.getAll("movimentacoes")
      movimentacoes.push(movimento)
      localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes))
    }

    // Close modal
    checkoutModal.classList.remove("active")

    // Show success message
    showToast("Venda finalizada com sucesso!", "success")

    // Clear cart and reset state
    clearCart()

    // Reset client
    if (selectedClient) {
      selectedClient = null
      clientInfo.innerHTML = `
        <div class="pdv-client-placeholder">
          <i class="fas fa-user-circle"></i>
          <span>Cliente não selecionado</span>
        </div>
      `
    }

    // Reset discount
    discountEl.value = "0"
    updateTotals()

    // Focus on product search
    productSearch.focus()

    // Print receipt - in a real application, this would generate a receipt
    alert("Impressão de comprovante iniciada...")
  }

  // Handle exit button
  function handleExit() {
    exitModal.classList.add("active")
    document.getElementById("admin-password").value = ""
    document.getElementById("exit-error").textContent = ""
    document.getElementById("admin-password").focus()
  }

  // Setup exit modal
  document.getElementById("close-exit-modal").addEventListener("click", () => {
    exitModal.classList.remove("active")
  })

  document.getElementById("cancel-exit").addEventListener("click", () => {
    exitModal.classList.remove("active")
  })

  document.getElementById("confirm-exit").addEventListener("click", () => {
    const password = document.getElementById("admin-password").value

    if (auth.verifyAdminPassword(password)) {
      // Log out and redirect to login page
      auth.logout()
      window.location.href = "index.html"
    } else {
      document.getElementById("exit-error").textContent = "Senha de administrador incorreta."
    }
  })

  // Close all modals
  function closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active")
    })
  }

  // Show toast notification
  function showToast(message, type = "success") {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector(".toast-container")

    if (!toastContainer) {
      toastContainer = document.createElement("div")
      toastContainer.className = "toast-container"
      document.body.appendChild(toastContainer)
    }

    // Create toast
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-exclamation-triangle"}"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close">&times;</button>
    `

    // Add to container
    toastContainer.appendChild(toast)

    // Show toast
    setTimeout(() => {
      toast.classList.add("show")
    }, 10)

    // Close button
    const closeBtn = toast.querySelector(".toast-close")
    closeBtn.addEventListener("click", () => {
      toast.classList.remove("show")
      setTimeout(() => {
        toast.remove()
      }, 300)
    })

    // Auto close
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => {
        toast.remove()
      }, 300)
    }, 3000)
  }

  // Initialize PDV
  initPDV()

  // Expose functions for external access
  window.pdv = {
    addToCart,
    removeCartItem,
    incrementCartItemQuantity,
    decrementCartItemQuantity,
    clearCart,
    selectClient,
    openClientSearch,
    openCheckoutModal,
    finalizeOrder,
  }
})
