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
    const modal = $('#modal-container');
    const img = modal.find('img');
    let displayInJPY = localStorage.getItem('displayInJPY') === 'true';

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderAccordion(data);
            updateLastUpdatedTimestamp(displayInJPY ? data.timestamp_jp : data.timestamp);
        })
        .catch(error => console.error('Error loading data.json:', error));

    fetch('db.json')
        .then(response => response.json())
        .then(db => renderExpectedSection(db))
        .catch(error => console.error('Error loading db.json:', error));

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

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
                        <button class="accordion-button ${buttonClass}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${isFirstItem}" aria-controls="${collapseId}">
                            ${oneData.date}
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse ${showClass}" data-bs-parent="#accordionPanelsStayOpen">
                        <div class="accordion-body">
                            <h2 class="text-center">Used Car Dealership</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Maker</th>
                                        <th scope="col">Car</th>
                                        <th scope="col" class="price-header text-end cursor-pointer">Price</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${oneData.used.map(car => `
                                        <tr class="${car.isOld ? 'table-danger' : (car.isOld === false ? '' : 'table-warning')}">
                                            <td>${car.makername}</td>
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.carname}</th>
                                            <td class="price-cell text-end cursor-pointer" data-price="${car.price}" data-price-jpy="${car.price_in_jpy}">${numberWithCommas(displayInJPY ? car.price_in_jpy : car.price)}</td>
                                            <td></td>
                                        </tr>
                                    `).join('')}
                                    ${oneData.used.length === 0 ? '<tr><td colspan="4" class="text-center">No new cars available.</td></tr>' : ''}
                                </tbody>
                            </table>
                            <br><br>
                            <h2 class="text-center">Legendary Dealership</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Maker</th>
                                        <th scope="col">Car</th>
                                        <th scope="col" class="price-header text-end cursor-pointer">Price</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${oneData.legend.map(car => `
                                        <tr class="${car.isOld ? 'table-danger' : (car.isOld === false ? '' : 'table-warning')}">
                                            <td>${car.makername}</td>
                                            <th class="popup-text" data-image-url="https://ddm999.github.io/gt7info/cars/prices_${car.carid}.png">${car.carname}</th>
                                            <td class="price-cell text-end cursor-pointer" data-price="${car.price}" data-price-jpy="${car.price_in_jpy}">${numberWithCommas(displayInJPY ? car.price_in_jpy : car.price)}</td>
                                            <td></td>
                                        </tr>
                                    `).join('')}
                                    ${oneData.legend.length === 0 ? '<tr><td colspan="4" class="text-center">No new cars available.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            accordionContainer.append(accordionItem);
        });
    }

    function renderExpectedSection(db) {
        const expectedUsedCars = $('#expectedUsedCars');
        const expectedLegendCars = $('#expectedLegendCars');

        db['expected'].forEach(entry => {
            const usedCarRow = `
                <tr>
                    <td>${entry.makername}</td>
                    <td>${entry.carname}</td>
                    <td>${entry.sinceLastAppeared ? new Date(entry.sinceLastAppeared).toLocaleDateString() : 'N/A'}</td>
                    <td></td>
                </tr>
            `;
            expectedUsedCars.append(usedCarRow);

            const legendCarRow = `
                <tr>
                    <td>${entry.makername}</td>
                    <td>${entry.carname}</td>
                    <td>${entry.sinceLastAppeared ? new Date(entry.sinceLastAppeared).toLocaleDateString() : 'N/A'}</td>
                    <td></td>
                </tr>
            `;
            expectedLegendCars.append(legendCarRow);
        });
    }

    function updateLastUpdatedTimestamp(timestamp) {
        $('#lastUpdated').text(`Last Updated: ${new Date(timestamp).toLocaleDateString()}`);
    }

    $('#modal-container').on('click', function () {
        $(this).hide();
    });

    $('#modal-container').on('click', 'img', function (e) {
        e.stopPropagation();
    });

    $(document).on('click', '.popup-text', function () {
        const imageUrl = $(this).data('image-url');
        img.attr('src', imageUrl);
        modal.show();
    });

    $(document).on('click', '.price-cell', function () {
        displayInJPY = !displayInJPY;
        localStorage.setItem('displayInJPY', displayInJPY);
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                renderAccordion(data);
                updateLastUpdatedTimestamp(displayInJPY ? data.timestamp_jp : data.timestamp);
            })
            .catch(error => console.error('Error loading data.json:', error));
    });
});
