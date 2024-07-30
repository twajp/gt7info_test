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
            expectedContainer = renderExpectedSection(db);
        });

    // Function to format numbers with commas
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Render accordion section
    function renderAccordion(data) {
        const combinedContainer = $('#combinedContainer');
        combinedContainer.empty();
        combinedContainer.append(expectedContainer)

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
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.car_id}.png">${car.car_name}</th>
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
                                        <tr class="${car.isOld ? 'table-danger' : (car.isOld === false ? '' : 'table-warning')}">
                                            <td>${car.maker_name}</td>
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.car_id}.png">${car.car_name}</th>
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
            combinedContainer.append(accordionItem);
        });

        // Rebind popup text click event
        $('.popup-text').click(function () {
            const imageUrl = $(this).data('image-url');
            img.attr('src', imageUrl);
            modal.show();
        });

        // Handle price cell and header click to toggle price and price_jp
        $(document).on('click', '.price-cell, .price-header', function () {
            displayInJPY = !displayInJPY;
            localStorage.setItem('displayInJPY', displayInJPY); // Save the preference
            togglePrices(data.timestamp, data.timestamp_jp);
        });
    }

    // Toggle between price and price_jp
    function togglePrices(timestamp, timestamp_jp) {
        $('.price-cell').each(function () {
            const priceCell = $(this);
            const price = priceCell.data('price');
            const priceJpy = priceCell.data('price-jpy');
            priceCell.text(displayInJPY ? numberWithCommas(priceJpy) : numberWithCommas(price));
        });

        // Update the timestamp display
        updateLastUpdatedTimestamp(displayInJPY ? timestamp_jp : timestamp);
    }

    // Render Expected to Appear Soon section
    function renderExpectedSection(db) {
        // Selection algorithm
        function selectCars(carsDict, percentage) {
            const today = new Date();
            let carsArray = Object.entries(carsDict);

            // Sort cars by 'sinceLastAppearance'
            carsArray.sort((a, b) => {
                return b[1].sinceLastAppearance - a[1].sinceLastAppearance;
            });

            // Filter out non-old cars and get top cars based on percentage
            const numTopCars = Math.ceil(carsArray.length * (percentage / 100));
            let topCars = carsArray.slice(0, numTopCars);
            topCars = topCars.filter(car => car[1].isOld !== false);

            return topCars;
        }

        const usedCars = db['used'];
        const legendCars = db['legend'];

        const selectedUsedCars = selectCars(usedCars, 20);
        const selectedLegendCars = selectCars(legendCars, 10);

        const renderCars = (cars) => {
            return cars.map(car => `
                <tr class="${car[1].isOld ? 'table-danger' : (car[1].isOld === false ? '' : 'table-warning')}">
                    <td>${car[1].maker_name}</td>
                    <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car[0]}.png">${car[1].car_name}</th>
                    <td style="text-align: right;">${car[1].lastAppearance} (${car[1].sinceLastAppearance} days ago)</td>
                    <td></td>
                </tr>
            `).join('');
        };

        const usedCarsHtml = renderCars(selectedUsedCars);
        const legendCarsHtml = renderCars(selectedLegendCars);

        expectedContainer = `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExpected" aria-expanded="true" aria-controls="collapseExpected">
                        Expected to Appear Soon
                    </button>
                </h2>
                <div id="collapseExpected" class="accordion-collapse collapse" data-bs-parent="${keepAccordionOpen ? '' : '#accordionPanelsStayOpen'}">
                    <div class="accordion-body">
                        <h2 style="text-align: center;">Used Car Dealership</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Maker</th>
                                    <th scope="col">Car</th>
                                    <th scope="col" style="text-align: right;">Last Appeared</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${usedCarsHtml}
                            </tbody>
                        </table>
                        <h2 style="text-align: center; margin-top: 50px;">Legendary Dealership</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Maker</th>
                                    <th scope="col">Car</th>
                                    <th scope="col" style="text-align: right;">Last Appeared</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${legendCarsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        return expectedContainer
    }

    // Update the last updated timestamp display
    function updateLastUpdatedTimestamp(timestamp) {
        $('#lastUpdated').text(`Last updated: ${timestamp}`);
    }

    // Handle keepAccordionOpen switch change
    $('#keepAccordionOpen').change(function () {
        keepAccordionOpen = $(this).is(':checked');
        localStorage.setItem('keepAccordionOpen', keepAccordionOpen); // Save the preference
        renderAccordion(data); // Re-render the accordion with the new setting
    });

    // Handle showPriceColumn switch change
    $('#showPriceColumn').change(function () {
        showPriceColumn = $(this).is(':checked');
        localStorage.setItem('showPriceColumn', showPriceColumn); // Save the preference
        $('.price-header, .price-cell').css('display', showPriceColumn ? '' : 'none');
    });
});
