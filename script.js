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
            console.log('Loaded db:', db); // Log the structure of db to debug
            renderExpectedSection(db);
        })
        .catch(error => {
            console.error('Error loading db.json:', error);
        });

    // Render expected section
    function renderExpectedSection(db) {
        const container = $('#contentContainer');

        // Use default empty arrays if expected or appeared are undefined
        const expectedCars = db.expected || [];
        const appearedCars = db.appeared || [];

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
                    ${expectedCars.map(car => `
                        <tr>
                            <td>${car.maker_name}</td>
                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.car_name}</th>
                            <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                            <td></td>
                        </tr>
                    `).join('')}
                    ${expectedCars.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No expected cars.</td></tr>' : ''}
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
                    ${appearedCars.map(car => `
                        <tr>
                            <td>${car.maker_name}</td>
                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.car_name}</th>
                            <td class="price-cell" style="text-align: right; cursor: pointer; ${showPriceColumn ? '' : 'display: none;'}" data-price="${car.price}" data-price-jpy="${car.price_jp}">${numberWithCommas(displayInJPY ? car.price_jp : car.price)}</td>
                            <td></td>
                        </tr>
                    `).join('')}
                    ${appearedCars.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No appeared cars.</td></tr>' : ''}
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
