
const apiUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'kn99';

const productList = document.querySelector('.productWrap');


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
        let products = res.data.products;// 商品列表
        renderProductList(products);

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