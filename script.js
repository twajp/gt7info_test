const modal = $('#modal-container');
const img = modal.find('img');
const popupTexts = $('.popup-text');

// popupTexts.click(function () {
//     const imageUrl = $(this).data('image-url');
//     img.attr('src', imageUrl);
//     modal.show();
// });

modal.click(function () {
    $(this).hide();
});

$(document).ready(function () {
    // Retrieve display preference from localStorage
    let displayInJPY = localStorage.getItem('displayInJPY') === 'false';

    // Load and render data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
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
        const accordionContainer = $('#appeared');
        accordionContainer.empty();

        data.content.forEach((oneData, index) => {
            const collapseId = `collapse${oneData.id}`;
            const isFirstItem = index === 0;
            const showClass = isFirstItem ? 'show' : '';
            const buttonClass = isFirstItem ? '' : 'collapsed';
            const accordionItem = `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${buttonClass}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="true" aria-controls="${collapseId}">
                            ${oneData.date}
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse ${showClass}" data-bs-parent="#accordionPanelsStayOpen">
                        <div class="accordion-body">
                            <h2 style="text-align: center;">Used Car Dealership</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Maker</th>
                                        <th scope="col">Car</th>
                                        <th scope="col" class="price-header" style="text-align: right; cursor: pointer;">Price</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${oneData.used.map(car => `
                                        <tr class="${car.isOld ? 'table-danger' : (car.isOld === false ? '' : 'table-warning')}">
                                            <td>${car.makername}</td>
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.carname}</th>
                                            <td class="price-cell" style="text-align: right; cursor: pointer;" data-price="${car.price}" data-price-jpy="${car.price_in_jpy}">${numberWithCommas(displayInJPY ? car.price_in_jpy : car.price)}</td>
                                            <td></td>
                                        </tr>
                                    `).join('')}
                                    ${oneData.used.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No new cars available.</td></tr>' : ''}
                                </tbody>
                            </table>
                            <br><br>
                            <h2 style="text-align: center;">Legendary Dealership</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Maker</th>
                                        <th scope="col">Car</th>
                                        <th scope="col" class="price-header" style="text-align: right; cursor: pointer;">Price</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${oneData.legend.map(car => `
                                        <tr class="${car.isOld ? 'table-danger' : (car.isOld === false ? '' : 'table-warning')}">
                                            <td>${car.makername}</td>
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.carname}</th>
                                            <td class="price-cell" style="text-align: right; cursor: pointer;" data-price="${car.price}" data-price-jpy="${car.price_in_jpy}">${numberWithCommas(displayInJPY ? car.price_in_jpy : car.price)}</td>
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

        const modal = $('#modal-container');
        const img = modal.find('img');
        const popupTexts = $('.popup-text');

        // Handle popup text click
        $(document).on('click', '.popup-text', function () {
            const imageUrl = $(this).data('image-url');
            img.attr('src', imageUrl);
            modal.show();
        });

        modal.click(function () {
            $(this).hide();
        });

        // Handle price cell and header click to toggle price and price_in_jpy
        $(document).on('click', '.price-cell, .price-header', function () {
            displayInJPY = !displayInJPY;
            localStorage.setItem('displayInJPY', displayInJPY); // Save the preference
            togglePrices(data.timestamp, data.timestamp_jp);
        });
    }

    // Toggle between price and price_in_jpy
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
        const expectedContainer = $('#expectedSoon');
        expectedContainer.empty();

        // Selection algorithm
        function selectCars(carsDict, percentage) {
            const today = new Date();
            let carsArray = Object.entries(carsDict);

            // Sort cars by 'sinceLastAppeared'
            carsArray.sort((a, b) => {
                return b[1].sinceLastAppeared - a[1].sinceLastAppeared;
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
                    <td>${car[1].makername}</td>
                    <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car[0]}.png">${car[1].carname}</th>
                    <td style="text-align: right;">${car[1].lastAppeared} (${car[1].sinceLastAppeared} days ago)</td>
                    <td></td>
                </tr>
            `).join('');
        };

        const usedCarsHtml = renderCars(selectedUsedCars);
        const legendCarsHtml = renderCars(selectedLegendCars);

        const expectedHtml = `
            <h2 class='accordion-header'>
                <button class='accordion-button collapsed' type='button' data-bs-toggle='collapse' data-bs-target='#collapseExpected' aria-expanded='true' aria-controls='collapseExpected'>
                    Expected to Appear Soon
                </button>
            </h2>
            <div id='collapseExpected' class='accordion-collapse collapse' data-bs-parent='#accordionPanelsStayOpen'>
                <div class='accordion-body'>
                    <h2 style='text-align: center;'>Used Car Dealership</h2>
                    <table class='table'>
                        <thead>
                            <tr>
                                <th scope='col'>Maker</th>
                                <th scope='col'>Car</th>
                                <th scope='col' style='text-align: right;'>Last Appeared</th>
                                <th scope='col'></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usedCarsHtml}
                        </tbody>
                    </table>

                    <br><br>
                    <h2 style='text-align: center;'>Legendary Dealership</h2>
                    <table class='table'>
                        <thead>
                            <tr>
                                <th scope='col'>Maker</th>
                                <th scope='col'>Car</th>
                                <th scope='col' style='text-align: right;'>Last Appeared</th>
                                <th scope='col'></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${legendCarsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        expectedContainer.append(expectedHtml);
    }

    // Update last updated timestamp
    function updateLastUpdatedTimestamp(timestamp) {
        $('#lastUpdated').text(`Last updated: ${timestamp}`);
    }
});
