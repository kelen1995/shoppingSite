
const apiUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'kn99';

const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartTable = document.querySelector('.shoppingCart-table');
const submitForm = document.querySelector('.orderInfo-form');
const submitBtn = document.querySelector('.orderInfo-btn');

function init() {
    getProductList();
    getCartList();
    bindAddCartEvent();
    bindRemoveCartEvent();
    bindSubmitEvent();
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
    // 建立購物車 HTML
    let str = `
        <tr>
            <th width="40%">品項</th>
            <th width="15%">單價</th>
            <th width="15%">數量</th>
            <th width="15%">金額</th>
            <th width="15%"></th>
        </tr>`;
    
    if (cartData.carts && cartData.carts.length > 0){
        let carts = cartData.carts;
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
    }
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

function bindAddCartEvent() {
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

function bindRemoveCartEvent() {
    cartTable.addEventListener('click', e => {
        // remove single cart
        if (e.path[1].classList.value.includes('discardBtn')) {
            // console.log(e.path[1].dataset.id);
            let cartId = e.path[1].dataset.id;
            let isDelete = confirm('是否要刪除此筆購物車？');

            if (isDelete) {
                axios({
                    method: 'delete',
                    url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/carts/${cartId}`
                })
                .then(res => {
                    // console.log(res.data);
                    alert('已成功刪除購物車');
                    renderCartList(res.data);
                })
                .catch(err => {
                    alert('刪除購物車失敗');
                    console.log(err.response);
                });
            }
        }

        // remove all carts
        if (e.target.classList.value.includes('discardAllBtn')) {
            let isDelete = confirm('是否要刪除所有購物車？');
            if (isDelete) {
                axios({
                    method: 'delete',
                    url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/carts`
                })
                .then(res => {
                    // console.log(res.data);
                    alert('已成功刪除所有購物車');
                    renderCartList(res.data);
                })
                .catch(err => {
                    alert('刪除所有購物車失敗');
                    console.log(err.response);
                });
            }
        }
    });


}

function bindSubmitEvent() {
    submitBtn.addEventListener('click', e => {
        e.preventDefault();
        // console.log(e.target);
        
        // 驗證訂單資訊
        let errors = validate(submitForm, getConstrains());
      
        // 送出訂單
        if(!errors) {
          clearAlertMessage();
          createOrders();
        } else {
          markInvalidInput(errors); 
        }
    });
}

function getConstrains() {
  return {
        "姓名":{
          presence: {
            message: '是必填欄位'
          }
        },
        "電話":{
          presence: {
            message: '是必填欄位'
          }
        },
        "Email":{
          presence: {
            message: '是必填欄位'
          }
        },
        "寄送地址":{
          presence: {
            message: '是必填欄位'
          }
        }
      };
}

function createOrders() {
      // 將資料組成物件
      let buyerData = `
      {
        "data": {
          "user": {
            "name": "${document.querySelector('#customerName').value}",
            "tel": "${document.querySelector('#customerPhone').value}",
            "email": "${document.querySelector('#customerEmail').value}",
            "address": "${document.querySelector('#customerAddress').value}",
            "payment": "${document.querySelector('#tradeWay').value}"
          }
        }
      }
      `;
    
      // 送出請求
      axios({
          method: 'post',
          url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/orders`,
          data: JSON.parse(buyerData)
      })
      .then(res => {
        console.log(res.data);
        alert('訂單已成功送出');
        renderCartList({});// clear cart list
      })
      .catch(err => {
        console.log(err.response);
        if (err.response.data.message) {
            alert(err.response.data.message);
        } else {
            alert('訂單送出失敗');
        }
      })
  }

// 標註輸入錯誤的欄位
function markInvalidInput(errorList) {
  clearAlertMessage();
  // console.log(errorList);

  let errors = Object.keys(errorList);
  // console.log(errors);

  errors.forEach(error => {
    let note = document.querySelector(`[data-message=${error}]`);
    note.textContent = errorList[error];
  })
}

function clearAlertMessage() {
  let messages = document.querySelectorAll('.orderInfo-message');
  messages.forEach(msg => {
    msg.textContent = '';
  })
}