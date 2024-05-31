document.addEventListener('DOMContentLoaded', function() {
    let sessionId = null; // Global variable to store the session ID
    let selectedService = null; // Global variable to store the selected service

    const questionsOilProduction = [
        "What was the oil production amount in the UAE in 2002?",
        "What was the oil consumption in the UAE in 2002?",
        "What were the oil imports to the UAE in 2018?",
        "What were the oil exports from the UAE in 2002?",
        "What was the population total in the UAE in 2019?",
        "What was the immigration rate in the UAE in 2002?",
        "What was the GDP per capita in the UAE in 2002?",
        "What was the gross CO2 production in the UAE in 2017?",
        "How many crude oil rigs were there in the UAE in 2004?",
        "What was the CO2 emitted per year from oil extractions in the UAE in 2004?",
        "What was the CO2 emitted per year from oil extractions around the world in 2003?",
        "What was the yearly energy generation in the UAE in 2018?",
        "What was the average energy consumption per capita in the UAE in 2003?",
        "What was the annual change in primary energy consumption in the UAE in 2019?",
        "What were the oil reserves in the UAE in 2002?",
        "What is the predicted oil production in the UAE in 2030?"
    ];

    const questionsNews = [
        "What are the latest oil production statistics?",
        "What's the latest news on UAE oil production?",
        "Can you provide the recent trends in oil prices?",
        "What are the factors affecting oil production in the UAE recently?",
        "Give me a summary of the latest oil market reports.",
        "What are the predictions for future oil production in the UAE?"
    ];

    const unitsMap = {
        "oil production": "thousand barrels per day",
        "oil consumption": "terawatt-hours (TWh)",
        "imports": "barrels per day",
        "exports": "million barrels per day",
        "population": "number of people",
        "immigration": "number of people",
        "GDP per capita": "$",
        "CO2 production": "tonnes",
        "oil rigs": "",
        "CO2 emitted per year from oil extractions around the world": "tonnes",
        "CO2 emitted per year from oil extractions in the UAE": "tonnes",
        "yearly energy generation": "terawatt-hours (TWh)",
        "average energy consumption per capita": "kilowatt-hours (kWh)",
        "annual change in primary energy consumption": "%",
        "oil reserves": "billion tonnes"
    };

    function createChatSession() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("apikey", "pZ1FjP5i9u5xmmH8BLwdEcSJ7tpBANuG");

        const raw = JSON.stringify({
            "pluginIds": [],
            "externalUserId": "1234"
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        return fetch("https://gateway-dev.on-demand.io/chat/v1/sessions", requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then((result) => {
                console.log('Chat Session Created:', result); // Log the response
                sessionId = result.chatSession.id; // Store the session ID
                console.log('Session ID:', sessionId); // Log the session ID
            })
            .catch((error) => {
                console.error('Error creating chat session:', error); // Log the error
            });
    }

    function updateAutocompleteSuggestions(input) {
        const suggestionsContainer = document.querySelector('.autocomplete-suggestions');
        suggestionsContainer.innerHTML = ''; // Clear existing suggestions

        if (!input) return;

        let filteredQuestions = [];
        if (selectedService === 'oil-production-predictor') {
            filteredQuestions = questionsOilProduction.filter(question =>
                question.toLowerCase().includes(input.toLowerCase())
            );
        } else if (selectedService === 'uae-information-query') {
            filteredQuestions = questionsNews.filter(question =>
                question.toLowerCase().includes(input.toLowerCase())
            );
        }

        filteredQuestions.forEach(question => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.classList.add('autocomplete-suggestion');
            suggestionDiv.textContent = question;
            suggestionDiv.addEventListener('click', () => {
                document.querySelector('.chat-input').value = question;
                suggestionsContainer.innerHTML = ''; // Clear suggestions after selecting
            });
            suggestionsContainer.appendChild(suggestionDiv);
        });
    }

    function sendMessage() {
        const userInput = document.querySelector('.chat-input').value;

        if (!userInput) {
            alert('Please enter a message.');
            return;
        }

        const messageDisplay = document.querySelector('.message-display');
        const userMessageDiv = document.createElement('div');
        const botReplyDiv = document.createElement('div');

        userMessageDiv.classList.add('user-message');
        botReplyDiv.classList.add('bot-reply');

        userMessageDiv.textContent = userInput;
        messageDisplay.appendChild(userMessageDiv);

        document.querySelector('.chat-input').value = '';

        const messageContainer = document.querySelector('.message-container');
        messageContainer.scrollTop = messageContainer.scrollHeight;

        if (!sessionId) {
            console.error('Session ID is not available.');
            botReplyDiv.textContent = 'Sorry, there was an error processing your request.';
            messageDisplay.appendChild(botReplyDiv);
            return;
        }

        let pluginIds = [];
        if (selectedService === 'oil-production-predictor') {
            pluginIds = ["plugin-1716030024"];
        } else if (selectedService === 'uae-information-query') {
            pluginIds = ["plugin-1713924030"];
        }

        const myHeaders = new Headers();
        myHeaders.append("apikey", "pZ1FjP5i9u5xmmH8BLwdEcSJ7tpBANuG");
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "endpointId": "predefined-openai-gpt4o",
            "query": userInput,
            "pluginIds": pluginIds,
            "responseMode": "sync"
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`https://gateway-dev.on-demand.io/chat/v1/sessions/${sessionId}/query`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                console.log('Query Response:', data); // Log the full response

                const botMessage = data.chatMessage && data.chatMessage.answer;

                if (!botMessage) {
                    throw new Error('No response message received from the API');
                }

                const queryFactor = Object.keys(unitsMap).find(factor =>
                    userInput.toLowerCase().includes(factor.toLowerCase())
                );


                if (selectedService === 'oil-production-predictor') {
                    const units = unitsMap[queryFactor] || '';
                    botReplyDiv.textContent = botMessage + (units ? ` (${units})` : '');

                } else if (selectedService === 'uae-information-query') {
                    botReplyDiv.textContent = botMessage;
                }


                messageDisplay.appendChild(botReplyDiv);
                messageContainer.scrollTop = messageContainer.scrollHeight;
            })
            .catch(error => {
                console.error('Error:', error);
                botReplyDiv.textContent = 'Sorry, there was an error processing your request.';
                messageDisplay.appendChild(botReplyDiv);
                messageContainer.scrollTop = messageContainer.scrollHeight;
            });
    }

    createChatSession().then(() => {
        const sendButton = document.querySelector('.send-button');
        const chatInput = document.querySelector('.chat-input');

        sendButton.addEventListener('click', sendMessage);

        chatInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });

        document.querySelector('.reset-button').addEventListener('click', function() {
            const messageDisplay = document.querySelector('.message-display');
            messageDisplay.innerHTML = '';
            createChatSession();
        });

        chatInput.addEventListener('input', function(event) {
            updateAutocompleteSuggestions(event.target.value);
        });

        document.getElementById('oil-production-predictor').addEventListener('click', function() {
            selectedService = 'oil-production-predictor';
            document.querySelector('.enter-prompt').innerHTML = 'Oil Production Predictor<br>Enter a prompt..';
            document.querySelector('.service-selection').style.display = 'none';
            document.querySelector('.message-container').style.display = 'block';
            document.querySelector('.chat-box').style.display = 'flex';
        });

        document.getElementById('uae-information-query').addEventListener('click', function() {
            selectedService = 'uae-information-query';
            document.querySelector('.enter-prompt').innerHTML = 'Oil News & Stats<br>Enter a prompt..';
            document.querySelector('.service-selection').style.display = 'none';
            document.querySelector('.message-container').style.display = 'block';
            document.querySelector('.chat-box').style.display = 'flex';
        });

        document.querySelector('.back-button').addEventListener('click', function() {
            document.querySelector('.service-selection').style.display = 'flex';
            document.querySelector('.message-container').style.display = 'none';
            document.querySelector('.chat-box').style.display = 'none';
            document.querySelector('.enter-prompt').textContent = 'How can Oryx help you today?';
            const messageDisplay = document.querySelector('.message-display');
            messageDisplay.innerHTML = '';
            createChatSession();
        });
    }).catch(error => {
        console.error('Error during session creation:', error);
    });
});
