
const apiUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'kn99';

const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');

function init() {
    getProductList();
}

init();

function getProductList() {
    axios({
        method: 'get',
        url: `${apiUrl}/api/livejs/v1/customer/${apiPath}/products`
    })
    .then(res => {
        console.log(res.data);
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