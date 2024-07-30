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
            renderCombinedSections(data);
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

    // Render combined section
    function renderCombinedSections(data) {
        const combinedContainer = $('#combinedSections');
        combinedContainer.empty();

        // Render expected section
        fetch('db.json')
            .then(response => response.json())
            .then(db => {
                const expectedHtml = renderExpectedSection(db);
                combinedContainer.append(expectedHtml);
            });

        // Render appeared section
        const accordionHtml = renderAccordion(data);
        combinedContainer.append(accordionHtml);

        // Handle popup text click
        $(document).on('click', '.popup-text', function () {
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
        const today = new Date();

        // Selection algorithm
        function selectCars(carsDict, percentage) {
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
            return cars.map(([carName, carData]) => `
                <li>
                    <span class="popup-text" data-image-url="${carData.imageUrl}">${carName}</span>
                    <p>Last appeared: ${carData.sinceLastAppearance} days ago</p>
                </li>
            `).join('');
        };

        const expectedSoonHtml = `
            <div class='accordion-item'>
                <h2 class='accordion-header'>
                    <button class='accordion-button ${keepAccordionOpen ? '' : 'collapsed'}' type='button' data-bs-toggle='collapse' data-bs-target='#collapseExpectedSoon'>
                        Expected to Appear Soon
                    </button>
                </h2>
                <div id='collapseExpectedSoon' class='accordion-collapse collapse ${keepAccordionOpen ? 'show' : ''}'>
                    <div class='accordion-body'>
                        <ul>
                            ${renderCars(selectedUsedCars)}
                            ${renderCars(selectedLegendCars)}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        return expectedSoonHtml;
    }

    // Render accordion
    function renderAccordion(data) {
        const accordionContainer = $('#accordionPanelsStayOpen');
        accordionContainer.empty();

        const accordionHtml = Object.keys(data).map(key => {
            const cars = data[key];
            const rows = cars.map(car => `
                <tr>
                    <td class="popup-text" data-image-url="${car.image_url}">${car.name}</td>
                    <td>${car.year}</td>
                    <td>${car.maker}</td>
                    <td>${car.type}</td>
                    <td class="price-cell" data-price="${car.price}" data-price-jpy="${car.price_jp}">
                        ${displayInJPY ? numberWithCommas(car.price_jp) : numberWithCommas(car.price)}
                    </td>
                </tr>
            `).join('');

            return `
                <div class='accordion-item'>
                    <h2 class='accordion-header'>
                        <button class='accordion-button ${keepAccordionOpen ? '' : 'collapsed'}' type='button' data-bs-toggle='collapse' data-bs-target='#collapse${key}'>
                            ${key}
                        </button>
                    </h2>
                    <div id='collapse${key}' class='accordion-collapse collapse ${keepAccordionOpen ? 'show' : ''}'>
                        <div class='accordion-body'>
                            <table class='table'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Year</th>
                                        <th>Maker</th>
                                        <th>Type</th>
                                        <th class="price-header">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        accordionContainer.append(accordionHtml);
        return accordionHtml;
    }

    // Update the last updated timestamp
    function updateLastUpdatedTimestamp(timestamp) {
        const lastUpdated = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        const formattedDate = lastUpdated.toLocaleString('en-US', options);
        $('#lastUpdated').text(`Last updated: ${formattedDate}`);
    }

    // Event listener for 'keepAccordionOpen' switch
    $('#keepAccordionOpen').change(function () {
        keepAccordionOpen = this.checked;
        localStorage.setItem('keepAccordionOpen', keepAccordionOpen);
        renderCombinedSections(data); // Re-render the combined sections
    });

    // Event listener for 'showPriceColumn' switch
    $('#showPriceColumn').change(function () {
        showPriceColumn = this.checked;
        localStorage.setItem('showPriceColumn', showPriceColumn);
        renderCombinedSections(data); // Re-render the combined sections
    });
});
