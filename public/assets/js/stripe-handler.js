var wp_asp_prefetched = false;

jQuery(document).ready(function() {
    jQuery('input[data-stripe-button-uid]').each(function (ind, obj) {
        uid = jQuery(obj).data('stripeButtonUid');
        wp_asp_add_stripe_handler(window['stripehandler' + uid].data);
    });
    console.log(jQuery('#stripe_form_0 button'));
    jQuery('#stripe_form_0 button').css('display', 'none');
});


function wp_asp_add_stripe_handler(data) {

    if (!wp_asp_prefetched) {
        wp_asp_prefetched = true;
        wp_asp_check_handler();
    }

    function wp_asp_check_handler() {
        if (typeof (data.handler) == "undefined") {
            if (data.billingAddress) {
                data.handler = StripeCheckout.configure({
                    key: stripehandler.key,
                    amount: data.amount,
                    locale: 'auto',
                    description: data.description,
                    name: data.name,
                    currency: data.currency,
                    image: data.image,
                    billingAddress: data.billingAddress,
                    shippingAddress: data.shippingAddress,
                    url: data.url,
                    token: function (token) {
                        jQuery('input#stripeToken_' + data.uniq_id).val(token.id);
                        jQuery('input#stripeTokenType_' + data.uniq_id).val(token.type);
                        jQuery('input#stripeEmail_' + data.uniq_id).val(token.email);
                        jQuery('form#stripe_form_' + data.uniq_id).submit();
                    }
                });
            } else { //workaround for Stripe to not display warning when billingAddress and shippingAddress are both set to false
                data.handler = StripeCheckout.configure({
                    key: stripehandler.key,
                    amount: data.amount,
                    locale: 'auto',
                    description: data.description,
                    name: data.name,
                    currency: data.currency,
                    image: data.image,
                    url: data.url,
                    token: function (token) {
                        jQuery('input#stripeToken_' + data.uniq_id).val(token.id);
                        jQuery('input#stripeTokenType_' + data.uniq_id).val(token.type);
                        jQuery('input#stripeEmail_' + data.uniq_id).val(token.email);
                        jQuery('form#stripe_form_' + data.uniq_id).submit();
                    }
                });
            }
        }
    }

    jQuery('#stripe_button_' + data.uniq_id).on('click', function (e) {
        e.preventDefault();
        wp_asp_check_handler();

        if (!data.variable) {
            data.handler.open();
            return true;
        }
        var amount = jQuery('input#stripeAmount_' + data.uniq_id).val();
        amount = amount.replace(/\$/g, '');
        amount = amount.replace(/\,/g, '');

        amount = parseFloat(amount);

        if (isNaN(amount)) {
            jQuery('#error_explanation_' + data.uniq_id).hide().html(stripehandler.strEnterValidAmount).fadeIn('slow');
        } else if (amount < 0.5)
            jQuery('#error_explanation_' + data.uniq_id).hide().html(stripehandler.strMinAmount).fadeIn('slow');
        else {
            jQuery('#error_explanation_' + data.uniq_id).html('');
            jQuery('input#stripeAmount_' + data.uniq_id).val(amount);
            amount = amount * 100;
            data.handler.open({
                amount: amount
            });
        }
    });
}