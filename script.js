const modal = $('#modal-container');
const img = modal.find('img');
const popupTexts = $('.popup-text');

// popupTexts.click(function () {
//     const imageUrl = $(this).data('image-url');
//     img.attr('src', imageUrl);
//     modal.show();
// });

// Hide modal on click
modal.click(function () {
    $(this).hide();
});

$(document).ready(function () {
    // Retrieve display preferences from localStorage
    let displayInJPY = localStorage.getItem('displayInJPY') === 'true';
    let keepAccordionOpen = localStorage.getItem('keepAccordionOpen') === 'true';
    let showPriceColumn = localStorage.getItem('showPriceColumn') === 'true';

    // Set default values if no preference is set
    keepAccordionOpen = keepAccordionOpen !== undefined ? keepAccordionOpen : false;
    showPriceColumn = showPriceColumn !== undefined ? showPriceColumn : true;

    // Set the initial state of switches
    $('#keepAccordionOpen').prop('checked', keepAccordionOpen);
    $('#showPriceColumn').prop('checked', showPriceColumn);

    let data; // Declare data variable to be used in the entire scope

    // Load and render data.json
    fetch('data.json')
        .then(response => response.json())
        .then(loadedData => {
            data = loadedData; // Assign the loaded data to the data variable
            renderAccordion(data);
            updateLastUpdatedTimestamp(displayInJPY ? data.timestamp_jp : data.timestamp);
        });

    // Load and render db.json
    fetch('db.json')
        .then(response => response.json())
        .then(db => {
            renderExpectedSection(db);
        });

    // Function to format numbers with commas
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Render accordion section
    function renderAccordion(data) {
        const accordionContainer = $('#contentContainer');
        accordionContainer.empty();

        data.content.forEach((oneData, index) => {
            const collapseId = `collapse${oneData.id}`;
            const isFirstItem = index === 0;
            const showClass = isFirstItem ? 'show' : '';
            const buttonClass = isFirstItem ? '' : 'collapsed';
            const accordionItem = `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${buttonClass}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${isFirstItem ? 'true' : 'false'}" aria-controls="${collapseId}">
                            ${oneData.date}
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse ${showClass}" data-bs-parent="${keepAccordionOpen ? '' : '#accordionPanelsStayOpen'}">
                        <div class="accordion-body">
                            <h2 style="text-align: center;">Used Car Dealership</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Maker</th>
                                        <th scope="col">Car</th>
                                        <th scope="col" class="price-header" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}">Price</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${oneData.used.map(car => `
                                        <tr class="${car.isOld ? 'table-danger' : (car.isOld === false ? '' : 'table-warning')}">
                                            <td>${car.maker_name}</td>
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.car_name}</th>
                                            <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                                            <td></td>
                                        </tr>
                                    `).join('')}
                                    ${oneData.used.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No new cars available.</td></tr>' : ''}
                                </tbody>
                            </table>
                            <h2 style="text-align: center; margin-top: 50px;">Legendary Dealership</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Maker</th>
                                        <th scope="col">Car</th>
                                        <th scope="col" class="price-header" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}">Price</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${oneData.legend.map(car => `
                                        <tr>
                                            <td>${car.maker_name}</td>
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.car_name}</th>
                                            <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                                            <td></td>
                                        </tr>
                                    `).join('')}
                                    ${oneData.legend.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No new cars available.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            accordionContainer.append(accordionItem);
        });

        if (!keepAccordionOpen) {
            accordionContainer.find('.accordion-collapse').on('show.bs.collapse', function () {
                accordionContainer.find('.accordion-collapse.show').collapse('hide');
            });
        }
    }

    // Update last updated timestamp
    function updateLastUpdatedTimestamp(timestamp) {
        $('#lastUpdated').text(`Last updated: ${timestamp}`);
    }

    // Render expected section
    function renderExpectedSection(db) {
        const container = $('#contentContainer');

        // Expected soon section
        const expectedSoonContent = `
            <h2 style="text-align: center;">Expected Soon</h2>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Maker</th>
                            <th scope="col">Car</th>
                            <th scope="col" class="price-header" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}">Price</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${db.expected.map(car => `
                            <tr>
                                <td>${car.maker_name}</td>
                                <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.car_name}</th>
                                <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                                <td></td>
                            </tr>
                        `).join('')}
                        ${db.expected.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No expected cars.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;

        // Appeared section
        const appearedContent = `
            <h2 style="text-align: center;">Appeared</h2>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Maker</th>
                            <th scope="col">Car</th>
                            <th scope="col" class="price-header" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}">Price</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${db.appeared.map(car => `
                            <tr>
                                <td>${car.maker_name}</td>
                                <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.car_name}</th>
                                <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                                <td></td>
                            </tr>
                        `).join('')}
                        ${db.appeared.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No appeared cars.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;

        container.append(expectedSoonContent);
        container.append(appearedContent);

        // Bind popup text click event
        $('.popup-text').click(function () {
            const imageUrl = $(this).data('image-url');
            img.attr('src', imageUrl);
            modal.show();
        });
    }

    // Toggle price column visibility
    $('#showPriceColumn').change(function () {
        showPriceColumn = $(this).is(':checked');
        localStorage.setItem('showPriceColumn', showPriceColumn);
        $('.price-header, .price-cell').css('display', showPriceColumn ? '' : 'none');
    });

    // Toggle accordion behavior
    $('#keepAccordionOpen').change(function () {
        keepAccordionOpen = $(this).is(':checked');
        localStorage.setItem('keepAccordionOpen', keepAccordionOpen);
        renderAccordion(data);
    });

    // Handle price cell click to switch between USD and JPY
    $(document).on('click', '.price-cell', function () {
        displayInJPY = !displayInJPY;
        localStorage.setItem('displayInJPY', displayInJPY);
        const price = $(this).data(displayInJPY ? 'price-jpy' : 'price');
        $(this).text(numberWithCommas(price));
        updateLastUpdatedTimestamp(displayInJPY ? data.timestamp_jp : data.timestamp);
    });

    // Bind popup text click event
    $(document).on('click', '.popup-text', function () {
        const imageUrl = $(this).data('image-url');
        img.attr('src', imageUrl);
        modal.show();
    });
});
