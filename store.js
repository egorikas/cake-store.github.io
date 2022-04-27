window.onload = (event) => {
    console.log('page is fully loaded');
};

var CakeStore = {
    canPay: false,
    modeOrder: false,
    totalPrice: 0,

    init: function (options) {
        Telegram.WebApp.ready();
        CakeStore.apiUrl = options.apiUrl;
        CakeStore.userId = options.userId;
        CakeStore.userHash = options.userHash;
        $('body').show();
        $('.js-item-incr-btn').on('click', CakeStore.addCake);
        $('.js-item-decr-btn').on('click', CakeStore.removeCake);

        Telegram.WebApp.MainButton.setParams({
            text_color: '#fff'
        }).onClick(CakeStore.mainBtnClicked);
    },

    toggleLoading: function (loading) {
        CakeStore.isLoading = loading;
        CakeStore.updateMainButton();
        $('body').toggleClass('loading', !!CakeStore.isLoading);
        CakeStore.updateTotalPrice();
    },

    getOrderData: function () {
        var order_data = [];
        $('.js-item').each(function () {
            var itemEl = $(this)
            var id = itemEl.data('item-id');
            var count = +itemEl.data('item-count') || 0;
            var price = +itemEl.data('item-price') || 0;
            if (count > 0) {
                order_data.push({ id: id, count: count, price: price});
            }
        });
        return JSON.stringify(order_data);
    },

    mainBtnClicked: function () {
        // if (!CakeStore.canPay || CakeStore.isLoading) {
        //     return false;
        // }
        // if (CakeStore.userId && CakeStore.userHash) {
        //     params.user_id = CakeStore.userId;
        //     params.user_hash = CakeStore.userHash;
        // }
        CakeStore.toggleLoading(true);
        Telegram.WebApp.sendData(CakeStore.getOrderData());
        Telegram.WebApp.close();
    },

    addCake: function (event) {
        event.preventDefault();
        var itemEl = $(this).parents('.js-item');
        CakeStore.redNumberIncrement(itemEl, 1);
    },

    removeCake: function (event) {
        event.preventDefault();
        var itemEl = $(this).parents('.js-item');
        CakeStore.redNumberIncrement(itemEl, -1);
    },

    redNumberIncrement: function (itemEl, delta) {
        if (CakeStore.isLoading) {
            return false;
        }
        var count = +itemEl.data('item-count') || 0;
        count += delta;
        if (count < 0) {
            count = 0;
        }
        itemEl.data('item-count', count);
        CakeStore.updateItem(itemEl, delta);
    },

    updateItem: function (itemEl, delta) {
        var price = +itemEl.data('item-price');
        var count = +itemEl.data('item-count') || 0;
        var counterEl = $('.js-item-counter', itemEl);
        counterEl.text(count ? count : 1);
        var isSelected = itemEl.hasClass('selected');
        var anim_name = isSelected ? (delta > 0 ? 'badge-incr' : (count > 0 ? 'badge-decr' : 'badge-hide')) : 'badge-show';
        var cur_anim_name = counterEl.css('animation-name');
        if ((anim_name == 'badge-incr' || anim_name == 'badge-decr') && anim_name == cur_anim_name) {
            anim_name += '2';
        }
        counterEl.css('animation-name', anim_name);
        itemEl.toggleClass('selected', count > 0);

        var orderItemEl = CakeStore.getOrderItem(itemEl);
        var orderCounterEl = $('.js-order-item-counter', orderItemEl);
        orderCounterEl.text(count ? count : 1);
        orderItemEl.toggleClass('selected', count > 0);
        var orderPriceEl = $('.js-order-item-price', orderItemEl);
        var item_price = count * price;
        orderPriceEl.text(item_price);

        CakeStore.updateTotalPrice();
    },

    getOrderItem: function (itemEl) {
        var id = itemEl.data('item-id');
        return $('.js-order-item').filter(function () {
            return ($(this).data('item-id') == id);
        });
    },
    updateTotalPrice: function () {
        var total_price = 0;
        $('.js-item').each(function () {
            var itemEl = $(this)
            var price = +itemEl.data('item-price');
            var count = +itemEl.data('item-count') || 0;
            total_price += price * count;
        });
        CakeStore.canPay = total_price > 0;
        CakeStore.totalPrice = total_price;
        CakeStore.updateMainButton();
    },
    updateMainButton: function () {
        var mainButton = Telegram.WebApp.MainButton;
        if (CakeStore.isLoading) {
            mainButton.setParams({
                is_visible: true,
                color: '#65c36d'
            }).showProgress();
        }  else {
            mainButton.setParams({
                is_visible: !!CakeStore.canPay,
                text: 'Заказать ' + CakeStore.totalPrice + '₽',
                color: '#31b545'
            }).hideProgress();
        }
    },
}