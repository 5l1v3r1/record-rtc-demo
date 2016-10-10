$(document).ready(function () {
    // Define all records
    const MAX_RECORDS = 3;
    const audio_1 = document.getElementById('audio-1');
    const audio_2 = document.getElementById('audio-2');
    const audio_3 = document.getElementById('audio-3');

    // Set first record as current
    let currentAudio = 1;
    $('.current-audio-number').text(currentAudio);

    // Require access to user's microphone
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then((mediaStream) => {
        // Define record stream
        const recordRTC = RecordRTC(mediaStream, {
            type: 'audio'
        });

        // Show first record
        $('#audio-1').attr('controls', true);

        // Show recording options when
        // user has completely heard a record
        audio_1.onended = audio_2.onended = audio_3.onended = () => {
            $('#recording-options').removeClass('hidden');
        };

        // Start recording on button click
        $('#start-recording').on('click', () => {
            recordRTC.startRecording();
            $('#start-recording').addClass('frozen');
            $('#stop-recording').removeClass('frozen');
            $('#recording-label').removeClass('hidden');
        });

        // Stop recording on button click
        // and save recorded thing on server
        $('#stop-recording').on('click', () => {
            $('#stop-recording').addClass('frozen');
            $('#recording-label').addClass('hidden');
            recordRTC.stopRecording(() => {
                // Prepare form data
                let filename = 'audio' + currentAudio + '.wav';
                let blob = recordRTC.getBlob();
                let formData = buildFormData(filename, blob);

                saveFileToServer(formData).then(() => {
                    // Hide current record and recording options
                    // also freeze "start recording" button
                    $('#audio-' + currentAudio).removeAttr('controls');
                    $('#recording-options').addClass('hidden');
                    $('#start-recording').removeClass('frozen');

                    // Show next record and increment current audio index
                    if (currentAudio < MAX_RECORDS) {
                        currentAudio++;
                        $('#audio-' + currentAudio).attr('controls', true);
                        $('.current-audio-number').text(currentAudio);
                    }
                    else {
                        $('#current-audio-label').text('No more records. Thanks.');
                    }
                });
            });
        });
    });
});

/**
 * Create new form data object which
 * contains audio's filename and blob
 *
 * @param fileName
 * @param blob
 * @returns {FormData}
 */
function buildFormData(fileName, blob) {
    let formData = new FormData();
    formData.append('audio-filename', fileName);
    formData.append('audio-blob', blob);

    return formData;
}

/**
 * Send form's data to server
 *
 * @param formData contains audio's filename and blob
 * @returns {Promise}
 */
function saveFileToServer(formData) {
    return new Promise((resolve) => {
        $.ajax({
            type: 'POST',
            url: 'save.php',
            data: formData,
            processData: false,
            contentType: false
        }).done(() => {
            resolve();
        });
    });
}