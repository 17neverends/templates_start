const status_text = document.getElementById('status');


let recipientPlaceCounter = 2;
let senderPlaceCounter = 2;

function addNumber(role) {
  let placeCounter;

  if (role === 'recipient') {
    placeCounter = recipientPlaceCounter;
    recipientPlaceCounter++;
  } else {
    placeCounter = senderPlaceCounter;
    senderPlaceCounter++;
  } 

  const newPlace = document.createElement('div');
  newPlace.classList.add(`${role}_numbers`);
  newPlace.id = `${role}_numbers${placeCounter}`;

  newPlace.innerHTML = `
  <div class="numbers-flex"> 
    <div style="margin-right: 20px;"> 
      <label>Номер</label>
      <input type="text" class="${role}_mobile" id="${role}_mobile${placeCounter}" name="${role}_mobile${placeCounter}" placeholder="Введите номер">
    </div>

    <div>
      <label>Добавочный</label>
      <input type="text" class="${role}_addit" id="${role}_addit${placeCounter}" name="${role}_addit${placeCounter}" placeholder="Введите номер">
    </div>
  </div>
  <button class="created" id="for_delete" type="button" onclick="removePlace('${role}', '${role}_numbers${placeCounter}')">Удалить</button>
`;
  document.getElementById(`${role}_numbers-container`).appendChild(newPlace);
}

function removePlace(role, placeId) {
  const placeToRemove = document.getElementById(placeId);
  placeToRemove.remove();

  let placeCounters;
  if (role === 'recipient') {
    placeCounters = recipientPlaceCounter;
    recipientPlaceCounter--;
  } else {
    placeCounters = senderPlaceCounter;
    senderPlaceCounter--;
  } 

  const places = document.getElementsByClassName(`${role}_numbers`);
  for (let i = 0; i < places.length; i++) {
    const currentNumber = places[i];
    const newPlaceCounter = i + 1;

    currentNumber.id = `${role}_numbers${newPlaceCounter}`;

    currentNumber.querySelectorAll(`[id^='${role}_mobile'], [id^='${role}_addit']`).forEach(element => {
      const currentElementId = element.id;
      element.id = currentElementId.replace(/\d+$/, newPlaceCounter);
    });

    const deleteButton = currentNumber.querySelector('button');
    if (deleteButton) {
      deleteButton.setAttribute('onclick', `removePlace('${role}', '${role}_numbers${newPlaceCounter}')`);
    }
  }
}
document.addEventListener('click', function(event) {
  if (event.target && event.target.matches('button[id^="delete"]')) {
      const buttonId = event.target.id;
      const placeId = buttonId.replace('delete', 'place');
      removePlace(placeId);
  }
});

function check_inputs() {
  const recipientNumbers = document.getElementsByClassName('recipient_numbers');
  const senderNumbers = document.getElementsByClassName('sender_numbers');
  let isValid = true;

  function validateInput(input, validationFunction) {
      return input.trim() !== '' && !validationFunction(input);
  }

  function processInputs(inputs, prefix) {
      for (let i = 0; i < inputs.length; i++) {
          const currentNumber = inputs[i];
          const mobile = currentNumber.querySelector(`#${prefix}_mobile${i + 1}`);
          const addit = currentNumber.querySelector(`#${prefix}_addit${i + 1}`);

          removeErrorStyle(mobile);
          removeErrorStyle(addit);

          let mobileValid = validateInput(mobile.value, isValidMobileNumber);
          let additValid = validateInput(addit.value, isValidAddit);

          if (mobileValid || additValid) {
              isValid = false;

              if (mobileValid) {
                  applyErrorStyle(mobile);
              }

              if (additValid) {
                  applyErrorStyle(addit);
              }
          }
      }
  }

  processInputs(recipientNumbers, 'recipient', isValidMobileNumber);
  processInputs(senderNumbers, 'sender', isValidMobileNumber);







  if (isValid) {
    let info = gatherFormData();
    let inputs_data = new FormData();
    inputs_data.append('data', JSON.stringify(info));
    fetch('/get_inputs', {
      method: 'POST',
      body: inputs_data
  })
  document.getElementById('status').innerText = 'Успешно';

  } else {
    document.getElementById('status').innerText = 'Заполните все поля корректно';
  }
}


function isValidMobileNumber(number) {
  const pattern = /^(\+7|8)[\s\d\(\)\-]{9}\d$/;
  return pattern.test(number);
}


function isValidAddit(value) {
    return /^[0-9#*]+$/.test(value);
}

function applyErrorStyle(element) {
  element.style.borderColor = "red";
}

function removeErrorStyle(element) {
  element.style.borderColor = "";
}





function gatherFormData() {
  let formData = {
    recipient: {
      company: document.getElementById('recipient_company').value,
      fullname: document.getElementById('recipient_fullname').value,
      numbers: []
    },
    sender: {
      company: document.getElementById('sender_company').value,
      fullname: document.getElementById('sender_fullname').value,
      numbers: []
    }
  };

  function push_numbers(role) {
    let i = 1;
    while (true) {
      let mobileId = `${role}_mobile${i}`;
      let additId = `${role}_addit${i}`;
  
      let mobileElement = document.getElementById(mobileId);
      let additElement = document.getElementById(additId);
  
      if (!mobileElement && !additElement) {
        break;
      }
  
      let formattedMobile = (mobileElement.value || '').replace(/[^\d]/g, '');
  
      let placeData = {
        [`${role}_mobile${i}`]: formattedMobile !== '' ? `+7${formattedMobile.substring(1)}` : '',
        [`${role}_addit${i}`]: additElement.value || '',
      };
  
      formData[role].numbers.push(placeData);
  
      i++;
    }
  }
  
  
  
  
  

  push_numbers('recipient');
  push_numbers('sender');

  return formData;
}




document.addEventListener('input', function(event) {
  const targetClassList = event.target.classList;

  if (targetClassList.contains('recipient_mobile')) {
    handleMobileInput(event, 'recipient');
  } else if (targetClassList.contains('sender_mobile')) {
    handleMobileInput(event, 'sender');
  }
});

function handleMobileInput(event) {
  let inputValue = event.target.value;

  if (inputValue.length === 1 && (inputValue === '7' || inputValue === '8')) {
    event.target.value = '+7';
  } else if (inputValue.length === 0) {
    event.target.value = '';
  }
}

window .TelegramWebviewProxy .postEvent('web_app_setup_closing_behavior', JSON.stringify({ need_confirmation: true }));