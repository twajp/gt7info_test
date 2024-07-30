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
        const combinedContainer = $('#combinedContainer');
        combinedContainer.empty();

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
    }

    // Render expected soon section
    function renderExpectedSection(db) {
        const combinedContainer = $('#combinedContainer');

        // Expected Soon Section
        const expectedSoonSection = `
            <div class="card">
                <div class="card-header">
                    <h2 style="text-align: center;">Expected Soon</h2>
                </div>
                <div class="card-body">
                    <h3 style="text-align: center;">Used Car Dealership</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Maker</th>
                                <th scope="col">Car</th>
                                <th scope="col" class="price-header" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}">Price</th>
                                <th scope="col">Prediction</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${db.used.map(car => `
                                <tr>
                                    <td>${car.maker_name}</td>
                                    <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.car_id}.png">${car.car_name}</th>
                                    <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                                    <td>${car.sinceLastAppeared}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <h3 style="text-align: center; margin-top: 50px;">Legendary Dealership</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Maker</th>
                                <th scope="col">Car</th>
                                <th scope="col" class="price-header" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}">Price</th>
                                <th scope="col">Prediction</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${db.legend.map(car => `
                                <tr>
                                    <td>${car.maker_name}</td>
                                    <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.car_id}.png">${car.car_name}</th>
                                    <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                                    <td>${car.sinceLastAppeared}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        combinedContainer.prepend(expectedSoonSection);

        // Rebind popup text click event
        $('.popup-text').click(function () {
            const imageUrl = $(this).data('image-url');
            img.attr('src', imageUrl);
            modal.show();
        });
    }

    // Function to update the last updated timestamp
    function updateLastUpdatedTimestamp(timestamp) {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        const lastUpdatedDate = new Date(timestamp * 1000); // Convert to milliseconds
        const formattedDate = lastUpdatedDate.toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lastUpdatedElement.textContent = 'Last updated: ' + formattedDate + ' (UTC)';
    }

    // Toggle accordion behavior based on the switch state
    $('#keepAccordionOpen').change(function () {
        keepAccordionOpen = this.checked;
        localStorage.setItem('keepAccordionOpen', keepAccordionOpen);
        renderAccordion(data);
    });

    // Toggle price column visibility based on the switch state
    $('#showPriceColumn').change(function () {
        showPriceColumn = this.checked;
        localStorage.setItem('showPriceColumn', showPriceColumn);
        $('.price-header, .price-cell').toggle(showPriceColumn);
    });
});
