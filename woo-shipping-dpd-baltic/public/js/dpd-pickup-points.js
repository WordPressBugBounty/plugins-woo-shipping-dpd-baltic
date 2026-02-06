function dpdCheckoutWatcher() {

    const $ = jQuery;
    const CHECK_INTERVAL = 500; // kas 0.5s tikrina, ar puslapis jau paruoštas
    const targetSelector = ".wp-block-woocommerce-checkout-fields-block";

    const interval = setInterval(() => {
        if (jQuery(targetSelector).length > 0) {

            const selectedValue = $(".wc-block-components-shipping-rates-control__package input[type=radio]:checked").val();
            if (selectedValue) {
                clearInterval(interval);
                initializeDpdCheckoutBlocks();
            }

        }
    }, CHECK_INTERVAL);
}

function initializeDpdCheckoutBlocks() {
    const $ = jQuery;

    // Hide pickup point block
    $('#dpd-wc-pickup-point-shipping-block').hide();

    // Load an additional block
    $.post('/wp-admin/admin-ajax.php', { action: 'load_additional_block' })
        .done(response => {
            $('body .wc-block-components-shipping-rates-control__package').append(response)
            attachDpdShippingRateListeners();
        })
        .fail(err => console.error('Failed to load additional block:', err));
}

function attachDpdShippingRateListeners() {
    const $ = jQuery;

    let selectedValue = $(".wc-block-components-shipping-rates-control__package input[type=radio]:checked").val();

    $('.wc-block-components-shipping-rates-control__package')
        .off('click', '.wc-block-components-radio-control__input')
        .on('click', '.wc-block-components-radio-control__input', function () {
            selectedValue = $(".wc-block-components-shipping-rates-control__package input[type=radio]:checked").val();
            dpdHandleShippingMethodChange(selectedValue);
        });

    dpdHandleShippingMethodChange(selectedValue);

    // Programmatically click
    //$(".wc-block-components-shipping-rates-control__package input[type=radio]:checked").trigger('click');
}

function dpdHandleShippingMethodChange(selectedValue) {
    const $ = jQuery;

    //Pickup point logic
    if (isDpdPickupPoint(selectedValue)) {
        setupDpdPickupPointSelect(selectedValue);
    } else {
        $('#dpd-wc-pickup-point-shipping-block').hide();
    }
}

function isDpdPickupPoint(value) {
    return (
        value.includes('parcels')

    );
}

function setupDpdPickupPointSelect(selectedValue) {
    const $ = jQuery;
    let currentRequest = null;
    const $select = $('#dpd-wc-pickup-point-shipping-select-block');
    var country_code = $('#shipping-country').val();

    if(!country_code) {
        country_code = $('#billing-country').val();
    }
    $('#dpd-wc-pickup-point-shipping-block').show();
    $select.show().empty();
    $select.select2({
        placeholder: mySettings.please_select_pickup_point_location,
        width: '100%',
        ajax: {
            url: '/wp-admin/admin-ajax.php',
            type: 'POST',
            dataType: 'json',
            delay: 250,
            transport: function (params, success, failure) {
                if (currentRequest) currentRequest.abort();
                currentRequest = $.ajax(params);
                currentRequest.then(success).fail((jqXHR, textStatus) => {
                    if (textStatus !== 'abort') failure();
                });
                return currentRequest;
            },
            data: function (params) {
                return {
                    action: 'dpd_checkout_get_pickup_points_blocks',
                    country_code: country_code,
                    selected_value: selectedValue,
                    q: params.term || '',
                    page: params.page || 1
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;

                // return {
                //     results: data.results,
                //     pagination: data.pagination
                // };
                // let results = Array.isArray(data.results) ? data.results.map(function(cityGroup) {
                //     return {
                //         text: cityGroup.text || '',
                //         children: Array.isArray(cityGroup.children) ? cityGroup.children.map(function(item) {
                //             return {
                //                 id: item.id || '',
                //                 text: item.text || '',
                //                 first_line: item.first_line || '',
                //                 second_line: item.second_line || ''
                //             };
                //         }) : []
                //     };
                // }) : [];

                return {
                    results: data.results,
                    pagination: data.pagination
                };
            }
        }
    });
}







jQuery(document).ready(function() {
    const $ = jQuery;

    const blockSelector = '.wp-block-woocommerce-checkout-pickup-options-block';
    const shippingButtonSelector = '.wc-block-checkout__shipping-method-option';

    // --- Function to check existence ---
    function isDpdPickupBlockExist() {
        return $(blockSelector).length > 0;
    }

    // --- Central handler ---
    function handleDpdPickupBlockCheck() {
        return isDpdPickupBlockExist();
    }

    // --- Run on page load ---
    dpdCheckoutWatcher();

    // --- Run on shipping method click ---
    $(document).on('click', shippingButtonSelector, function() {
        if (!handleDpdPickupBlockCheck()) {
            dpdCheckoutWatcher();
        }
    });

    // --- Observe DOM changes (WooCommerce dynamic updates) ---
    const dpdObserver = new MutationObserver(() => {
        handleDpdPickupBlockCheck();
    });

    dpdObserver.observe(document.body, { childList: true, subtree: true });

    $('#billing-country').on('change', function() {
        // Read current checkout shipping fields
        const country = $('#billing-country').val() || '';
        const state   = $('#billing-state').val() || 'Vilnius';
        const postcode = $('#billing-postcode').val() || '';
        const city    = $('#billing-city').val() || '';

        // Only send if at least country is selected
        if (!country) return;

        const shippingAddress = {
            country: country,
            state: state,
            postcode: postcode,
            city: city
        };

        $.ajax({
            // url: '/wp-json/wc/store/v1/batch',
            url: 'index.php?rest_route=/wc/store/v1/batch',
            method: 'POST',
            contentType: 'application/json',
            // headers: {
            //     'X-WP-Nonce': 'dee34b149e' // your nonce here
            // },
            data: JSON.stringify({
                requests: [
                    {
                        body: {
                            billing_address: {
                                first_name: "",
                                last_name: "",
                                company: "",
                                address_1: "",
                                address_2: "",
                                city: "",
                                state: "",
                                postcode: "",
                                country: country,
                                email: "",
                                phone: ""
                            },
                            shipping_address: {
                                first_name: "",
                                last_name: "",
                                company: "",
                                address_1: "",
                                address_2: "",
                                city: "",
                                state: "",
                                postcode: "",
                                country: country,
                                phone: ""
                            }
                        },
                        cache: 'no-store',
                        data: {
                            billing_address: {
                                first_name: "",
                                last_name: "",
                                company: "",
                                address_1: "",
                                address_2: "",
                                city: "",
                                state: "",
                                postcode: "",
                                country: country,
                                email: "",
                                phone: ""
                            },
                            shipping_address: {
                                first_name: "",
                                last_name: "",
                                company: "",
                                address_1: "",
                                address_2: "",
                                city: "",
                                state: "",
                                postcode: "",
                                country: country,
                                phone: ""
                            }
                        },
                        headers: {
                            'Nonce': mySettings.nonce // your nonce here
                        },
                        method: "POST",
                        path: "/wc/store/v1/cart/update-customer",
                    }
                ]
            }),
            success: function(response) {

                const shippingRates = response.responses[0].body.shipping_rates[0].shipping_rates;

                $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control').html("");
                $('#dpd-wc-pickup-point-shipping-block').hide();

                var html = '';
                shippingRates.forEach((method, index) => {

                    let price = method.price/100;

                    if (index === 0) {
                        html += '<label class="wc-block-components-radio-control__option wc-block-components-radio-control__option-checked wc-block-components-radio-control__option--checked-option-highlighted" for="radio-control-0-' + method.rate_id +'">';
                        html += '<input id="radio-control-0-'+ method.rate_id +'" class="wc-block-components-radio-control__input" type="radio" name="radio-control-0" aria-describedby="radio-control-0-'+ method.rate_id +'__secondary-label" aria-disabled="false" value="' + method.rate_id +'" checked="">';
                    } else {
                        html += '<label class="wc-block-components-radio-control__option" for="radio-control-0-' + method.rate_id +'">';
                        html += '<input id="radio-control-0-'+ method.rate_id +'" class="wc-block-components-radio-control__input" type="radio" name="radio-control-0" aria-describedby="radio-control-0-' + method.rate_id +'__secondary-label" aria-disabled="false" value="'+ method.rate_id + '">';
                    }
                    html += '<div class="wc-block-components-radio-control__option-layout">';
                    html += '<div class="wc-block-components-radio-control__label-group"><span id="radio-control-0-' + method.rate_id +'__label" class="wc-block-components-radio-control__label">' + method.name +'</span><span id="radio-control-0-'+ method.rate_id +'__secondary-label" class="wc-block-components-radio-control__secondary-label"><span class="wc-block-formatted-money-amount wc-block-components-formatted-money-amount">'+ price +' €</span></span></div>';
                    html += '</div>';
                    html += '</label>';

                });
                $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control').append(html);

                // rebind click to new inputs
                // $('.wc-block-components-radio-control__input').off('click').on('click', function() {
                //     timedCount();
                // });

                // find the checked input
                //const firstChecked = $('.wc-block-components-radio-control__input:checked');
                const firstChecked = $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input:checked');

                // run your logic manually
                if (firstChecked.length) {
                    //firstChecked.trigger('click'); // or trigger('change')
                    dpdCheckoutWatcher();
                }

                // timedCount();
            },
            error: function(xhr, status, error) {
                console.error('Error updating customer via batch:', error, xhr.responseText);
            }
        });

    });


    $('#billing-city').on('change', function() {
        dpdCheckoutWatcher();
    });

    $('#billing-state').on('change', function() {
        dpdCheckoutWatcher();
    });

    $('#billing-postcode').on('change', function() {
        dpdCheckoutWatcher();
    });

    $(document.body).on("change", "#dpd-wc-pickup-point-shipping-select-block", function() {
        var value = this.value;

        $.ajax({
            url: '/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
                action: 'dpd_store_pickup_selection',
                value: value
            },
            dataType: 'json',
            success: function(response) {},
            error: function(error) {
                console.error('Error storing pickup selection:', error);
            },
        });
    });
});