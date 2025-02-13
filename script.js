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
    let expectedContainer = ''; // Ensure expectedContainer is initialized as an empty string

    // Load and render db.json first to define the expectedContainer
    fetch('db.json')
        .then(response => response.json())
        .then(db => {
            expectedContainer = renderExpectedSection(db);
            soldoutContainer = renderSoldOutSection(db);

            // Load and render data.json
            fetch('data.json')
                .then(response => response.json())
                .then(loadedData => {
                    data = loadedData; // Assign the loaded data to the data variable
                    renderAccordion(data);
                    updateLastUpdatedTimestamp(data.timestamp, displayInJPY);
                });
        });

    // Function to format numbers with commas
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Render accordion section
    function renderAccordion(data) {
        const combinedContainer = $('#combinedContainer');
        combinedContainer.empty();
        combinedContainer.append(expectedContainer); // Append expectedContainer first
        combinedContainer.append(soldoutContainer); // Append soldoutContainer

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
            togglePrices(data.timestamp);
        });
    }

    // Toggle between price and price_jp
    function togglePrices(timestamp) {
        $('.price-cell').each(function () {
            const priceCell = $(this);
            const price = priceCell.data('price');
            const priceJpy = priceCell.data('price-jpy');
            priceCell.text(displayInJPY ? numberWithCommas(priceJpy) : numberWithCommas(price));
        });

        // Update the timestamp display
        updateLastUpdatedTimestamp(timestamp, displayInJPY);
    }

    // Render Expected Soon section
    function renderExpectedSection(db) {
        // Selection algorithm
        function selectCars(carsDict, percentage) {
            const today = new Date();
            let carsArray = Object.entries(carsDict);

            // Sort cars by 'sinceLastSeen'
            carsArray.sort((a, b) => {
                return b[1].sinceLastSeen - a[1].sinceLastSeen;
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
                    <td style="text-align: right;">${car[1].lastSeen} (${car[1].sinceLastSeen} days ago)</td>
                    <td></td>
                </tr>
            `).join('');
        };

        const usedCarsHtml = renderCars(selectedUsedCars);
        const legendCarsHtml = renderCars(selectedLegendCars);

        return `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExpected" aria-expanded="true" aria-controls="collapseExpected">
                        Expected Soon
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
                                    <th scope="col" style="text-align: right;">Last Seen</th>
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
                                    <th scope="col" style="text-align: right;">Last Seen</th>
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
    }

    // Render Recently Soldout section
    function renderSoldOutSection(db) {
        // Selection algorithm for sold out cars
        function selectSoldOutCars(carsDict) {
            return Object.entries(carsDict).filter(([_, car]) => car.soldout === 1);
        }

        const usedCars = db['used'];
        const legendCars = db['legend'];

        const soldOutUsedCars = selectSoldOutCars(usedCars);
        const soldOutLegendCars = selectSoldOutCars(legendCars);

        const renderCars = (cars) => {
            return cars.map(car => `
            <tr class="table-secondary">
                <td>${car[1].maker_name}</td>
                <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car[0]}.png">${car[1].car_name}</th>
                <td style="text-align: right;">${car[1].lastSeen} (${car[1].sinceLastSeen} days ago)</td>
                <td></td>
            </tr>
        `).join('');
        };

        const soldOutUsedCarsHtml = renderCars(soldOutUsedCars);
        const soldOutLegendCarsHtml = renderCars(soldOutLegendCars);

        return `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExpected" aria-expanded="true" aria-controls="collapseExpected">
                        Expected Soon
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
                                    <th scope="col" style="text-align: right;">Last Seen</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${soldOutUsedCarsHtml}
                            </tbody>
                        </table>
                        <h2 style="text-align: center; margin-top: 50px;">Legendary Dealership</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Maker</th>
                                    <th scope="col">Car</th>
                                    <th scope="col" style="text-align: right;">Last Seen</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${soldOutLegendCarsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Update the last updated timestamp display
    function updateLastUpdatedTimestamp(timestamp, displayInJPY) {
        $('#lastUpdated').text(`Last updated: ${ISOtoString(timestamp, displayInJPY)}`);
    }

    function ISOtoString(timestamp_str, displayInJPY) {
        timestamp = new Date(timestamp_str);
        if (displayInJPY) {
            return timestamp.toLocaleString('ja-JP', {
                timeZone: 'Asia/Tokyo',
                dateStyle: 'short',
                timeStyle: 'short'
            }).replace(/\/0/g, '/') + ' JST';
        } else {
            return timestamp.toLocaleString('ja-JP', {
                timeZone: 'UTC',
                dateStyle: 'short',
                timeStyle: 'short'
            }).replace(/\/0/g, '/') + ' UTC';
        }
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
