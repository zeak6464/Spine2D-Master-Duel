document.addEventListener('DOMContentLoaded', () => {
    const submitAllRoundsButton = document.getElementById('submit-all-rounds');
    const SERVER_URL = 'http://localhost:3000';
  
    let roundNames = {};
    const elements = [
        'main-menu', 'admin-login', 'admin-menu', 'step1', 'step2', 'step3', 'submit-page',
        'delivery-menu', 'production-menu', 'menu-picking', 'menu-delivery', 'menu-production',
        'menu-admin', 'back-to-main1', 'back-to-main2', 'back-to-main3', 'back-to-main4',
        'back-to-main5', 'back-to-step1', 'back-to-step2', 'back-to-step3', 'admin-login-button',
        'import-button', 'file-upload', 'reset-picking-button', 'reset-delivery-button',
        'reset-production-button', 'next-step1', 'next-step2', 'next-order', 'submit',
        'round-select', 'picker-name', 'pick-list', 'total-items', 'baskets', 'code-title',
        'total-baskets-display', 'page-number', 'download-link', 'submit-all-rounds', 'page-select'
    ];
  
    const elementsObject = {};
    elements.forEach(id => {
        elementsObject[id] = document.getElementById(id);
        if (!elementsObject[id]) {
            console.error(`Element with id ${id} not found.`);
        }
    });
  
    const {
        'main-menu': mainMenu, 'admin-login': adminLogin, 'admin-menu': adminMenu, 'step1': step1,
        'step2': step2, 'step3': step3, 'submit-page': submitPage, 'delivery-menu': deliveryMenu,
        'production-menu': productionMenu, 'menu-picking': menuPicking, 'menu-delivery': menuDelivery,
        'menu-production': menuProduction, 'menu-admin': menuAdmin, 'back-to-main1': backToMain1,
        'back-to-main2': backToMain2, 'back-to-main3': backToMain3, 'back-to-main4': backToMain4,
        'back-to-main5': backToMain5, 'back-to-step1': backToStep1, 'back-to-step2': backToStep2,
        'back-to-step3': backToStep3, 'admin-login-button': adminLoginButton,
        'import-button': importButton, 'file-upload': fileUpload, 'reset-picking-button': resetPickingButton,
        'reset-delivery-button': resetDeliveryButton, 'reset-production-button': resetProductionButton,
        'next-step1': nextStep1, 'next-step2': nextStep2, 'next-order': nextOrder,
        'submit': submit, 'round-select': roundSelect, 'picker-name': pickerNameInput,
        'pick-list': pickList, 'total-items': totalItemsDisplay, 'baskets': basketsInput,
        'code-title': codeTitle, 'total-baskets-display': totalBasketsDisplay,
        'page-number': pageNumberDisplay, 'download-link': downloadLink, 'submit-all-rounds': submitAllRounds,
        'page-select': pageSelect
    } = elementsObject;
  
    let selectedRound;
    let currentOrderIndex = 0;
    let totalBaskets = 0;
    let overallBaskets = 0;
    let savedStates = {};
    let data = {};
    let pickerNames = {}; // New data structure to store picker names for each round
  
    const adminPin = '1234';
  
    function clearPickingSection() {
        data = {};
        savedStates = {};
        overallBaskets = 0;
        currentOrderIndex = 0;
        pickerNames = {}; // Clear picker names
  
        pickList.innerHTML = '';
        totalItemsDisplay.textContent = '';
        totalBasketsDisplay.textContent = '';
  
        Array.from(roundSelect.options).forEach(option => {
            option.textContent = option.value ? `Round ${option.value} - Total items: 0 - Total pages: 0` : 'Select a round';
        });
  
        saveData();
    }
  
    function clearUIAfterReset() {
        roundSelect.value = '';
        totalItemsDisplay.textContent = '';
        pickList.innerHTML = '';
        codeTitle.textContent = '';
        basketsInput.value = '';
        updateTotalBasketsDisplay();
    }
  
    function saveData() {
        localStorage.setItem('pickingData', JSON.stringify(data));
        localStorage.setItem('overallBaskets', overallBaskets.toString());
        localStorage.setItem('savedStates', JSON.stringify(savedStates));
        localStorage.setItem('pickerNames', JSON.stringify(pickerNames)); // Save picker names
    }
  
    function loadData() {
        const savedData = localStorage.getItem('pickingData');
        const savedOverallBaskets = localStorage.getItem('overallBaskets');
        const savedStatesData = localStorage.getItem('savedStates');
        const savedPickerNames = localStorage.getItem('pickerNames'); // Load picker names
        if (savedData) {
            data = JSON.parse(savedData);
        } else {
            data = {};
        }
        if (savedOverallBaskets) {
            overallBaskets = parseInt(savedOverallBaskets, 10);
        } else {
            overallBaskets = 0;
        }
        if (savedStatesData) {
            savedStates = JSON.parse(savedStatesData);
        } else {
            savedStates = {};
        }
        if (savedPickerNames) {
            pickerNames = JSON.parse(savedPickerNames);
        } else {
            pickerNames = {};
        }
        updateTotalItems();
        updateTotalBasketsDisplay();
        return data;
    }
  
    function updateTotalBasketsDisplay() {
        totalBasketsDisplay.textContent = `Total Baskets Used: ${overallBaskets}`;
    }
  
    function updateTotalItems() {
        const rounds = Object.keys(data);
        rounds.forEach(round => {
            const totalItems = calculateTotalItems(round);
            const totalPages = data[round] ? data[round].length : 0;
            const roundOption = document.querySelector(`#round-select option[value="${round}"]`);
            if (roundOption) {
                roundOption.textContent = `Round ${round} - Total items: ${totalItems} - Total pages: ${totalPages}`;
            }
        });
    }
  
    function calculateTotalItems(round) {
        let total = 0;
        if (data[round]) {
            data[round].forEach(order => {
                total += order.products.reduce((sum, product) => sum + product.quantity, 0);
            });
        }
        return total;
    }
  
    function parseCSV(csvData, round) {
    const rows = csvData.split('\n').filter(row => row.trim().length > 0);
    const reversedData = [];
    const unwantedPattern = /^(?:\d+|false)$/i;

    rows.forEach((row, index) => {
        const columns = row.split(',');
        if (columns.length < 20) {
            console.error(`Row ${index + 1} is malformed: ${row}`);
            return;
        }

        const [
            deliveryDate, deliveryAddressId, customerCode, customerName, productCode,
            productName, productToContainerId, containerDisplayName, productGroupName, quantity,
            waveId, waveName, pickingInstruction, customerOrderNumber,
            sequence, companyId, productId, companyCode, companyName, ...notesColumns
        ] = columns;

        if (index === 0 && quantity.toLowerCase() === "quantity") {
            return;
        }

        const quantityStr = quantity.trim().replace(/"/g, '');
        const quantityFloat = parseFloat(quantityStr);

        if (isNaN(quantityFloat)) {
            console.error(`Invalid quantity at row ${index + 1}: "${quantity}"`);
            return;
        }

        const quantityInt = Math.round(quantityFloat);

        const notes = notesColumns
            .filter(note => !unwantedPattern.test(note.trim()) && note.trim() !== waveName && note.trim() !== waveId)
            .join(',').trim();

        let existingOrder = reversedData.find(order => order.storeCode === customerCode);
        if (existingOrder) {
            existingOrder.products.push({
                productName: productName,
                quantity: quantityInt
            });
            if (notes && !existingOrder.notes.includes(notes)) {
                existingOrder.notes = notes;
            }
        } else {
            reversedData.push({
                storeCode: customerCode,
                products: [{
                    productName: productName,
                    quantity: quantityInt
                }],
                notes: notes || ''
            });
        }
    });

    reversedData.forEach(order => {
        order.products.reverse();
    });

    data[round] = reversedData.reverse();
    console.log('Parsed and reversed data for round:', round, data[round]);
}

  
    function displayOrder(index) {
        if (!data[selectedRound] || !data[selectedRound][index]) {
            return;
        }
        const order = data[selectedRound][index];
        codeTitle.textContent = order.storeCode;
  
        let notesHtml = '';
        if (order.notes) {
            notesHtml = `<div class="order-notes">${order.notes}</div>`;
        }
  
        const reversedProducts = [...order.products].reverse();
        const productListHtml = reversedProducts.map(product => `
            <li>
                <div class="item-info">
                    <input type="checkbox" id="${order.storeCode}-${product.productName.replace(/ /g, '-')}" ${savedStates[`${selectedRound}-${index}`] && savedStates[`${selectedRound}-${index}`].checkboxes[`${order.storeCode}-${product.productName.replace(/ /g, '-')}`] ? 'checked' : ''}>
                    <span>${product.productName} x${product.quantity}</span>
                    <div class="item-controls">
                        <input type="number" placeholder="Overs" id="${order.storeCode}-${product.productName.replace(/ /g, '-')}-overs" min="0" value="${savedStates[`${selectedRound}-${index}`] ? savedStates[`${selectedRound}-${index}`].overs[`${order.storeCode}-${product.productName.replace(/ /g, '-')}`] : ''}">
                        <input type="number" placeholder="Short" id="${order.storeCode}-${product.productName.replace(/ /g, '-')}-short" min="0" value="${savedStates[`${selectedRound}-${index}`] ? savedStates[`${selectedRound}-${index}`].shorts[`${order.storeCode}-${product.productName.replace(/ /g, '-')}`] : ''}">
                    </div>
                </div>
            </li>
        `).join('');
  
        pickList.innerHTML = notesHtml + productListHtml;
        restoreState(index);
        pageNumberDisplay.textContent = `Page ${data[selectedRound].length - index}`;
    }
  
    function saveCurrentState() {
    const order = data[selectedRound][currentOrderIndex];
    if (!order) return;

    const state = {
        checkboxes: {},
        overs: {},
        shorts: {},
        baskets: basketsInput.value || ''
    };

    order.products.forEach(product => {
        const productId = `${order.storeCode}-${product.productName.replace(/ /g, '-')}`;
        const checkbox = document.getElementById(productId);
        const overs = document.getElementById(`${productId}-overs`);
        const shorts = document.getElementById(`${productId}-short`);

        if (checkbox) {
            state.checkboxes[productId] = checkbox.checked;
        }
        if (overs) {
            state.overs[productId] = overs.value || '';
        }
        if (shorts) {
            state.shorts[productId] = shorts.value || '';
        }
    });

    savedStates[`${selectedRound}-${currentOrderIndex}`] = state;
    pickerNames[selectedRound] = pickerNameInput.value; // Save the picker name for the current round
    console.log('Saving state for round:', selectedRound, 'order index:', currentOrderIndex, state); // Debug log
}

	function restoreState(index) {
		const order = data[selectedRound][index];
		if (!order) return;
		const state = savedStates[`${selectedRound}-${index}`];
		if (state) {
			order.products.forEach(product => {
				const productId = `${order.storeCode}-${product.productName.replace(/ /g, '-')}`;
				const checkbox = document.getElementById(productId);
				const overs = document.getElementById(`${productId}-overs`);
				const shorts = document.getElementById(`${productId}-short`);
				if (checkbox) {
					checkbox.checked = state.checkboxes[productId];
				}
				if (overs) {
					overs.value = state.overs[productId];
				}
				if (shorts) {
					shorts.value = state.shorts[productId];
				}
			});
			basketsInput.value = state.baskets;
			pickerNameInput.value = pickerNames[selectedRound] || ""; // Restore the picker name for the selected round
			console.log('Restored state for round:', selectedRound, 'order index:', index, state); // Debug log
		}
	}

  
    function validateOrder() {
        const checkboxes = pickList.querySelectorAll('input[type="checkbox"]');
        let allChecked = true;
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allChecked = false;
            }
        });
  
        const baskets = basketsInput.value.trim();
        if (!baskets) {
            allChecked = false;
        }
  
        return allChecked;
    }
  
    function resetForm() {
        selectedRound = null;
        pickerName = '';
        currentOrderIndex = 0;
        totalBaskets = 0;
        step1.style.display = 'none';
        step2.style.display = 'none';
        step3.style.display = 'none';
        submitPage.style.display = 'none';
        nextOrder.style.display = 'block';
        submit.style.display = 'none';
        mainMenu.style.display = 'block';
        roundSelect.value = '';
        pickerNameInput.value = '';
        pickList.innerHTML = '';
        codeTitle.textContent = '';
        totalItemsDisplay.textContent = '';
        basketsInput.value = '';
        basketsInput.disabled = false;
    }
  
    function showSubmitPage() {
        submitPage.style.display = 'block';
        submit.style.display = 'block';
    }
  
    function getExportDate() {
        const now = new Date();
        const hours = now.getHours();
  
        if (hours >= 19 && hours < 24) {
            now.setDate(now.getDate() + 1);
        }
  
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
  
        return `${year}-${month}-${day}`;
    }
  
    function exportData(content, filename) {
        try {
            const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
  
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
  
            downloadLink.click();
  
            setTimeout(() => {
                URL.revokeObjectURL(url);
                document.body.removeChild(downloadLink);
            }, 10000);
  
            console.log('Export successful');
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed');
        }
    }
  
    function generateExcelExportContentForAllRounds() {
        const allData = [];
        const rounds = Object.keys(data);
  
        const header = [
            { A: 'Total Baskets Used', B: overallBaskets },
            { A: '', B: '', C: '', D: '', E: '', F: '', G: '' },
        ];
  
        rounds.forEach(round => {
            allData.push(
                { A: `Round ${round}`, B: data[round].name || '' },
                { A: 'Picker Name', B: pickerNames[round] || '' }, // Use picker names for each round
                { A: '', B: '', C: '', D: '', E: '', F: '', G: '' },
                { A: 'Store Code', B: 'Product Name', C: 'Quantity', D: 'Overs', E: 'Shorts', G: 'Baskets' }
            );
  
            data[round].forEach((order, index) => {
                const savedState = savedStates[`${round}-${index}`];
                order.products.forEach(product => {
                    allData.push({
                        A: order.storeCode,
                        B: product.productName,
                        C: product.quantity,
                        D: savedState ? savedState.overs[`${order.storeCode}-${product.productName.replace(/ /g, '-')}`] : '',
                        E: savedState ? savedState.shorts[`${order.storeCode}-${product.productName.replace(/ /g, '-')}`] : '',
                        G: savedState ? savedState.baskets : ''
                    });
                });
                allData.push({ A: '', B: '', C: '', D: '', E: '', G: '' });
            });
  
            allData.push({ A: '', B: '', C: '', D: '', E: '', G: '' });
        });
  
        const ws_data = [...header, ...allData];
        const ws = XLSX.utils.json_to_sheet(ws_data, { skipHeader: true });
  
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[address]) ws[address] = {};
                if (!ws[address].s) ws[address].s = {};
                ws[address].s.alignment = { horizontal: "center", vertical: "center" };
            }
        }
  
        const colWidths = [];
        ws_data.forEach(row => {
            Object.keys(row).forEach((key, index) => {
                const value = row[key] ? String(row[key]) : '';
                const width = Math.max(colWidths[index] || 10, value.length + 2);
                colWidths[index] = width;
            });
        });
        ws['!cols'] = colWidths.map(width => ({ width }));
  
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'All Rounds');
  
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  
        return s2ab(wbout);
    }
  
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }
  
    menuPicking.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        step1.style.display = 'block';
    });
  
    menuDelivery.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        deliveryMenu.style.display = 'block';
    });
  
    menuProduction.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        productionMenu.style.display = 'block';
    });
  
    menuAdmin.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        adminLogin.style.display = 'block';
    });
  
    backToMain1.addEventListener('click', () => {
        step1.style.display = 'none';
        mainMenu.style.display = 'block';
    });
  
    backToMain2.addEventListener('click', () => {
        deliveryMenu.style.display = 'none';
        mainMenu.style.display = 'block';
    });
  
    backToMain3.addEventListener('click', () => {
        productionMenu.style.display = 'none';
        mainMenu.style.display = 'block';
    });
  
    backToMain4.addEventListener('click', () => {
        adminLogin.style.display = 'none';
        mainMenu.style.display = 'block';
    });
  
    backToMain5.addEventListener('click', () => {
        adminMenu.style.display = 'none';
        mainMenu.style.display = 'block';
    });
  
    backToStep1.addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });
  
    backToStep2.addEventListener('click', () => {
        if (currentOrderIndex === 0) {
            step3.style.display = 'none';
            step2.style.display = 'block';
        } else {
            saveCurrentState();
            currentOrderIndex--;
            displayOrder(currentOrderIndex);
        }
    });
  
    backToStep3.addEventListener('click', () => {
        submitPage.style.display = 'none';
        step3.style.display = 'block';
    });
  
    adminLoginButton.addEventListener('click', () => {
        const enteredPin = document.getElementById('admin-pin').value;
        if (enteredPin === adminPin) {
            adminLogin.style.display = 'none';
            adminMenu.style.display = 'block';
        } else {
            alert('Invalid PIN');
        }
    });
  
    importButton.addEventListener('click', () => {
        const file = fileUpload.files[0];
        if (file) {
            const reader = new FileReader();
            const fileType = file.name.split('.').pop().toLowerCase();
            reader.onload = function (e) {
                const fileData = e.target.result;
                const roundMatch = file.name.match(/r(\d+)/i);
                if (roundMatch) {
                    const round = roundMatch[1];
                    if (fileType === 'csv') {
                        parseCSV(fileData, round);
                    }
                    alert(`Data imported successfully for Round ${round}`);
                    updateTotalItems();
                    saveData();
                    saveRoundDataToServer(round, data[round]); // Save imported data to the server
                    updatePageSelect(round);
                } else {
                    alert('Invalid file name. Could not determine the round.');
                }
            };
            if (fileType === 'csv') {
                reader.readAsText(file);
            }
        } else {
            alert('Please select a file');
        }
    });
  
    resetPickingButton.addEventListener('click', () => {
        try {
            clearPickingSection();
            clearUIAfterReset();
            alert('Picking section has been reset');
            resetDataOnServer(); // Reset data on the server
        } catch (error) {
            console.error('Error during reset:', error);
        }
    });
  
    resetDeliveryButton.addEventListener('click', () => {
        console.log('Reset delivery section');
    });
  
    resetProductionButton.addEventListener('click', () => {
        console.log('Reset production section');
    });
  
    roundSelect.addEventListener('change', () => {
        selectedRound = roundSelect.value;
        if (selectedRound) {
            totalItemsDisplay.textContent = `Total items: ${calculateTotalItems(selectedRound)}`;
            loadRoundDataFromServer(selectedRound); // Load round data from the server when a round is selected
        } else {
            totalItemsDisplay.textContent = '';
        }
    });
  
    nextStep1.addEventListener('click', () => {
        if (selectedRound) {
            step1.style.display = 'none';
            step2.style.display = 'block';
            pickerNameInput.value = pickerNames[selectedRound] || ''; // Restore picker name when moving to the next step
        } else {
            alert('Please select a round');
        }
    });
  
    nextStep2.addEventListener('click', () => {
        if (pickerNameInput.value) {
            pickerNames[selectedRound] = pickerNameInput.value; // Save the picker name for the current round
            step2.style.display = 'none';
            step3.style.display = 'block';
            currentOrderIndex = 0;
            totalBaskets = 0;
            displayOrder(currentOrderIndex);
            updatePageSelect(selectedRound);
        } else {
            alert('Please enter your name');
        }
    });
  
    nextOrder.addEventListener('click', () => {
        if (validateOrder()) {
            saveCurrentState();
            totalBaskets += parseInt(basketsInput.value) || 0;
            overallBaskets += parseInt(basketsInput.value) || 0;
            basketsInput.value = '';
            currentOrderIndex++;
            if (currentOrderIndex < data[selectedRound].length) {
                displayOrder(currentOrderIndex);
                restoreState(currentOrderIndex);
            } else {
                step3.style.display = 'none';
                showSubmitPage();
            }
        } else {
            alert('Please check all products and fill the basket field before proceeding.');
        }
    });
  
    submit.addEventListener('click', () => {
        alert(`Round: ${selectedRound}\nPicker: ${pickerNames[selectedRound]}\nTotal Baskets: ${totalBaskets}\nSubmission Successful!`);
        exportData(generateExcelExportContentForAllRounds(), `Round_${selectedRound}_${getExportDate()}.xlsx`);
        resetForm();
        updateTotalBasketsDisplay();
    });
  
    submitAllRoundsButton.addEventListener('click', () => {
        const content = generateExcelExportContentForAllRounds();
        const exportDate = getExportDate();
        const filename = `All_Rounds_${exportDate}.xlsx`;
        exportData(content, filename);
        const file = new File([content], filename);
        uploadExportFile(file);
    });
  
    pageSelect.addEventListener('change', () => {
        const selectedPage = pageSelect.value;
        if (selectedPage) {
            currentOrderIndex = parseInt(selectedPage) - 1;
            displayOrder(currentOrderIndex);
            restoreState(currentOrderIndex);
        }
    });
  
    data = loadData();
    pickerNames = JSON.parse(localStorage.getItem('pickerNames')) || {}; // Load picker names
  
    async function saveRoundDataToServer(round, roundData) {
        try {
            await axios.post(`${SERVER_URL}/save-round`, { round, roundData });
            console.log(`Round ${round} data saved to server`);
        } catch (error) {
            console.error('Error saving round data to server:', error);
        }
    }
  
    async function loadRoundDataFromServer(round) {
      try {
          const response = await axios.get(`${SERVER_URL}/load-round/${round}`);
          const roundDataFromServer = response.data.data; // Fetching data from the response
          const pickerNameFromServer = response.data.pickerName;
          const serverSavedStates = response.data.savedStates;
  
          // Ensure that roundData is in the expected format
          if (!Array.isArray(roundDataFromServer)) {
              throw new Error('Invalid data format received from server');
          }
  
          // Update the local data with the data from the server
          data[round] = roundDataFromServer;
          pickerNames[round] = pickerNameFromServer || '';
          savedStates = { ...savedStates, ...serverSavedStates };
  
          // Update the UI elements
          updateTotalItems();
          updateTotalBasketsDisplay();
  
          // Check if the selected round matches the loaded round
          if (selectedRound === round) {
              displayOrder(currentOrderIndex);
          }
  
          console.log(`Round ${round} data loaded from server`);
      } catch (error) {
          console.error('Error loading round data from server:', error);
      }
    }
  
    async function uploadExportFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            await axios.post(`${SERVER_URL}/upload-export`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Export file uploaded to server');
        } catch (error) {
            console.error('Error uploading export file to server:', error);
        }
    }
  
    async function downloadExportFile(filename) {
        try {
            const response = await axios.get(`${SERVER_URL}/download-export/${filename}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('Export file downloaded from server');
        } catch (error) {
            console.error('Error downloading export file from server:', error);
        }
    }
  
    async function resetDataOnServer() {
        try {
            await axios.post(`${SERVER_URL}/reset`);
            console.log('Data reset on server');
        } catch (error) {
            console.error('Error resetting data on server:', error);
        }
    }
  
    function updatePageSelect(round) {
        const orders = data[round];
        if (!orders) return;
        
        pageSelect.innerHTML = '<option value="">Select Page</option>'; // Reset and add default option
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const option = document.createElement('option');
            option.value = orders.length - i;
            option.textContent = `Page ${orders.length - i} (${order.storeCode})`;
            pageSelect.appendChild(option);
        }
    }
  });
  