document.addEventListener("DOMContentLoaded", function () {
    // Initialize event listeners
    document.getElementById('downloadChart').addEventListener('click', downloadChart);
    document.getElementById('savePlayer').addEventListener('click', savePlayerData);
    document.getElementById('playerList').addEventListener('change', loadPlayerData);

    // Radar chart initialization
    const ctx = document.getElementById('radarChart').getContext('2d');
    const data = {
        labels: ['Fitness', 'Skills', 'Agility', 'Speed', 'Maturity', 'Intelligence', 'Coachable', 'D Position', 'Tackling'],
        datasets: [{
            label: 'Player Evaluation',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],  // Initial empty values
            fill: true,
            backgroundColor: 'rgba(51, 51, 51, 0.2)',  // Slightly transparent
            borderColor: '#C8A563',
            pointBackgroundColor: '#C8A563',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#C8A563'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            elements: {
                line: { borderWidth: 3 }
            },
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: { display: false }  // No numerical axis values displayed
                }
            }
        }
    };

    const radarChart = new Chart(ctx, config);

    // Update chart based on slider input values
    function updateChart() {
        const scores = [
            parseInt(document.getElementById('fitness').value) || 0,
            parseInt(document.getElementById('skills').value) || 0,
            parseInt(document.getElementById('agility').value) || 0,
            parseInt(document.getElementById('speed').value) || 0,
            parseInt(document.getElementById('maturity').value) || 0,
            parseInt(document.getElementById('intelligence').value) || 0,
            parseInt(document.getElementById('coachable').value) || 0,
            parseInt(document.getElementById('dPosition').value) || 0,
            parseInt(document.getElementById('tackling').value) || 0
        ];

        radarChart.data.datasets[0].data = scores;
        radarChart.update();
    }

    document.querySelectorAll('.score-slider').forEach(slider => {
        slider.addEventListener('input', () => {
            updateChart();
            document.getElementById(slider.id + 'Value').textContent = slider.value;
        });
    });

    // Save player data to localStorage
    function savePlayerData() {
        const playerName = document.getElementById('playerName').value;
        const evaluationDate = document.getElementById('evaluationDate').value;

        if (!playerName || !evaluationDate) {
            alert('Please enter a player name and select a date');
            return;
        }

        const scores = radarChart.data.datasets[0].data;
        const players = JSON.parse(localStorage.getItem('players')) || {};
        players[playerName] = { scores, evaluationDate };

        localStorage.setItem('players', JSON.stringify(players));
        loadPlayerList();
        showFeedbackMessage('Player data saved successfully.');
    }

    // Load player data from localStorage
    function loadPlayerData() {
        const playerName = document.getElementById('playerList').value;
        if (!playerName) {
            alert('Please select a player');
            return;
        }

        const players = JSON.parse(localStorage.getItem('players')) || {};
        if (players[playerName]) {
            radarChart.data.datasets[0].data = players[playerName].scores;
            radarChart.update();
            setSliderValues(players[playerName].scores);
            document.getElementById('evaluationDate').value = players[playerName].evaluationDate;
            showFeedbackMessage('Player data loaded successfully.');
        }
    }

    function setSliderValues(scores) {
        document.getElementById('fitness').value = scores[0];
        document.getElementById('fitnessValue').textContent = scores[0];
        document.getElementById('skills').value = scores[1];
        document.getElementById('skillsValue').textContent = scores[1];
        document.getElementById('agility').value = scores[2];
        document.getElementById('agilityValue').textContent = scores[2];
        document.getElementById('speed').value = scores[3];
        document.getElementById('speedValue').textContent = scores[3];
        document.getElementById('maturity').value = scores[4];
        document.getElementById('maturityValue').textContent = scores[4];
        document.getElementById('intelligence').value = scores[5];
        document.getElementById('intelligenceValue').textContent = scores[5];
        document.getElementById('coachable').value = scores[6];
        document.getElementById('coachableValue').textContent = scores[6];
        document.getElementById('dPosition').value = scores[7];
        document.getElementById('dPositionValue').textContent = scores[7];
        document.getElementById('tackling').value = scores[8];
        document.getElementById('tacklingValue').textContent = scores[8];
    }

    function loadPlayerList() {
        const players = JSON.parse(localStorage.getItem('players')) || {};
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '<option value="">Select a Player</option>';

        Object.keys(players).forEach(playerName => {
            const option = document.createElement('option');
            option.value = playerName;
            option.textContent = `${players[playerName].evaluationDate} - ${playerName}`;
            playerList.appendChild(option);
        });
    }

    // Display feedback message
    function showFeedbackMessage(message) {
        const feedbackMessage = document.getElementById('feedbackMessage');
        feedbackMessage.textContent = message;
        setTimeout(() => {
            feedbackMessage.textContent = '';
        }, 3000);
    }

    // Send data to the Make.com webhook
    function sendDataToMakeWebhook(data) {
        fetch('https://hook.us2.make.com/295f6brvn2a3vev3q5uplecoxm4a2ijv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                return response.text();
            }
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Download chart as PDF
    function downloadChart() {
        const playerName = document.getElementById('playerName').value.trim();
        const evaluationDate = document.getElementById('evaluationDate').value;
        const data = {
            playerName: playerName,
            evaluationDate: evaluationDate,
            fitness: document.getElementById('fitness').value,
            skills: document.getElementById('skills').value,
            agility: document.getElementById('agility').value,
            speed: document.getElementById('speed').value,
            maturity: document.getElementById('maturity').value,
            intelligence: document.getElementById('intelligence').value,
            coachable: document.getElementById('coachable').value,
            dPosition: document.getElementById('dPosition').value,
            tackling: document.getElementById('tackling').value,
            comments: document.getElementById('comments').value
        };

        sendDataToMakeWebhook(data);

        const rightSection = document.querySelector('.right-section');
        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF('p', 'pt', 'a4');
        const playerNameInput = document.getElementById('playerName');
        const commentsTextArea = document.getElementById('comments');
        const downloadButton = document.getElementById('downloadChart');
        const playerListDropdown = document.getElementById('playerList');

        playerNameInput.style.display = 'none';
        commentsTextArea.style.display = 'none';
        downloadButton.style.display = 'none';
        playerListDropdown.style.display = 'none';

        html2canvas(rightSection).then(canvas => {
            const imgData = canvas.toDataURL('image/png');

            playerNameInput.style.display = '';
            commentsTextArea.style.display = '';
            downloadButton.style.display = '';
            playerListDropdown.style.display = '';

            const formattedDate = evaluationDate || 'MM/DD/YYYY';
            const playerTitle = `${formattedDate} ${playerName}`;

            pdf.setFont('Times', 'bold');
            pdf.setFontSize(24);
            pdf.text(playerTitle, pdf.internal.pageSize.width / 2, 40, { align: 'center' });
            pdf.addImage(imgData, 'PNG', 40, 80, 500, 500);

            const sliderLabels = [
                'Fitness', 'Skills', 'Agility', 'Speed',
                'Maturity', 'Intelligence', 'Coachable', 'D Position', 'Tackling'
            ];
            const sliderValues = [
                document.getElementById('fitness').value,
                document.getElementById('skills').value,
                document.getElementById('agility').value,
                document.getElementById('speed').value,
                document.getElementById('maturity').value,
                document.getElementById('intelligence').value,
                document.getElementById('coachable').value,
                document.getElementById('dPosition').value,
                document.getElementById('tackling').value
            ];

            pdf.setFont('Times', 'normal');
            pdf.setFontSize(12);

            let sliderYPosition = 600;
            for (let i = 0; i < sliderLabels.length; i++) {
                pdf.text(`${sliderLabels[i]}: ${sliderValues[i]}`, 40, sliderYPosition);
                sliderYPosition += 15;
            }

            const comments = commentsTextArea.value;
            const commentsX = 40;
            sliderYPosition += 20;

            wrapTextPDF(pdf, comments, commentsX, sliderYPosition, 500, 15);

            // Add footer with logo to PDF
            pdf.setFont('Times', 'italic');
            pdf.setFontSize(10);
            pdf.text('Powered by Give it a Try', 40, pdf.internal.pageSize.height - 40);
            pdf.addImage('https://github.com/GIT-Strategies/Evaluation-Beta/blob/main/GIT%20just%20G%20logo%20white%20background%20(1).png?raw=true', 'PNG', pdf.internal.pageSize.width - 80, pdf.internal.pageSize.height - 60, 40, 40); // Footer logo

            pdf.save(`${playerTitle}-evaluation.pdf`);
        });
    }

    function wrapTextPDF(doc, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        words.forEach((word, index) => {
            const testLine = line + word + ' ';
            const testWidth = doc.getTextWidth(testLine);

            if (testWidth > maxWidth && index > 0) {
                doc.text(x, y, line);
                line = word + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        });

        doc.text(x, y, line);
    }

    loadPlayerList();
});
