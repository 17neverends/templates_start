const status_text = document.getElementById('status');

document.addEventListener("click", function(event) {
  var dropdown = document.getElementById("roleList");
  var input = document.getElementById("combobox_value");
  if (event.target !== dropdown && event.target !== input) {
      hideDropdown();
  }
});

function showDropdown() {
  var dropdown = document.getElementById("roleList");
  if (dropdown) {
    dropdown.style.display = "block";
  }
}

function hideDropdown() {
  var dropdown = document.getElementById("roleList");
  if (dropdown) {
    dropdown.style.display = "none";
  }
}


function selectRole(value, label) {
  var input = document.getElementById("combobox_value");
  input.value = label;
  hideDropdown();

  var checkboxContainer = document.getElementById("checkboxContainer");
  var paymentCheckbox = document.getElementById("paymentCheckbox");

  if (value === "sender" || value === "outsider") {
    checkboxContainer.style.display = "block";
  } else {
    checkboxContainer.style.display = "none";
    paymentCheckbox.checked = false;
  }
}


let placeCounter = 2;

function addPlace() {
  if (placeCounter > 255){
    status_text.innerText = "Максимум 255 мест";
    return;
  }
  const newPlace = document.createElement('div');
  newPlace.classList.add('place');
  newPlace.id = 'place' + placeCounter;

  newPlace.innerHTML = `
      <p class="place_title">Место ${placeCounter}</p>
      <label>Вес посылки (кг)</label>
      <input type="text" id="box_weight${placeCounter}" name="box_weight${placeCounter}" placeholder="Введите вес посылки">
      <label id="box_size">Размер посылки (см)</label>
      <div class="size">
          <input type="text" id="box_length${placeCounter}" name="box_length${placeCounter}" placeholder="Длина">
          <p class="delimetr" style="color: #808080;">x</p>
          <input type="text" id="box_width${placeCounter}" name="box_width${placeCounter}" placeholder="Ширина">
          <p class="delimetr" style="color: #808080;">x</p>
          <input type="text" id="box_height${placeCounter}" name="box_height${placeCounter}" placeholder="Высота">
      </div>
      <label>Описание товара</label>
      <input type="text" id="desc${placeCounter}" name="desc${placeCounter}" value="ТНП" placeholder="Введите описание товара">
      <button class="created" id="for_delete" type="button" onclick="removePlace('${newPlace.id}')">Удалить</button>
  `;

  document.getElementById('places-container').appendChild(newPlace);

  placeCounter++;
}

function removePlace(placeId) {
  const placeToRemove = document.getElementById(placeId);

  placeToRemove.remove();

  const places = document.getElementsByClassName('place');
  for (let i = 0; i < places.length; i++) {
      const currentPlace = places[i];
      const newPlaceCounter = i + 1;

      currentPlace.id = 'place' + newPlaceCounter;
      currentPlace.querySelector('.place_title').innerText = 'Место ' + newPlaceCounter;

      currentPlace.querySelectorAll('[id^="box_weight"], [id^="box_length"], [id^="box_width"], [id^="box_height"], [id^="desc"]').forEach(element => {
          const currentElementId = element.id;
          element.id = currentElementId.replace(/\d+$/, newPlaceCounter);
      });

      const deleteButton = currentPlace.querySelector('button');
      if (deleteButton) {
          deleteButton.setAttribute('onclick', `removePlace('place${newPlaceCounter}')`);
      }
  }

  placeCounter--;
}

document.addEventListener('click', function(event) {
  if (event.target && event.target.matches('button[id^="delete"]')) {
      const buttonId = event.target.id;
      const placeId = buttonId.replace('delete', 'place');
      removePlace(placeId);
  }
});

let toTarif = false;
let departure_from_list = false;
let destination_from_list = false;
function check_inputs() {
  const places = document.getElementsByClassName('place');
  let isValid = true;
  const placesData = [];

  for (let i = 0; i < places.length; i++) {
    const currentPlace = places[i];
    const boxWeight = currentPlace.querySelector(`#box_weight${i + 1}`);
    const boxLength = currentPlace.querySelector(`#box_length${i + 1}`);
    const boxWidth = currentPlace.querySelector(`#box_width${i + 1}`);
    const boxHeight = currentPlace.querySelector(`#box_height${i + 1}`);

    removeErrorStyle(boxWeight);
    removeErrorStyle(boxLength);
    removeErrorStyle(boxWidth);
    removeErrorStyle(boxHeight);

    if (
      boxWeight.value.trim() !== '' &&
      boxLength.value.trim() !== '' &&
      boxWidth.value.trim() !== '' &&
      boxHeight.value.trim() !== ''
    ) {
      if (
        isValidNumber(boxWeight.value) &&
        isValidNumber(boxLength.value) &&
        isValidNumber(boxWidth.value) &&
        isValidNumber(boxHeight.value)
      ) {
        const placeData = {
          weight: parseFloat(boxWeight.value),
          length: parseFloat(boxLength.value),
          width: parseFloat(boxWidth.value),
          height: parseFloat(boxHeight.value)
        };

        placesData.push(placeData);
      } else {
        if (!isValidNumber(boxWeight.value)) {
          applyErrorStyle(boxWeight);
        }
        if (!isValidNumber(boxLength.value)) {
          applyErrorStyle(boxLength);
        }
        if (!isValidNumber(boxWidth.value)) {
          applyErrorStyle(boxWidth);
        }
        if (!isValidNumber(boxHeight.value)) {
          applyErrorStyle(boxHeight);
        }

        isValid = false;
      }
    } 
  }



  if (isValid) {
    if (departure_from_list == true && destination_from_list == true && placesData.length > 0){
      toTarif = true;
    }

    let info = gatherFormData();
    let inputs_data = new FormData();
    inputs_data.append('data', JSON.stringify(info));
    fetch('/get_inputs', {
      method: 'POST',
      body: inputs_data
  })
    if (toTarif){
      let urlParams = new URLSearchParams(window.location.search);
      let userId = urlParams.get('user_id');  
      let formData = new FormData();
      formData.append('userId', userId);
      
      let data = {
        "lang": "rus",
        "from_location": {
            "code": parseInt(selectedDepartureCityNumber, 10),
        },
        "to_location": {
            "code": parseInt(selectedDestinationCityNumber, 10)
        },
        "packages": []
      };
      
      
      placesData.forEach(packageData => {
        data.packages.push({
          "height": packageData.height,
          "length": packageData.length,
          "weight": packageData.weight,
          "width": packageData.width,
        });
      });
      
      formData.append('data', JSON.stringify(data));

      fetch('/get_data', {
        method: 'POST',
        body: formData
    }).then(() => {
      // window.location.href = '/tarifs';
      console.log('Тарифы');
    })
    } else{ 
      // window.location.href = '/additional';
      console.log('Доп');

    }
  } else {
    document.getElementById('status').innerText = 'Заполните все поля корректно';
  }
}


function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function applyErrorStyle(element) {
  element.style.borderColor = "red";
}

function removeErrorStyle(element) {
  element.style.borderColor = "";
}



function gatherFormData() {
  let formData = {
    template_name: document.getElementById('template_name').value,
    role: document.getElementById('combobox_value').value,
    paymentCheckbox: document.getElementById('paymentCheckbox').checked,
    departure_city: document.getElementById('departure_city').value,
    destination_city: document.getElementById('destination_city').value,
    places: []
  };

  let i = 1;

while (true) {
    let placeId = `place${i}`;
    let placeElement = document.getElementById(placeId);

    if (!placeElement) {
        break;
    }

    let placeData = {
        [`box_weight${i}`]: document.getElementById(`box_weight${i}`).value,
        [`box_length${i}`]: document.getElementById(`box_length${i}`).value,
        [`box_width${i}`]: document.getElementById(`box_width${i}`).value,
        [`box_height${i}`]: document.getElementById(`box_height${i}`).value,
        [`desc${i}`]: document.getElementById(`desc${i}`).value
    };

    formData.places.push(placeData);
    i++;
}


  return formData;
}

//////////////////////////////////////////////////////////////


let popular_cities = [];
let filterTimeout;
let lastInputValue = '';
let selectedDepartureCityNumber;
let selectedDestinationCityNumber;

function handleInput(inputElement, list, input_value, otherList) {
  clearTimeout(filterTimeout);

  const trimmedInputValue = input_value.trim();

  if (trimmedInputValue.length < 2) {
      list.style.display = 'none';
      return;
  }

  filterTimeout = setTimeout(async () => {
      const response = await fetch(`/search_cities?query=${encodeURIComponent(trimmedInputValue)}`);
      const result = await response.json();
      if (inputElement.value !== lastInputValue) {
          return;
      }
      const filtered_cities = result.data;
      dropdownList(list, filtered_cities, [], trimmedInputValue, inputElement, otherList);
      if (trimmedInputValue !== '') {
          inputElement === departureInput ? departure_from_list = false : destination_from_list = false;
      }
  }, 300);

  lastInputValue = inputElement.value;
}

function displayAllItems(list, display_items, input_value, inputElement) {
  list.innerHTML = '';
  const inputLower = input_value.toLowerCase();
  display_items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      const index = item.lastIndexOf(",");
      const cityText = index !== -1 ? item.substring(0, index) : item;
      const cityNumber = index !== -1 ? item.substring(index + 1) : '';
      const matchIndex = cityText.toLowerCase().indexOf(inputLower);
      if (matchIndex !== -1) {
          const before = document.createTextNode(cityText.substring(0, matchIndex));
          const match = document.createElement('span');
          match.style.fontWeight = 'bold';
          match.textContent = cityText.substring(matchIndex, matchIndex + inputLower.length);
          const after = document.createTextNode(cityText.substring(matchIndex + inputLower.length));

          li.appendChild(before);
          li.appendChild(match);
          li.appendChild(after);
      } else {
          li.textContent = cityText;
      }
      li.addEventListener('click', function () {
        inputElement.value = cityText.trim();
        list.style.display = 'none';
        if (list === departureCityList) {
            departure_from_list = true;
            selectedDepartureCityNumber = cityNumber.trim();
        } else if (list === destinationCityList) {
            destination_from_list = true;
            selectedDestinationCityNumber = cityNumber.trim();
        }
    });
      list.appendChild(li);
      li.classList.add('fade-in');
      li.addEventListener('animationend', () => {
          list.style.display = 'block';
      });
  });
}


function dropdownList(list, filtered_cities, filtered_regions, input_value, inputElement, otherList) {

    let itemsToDisplay = [];
    if (input_value !== '') {
        if (filtered_cities.length > 0) {
            itemsToDisplay = filtered_cities;
        } else if (filtered_regions.length > 0) {
            itemsToDisplay = filtered_regions;
        }
    }
    list.style.display = itemsToDisplay.length > 0 ? 'block' : 'none';
    if (itemsToDisplay.length > 0) {
        displayAllItems(list, itemsToDisplay, input_value, inputElement);
    }
    if (otherList) {
        otherList.style.display = 'none';
    }
}

const departureInput = document.getElementById('departure_city');
const targetInput = document.getElementById('destination_city');
const departureCityList = document.getElementById('departure_city-list');
const destinationCityList = document.getElementById('destination_city-list');

function handleInputChange(inputElement, list, otherList) {
  const trimmedInputValue = inputElement.value.trim();
  handleInput(inputElement, list, trimmedInputValue, otherList);
}

function setupEventListeners() {
    departureInput.addEventListener('input', () => handleInputChange(departureInput, departureCityList, destinationCityList));
    targetInput.addEventListener('input', () => handleInputChange(targetInput, destinationCityList, departureCityList));

    document.addEventListener('click', event => {
        if (event.target !== departureInput && event.target !== targetInput) {
            departureCityList.style.display = 'none';
            destinationCityList.style.display = 'none';
        }
    });

    departureInput.addEventListener('blur', () => clearTimeout(filterTimeout));
    targetInput.addEventListener('blur', () => clearTimeout(filterTimeout));
}

async function init() {
    setupEventListeners();
}

window.onload = init;

function scrollToTop() {
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
}


window .TelegramWebviewProxy .postEvent('web_app_setup_closing_behavior', JSON.stringify({ need_confirmation: true }));
///////////////////////////

