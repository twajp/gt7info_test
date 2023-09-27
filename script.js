const modal = $('#modal-container');
const img = modal.find('img');
const popupTexts = $('.popup-text');

popupTexts.click(function () {
    const imageUrl = $(this).data('image-url');
    img.attr('src', imageUrl);
    modal.show();
});

modal.click(function () {
    $(this).hide();
});
