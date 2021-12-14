
const apiUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'kn99';

const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartTable = document.querySelector('.shoppingCart-table');

function init() {
    getProductList();
    getCartList();
}

init();

function getProductList() {
    axios({
        method: 'get',
        url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/products`
    })
    .then(res => {
        // console.log(res.data);
        renderProductList(res.data.products);
        createProductSelect(res.data.products);
        bindAddCartEvent(res.data.products);
    })
    .catch(err => {
        console.log(err.response);
    });
}

function renderProductList(productData) {
    let str = '';
    productData.forEach(item => {
        str += `
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="${item.description}">
            <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">${getFormatPrice(item.origin_price)}</del>
            <p class="nowPrice">${getFormatPrice(item.price)}</p>
        </li>
        `;
    });
    productList.innerHTML = str;
}

function getFormatPrice(price) {
    return `NT$${price.toLocaleString('en-US')}`;
}

function bindAddCartEvent(productData) {
    productList.addEventListener('click', e => {
        let tar = e.target;
        tar.classList.forEach(item => {
            if (item === 'addCardBtn') {
                // console.log(tar.dataset.id);
                // 加入購物車
                addProductToCart(tar.dataset.id);
            }
        });
    })
}

function getCartList() {
    axios({
        method: 'get',
        url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/carts`
    })
    .then(res => {
        console.log(res.data);
        renderCartList(res.data);
        currentCarts = res.data.carts;
    })
    .catch(err => {
        console.log(err.response);
    })
}

function renderCartList(cartData) {
    console.log(cartData);
    let carts = cartData.carts;
    // 建立購物車 HTML
    let str = `
        <tr>
            <th width="40%">品項</th>
            <th width="15%">單價</th>
            <th width="15%">數量</th>
            <th width="15%">金額</th>
            <th width="15%"></th>
        </tr>`;

    carts.forEach(item => {
        str += `<tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="${item.title}">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>${getFormatPrice(item.product.price)}</td>
                    <td>${item.quantity}</td>
                    <td>${getFormatPrice(item.product.price * item.quantity)}</td>
                    <td class="discardBtn" data-id=${item.id}>
                        <a href="#" class="material-icons">
                            clear
                        </a>
                    </td>
                </tr>`;
    });

    str += `
            <tr>
                <td>
                    <a href="#" class="discardAllBtn">刪除所有品項</a>
                </td>
                <td></td>
                <td></td>
                <td>
                    <p>總金額</p>
                </td>
                <td>${getFormatPrice(cartData.finalTotal)}</td>
            </tr>`;

    cartTable.innerHTML = str;
}

function createProductSelect(productData) {
    let productTypes = [];
    // 歸納種類
    productData.forEach(item => {
        if (!productTypes.includes(item.category)) productTypes.push(item.category);
    })
    
    // 建立 select options
    let str = '<option value="全部" selected>全部</option>';
    productTypes.forEach(item => {
        str += `<option value="${item}">${item}</option>`;
    })
    productSelect.innerHTML = str;

    // 綁定 select event
    bindSelectProductEvent(productData);
}

function bindSelectProductEvent(productData) {
    productSelect.addEventListener('change', e => {
      let category = e.target.value;
      let selectedProduct = productData.filter(item => category==='全部' ? true : item.category===category);
      
      renderProductList(selectedProduct);
    });
}

function addProductToCart(productId) {
    // 取得最新購物車數量
    axios({
        method: 'get',
        url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/carts`
    })
    .then(res => {
        let productCart = res.data.carts.filter(item => item.product.id === productId ? true : false);

        // 新增商品購物車 / 購物車商品數量 +1
        if (productCart.length === 0) {
            createCart(productId);
        } else if (productCart.length > 0) {
            let newQuantity = productCart[0].quantity + 1;
            modifyCart(productCart[0].id, newQuantity);
        }
    })
    .catch(err => {
        console.log();
    });
}

function createCart(productId) {
    axios({
        method: 'post',
        url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/carts`,
        data: {
            "data": {
              "productId": productId,
              "quantity": 1
            }
        }
    })
    .then(res => {
        console.log(res.data);
        alert('商品已成功加入購物車');
        renderCartList(res.data);
    })
    .catch(err => {
        alert('商品無法加入購物車');
        console.log(err.response);
    });
}

function modifyCart(cartId, num) {
    axios({
        method: 'patch',
        url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/carts`,
        data: {
            "data": {
              "id": cartId,
              "quantity": num
            }
        }
    })
    .then(res => {
        console.log(res.data);
        alert('成功修改商品數量');
        renderCartList(res.data);
    })
    .catch(err => {
        alert('無法修改商品數量');
        console.log(err.response);
    });
}

