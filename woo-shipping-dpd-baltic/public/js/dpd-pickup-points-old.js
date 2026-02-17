var timeout;
var radio_control = 0;
function timedCount() {
    jQuery(function($) {
        timeout = setTimeout(function() {
            var selected_value = $(".wc-block-components-shipping-rates-control__package input[name=radio-control-0]:checked").val();
            
            if ($(".wp-block-woocommerce-checkout-fields-block")[0]) {
                $.ajax({
                    url: '/wp-admin/admin-ajax.php',
                    type: 'POST',
                    data: {
                        action: 'load_additional_block'
                    },
                    dataType: 'json',
                    success: function(response) {
                        $('body .wc-block-components-shipping-rates-control__package').append(response.all);
                        // $('#dpd-wc-pickup-point-shipping-block').show();
                    },
                    error: function(error) {
                        console.error('Error loading additional block:', error);
                    },
                });

                var selected_value2 = $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input:checked').val();
                var delivery_method = selected_value2.split(":");
                // var country_code = $('#billing-country').val();

                var country_code = $('#shipping-country').val();

                if(!country_code) {
                    country_code = $('#billing-country').val();
                }

                if (delivery_method[0] == 'dpd_parcels' || delivery_method[0] == 'dpd_sameday_parcels') {
                    setTimeout(function() {
                        let currentRequest = null;
                        const $select = $('#dpd-wc-pickup-point-shipping-select-block');
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
                                        selected_value: selected_value2,
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
                    }, 1000);

                    // $select.show().empty();
                    // $select.select2({
                    //     placeholder: 'Select a pickup point',
                    //     width: '100%',
                    //     ajax: {
                    //         url: '/wp-admin/admin-ajax.php',
                    //         type: 'POST',
                    //         dataType: 'json',
                    //         delay: 250,
                    //         transport: function (params, success, failure) {
                    //             if (currentRequest) currentRequest.abort();
                    //             currentRequest = $.ajax(params);
                    //             currentRequest.then(success).fail((jqXHR, textStatus) => {
                    //                 if (textStatus !== 'abort') failure();
                    //             });
                    //             return currentRequest;
                    //         },
                    //         data: function (params) {
                    //             return {
                    //                 action: 'dpd_checkout_get_pickup_points_blocks',
                    //                 selected_value: selected_value2,
                    //                 q: params.term || '',
                    //                 page: params.page || 1
                    //             };
                    //         },
                    //         processResults: function (data, params) {
                    //             params.page = params.page || 1;
                    //
                    //             // return {
                    //             //     results: data.results,
                    //             //     pagination: data.pagination
                    //             // };
                    //             // let results = Array.isArray(data.results) ? data.results.map(function(cityGroup) {
                    //             //     return {
                    //             //         text: cityGroup.text || '',
                    //             //         children: Array.isArray(cityGroup.children) ? cityGroup.children.map(function(item) {
                    //             //             return {
                    //             //                 id: item.id || '',
                    //             //                 text: item.text || '',
                    //             //                 first_line: item.first_line || '',
                    //             //                 second_line: item.second_line || ''
                    //             //             };
                    //             //         }) : []
                    //             //     };
                    //             // }) : [];
                    //
                    //             return {
                    //                 results: results,
                    //                 pagination: { more: data.pagination?.more || false }
                    //             };
                    //         }
                    //     }
                    // });
                    // $.ajax({
                    //     url: '/wp-admin/admin-ajax.php',
                    //     type: 'POST',
                    //     data: {
                    //         action: 'dpd_checkout_get_pickup_points_blocks',
                    //         selected_value: selected_value2,
                    //         country_code: country_code
                    //     },
                    //     dataType: 'json',
                    //     success: function(points) {
                    //         var pointsNew = points.all;
                    //
                    //         $('#dpd-wc-pickup-point-shipping-block').show();
                    //         $('#dpd-wc-pickup-point-shipping-select-block').select2();
                    //         $('#mp-wc-pickup-point-shipping-select-block').html("");
                    //
                    //         var items = '';
                    //
                    //         $.each(points.all, function(key, value) {
                    //             items += '<option value=' + value.id + '>' + value.text + '</option>';
                    //         });
                    //
                    //         $('#dpd-wc-pickup-point-shipping-select-block').html(items);
                    //     },
                    //     error: function(error) {
                    //         console.error('Error loading pickup points:', error);
                    //     },
                    // });
                } else {
                    $('#dpd-wc-pickup-point-shipping-block').hide();
                }
            }
        }, 2000);
    });
}

function stopCount() {
    clearTimeout(timeout);
}

(function($) {
    $(document).on("click", "ul.components-form-token-field__suggestions-list li", function(e) {
        $('#dpd-wc-pickup-point-shipping-block').each(function(i, elem) {
            $(elem).remove();
        });
        jQuery('body').trigger('update_checkout');

        setTimeout(function() {
            $.ajax({
                url: '/wp-admin/admin-ajax.php',
                type: 'POST',
                data: {
                    action: 'load_additional_block'
                },
                success: function(response) {
                    $('body .wc-block-components-shipping-rates-control').append(response.all);
                },
                error: function(error) {
                    console.error('Error loading additional block:', error);
                },
            });

            $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input').on('click', function(e) {
                var selected_value2 = $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input:checked').val();
                var delivery_method = selected_value2.split(":");

                if (delivery_method[0] == 'dpd_parcels' || delivery_method[0] == 'dpd_sameday_parcels') {

                    let currentRequest = null;
                    const $select = $('#dpd-wc-pickup-point-shipping-select-block');
                    $('#dpd-wc-pickup-point-shipping-block').show();
                    $select.show().empty();
                    $select.select2({
                        placeholder: 'Select a pickup point',
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
                                    selected_value: selected_value2,
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
                    // $.ajax({
                    //     url: '/wp-admin/admin-ajax.php',
                    //     type: 'POST',
                    //     data: {
                    //         action: 'dpd_checkout_get_pickup_points_blocks',
                    //         selected_value: selected_value2
                    //     },
                    //     dataType: 'json',
                    //     success: function(points) {
                    //         var pointsNew = points.all;
                    //
                    //         $('#dpd-wc-pickup-point-shipping-block').show();
                    //         $('#dpd-wc-pickup-point-shipping-select-block').select2();
                    //         $('#mp-wc-pickup-point-shipping-select-block').html("");
                    //
                    //         var items = '';
                    //
                    //         $.each(points.all, function(key, value) {
                    //             items += '<option value=' + value.id + '>' + value.text + '</option>';
                    //         });
                    //
                    //         $('#dpd-wc-pickup-point-shipping-select-block').html(items);
                    //     },
                    //     error: function(error) {
                    //         console.error('Error loading pickup points:', error);
                    //     },
                    // });
                } else {
                    $('#dpd-wc-pickup-point-shipping-block').hide();
                }
            });
        }, 3000);

        setTimeout(function() {
            $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input:checked').click();
        }, 3500);
    });

    $(document).ready(function() {
        $('#shipping-country').on('change', function() {
            // Read current checkout shipping fields
            const country = $('#shipping-country').val() || '';
            const state   = $('#shipping-state').val() || 'Vilnius';
            const postcode = $('#shipping-postcode').val() || '';
            const city    = $('#shipping-city').val() || '';

            // Only send if at least country is selected
            if (!country) return;

            const shippingAddress = {
                country: country,
                state: state,
                postcode: postcode,
                city: city
            };

            $.ajax({
                url: '/wp-json/wc/store/v1/batch',
                //url: 'index.php?rest_route=/wc/store/v1/batch',
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
                    $('.wc-block-components-radio-control__input').off('click').on('click', function() {
                        timedCount();
                    });

                    // find the checked input
                    const firstChecked = $('.wc-block-components-radio-control__input:checked');

                    // run your logic manually
                    if (firstChecked.length) {
                        firstChecked.trigger('click'); // or trigger('change')
                    }

                    // timedCount();
                },
                error: function(xhr, status, error) {
                    console.error('Error updating customer via batch:', error, xhr.responseText);
                }
            });

        });
        setTimeout(function() {
            $("#shipping-method").on("click", ".wc-block-components-button", function() {
                if (!$(this).hasClass("wc-block-checkout__shipping-method-option--selected")) {
                    $(".wc-block-checkout__shipping-method-option--selected").removeClass("wc-block-checkout__shipping-method-option--selected");
                    $(this).addClass("wc-block-checkout__shipping-method-option--selected");
                    timedCount();
                }
            });

            $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input').click(function() {
                timedCount();
            });



            $('#shipping-city').on('change', function() {
                timedCount();
                setTimeout(function() {
                    $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input:checked').click();
                }, 4000);
            });

            $('#shipping-state').on('change', function() {
                timedCount();
                setTimeout(function() {
                    $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input:checked').click();
                }, 4000);
            });

            $('#shipping-postcode').on('change', function() {
                timedCount();
                setTimeout(function() {
                    $('.wc-block-components-shipping-rates-control__package .wc-block-components-radio-control__input:checked').click();
                }, 4000);
            });
        }, 1500);

        setTimeout(function() {
            if ($(".wp-block-woocommerce-checkout-fields-block")[0]) {
                $('#shipping-method-1').on('click', function() {
                    radio_control += 2;
                    timedCount();
                });

                $('#shipping-method-2').on('click', function() {
                    stopCount();
                });
            }
        }, 1100);

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



        if ($(".wp-block-woocommerce-checkout-fields-block")[0]) {
            timedCount();
        }else {
            timedCount();
        }
    });
}(jQuery));