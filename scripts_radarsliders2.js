document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('downloadChart').addEventListener('click', downloadChart);
    document.getElementById('savePlayer').addEventListener('click', savePlayerData);
    document.getElementById('playerList').addEventListener('change', loadPlayerData);

    const ctx = document.getElementById('radarChart').getContext('2d');
    const data = {
        labels: ['Fitness', 'Skills', 'Agility', 'Speed', 'Maturity', 'Intelligence', 'Coachable', 'D Position', 'Tackling'],
        datasets: [{
            label: 'Player Evaluation',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            fill: true,
            backgroundColor: 'rgba(51, 51, 51, 0.2)',
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
            elements: { line: { borderWidth: 3 } },
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: { display: false }
                }
            }
        }
    };

    const radarChart = new Chart(ctx, config);

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
        const sliderIds = ['fitness', 'skills', 'agility', 'speed', 'maturity', 'intelligence', 'coachable', 'dPosition', 'tackling'];
        sliderIds.forEach((id, index) => {
            document.getElementById(id).value = scores[index];
            document.getElementById(id + 'Value').textContent = scores[index];
        });
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

    function showFeedbackMessage(message) {
        const feedbackMessage = document.getElementById('feedbackMessage');
        feedbackMessage.textContent = message;
        setTimeout(() => feedbackMessage.textContent = '', 3000);
    }

    function sendDataToMakeWebhook(data) {
        fetch('https://hook.us2.make.com/295f6brvn2a3vev3q5uplecoxm4a2ijv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(response => response.ok ? response.json() : response.text())
        .catch(error => console.error('Error:', error));
    }

    function downloadChart() {
        const playerName = document.getElementById('playerName').value.trim();
        const evaluationDate = document.getElementById('evaluationDate').value || 'MM/DD/YYYY';
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
        pdf.setFillColor(51, 51, 51);
        pdf.rect(0, 0, pdf.internal.pageSize.width, 60, 'F');
        pdf.setTextColor(200, 165, 99);
        pdf.setFont('Times', 'bold');
        pdf.setFontSize(24);
        const playerTitle = `${evaluationDate} - ${playerName}`;
        pdf.text(playerTitle, pdf.internal.pageSize.width / 2, 40, { align: 'center' });

        html2canvas(rightSection).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 40, 120, 500, 500);

            const sliderLabels = ['Fitness', 'Skills', 'Agility', 'Speed', 'Maturity', 'Intelligence', 'Coachable', 'D Position', 'Tackling'];
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
            pdf.setTextColor(0, 0, 0);
            let sliderYPosition = 650;
            for (let i = 0; i < sliderLabels.length; i++) {
                pdf.text(`${sliderLabels[i]}: ${sliderValues[i]}`, 40, sliderYPosition);
                sliderYPosition += 15;
            }

            const commentsText = document.getElementById('comments').value;
            const commentsX = 300;
            const commentsY = 650;

            pdf.setDrawColor(0);
            pdf.rect(commentsX, commentsY - 10, 200, 100);
            pdf.text('Comments:', commentsX + 10, commentsY);
            pdf.setFont('Times', 'italic');
            pdf.text(commentsText, commentsX + 10, commentsY + 20);

            pdf.setFont('Times', 'italic');
            pdf.setFontSize(10);
            pdf.text('Powered by Give it a Try', 40, pdf.internal.pageSize.height - 40);

            pdf.save(`${playerTitle}-evaluation.pdf`);
        });
    }

    loadPlayerList();
});
